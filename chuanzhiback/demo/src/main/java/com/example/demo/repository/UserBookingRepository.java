package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.UserBooking;

@Repository
public interface UserBookingRepository extends JpaRepository<UserBooking, Long> {
    // 通过User的id来查询预约列表
    @Query("SELECT ub FROM UserBooking ub WHERE ub.user.id = :userId AND ub.status != 'cancelled' ORDER BY ub.createTime DESC")
    List<UserBooking> findByUserId(@Param("userId") Long userId);
    
    // 通过User的id和预约ID来删除预约
    @Modifying
    @Transactional
    @Query("DELETE FROM UserBooking ub WHERE ub.user.id = :userId AND ub.id = :bookingId")
    int deleteByUserIdAndBookingId(@Param("userId") Long userId, @Param("bookingId") Long bookingId);
}

