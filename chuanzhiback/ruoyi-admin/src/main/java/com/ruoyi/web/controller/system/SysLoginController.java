package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.security.JwtUtils;
import com.ruoyi.security.LoginUser;
import com.ruoyi.system.domain.RouterVo;
import com.ruoyi.system.domain.SysMenu;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.service.ISysMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 登录认证控制器
 */
@RestController
public class SysLoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ISysMenuService menuService;

    /**
     * 登录接口
     * POST /login
     */
    @PostMapping("/login")
    public AjaxResult<Map<String, Object>> login(@RequestBody Map<String, String> loginForm) {
        String username = loginForm.get("username");
        String password = loginForm.get("password");

        // 认证
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
        } catch (Exception e) {
            return AjaxResult.error("用户名或密码错误");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();

        // 生成 Token
        String token = jwtUtils.generateToken(username);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        return AjaxResult.success("登录成功", result);
    }

    /**
     * 获取当前登录用户信息 + 菜单权限
     * GET /getInfo
     */
    @GetMapping("/getInfo")
    public AjaxResult<Map<String, Object>> getInfo() {
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return AjaxResult.error(401, "未登录");
        }

        SysUser user = loginUser.getUser();
        // 清除密码
        user.setPassword(null);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("roles", loginUser.getRoles());
        result.put("permissions", loginUser.getPermissions());
        return AjaxResult.success(result);
    }

    /**
     * 获取当前用户的菜单路由树
     * GET /getRouters
     */
    @GetMapping("/getRouters")
    public AjaxResult<List<RouterVo>> getRouters() {
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return AjaxResult.error(401, "未登录");
        }
        Long userId = loginUser.getUserId();
        return AjaxResult.success(menuService.buildMenusByUserId(userId));
    }

    /**
     * 若依前端登录页默认会拉验证码，这里返回关闭状态，避免前端改太多。
     */
    @GetMapping("/captchaImage")
    public AjaxResult<Map<String, Object>> captchaImage() {
        Map<String, Object> result = new HashMap<>();
        result.put("captchaEnabled", false);
        result.put("uuid", "no-captcha");
        result.put("img", Base64.getEncoder().encodeToString(new byte[0]));
        return AjaxResult.success(result);
    }

    /**
     * 前端退出登录占位接口。
     */
    @PostMapping("/logout")
    public AjaxResult<Void> logout() {
        SecurityContextHolder.clearContext();
        return AjaxResult.success();
    }

    private LoginUser getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser) {
            return (LoginUser) authentication.getPrincipal();
        }
        return null;
    }
}
