package com.example.demo.service;

import com.example.demo.entity.ARExperienceRecord;
import com.example.demo.entity.ARProject;
import com.example.demo.entity.User;
import com.example.demo.repository.ARExperienceRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ARProjectService {

    @Autowired
    private ARExperienceRecordRepository recordRepository;
    
    @Autowired
    private UserService userService;

    private final List<ARProject> projectList = new ArrayList<>();

    /**
     * 初始化示例数据（非持久化）
     */
    @PostConstruct
    public void initData() {
        projectList.clear();

        // 使用用户上传的示例图片和视频
        projectList.add(new ARProject(
                1L,
                "景德镇青花瓷 AR 体验",
                "对准青花瓷海报，在画面上叠加展示纹样与烧制工艺的视频。",
                "当用户对准指定的青花瓷图片时，画面会叠加播放一段关于瓷器纹样、烧制工艺和文化故事的短视频。",
                "1. 确保开启相机权限\n2. 对准指定青花瓷图片\n3. 稳定握持手机，等待 AR 视频出现\n4. 跟随讲解观察纹样与细节",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/video_ARExperinece/demovideo.mp4",
                "约 2 分钟",
                "陶瓷艺术",
                true
        ));

        projectList.add(new ARProject(
                2L,
                "苏绣·双面绣 AR 体验",
                "扫描绣品图片，叠加展示绣线铺陈与细节放大的视频。",
                "对准指定的苏绣图片，画面中会播放绣线走向、纹理放大与匠人演示的短视频，帮助理解双面绣技艺。",
                "1. 开启相机权限\n2. 对准苏绣海报\n3. 稳定握持，等待视频出现\n4. 观察针法和线迹细节",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/video_ARExperinece/demovideo.mp4",
                "约 2 分钟",
                "传统技艺",
                true
        ));

        projectList.add(new ARProject(
                3L,
                "青铜器纹样 AR 体验",
                "识别青铜器纹饰图片，在画面上播放纹饰解析与场景还原视频。",
                "用户对准青铜器纹饰图片后，视频将展示纹样来源、寓意以及复原场景片段。",
                "1. 确认光线充足\n2. 对准青铜器纹饰图片\n3. 稳定设备，等待视频叠加\n4. 跟随讲解了解纹饰寓意",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/video_ARExperinece/demovideo.mp4",
                "约 2 分钟",
                "青铜艺术",
                false
        ));

        projectList.add(new ARProject(
                4L,
                "少林武术 AR 体验",
                "对准武术海报，在画面中叠加演示短片，体验身法和招式要领。",
                "识别少林武术图片后，画面叠加演示短片，讲解基本身法和代表性招式。",
                "1. 保持良好网络\n2. 对准武术海报\n3. 注意周围安全，体验完成后可再次播放",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/photo_ARExperinece/deomphoto.jpg",
                "/uploads/video_ARExperinece/demovideo.mp4",
                "约 90 秒",
                "武术",
                false
        ));
    }

    public List<ARProject> list(String category, String keyword) {
        return projectList.stream()
                .filter(p -> category == null || category.isEmpty() || category.equals(p.getCategory()))
                .filter(p -> keyword == null || keyword.isEmpty()
                        || p.getName().contains(keyword)
                        || (p.getDescription() != null && p.getDescription().contains(keyword)))
                .collect(Collectors.toList());
    }

    public ARProject findById(Long id) {
        return projectList.stream().filter(p -> p.getId().equals(id)).findFirst().orElse(null);
    }

    @Transactional
    public ARExperienceRecord addHistory(Long userId, Long projectId, Integer duration) {
        // 获取用户
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 获取项目
        ARProject project = findById(projectId);
        if (project == null) {
            throw new RuntimeException("AR项目不存在");
        }
        
        // 创建并保存体验记录
        ARExperienceRecord record = new ARExperienceRecord(
                user,
                projectId,
                project.getName(),
                project.getCoverImage(), // 使用项目封面作为历史记录缩略图
                LocalDateTime.now(),
                duration != null ? duration : 0
        );
        
        return recordRepository.save(record);
    }

    public List<ARExperienceRecord> getHistoryByUserId(Long userId) {
        // 按时间倒序排列，最近的在前
        return recordRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteHistoryExceptRecent(Long userId, int keepCount) {
        List<ARExperienceRecord> allRecords = recordRepository.findByUserId(userId);
        if (allRecords.size() > keepCount) {
            // 保留最近的keepCount条记录，删除其余的
            List<ARExperienceRecord> toDelete = allRecords.subList(keepCount, allRecords.size());
            recordRepository.deleteAll(toDelete);
        }
    }

    @Transactional
    public boolean deleteHistoryByIdForUser(Long recordId, Long userId) {
        Optional<ARExperienceRecord> recordOpt = recordRepository.findByIdAndUserId(recordId, userId);
        if (recordOpt.isEmpty()) {
            return false;
        }
        recordRepository.delete(recordOpt.get());
        return true;
    }

    public Map<String, Object> getStatisticsByUserId(Long userId) {
        List<ARExperienceRecord> records = recordRepository.findByUserId(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExperiences", records.size());
        int totalDuration = records.stream()
                .mapToInt(r -> r.getDuration() != null ? r.getDuration() : 0)
                .sum();
        stats.put("totalDuration", totalDuration);

        Map<Long, Long> countByProject = records.stream()
                .collect(Collectors.groupingBy(ARExperienceRecord::getProjectId, Collectors.counting()));

        if (!countByProject.isEmpty()) {
            Long maxProjectId = countByProject.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            ARProject favorite = findById(maxProjectId);
            if (favorite != null) {
                Map<String, Object> fav = new HashMap<>();
                fav.put("id", favorite.getId());
                fav.put("name", favorite.getName());
                fav.put("count", countByProject.get(maxProjectId));
                stats.put("favoriteProject", fav);
            }
        }
        return stats;
    }
}