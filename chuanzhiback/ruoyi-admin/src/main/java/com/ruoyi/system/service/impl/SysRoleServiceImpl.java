package com.ruoyi.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ruoyi.system.domain.SysRole;
import com.ruoyi.system.mapper.SysRoleMapper;
import com.ruoyi.system.service.ISysRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 角色 业务层实现
 */
@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements ISysRoleService {

    @Override
    public List<SysRole> selectRoleList(SysRole role) {
        LambdaQueryWrapper<SysRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(role.getRoleName() != null, SysRole::getRoleName, role.getRoleName())
               .like(role.getRoleKey() != null, SysRole::getRoleKey, role.getRoleKey())
               .eq(role.getStatus() != null, SysRole::getStatus, role.getStatus())
               .eq(SysRole::getDelFlag, "0")
               .orderByAsc(SysRole::getRoleSort);
        return list(wrapper);
    }

    @Override
    public List<SysRole> selectRolesByUserId(Long userId) {
        return baseMapper.selectRolesByUserId(userId);
    }

    @Override
    public SysRole selectRoleDetailById(Long roleId) {
        SysRole role = baseMapper.selectById(roleId);
        if (role != null) {
            role.setMenuIds(baseMapper.selectMenuIdsByRoleId(roleId));
        }
        return role;
    }

    @Override
    @Transactional
    public int insertRole(SysRole role) {
        int rows = baseMapper.insert(role);
        if (rows > 0) {
            syncRoleMenus(role);
        }
        return rows;
    }

    @Override
    @Transactional
    public int updateRole(SysRole role) {
        int rows = baseMapper.updateById(role);
        if (rows > 0) {
            syncRoleMenus(role);
        }
        return rows;
    }

    @Override
    public int changeStatus(Long roleId, String status) {
        SysRole role = new SysRole();
        role.setRoleId(roleId);
        role.setStatus(status);
        return baseMapper.updateById(role);
    }

    @Override
    @Transactional
    public int deleteRoleByIds(Long[] roleIds) {
        int count = 0;
        for (Long roleId : roleIds) {
            SysRole role = baseMapper.selectById(roleId);
            if (role != null) {
                role.setDelFlag("2");
                baseMapper.updateById(role);
                baseMapper.deleteRoleMenusByRoleId(roleId);
                count++;
            }
        }
        return count;
    }

    @Override
    public boolean checkRoleKeyUnique(SysRole role) {
        LambdaQueryWrapper<SysRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysRole::getRoleKey, role.getRoleKey())
               .ne(role.getRoleId() != null, SysRole::getRoleId, role.getRoleId())
               .eq(SysRole::getDelFlag, "0");
        return baseMapper.selectCount(wrapper) == 0;
    }

    private void syncRoleMenus(SysRole role) {
        if (role.getRoleId() == null) {
            return;
        }
        baseMapper.deleteRoleMenusByRoleId(role.getRoleId());
        if (role.getMenuIds() != null && !role.getMenuIds().isEmpty()) {
            baseMapper.batchInsertRoleMenus(role.getRoleId(), role.getMenuIds());
        }
    }
}
