/**
 * 用户认证工具函数
 */
const { request } = require('./util')

/**
 * 微信登录
 */
const wxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          resolve(res.code);
        } else {
          reject(res);
        }
      },
      fail: err => {
        reject(err);
      }
    });
  });
};

/**
 * 用户名密码登录
 * @param {Object} loginData 登录数据
 */
const loginWithUsername = (loginData) => {
  return request({
      url: '/auth/login',
      method: 'POST',
      data: {
        username: loginData.username,
        password: loginData.password
      }
    }).then(res => {
        if (res.success) {
          // 存储token和用户信息
          const token = res.data?.token || res.token;
          const user = res.data?.user || res.user;
          
          console.log('登录成功，存储token:', token);
          console.log('登录成功，存储用户信息:', user);
          console.log('用户ID:', user?.id);
          
          if (token) {
            wx.setStorageSync('token', token);
          }
          if (user) {
            wx.setStorageSync('userInfo', user);
          }
          return res;
        } else {
          throw res;
        }
      })
};

/**
 * 用户登录到后端系统
 * @param {Object} userInfo 用户信息
 */
const loginToBackend = (userInfo) => {
  return request({
      url: '/auth/login',
      method: 'POST',
      data: {
        openid: userInfo.openid || '',
        nickname: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || '',
        gender: userInfo.gender || '',
        country: userInfo.country || '',
        province: userInfo.province || '',
        city: userInfo.city || '',
        language: userInfo.language || ''
      }
    }).then(res => {
        if (res.success) {
          // 存储token和用户信息
          const token = res.data?.token || res.token;
          const user = res.data?.user || res.user;
          
          console.log('登录成功，存储token:', token);
          console.log('登录成功，存储用户信息:', user);
          console.log('用户ID:', user?.id);
          
          if (token) {
            wx.setStorageSync('token', token);
          }
          if (user) {
            wx.setStorageSync('userInfo', user);
          }
          return res;
        } else {
          throw res;
        }
      })
};

/**
 * 用户注册
 * @param {Object} registerData 注册数据
 */
const registerUser = (registerData) => {
  return request({
      url: '/auth/register',
      method: 'POST',
      data: {
        username: registerData.username,
        password: registerData.password,
        email: registerData.email
      }
    }).then(res => {
        if (res.success) {
          // 存储token和用户信息
          const token = res.data?.token || res.token;
          const user = res.data?.user || res.user;
          
          console.log('登录成功，存储token:', token);
          console.log('登录成功，存储用户信息:', user);
          console.log('用户ID:', user?.id);
          
          if (token) {
            wx.setStorageSync('token', token);
          }
          if (user) {
            wx.setStorageSync('userInfo', user);
          }
          return res;
        } else {
          throw res;
        }
      })
};

/**
 * 用户登出
 */
const logout = () => {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
};

/**
 * 检查是否已登录
 */
const isLoggedIn = () => {
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  // 同时检查token和userInfo是否存在
  return !!(token && userInfo);
};

/**
 * 获取当前用户信息
 */
const getCurrentUser = () => {
  const userInfo = wx.getStorageSync('userInfo');
  // 如果userInfo是字符串，尝试解析
  if (typeof userInfo === 'string') {
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      console.error('解析用户信息失败:', e);
      return null;
    }
  }
  return userInfo;
};

module.exports = {
  wxLogin,
  loginWithUsername,
  loginToBackend,
  registerUser,
  logout,
  isLoggedIn,
  getCurrentUser
};