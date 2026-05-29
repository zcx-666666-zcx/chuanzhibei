package com.ruoyi.heritage.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** 3D沉浸演示 — 对应 ar_experience 表 */
@TableName("ar_experience")
public class ArExperience {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private String modelUrl;
    private String instructions;
    private Boolean isHot;
    @TableField(fill = FieldFill.INSERT) @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE) @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date updateTime;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getModelUrl() { return modelUrl; } public void setModelUrl(String modelUrl) { this.modelUrl = modelUrl; }
    public String getInstructions() { return instructions; } public void setInstructions(String instructions) { this.instructions = instructions; }
    public Boolean getIsHot() { return isHot; } public void setIsHot(Boolean isHot) { this.isHot = isHot; }
    public Date getCreateTime() { return createTime; } public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; } public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}
