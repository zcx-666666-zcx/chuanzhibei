package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.UserCollection;
import com.example.demo.repository.UserCollectionRepository;

@Service
public class UserCollectionService {
    
    @Autowired
    private UserCollectionRepository userCollectionRepository;
    
    public List<UserCollection> getUserCollectionsByUserId(Long userId) {
        return userCollectionRepository.findByUserId(userId);
    }
    
    public UserCollection saveUserCollection(UserCollection userCollection) {
        return userCollectionRepository.save(userCollection);
    }
    
    @Transactional
    public void deleteUserCollection(Long userId, Long heritageId) {
        userCollectionRepository.deleteByUserIdAndHeritageId(userId, heritageId);
    }
    
    public boolean isHeritageCollected(Long userId, Long heritageId) {
        return userCollectionRepository.existsByUserIdAndHeritageId(userId, heritageId);
    }
}