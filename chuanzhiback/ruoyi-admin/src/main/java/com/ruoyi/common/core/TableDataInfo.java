package com.ruoyi.common.core;

import java.io.Serializable;
import java.util.List;

/**
 * 分页数据封装（前端 RuoYi-Vue 约定格式）
 */
public class TableDataInfo<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 总记录数 */
    private long total;

    /** 列表数据 */
    private List<T> rows;

    /** 消息状态码 */
    private int code = 200;

    /** 消息内容 */
    private String msg = "查询成功";

    public TableDataInfo() {}

    public TableDataInfo(List<T> rows, long total) {
        this.rows = rows;
        this.total = total;
    }

    public static <T> TableDataInfo<T> build(List<T> rows, long total) {
        return new TableDataInfo<>(rows, total);
    }

    // ---- Getter / Setter ----

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public List<T> getRows() { return rows; }
    public void setRows(List<T> rows) { this.rows = rows; }

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }

    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }
}
