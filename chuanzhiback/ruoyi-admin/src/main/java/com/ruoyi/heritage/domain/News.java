package com.ruoyi.heritage.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/**
 * 新闻 — 对应现有 news 表
 */
@TableName("news")
public class News {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String title;

    private String description;

    private String content;

    private String imageUrls;

    private String author;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date date;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date publishTime;

    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;

    // ---- Getter / Setter ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
    public Date getPublishTime() { return publishTime; }
    public void setPublishTime(Date publishTime) { this.publishTime = publishTime; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}
