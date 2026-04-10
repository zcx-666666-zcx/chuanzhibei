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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final int USERNAME_MIN_LEN = 2;
    private static final int USERNAME_MAX_LEN = 20;
    private static final int PASSWORD_MIN_LEN = 6;
    private static final int PASSWORD_MAX_LEN = 64;
    private static final int NICKNAME_MAX_LEN = 32;
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\u4e00-\\u9fa5]{2,20}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9][A-Za-z0-9.-]*\\.[A-Za-z]{2,}$");

    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AvatarService avatarService;

    @Autowired
    private TokenService tokenService;

    private void assertUsernameFormat(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "用户名不能为空");
        }
        String u = username.trim();
        if (u.length() < USERNAME_MIN_LEN || u.length() > USERNAME_MAX_LEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "用户名长度需在 " + USERNAME_MIN_LEN + "-" + USERNAME_MAX_LEN + " 个字符之间");
        }
        if (!USERNAME_PATTERN.matcher(u).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "用户名仅支持中文、字母、数字与下划线");
        }
    }

    private void assertPasswordFormat(String password) {
        if (password == null || password.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "密码不能为空");
        }
        if (password.length() < PASSWORD_MIN_LEN || password.length() > PASSWORD_MAX_LEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "密码长度需在 " + PASSWORD_MIN_LEN + "-" + PASSWORD_MAX_LEN + " 位之间");
        }
    }

    private void assertEmailOptional(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        String e = email.trim();
        if (!EMAIL_PATTERN.matcher(e).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "邮箱格式不正确");
        }
    }

    private void assertNicknameOptional(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            return;
        }
        if (nickname.trim().length() > NICKNAME_MAX_LEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "昵称最长 32 个字符");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String resolveOpenid(String openid, String wxCode) {
        String normalizedOpenid = normalize(openid);
        if (!normalizedOpenid.isEmpty()) {
            return normalizedOpenid;
        }
        String code = normalize(wxCode);
        if (!code.isEmpty()) {
            // 演示环境下以微信 code 构造稳定标识；生产应改为 code2session 获取真实 openid
            return "wx_" + code;
        }
        return "";
    }

    private String normalizeNickname(String nickname, String fallback) {
        String value = normalize(nickname);
        if (value.isEmpty()) {
            value = fallback;
        }
        if (value.length() > NICKNAME_MAX_LEN) {
            value = value.substring(0, NICKNAME_MAX_LEN);
        }
        return value;
    }

    private Map<String, Object> buildUserPayload(User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.getId());
        payload.put("userId", user.getId());
        payload.put("username", user.getUsername());
        payload.put("nickname", user.getNickname());
        payload.put("nickName", user.getNickname());
        payload.put("avatarUrl", user.getAvatarUrl());
        payload.put("signature", user.getSignature());
        payload.put("email", user.getEmail());
        payload.put("openid", user.getOpenid());
        payload.put("gender", user.getGender());
        payload.put("country", user.getCountry());
        payload.put("province", user.getProvince());
        payload.put("city", user.getCity());
        payload.put("language", user.getLanguage());
        payload.put("createTime", user.getCreateTime());
        payload.put("updateTime", user.getUpdateTime());
        return payload;
    }

    @PostMapping("/login")
    public ResponseEntity<Result<Map<String, Object>>> login(@RequestBody Map<String, String> loginData) {
        String username = normalize(loginData.get("username"));
        String password = loginData.getOrDefault("password", "");
        String openid = resolveOpenid(loginData.get("openid"), loginData.get("wxCode"));
        
        User user = null;
        
        // 如果提供了openid，使用微信登录方式
        if (!openid.isEmpty()) {
            user = userService.getUserByOpenid(openid);
            
            // 如果用户不存在，则创建新用户
            if (user == null) {
                user = new User();
                user.setOpenid(openid);
                String nickname = normalizeNickname(loginData.get("nickname"), "默认用户");
                user.setNickname(nickname);
                // 如果提供了头像URL，使用提供的；否则生成新头像
                String providedAvatarUrl = normalize(loginData.get("avatarUrl"));
                String avatarUrl = "";
                if (!providedAvatarUrl.isEmpty()) {
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
        else if (!username.isEmpty()) {
            assertUsernameFormat(username);
            assertPasswordFormat(password);
            // 先尝试用username登录
            user = userService.getUserByUsername(username);
            
            // 如果username找不到，尝试用nickname登录
            if (user == null) {
                user = userService.getUserByNickname(username);
            }
            
            // 检查用户是否存在以及密码是否正确（微信-only 用户可能没有本地密码）
            String stored = user != null ? user.getPassword() : null;
            if (user == null || stored == null || stored.isEmpty()
                    || !passwordEncoder.matches(password, stored)) {
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
        responseData.put("user", buildUserPayload(user));
        
        return ResponseEntity.ok(Result.success("登录成功", responseData));
    }

    @PostMapping("/register")
    public ResponseEntity<Result<Map<String, Object>>> register(@RequestBody Map<String, String> registerData) {
        String username = normalize(registerData.get("username"));
        String password = registerData.getOrDefault("password", "");
        String email = normalize(registerData.get("email"));
        String openid = resolveOpenid(registerData.get("openid"), registerData.get("wxCode"));
        String nickname = normalize(registerData.get("nickname"));

        if (openid.isEmpty() && username.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "用户名不能为空");
        }
        if (openid.isEmpty()) {
            assertUsernameFormat(username);
            assertPasswordFormat(password);
        }
        assertNicknameOptional(nickname);
        
        // 检查用户名是否已存在
        if (!username.isEmpty()) {
            User existingUser = userService.getUserByUsername(username);
            if (existingUser != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "用户名已存在");
            }
        }
        
        // 检查openid是否已存在（微信登录用户）
        if (!openid.isEmpty()) {
            User existingUser = userService.getUserByOpenid(openid);
            if (existingUser != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "用户已存在");
            }
        }
        
        // 创建新用户
        User newUser = new User();
        String avatarUrl = "";
        
        if (!openid.isEmpty()) {
            // 微信登录注册
            newUser.setOpenid(openid);
            String wxNick = normalizeNickname(nickname, "默认用户");
            newUser.setNickname(wxNick);
            // 如果提供了头像URL，使用提供的；否则生成新头像
            String providedAvatarUrl = normalize(registerData.get("avatarUrl"));
            if (!providedAvatarUrl.isEmpty()) {
                avatarUrl = providedAvatarUrl;
            } else {
                // 使用 openid 或昵称作为种子生成头像
                avatarUrl = avatarService.generateAndSaveAvatar(openid + wxNick);
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
            String displayName = nickname.isEmpty() ? username : nickname;
            newUser.setNickname(displayName);
            // 使用用户名作为种子生成头像
            avatarUrl = avatarService.generateAndSaveAvatar(username);
            newUser.setAvatarUrl(avatarUrl);
        }
        if (!email.isEmpty()) {
            assertEmailOptional(email);
            if (userService.existsByEmail(email)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "该邮箱已被注册");
            }
            newUser.setEmail(email);
        } else {
            newUser.setEmail(null);
        }
        newUser.setCreateTime(LocalDateTime.now());
        newUser.setUpdateTime(LocalDateTime.now());
        
        // 保存用户
        User savedUser = userService.saveUser(newUser);
        
        String token = tokenService.generateToken(savedUser.getId());
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("user", buildUserPayload(savedUser));
        
        return ResponseEntity.ok(Result.success("注册成功", responseData));
    }

    @PostMapping("/logout")
    public ResponseEntity<Result<String>> logout() {
        return ResponseEntity.ok(Result.success("登出成功", ""));
    }
}