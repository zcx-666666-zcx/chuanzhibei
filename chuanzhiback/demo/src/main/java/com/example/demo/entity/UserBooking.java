package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_bookings")
public class UserBooking extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "booking_type")
    private String type; // 'experience', 'activity', 'watch'
    
    @Column(name = "master_id")
    private Long masterId;
    
    @Column(name = "master_name")
    private String masterName;
    
    @Column(name = "skill")
    private String skill;
    
    @Column(name = "master_avatar")
    private String masterAvatar;
    
    @Column(name = "activity_id")
    private Long activityId;
    
    @Column(name = "activity_title")
    private String activityTitle;
    
    @Column(name = "booking_time")
    private String time;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "contact")
    private String contact;
    
    @Column(name = "status")
    private String status; // 'pending', 'confirmed', 'cancelled', 'completed'

    // Constructors
    public UserBooking() {
        super();
    }
    
    public UserBooking(User user, String type, String status) {
        this.user = user;
        this.type = type;
        this.status = status;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getMasterId() {
        return masterId;
    }

    public void setMasterId(Long masterId) {
        this.masterId = masterId;
    }

    public String getMasterName() {
        return masterName;
    }

    public void setMasterName(String masterName) {
        this.masterName = masterName;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getMasterAvatar() {
        return masterAvatar;
    }

    public void setMasterAvatar(String masterAvatar) {
        this.masterAvatar = masterAvatar;
    }

    public Long getActivityId() {
        return activityId;
    }

    public void setActivityId(Long activityId) {
        this.activityId = activityId;
    }

    public String getActivityTitle() {
        return activityTitle;
    }

    public void setActivityTitle(String activityTitle) {
        this.activityTitle = activityTitle;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

