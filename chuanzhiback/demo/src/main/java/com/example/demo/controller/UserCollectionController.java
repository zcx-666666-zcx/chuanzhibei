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
import com.example.demo.entity.UserCollection;
import com.example.demo.service.UserCollectionService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/user/collections")
@CrossOrigin(origins = "*")
public class UserCollectionController {

    @Autowired
    private UserCollectionService userCollectionService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<Result<List<UserCollection>>> getUserCollections(@PathVariable Long userId) {
        try {
            List<UserCollection> collections = userCollectionService.getUserCollectionsByUserId(userId);
            return ResponseEntity.ok(Result.success(collections));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("获取收藏列表失败: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Result<UserCollection>> createCollection(@RequestBody Map<String, Object> collectionData) {
        try {
            // 从请求中获取userId
            Long userId = null;
            Object userIdObj = collectionData.get("userId");
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
            
            // 创建UserCollection对象
            UserCollection userCollection = new UserCollection();
            userCollection.setUser(user);
            
            // 设置heritageId
            Long heritageId = null;
            Object heritageIdObj = collectionData.get("heritageId");
            if (heritageIdObj instanceof Number) {
                heritageId = ((Number) heritageIdObj).longValue();
            } else if (heritageIdObj instanceof String) {
                heritageId = Long.parseLong((String) heritageIdObj);
            }
            
            if (heritageId == null) {
                return ResponseEntity.ok(Result.error("非遗项目ID不能为空"));
            }
            
            userCollection.setHeritageId(heritageId);
            
            // 设置其他字段
            userCollection.setHeritageName((String) collectionData.get("heritageName"));
            userCollection.setHeritageDescription((String) collectionData.get("heritageDescription"));
            userCollection.setHeritageLevel((String) collectionData.get("heritageLevel"));
            userCollection.setImageUrl((String) collectionData.get("imageUrl"));
            
            // 检查是否已收藏
            boolean isCollected = userCollectionService.isHeritageCollected(userId, heritageId);
            if (isCollected) {
                return ResponseEntity.ok(Result.error("已经收藏过了"));
            }
            
            UserCollection savedCollection = userCollectionService.saveUserCollection(userCollection);
            return ResponseEntity.ok(Result.success("收藏成功", savedCollection));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("收藏失败: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/heritage/{heritageId}")
    public ResponseEntity<Result<String>> deleteCollection(@PathVariable Long userId, @PathVariable Long heritageId) {
        try {
            userCollectionService.deleteUserCollection(userId, heritageId);
            return ResponseEntity.ok(Result.success("取消收藏成功", ""));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("取消收藏失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{userId}/check/{heritageId}")
    public ResponseEntity<Result<Boolean>> checkCollection(@PathVariable Long userId, @PathVariable Long heritageId) {
        try {
            boolean isCollected = userCollectionService.isHeritageCollected(userId, heritageId);
            return ResponseEntity.ok(Result.success(isCollected));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("检查收藏状态失败: " + e.getMessage()));
        }
    }
}