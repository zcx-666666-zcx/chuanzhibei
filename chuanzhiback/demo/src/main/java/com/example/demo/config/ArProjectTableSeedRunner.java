package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * 将 uploads 目录下真实 AR 视频/封面路径写入 ar_project 表（与 {@code seed-ar-project-from-uploads.sql} 一致）。
 * 仅在开启示例数据初始化时执行，避免生产误写。
 */
@Component
@Order(25)
@ConditionalOnProperty(prefix = "app.data", name = "init-sample", havingValue = "true")
public class ArProjectTableSeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ArProjectTableSeedRunner.class);

    @Value("${app.data.seed-ar-project-table:true}")
    private boolean seedArProjectTable;

    private final DataSource dataSource;

    public ArProjectTableSeedRunner(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedArProjectTable) {
            log.debug("跳过 ar_project 表种子数据（app.data.seed-ar-project-table=false）");
            return;
        }
        var resource = new ClassPathResource("seed-ar-project-from-uploads.sql");
        if (!resource.exists()) {
            log.warn("未找到 classpath:seed-ar-project-from-uploads.sql");
            return;
        }
        var populator = new ResourceDatabasePopulator();
        populator.addScript(resource);
        populator.setSqlScriptEncoding("UTF-8");
        populator.setSeparator(";");
        populator.setContinueOnError(true);
        try {
            DatabasePopulatorUtils.execute(populator, dataSource);
            log.info("已执行 seed-ar-project-from-uploads.sql（与 uploads 资源路径对齐）");
        } catch (Exception e) {
            log.warn("执行 ar_project 种子 SQL 时出错（表不存在时可忽略）: {}", e.getMessage());
        }
    }
}
