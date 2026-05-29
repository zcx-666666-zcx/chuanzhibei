package com.example.demo.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppClientConfigService {

    private final JdbcTemplate jdbcTemplate;

    public AppClientConfigService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getPublicClientConfig() {
        String sql = """
                SELECT config_key, config_value, config_type
                FROM app_client_config
                WHERE status = '0'
                ORDER BY sort_order ASC, id ASC
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String key = String.valueOf(row.get("config_key"));
            String type = String.valueOf(row.get("config_type"));
            String raw = row.get("config_value") == null ? "" : String.valueOf(row.get("config_value"));
            result.put(key, parseValue(type, raw));
        }
        return result;
    }

    private Object parseValue(String type, String raw) {
        if ("number".equalsIgnoreCase(type)) {
            try {
                if (raw.contains(".")) {
                    return Double.parseDouble(raw);
                }
                return Long.parseLong(raw);
            } catch (NumberFormatException ignored) {
                return raw;
            }
        }
        if ("boolean".equalsIgnoreCase(type)) {
            return "1".equals(raw) || "true".equalsIgnoreCase(raw);
        }
        return raw;
    }
}
