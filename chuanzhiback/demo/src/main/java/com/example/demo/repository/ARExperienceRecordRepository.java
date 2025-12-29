package com.example.demo.repository;

import com.example.demo.entity.ARExperienceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ARExperienceRecordRepository extends JpaRepository<ARExperienceRecord, Long> {
    
    // 通过User的id来查询体验记录
    @Query("SELECT r FROM ARExperienceRecord r WHERE r.user.id = :userId ORDER BY r.startTime DESC")
    List<ARExperienceRecord> findByUserId(@Param("userId") Long userId);
    
    // 通过User的id和projectId查询
    @Query("SELECT r FROM ARExperienceRecord r WHERE r.user.id = :userId AND r.projectId = :projectId ORDER BY r.startTime DESC")
    List<ARExperienceRecord> findByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId);
}

