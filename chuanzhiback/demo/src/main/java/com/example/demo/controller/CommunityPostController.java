package com.example.demo.controller;

import com.example.demo.entity.CommunityPost;
import com.example.demo.service.CommunityPostService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/posts")
@CrossOrigin(origins = "*")
public class CommunityPostController {

    @Autowired
    private CommunityPostService communityPostService;

    @GetMapping
    public ResponseEntity<Result<List<CommunityPost>>> getAllCommunityPosts() {
        List<CommunityPost> posts = communityPostService.getAllCommunityPosts();
        return ResponseEntity.ok(Result.success(posts));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Result<List<CommunityPost>>> getUserPosts(@PathVariable Long userId) {
        List<CommunityPost> posts = communityPostService.getUserPostsByUserId(userId);
        return ResponseEntity.ok(Result.success(posts));
    }

    @PostMapping
    public ResponseEntity<Result<CommunityPost>> createPost(@RequestBody CommunityPost communityPost) {
        CommunityPost savedPost = communityPostService.saveCommunityPost(communityPost);
        return ResponseEntity.ok(Result.success("发布成功", savedPost));
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
    public ResponseEntity<Result<String>> deletePost(@PathVariable Long id) {
        CommunityPost post = communityPostService.getCommunityPostById(id);
        if (post != null) {
            communityPostService.deleteCommunityPost(id);
            return ResponseEntity.ok(Result.success("删除成功", ""));
        } else {
            return ResponseEntity.ok(Result.error("帖子不存在"));
        }
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