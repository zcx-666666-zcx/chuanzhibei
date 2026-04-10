package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * 启动时执行 classpath:schema-bootstrap.sql。
 * 全部为 CREATE TABLE IF NOT EXISTS，表已存在则跳过；配合 continue-on-error 避免重复执行时的非致命告警。
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
            log.debug("schema-bootstrap 已关闭（app.db.schema-bootstrap.enabled=false）");
            return;
        }
        var resource = new ClassPathResource("schema-bootstrap.sql");
        if (!resource.exists()) {
            log.warn("未找到 classpath:schema-bootstrap.sql，跳过建表脚本");
            return;
        }
        var populator = new ResourceDatabasePopulator();
        populator.addScript(resource);
        populator.setSqlScriptEncoding("UTF-8");
        populator.setSeparator(";");
        populator.setContinueOnError(true);
        try {
            DatabasePopulatorUtils.execute(populator, dataSource);
            log.info("已执行 schema-bootstrap.sql（幂等建表，已存在表将被跳过）");
        } catch (Exception e) {
            log.error("执行 schema-bootstrap.sql 时出错: {}", e.getMessage());
        }
    }
}
