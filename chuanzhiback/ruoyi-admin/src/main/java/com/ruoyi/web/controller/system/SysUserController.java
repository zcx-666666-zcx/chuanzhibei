package com.ruoyi.web.controller.system;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.service.ISysUserService;
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
        SysUser user = userService.selectUserById(userId);
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
}
