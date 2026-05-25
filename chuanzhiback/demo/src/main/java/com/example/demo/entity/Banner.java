package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "banner")
public class Banner extends BaseEntity {
    private String title;
    private String description;
    private String imageUrl;
    private Long newsId;
    
    // Constructors
    public Banner() {
        super();
    }
    
    public Banner(String title, String description, String imageUrl) {
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public Banner(String title, String description, String imageUrl, Long newsId) {
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.newsId = newsId;
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
    
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getNewsId() {
        return newsId;
    }

    public void setNewsId(Long newsId) {
        this.newsId = newsId;
    }
}
