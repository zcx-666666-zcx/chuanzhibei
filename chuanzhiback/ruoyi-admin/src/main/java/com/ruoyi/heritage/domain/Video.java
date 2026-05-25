package com.ruoyi.heritage.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** 视频 — 对应 video 表 */
@TableName("video")
public class Video {
    @TableId(type = IdType.AUTO) private Long id;
    private String title;
    private String description;
    private String thumbnail;
    private String videoUrl;
    private String duration;
    private Long views;
    private Long inheritorId;
    private String category;
    @TableField(fill = FieldFill.INSERT) @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE) @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date updateTime;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getThumbnail() { return thumbnail; } public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public String getVideoUrl() { return videoUrl; } public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getDuration() { return duration; } public void setDuration(String duration) { this.duration = duration; }
    public Long getViews() { return views; } public void setViews(Long views) { this.views = views; }
    public Long getInheritorId() { return inheritorId; } public void setInheritorId(Long inheritorId) { this.inheritorId = inheritorId; }
    public String getCategory() { return category; } public void setCategory(String category) { this.category = category; }
    public Date getCreateTime() { return createTime; } public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; } public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}
