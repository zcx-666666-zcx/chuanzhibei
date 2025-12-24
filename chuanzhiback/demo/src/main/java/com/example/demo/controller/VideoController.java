package com.example.demo.controller;

import com.example.demo.entity.Video;
import com.example.demo.service.VideoService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/video")
@CrossOrigin(origins = "*")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @GetMapping("/list")
    public ResponseEntity<Result<List<Video>>> getVideoList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        List<Video> videos;
        if (category != null && !category.isEmpty()) {
            videos = videoService.getVideosByCategory(category);
        } else {
            videos = videoService.getAllVideos();
        }
        
        // 如果有关键词，进行过滤
        if (keyword != null && !keyword.isEmpty()) {
            final String keywordLower = keyword.toLowerCase();
            videos = videos.stream()
                    .filter(v -> (v.getTitle() != null && v.getTitle().toLowerCase().contains(keywordLower)) ||
                               (v.getDescription() != null && v.getDescription().toLowerCase().contains(keywordLower)))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        return ResponseEntity.ok(Result.success(videos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result<Video>> getVideoById(@PathVariable Long id) {
        Video video = videoService.getVideoById(id);
        if (video != null) {
            return ResponseEntity.ok(Result.success(video));
        } else {
            return ResponseEntity.ok(Result.error("视频不存在"));
        }
    }

    @PostMapping
    public ResponseEntity<Result<Video>> createVideo(@RequestBody Video video) {
        Video savedVideo = videoService.saveVideo(video);
        return ResponseEntity.ok(Result.success("视频创建成功", savedVideo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result<Video>> updateVideo(@PathVariable Long id, @RequestBody Video videoDetails) {
        Video video = videoService.getVideoById(id);
        if (video != null) {
            video.setTitle(videoDetails.getTitle());
            video.setDescription(videoDetails.getDescription());
            video.setThumbnail(videoDetails.getThumbnail());
            video.setVideoUrl(videoDetails.getVideoUrl());
            video.setDuration(videoDetails.getDuration());
            video.setViews(videoDetails.getViews());
            video.setInheritorId(videoDetails.getInheritorId());
            video.setCategory(videoDetails.getCategory());
            video.setUpdateTime(java.time.LocalDateTime.now());
            
            Video updatedVideo = videoService.saveVideo(video);
            return ResponseEntity.ok(Result.success("视频更新成功", updatedVideo));
        } else {
            return ResponseEntity.ok(Result.error("视频不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Result<String>> deleteVideo(@PathVariable Long id) {
        Video video = videoService.getVideoById(id);
        if (video != null) {
            videoService.deleteVideo(id);
            return ResponseEntity.ok(Result.success("删除成功", ""));
        } else {
            return ResponseEntity.ok(Result.error("视频不存在"));
        }
    }
}
