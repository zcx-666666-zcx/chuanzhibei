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
    @GetMapping("/{id:\\d+}")
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
            return Result.error("获取新闻详情时发生错误: " + e.getMessage());
        }
    }

    /**
     * 近期新闻列表（按发布时间倒序），分页参数：page 从 0 起，size 默认 20、最大 50。
     * data 形态：{ list, total, page, size, hasMore }。
     */
    @GetMapping("/recent")
    public Result<Map<String, Object>> getRecentNews(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Map<String, Object> pageBody = newsService.getRecentPage(page, size);
            @SuppressWarnings("unchecked")
            List<News> slice = (List<News>) pageBody.get("list");
            List<Map<String, Object>> mapped = new ArrayList<>();
            if (slice != null) {
                for (News news : slice) {
                    mapped.add(toSummaryMap(news));
                }
            }
            Map<String, Object> data = new HashMap<>();
            data.put("list", mapped);
            data.put("total", pageBody.get("total"));
            data.put("page", pageBody.get("page"));
            data.put("size", pageBody.get("size"));
            data.put("hasMore", pageBody.get("hasMore"));
            return Result.success(data);
        } catch (Exception e) {
            System.err.println("获取新闻列表时发生错误: " + e.getMessage());
            return Result.error("获取新闻列表时发生错误: " + e.getMessage());
        }
    }

    /**
     * 按关键词搜索新闻（标题/描述/正文）
     *
     * @param keyword 关键词
     * @return 匹配新闻
     */
    @GetMapping("/search")
    public Result<Map<String, Object>> searchNews(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Map<String, Object> pageBody = newsService.searchPage(keyword, page, size);
            @SuppressWarnings("unchecked")
            List<News> slice = (List<News>) pageBody.get("list");
            List<Map<String, Object>> mapped = new ArrayList<>();
            if (slice != null) {
                for (News news : slice) {
                    mapped.add(toSummaryMap(news));
                }
            }
            Map<String, Object> data = new HashMap<>();
            data.put("list", mapped);
            data.put("total", pageBody.get("total"));
            data.put("page", pageBody.get("page"));
            data.put("size", pageBody.get("size"));
            data.put("hasMore", pageBody.get("hasMore"));
            return Result.success(data);
        } catch (Exception e) {
            return Result.error("搜索新闻失败: " + e.getMessage());
        }
    }

    private Map<String, Object> toSummaryMap(News news) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", news.getId());
        item.put("title", news.getTitle());
        item.put("description", news.getDescription());
        item.put("imageUrls", news.getImageUrls());
        item.put("publishTime", news.getPublishTime());
        item.put("author", news.getAuthor());
        return item;
    }
}