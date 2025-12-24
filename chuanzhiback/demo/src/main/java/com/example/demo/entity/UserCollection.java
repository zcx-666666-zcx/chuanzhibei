package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_collections")
public class UserCollection extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "heritage_id")
    private Long heritageId;
    
    @Column(name = "heritage_name")
    private String heritageName;
    
    @Column(name = "heritage_description", columnDefinition = "TEXT")
    private String heritageDescription;
    
    @Column(name = "heritage_level")
    private String heritageLevel;
    
    @Column(name = "image_url")
    private String imageUrl;

    // Constructors
    public UserCollection() {
        super();
    }
    
    public UserCollection(User user, Long heritageId, String heritageName, String heritageDescription, String heritageLevel, String imageUrl) {
        this.user = user;
        this.heritageId = heritageId;
        this.heritageName = heritageName;
        this.heritageDescription = heritageDescription;
        this.heritageLevel = heritageLevel;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getHeritageId() {
        return heritageId;
    }

    public void setHeritageId(Long heritageId) {
        this.heritageId = heritageId;
    }

    public String getHeritageName() {
        return heritageName;
    }

    public void setHeritageName(String heritageName) {
        this.heritageName = heritageName;
    }

    public String getHeritageDescription() {
        return heritageDescription;
    }

    public void setHeritageDescription(String heritageDescription) {
        this.heritageDescription = heritageDescription;
    }

    public String getHeritageLevel() {
        return heritageLevel;
    }

    public void setHeritageLevel(String heritageLevel) {
        this.heritageLevel = heritageLevel;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}