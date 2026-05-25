package com.ruoyi.web.controller.system;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.system.domain.SysDept;
import com.ruoyi.system.domain.SysRole;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.mapper.SysDeptMapper;
import com.ruoyi.system.mapper.SysUserMapper;
import com.ruoyi.system.service.ISysUserService;
import com.ruoyi.system.service.ISysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
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

    @Autowired
    private SysUserMapper userMapper;

    /** 用户列表（分页） */
    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('system:user:list')")
    public TableDataInfo<SysUser> list(
            SysUser user,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long deptId,
            @RequestParam(value = "params[beginTime]", required = false) String beginTime,
            @RequestParam(value = "params[endTime]", required = false) String endTime
    ) {
        Page<SysUser> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(hasText(user.getUserName()), SysUser::getUserName, user.getUserName())
                .like(hasText(user.getPhoneNumber()), SysUser::getPhoneNumber, user.getPhoneNumber())
                .eq(hasText(user.getStatus()), SysUser::getStatus, user.getStatus())
                .eq(deptId != null, SysUser::getDeptId, deptId)
                .ge(parseBeginDate(beginTime) != null, SysUser::getCreateTime, parseBeginDate(beginTime))
                .le(parseEndDate(endTime) != null, SysUser::getCreateTime, parseEndDate(endTime))
                .eq(SysUser::getDelFlag, "0")
                .orderByDesc(SysUser::getCreateTime);
        Page<SysUser> result = userMapper.selectPage(page, wrapper);
        List<SysUser> records = result.getRecords();
        for (SysUser item : records) {
            if (item.getDeptId() != null) {
                SysDept dept = deptMapper.selectById(item.getDeptId());
                if (dept != null) {
                    item.setDeptName(dept.getDeptName());
                }
            }
        }
        return TableDataInfo.build(records, result.getTotal());
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

    private Date parseBeginDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Date.from(LocalDate.parse(value).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Date parseEndDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Date.from(LocalDate.parse(value).atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
