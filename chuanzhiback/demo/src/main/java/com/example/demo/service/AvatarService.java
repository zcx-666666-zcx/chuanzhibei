package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AvatarService {
    
    private static final String UPLOAD_DIR = "uploads/avatars/";
    private static final String DICEBEAR_API_BASE = "https://api.dicebear.com/7.x/adventurer/svg?seed=";
    
    /**
     * 从 DiceBear API 生成并下载头像
     * @param seed 用于生成头像的种子（可以是用户名或其他唯一标识）
     * @return 保存的头像文件路径（相对于 uploads 目录）
     */
    public String generateAndSaveAvatar(String seed) {
        try {
            // 如果 seed 为空，使用随机 UUID
            if (seed == null || seed.isEmpty()) {
                seed = UUID.randomUUID().toString();
            }
            
            // 构建 DiceBear API URL（对 seed 进行 URL 编码）
            String encodedSeed = URLEncoder.encode(seed, StandardCharsets.UTF_8);
            String apiUrl = DICEBEAR_API_BASE + encodedSeed;
            
            // 创建上传目录（如果不存在）
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 生成唯一文件名
            String filename = UUID.randomUUID().toString() + ".svg";
            Path filePath = uploadPath.resolve(filename);
            
            // 从 API 下载头像
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            // 检查响应码
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("Failed to download avatar: HTTP " + responseCode);
            }
            
            // 读取响应数据并保存到文件
            try (InputStream inputStream = connection.getInputStream()) {
                Files.copy(inputStream, filePath);
            }
            
            // 返回文件路径（相对于 uploads 目录）
            return "/uploads/avatars/" + filename;
            
        } catch (Exception e) {
            e.printStackTrace();
            // 如果下载失败，返回空字符串或默认头像路径
            return "";
        }
    }
}

