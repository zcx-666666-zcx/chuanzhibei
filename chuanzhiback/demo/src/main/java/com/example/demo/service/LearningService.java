package com.example.demo.service;

import com.example.demo.entity.LearningProgress;
import com.example.demo.entity.User;
import com.example.demo.repository.LearningProgressRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LearningService {

    private final List<Map<String, Object>> defaultChapters = buildDefaultChapters();
    private final Set<String> validChapterIds = new HashSet<>();
    private final LearningProgressRepository learningProgressRepository;
    private final UserRepository userRepository;

    public LearningService(LearningProgressRepository learningProgressRepository, UserRepository userRepository) {
        this.learningProgressRepository = learningProgressRepository;
        this.userRepository = userRepository;
        this.defaultChapters.forEach(item -> validChapterIds.add(String.valueOf(item.get("id"))));
    }

    public List<Map<String, Object>> getLearningPath() {
        return new ArrayList<>(defaultChapters);
    }

    public Map<String, Object> getUserProgress(Long userId) {
        List<LearningProgress> progressList = learningProgressRepository.findByUser_IdAndCompletedTrueOrderByUpdateTimeDesc(userId);
        Set<String> completed = progressList.stream()
                .map(LearningProgress::getChapterId)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        int total = defaultChapters.size();
        int completedCount = completed.size();
        int percent = total == 0 ? 0 : (int) Math.round((completedCount * 100.0) / total);
        LocalDateTime lastUpdatedAt = learningProgressRepository.findLastUpdatedAtByUserId(userId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalChapters", total);
        result.put("completedCount", completedCount);
        result.put("progressPercent", percent);
        result.put("completedChapterIds", new ArrayList<>(completed));
        result.put("lastUpdatedAt", lastUpdatedAt);
        return result;
    }

    @Transactional
    public Map<String, Object> updateUserProgress(Long userId, String chapterId, boolean completed) {
        validateChapterId(chapterId);
        LearningProgress progress = learningProgressRepository.findByUser_IdAndChapterId(userId, chapterId)
                .orElseGet(() -> new LearningProgress(loadUser(userId), chapterId, completed));
        progress.setCompleted(completed);
        progress.setUpdateTime(LocalDateTime.now());
        if (progress.getCreateTime() == null) {
            progress.setCreateTime(LocalDateTime.now());
        }
        learningProgressRepository.save(progress);
        return getUserProgress(userId);
    }

    private void validateChapterId(String chapterId) {
        if (!validChapterIds.contains(chapterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "chapterId 不存在");
        }
    }

    private User loadUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在"));
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
