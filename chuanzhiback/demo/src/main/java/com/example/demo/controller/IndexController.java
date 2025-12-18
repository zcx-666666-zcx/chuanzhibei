package com.example.demo.controller;

import com.example.demo.entity.Banner;
import com.example.demo.entity.Heritage;
import com.example.demo.service.BannerService;
import com.example.demo.service.HeritageService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/index")
@CrossOrigin(origins = "*")
public class IndexController {

    @Autowired
    private BannerService bannerService;
    
    @Autowired
    private HeritageService heritageService;

    /**
     * 获取首页轮播图数据
     */
    @GetMapping("/banner")
    public ResponseEntity<Result<List<Banner>>> getBannerData() {
        List<Banner> banners = bannerService.getAllBanners();
        // 为每个banner添加target_type和target_path字段
        for (Banner banner : banners) {
            // 默认跳转到遗产详情页，实际应根据具体业务设置
            banner.setTargetType(1); // 1表示内部页面跳转
            banner.setTargetPath("/pages/Heritage/Heritage?id=" + banner.getId()); // 默认跳转路径
        }
        return ResponseEntity.ok(Result.success(banners));
    }

    /**
     * 获取首页推荐非遗项目数据
     */
    @GetMapping("/recommend-heritage")
    public ResponseEntity<Result<List<Heritage>>> getRecommendHeritageData() {
        List<Heritage> heritages = heritageService.getRecommendedHeritages();
        return ResponseEntity.ok(Result.success(heritages));
    }
}