package com.example.demo.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class AuthUtils {

    private AuthUtils() {
    }

    public static Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效登录态");
        }
    }
}
