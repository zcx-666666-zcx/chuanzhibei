package com.example.demo.controller;

import com.example.demo.common.Result;
import com.example.demo.entity.ARExperienceRecord;
import com.example.demo.entity.ARProject;
import com.example.demo.service.ARProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

        List<ARProject> all = arProjectService.list(category, keyword);
        int from = Math.max((page - 1) * size, 0);
        int to = Math.min(from + size, all.size());
        List<ARProject> pageList = from < to ? all.subList(from, to) : List.of();

        Map<String, Object> data = new HashMap<>();
        data.put("list", pageList);
        data.put("total", all.size());
        data.put("page", page);
        data.put("size", size);
        data.put("hasNext", to < all.size());
        return Result.success("获取成功", data);
    }

    /**
     * 获取 AR 体验项目详情
     */
    @GetMapping("/projects/{id}")
    public Result<ARProject> getProject(@PathVariable Long id) {
        ARProject project = arProjectService.findById(id);
        if (project == null) {
            return Result.error("AR 项目不存在");
        }
        return Result.success(project);
    }

    /**
     * 记录 AR 体验历史
     */
    @PostMapping("/history")
    public Result<String> addHistory(@RequestBody Map<String, Object> payload) {
        Object projectIdObj = payload.get("projectId");
        Object durationObj = payload.get("duration");
        if (projectIdObj == null) {
            return Result.error("缺少 projectId");
        }
        Long projectId = Long.valueOf(projectIdObj.toString());
        Integer duration = null;
        if (durationObj != null) {
            try {
                duration = Integer.valueOf(durationObj.toString());
            } catch (NumberFormatException ignored) {}
        }
        arProjectService.addHistory(projectId, duration);
        return Result.success("记录成功", "");
    }

    /**
     * 获取用户 AR 体验历史（当前为全局示例数据）
     */
    @GetMapping("/history")
    public Result<Map<String, Object>> getHistory(
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "10") Integer size) {

        List<ARExperienceRecord> all = arProjectService.history();
        // 只返回最近的4条记录
        List<ARExperienceRecord> recentRecords = all.stream()
                .limit(4) // 只取前4条记录
                .collect(Collectors.toList());
                
        int from = Math.max((page - 1) * size, 0);
        int to = Math.min(from + size, recentRecords.size());
        List<ARExperienceRecord> pageList = from < to ? recentRecords.subList(from, to) : List.of();

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
        data.put("total", recentRecords.size());
        data.put("page", page);
        data.put("size", size);
        data.put("hasNext", to < recentRecords.size());
        return Result.success("获取成功", data);
    }

    /**
     * 获取 AR 体验统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = arProjectService.statistics();
        return Result.success("获取成功", stats);
    }
}