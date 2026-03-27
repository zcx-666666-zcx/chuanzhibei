package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.Result;
import com.example.demo.entity.User;
import com.example.demo.entity.UserBooking;
import com.example.demo.security.AuthUtils;
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
        Long currentUserId = AuthUtils.currentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问其他用户预约");
        }
        List<UserBooking> bookings = userBookingService.getUserBookingsByUserId(userId);
        return ResponseEntity.ok(Result.success(bookings));
    }

    @GetMapping("/me")
    public ResponseEntity<Result<List<UserBooking>>> getMyBookings() {
        Long currentUserId = AuthUtils.currentUserId();
        List<UserBooking> bookings = userBookingService.getUserBookingsByUserId(currentUserId);
        return ResponseEntity.ok(Result.success(bookings));
    }

    @PostMapping
    public ResponseEntity<Result<UserBooking>> createBooking(@RequestBody Map<String, Object> bookingData) {
        Long userId = AuthUtils.currentUserId();

        User user = userService.getUserById(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在");
        }

        UserBooking userBooking = new UserBooking();
        userBooking.setUser(user);

        String type = (String) bookingData.get("type");
        if (type == null || type.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "预约类型不能为空");
        }

        userBooking.setType(type);
        userBooking.setStatus((String) bookingData.getOrDefault("status", "pending"));
        userBooking.setTime((String) bookingData.getOrDefault("time", "待确认"));
        userBooking.setLocation((String) bookingData.getOrDefault("location", "待确认"));
        userBooking.setContact((String) bookingData.getOrDefault("contact", "待确认"));

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
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "不支持的预约类型");
        }

        UserBooking savedBooking = userBookingService.saveUserBooking(userBooking);
        return ResponseEntity.ok(Result.success("预约成功", savedBooking));
    }

    @DeleteMapping("/{userId}/booking/{bookingId}")
    public ResponseEntity<Result<String>> deleteBooking(@PathVariable Long userId, @PathVariable Long bookingId) {
        Long currentUserId = AuthUtils.currentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权删除其他用户预约");
        }
        userBookingService.deleteUserBooking(userId, bookingId);
        return ResponseEntity.ok(Result.success("取消预约成功", ""));
    }

    @DeleteMapping("/me/booking/{bookingId}")
    public ResponseEntity<Result<String>> deleteMyBooking(@PathVariable Long bookingId) {
        Long currentUserId = AuthUtils.currentUserId();
        userBookingService.deleteUserBooking(currentUserId, bookingId);
        return ResponseEntity.ok(Result.success("取消预约成功", ""));
    }
}

