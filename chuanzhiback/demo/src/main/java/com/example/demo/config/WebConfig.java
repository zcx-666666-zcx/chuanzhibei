package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-dir:../uploads}")
    private String uploadBaseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String[] uploadLocations = resolveUploadLocations();

        // 配置静态资源访问路径
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocations);
        
        // 为传承人社区图片添加专门的映射
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations(uploadLocations);
    }

    private String[] resolveUploadLocations() {
        List<String> locations = new ArrayList<>();
        Path configured = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
        Path cwd = Paths.get(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();

        // 1) 用户显式配置（默认 ../uploads）
        addIfDirectory(locations, configured);
        // 2) 在仓库根目录启动时的常见路径
        addIfDirectory(locations, cwd.resolve("chuanzhiback/uploads").normalize());
        // 3) 在模块目录启动时的常见路径
        addIfDirectory(locations, cwd.resolve("../uploads").normalize());
        // 4) 直接放在当前工作目录下的 uploads
        addIfDirectory(locations, cwd.resolve("uploads").normalize());

        // 若均不存在，仍保留配置路径，便于后续动态创建目录后生效
        if (locations.isEmpty()) {
            locations.add(configured.toUri().toString());
        }
        return locations.toArray(new String[0]);
    }

    private void addIfDirectory(List<String> locations, Path path) {
        if (!Files.isDirectory(path)) {
            return;
        }
        String uri = path.toUri().toString();
        if (!locations.contains(uri)) {
            locations.add(uri);
        }
    }
}