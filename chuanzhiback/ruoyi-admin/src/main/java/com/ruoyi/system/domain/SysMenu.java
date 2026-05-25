package com.ruoyi.system.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.ruoyi.common.core.BaseEntity;

import java.util.List;

/**
 * 菜单权限表 sys_menu
 */
@TableName("sys_menu")
public class SysMenu extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long menuId;

    private String menuName;

    private Long parentId;

    private Integer orderNum;

    private String path;

    private String component;

    private String query;

    /** 是否为外链（0是 1否） */
    private Integer isFrame;

    /** 是否缓存（0缓存 1不缓存） */
    private Integer isCache;

    /** 菜单类型（M目录 C菜单 F按钮） */
    private String menuType;

    /** 显示状态（0显示 1隐藏） */
    private String visible;

    /** 状态（0正常 1停用） */
    private String status;

    private String perms;

    private String icon;

    /** 子菜单（非数据库字段） */
    @TableField(exist = false)
    private List<SysMenu> children;

    // ---- Getter / Setter ----

    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }

    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public Integer getOrderNum() { return orderNum; }
    public void setOrderNum(Integer orderNum) { this.orderNum = orderNum; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getComponent() { return component; }
    public void setComponent(String component) { this.component = component; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Integer getIsFrame() { return isFrame; }
    public void setIsFrame(Integer isFrame) { this.isFrame = isFrame; }

    public Integer getIsCache() { return isCache; }
    public void setIsCache(Integer isCache) { this.isCache = isCache; }

    public String getMenuType() { return menuType; }
    public void setMenuType(String menuType) { this.menuType = menuType; }

    public String getVisible() { return visible; }
    public void setVisible(String visible) { this.visible = visible; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPerms() { return perms; }
    public void setPerms(String perms) { this.perms = perms; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public List<SysMenu> getChildren() { return children; }
    public void setChildren(List<SysMenu> children) { this.children = children; }
}
