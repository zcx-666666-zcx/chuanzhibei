package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.system.domain.SysDept;
import com.ruoyi.system.domain.SysRole;
import com.ruoyi.system.mapper.SysDeptMapper;
import com.ruoyi.system.service.ISysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理控制器
 */
@RestController
@RequestMapping("/system/role")
public class SysRoleController {

    @Autowired
    private ISysRoleService roleService;

    @Autowired
    private SysDeptMapper deptMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:role:list')")
    public TableDataInfo<SysRole> list(SysRole role) {
        List<SysRole> list = roleService.selectRoleList(role);
        return TableDataInfo.build(list, list.size());
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("@ss.hasPermi('system:role:query')")
    public AjaxResult<SysRole> getInfo(@PathVariable Long roleId) {
        return AjaxResult.success(roleService.selectRoleDetailById(roleId));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('system:role:add')")
    public AjaxResult<Void> add(@RequestBody SysRole role) {
        if (!roleService.checkRoleKeyUnique(role)) {
            return AjaxResult.error("新增角色'" + role.getRoleName() + "'失败，角色权限已存在");
        }
        return roleService.insertRole(role) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    public AjaxResult<Void> edit(@RequestBody SysRole role) {
        return roleService.updateRole(role) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{roleIds}")
    @PreAuthorize("@ss.hasPermi('system:role:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] roleIds) {
        return roleService.deleteRoleByIds(roleIds) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping("/changeStatus")
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    public AjaxResult<Void> changeStatus(@RequestBody SysRole role) {
        return roleService.changeStatus(role.getRoleId(), role.getStatus()) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @GetMapping("/deptTree/{roleId}")
    @PreAuthorize("@ss.hasPermi('system:role:query')")
    public AjaxResult<List<SysDept>> deptTree(@PathVariable Long roleId) {
        List<SysDept> list = deptMapper.selectList(null).stream()
                .filter(item -> "0".equals(item.getDelFlag()))
                .toList();
        return AjaxResult.success(buildDeptTree(list));
    }

    private List<SysDept> buildDeptTree(List<SysDept> list) {
        java.util.List<SysDept> roots = new java.util.ArrayList<>();
        for (SysDept dept : list) {
            if (dept.getParentId() == null || dept.getParentId() == 0L) {
                dept.setChildren(childrenOf(dept, list));
                roots.add(dept);
            }
        }
        return roots;
    }

    private List<SysDept> childrenOf(SysDept parent, List<SysDept> all) {
        java.util.List<SysDept> children = new java.util.ArrayList<>();
        for (SysDept dept : all) {
            if (parent.getDeptId().equals(dept.getParentId())) {
                dept.setChildren(childrenOf(dept, all));
                children.add(dept);
            }
        }
        return children;
    }
}
