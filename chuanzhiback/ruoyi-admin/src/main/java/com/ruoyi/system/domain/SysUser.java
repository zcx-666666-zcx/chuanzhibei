package com.ruoyi.system.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ruoyi.common.core.BaseEntity;

import java.util.Date;
import java.util.List;

/**
 * 用户信息表 sys_user
 */
@TableName("sys_user")
public class SysUser extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long userId;

    private Long deptId;

    private String userName;

    private String nickName;

    private String userType;

    private String email;

    private String phoneNumber;

    /** 性别（0男 1女 2未知） */
    private String sex;

    private String avatar;

    @JsonIgnore
    private String password;

    /** 状态（0正常 1停用） */
    private String status;

    /** 删除标志（0存在 2删除） */
    @TableLogic
    private String delFlag;

    private String loginIp;

    private Date loginDate;

    /** 部门名称（非数据库字段） */
    @TableField(exist = false)
    private String deptName;

    /** 角色列表（非数据库字段） */
    @TableField(exist = false)
    private List<Long> roleIds;

    @TableField(exist = false)
    private List<SysRole> roles;

    // ---- Getter / Setter ----

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getNickName() { return nickName; }
    public void setNickName(String nickName) { this.nickName = nickName; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDelFlag() { return delFlag; }
    public void setDelFlag(String delFlag) { this.delFlag = delFlag; }

    public String getLoginIp() { return loginIp; }
    public void setLoginIp(String loginIp) { this.loginIp = loginIp; }

    public Date getLoginDate() { return loginDate; }
    public void setLoginDate(Date loginDate) { this.loginDate = loginDate; }

    public String getDeptName() { return deptName; }
    public void setDeptName(String deptName) { this.deptName = deptName; }

    public List<Long> getRoleIds() { return roleIds; }
    public void setRoleIds(List<Long> roleIds) { this.roleIds = roleIds; }

    public List<SysRole> getRoles() { return roles; }
    public void setRoles(List<SysRole> roles) { this.roles = roles; }
}
