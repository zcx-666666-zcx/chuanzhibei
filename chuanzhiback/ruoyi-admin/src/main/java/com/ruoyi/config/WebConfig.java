package com.ruoyi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 配置（CORS + 静态资源映射）
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 跨域过滤器
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    /**
     * 静态资源映射 — 上传文件目录
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 上传文件访问映射
        registry.addResourceHandler("/profile/**")
                .addResourceLocations("file:/tmp/ruoyi/uploadPath/");
        // Swagger UI 静态资源
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/");
    }
}
