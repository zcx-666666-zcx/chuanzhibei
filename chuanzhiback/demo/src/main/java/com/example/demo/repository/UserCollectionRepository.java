package com.example.demo.repository;

import com.example.demo.entity.UserCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCollectionRepository extends JpaRepository<UserCollection, Long> {
    List<UserCollection> findByUserId(Long userId);
    
    void deleteByUserIdAndHeritageId(Long userId, Long heritageId);
}