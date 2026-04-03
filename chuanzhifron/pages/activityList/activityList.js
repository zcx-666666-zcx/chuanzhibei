// pages/activityList/activityList.js
import { request } from '../../utils/util.js'
import { getCurrentUser } from '../../utils/auth.js'

Page({
  data: {
    activities: [],
    loading: true
  },

  onLoad: function(options) {
    this.loadActivities();
  },

  // 加载活动列表
  loadActivities: function() {
    this.setData({ loading: true });
    request({
      url: '/activity/list'
    }).then(res => {
      const list = res.data?.list || res.data || [];
      const activities = list.map(item => {
        // 处理日期显示
        let day = item.day;
        let month = item.month;
        if (item.time) {
          const dateMatch = item.time.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            day = dateMatch[3];
            month = months[parseInt(dateMatch[2]) - 1] || dateMatch[2] + '月';
          }
        }
        
        return {
          ...item,
          day: day || '15',
          month: month || '六月',
          buttonText: item.buttonText || (item.capacity > 0 && item.participants >= item.capacity ? '已满员' : '报名参加')
        };
      });

      this.setData({
        activities: activities,
        loading: false
      });
    }).catch(err => {
      console.error('获取活动失败:', err);
      this.setData({
        activities: [],
        loading: false
      });
      wx.showToast({
        title: err.message || '获取活动失败',
        icon: 'none'
      });
    });
  },

  // 参加活动
  joinActivity: function(e) {
    const item = e.currentTarget.dataset.item;
    if (item.buttonText === '已满员') {
      wx.showToast({
        title: '活动已满员',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '参加活动',
      content: `确定要${item.buttonText || '参加'}"${item.title}"吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          // 这里可以调用后端接口进行报名
          request({
            url: '/activity/join',
            method: 'POST',
            data: {
              activityId: item.id
            }
          }).then(response => {
            if (response && response.success) {
              // 保存预约信息到本地存储
              const bookingType = item.buttonText === '报名参加' ? 'activity' : 'watch';
              this.saveBooking({
                type: bookingType, // 预约类型：活动报名或预约观看
                activityId: item.id,
                activityTitle: item.title,
                time: item.time || '待确认',
                location: item.location || '待确认',
                description: item.description || '',
                status: 'pending',
                statusText: '待确认'
              });
              
              wx.showToast({
                title: item.buttonText === '报名参加' ? '报名成功' : '预约成功',
                icon: 'success'
              });
              // 刷新活动列表
              this.loadActivities();
            } else {
              wx.showToast({
                title: response.message || '操作失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('参加活动失败:', err);
            // 即使接口失败，也保存到本地存储（离线支持）
            const bookingType = item.buttonText === '报名参加' ? 'activity' : 'watch';
            this.saveBooking({
              type: bookingType,
              activityId: item.id,
              activityTitle: item.title,
              time: item.time || '待确认',
              location: item.location || '待确认',
              description: item.description || '',
              status: 'pending',
              statusText: '待确认'
            });
            
            wx.showToast({
              title: item.buttonText === '报名参加' ? '报名成功' : '预约成功',
              icon: 'success'
            });
          });
        }
      }
    });
  },

  // 保存预约信息到后端
  saveBooking: function(bookingData) {
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
    
    // 准备发送到后端的数据
    const bookingRequest = {
      userId: userId,
      type: bookingData.type,
      status: bookingData.status || 'pending',
      time: bookingData.time || '待确认',
      location: bookingData.location || '待确认',
      contact: bookingData.contact || '待确认'
    };
    
    // 根据类型添加不同的字段
    if (bookingData.type === 'experience') {
      bookingRequest.masterId = bookingData.masterId;
      bookingRequest.masterName = bookingData.masterName;
      bookingRequest.skill = bookingData.skill;
      bookingRequest.masterAvatar = bookingData.masterAvatar || '';
    } else if (bookingData.type === 'activity' || bookingData.type === 'watch') {
      bookingRequest.activityId = bookingData.activityId;
      bookingRequest.activityTitle = bookingData.activityTitle;
    }
    
    // 调用后端API保存预约
    request({
      url: '/user/bookings',
      method: 'POST',
      data: bookingRequest
    }).then(res => {
      if (res.success) {
        console.log('预约信息已保存到后端:', res.data);
      } else {
        throw new Error(res.message || '保存预约失败');
      }
    }).catch(err => {
      console.error('保存预约信息失败:', err);
      wx.showToast({
        title: err.message || '保存失败，请重试',
        icon: 'none'
      });
    });
  }
})

