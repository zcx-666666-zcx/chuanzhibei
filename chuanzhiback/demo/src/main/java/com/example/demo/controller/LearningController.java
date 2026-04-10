package com.example.demo.controller;

import com.example.demo.common.Result;
import com.example.demo.security.AuthUtils;
import com.example.demo.service.LearningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning")
@CrossOrigin(origins = "*")
public class LearningController {

    @Autowired
    private LearningService learningService;

    @GetMapping("/path")
    public ResponseEntity<Result<List<Map<String, Object>>>> getLearningPath() {
        return ResponseEntity.ok(Result.success(learningService.getLearningPath()));
    }

    @GetMapping("/progress")
    public ResponseEntity<Result<Map<String, Object>>> getMyProgress() {
        Long currentUserId = AuthUtils.currentUserId();
        return ResponseEntity.ok(Result.success(learningService.getUserProgress(currentUserId)));
    }

    @PostMapping("/progress")
    public ResponseEntity<Result<Map<String, Object>>> updateMyProgress(@RequestBody Map<String, Object> payload) {
        Long currentUserId = AuthUtils.currentUserId();
        Object chapterIdObj = payload.get("chapterId");
        if (!(chapterIdObj instanceof String) || ((String) chapterIdObj).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "chapterId 不能为空");
        }
        Object completedObj = payload.get("completed");
        boolean completed = completedObj instanceof Boolean ? (Boolean) completedObj : true;
        Map<String, Object> progress = learningService.updateUserProgress(currentUserId, (String) chapterIdObj, completed);
        return ResponseEntity.ok(Result.success("进度更新成功", progress));
    }
}
