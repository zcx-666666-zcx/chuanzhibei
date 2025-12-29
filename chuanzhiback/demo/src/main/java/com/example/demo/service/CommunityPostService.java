package com.example.demo.service;

import com.example.demo.entity.CommunityPost;
import com.example.demo.entity.User;
import com.example.demo.repository.CommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityPostService {
    
    @Autowired
    private CommunityPostRepository communityPostRepository;
    
    public List<CommunityPost> getAllCommunityPosts() {
        return communityPostRepository.findByOrderByCreateTimeDesc();
    }
    
    public List<CommunityPost> getUserPostsByUserId(Long userId) {
        return communityPostRepository.findByUserId(userId);
    }
    
    public CommunityPost saveCommunityPost(CommunityPost communityPost) {
        return communityPostRepository.save(communityPost);
    }
    
    public void deleteCommunityPost(Long id) {
        communityPostRepository.deleteById(id);
    }
    
    public CommunityPost getCommunityPostById(Long id) {
        return communityPostRepository.findById(id).orElse(null);
    }
    
    public Page<CommunityPost> getCommunityPostsByPage(Pageable pageable) {
        return communityPostRepository.findAll(pageable);
    }
    
}