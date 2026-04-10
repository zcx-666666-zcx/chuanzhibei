package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 生产环境启动前校验关键配置，避免弱密钥、http 公网地址或放开 CORS。
 */
@Component
@Profile("prod")
@Order(0)
public class ProductionEnvironmentValidator implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductionEnvironmentValidator.class);

    private static final String DEV_TOKEN_PLACEHOLDER = "dev-token-secret-change-in-prod";

    @Value("${app.auth.token-secret:}")
    private String tokenSecret;

    @Value("${app.public-base-url:}")
    private String publicBaseUrl;

    @Value("${app.cors.allowed-origin-patterns:}")
    private String corsPatterns;

    @Override
    public void run(ApplicationArguments args) {
        if (tokenSecret == null || tokenSecret.isBlank()) {
            throw new IllegalStateException("生产环境必须设置环境变量 TOKEN_SECRET（app.auth.token-secret）");
        }
        if (tokenSecret.length() < 32) {
            throw new IllegalStateException("生产环境 TOKEN_SECRET 长度建议不少于 32 字符");
        }
        if (DEV_TOKEN_PLACEHOLDER.equals(tokenSecret.trim())) {
            throw new IllegalStateException("生产环境禁止使用开发默认 TOKEN_SECRET，请更换为强随机密钥");
        }

        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            throw new IllegalStateException("生产环境必须设置 PUBLIC_BASE_URL（app.public-base-url），用于生成资源 URL，须为 https");
        }
        String base = publicBaseUrl.trim().toLowerCase();
        if (!base.startsWith("https://")) {
            throw new IllegalStateException("生产环境 PUBLIC_BASE_URL 必须使用 https:// 开头");
        }
        if (base.contains("localhost") || base.contains("127.0.0.1")) {
            log.warn("PUBLIC_BASE_URL 指向本机地址，若部署在公网请改为对外域名");
        }

        String cors = corsPatterns == null ? "" : corsPatterns.trim();
        if (cors.isEmpty()) {
            throw new IllegalStateException("生产环境必须设置 CORS_ALLOWED_ORIGIN_PATTERNS（逗号分隔），禁止使用空值");
        }
        if ("*".equals(cors)) {
            throw new IllegalStateException("生产环境 CORS 禁止使用通配符 *，请配置具体来源模式（如 https://servicewechat.com）");
        }

        log.info("生产环境关键配置校验通过");
    }
}
