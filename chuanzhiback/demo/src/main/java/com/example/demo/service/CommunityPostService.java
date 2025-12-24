package com.example.demo.service;

import com.example.demo.entity.CommunityPost;
import com.example.demo.entity.User;
import com.example.demo.repository.CommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
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
    
    @PostConstruct
    public void initData() {
        // 如果数据库中没有社区帖子数据，则添加演示数据
        if (communityPostRepository.count() == 0) {
            // 添加社区帖子演示数据，使用正确的静态资源路径
            CommunityPost post1 = new CommunityPost();
            post1.setUserId(1L);
            post1.setUserName("剪纸达人");
            post1.setUserAvatar("/uploads/masters_InheritorCommunit/master_jianzhi.jpg");
            post1.setContent("今天完成了新的剪纸作品《龙凤呈祥》，融合了传统纹样和现代设计元素，希望大家喜欢！");
            post1.setImageUrls("/uploads/masters_InheritorCommunit/master_jianzhi.jpg");
            post1.setLikesCount(128);
            post1.setCommentsCount(23);
            post1.setIsLiked(false);
            post1.setCreateTime(LocalDateTime.now().minusHours(2));
            saveCommunityPost(post1);
            
            CommunityPost post2 = new CommunityPost();
            post2.setUserId(2L);
            post2.setUserName("景泰蓝工艺师");
            post2.setUserAvatar("/uploads/masters_InheritorCommunit/master_jingjumei.jpg");
            post2.setContent("分享一个景泰蓝的制作过程，从选料到烧制，每一步都凝聚着匠人的心血。");
            post2.setImageUrls("/uploads/masters_InheritorCommunit/master_jingjumei.jpg,/uploads/masters_InheritorCommunit/master_jingtai.jpg");
            post2.setLikesCount(256);
            post2.setCommentsCount(45);
            post2.setIsLiked(true);
            post2.setCreateTime(LocalDateTime.now().minusHours(5));
            saveCommunityPost(post2);
            
            CommunityPost post3 = new CommunityPost();
            post3.setUserId(3L);
            post3.setUserName("京绣传承人");
            post3.setUserAvatar("/uploads/masters_InheritorCommunit/master_jingtai.jpg");
            post3.setContent("京绣作为宫廷刺绣的代表，其工艺之精妙令人叹为观止。今天展示了京绣中的盘金绣技法。");
            post3.setImageUrls("/uploads/masters_InheritorCommunit/master_jingtai.jpg");
            post3.setLikesCount(89);
            post3.setCommentsCount(12);
            post3.setIsLiked(false);
            post3.setCreateTime(LocalDateTime.now().minusDays(1));
            saveCommunityPost(post3);
        }
    }
}