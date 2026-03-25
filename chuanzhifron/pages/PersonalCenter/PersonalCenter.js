// PersonalCenter.js
import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'
import { buildApiUrl, buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    userInfo: {
      name: '访客',
      title: '非遗文化爱好者',
      avatar: buildStaticUrl('/uploads/login-bg.png.png')
    },
    userStats: {
      collections: 0,
      bookings: 0
    },
    collections: [],
    displayCollections: [], // 首页显示的收藏列表（只显示前几条）
    bookings: [],
    loading: true,
    showEditModal: false,
    editForm: {
      name: '',
      signature: '',
      avatar: ''
    }
  },

  onLoad: function() {
    // 页面加载时的初始化
    // 检查用户登录状态
    const user = getCurrentUser();
    const defaultAvatar = buildStaticUrl('/uploads/login-bg.png.png');
    
    if (user) {
      // 优先使用nickname（用户设置的昵称），然后是username（账号用户名），最后是其他字段
      const userName = user.nickname || user.nickName || user.username || user.name || '访客';
      const userAvatar = user.avatarUrl || user.avatar || defaultAvatar;
      const userTitle = user.signature || '非遗文化爱好者';
      
      this.setData({
        'userInfo.name': userName,
        'userInfo.avatar': userAvatar,
        'userInfo.title': userTitle
      });
    } else {
      // 如果没有登录用户，确保使用默认头像
      this.setData({
        'userInfo.avatar': defaultAvatar
      });
    }
    
    this.loadCollections();
    this.loadBookings();
  },

  onShow: function() {
    // 页面显示时刷新用户信息，确保显示最新的用户名
    const user = getCurrentUser();
    const defaultAvatar = buildStaticUrl('/uploads/login-bg.png.png');
    
    if (user) {
      // 优先使用nickname（用户设置的昵称），然后是username（账号用户名），最后是其他字段
      const userName = user.nickname || user.nickName || user.username || user.name || '访客';
      const userAvatar = user.avatarUrl || user.avatar || defaultAvatar;
      const userTitle = user.signature || '非遗文化爱好者';
      
      this.setData({
        'userInfo.name': userName,
        'userInfo.avatar': userAvatar,
        'userInfo.title': userTitle
      });
    } else {
      // 如果没有登录用户，使用默认值
      this.setData({
        'userInfo.name': '访客',
        'userInfo.avatar': defaultAvatar,
        'userInfo.title': '非遗文化爱好者'
      });
    }
    
    // 刷新所有数据
    this.loadCollections();
    this.loadBookings();
  },
  
  // 加载收藏数据
  loadCollections: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      this.setData({
        collections: [],
        displayCollections: [],
        'userStats.collections': 0,
        loading: false
      });
      return;
    }
    
    // 获取当前用户ID
    const user = getCurrentUser();
    if (!user) {
      this.setData({
        collections: [],
        displayCollections: [],
        'userStats.collections': 0,
        loading: false
      });
      return;
    }
    
    const userId = user.id || user.userId;
    if (!userId) {
      console.error('无法获取用户ID');
      this.setData({
        collections: [],
        displayCollections: [],
        'userStats.collections': 0,
        loading: false
      });
      return;
    }
    
    request({
      url: `/user/collections/${userId}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取收藏失败');
      }
      
      const list = res.data || [];
      
      // 处理收藏数据，确保图片路径正确
      const collections = list.map(item => {
        let imageUrl = item.imageUrl || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = buildStaticUrl(imageUrl);
        }
        
        return {
          ...item,
          image: imageUrl, // 添加image字段用于兼容wxml
          imageUrl: imageUrl,
          name: item.heritageName || item.name,
          level: item.heritageLevel || item.level,
          description: item.heritageDescription || item.description,
          heritageId: item.heritageId || item.id // 确保heritageId存在
        };
      });
      
      // 首页只显示前3条收藏
      const displayCollections = collections.slice(0, 3);
      
      this.setData({
        collections: collections,
        displayCollections: displayCollections,
        'userStats.collections': collections.length,
        loading: false
      });
    }).catch(err => {
      console.error('获取收藏失败:', err);
      // 如果接口失败，显示空列表
      this.setData({
        collections: [],
        displayCollections: [],
        'userStats.collections': 0,
        loading: false
      });
      wx.showToast({
        title: '加载收藏失败',
        icon: 'none'
      });
    });
  },


  // 加载预约数据
  loadBookings: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      this.setData({
        bookings: [],
        'userStats.bookings': 0
      });
      return;
    }
    
    // 获取当前用户ID
    const user = getCurrentUser();
    if (!user) {
      this.setData({
        bookings: [],
        'userStats.bookings': 0
      });
      return;
    }
    
    const userId = user.id || user.userId;
    if (!userId) {
      console.error('无法获取用户ID');
      this.setData({
        bookings: [],
        'userStats.bookings': 0
      });
      return;
    }
    
    request({
      url: `/user/bookings/${userId}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取预约失败');
      }
      
      const list = res.data || [];
      
      // 处理预约数据，统一格式
      const processedBookings = list.map(booking => {
        let bookingItem = {
          id: booking.id,
          status: booking.status || 'pending',
          statusText: this.getStatusText(booking.status || 'pending'),
          time: booking.time || '待确认',
          location: booking.location || '待确认',
          contact: booking.contact || '待确认'
        };
        
        // 根据预约类型设置不同的显示字段
        if (booking.type === 'experience') {
          // 传承人体验预约
          bookingItem.masterId = booking.masterId;
          bookingItem.masterName = booking.masterName || '';
          bookingItem.skill = booking.skill || '';
          bookingItem.masterAvatar = booking.masterAvatar || '';
          bookingItem.type = 'experience';
        } else if (booking.type === 'activity') {
          // 活动报名
          bookingItem.activityId = booking.activityId;
          bookingItem.masterName = booking.activityTitle || '';
          bookingItem.skill = '活动报名';
          bookingItem.masterAvatar = ''; // 活动没有头像
          bookingItem.type = 'activity';
        } else if (booking.type === 'watch') {
          // 预约观看
          bookingItem.activityId = booking.activityId;
          bookingItem.masterName = booking.activityTitle || '';
          bookingItem.skill = '预约观看';
          bookingItem.masterAvatar = ''; // 活动没有头像
          bookingItem.type = 'watch';
        }
        
        return bookingItem;
      });
      
      this.setData({
        bookings: processedBookings,
        'userStats.bookings': processedBookings.length
      });
    }).catch(err => {
      console.error('获取预约数据失败:', err);
      this.setData({
        bookings: [],
        'userStats.bookings': 0
      });
    });
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      'pending': '待确认',
      'confirmed': '已确认',
      'cancelled': '已取消',
      'completed': '已完成'
    };
    return statusMap[status] || '待确认';
  },

  // 头像加载失败时使用默认头像
  onAvatarError: function(e) {
    const defaultAvatar = buildStaticUrl('/uploads/login-bg.png.png');
    this.setData({
      'userInfo.avatar': defaultAvatar
    });
  },

  // 点击用户信息卡片
  onUserCardTap: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    const user = getCurrentUser();
    if (!user) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // 初始化编辑表单
    this.setData({
      showEditModal: true,
      editForm: {
        name: user.nickname || user.nickName || user.username || user.name || '',
        signature: user.signature || '',
        avatar: user.avatarUrl || user.avatar || this.data.userInfo.avatar
      }
    });
  },

  // 关闭编辑弹窗
  closeEditModal: function() {
    this.setData({
      showEditModal: false
    });
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 空函数，用于阻止点击弹窗内容时关闭弹窗
  },

  // 用户名称输入
  onNameInput: function(e) {
    this.setData({
      'editForm.name': e.detail.value
    });
  },

  // 个人签名输入
  onSignatureInput: function(e) {
    this.setData({
      'editForm.signature': e.detail.value
    });
  },

  // 选择头像
  chooseAvatar: function() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 上传图片到服务器
        wx.uploadFile({
          url: buildApiUrl('/files/upload-image'),
          filePath: tempFilePath,
          name: 'file',
          formData: {
            'type': 'avatar'
          },
          success: function(uploadRes) {
            try {
              // 解析响应数据
              let data;
              if (typeof uploadRes.data === 'string') {
                data = JSON.parse(uploadRes.data);
              } else {
                data = uploadRes.data;
              }
              
              console.log('上传响应:', data);
              
              if (data && data.success && data.data) {
                let imageUrl = data.data.url || data.data;
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = buildStaticUrl(imageUrl);
                }
                that.setData({
                  'editForm.avatar': imageUrl
                });
                wx.showToast({
                  title: '头像上传成功',
                  icon: 'success'
                });
              } else {
                const errorMsg = data?.message || data?.error || '上传失败';
                console.error('上传失败:', errorMsg, data);
                throw new Error(errorMsg);
              }
            } catch (e) {
              console.error('解析上传结果失败:', e, uploadRes);
              wx.showToast({
                title: e.message || '上传失败',
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: function(err) {
            console.error('上传头像失败:', err);
            wx.showToast({
              title: '上传失败，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: function(err) {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 保存用户信息
  saveUserInfo: function() {
    const user = getCurrentUser();
    if (!user) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    const userId = user.id || user.userId;
    if (!userId) {
      wx.showToast({
        title: '无法获取用户信息',
        icon: 'none'
      });
      return;
    }
    
    const editForm = this.data.editForm;
    
    // 准备更新数据
    const updateData = {};
    if (editForm.name) {
      updateData.nickname = editForm.name;
    }
    if (editForm.avatar) {
      updateData.avatarUrl = editForm.avatar;
    }
    if (editForm.signature !== undefined) {
      updateData.signature = editForm.signature;
    }
    
    // 调用后端API更新用户信息
    request({
      url: `/users/${userId}`,
      method: 'PUT',
      data: updateData
    }).then(res => {
      if (res.success) {
        // 更新本地存储的用户信息
        const updatedUser = res.data;
        wx.setStorageSync('userInfo', updatedUser);
        
        // 更新页面显示 - 优先使用nickname（用户设置的昵称）
        const userName = updatedUser.nickname || updatedUser.nickName || updatedUser.username || updatedUser.name || '访客';
        const userAvatar = updatedUser.avatarUrl || updatedUser.avatar || buildStaticUrl('/uploads/login-bg.png.png');
        const userTitle = updatedUser.signature || '非遗文化爱好者';
        
        this.setData({
          'userInfo.name': userName,
          'userInfo.avatar': userAvatar,
          'userInfo.title': userTitle,
          showEditModal: false
        });
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.message || '保存失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('保存用户信息失败:', err);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    });
  },

  // 设置按钮
  onSettings: function() {
    wx.showActionSheet({
      itemList: ['编辑资料', '隐私设置', '通知设置'],
      success: (res) => {
        const actions = ['编辑资料', '隐私设置', '通知设置'];
        if (res.tapIndex === 0) {
          this.onUserCardTap();
          return;
        }
        const key = res.tapIndex === 1 ? 'privacyEnabled' : 'notificationEnabled';
        const enabled = wx.getStorageSync(key) !== false;
        wx.setStorageSync(key, !enabled);
        wx.showToast({
          title: `${actions[res.tapIndex]}已${enabled ? '关闭' : '开启'}`,
          icon: 'none'
        });
      }
    });
  },

  // 收藏点击
  onCollectionTap: function(e) {
    const item = e.currentTarget.dataset.item;
    const heritageId = item.heritageId || item.id;
    
    // 如果heritageId不存在，使用收藏数据来显示详情
    if (!heritageId) {
      wx.showToast({
        title: '收藏项信息不完整',
        icon: 'none'
      });
      return;
    }
    
    // 将收藏数据存储到全局，以便详情页使用
    const collectionData = {
      name: item.name || item.heritageName,
      description: item.description || item.heritageDescription,
      level: item.level || item.heritageLevel,
      imageUrl: item.imageUrl || item.image,
      heritageId: heritageId
    };
    
    // 临时存储收藏数据
    wx.setStorageSync('tempCollectionData', collectionData);
    
    // 跳转到非遗详情页面
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${heritageId}&fromCollection=true`
    });
  },

  // 移除收藏
  removeCollection: function(e) {
    const item = e.currentTarget.dataset.item;
    const heritageName = item.heritageName || item.name || '该项目';
    
    wx.showModal({
      title: '移除收藏',
      content: `确定要移除"${heritageName}"的收藏吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          const user = getCurrentUser();
          if (!user) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            });
            return;
          }
          
          const userId = user.id || user.userId;
          if (!userId) {
            wx.showToast({
              title: '无法获取用户信息',
              icon: 'none'
            });
            return;
          }
          
          const heritageId = item.heritageId || item.id;
          if (!heritageId) {
            wx.showToast({
              title: '收藏项信息不完整',
              icon: 'none'
            });
            return;
          }
          
          // 调用后端接口删除收藏
          request({
            url: `/user/collections/${userId}/heritage/${heritageId}`,
            method: 'DELETE'
          }).then(response => {
            if (response && response.success) {
              // 重新加载收藏列表
              this.loadCollections();
              
              wx.showToast({
                title: '已移除收藏',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: response?.message || '移除收藏失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('移除收藏失败:', err);
            wx.showToast({
              title: '移除收藏失败，请重试',
              icon: 'none'
            });
          });
        }
      }
    });
  },


  // 取消预约
  cancelBooking: function(e) {
    const item = e.currentTarget.dataset.item;
    const bookingTitle = item.skill ? `${item.masterName} - ${item.skill}` : item.masterName;
    wx.showModal({
      title: '取消预约',
      content: `确定要取消"${bookingTitle}"的预约吗？`,
      showCancel: true,
      cancelText: '不取消',
      confirmText: '确定取消',
      success: (res) => {
        if (res.confirm) {
          const user = getCurrentUser();
          if (!user) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            });
            return;
          }
          
          const userId = user.id || user.userId;
          if (!userId) {
            wx.showToast({
              title: '无法获取用户信息',
              icon: 'none'
            });
            return;
          }
          
          const bookingId = item.id;
          if (!bookingId) {
            wx.showToast({
              title: '预约信息不完整',
              icon: 'none'
            });
            return;
          }
          
          // 调用后端接口删除预约
          request({
            url: `/user/bookings/${userId}/booking/${bookingId}`,
            method: 'DELETE'
          }).then(response => {
            if (response && response.success) {
              // 重新加载预约数据
              this.loadBookings();
              
              wx.showToast({
                title: '已取消预约',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: response?.message || '取消预约失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('取消预约失败:', err);
            wx.showToast({
              title: '取消预约失败，请重试',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 查看全部收藏
  viewAllCollections: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 跳转到收藏列表页面
    wx.navigateTo({
      url: '/pages/collectionList/collectionList'
    });
  },


  // 查看全部预约
  viewAllBookings: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 跳转到预约体验列表页面
    wx.navigateTo({
      url: '/pages/bookingList/bookingList'
    });
  },

  // 菜单点击
  onMenuTap: function(e) {
    const type = e.currentTarget.dataset.type;
    const menuMap = {
      profile: '个人资料',
      settings: '设置',
      help: '帮助与反馈',
      about: '关于我们'
    };
    
    if (type === 'settings') {
      wx.showActionSheet({
        itemList: ['编辑资料', '隐私设置', '通知设置', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 3) {
            // 退出登录
            wx.showModal({
              title: '退出登录',
              content: '确定要退出登录吗？',
              success: (res) => {
                if (res.confirm) {
                  // 清除用户信息
                  wx.removeStorageSync('token');
                  wx.removeStorageSync('userInfo');
                  
                  // 跳转到登录页面
                  wx.redirectTo({
                    url: '/pages/login/login'
                  });
                }
              }
            });
          } else {
            if (res.tapIndex === 0) {
              this.onUserCardTap();
              return;
            }
            const key = res.tapIndex === 1 ? 'privacyEnabled' : 'notificationEnabled';
            const enabled = wx.getStorageSync(key) !== false;
            wx.setStorageSync(key, !enabled);
            wx.showToast({
              title: `${['隐私设置', '通知设置'][res.tapIndex - 1]}已${enabled ? '关闭' : '开启'}`,
              icon: 'none'
            });
          }
        }
      });
    } else if (type === 'help') {
      wx.showModal({
        title: '帮助与反馈',
        content: '本地调试建议：\n1. 先启动后端再打开小程序\n2. 登录后再进行收藏/预约操作\n3. 如遇网络异常请检查 apiBaseUrl 配置',
        showCancel: false,
        confirmText: '知道了'
      });
    } else if (type === 'about') {
      wx.showModal({
        title: '关于我们',
        content: '非遗传承小程序（本地调试版）\n版本：v1.1.0-local\n技术栈：微信小程序 + Spring Boot',
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      wx.showModal({
        title: menuMap[type],
        content: '请点击头像卡片编辑个人资料',
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      loading: true
    });
    
    // 重新加载数据
    this.loadCollections();
    this.loadBookings();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

})