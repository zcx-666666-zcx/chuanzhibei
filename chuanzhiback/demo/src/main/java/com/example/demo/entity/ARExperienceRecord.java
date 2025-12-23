package com.example.demo.entity;

import java.time.LocalDateTime;

/**
 * 文物 AR 体验历史记录（简单 POJO，不持久化）
 */
public class ARExperienceRecord {
    private Long id;
    private Long projectId;
    private String projectName;
    private String projectThumb;
    private LocalDateTime startTime;
    private Integer duration; // 秒

    public ARExperienceRecord() {}

    public ARExperienceRecord(Long id, Long projectId, String projectName, String projectThumb,
                              LocalDateTime startTime, Integer duration) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectThumb = projectThumb;
        this.startTime = startTime;
        this.duration = duration;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getProjectThumb() { return projectThumb; }
    public void setProjectThumb(String projectThumb) { this.projectThumb = projectThumb; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
}

