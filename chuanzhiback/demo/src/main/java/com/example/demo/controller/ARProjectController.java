package com.example.demo.controller;

import com.example.demo.common.Result;
import com.example.demo.entity.ARExperienceRecord;
import com.example.demo.entity.ARProject;
import com.example.demo.security.AuthUtils;
import com.example.demo.service.ARProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ar")
@CrossOrigin(origins = "*")
public class ARProjectController {

    @Autowired
    private ARProjectService arProjectService;

    /**
     * 获取 AR 体验项目列表，支持分类/关键词筛选
     */
    @GetMapping("/projects")
    public Result<Map<String, Object>> listProjects(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "10") Integer size) {
        int safePage = normalizePage(page);
        int safeSize = normalizeSize(size);

        List<ARProject> all = arProjectService.list(category, keyword);
        int from = Math.max((safePage - 1) * safeSize, 0);
        int to = Math.min(from + safeSize, all.size());
        List<ARProject> pageList = from < to ? all.subList(from, to) : List.of();
        boolean hasMore = to < all.size();

        Map<String, Object> data = new HashMap<>();
        data.put("list", pageList);
        data.put("total", all.size());
        data.put("page", safePage);
        data.put("size", safeSize);
        data.put("hasMore", hasMore);
        data.put("hasNext", hasMore);
        return Result.success("获取成功", data);
    }

    /**
     * 获取 AR 体验项目详情
     */
    @GetMapping("/projects/{id}")
    public Result<ARProject> getProject(@PathVariable Long id) {
        ARProject project = arProjectService.findById(id);
        if (project == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "AR 项目不存在");
        }
        return Result.success(project);
    }

    /**
     * 3D 模型清单（用于 xrDemo3D 模型选择器）
     */
    @GetMapping("/models")
    public Result<Map<String, Object>> listModels() {
        List<Map<String, Object>> list = arProjectService.listModelCatalog();
        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", list.size());
        return Result.success("获取成功", data);
    }

    /**
     * 记录 AR 体验历史
     */
    @PostMapping("/history")
    public Result<String> addHistory(@RequestBody Map<String, Object> payload) {
        Long userId = AuthUtils.currentUserId();
        Long projectId = parseLongField(payload.get("projectId"), "projectId");
        if (projectId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "缺少 projectId");
        }
        Integer duration = parseIntegerField(payload.get("duration"), "duration");

        arProjectService.addHistory(userId, projectId, duration);
        return Result.success("记录成功", "");
    }

    /**
     * 获取用户 AR 体验历史
     */
    @GetMapping("/history")
    public Result<Map<String, Object>> getHistory(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "10") Integer size) {
        int safePage = normalizePage(page);
        int safeSize = normalizeSize(size);
        Long currentUserId = AuthUtils.currentUserId();
        if (userId != null && !userId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问其他用户记录");
        }
        userId = currentUserId;
        List<ARExperienceRecord> all = arProjectService.getHistoryByUserId(userId);

        int from = Math.max((safePage - 1) * safeSize, 0);
        int to = Math.min(from + safeSize, all.size());
        List<ARExperienceRecord> pageList = from < to ? all.subList(from, to) : List.of();
        boolean hasMore = to < all.size();

        Map<String, Object> data = new HashMap<>();
        data.put("list", pageList.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("projectId", r.getProjectId());
            m.put("projectName", r.getProjectName());
            m.put("projectThumb", r.getProjectThumb());
            m.put("startTime", r.getStartTime());
            m.put("duration", r.getDuration());
            return m;
        }).collect(Collectors.toList()));
        data.put("total", all.size());
        data.put("page", safePage);
        data.put("size", safeSize);
        data.put("hasMore", hasMore);
        data.put("hasNext", hasMore);
        return Result.success("获取成功", data);
    }

    /**
     * 获取 AR 体验统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(value = "userId", required = false) Long userId) {
        Long currentUserId = AuthUtils.currentUserId();
        if (userId != null && !userId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问其他用户统计");
        }
        userId = currentUserId;
        Map<String, Object> stats = arProjectService.getStatisticsByUserId(userId);
        return Result.success("获取成功", stats);
    }

    /**
     * 删除用户AR体验记录（保留最近的几条）
     */
    @DeleteMapping("/history/cleanup")
    public Result<String> cleanupHistory(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "keepCount", required = false, defaultValue = "4") Integer keepCount) {
        int safeKeepCount = keepCount == null ? 4 : Math.max(0, keepCount);
        Long currentUserId = AuthUtils.currentUserId();
        if (userId != null && !userId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权清理其他用户记录");
        }
        userId = currentUserId;
        arProjectService.deleteHistoryExceptRecent(userId, safeKeepCount);
        return Result.success("清理成功", "");
    }

    /**
     * 删除指定的AR体验记录
     */
    @DeleteMapping("/history/{id}")
    public Result<String> deleteHistory(@PathVariable Long id) {
        Long userId = AuthUtils.currentUserId();
        boolean deleted = arProjectService.deleteHistoryByIdForUser(id, userId);
        if (!deleted) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "记录不存在或无权限删除");
        }
        return Result.success("删除成功", "");
    }

    private int normalizePage(Integer page) {
        if (page == null || page < 1) {
            return 1;
        }
        return page;
    }

    private int normalizeSize(Integer size) {
        if (size == null || size < 1) {
            return 10;
        }
        return Math.min(size, 100);
    }

    private Long parseLongField(Object raw, String fieldName) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number) {
            return ((Number) raw).longValue();
        }
        if (raw instanceof String) {
            String text = ((String) raw).trim();
            if (text.isEmpty()) {
                return null;
            }
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " 格式错误");
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " 格式错误");
    }

    private Integer parseIntegerField(Object raw, String fieldName) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number) {
            return ((Number) raw).intValue();
        }
        if (raw instanceof String) {
            String text = ((String) raw).trim();
            if (text.isEmpty()) {
                return null;
            }
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " 格式错误");
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " 格式错误");
    }
}