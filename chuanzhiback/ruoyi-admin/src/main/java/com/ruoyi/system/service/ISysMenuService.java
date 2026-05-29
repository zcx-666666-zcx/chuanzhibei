package com.ruoyi.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.system.domain.RouterVo;
import com.ruoyi.system.domain.SysMenu;

import java.util.List;

/**
 * 菜单 业务层接口
 */
public interface ISysMenuService extends IService<SysMenu> {

    /** 查询菜单树列表 */
    List<SysMenu> selectMenuList(SysMenu menu, Long userId);

    /** 根据用户ID查询菜单树 */
    List<SysMenu> selectMenuTreeByUserId(Long userId);

    /** 根据用户ID查询前端路由 */
    List<RouterVo> buildMenusByUserId(Long userId);

    /** 查询所有正常菜单（树形） */
    List<SysMenu> selectMenuTree();

    /** 查询所有菜单 */
    List<SysMenu> selectMenuAll();

    /** 新增菜单 */
    int insertMenu(SysMenu menu);

    /** 修改菜单 */
    int updateMenu(SysMenu menu);

    /** 删除菜单 */
    int deleteMenuById(Long menuId);

    /** 根据角色ID查询菜单列表 */
    List<SysMenu> selectMenusByRoleId(Long roleId);
}
