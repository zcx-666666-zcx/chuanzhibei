package com.example.demo.exception;

import com.example.demo.common.Result;
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
    public ResponseEntity<Result<String>> handleException(Exception ex) {
        log.warn("未处理异常: {}", ex.toString());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Result.error("系统繁忙，请稍后重试"));
    }
}
