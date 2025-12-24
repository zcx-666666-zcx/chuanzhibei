package com.example.demo.service;

import com.example.demo.entity.Video;
import com.example.demo.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class VideoService {
    
    @Autowired
    private VideoRepository videoRepository;
    
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }
    
    public List<Video> getVideosByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return getAllVideos();
        }
        return videoRepository.findByCategory(category);
    }
    
    public List<Video> getVideosByInheritorId(Long inheritorId) {
        return videoRepository.findByInheritorId(inheritorId);
    }
    
    public Video getVideoById(Long id) {
        return videoRepository.findById(id).orElse(null);
    }
    
    public Video saveVideo(Video video) {
        return videoRepository.save(video);
    }
    
    public void deleteVideo(Long id) {
        videoRepository.deleteById(id);
    }
    
    @PostConstruct
    public void initData() {
        // 如果数据库为空，初始化一些示例数据
        if (videoRepository.count() == 0) {
            Video video1 = new Video();
            video1.setTitle("苏绣技艺展示");
            video1.setDescription("国家级传承人姚建萍展示苏绣的精湛技艺和独特魅力，详细介绍平针、套针等传统针法");
            video1.setThumbnail("/uploads/masters_InheritorCommunit/master_suxiu.jpg");
            video1.setVideoUrl("/video/suxiu_demo.mp4");
            video1.setDuration("15:30");
            video1.setViews(32000L);
            video1.setInheritorId(5L);
            video1.setCategory("传统技艺");
            videoRepository.save(video1);
            
            Video video2 = new Video();
            video2.setTitle("景泰蓝制作工艺");
            video2.setDescription("工艺美术大师张同禄现场演示景泰蓝的掐丝、点蓝、烧制等关键工艺流程");
            video2.setThumbnail("/uploads/masters_InheritorCommunit/master_jingtai.jpg");
            video2.setVideoUrl("/video/jingtai_demo.mp4");
            video2.setDuration("18:45");
            video2.setViews(28000L);
            video2.setInheritorId(2L);
            video2.setCategory("传统技艺");
            videoRepository.save(video2);
            
            Video video3 = new Video();
            video3.setTitle("剪纸艺术创作");
            video3.setDescription("传承人高凤莲展示传统剪纸技法，从设计到剪裁，展现剪纸艺术的精妙");
            video3.setThumbnail("/uploads/masters_InheritorCommunit/master_jianzhi.jpg");
            video3.setVideoUrl("/video/jianzhi_demo.mp4");
            video3.setDuration("12:20");
            video3.setViews(19000L);
            video3.setInheritorId(1L);
            video3.setCategory("传统美术");
            videoRepository.save(video3);
            
            Video video4 = new Video();
            video4.setTitle("京剧身段表演");
            video4.setDescription("梅派传人展示京剧表演的身段、唱腔和舞台艺术，传承经典剧目");
            video4.setThumbnail("/uploads/masters_InheritorCommunit/master_jingjumei.jpg");
            video4.setVideoUrl("/video/jingju_demo.mp4");
            video4.setDuration("20:15");
            video4.setViews(45000L);
            video4.setInheritorId(4L);
            video4.setCategory("传统戏剧");
            videoRepository.save(video4);
        }
    }
}
