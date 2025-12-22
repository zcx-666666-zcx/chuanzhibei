package com.example.demo.controller;

import com.example.demo.entity.News;
import com.example.demo.service.NewsService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsService newsService;

    /**
     * 获取新闻详情
     *
     * @param id 新闻ID
     * @return 新闻详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getNewsDetail(@PathVariable Long id) {
        System.out.println("请求新闻详情，ID: " + id);
        
        try {
            News news = newsService.getNewsById(id);
            System.out.println("查找ID为 " + id + " 的新闻结果: " + news);
            
            if (news == null) {
                System.out.println("未找到ID为 " + id + " 的新闻");
                return Result.error("新闻不存在，请求的ID: " + id);
            }
            
            Map<String, Object> newsDetail = new HashMap<>();
            newsDetail.put("id", news.getId());
            newsDetail.put("title", news.getTitle());
            newsDetail.put("description", news.getDescription());
            newsDetail.put("content", news.getContent());
            newsDetail.put("imageUrls", news.getImageUrls());
            newsDetail.put("publishTime", news.getPublishTime());
            newsDetail.put("author", news.getAuthor());
            
            System.out.println("返回的新闻详情: " + newsDetail);
            return Result.success(newsDetail);
        } catch (Exception e) {
            System.err.println("获取新闻详情时发生错误: " + e.getMessage());
            e.printStackTrace();
            return Result.error("获取新闻详情时发生错误: " + e.getMessage());
        }
    }

    /**
     * 获取最近新闻列表
     *
     * @return 最近新闻列表
     */
    @GetMapping("/recent")
    public Result<List<Map<String, Object>>> getRecentNews() {
        try {
            List<News> newsList = newsService.getAllNews();
            System.out.println("获取到的新闻列表: " + newsList);
            
            // 按ID排序确保顺序一致
            List<News> sortedNews = newsList.stream()
                .sorted((n1, n2) -> n1.getId().compareTo(n2.getId()))
                .collect(java.util.stream.Collectors.toList());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (News news : sortedNews) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", news.getId());
                item.put("title", news.getTitle());
                item.put("description", news.getDescription());
                item.put("imageUrls", news.getImageUrls());
                item.put("publishTime", news.getPublishTime());
                item.put("author", news.getAuthor());
                result.add(item);
            }
            
            return Result.success(result);
        } catch (Exception e) {
            System.err.println("获取新闻列表时发生错误: " + e.getMessage());
            e.printStackTrace();
            return Result.error("获取新闻列表时发生错误: " + e.getMessage());
        }
    }
}