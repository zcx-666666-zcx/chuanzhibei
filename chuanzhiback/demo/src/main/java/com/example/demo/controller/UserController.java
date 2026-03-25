package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.net.URI;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Result<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(Result.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result<User>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(Result.success(user));
        } else {
            return ResponseEntity.ok(Result.error("用户不存在"));
        }
    }

    @PostMapping
    public ResponseEntity<Result<User>> createUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        return ResponseEntity.ok(Result.success("用户创建成功", savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result<User>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> userDetails) {
        User user = userService.getUserById(id);
        if (user != null) {
            // 如果更新头像，先删除旧头像文件
            if (userDetails.containsKey("avatarUrl")) {
                String oldAvatarUrl = user.getAvatarUrl();
                String newAvatarUrl = (String) userDetails.get("avatarUrl");
                
                // 删除旧头像文件（如果存在且不是默认头像）
                if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty() && !oldAvatarUrl.equals(newAvatarUrl)) {
                    try {
                        // 从 URL 或相对路径中提取资源路径，避免依赖固定域名/端口
                        String filePath = extractPath(oldAvatarUrl);
                        
                        // 检查是否是avatars目录下的文件
                        if (filePath != null && filePath.startsWith("/uploads/avatars/")) {
                            // 构建完整文件路径
                            String relativePath = filePath.substring(1); // 去掉开头的"/"
                            Path oldFilePath = Paths.get(relativePath);
                            
                            // 如果文件存在，删除它
                            if (Files.exists(oldFilePath)) {
                                Files.delete(oldFilePath);
                                System.out.println("已删除旧头像文件: " + oldFilePath);
                            }
                        }
                    } catch (IOException e) {
                        // 删除失败不影响更新操作，只记录日志
                        System.err.println("删除旧头像文件失败: " + e.getMessage());
                    }
                }
                
                user.setAvatarUrl(newAvatarUrl);
            }
            
            // 只更新提供的字段，不覆盖未提供的字段
            if (userDetails.containsKey("nickname")) {
                user.setNickname((String) userDetails.get("nickname"));
            }
            if (userDetails.containsKey("signature")) {
                user.setSignature((String) userDetails.get("signature"));
            }
            if (userDetails.containsKey("gender")) {
                user.setGender((String) userDetails.get("gender"));
            }
            if (userDetails.containsKey("country")) {
                user.setCountry((String) userDetails.get("country"));
            }
            if (userDetails.containsKey("province")) {
                user.setProvince((String) userDetails.get("province"));
            }
            if (userDetails.containsKey("city")) {
                user.setCity((String) userDetails.get("city"));
            }
            if (userDetails.containsKey("language")) {
                user.setLanguage((String) userDetails.get("language"));
            }
            if (userDetails.containsKey("email")) {
                user.setEmail((String) userDetails.get("email"));
            }
            user.setUpdateTime(java.time.LocalDateTime.now());
            
            User updatedUser = userService.saveUser(user);
            return ResponseEntity.ok(Result.success("用户更新成功", updatedUser));
        } else {
            return ResponseEntity.ok(Result.error("用户不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Result<String>> deleteUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            userService.deleteUser(id);
            return ResponseEntity.ok(Result.success("删除成功", ""));
        } else {
            return ResponseEntity.ok(Result.error("用户不存在"));
        }
    }

    @GetMapping("/openid/{openid}")
    public ResponseEntity<Result<User>> getUserByOpenid(@PathVariable String openid) {
        User user = userService.getUserByOpenid(openid);
        if (user != null) {
            return ResponseEntity.ok(Result.success(user));
        } else {
            return ResponseEntity.ok(Result.error("用户不存在"));
        }
    }
    
    private String extractPath(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            URI uri = URI.create(value);
            if (uri.isAbsolute()) {
                return uri.getPath();
            }
        } catch (IllegalArgumentException ignored) {
            // value 可能是相对路径，继续按原值处理
        }
        return value.startsWith("/") ? value : "/" + value;
    }
    
}