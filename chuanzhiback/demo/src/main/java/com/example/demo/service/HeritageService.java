package com.example.demo.service;

import com.example.demo.entity.Heritage;
import com.example.demo.repository.HeritageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Service
public class HeritageService {
    
    @Autowired
    private HeritageRepository heritageRepository;
    
    public List<Heritage> getAllHeritages() {
        return heritageRepository.findAll();
    }
    
    public List<Heritage> getHeritagesByLevel(Integer level) {
        return heritageRepository.findByLevel(level);
    }
    
    public List<Heritage> getHeritagesByCategory(String category) {
        return heritageRepository.findByCategory(category);
    }
    
    public List<Heritage> getRecommendedHeritages() {
        return heritageRepository.findTop4ByOrderByIdAsc();
    }
    
    public Heritage getHeritageById(Long id) {
        return heritageRepository.findById(id).orElse(null);
    }
    
    public Heritage saveHeritage(Heritage heritage) {
        return heritageRepository.save(heritage);
    }
    
    public void deleteHeritage(Long id) {
        heritageRepository.deleteById(id);
    }

    /**
     * 初始化示例非遗项目数据（用于首页推荐与详情演示）
     * 会清空原有 heritage 表数据，请仅在开发环境使用。
     */
    @PostConstruct
    public void initSampleHeritages() {
        try {
            long count = heritageRepository.count();
            System.out.println("当前 heritage 表记录数: " + count);

            // 开发阶段：清空原数据，重新插入示例
            if (count > 0) {
                System.out.println("清空现有 heritage 数据...");
                heritageRepository.deleteAll();
            }

            List<Heritage> list = new ArrayList<>();

            // 书法
            Heritage calligraphy = new Heritage(
                "书法",
                "书法是以毛笔为主要书写工具，在纸、绢等载体上书写汉字的一种传统艺术形式，强调“笔墨纸砚”的综合运用与书写者气韵的统一。",
                "/uploads/heritage_index/recommend_heritage_shufa.jpg",
                "中国各地",
                "art",   // 传统美术
                1       // 国家级
            );

            // 刺绣
            Heritage embroidery = new Heritage(
                "刺绣",
                "刺绣是以丝线在布面上进行图案装饰的传统手工技艺，通过多种针法的组合，呈现出细腻而富有层次感的纹样。",
                "/uploads/heritage_index/recommend_heritage_cixiu.jpg",
                "江苏、湖南、四川、广东等地",
                "craft",   // 传统技艺
                1
            );

            // 中医药
            Heritage traditionalMedicine = new Heritage(
                "中医药",
                "中医药以整体观念和辨证论治为核心，融合了草本药物、针灸推拿、食疗养生等多种实践经验，是中华文明的重要组成部分。",
                "/uploads/heritage_index/recommend_heritage_zhongyiyao.jpg",
                "中国各地",
                "medicine",   // 传统医药
                1
            );

            // 武术
            Heritage martialArts = new Heritage(
                "武术",
                "武术起源于生产劳作和自卫防身，既是一种技击之术，也是修身养性的文化载体，讲究形神兼备、内外合一。",
                "/uploads/heritage_index/recommend_heritage_wushu.jpg",
                "中国各地",
                "dance",   // 这里归入身段动作类，可在前端映射为“武术/身段”
                1
            );

            list.add(calligraphy);
            list.add(embroidery);
            list.add(traditionalMedicine);
            list.add(martialArts);

            List<Heritage> saved = heritageRepository.saveAll(list);
            System.out.println("初始化 heritage 示例数据完成，数量: " + saved.size());
        } catch (Exception e) {
            System.err.println("初始化 heritage 示例数据时发生错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
}