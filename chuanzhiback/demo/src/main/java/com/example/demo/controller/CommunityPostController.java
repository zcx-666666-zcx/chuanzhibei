package com.example.demo.controller;

import com.example.demo.entity.CommunityPost;
import com.example.demo.entity.User;
import com.example.demo.service.CommunityPostService;
import com.example.demo.service.UserService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community/posts")
@CrossOrigin(origins = "*")
public class CommunityPostController {

    @Autowired
    private CommunityPostService communityPostService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Result<List<CommunityPost>>> getAllCommunityPosts() {
        List<CommunityPost> posts = communityPostService.getAllCommunityPosts();
        
        // 更新每个帖子的用户信息为最新
        for (CommunityPost post : posts) {
            if (post.getUserId() != null) {
                User user = userService.getUserById(post.getUserId());
                if (user != null) {
                    // 使用最新的用户信息更新帖子
                    post.setUserName(user.getNickname() != null && !user.getNickname().isEmpty() 
                        ? user.getNickname() 
                        : (user.getUsername() != null ? user.getUsername() : post.getUserName()));
                    post.setUserAvatar(user.getAvatarUrl() != null ? user.getAvatarUrl() : post.getUserAvatar());
                }
            }
        }
        
        return ResponseEntity.ok(Result.success(posts));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Result<List<CommunityPost>>> getUserPosts(@PathVariable Long userId) {
        List<CommunityPost> posts = communityPostService.getUserPostsByUserId(userId);
        
        // 更新每个帖子的用户信息为最新
        User user = userService.getUserById(userId);
        if (user != null) {
            String latestUserName = user.getNickname() != null && !user.getNickname().isEmpty() 
                ? user.getNickname() 
                : (user.getUsername() != null ? user.getUsername() : "用户");
            String latestUserAvatar = user.getAvatarUrl() != null ? user.getAvatarUrl() : "";
            
            for (CommunityPost post : posts) {
                post.setUserName(latestUserName);
                post.setUserAvatar(latestUserAvatar);
            }
        }
        
        return ResponseEntity.ok(Result.success(posts));
    }

    @PostMapping
    public ResponseEntity<Result<CommunityPost>> createPost(@RequestBody Map<String, Object> postData) {
        try {
            // 从请求体中获取userId
            Long userId = null;
            Object userIdObj = postData.get("userId");
            if (userIdObj instanceof Number) {
                userId = ((Number) userIdObj).longValue();
            } else if (userIdObj instanceof String) {
                userId = Long.parseLong((String) userIdObj);
            }
            
            if (userId == null) {
                return ResponseEntity.ok(Result.error("用户ID不能为空"));
            }
            
            // 获取用户对象
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.ok(Result.error("用户不存在"));
            }
            
            // 创建帖子对象
            CommunityPost communityPost = new CommunityPost();
            communityPost.setUser(user);
            communityPost.setUserId(userId);
            communityPost.setUserName((String) postData.getOrDefault("userName", user.getUsername()));
            communityPost.setUserAvatar((String) postData.getOrDefault("userAvatar", user.getAvatarUrl()));
            communityPost.setContent((String) postData.get("content"));
            communityPost.setImageUrls((String) postData.getOrDefault("imageUrls", ""));
            communityPost.setLikesCount(0);
            communityPost.setCommentsCount(0);
            communityPost.setIsLiked(false);
            
            CommunityPost savedPost = communityPostService.saveCommunityPost(communityPost);
            return ResponseEntity.ok(Result.success("发布成功", savedPost));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("发布失败: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result<CommunityPost>> updatePost(@PathVariable Long id, @RequestBody CommunityPost postDetails) {
        CommunityPost post = communityPostService.getCommunityPostById(id);
        if (post != null) {
            post.setUserName(postDetails.getUserName());
            post.setUserAvatar(postDetails.getUserAvatar());
            post.setContent(postDetails.getContent());
            post.setImageUrls(postDetails.getImageUrls());
            post.setUpdateTime(java.time.LocalDateTime.now());
            
            CommunityPost updatedPost = communityPostService.saveCommunityPost(post);
            return ResponseEntity.ok(Result.success("更新成功", updatedPost));
        } else {
            return ResponseEntity.ok(Result.error("帖子不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Result<String>> deletePost(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        CommunityPost post = communityPostService.getCommunityPostById(id);
        if (post == null) {
            return ResponseEntity.ok(Result.error("帖子不存在"));
        }
        
        // 如果提供了userId，检查权限：只能删除自己的帖子
        if (userId != null && post.getUserId() != null && !post.getUserId().equals(userId)) {
            return ResponseEntity.ok(Result.error("无权删除此帖子"));
        }
        
        communityPostService.deleteCommunityPost(id);
        return ResponseEntity.ok(Result.success("删除成功", ""));
    }
    
    @PostMapping("/{id}/like")
    public ResponseEntity<Result<CommunityPost>> toggleLike(@PathVariable Long id) {
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
}