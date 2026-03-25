package com.example.demo.controller;

import com.example.demo.entity.Banner;
import com.example.demo.entity.Heritage;
import com.example.demo.entity.News;
import com.example.demo.service.BannerService;
import com.example.demo.service.HeritageService;
import com.example.demo.service.NewsService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "*")
public class HomeController {

    @Autowired
    private BannerService bannerService;
    
    @Autowired
    private NewsService newsService;
    
    @Autowired
    private HeritageService heritageService;

    /**
     * 获取首页数据
     * 包括轮播图、推荐项目和最新新闻
     */
    @GetMapping("/data")
    public ResponseEntity<Result<Map<String, Object>>> getHomeData() {
        Map<String, Object> homeData = new HashMap<>();
        
        // 获取轮播图数据
        List<Banner> banners = bannerService.getAllBanners();
        homeData.put("banners", banners);
        
        // 获取推荐非遗项目
        List<Heritage> recommendHeritages = heritageService.getRecommendedHeritages();
        homeData.put("recommendHeritages", recommendHeritages);
        
        // 获取最新新闻
        List<News> recentNews = newsService.getAllNews();
        homeData.put("recentNews", recentNews);
        
        return ResponseEntity.ok(Result.success(homeData));
    }

    /**
     * 本地调试：获取通知列表（基于最近新闻聚合）
     */
    @GetMapping("/notifications")
    public ResponseEntity<Result<List<Map<String, Object>>>> getNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();
        List<News> recentNews = newsService.getAllNews();
        int max = Math.min(5, recentNews.size());
        for (int i = 0; i < max; i++) {
            News news = recentNews.get(i);
            Map<String, Object> item = new HashMap<>();
            item.put("id", news.getId());
            item.put("title", news.getTitle());
            item.put("content", news.getDescription());
            item.put("time", news.getPublishTime());
            item.put("type", "news");
            notifications.add(item);
        }
        return ResponseEntity.ok(Result.success(notifications));
    }

    /**
     * 本地调试：联调健康状态
     */
    @GetMapping("/debug-info")
    public ResponseEntity<Result<Map<String, Object>>> getDebugInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("service", "chuanzhiback-demo");
        info.put("status", "UP");
        info.put("timestamp", System.currentTimeMillis());
        info.put("banners", bannerService.getAllBanners().size());
        info.put("news", newsService.getAllNews().size());
        info.put("recommendHeritages", heritageService.getRecommendedHeritages().size());
        return ResponseEntity.ok(Result.success(info));
    }
}