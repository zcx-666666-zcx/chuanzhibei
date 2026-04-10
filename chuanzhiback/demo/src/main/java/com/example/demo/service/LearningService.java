package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LearningService {

    private final List<Map<String, Object>> defaultChapters = buildDefaultChapters();
    private final Map<Long, Set<String>> userCompletedChapters = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> userProgressUpdatedAt = new ConcurrentHashMap<>();

    public List<Map<String, Object>> getLearningPath() {
        return new ArrayList<>(defaultChapters);
    }

    public Map<String, Object> getUserProgress(Long userId) {
        Set<String> completed = userCompletedChapters.getOrDefault(userId, ConcurrentHashMap.newKeySet());
        int total = defaultChapters.size();
        int completedCount = completed.size();
        int percent = total == 0 ? 0 : (int) Math.round((completedCount * 100.0) / total);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalChapters", total);
        result.put("completedCount", completedCount);
        result.put("progressPercent", percent);
        result.put("completedChapterIds", new ArrayList<>(completed));
        result.put("lastUpdatedAt", userProgressUpdatedAt.get(userId));
        return result;
    }

    public Map<String, Object> updateUserProgress(Long userId, String chapterId, boolean completed) {
        Set<String> chapterSet = userCompletedChapters.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet());
        if (completed) {
            chapterSet.add(chapterId);
        } else {
            chapterSet.remove(chapterId);
        }
        userProgressUpdatedAt.put(userId, LocalDateTime.now());
        return getUserProgress(userId);
    }

    private List<Map<String, Object>> buildDefaultChapters() {
        List<Map<String, Object>> chapters = new ArrayList<>();
        chapters.add(chapter("chapter-1", "非遗入门导览", "15分钟", "guide", "先了解非遗定义、门类与保护体系。", "/pages/newsList/newsList"));
        chapters.add(chapter("chapter-2", "名录与地域认知", "20分钟", "heritage", "通过名录认识地域差异与代表性项目。", "/pages/Heritage/Heritage"));
        chapters.add(chapter("chapter-3", "技艺案例学习", "25分钟", "video", "观看技艺演示视频，理解工艺流程。", "/pages/skillVideoList/skillVideoList"));
        chapters.add(chapter("chapter-4", "活动实践体验", "20分钟", "activity", "报名活动并进行线下互动体验。", "/pages/activityList/activityList"));
        return chapters;
    }

    private Map<String, Object> chapter(
            String id,
            String title,
            String duration,
            String type,
            String description,
            String path
    ) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("title", title);
        item.put("duration", duration);
        item.put("type", type);
        item.put("description", description);
        item.put("path", path);
        item.put("tags", Arrays.asList("学习中心", "研学路径"));
        return item;
    }
}
