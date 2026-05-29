package com.ruoyi.system.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.ruoyi.common.core.BaseEntity;

import java.util.List;

/**
 * 角色信息表 sys_role
 */
@TableName("sys_role")
public class SysRole extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long roleId;

    private String roleName;

    private String roleKey;

    private Integer roleSort;

    /** 数据范围（1全部 2自定义 3本部门 4本部门及以下 5仅本人） */
    private String dataScope;

    private Integer menuCheckStrictly;

    private Integer deptCheckStrictly;

    /** 状态（0正常 1停用） */
    private String status;

    @TableLogic
    private String delFlag;

    /** 菜单ID列表（非数据库字段） */
    @TableField(exist = false)
    private List<Long> menuIds;

    // ---- Getter / Setter ----

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getRoleKey() { return roleKey; }
    public void setRoleKey(String roleKey) { this.roleKey = roleKey; }

    public Integer getRoleSort() { return roleSort; }
    public void setRoleSort(Integer roleSort) { this.roleSort = roleSort; }

    public String getDataScope() { return dataScope; }
    public void setDataScope(String dataScope) { this.dataScope = dataScope; }

    public Integer getMenuCheckStrictly() { return menuCheckStrictly; }
    public void setMenuCheckStrictly(Integer menuCheckStrictly) { this.menuCheckStrictly = menuCheckStrictly; }

    public Integer getDeptCheckStrictly() { return deptCheckStrictly; }
    public void setDeptCheckStrictly(Integer deptCheckStrictly) { this.deptCheckStrictly = deptCheckStrictly; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDelFlag() { return delFlag; }
    public void setDelFlag(String delFlag) { this.delFlag = delFlag; }

    public List<Long> getMenuIds() { return menuIds; }
    public void setMenuIds(List<Long> menuIds) { this.menuIds = menuIds; }
}
