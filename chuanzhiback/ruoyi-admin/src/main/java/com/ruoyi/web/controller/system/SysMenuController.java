package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.system.domain.SysMenu;
import com.ruoyi.system.domain.SysRole;
import com.ruoyi.system.mapper.SysRoleMapper;
import com.ruoyi.system.service.ISysMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 菜单管理控制器
 */
@RestController
@RequestMapping("/system/menu")
public class SysMenuController {

    @Autowired
    private ISysMenuService menuService;

    @Autowired
    private SysRoleMapper roleMapper;

    /** 获取菜单列表（树形） */
    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:menu:list')")
    public AjaxResult<List<SysMenu>> list(SysMenu menu) {
        List<SysMenu> menus = menuService.selectMenuTree();
        return AjaxResult.success(menus);
    }

    /** 获取菜单详情 */
    @GetMapping("/{menuId}")
    @PreAuthorize("@ss.hasPermi('system:menu:query')")
    public AjaxResult<SysMenu> getInfo(@PathVariable Long menuId) {
        return AjaxResult.success(menuService.getById(menuId));
    }

    /** 获取菜单下拉树列表 */
    @GetMapping("/treeselect")
    public AjaxResult<List<SysMenu>> treeselect() {
        List<SysMenu> menus = menuService.selectMenuTree();
        return AjaxResult.success(menus);
    }

    @GetMapping("/roleMenuTreeselect/{roleId}")
    @PreAuthorize("@ss.hasPermi('system:menu:list')")
    public AjaxResult<java.util.Map<String, Object>> roleMenuTreeselect(@PathVariable Long roleId) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("menus", menuService.selectMenuTree());
        result.put("checkedKeys", roleMapper.selectMenuIdsByRoleId(roleId));
        return AjaxResult.success(result);
    }

    @PutMapping("/updateSort")
    @PreAuthorize("@ss.hasPermi('system:menu:edit')")
    public AjaxResult<Void> updateSort(@RequestBody List<SysMenu> menus) {
        for (SysMenu menu : menus) {
            menuService.updateMenu(menu);
        }
        return AjaxResult.success();
    }

    /** 新增菜单 */
    @PostMapping
    @PreAuthorize("@ss.hasPermi('system:menu:add')")
    public AjaxResult<Void> add(@RequestBody SysMenu menu) {
        return menuService.insertMenu(menu) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    /** 修改菜单 */
    @PutMapping
    @PreAuthorize("@ss.hasPermi('system:menu:edit')")
    public AjaxResult<Void> edit(@RequestBody SysMenu menu) {
        return menuService.updateMenu(menu) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    /** 删除菜单 */
    @DeleteMapping("/{menuId}")
    @PreAuthorize("@ss.hasPermi('system:menu:remove')")
    public AjaxResult<Void> remove(@PathVariable Long menuId) {
        return menuService.deleteMenuById(menuId) > 0 ? AjaxResult.success() : AjaxResult.error();
    }
}
