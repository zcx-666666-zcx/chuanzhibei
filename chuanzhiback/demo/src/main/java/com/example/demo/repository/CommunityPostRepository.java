package com.example.demo.repository;

import com.example.demo.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findByOrderByCreateTimeDesc();
    
    List<CommunityPost> findByUserId(Long userId);
}