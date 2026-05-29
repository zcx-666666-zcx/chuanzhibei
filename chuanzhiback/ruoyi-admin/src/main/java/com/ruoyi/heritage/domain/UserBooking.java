package com.ruoyi.heritage.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** 用户预约 — 对应 user_bookings 表 */
@TableName("user_bookings")
public class UserBooking {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String bookingType;
    private Long masterId;
    private String masterName;
    private String skill;
    private String masterAvatar;
    private Long activityId;
    private String activityTitle;
    private String bookingTime;
    private String location;
    private String contact;
    private String status;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date createTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date updateTime;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long userId) { this.userId = userId; }
    public String getBookingType() { return bookingType; } public void setBookingType(String bookingType) { this.bookingType = bookingType; }
    public Long getMasterId() { return masterId; } public void setMasterId(Long masterId) { this.masterId = masterId; }
    public String getMasterName() { return masterName; } public void setMasterName(String masterName) { this.masterName = masterName; }
    public String getSkill() { return skill; } public void setSkill(String skill) { this.skill = skill; }
    public String getMasterAvatar() { return masterAvatar; } public void setMasterAvatar(String masterAvatar) { this.masterAvatar = masterAvatar; }
    public Long getActivityId() { return activityId; } public void setActivityId(Long activityId) { this.activityId = activityId; }
    public String getActivityTitle() { return activityTitle; } public void setActivityTitle(String activityTitle) { this.activityTitle = activityTitle; }
    public String getBookingTime() { return bookingTime; } public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
    public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
    public String getContact() { return contact; } public void setContact(String contact) { this.contact = contact; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Date getCreateTime() { return createTime; } public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; } public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}
