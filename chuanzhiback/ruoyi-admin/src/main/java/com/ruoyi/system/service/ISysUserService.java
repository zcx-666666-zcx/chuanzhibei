package com.ruoyi.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.security.LoginUser;
import com.ruoyi.system.domain.SysUser;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

/**
 * 用户 业务层接口
 */
public interface ISysUserService extends IService<SysUser>, UserDetailsService {

    /** 根据用户名加载用户（供 Spring Security 使用） */
    LoginUser loadUserByUsername(String username);

    /** 根据用户ID查询用户 */
    SysUser selectUserById(Long userId);

    /** 根据用户名查询用户 */
    SysUser selectUserByUserName(String userName);

    /** 查询用户列表 */
    List<SysUser> selectUserList(SysUser user);

    /** 新增用户 */
    int insertUser(SysUser user);

    /** 修改用户 */
    int updateUser(SysUser user);

    /** 删除用户 */
    int deleteUserByIds(Long[] userIds);

    /** 重置密码 */
    int resetPwd(Long userId, String password);

    /** 检查用户名是否唯一 */
    boolean checkUserNameUnique(String userName);
}
