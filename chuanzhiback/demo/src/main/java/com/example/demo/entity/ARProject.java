package com.example.demo.entity;

/**
 * 文物 AR 体验项目（简单 POJO，不持久化，仅用于接口返回）
 */
public class ARProject {
    private Long id;
    private String name;
    private String description;
    private String detail;
    private String instruction;
    private String coverImage;
    private String markerImage;
    private String videoUrl;
    private String duration;
    private String category;
    private boolean isHot;

    public ARProject() {}

    public ARProject(Long id, String name, String description, String detail, String instruction,
                     String coverImage, String markerImage, String videoUrl,
                     String duration, String category, boolean isHot) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.detail = detail;
        this.instruction = instruction;
        this.coverImage = coverImage;
        this.markerImage = markerImage;
        this.videoUrl = videoUrl;
        this.duration = duration;
        this.category = category;
        this.isHot = isHot;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getMarkerImage() { return markerImage; }
    public void setMarkerImage(String markerImage) { this.markerImage = markerImage; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isHot() { return isHot; }
    public void setHot(boolean hot) { isHot = hot; }
}

