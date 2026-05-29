package com.ruoyi.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ruoyi.security.LoginUser;
import com.ruoyi.system.domain.SysDept;
import com.ruoyi.system.domain.SysMenu;
import com.ruoyi.system.domain.SysRole;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.mapper.SysDeptMapper;
import com.ruoyi.system.mapper.SysMenuMapper;
import com.ruoyi.system.mapper.SysRoleMapper;
import com.ruoyi.system.mapper.SysUserMapper;
import com.ruoyi.system.service.ISysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * 用户 业务层实现
 */
@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements ISysUserService {

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private SysRoleMapper roleMapper;

    @Autowired
    private SysMenuMapper menuMapper;

    @Autowired
    private SysDeptMapper deptMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public LoginUser loadUserByUsername(String username) {
        SysUser user = userMapper.selectByUserName(username);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在: " + username);
        }

        // 查询角色
        List<SysRole> roles = roleMapper.selectRolesByUserId(user.getUserId());
        Set<String> roleSet = roles.stream().map(SysRole::getRoleKey).collect(Collectors.toSet());

        // 查询权限
        List<String> perms = menuMapper.selectPermsByUserId(user.getUserId());
        Set<String> permSet = new HashSet<>(perms);
        if (Long.valueOf(1L).equals(user.getUserId())) {
            permSet.add("*:*:*");
        }

        user.setRoles(roles);
        return new LoginUser(user, roleSet, permSet);
    }

    @Override
    public SysUser selectUserById(Long userId) {
        return userMapper.selectById(userId);
    }

    @Override
    public SysUser selectUserDetailById(Long userId) {
        SysUser user = userMapper.selectDetailById(userId);
        if (user != null) {
            user.setRoleIds(userMapper.selectRoleIdsByUserId(userId));
        }
        return user;
    }

    @Override
    public SysUser selectUserByUserName(String userName) {
        return userMapper.selectByUserName(userName);
    }

    @Override
    public List<SysUser> selectUserList(SysUser user) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(user.getUserName() != null, SysUser::getUserName, user.getUserName())
               .like(user.getNickName() != null, SysUser::getNickName, user.getNickName())
               .eq(user.getStatus() != null, SysUser::getStatus, user.getStatus())
               .eq(SysUser::getDelFlag, "0")
               .orderByDesc(SysUser::getCreateTime);
        List<SysUser> users = userMapper.selectList(wrapper);
        fillDeptName(users);
        return users;
    }

    @Override
    public List<SysUser> selectUserPage(SysUser user, Long deptId, Date beginTime, Date endTime) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(hasText(user.getUserName()), SysUser::getUserName, user.getUserName())
                .like(hasText(user.getPhoneNumber()), SysUser::getPhoneNumber, user.getPhoneNumber())
                .eq(hasText(user.getStatus()), SysUser::getStatus, user.getStatus())
                .eq(deptId != null, SysUser::getDeptId, deptId)
                .ge(beginTime != null, SysUser::getCreateTime, beginTime)
                .le(endTime != null, SysUser::getCreateTime, endTime)
                .eq(SysUser::getDelFlag, "0")
                .orderByDesc(SysUser::getCreateTime);
        List<SysUser> users = userMapper.selectList(wrapper);
        fillDeptName(users);
        return users;
    }

    @Override
    @Transactional
    public int insertUser(SysUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        int rows = userMapper.insert(user);
        if (rows > 0) {
            syncUserRoles(user);
        }
        return rows;
    }

    @Override
    @Transactional
    public int updateUser(SysUser user) {
        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(null);
        }
        int rows = userMapper.updateById(user);
        if (rows > 0) {
            syncUserRoles(user);
        }
        return rows;
    }

    @Override
    public int changeStatus(Long userId, String status) {
        SysUser user = new SysUser();
        user.setUserId(userId);
        user.setStatus(status);
        return userMapper.updateById(user);
    }

    @Override
    @Transactional
    public int deleteUserByIds(Long[] userIds) {
        int count = 0;
        for (Long userId : userIds) {
            SysUser user = userMapper.selectById(userId);
            if (user != null) {
                user.setDelFlag("2");
                userMapper.updateById(user);
                count++;
            }
        }
        return count;
    }

    @Override
    public int resetPwd(Long userId, String password) {
        SysUser user = new SysUser();
        user.setUserId(userId);
        user.setPassword(passwordEncoder.encode(password));
        return userMapper.updateById(user);
    }

    @Override
    public boolean checkUserNameUnique(String userName) {
        return userMapper.selectByUserName(userName) == null;
    }

    private void fillDeptName(List<SysUser> users) {
        if (users == null || users.isEmpty()) {
            return;
        }
        java.util.Set<Long> deptIds = users.stream()
                .map(SysUser::getDeptId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        java.util.Map<Long, String> deptNameMap = deptIds.isEmpty()
                ? java.util.Collections.emptyMap()
                : deptMapper.selectBatchIds(deptIds).stream()
                        .collect(Collectors.toMap(SysDept::getDeptId, SysDept::getDeptName, (a, b) -> a));
        for (SysUser item : users) {
            if (item.getDeptId() != null) {
                item.setDeptName(deptNameMap.get(item.getDeptId()));
            }
        }
    }

    private boolean hasText(String value) {
        return StringUtils.hasText(value);
    }

    private void syncUserRoles(SysUser user) {
        if (user.getUserId() == null) {
            return;
        }
        userMapper.deleteUserRolesByUserId(user.getUserId());
        if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
            userMapper.batchInsertUserRoles(user.getUserId(), user.getRoleIds());
        }
    }
}
