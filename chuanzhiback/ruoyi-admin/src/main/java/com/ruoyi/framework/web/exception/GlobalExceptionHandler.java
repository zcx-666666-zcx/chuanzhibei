package com.ruoyi.framework.web.exception;

import com.ruoyi.common.core.AjaxResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 权限不足 */
    @ExceptionHandler(AccessDeniedException.class)
    public AjaxResult<Void> handleAccessDeniedException(AccessDeniedException e) {
        log.error("权限不足: {}", e.getMessage());
        return AjaxResult.error(403, "没有权限，请联系管理员");
    }

    /** 认证失败 */
    @ExceptionHandler(BadCredentialsException.class)
    public AjaxResult<Void> handleBadCredentialsException(BadCredentialsException e) {
        return AjaxResult.error("用户名或密码错误");
    }

    /** 业务异常 */
    @ExceptionHandler(RuntimeException.class)
    public AjaxResult<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: ", e);
        return AjaxResult.error(e.getMessage());
    }

    /** 其他异常 */
    @ExceptionHandler(Exception.class)
    public AjaxResult<Void> handleException(Exception e) {
        log.error("系统异常: ", e);
        return AjaxResult.error("系统内部错误");
    }
}
