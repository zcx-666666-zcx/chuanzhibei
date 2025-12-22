package com.example.demo.service;

import com.example.demo.entity.News;
import com.example.demo.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NewsService {
    
    @Autowired
    private NewsRepository newsRepository;
    
    /**
     * 初始化示例新闻数据
     */
    @PostConstruct
    public void initSampleNews() {
        System.out.println("开始初始化新闻数据...");
        try {
            // 检查是否已有数据，如果有则删除
            long count = newsRepository.count();
            System.out.println("当前新闻数量: " + count);
            
            // 清空现有数据并重新插入示例数据（开发阶段这样做是为了确保数据一致性）
            if (count > 0) {
                System.out.println("清空现有新闻数据...");
                newsRepository.deleteAll();
            }
            
            System.out.println("开始插入示例数据...");
            List<News> sampleNews = new ArrayList<>();
            
            // 确保ID从1开始，并与轮播图ID匹配
            News news1 = new News(
                1L,
                "2024年全国非遗文化节",
                "传承经典，弘扬中华文化",
                "全国非遗文化节是一场盛大的文化庆典，汇聚了全国各地的非物质文化遗产项目。\n\n今年的文化节特别推出了数字化展示区，通过VR技术让观众身临其境地体验传统工艺的魅力。\n\n文化节期间还将举办多场大师工作坊，让公众有机会近距离接触非遗传承人，学习传统技艺。",
                "/uploads/news_index/news_1.jpg,/uploads/news_index/news_2.jpg"
            );
            
            News news2 = new News(
                2L,
                "陶瓷技艺入选世界非遗名录",
                "景德镇陶瓷烧制技艺列入人类非遗代表作名录",
                "经过多年的努力，景德镇陶瓷烧制技艺终于成功入选联合国教科文组织人类非物质文化遗产代表作名录。\n\n这一成就不仅是对景德镇千年陶瓷文化的认可，也为中国非遗保护工作树立了新的标杆。\n\n未来，相关部门将进一步加强对陶瓷技艺的保护和传承，培养更多年轻传承人。",
                "/uploads/news_index/news_3.jpg,/uploads/news_index/news_4.jpg"
            );
            
            News news3 = new News(
                3L,
                "剪纸艺术进校园活动",
                "全国范围内开展剪纸艺术进校园系列活动",
                "为了更好地传承和发扬剪纸艺术，文化和旅游部联合教育部在全国范围内启动了剪纸艺术进校园活动。\n\n活动将邀请知名剪纸艺术家走进大中小学，通过现场教学和互动体验的方式，让学生们感受传统艺术的魅力。\n\n预计全年将覆盖超过1000所学校，惠及数十万学生。",
                "/uploads/news_index/news_5.jpg,/uploads/news_index/news_6.jpg"
            );
            
            News news4 = new News(
                4L,
                "传统工艺创新大赛",
                "展现新时代工匠精神",
                "2024年传统工艺创新大赛吸引了来自全国各地的工艺师参与，参赛作品涵盖了陶瓷、刺绣、木雕等多个领域。\n\n大赛评委团由国家级工艺大师和设计专家组成，评选标准不仅注重传统技艺的传承，更强调创新元素的融入。\n\n获奖作品将在全国巡展，并有机会被国家博物馆收藏。",
                "/uploads/news_index/news_7.jpg,/uploads/news_index/news_8.jpg"
            );
            
            News news5 = new News(
                5L,
                "非遗文化宣传周",
                "让更多人了解和热爱传统文化",
                "非遗文化宣传周旨在提高公众对非物质文化遗产的认知和保护意识。\n\n活动周期间将在各大城市举办主题展览、非遗市集、文化讲座等丰富多彩的活动。\n\n通过线上线下相结合的方式，让更多人能够参与到非遗保护和传承中来。",
                "/uploads/news_index/news_9.jpg,/uploads/news_index/news_10.jpg"
            );
            
            sampleNews.add(news1);
            sampleNews.add(news2);
            sampleNews.add(news3);
            sampleNews.add(news4);
            sampleNews.add(news5);
            
            System.out.println("准备保存 " + sampleNews.size() + " 条新闻数据");
            List<News> savedNews = newsRepository.saveAll(sampleNews);
            System.out.println("成功保存 " + savedNews.size() + " 条新闻数据");
            
            // 验证数据是否正确保存
            List<News> allNews = newsRepository.findAll();
            System.out.println("验证数据:");
            for (News news : allNews) {
                System.out.println("ID: " + news.getId() + ", Title: " + news.getTitle());
            }
        } catch (Exception e) {
            System.err.println("初始化新闻数据时发生错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 根据ID获取新闻详情
     * @param id 新闻ID
     * @return 新闻对象
     */
    public News getNewsById(Long id) {
        System.out.println("NewsService.getNewsById 被调用，ID: " + id);
        
        if (id == null) {
            System.out.println("ID 为 null");
            return null;
        }
        
        try {
            Optional<News> newsOptional = newsRepository.findById(id);
            System.out.println("通过 findById 查找结果: " + newsOptional);
            
            if (newsOptional.isPresent()) {
                return newsOptional.get();
            }
            
            // 如果findById找不到，尝试通过findAll查找
            List<News> allNews = getAllNews();
            System.out.println("getAllNews 结果: " + allNews);
            
            return allNews.stream()
                    .filter(news -> news.getId() != null && news.getId().equals(id))
                    .findFirst()
                    .orElse(null);
        } catch (Exception e) {
            System.out.println("查找新闻时发生异常: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 获取所有新闻
     * @return 新闻列表
     */
    public List<News> getAllNews() {
        try {
            List<News> newsList = newsRepository.findAll();
            System.out.println("NewsService.getAllNews 返回 " + newsList.size() + " 条记录");
            return newsList;
        } catch (Exception e) {
            System.out.println("获取所有新闻时发生异常: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    /**
     * 根据关键词搜索新闻
     * @param keyword 搜索关键词
     * @return 匹配的新闻列表
     */
    public List<News> searchByKeyword(String keyword) {
        // 简单实现，实际应该使用JPA查询
        List<News> allNews = getAllNews();
        List<News> result = new ArrayList<>();
        for (News news : allNews) {
            if (news.getTitle().contains(keyword) || news.getDescription().contains(keyword)) {
                result.add(news);
            }
        }
        return result;
    }
}