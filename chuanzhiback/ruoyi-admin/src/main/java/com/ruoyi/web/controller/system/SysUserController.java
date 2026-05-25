package com.ruoyi.web.controller.system;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.system.domain.SysDept;
import com.ruoyi.system.domain.SysRole;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.mapper.SysDeptMapper;
import com.ruoyi.system.service.ISysUserService;
import com.ruoyi.system.service.ISysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理控制器
 */
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    @Autowired
    private ISysUserService userService;

    @Autowired
    private ISysRoleService roleService;

    @Autowired
    private SysDeptMapper deptMapper;

    /** 用户列表（分页） */
    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:user:list')")
    public TableDataInfo<SysUser> list(SysUser user) {
        Page<SysUser> page = new Page<>(1, 10);
        List<SysUser> list = userService.selectUserList(user);
        return TableDataInfo.build(list, list.size());
    }

    /** 获取用户详情 */
    @GetMapping("/{userId}")
    @PreAuthorize("@ss.hasPermi('system:user:query')")
    public AjaxResult<SysUser> getInfo(@PathVariable Long userId) {
        SysUser user = userService.selectUserDetailById(userId);
        return AjaxResult.success(user);
    }

    /** 新增用户 */
    @PostMapping
    @PreAuthorize("@ss.hasPermi('system:user:add')")
    public AjaxResult<Void> add(@RequestBody SysUser user) {
        if (!userService.checkUserNameUnique(user.getUserName())) {
            return AjaxResult.error("新增用户'" + user.getUserName() + "'失败，用户名已存在");
        }
        return userService.insertUser(user) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    /** 修改用户 */
    @PutMapping
    @PreAuthorize("@ss.hasPermi('system:user:edit')")
    public AjaxResult<Void> edit(@RequestBody SysUser user) {
        return userService.updateUser(user) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    /** 删除用户 */
    @DeleteMapping("/{userIds}")
    @PreAuthorize("@ss.hasPermi('system:user:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] userIds) {
        return userService.deleteUserByIds(userIds) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    /** 重置密码 */
    @PutMapping("/resetPwd")
    @PreAuthorize("@ss.hasPermi('system:user:resetPwd')")
    public AjaxResult<Void> resetPwd(@RequestBody SysUser user) {
        return userService.resetPwd(user.getUserId(), user.getPassword()) > 0
                ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping("/changeStatus")
    @PreAuthorize("@ss.hasPermi('system:user:edit')")
    public AjaxResult<Void> changeStatus(@RequestBody SysUser user) {
        return userService.changeStatus(user.getUserId(), user.getStatus()) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @GetMapping("/deptTree")
    @PreAuthorize("@ss.hasPermi('system:user:list')")
    public AjaxResult<List<SysDept>> deptTree() {
        return AjaxResult.success(buildDeptTree());
    }

    @GetMapping("/roles")
    @PreAuthorize("@ss.hasPermi('system:user:list')")
    public AjaxResult<List<SysRole>> roles() {
        return AjaxResult.success(roleService.selectRoleList(new SysRole()));
    }

    private List<SysDept> buildDeptTree() {
        List<SysDept> list = deptMapper.selectList(null);
        return list.stream()
                .filter(item -> "0".equals(item.getDelFlag()))
                .sorted((a, b) -> {
                    long pa = a.getParentId() == null ? 0L : a.getParentId();
                    long pb = b.getParentId() == null ? 0L : b.getParentId();
                    int parentCompare = Long.compare(pa, pb);
                    return parentCompare != 0 ? parentCompare : Integer.compare(
                            a.getOrderNum() == null ? 0 : a.getOrderNum(),
                            b.getOrderNum() == null ? 0 : b.getOrderNum());
                })
                .collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toList(), this::attachDeptChildren));
    }

    private List<SysDept> attachDeptChildren(List<SysDept> list) {
        java.util.List<SysDept> roots = new java.util.ArrayList<>();
        for (SysDept dept : list) {
            if (dept.getParentId() == null || dept.getParentId() == 0L) {
                dept.setChildren(findChildren(dept, list));
                roots.add(dept);
            }
        }
        return roots;
    }

    private List<SysDept> findChildren(SysDept parent, List<SysDept> all) {
        java.util.List<SysDept> children = new java.util.ArrayList<>();
        for (SysDept dept : all) {
            if (parent.getDeptId().equals(dept.getParentId())) {
                dept.setChildren(findChildren(dept, all));
                children.add(dept);
            }
        }
        return children;
    }
}
