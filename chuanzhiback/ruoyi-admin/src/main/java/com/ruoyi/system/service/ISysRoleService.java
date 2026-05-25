package com.ruoyi.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.system.domain.SysRole;

import java.util.List;

/**
 * 角色 业务层接口
 */
public interface ISysRoleService extends IService<SysRole> {

    List<SysRole> selectRoleList(SysRole role);

    List<SysRole> selectRolesByUserId(Long userId);

    int insertRole(SysRole role);

    int updateRole(SysRole role);

    int deleteRoleByIds(Long[] roleIds);

    boolean checkRoleKeyUnique(SysRole role);
}
