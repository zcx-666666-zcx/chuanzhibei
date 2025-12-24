package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "video")
public class Video extends BaseEntity {
    private String title;
    private String description;
    private String thumbnail;
    private String videoUrl;
    private String duration; // 格式：HH:MM:SS 或 MM:SS
    private Long views; // 观看次数
    private Long inheritorId; // 关联的传承人ID
    private String category; // 视频分类
    
    // Constructors
    public Video() {
        super();
    }
    
    public Video(String title, String description, String thumbnail, String videoUrl, String duration, Long views, Long inheritorId, String category) {
        this.title = title;
        this.description = description;
        this.thumbnail = thumbnail;
        this.videoUrl = videoUrl;
        this.duration = duration;
        this.views = views;
        this.inheritorId = inheritorId;
        this.category = category;
    }
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getThumbnail() {
        return thumbnail;
    }
    
    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
    
    public Long getViews() {
        return views;
    }
    
    public void setViews(Long views) {
        this.views = views;
    }
    
    public Long getInheritorId() {
        return inheritorId;
    }
    
    public void setInheritorId(Long inheritorId) {
        this.inheritorId = inheritorId;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
}
