package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.Result;
import com.example.demo.entity.User;
import com.example.demo.entity.UserBooking;
import com.example.demo.service.UserBookingService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/user/bookings")
@CrossOrigin(origins = "*")
public class UserBookingController {

    @Autowired
    private UserBookingService userBookingService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<Result<List<UserBooking>>> getUserBookings(@PathVariable Long userId) {
        try {
            List<UserBooking> bookings = userBookingService.getUserBookingsByUserId(userId);
            return ResponseEntity.ok(Result.success(bookings));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("获取预约列表失败: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Result<UserBooking>> createBooking(@RequestBody Map<String, Object> bookingData) {
        try {
            // 从请求中获取userId
            Long userId = null;
            Object userIdObj = bookingData.get("userId");
            if (userIdObj instanceof Number) {
                userId = ((Number) userIdObj).longValue();
            } else if (userIdObj instanceof String) {
                userId = Long.parseLong((String) userIdObj);
            }
            
            if (userId == null) {
                return ResponseEntity.ok(Result.error("用户ID不能为空"));
            }
            
            // 获取User对象
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.ok(Result.error("用户不存在"));
            }
            
            // 创建UserBooking对象
            UserBooking userBooking = new UserBooking();
            userBooking.setUser(user);
            
            // 设置基本字段
            userBooking.setType((String) bookingData.get("type"));
            userBooking.setStatus((String) bookingData.getOrDefault("status", "pending"));
            userBooking.setTime((String) bookingData.getOrDefault("time", "待确认"));
            userBooking.setLocation((String) bookingData.getOrDefault("location", "待确认"));
            userBooking.setContact((String) bookingData.getOrDefault("contact", "待确认"));
            
            // 根据类型设置不同字段
            String type = (String) bookingData.get("type");
            if ("experience".equals(type)) {
                Object masterIdObj = bookingData.get("masterId");
                if (masterIdObj instanceof Number) {
                    userBooking.setMasterId(((Number) masterIdObj).longValue());
                } else if (masterIdObj instanceof String) {
                    userBooking.setMasterId(Long.parseLong((String) masterIdObj));
                }
                userBooking.setMasterName((String) bookingData.get("masterName"));
                userBooking.setSkill((String) bookingData.get("skill"));
                userBooking.setMasterAvatar((String) bookingData.get("masterAvatar"));
            } else if ("activity".equals(type) || "watch".equals(type)) {
                Object activityIdObj = bookingData.get("activityId");
                if (activityIdObj instanceof Number) {
                    userBooking.setActivityId(((Number) activityIdObj).longValue());
                } else if (activityIdObj instanceof String) {
                    userBooking.setActivityId(Long.parseLong((String) activityIdObj));
                }
                userBooking.setActivityTitle((String) bookingData.get("activityTitle"));
            }
            
            UserBooking savedBooking = userBookingService.saveUserBooking(userBooking);
            return ResponseEntity.ok(Result.success("预约成功", savedBooking));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("预约失败: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/booking/{bookingId}")
    public ResponseEntity<Result<String>> deleteBooking(@PathVariable Long userId, @PathVariable Long bookingId) {
        try {
            userBookingService.deleteUserBooking(userId, bookingId);
            return ResponseEntity.ok(Result.success("取消预约成功", ""));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("取消预约失败: " + e.getMessage()));
        }
    }
}

