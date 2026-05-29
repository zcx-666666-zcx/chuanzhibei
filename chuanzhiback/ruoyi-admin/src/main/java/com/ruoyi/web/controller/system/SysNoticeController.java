package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/system/notice")
public class SysNoticeController {

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:notice:list')")
    public TableDataInfo<Map<String, Object>> list() {
        return TableDataInfo.build(List.of(), 0);
    }

    @GetMapping("/{noticeId}")
    @PreAuthorize("@ss.hasPermi('system:notice:query')")
    public AjaxResult<Map<String, Object>> getInfo(@PathVariable Long noticeId) {
        Map<String, Object> notice = new HashMap<>();
        notice.put("noticeId", noticeId);
        notice.put("noticeTitle", "暂无公告");
        notice.put("noticeType", "2");
        notice.put("noticeContent", "");
        notice.put("status", "0");
        return AjaxResult.success(notice);
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('system:notice:add')")
    public AjaxResult<Void> add(@RequestBody Map<String, Object> notice) {
        return AjaxResult.success();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('system:notice:edit')")
    public AjaxResult<Void> edit(@RequestBody Map<String, Object> notice) {
        return AjaxResult.success();
    }

    @DeleteMapping("/{noticeId}")
    @PreAuthorize("@ss.hasPermi('system:notice:remove')")
    public AjaxResult<Void> remove(@PathVariable Long noticeId) {
        return AjaxResult.success();
    }

    @GetMapping("/listTop")
    public AjaxResult<Map<String, Object>> listTop() {
        Map<String, Object> result = new HashMap<>();
        result.put("data", List.of());
        result.put("unreadCount", 0);
        return AjaxResult.success(result);
    }

    @PostMapping("/markRead")
    public AjaxResult<Void> markRead(@RequestParam Long noticeId) {
        return AjaxResult.success();
    }

    @PostMapping("/markReadAll")
    public AjaxResult<Void> markReadAll(@RequestParam String ids) {
        return AjaxResult.success();
    }

    @GetMapping("/readUsers/list")
    @PreAuthorize("@ss.hasPermi('system:notice:query')")
    public TableDataInfo<Map<String, Object>> readUsersList() {
        return TableDataInfo.build(List.of(), 0);
    }
}
