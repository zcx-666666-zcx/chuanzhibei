package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "learning_progress",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_learning_progress_user_chapter", columnNames = {"user_id", "chapter_id"})
        },
        indexes = {
                @Index(name = "idx_learning_progress_user", columnList = "user_id"),
                @Index(name = "idx_learning_progress_user_completed", columnList = "user_id, completed")
        }
)
public class LearningProgress extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "chapter_id", nullable = false, length = 64)
    private String chapterId;

    @Column(name = "completed", nullable = false)
    private Boolean completed = Boolean.TRUE;

    public LearningProgress() {
        super();
    }

    public LearningProgress(User user, String chapterId, Boolean completed) {
        this.user = user;
        this.chapterId = chapterId;
        this.completed = completed;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getChapterId() {
        return chapterId;
    }

    public void setChapterId(String chapterId) {
        this.chapterId = chapterId;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}
