package com.example.demo.controller;

import com.example.demo.entity.CommunityPost;
import com.example.demo.entity.Inheritor;
import com.example.demo.service.CommunityPostService;
import com.example.demo.service.InheritorService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/inheritor-community")
@CrossOrigin(origins = "*")
public class InheritorCommunityController {

    @Autowired
    private InheritorService inheritorService;
    
    @Autowired
    private CommunityPostService communityPostService;

    // 获取传承人列表（用于传承人社区页面）
    @GetMapping("/inheritors")
    public ResponseEntity<Result<List<Inheritor>>> getInheritorList() {
        List<Inheritor> inheritors = inheritorService.getAllInheritors();
        return ResponseEntity.ok(Result.success(inheritors));
    }

    // 获取社区帖子列表（用于传承人社区页面）
    @GetMapping("/posts")
    public ResponseEntity<Result<List<CommunityPost>>> getCommunityPosts() {
        List<CommunityPost> posts = communityPostService.getAllCommunityPosts();
        return ResponseEntity.ok(Result.success(posts));
    }
    
    // 获取热门传承人（用于传承人社区页面）
    @GetMapping("/popular-inheritors")
    public ResponseEntity<Result<List<Inheritor>>> getPopularInheritors() {
        List<Inheritor> inheritors = inheritorService.getInheritorsByLevel("国家级传承人");
        return ResponseEntity.ok(Result.success(inheritors));
    }
    
    // 获取社区活动（用于传承人社区页面）
    @GetMapping("/activities")
    public ResponseEntity<Result<List<Map<String, Object>>>> getCommunityActivities() {
        // 模拟活动数据
        List<Map<String, Object>> activities = List.of(
            createActivity(1L, "非遗技艺体验日", "2024-06-15 10:00-16:00", 
                          "北京市东城区非遗展示中心", "15", "六月", 
                          "邀请多位非遗传承人现场展示技艺，观众可近距离观摩并参与体验...", 45, 50, "报名参加"),
            createActivity(2L, "传承人讲座系列", "2024-06-18 14:00-16:00", 
                          "线上直播", "18", "六月", 
                          "邀请国家级传承人分享非遗保护与传承的经验和心得...", 1200, 0, "预约观看")
        );
        
        return ResponseEntity.ok(Result.success(activities));
    }
    
    // 点赞社区帖子
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Result<CommunityPost>> likeCommunityPost(@PathVariable Long id) {
        CommunityPost post = communityPostService.getCommunityPostById(id);
        if (post != null) {
            boolean isLiked = !post.getIsLiked();
            post.setIsLiked(isLiked);
            post.setLikesCount(post.getLikesCount() + (isLiked ? 1 : -1));
            CommunityPost updatedPost = communityPostService.saveCommunityPost(post);
            return ResponseEntity.ok(Result.success(isLiked ? "点赞成功" : "取消点赞", updatedPost));
        } else {
            return ResponseEntity.ok(Result.error("帖子不存在"));
        }
    }
    
    // 取消点赞社区帖子
    @DeleteMapping("/posts/{id}/like")
    public ResponseEntity<Result<String>> unlikeCommunityPost(@PathVariable Long id) {
        CommunityPost post = communityPostService.getCommunityPostById(id);
        if (post != null && post.getIsLiked()) {
            post.setIsLiked(false);
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            communityPostService.saveCommunityPost(post);
            return ResponseEntity.ok(Result.success("取消点赞成功"));
        } else {
            return ResponseEntity.ok(Result.error("帖子不存在"));
        }
    }
    
    // 创建活动数据的辅助方法
    private Map<String, Object> createActivity(Long id, String title, String time, String location, 
                                               String day, String month, String description, 
                                               int participants, int capacity, String buttonText) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("id", id);
        activity.put("title", title);
        activity.put("time", time);
        activity.put("location", location);
        activity.put("day", day);
        activity.put("month", month);
        activity.put("description", description);
        activity.put("participants", participants);
        activity.put("capacity", capacity);
        activity.put("buttonText", buttonText);
        return activity;
    }
}