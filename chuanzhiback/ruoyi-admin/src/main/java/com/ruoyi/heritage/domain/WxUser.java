package com.ruoyi.heritage.domain;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** 微信小程序用户 — 对应 users 表（区别于 sys_user 系统用户） */
@TableName("users")
public class WxUser {
    @TableId(type = IdType.AUTO) private Long id;
    private String openid;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String gender;
    private String country;
    private String province;
    private String city;
    private String email;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date createTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") private Date updateTime;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getOpenid() { return openid; } public void setOpenid(String openid) { this.openid = openid; }
    public String getUsername() { return username; } public void setUsername(String username) { this.username = username; }
    public String getNickname() { return nickname; } public void setNickname(String nickname) { this.nickname = nickname; }
    public String getAvatarUrl() { return avatarUrl; } public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getGender() { return gender; } public void setGender(String gender) { this.gender = gender; }
    public String getCountry() { return country; } public void setCountry(String country) { this.country = country; }
    public String getProvince() { return province; } public void setProvince(String province) { this.province = province; }
    public String getCity() { return city; } public void setCity(String city) { this.city = city; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public Date getCreateTime() { return createTime; } public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; } public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}
