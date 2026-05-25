package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.system.domain.SysRole;
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

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:role:list')")
    public TableDataInfo<SysRole> list(SysRole role) {
        List<SysRole> list = roleService.selectRoleList(role);
        return TableDataInfo.build(list, list.size());
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("@ss.hasPermi('system:role:query')")
    public AjaxResult<SysRole> getInfo(@PathVariable Long roleId) {
        return AjaxResult.success(roleService.getById(roleId));
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
}
