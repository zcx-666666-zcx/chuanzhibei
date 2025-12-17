package com.example.demo.controller;

import com.example.demo.entity.News;
import com.example.demo.service.NewsService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsService newsService;

    @GetMapping
    public ResponseEntity<Result<List<News>>> getAllNews() {
        List<News> newsList = newsService.getAllNews();
        return ResponseEntity.ok(Result.success(newsList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result<News>> getNewsById(@PathVariable Long id) {
        News news = newsService.getNewsById(id);
        if (news != null) {
            return ResponseEntity.ok(Result.success(news));
        } else {
            return ResponseEntity.ok(Result.error("新闻不存在"));
        }
    }

    @PostMapping
    public ResponseEntity<Result<News>> createNews(@RequestBody News news) {
        News savedNews = newsService.saveNews(news);
        return ResponseEntity.ok(Result.success("新闻创建成功", savedNews));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result<News>> updateNews(@PathVariable Long id, @RequestBody News newsDetails) {
        News news = newsService.getNewsById(id);
        if (news != null) {
            news.setTitle(newsDetails.getTitle());
            news.setDescription(newsDetails.getDescription());
            news.setImageUrl(newsDetails.getImageUrl());
            news.setDate(newsDetails.getDate());
            news.setUpdateTime(java.time.LocalDateTime.now());
            
            News updatedNews = newsService.saveNews(news);
            return ResponseEntity.ok(Result.success("新闻更新成功", updatedNews));
        } else {
            return ResponseEntity.ok(Result.error("新闻不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Result<String>> deleteNews(@PathVariable Long id) {
        News news = newsService.getNewsById(id);
        if (news != null) {
            newsService.deleteNews(id);
            return ResponseEntity.ok(Result.success("删除成功", ""));
        } else {
            return ResponseEntity.ok(Result.error("新闻不存在"));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<Result<List<News>>> getRecentNews() {
        List<News> recentNews = newsService.getRecentNews();
        return ResponseEntity.ok(Result.success(recentNews));
    }

    @GetMapping("/search")
    public ResponseEntity<Result<List<News>>> searchNews(@RequestParam String keyword) {
        List<News> newsList = newsService.searchNews(keyword);
        return ResponseEntity.ok(Result.success(newsList));
    }
}