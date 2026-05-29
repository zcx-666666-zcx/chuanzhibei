package com.ruoyi.web.controller.system;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.system.domain.SysDept;
import com.ruoyi.system.mapper.SysDeptMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/system/dept")
public class SysDeptController {

    private final SysDeptMapper deptMapper;

    public SysDeptController(SysDeptMapper deptMapper) {
        this.deptMapper = deptMapper;
    }

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:dept:list')")
    public AjaxResult<List<SysDept>> list(SysDept dept) {
        LambdaQueryWrapper<SysDept> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dept.getDeptName() != null && !dept.getDeptName().isBlank(), SysDept::getDeptName, dept.getDeptName())
                .eq(dept.getStatus() != null && !dept.getStatus().isBlank(), SysDept::getStatus, dept.getStatus())
                .eq(SysDept::getDelFlag, "0")
                .orderByAsc(SysDept::getParentId)
                .orderByAsc(SysDept::getOrderNum);
        return AjaxResult.success(toDeptTree(buildTree(deptMapper.selectList(wrapper))));
    }

    @GetMapping("/{deptId}")
    @PreAuthorize("@ss.hasPermi('system:dept:query')")
    public AjaxResult<SysDept> getInfo(@PathVariable Long deptId) {
        return AjaxResult.success(deptMapper.selectById(deptId));
    }

    @GetMapping("/list/exclude/{deptId}")
    @PreAuthorize("@ss.hasPermi('system:dept:list')")
    public AjaxResult<List<SysDept>> listExcludeChild(@PathVariable Long deptId) {
        List<SysDept> all = deptMapper.selectList(new LambdaQueryWrapper<SysDept>()
                .eq(SysDept::getDelFlag, "0")
                .orderByAsc(SysDept::getParentId)
                .orderByAsc(SysDept::getOrderNum));
        List<SysDept> filtered = all.stream()
                .filter(item -> !deptId.equals(item.getDeptId()) && !isDescendant(item, deptId, all))
                .collect(Collectors.toList());
        return AjaxResult.success(toDeptTree(buildTree(filtered)));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('system:dept:add')")
    public AjaxResult<Void> add(@RequestBody SysDept dept) {
        fillAncestors(dept);
        return deptMapper.insert(dept) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('system:dept:edit')")
    public AjaxResult<Void> edit(@RequestBody SysDept dept) {
        fillAncestors(dept);
        return deptMapper.updateById(dept) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping("/updateSort")
    @PreAuthorize("@ss.hasPermi('system:dept:edit')")
    public AjaxResult<Void> updateSort(@RequestBody SortPayload payload) {
        if (payload.deptIds == null || payload.orderNums == null) {
            return AjaxResult.error("排序参数不能为空");
        }
        String[] ids = payload.deptIds.split(",");
        String[] nums = payload.orderNums.split(",");
        for (int i = 0; i < ids.length && i < nums.length; i++) {
            SysDept dept = new SysDept();
            dept.setDeptId(Long.valueOf(ids[i]));
            dept.setOrderNum(Integer.valueOf(nums[i]));
            deptMapper.updateById(dept);
        }
        return AjaxResult.success();
    }

    @DeleteMapping("/{deptId}")
    @PreAuthorize("@ss.hasPermi('system:dept:remove')")
    public AjaxResult<Void> remove(@PathVariable Long deptId) {
        SysDept dept = deptMapper.selectById(deptId);
        if (dept == null) {
            return AjaxResult.error("部门不存在");
        }
        dept.setDelFlag("2");
        deptMapper.updateById(dept);
        return AjaxResult.success();
    }

    private void fillAncestors(SysDept dept) {
        Long parentId = dept.getParentId();
        if (parentId == null || parentId == 0L) {
            dept.setParentId(0L);
            dept.setAncestors("0");
            return;
        }
        SysDept parent = deptMapper.selectById(parentId);
        if (parent == null || parent.getAncestors() == null || parent.getAncestors().isBlank()) {
            dept.setAncestors("0," + parentId);
        } else {
            dept.setAncestors(parent.getAncestors() + "," + parentId);
        }
    }

    private List<SysDept> buildTree(List<SysDept> list) {
        List<SysDept> roots = new ArrayList<>();
        for (SysDept dept : list) {
            if (dept.getParentId() == null || dept.getParentId() == 0L) {
                dept.setChildren(childrenOf(dept, list));
                roots.add(dept);
            }
        }
        return roots;
    }

    private List<SysDept> childrenOf(SysDept parent, List<SysDept> all) {
        return all.stream()
                .filter(item -> parent.getDeptId().equals(item.getParentId()))
                .peek(item -> item.setChildren(childrenOf(item, all)))
                .collect(Collectors.toList());
    }

    private boolean isDescendant(SysDept candidate, Long ancestorId, List<SysDept> all) {
        Long parentId = candidate.getParentId();
        while (parentId != null && parentId != 0L) {
            if (ancestorId.equals(parentId)) {
                return true;
            }
            Long currentParentId = parentId;
            SysDept parent = all.stream().filter(item -> currentParentId.equals(item.getDeptId())).findFirst().orElse(null);
            parentId = parent == null ? 0L : parent.getParentId();
        }
        return false;
    }

    private List<SysDept> toDeptTree(List<SysDept> list) {
        for (SysDept dept : list) {
            dept.setChildren(toDeptTree(dept.getChildren() == null ? new ArrayList<>() : dept.getChildren()));
        }
        return list;
    }

    public static class SortPayload {
        private String deptIds;
        private String orderNums;

        public String getDeptIds() { return deptIds; }
        public void setDeptIds(String deptIds) { this.deptIds = deptIds; }
        public String getOrderNums() { return orderNums; }
        public void setOrderNums(String orderNums) { this.orderNums = orderNums; }
    }
}
