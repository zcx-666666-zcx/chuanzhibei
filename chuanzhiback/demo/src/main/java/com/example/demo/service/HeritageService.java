package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Heritage;
import com.example.demo.repository.HeritageRepository;

import jakarta.annotation.PostConstruct;

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

            // ========== 传统美术 (art) ==========
            list.add(calligraphy);  // 国家级
            
            // 年画（省级）
            Heritage newYearPainting = new Heritage(
                "木版年画",
                "木版年画是中国传统民间绘画艺术，以木版雕刻印刷技法制作，题材多反映民间生活、神话传说和祈福寓意，色彩鲜艳，构图饱满，具有浓郁的地方特色和民俗文化内涵。",
                "/uploads/heritage_index/recommend_heritage_shufa.jpg",
                "天津、河北、山东等地",
                "art",
                2  // 省级
            );
            list.add(newYearPainting);

            // ========== 传统技艺 (craft) ==========
            list.add(embroidery);  // 国家级
            
            // 紫砂陶制作技艺（省级）
            Heritage purpleClayPottery = new Heritage(
                "紫砂陶制作技艺",
                "紫砂陶制作技艺是以江苏宜兴特有的紫砂泥为原料，通过手工成型、雕刻、烧制等工艺制作茶具、文玩的艺术形式，以其独特的透气性和美观的造型深受茶文化爱好者喜爱。",
                "/uploads/heritage_index/recommend_heritage_zishatao.jpg",
                "江苏宜兴",
                "craft",
                2  // 省级
            );
            list.add(purpleClayPottery);

            // ========== 传统医药 (medicine) ==========
            list.add(traditionalMedicine);  // 国家级
            
            // 传统推拿疗法（省级）
            Heritage traditionalMassage = new Heritage(
                "传统推拿疗法",
                "传统推拿疗法是中国传统医学的重要组成部分，通过手法按摩、点穴、拔罐等方式调理气血、疏通经络，在治疗颈椎病、腰腿痛等常见病方面有着独特的疗效和丰富的临床经验。",
                "/uploads/heritage_index/recommend_heritage_zhongyiyao.jpg",
                "北京、上海、广东等地",
                "medicine",
                2  // 省级
            );
            list.add(traditionalMassage);

            // ========== 传统舞蹈 (dance) ==========
            list.add(martialArts);  // 国家级
            
            // 秧歌舞（省级）
            Heritage yangkoDance = new Heritage(
                "秧歌舞",
                "秧歌舞是流行于中国北方的传统民间舞蹈，起源于农业生产劳动，表演形式活泼欢快，动作幅度大，节奏感强，多在节庆、庙会等场合表演，体现了劳动人民乐观向上的精神风貌。",
                "/uploads/heritage_index/recommend_heritage_wushu.jpg",
                "东北、华北地区",
                "dance",
                2  // 省级
            );
            list.add(yangkoDance);

            // ========== 传统音乐 (music) ==========
            // 古琴艺术（国家级）
            Heritage guqinArt = new Heritage(
                "古琴艺术",
                "古琴是中国最古老的弹拨乐器之一，有着三千多年的历史，其音色清雅、意境深远，被视为文人雅士修身养性的重要媒介。古琴艺术不仅包括演奏技法，还涵盖琴曲创作、琴学理论、斫琴工艺等完整体系。",
                "/uploads/heritage_index/recommend_heritage_shufa.jpg",
                "中国各地",
                "music",
                1  // 国家级
            );
            list.add(guqinArt);
            
            // 江南丝竹（省级）
            Heritage jiangnanSizhu = new Heritage(
                "江南丝竹",
                "江南丝竹是流行于江苏、浙江、上海等地的传统器乐合奏形式，以丝弦乐器和竹管乐器为主，曲调优美婉转，具有浓郁的江南水乡特色，常与民间节庆、婚丧嫁娶等民俗活动相结合。",
                "/uploads/heritage_index/recommend_heritage_jingdezhenciqi.jpg",
                "江苏、浙江、上海",
                "music",
                2  // 省级
            );
            list.add(jiangnanSizhu);

            // ========== 传统戏剧 (drama) ==========
            // 京剧（国家级）
            Heritage beijingOpera = new Heritage(
                "京剧",
                "京剧是中国戏曲艺术的集大成者，形成于清代，以唱、念、做、打为主要表演手段，角色行当分工明确，脸谱、服饰、程式动作等都有严格的规范，被誉为“国粹”，在国内外享有盛誉。",
                "/uploads/heritage_index/recommend_heritage_jingtai.jpg",
                "北京、天津、上海等地",
                "drama",
                1  // 国家级
            );
            list.add(beijingOpera);
            
            // 黄梅戏（省级）
            Heritage huangmeiOpera = new Heritage(
                "黄梅戏",
                "黄梅戏是安徽省主要地方戏曲剧种之一，唱腔优美动听，表演朴实自然，以《天仙配》《女驸马》等经典剧目闻名。其音乐风格清新流畅，贴近生活，深受广大观众喜爱，被誉为“中国最美的乡村音乐”。",
                "/uploads/heritage_index/recommend_heritage_cixiu.jpg",
                "安徽、湖北",
                "drama",
                2  // 省级
            );
            list.add(huangmeiOpera);

            // ========== 民俗 (folklore) ==========
            // 春节（国家级）
            Heritage springFestival = new Heritage(
                "春节",
                "春节是中国最重要的传统节日，已有四千多年的历史，是人们辞旧迎新、祈福纳祥的重要时刻。春节习俗包括贴春联、放鞭炮、吃年夜饭、拜年、舞龙舞狮等，凝聚了中华民族的文化认同和情感纽带。",
                "/uploads/heritage_index/recommend_heritage_shujin.jpg",
                "中国各地及海外华人社区",
                "folklore",
                1  // 国家级
            );
            list.add(springFestival);
            
            // 庙会（省级）
            Heritage templeFair = new Heritage(
                "传统庙会",
                "传统庙会是中国民间传统的集市和娱乐活动，通常在寺庙、道观附近举办，集商贸、文化、娱乐于一体。庙会上有各种传统小吃、手工艺品、民间表演，是人们社交、娱乐、购物的重要场所，体现了浓厚的民俗文化氛围。",
                "/uploads/heritage_index/recommend_heritage_wushu.jpg",
                "北京、河北、河南、山东等地",
                "folklore",
                2  // 省级
            );
            list.add(templeFair);

            List<Heritage> saved = heritageRepository.saveAll(list);
            System.out.println("初始化 heritage 示例数据完成，数量: " + saved.size());
        } catch (Exception e) {
            System.err.println("初始化 heritage 示例数据时发生错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
}