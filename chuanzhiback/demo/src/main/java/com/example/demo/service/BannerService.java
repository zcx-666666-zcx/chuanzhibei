package com.example.demo.service;

import com.example.demo.entity.Banner;
import com.example.demo.repository.BannerRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BannerService {
    
    @Autowired
    private BannerRepository bannerRepository;

    @Value("${app.data.init-sample:false}")
    private boolean initSampleData;

    /**
     * 初始化示例轮播图数据（用于首页演示）
     * 仅在 init-sample=true 且 banner 表为空时写入，避免覆盖真实数据。
     */
    @PostConstruct
    public void initSampleBanners() {
        if (!initSampleData) {
            System.out.println("跳过 banner 示例数据初始化，使用数据库真实数据");
            return;
        }

        try {
            long count = bannerRepository.count();
            System.out.println("当前 banner 表记录数: " + count);
            if (count > 0) {
                System.out.println("banner 表已有数据，跳过示例数据写入");
                return;
            }

            List<Banner> list = new ArrayList<>();
            list.add(new Banner(
                    "2024年全国非遗文化节",
                    "传承经典，弘扬中华文化",
                    "/uploads/banners_index/banner_1.jpg",
                    1L
            ));
            list.add(new Banner(
                    "陶瓷技艺入选世界非遗名录",
                    "景德镇陶瓷烧制技艺列入人类非遗代表作名录",
                    "/uploads/banners_index/banner_2.jpg",
                    2L
            ));
            list.add(new Banner(
                    "剪纸艺术进校园活动",
                    "全国范围内开展剪纸艺术进校园系列活动",
                    "/uploads/banners_index/banner_3.png",
                    3L
            ));
            list.add(new Banner(
                    "传统工艺创新大赛",
                    "展现新时代工匠精神",
                    "/uploads/banners_index/banner_4.jpg",
                    4L
            ));
            list.add(new Banner(
                    "非遗文化宣传周",
                    "让更多人了解和热爱传统文化",
                    "/uploads/banners_index/banner_5.jpg",
                    5L
            ));

            bannerRepository.saveAll(list);
            System.out.println("初始化 banner 示例数据完成，数量: " + list.size());
        } catch (Exception e) {
            System.err.println("初始化 banner 示例数据时发生错误: " + e.getMessage());
        }
    }
    
    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByCreateTimeDesc();
    }
    
    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id).orElse(null);
    }
    
    public Banner saveBanner(Banner banner) {
        return bannerRepository.save(banner);
    }
    
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
