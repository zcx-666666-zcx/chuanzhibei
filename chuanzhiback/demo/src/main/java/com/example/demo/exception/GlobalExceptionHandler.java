package com.example.demo.exception;

import com.example.demo.common.Result;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.apache.catalina.connector.ClientAbortException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 静态资源（如 mp4）流式输出时，用户退出页面或拖动进度条会断开连接，属正常情况。
     * 若不单独处理，会落到 {@link #handleException} 并因响应已带 video/mp4 等类型而无法写入 JSON。
     */
    @ExceptionHandler(ClientAbortException.class)
    public void handleClientAbort(ClientAbortException ex) {
        log.debug("客户端中止连接: {}", ex.getMessage());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Result<String>> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() == null || ex.getReason().isBlank() ? "请求失败" : ex.getReason();
        return ResponseEntity.status(ex.getStatusCode()).body(Result.error(message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<String>> handleException(Exception ex, HttpServletResponse response) {
        if (isBenignClientDisconnect(ex)) {
            log.debug("客户端断开: {}", ex.toString());
            return null;
        }
        if (response.isCommitted()) {
            log.warn("未处理异常(响应已提交，无法返回 JSON): {}", ex.toString());
            return null;
        }
        try {
            response.reset();
            response.resetBuffer();
        } catch (IllegalStateException ignored) {
            return null;
        }
        log.warn("未处理异常: {}", ex.toString());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Result.error("系统繁忙，请稍后重试"));
    }

    private static boolean isBenignClientDisconnect(Throwable ex) {
        for (Throwable t = ex; t != null; t = t.getCause()) {
            if (t instanceof ClientAbortException) {
                return true;
            }
            if (t instanceof IOException msg) {
                String m = msg.getMessage();
                if (m != null && m.toLowerCase().contains("broken pipe")) {
                    return true;
                }
            }
        }
        return false;
    }
}
