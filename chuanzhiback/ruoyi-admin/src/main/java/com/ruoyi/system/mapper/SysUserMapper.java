package com.ruoyi.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ruoyi.system.domain.SysUser;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户表 数据层
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    /** 通过用户名查询用户 */
    @Select("SELECT * FROM sys_user WHERE user_name = #{userName} AND del_flag = '0'")
    SysUser selectByUserName(@Param("userName") String userName);

    /** 查询用户的角色ID列表 */
    @Select("SELECT role_id FROM sys_user_role WHERE user_id = #{userId}")
    List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);

    /** 删除用户角色关联 */
    @Delete("DELETE FROM sys_user_role WHERE user_id = #{userId}")
    int deleteUserRolesByUserId(@Param("userId") Long userId);

    /** 批量写入用户角色关联 */
    @Insert({
            "<script>",
            "INSERT INTO sys_user_role (user_id, role_id) VALUES ",
            "<foreach collection='roleIds' item='roleId' separator=','>",
            "(#{userId}, #{roleId})",
            "</foreach>",
            "</script>"
    })
    int batchInsertUserRoles(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);
}
