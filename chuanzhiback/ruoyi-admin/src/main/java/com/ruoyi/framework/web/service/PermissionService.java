package com.ruoyi.framework.web.service;

import com.ruoyi.security.LoginUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * 权限检查服务 — 页面按钮可见性控制（模板: @ss.hasPermi('xxx:list')）
 */
@Service("ss")
public class PermissionService {

    /**
     * 判断当前用户是否拥有指定权限
     */
    public boolean hasPermi(String permission) {
        if (permission == null || permission.isEmpty()) {
            return false;
        }
        LoginUser loginUser = getLoginUser();
        if (loginUser == null || loginUser.getPermissions() == null) {
            return false;
        }
        if (loginUser.getUserId() != null && loginUser.getUserId() == 1L) {
            return true;
        }
        Set<String> permissions = loginUser.getPermissions();
        // 超级管理员拥有所有权限
        if (permissions.contains("*:*:*")) {
            return true;
        }
        return permissions.contains(permission);
    }

    /**
     * 判断当前用户是否拥有指定角色
     */
    public boolean hasRole(String role) {
        if (role == null || role.isEmpty()) {
            return false;
        }
        LoginUser loginUser = getLoginUser();
        if (loginUser == null || loginUser.getRoles() == null) {
            return false;
        }
        Set<String> roles = loginUser.getRoles();
        if (roles.contains("admin")) {
            return true;
        }
        return roles.contains(role);
    }

    private LoginUser getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser) {
            return (LoginUser) authentication.getPrincipal();
        }
        return null;
    }
}
