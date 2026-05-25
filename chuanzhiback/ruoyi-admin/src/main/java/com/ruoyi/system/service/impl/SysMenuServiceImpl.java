package com.ruoyi.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ruoyi.system.domain.MetaVo;
import com.ruoyi.system.domain.RouterVo;
import com.ruoyi.system.domain.SysMenu;
import com.ruoyi.system.mapper.SysMenuMapper;
import com.ruoyi.system.service.ISysMenuService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * 菜单 业务层实现
 */
@Service
public class SysMenuServiceImpl extends ServiceImpl<SysMenuMapper, SysMenu> implements ISysMenuService {

    @Override
    public List<SysMenu> selectMenuList(SysMenu menu, Long userId) {
        // 超级管理员（userId=1）返回所有菜单
        if (userId == 1L) {
            return selectMenuAll();
        }
        return baseMapper.selectNormalMenus();
    }

    @Override
    public List<SysMenu> selectMenuTreeByUserId(Long userId) {
        List<SysMenu> menus;
        if (userId == 1L) {
            menus = selectMenuAll();
        } else {
            menus = baseMapper.selectNormalMenus();
        }
        return buildMenuTree(menus);
    }

    @Override
    public List<RouterVo> buildMenusByUserId(Long userId) {
        return buildRouters(selectMenuTreeByUserId(userId));
    }

    @Override
    public List<SysMenu> selectMenuTree() {
        List<SysMenu> menus = selectMenuAll();
        return buildMenuTree(menus);
    }

    @Override
    public List<SysMenu> selectMenuAll() {
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SysMenu::getParentId)
               .orderByAsc(SysMenu::getOrderNum);
        return list(wrapper);
    }

    @Override
    public int insertMenu(SysMenu menu) {
        return baseMapper.insert(menu);
    }

    @Override
    public int updateMenu(SysMenu menu) {
        return baseMapper.updateById(menu);
    }

    @Override
    public int deleteMenuById(Long menuId) {
        return baseMapper.deleteById(menuId);
    }

    @Override
    public List<SysMenu> selectMenusByRoleId(Long roleId) {
        return baseMapper.selectMenusByRoleId(roleId);
    }

    /**
     * 构建菜单树结构
     */
    private List<SysMenu> buildMenuTree(List<SysMenu> menus) {
        List<SysMenu> result = new ArrayList<>();
        for (SysMenu menu : menus) {
            if (menu.getParentId() == null || menu.getParentId() == 0L) {
                menu.setChildren(getChildren(menu, menus));
                result.add(menu);
            }
        }
        return result;
    }

    private List<SysMenu> getChildren(SysMenu parent, List<SysMenu> allMenus) {
        return allMenus.stream()
                .filter(m -> parent.getMenuId().equals(m.getParentId()))
                .peek(m -> m.setChildren(getChildren(m, allMenus)))
                .collect(Collectors.toList());
    }

    private List<RouterVo> buildRouters(List<SysMenu> menus) {
        List<RouterVo> routers = new ArrayList<>();
        for (SysMenu menu : menus) {
            if (!"F".equals(menu.getMenuType())) {
                RouterVo router = new RouterVo();
                router.setHidden("1".equals(menu.getVisible()));
                router.setName(capitalizeRouteName(menu.getPath(), menu.getMenuId()));
                router.setPath(resolveRouterPath(menu));
                router.setComponent(resolveComponent(menu));
                router.setQuery(menu.getQuery());
                router.setMeta(new MetaVo(menu.getMenuName(), menu.getIcon(), menu.getIsCache() != null && menu.getIsCache() == 1, null));

                List<SysMenu> children = filterVisibleChildren(menu.getChildren());
                if (!children.isEmpty()) {
                    router.setAlwaysShow(true);
                    router.setRedirect("noRedirect");
                    router.setChildren(buildRouters(children));
                }
                routers.add(router);
            }
        }
        return routers;
    }

    private List<SysMenu> filterVisibleChildren(List<SysMenu> children) {
        if (children == null) {
            return List.of();
        }
        return children.stream()
                .filter(item -> !"F".equals(item.getMenuType()))
                .collect(Collectors.toList());
    }

    private String resolveRouterPath(SysMenu menu) {
        if (menu.getParentId() != null && menu.getParentId() == 0L) {
            return "/" + menu.getPath();
        }
        return menu.getPath();
    }

    private String resolveComponent(SysMenu menu) {
        if (menu.getParentId() != null && menu.getParentId() == 0L) {
            return "Layout";
        }
        return menu.getComponent();
    }

    private String capitalizeRouteName(String path, Long menuId) {
        if (path == null || path.isBlank()) {
            return "Menu" + menuId;
        }
        String normalized = path.replaceAll("[^a-zA-Z0-9]", " ").trim();
        if (normalized.isEmpty()) {
            return "Menu" + menuId;
        }
        StringBuilder builder = new StringBuilder();
        for (String part : normalized.split("\\s+")) {
            if (!part.isEmpty()) {
                builder.append(part.substring(0, 1).toUpperCase(Locale.ROOT))
                        .append(part.substring(1));
            }
        }
        return builder.toString();
    }
}
