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
import com.example.demo.entity.UserCollection;
import com.example.demo.security.AuthUtils;
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
        Long currentUserId = AuthUtils.currentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问其他用户收藏");
        }
        List<UserCollection> collections = userCollectionService.getUserCollectionsByUserId(userId);
        return ResponseEntity.ok(Result.success(collections));
    }

    @GetMapping("/me")
    public ResponseEntity<Result<List<UserCollection>>> getMyCollections() {
        Long currentUserId = AuthUtils.currentUserId();
        List<UserCollection> collections = userCollectionService.getUserCollectionsByUserId(currentUserId);
        return ResponseEntity.ok(Result.success(collections));
    }

    @PostMapping
    public ResponseEntity<Result<UserCollection>> createCollection(@RequestBody Map<String, Object> collectionData) {
        Long userId = AuthUtils.currentUserId();

        User user = userService.getUserById(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在");
        }

        UserCollection userCollection = new UserCollection();
        userCollection.setUser(user);

        Long heritageId = null;
        Object heritageIdObj = collectionData.get("heritageId");
        if (heritageIdObj instanceof Number) {
            heritageId = ((Number) heritageIdObj).longValue();
        } else if (heritageIdObj instanceof String) {
            heritageId = Long.parseLong((String) heritageIdObj);
        }

        if (heritageId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "非遗项目ID不能为空");
        }

        userCollection.setHeritageId(heritageId);
        userCollection.setHeritageName((String) collectionData.get("heritageName"));
        userCollection.setHeritageDescription((String) collectionData.get("heritageDescription"));
        userCollection.setHeritageLevel((String) collectionData.get("heritageLevel"));
        userCollection.setImageUrl((String) collectionData.get("imageUrl"));

        boolean isCollected = userCollectionService.isHeritageCollected(userId, heritageId);
        if (isCollected) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "已经收藏过了");
        }

        UserCollection savedCollection = userCollectionService.saveUserCollection(userCollection);
        return ResponseEntity.ok(Result.success("收藏成功", savedCollection));
    }

    @DeleteMapping("/{userId}/heritage/{heritageId}")
    public ResponseEntity<Result<String>> deleteCollection(@PathVariable Long userId, @PathVariable Long heritageId) {
        Long currentUserId = AuthUtils.currentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权删除其他用户收藏");
        }
        userCollectionService.deleteUserCollection(userId, heritageId);
        return ResponseEntity.ok(Result.success("取消收藏成功", ""));
    }

    @DeleteMapping("/me/heritage/{heritageId}")
    public ResponseEntity<Result<String>> deleteMyCollection(@PathVariable Long heritageId) {
        Long currentUserId = AuthUtils.currentUserId();
        userCollectionService.deleteUserCollection(currentUserId, heritageId);
        return ResponseEntity.ok(Result.success("取消收藏成功", ""));
    }
    
    @GetMapping("/{userId}/check/{heritageId}")
    public ResponseEntity<Result<Boolean>> checkCollection(@PathVariable Long userId, @PathVariable Long heritageId) {
        Long currentUserId = AuthUtils.currentUserId();
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权检查其他用户收藏");
        }
        boolean isCollected = userCollectionService.isHeritageCollected(userId, heritageId);
        return ResponseEntity.ok(Result.success(isCollected));
    }

    @GetMapping("/me/check/{heritageId}")
    public ResponseEntity<Result<Boolean>> checkMyCollection(@PathVariable Long heritageId) {
        Long currentUserId = AuthUtils.currentUserId();
        boolean isCollected = userCollectionService.isHeritageCollected(currentUserId, heritageId);
        return ResponseEntity.ok(Result.success(isCollected));
    }
}