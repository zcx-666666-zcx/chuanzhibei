package com.example.demo.service;

import com.example.demo.entity.UserCollection;
import com.example.demo.repository.UserCollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
    
    public void deleteUserCollection(Long userId, Long heritageId) {
        userCollectionRepository.deleteByUserIdAndHeritageId(userId, heritageId);
    }
    
    public boolean isHeritageCollected(Long userId, Long heritageId) {
        List<UserCollection> collections = userCollectionRepository.findByUserId(userId);
        return collections.stream()
                .anyMatch(collection -> collection.getHeritageId().equals(heritageId));
    }
}