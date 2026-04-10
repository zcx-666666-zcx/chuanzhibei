// pages/bookingList/bookingList.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { getCurrentUser, isLoggedIn } = require('../../utils/auth.js')

Page({
  data: {
    bookings: [],
    loading: true,
    loadError: false,
    loadErrorText: ''
  },

  onLoad: function() {
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
          } else {
            wx.navigateBack();
          }
        }
      });
      return;
    }
    
    this.loadBookings();
  },

  // 加载预约数据
  loadBookings: function() {
    this.setData({ loading: true, loadError: false, loadErrorText: '' })
    const user = getCurrentUser();
    if (!user) {
      this.setData({
        bookings: [],
        loading: false,
        loadError: true,
        loadErrorText: '用户信息缺失，请重新登录'
      });
      return;
    }
    
    const userId = user.id || user.userId;
    if (!userId) {
      console.error('无法获取用户ID');
      this.setData({
        bookings: [],
        loading: false,
        loadError: true,
        loadErrorText: '无法获取用户信息'
      });
      wx.showToast({
        title: '无法获取用户信息',
        icon: 'none'
      });
      return;
    }
    
    request({
      url: '/user/bookings/me'
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
        loading: false,
        loadError: false,
        loadErrorText: ''
      });
    }).catch(err => {
      console.error('获取预约数据失败:', err);
      const msg = requestErrorMessage(err)
      this.setData({
        bookings: [],
        loading: false,
        loadError: true,
        loadErrorText: msg
      });
      wx.showToast({
        title: msg,
        icon: 'none'
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
            url: `/user/bookings/me/booking/${bookingId}`,
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
              title: requestErrorMessage(err),
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 查看详情
  viewBookingDetail: function(e) {
    const item = e.currentTarget.dataset.item;
    const title = item.skill ? `${item.masterName} - ${item.skill}` : item.masterName;
    wx.showModal({
      title: title,
      content: `时间：${item.time}\n地点：${item.location}\n联系方式：${item.contact || '待确认'}\n状态：${item.statusText}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadBookings().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onRetryLoad() {
    this.loadBookings()
  }
})

