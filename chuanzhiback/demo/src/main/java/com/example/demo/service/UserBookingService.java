package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.UserBooking;
import com.example.demo.repository.UserBookingRepository;

@Service
public class UserBookingService {
    
    @Autowired
    private UserBookingRepository userBookingRepository;
    
    public List<UserBooking> getUserBookingsByUserId(Long userId) {
        return userBookingRepository.findByUserId(userId);
    }
    
    public UserBooking saveUserBooking(UserBooking userBooking) {
        return userBookingRepository.save(userBooking);
    }
    
    @Transactional
    public void deleteUserBooking(Long userId, Long bookingId) {
        userBookingRepository.deleteByUserIdAndBookingId(userId, bookingId);
    }
}

