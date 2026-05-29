package com.ruoyi.heritage.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** 活动 — 对应 activity 表 */
@TableName("activity")
public class Activity {
    @TableId(type = IdType.AUTO) private Long id;
    private String title;
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date startTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date endTime;
    private String location;
    private Integer capacity;
    private Integer participants;
    private String status;
    @TableField(fill = FieldFill.INSERT) @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE) @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date updateTime;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public Date getStartTime() { return startTime; } public void setStartTime(Date startTime) { this.startTime = startTime; }
    public Date getEndTime() { return endTime; } public void setEndTime(Date endTime) { this.endTime = endTime; }
    public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getParticipants() { return participants; } public void setParticipants(Integer participants) { this.participants = participants; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Date getCreateTime() { return createTime; } public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; } public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}
