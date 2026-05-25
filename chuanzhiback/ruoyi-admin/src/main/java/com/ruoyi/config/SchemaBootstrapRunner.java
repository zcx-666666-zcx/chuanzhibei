package com.ruoyi.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * ruoyi-admin 启动时自动执行统一数据库初始化脚本。
 */
@Component
@Order(10)
public class SchemaBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaBootstrapRunner.class);

    @Value("${app.db.schema-bootstrap.enabled:true}")
    private boolean enabled;

    private final DataSource dataSource;

    public SchemaBootstrapRunner(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("schema-bootstrap 已关闭，跳过数据库初始化");
            return;
        }

        Path sqlPath = Paths.get(System.getProperty("user.dir"), "chuanzhiback", "demo", "src", "main", "resources", "schema-bootstrap.sql");
        if (!Files.exists(sqlPath)) {
            sqlPath = Paths.get(System.getProperty("user.dir"), "demo", "src", "main", "resources", "schema-bootstrap.sql");
        }
        if (!Files.exists(sqlPath)) {
            log.warn("未找到统一 SQL 文件 schema-bootstrap.sql，跳过数据库初始化");
            return;
        }
        FileSystemResource resource = new FileSystemResource(sqlPath);

        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(resource);
        populator.setSqlScriptEncoding("UTF-8");
        populator.setSeparator(";");
        populator.setContinueOnError(true);

        try {
            DatabasePopulatorUtils.execute(populator, dataSource);
            log.info("ruoyi-admin 已执行统一数据库初始化脚本: {}", sqlPath);
        } catch (Exception e) {
            log.error("执行 schema-bootstrap.sql 失败: {}", e.getMessage(), e);
        }
    }
}
