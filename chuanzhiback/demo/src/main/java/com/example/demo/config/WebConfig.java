package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-dir:../uploads}")
    private String uploadBaseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadLocation = Paths.get(uploadBaseDir).toAbsolutePath().normalize().toUri().toString();

        // 配置静态资源访问路径
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
        
        // 为传承人社区图片添加专门的映射
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations(uploadLocation);
    }
}