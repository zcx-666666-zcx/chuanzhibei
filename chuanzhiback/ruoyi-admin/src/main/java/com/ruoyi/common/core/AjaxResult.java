package com.ruoyi.common.core;

import java.io.Serializable;

/**
 * 统一响应结果封装（兼容 RuoYi AjaxResult 风格）
 *
 * @param <T> 数据类型
 */
public class AjaxResult<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 状态码 */
    private int code;

    /** 消息内容 */
    private String msg;

    /** 数据对象 */
    private T data;

    public AjaxResult() {}

    public AjaxResult(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    // ---- 静态工厂方法 ----

    public static <T> AjaxResult<T> success() {
        return new AjaxResult<>(200, "操作成功", null);
    }

    public static <T> AjaxResult<T> success(String msg) {
        return new AjaxResult<>(200, msg, null);
    }

    public static <T> AjaxResult<T> success(T data) {
        return new AjaxResult<>(200, "操作成功", data);
    }

    public static <T> AjaxResult<T> success(String msg, T data) {
        return new AjaxResult<>(200, msg, data);
    }

    public static <T> AjaxResult<T> error() {
        return new AjaxResult<>(500, "操作失败", null);
    }

    public static <T> AjaxResult<T> error(String msg) {
        return new AjaxResult<>(500, msg, null);
    }

    public static <T> AjaxResult<T> error(int code, String msg) {
        return new AjaxResult<>(code, msg, null);
    }

    public static <T> AjaxResult<T> warn(String msg) {
        return new AjaxResult<>(301, msg, null);
    }

    // ---- Getter / Setter ----

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }

    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
