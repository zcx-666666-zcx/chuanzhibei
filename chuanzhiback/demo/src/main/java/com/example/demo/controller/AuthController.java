package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.security.TokenService;
import com.example.demo.service.UserService;
import com.example.demo.service.AvatarService;
import com.example.demo.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AvatarService avatarService;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<Result<Map<String, Object>>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        String openid = loginData.get("openid");
        String wxCode = loginData.get("wxCode");
        if ((openid == null || openid.isEmpty()) && wxCode != null && !wxCode.isEmpty()) {
            // 演示环境下以微信 code 构造稳定标识；生产应改为 code2session 获取真实 openid
            openid = "wx_" + wxCode;
        }
        
        User user = null;
        
        // 如果提供了openid，使用微信登录方式
        if (openid != null && !openid.isEmpty()) {
            user = userService.getUserByOpenid(openid);
            
            // 如果用户不存在，则创建新用户
            if (user == null) {
                user = new User();
                user.setOpenid(openid);
                String nickname = loginData.getOrDefault("nickname", "默认用户");
                user.setNickname(nickname);
                // 如果提供了头像URL，使用提供的；否则生成新头像
                String providedAvatarUrl = loginData.getOrDefault("avatarUrl", "");
                String avatarUrl = "";
                if (providedAvatarUrl != null && !providedAvatarUrl.isEmpty()) {
                    avatarUrl = providedAvatarUrl;
                } else {
                    // 使用 openid 或 nickname 作为种子生成头像
                    avatarUrl = avatarService.generateAndSaveAvatar(openid + nickname);
                }
                user.setAvatarUrl(avatarUrl);
                user.setGender(loginData.getOrDefault("gender", ""));
                user.setCountry(loginData.getOrDefault("country", ""));
                user.setProvince(loginData.getOrDefault("province", ""));
                user.setCity(loginData.getOrDefault("city", ""));
                user.setLanguage(loginData.getOrDefault("language", ""));
                user.setCreateTime(LocalDateTime.now());
                user.setUpdateTime(LocalDateTime.now());
                user = userService.saveUser(user);
            }
        } 
        // 如果提供了用户名和密码，使用传统登录方式
        else if (username != null && !username.isEmpty() && password != null && !password.isEmpty()) {
            // 先尝试用username登录
            user = userService.getUserByUsername(username);
            
            // 如果username找不到，尝试用nickname登录
            if (user == null) {
                user = userService.getUserByNickname(username);
            }
            
            // 检查用户是否存在以及密码是否正确
            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
            }
        } 
        // 如果既没有openid也没有用户名密码，则返回错误
        else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "缺少必要的登录参数");
        }
        
        String token = tokenService.generateToken(user.getId());
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("user", user);
        
        return ResponseEntity.ok(Result.success("登录成功", responseData));
    }

    @PostMapping("/register")
    public ResponseEntity<Result<Map<String, Object>>> register(@RequestBody Map<String, String> registerData) {
        String username = registerData.get("username");
        String password = registerData.get("password");
        String email = registerData.get("email");
        String openid = registerData.get("openid");

        if ((openid == null || openid.isEmpty()) && (username == null || username.isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "用户名不能为空");
        }
        if (openid == null || openid.isEmpty()) {
            if (password == null || password.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "密码不能为空");
            }
        }
        
        // 检查用户名是否已存在
        if (username != null && !username.isEmpty()) {
            User existingUser = userService.getUserByUsername(username);
            if (existingUser != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "用户名已存在");
            }
        }
        
        // 检查openid是否已存在（微信登录用户）
        if (openid != null && !openid.isEmpty()) {
            User existingUser = userService.getUserByOpenid(openid);
            if (existingUser != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "用户已存在");
            }
        }
        
        // 创建新用户
        User newUser = new User();
        String avatarUrl = "";
        
        if (openid != null && !openid.isEmpty()) {
            // 微信登录注册
            newUser.setOpenid(openid);
            String nickname = registerData.getOrDefault("nickname", "默认用户");
            newUser.setNickname(nickname);
            // 如果提供了头像URL，使用提供的；否则生成新头像
            String providedAvatarUrl = registerData.getOrDefault("avatarUrl", "");
            if (providedAvatarUrl != null && !providedAvatarUrl.isEmpty()) {
                avatarUrl = providedAvatarUrl;
            } else {
                // 使用 openid 或 nickname 作为种子生成头像
                avatarUrl = avatarService.generateAndSaveAvatar(openid + nickname);
            }
            newUser.setAvatarUrl(avatarUrl);
            newUser.setGender(registerData.getOrDefault("gender", ""));
            newUser.setCountry(registerData.getOrDefault("country", ""));
            newUser.setProvince(registerData.getOrDefault("province", ""));
            newUser.setCity(registerData.getOrDefault("city", ""));
            newUser.setLanguage(registerData.getOrDefault("language", ""));
        } else {
            // 传统用户名密码注册
            newUser.setUsername(username);
            // 使用BCrypt加密密码
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setNickname(username); // 默认使用用户名作为昵称
            // 使用用户名作为种子生成头像
            avatarUrl = avatarService.generateAndSaveAvatar(username);
            newUser.setAvatarUrl(avatarUrl);
        }
        newUser.setEmail(email);
        newUser.setCreateTime(LocalDateTime.now());
        newUser.setUpdateTime(LocalDateTime.now());
        
        // 保存用户
        User savedUser = userService.saveUser(newUser);
        
        String token = tokenService.generateToken(savedUser.getId());
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("user", savedUser);
        
        return ResponseEntity.ok(Result.success("注册成功", responseData));
    }

    @PostMapping("/logout")
    public ResponseEntity<Result<String>> logout() {
        return ResponseEntity.ok(Result.success("登出成功", ""));
    }
}