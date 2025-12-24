package com.example.demo.service;

import com.example.demo.entity.Activity;
import com.example.demo.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }
    
    public List<Activity> getActivitiesByStatus(String status) {
        if (status == null || status.isEmpty()) {
            return getAllActivities();
        }
        return activityRepository.findByStatus(status);
    }
    
    public Activity getActivityById(Long id) {
        return activityRepository.findById(id).orElse(null);
    }
    
    public Activity saveActivity(Activity activity) {
        // 自动更新状态
        activity.setStatus(calculateStatus(activity.getStartTime(), activity.getEndTime()));
        return activityRepository.save(activity);
    }
    
    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }
    
    // 计算活动状态
    private String calculateStatus(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startTime)) {
            return "upcoming";
        } else if (now.isAfter(endTime)) {
            return "ended";
        } else {
            return "ongoing";
        }
    }
    
    @PostConstruct
    public void initData() {
        // 如果数据库为空，初始化一些示例数据
        if (activityRepository.count() == 0) {
            Activity activity1 = new Activity(
                "非遗技艺体验日",
                "邀请多位非遗传承人现场展示技艺，观众可近距离观摩并参与体验",
                LocalDateTime.now().plusDays(5).withHour(10).withMinute(0),
                LocalDateTime.now().plusDays(5).withHour(16).withMinute(0),
                "北京市东城区非遗展示中心",
                50,
                45,
                "upcoming"
            );
            activityRepository.save(activity1);
            
            Activity activity2 = new Activity(
                "传承人讲座系列",
                "邀请国家级传承人分享非遗保护与传承的经验和心得",
                LocalDateTime.now().plusDays(8).withHour(14).withMinute(0),
                LocalDateTime.now().plusDays(8).withHour(16).withMinute(0),
                "线上直播",
                0,
                1200,
                "upcoming"
            );
            activityRepository.save(activity2);
            
            Activity activity3 = new Activity(
                "传统工艺工作坊",
                "学习传统手工艺制作，体验匠人精神",
                LocalDateTime.now().plusDays(12).withHour(9).withMinute(0),
                LocalDateTime.now().plusDays(12).withHour(12).withMinute(0),
                "上海市非遗保护中心",
                30,
                28,
                "upcoming"
            );
            activityRepository.save(activity3);
        }
    }
}
