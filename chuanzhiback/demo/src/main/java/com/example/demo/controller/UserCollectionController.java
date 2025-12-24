package com.example.demo.controller;

import com.example.demo.entity.UserCollection;
import com.example.demo.service.UserCollectionService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/collections")
@CrossOrigin(origins = "*")
public class UserCollectionController {

    @Autowired
    private UserCollectionService userCollectionService;

    @GetMapping("/{userId}")
    public ResponseEntity<Result<List<UserCollection>>> getUserCollections(@PathVariable Long userId) {
        List<UserCollection> collections = userCollectionService.getUserCollectionsByUserId(userId);
        return ResponseEntity.ok(Result.success(collections));
    }

    @PostMapping
    public ResponseEntity<Result<UserCollection>> createCollection(@RequestBody UserCollection userCollection) {
        UserCollection savedCollection = userCollectionService.saveUserCollection(userCollection);
        return ResponseEntity.ok(Result.success("收藏成功", savedCollection));
    }

    @DeleteMapping("/{userId}/heritage/{heritageId}")
    public ResponseEntity<Result<String>> deleteCollection(@PathVariable Long userId, @PathVariable Long heritageId) {
        userCollectionService.deleteUserCollection(userId, heritageId);
        return ResponseEntity.ok(Result.success("取消收藏成功", ""));
    }
    
    @GetMapping("/{userId}/check/{heritageId}")
    public ResponseEntity<Result<Boolean>> checkCollection(@PathVariable Long userId, @PathVariable Long heritageId) {
        boolean isCollected = userCollectionService.isHeritageCollected(userId, heritageId);
        return ResponseEntity.ok(Result.success(isCollected));
    }
}