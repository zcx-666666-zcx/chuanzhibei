package com.example.demo.controller;

import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${app.upload.base-dir:../uploads}")
    private String uploadBaseDir;

    /**
     * 上传图片文件（兼容多种路径）
     * @param file 上传的文件
     * @param type 文件类型（可选，如：avatar）
     * @return 上传结果和文件访问URL
     */
    @PostMapping({"/upload-image", "/upload"})
    public ResponseEntity<Result<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type) {
        // 检查文件是否为空
        if (file.isEmpty()) {
            return ResponseEntity.ok(Result.error("上传文件不能为空"));
        }

        try {
            // 检查上传目录是否存在，不存在则创建
            Path uploadPath = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 根据type参数决定保存目录
            String subDir = "";
            if (type != null && !type.isEmpty()) {
                if ("avatar".equals(type)) {
                    subDir = "avatars/";
                } else if ("post".equals(type)) {
                    subDir = "posts/";
                } else if ("3d".equals(type)) {
                    subDir = "3D/";
                }
            }

            if ("3d".equals(type)) {
                String originalFilename = file.getOriginalFilename();
                String lowerName = originalFilename == null ? "" : originalFilename.toLowerCase();
                if (!(lowerName.endsWith(".glb") || lowerName.endsWith(".gltf"))) {
                    return ResponseEntity.ok(Result.error("3D 模型仅支持 .glb 或 .gltf 文件"));
                }
            }
            
            // 创建子目录（如果指定）
            Path finalUploadPath = uploadPath;
            if (!subDir.isEmpty()) {
                finalUploadPath = uploadPath.resolve(subDir);
                if (!Files.exists(finalUploadPath)) {
                    Files.createDirectories(finalUploadPath);
                }
            }

            // 获取原始文件名
            String originalFilename = file.getOriginalFilename();
            
            // 生成唯一文件名
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            // 构建文件保存路径
            Path filePath = finalUploadPath.resolve(uniqueFilename);
            
            // 保存文件
            Files.write(filePath, file.getBytes());
            
            // 构造文件访问URL
            String fileUrl = "/uploads/" + subDir + uniqueFilename;
            
            // 返回结果
            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", fileUrl);
            responseData.put("filename", uniqueFilename);
            
            return ResponseEntity.ok(Result.success("文件上传成功", responseData));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.ok(Result.error("文件上传失败: " + e.getMessage()));
        }
    }
}
