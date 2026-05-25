package com.ruoyi.security;

import com.ruoyi.system.domain.SysUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 登录用户身份信息（Spring Security UserDetails 实现）
 */
public class LoginUser implements UserDetails {

    private static final long serialVersionUID = 1L;

    private SysUser user;

    /** 角色集合 */
    private Set<String> roles;

    /** 权限集合 */
    private Set<String> permissions;

    public LoginUser() {}

    public LoginUser(SysUser user, Set<String> roles, Set<String> permissions) {
        this.user = user;
        this.roles = roles;
        this.permissions = permissions;
    }

    public Long getUserId() {
        return user != null ? user.getUserId() : null;
    }

    public SysUser getUser() { return user; }
    public void setUser(SysUser user) { this.user = user; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return permissions.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return user != null ? user.getPassword() : null;
    }

    @Override
    public String getUsername() {
        return user != null ? user.getUserName() : null;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user != null && !"1".equals(user.getStatus());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user != null && !"1".equals(user.getStatus());
    }
}
