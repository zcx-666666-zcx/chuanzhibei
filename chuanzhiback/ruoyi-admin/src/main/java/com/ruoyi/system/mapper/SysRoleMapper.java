package com.ruoyi.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ruoyi.system.domain.SysRole;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 角色表 数据层
 */
@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    /** 根据用户ID查询角色列表 */
    @Select("SELECT r.* FROM sys_role r " +
            "INNER JOIN sys_user_role ur ON ur.role_id = r.role_id " +
            "WHERE ur.user_id = #{userId} AND r.del_flag = '0' AND r.status = '0'")
    List<SysRole> selectRolesByUserId(@Param("userId") Long userId);

    /** 查询角色的菜单ID列表 */
    @Select("SELECT menu_id FROM sys_role_menu WHERE role_id = #{roleId}")
    List<Long> selectMenuIdsByRoleId(@Param("roleId") Long roleId);

    /** 删除角色菜单关联 */
    @Delete("DELETE FROM sys_role_menu WHERE role_id = #{roleId}")
    int deleteRoleMenusByRoleId(@Param("roleId") Long roleId);

    /** 批量写入角色菜单关联 */
    @Insert({
            "<script>",
            "INSERT INTO sys_role_menu (role_id, menu_id) VALUES ",
            "<foreach collection='menuIds' item='menuId' separator=','>",
            "(#{roleId}, #{menuId})",
            "</foreach>",
            "</script>"
    })
    int batchInsertRoleMenus(@Param("roleId") Long roleId, @Param("menuIds") List<Long> menuIds);
}
