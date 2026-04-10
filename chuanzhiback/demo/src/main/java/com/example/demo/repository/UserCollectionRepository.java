package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.UserCollection;

@Repository
public interface UserCollectionRepository extends JpaRepository<UserCollection, Long> {
    // 通过User的id来查询收藏列表
    @Query("SELECT uc FROM UserCollection uc WHERE uc.user.id = :userId")
    List<UserCollection> findByUserId(@Param("userId") Long userId);
    
    // 通过User的id和heritageId来删除收藏
    @Modifying
    @Query("DELETE FROM UserCollection uc WHERE uc.user.id = :userId AND uc.heritageId = :heritageId")
    int deleteByUserIdAndHeritageId(@Param("userId") Long userId, @Param("heritageId") Long heritageId);
    
    // 检查是否已收藏
    @Query("SELECT COUNT(uc) > 0 FROM UserCollection uc WHERE uc.user.id = :userId AND uc.heritageId = :heritageId")
    boolean existsByUserIdAndHeritageId(@Param("userId") Long userId, @Param("heritageId") Long heritageId);
}