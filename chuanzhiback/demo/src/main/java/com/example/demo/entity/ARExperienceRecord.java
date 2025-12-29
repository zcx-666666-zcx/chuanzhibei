package com.example.demo.entity;

import jakarta.persistence.*;

/**
 * 文物 AR 体验历史记录（持久化实体）
 */
@Entity
@Table(name = "ar_experience_records")
public class ARExperienceRecord extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "project_id")
    private Long projectId;
    
    @Column(name = "project_name")
    private String projectName;
    
    @Column(name = "project_thumb")
    private String projectThumb;
    
    @Column(name = "start_time")
    private java.time.LocalDateTime startTime;
    
    @Column(name = "duration")
    private Integer duration; // 秒

    public ARExperienceRecord() {
        super();
    }

    public ARExperienceRecord(User user, Long projectId, String projectName, String projectThumb,
                              java.time.LocalDateTime startTime, Integer duration) {
        super();
        this.user = user;
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectThumb = projectThumb;
        this.startTime = startTime;
        this.duration = duration;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectThumb() {
        return projectThumb;
    }

    public void setProjectThumb(String projectThumb) {
        this.projectThumb = projectThumb;
    }

    public java.time.LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(java.time.LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}

