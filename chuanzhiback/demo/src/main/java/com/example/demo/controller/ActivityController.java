package com.example.demo.controller;

import com.example.demo.entity.Activity;
import com.example.demo.service.ActivityService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/list")
    public ResponseEntity<Result<List<Map<String, Object>>>> getActivityList(
            @RequestParam(required = false) String status) {
        List<Activity> activities;
        if (status != null && !status.isEmpty()) {
            activities = activityService.getActivitiesByStatus(status);
        } else {
            activities = activityService.getAllActivities();
        }
        
        // 转换为前端需要的格式
        List<Map<String, Object>> activityList = activities.stream().map(activity -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", activity.getId());
            map.put("title", activity.getTitle());
            map.put("description", activity.getDescription());
            map.put("location", activity.getLocation());
            map.put("capacity", activity.getCapacity() != null ? activity.getCapacity() : 0);
            map.put("participants", activity.getParticipants() != null ? activity.getParticipants() : 0);
            map.put("status", activity.getStatus());
            
            // 格式化时间
            if (activity.getStartTime() != null && activity.getEndTime() != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                String timeStr = activity.getStartTime().format(formatter) + "-" + 
                               activity.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                map.put("time", timeStr);
                
                // 提取日期和月份
                map.put("day", String.format("%02d", activity.getStartTime().getDayOfMonth()));
                String[] months = {"一月", "二月", "三月", "四月", "五月", "六月", 
                                  "七月", "八月", "九月", "十月", "十一月", "十二月"};
                map.put("month", months[activity.getStartTime().getMonthValue() - 1]);
            }
            
            // 设置按钮文本
            if (activity.getCapacity() != null && activity.getCapacity() > 0) {
                if (activity.getParticipants() != null && activity.getParticipants() >= activity.getCapacity()) {
                    map.put("buttonText", "已满员");
                } else {
                    map.put("buttonText", "报名参加");
                }
            } else {
                map.put("buttonText", "预约观看");
            }
            
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(Result.success(activityList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result<Activity>> getActivityById(@PathVariable Long id) {
        Activity activity = activityService.getActivityById(id);
        if (activity != null) {
            return ResponseEntity.ok(Result.success(activity));
        } else {
            return ResponseEntity.ok(Result.error("活动不存在"));
        }
    }

    @PostMapping
    public ResponseEntity<Result<Activity>> createActivity(@RequestBody Activity activity) {
        Activity savedActivity = activityService.saveActivity(activity);
        return ResponseEntity.ok(Result.success("活动创建成功", savedActivity));
    }

    @PostMapping("/join")
    public ResponseEntity<Result<String>> joinActivity(@RequestBody Map<String, Long> request) {
        Long activityId = request.get("activityId");
        if (activityId == null) {
            return ResponseEntity.ok(Result.error("活动ID不能为空"));
        }
        
        Activity activity = activityService.getActivityById(activityId);
        if (activity == null) {
            return ResponseEntity.ok(Result.error("活动不存在"));
        }
        
        // 检查是否已满员
        if (activity.getCapacity() != null && activity.getCapacity() > 0) {
            if (activity.getParticipants() != null && activity.getParticipants() >= activity.getCapacity()) {
                return ResponseEntity.ok(Result.error("活动已满员"));
            }
            activity.setParticipants((activity.getParticipants() != null ? activity.getParticipants() : 0) + 1);
            activityService.saveActivity(activity);
        }
        
        return ResponseEntity.ok(Result.success("报名成功"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result<Activity>> updateActivity(@PathVariable Long id, @RequestBody Activity activityDetails) {
        Activity activity = activityService.getActivityById(id);
        if (activity != null) {
            activity.setTitle(activityDetails.getTitle());
            activity.setDescription(activityDetails.getDescription());
            activity.setStartTime(activityDetails.getStartTime());
            activity.setEndTime(activityDetails.getEndTime());
            activity.setLocation(activityDetails.getLocation());
            activity.setCapacity(activityDetails.getCapacity());
            activity.setParticipants(activityDetails.getParticipants());
            activity.setUpdateTime(LocalDateTime.now());
            
            Activity updatedActivity = activityService.saveActivity(activity);
            return ResponseEntity.ok(Result.success("活动更新成功", updatedActivity));
        } else {
            return ResponseEntity.ok(Result.error("活动不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Result<String>> deleteActivity(@PathVariable Long id) {
        Activity activity = activityService.getActivityById(id);
        if (activity != null) {
            activityService.deleteActivity(id);
            return ResponseEntity.ok(Result.success("删除成功", ""));
        } else {
            return ResponseEntity.ok(Result.error("活动不存在"));
        }
    }
}

