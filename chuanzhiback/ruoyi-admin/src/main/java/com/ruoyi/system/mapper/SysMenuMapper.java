package com.ruoyi.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ruoyi.system.domain.SysMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 菜单表 数据层
 */
@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {

    /** 根据用户ID查询菜单权限列表 */
    @Select("SELECT DISTINCT m.perms FROM sys_menu m " +
            "LEFT JOIN sys_role_menu rm ON m.menu_id = rm.menu_id " +
            "LEFT JOIN sys_user_role ur ON rm.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND m.status = '0' AND m.perms IS NOT NULL AND m.perms != ''")
    List<String> selectPermsByUserId(@Param("userId") Long userId);

    /** 查询所有正常状态的菜单 */
    @Select("SELECT * FROM sys_menu WHERE status = '0' AND visible = '0' ORDER BY parent_id, order_num")
    List<SysMenu> selectNormalMenus();

    /** 根据角色ID查询菜单列表 */
    @Select("SELECT m.* FROM sys_menu m " +
            "INNER JOIN sys_role_menu rm ON m.menu_id = rm.menu_id " +
            "WHERE rm.role_id = #{roleId} AND m.status = '0' " +
            "ORDER BY m.parent_id, m.order_num")
    List<SysMenu> selectMenusByRoleId(@Param("roleId") Long roleId);
}
