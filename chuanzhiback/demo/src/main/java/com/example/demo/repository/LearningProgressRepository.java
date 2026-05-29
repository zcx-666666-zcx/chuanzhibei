package com.example.demo.repository;

import com.example.demo.entity.LearningProgress;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {

    List<LearningProgress> findByUser_IdAndCompletedTrueOrderByUpdateTimeDesc(Long userId);

    Optional<LearningProgress> findByUser_IdAndChapterId(Long userId, String chapterId);

    @Query("SELECT MAX(lp.updateTime) FROM LearningProgress lp WHERE lp.user.id = :userId")
    LocalDateTime findLastUpdatedAtByUserId(@Param("userId") Long userId);
}
