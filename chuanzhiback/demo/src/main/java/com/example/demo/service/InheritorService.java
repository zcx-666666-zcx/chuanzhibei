package com.example.demo.service;

import com.example.demo.entity.Inheritor;
import com.example.demo.repository.InheritorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class InheritorService {
    
    @Autowired
    private InheritorRepository inheritorRepository;
    
    public List<Inheritor> getAllInheritors() {
        return inheritorRepository.findAll();
    }
    
    public List<Inheritor> getInheritorsByLevel(String level) {
        return inheritorRepository.findByLevel(level);
    }
    
    public List<Inheritor> getInheritorsBySkill(String skill) {
        return inheritorRepository.findBySkill(skill);
    }
    
    public Inheritor getInheritorById(Long id) {
        return inheritorRepository.findById(id).orElse(null);
    }
    
    public Inheritor saveInheritor(Inheritor inheritor) {
        return inheritorRepository.save(inheritor);
    }
    
    public void deleteInheritor(Long id) {
        inheritorRepository.deleteById(id);
    }
    
    public Page<Inheritor> getInheritorsByPage(String category, String keyword, Pageable pageable) {
        // 简单实现：返回所有传承人分页
        return inheritorRepository.findAll(pageable);
    }
    
    @PostConstruct
    public void initData() {
        // 如果数据库中没有传承人数据，则添加演示数据
        if (inheritorRepository.count() == 0) {
            // 添加传承人演示数据，使用正确的静态资源路径
            Inheritor inheritor1 = new Inheritor();
            inheritor1.setName("张明远");
            inheritor1.setSkill("剪纸技艺");
            inheritor1.setDescription("从事剪纸艺术30余年，国家级非物质文化遗产传承人");
            inheritor1.setImageUrl("/uploads/masters_InheritorCommunit/master_jianzhi.jpg");
            inheritor1.setLevel("国家级传承人");
            saveInheritor(inheritor1);
            
            Inheritor inheritor2 = new Inheritor();
            inheritor2.setName("李静美");
            inheritor2.setSkill("景泰蓝工艺");
            inheritor2.setDescription("景泰蓝工艺大师，作品多次获得国家级奖项");
            inheritor2.setImageUrl("/uploads/masters_InheritorCommunit/master_jingjumei.jpg");
            inheritor2.setLevel("省级传承人");
            saveInheritor(inheritor2);
            
            Inheritor inheritor3 = new Inheritor();
            inheritor3.setName("王景泰");
            inheritor3.setSkill("京绣工艺");
            inheritor3.setDescription("京绣传统工艺传承者，致力于推广传统刺绣文化");
            inheritor3.setImageUrl("/uploads/masters_InheritorCommunit/master_jingtai.jpg");
            inheritor3.setLevel("市级传承人");
            saveInheritor(inheritor3);
            
            Inheritor inheritor4 = new Inheritor();
            inheritor4.setName("陈俊瓷");
            inheritor4.setSkill("钧瓷制作");
            inheritor4.setDescription("钧瓷工艺大师，掌握传统制瓷技艺精髓");
            inheritor4.setImageUrl("/uploads/masters_InheritorCommunit/master_junci.jpg");
            inheritor4.setLevel("国家级传承人");
            saveInheritor(inheritor4);
            
            Inheritor inheritor5 = new Inheritor();
            inheritor5.setName("刘素秀");
            inheritor5.setSkill("苏绣工艺");
            inheritor5.setDescription("苏绣技法传承人，作品精美绝伦，享誉海内外");
            inheritor5.setImageUrl("/uploads/masters_InheritorCommunit/master_suxiu.jpg");
            inheritor5.setLevel("国家级传承人");
            saveInheritor(inheritor5);
        }
    }
}