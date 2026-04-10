// pages/activityList/activityList.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { getCurrentUser, isLoggedIn } = require('../../utils/auth.js')

Page({
  data: {
    activities: [],
    loading: true,
    loadError: false,
    loadErrorText: ''
  },

  onLoad: function(options) {
    this.loadActivities();
  },

  loadActivities: function() {
    this.setData({ loading: true, loadError: false, loadErrorText: '' });
    request({
      url: '/activity/list'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取活动列表失败');
      }
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
        loading: false,
        loadError: false,
        loadErrorText: ''
      });
    }).catch(err => {
      console.error('获取活动失败:', err);
      const msg = requestErrorMessage(err)
      this.setData({
        activities: [],
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

  onRetryLoadActivities() {
    this.loadActivities();
  },

  joinActivity: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再报名活动',
        confirmText: '去登录',
        success: (r) => {
          if (r.confirm) wx.navigateTo({ url: '/pages/login/login' });
        }
      });
      return;
    }
    if (item.buttonText === '已满员') {
      wx.showToast({
        title: '活动已满员',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '参加活动',
      content: `确定要${item.buttonText || '参加'}「${item.title}」吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (!res.confirm) return;
        const bookingType = item.buttonText === '报名参加' ? 'activity' : 'watch';
        const bookingPayload = {
          type: bookingType,
          activityId: item.id,
          activityTitle: item.title,
          time: item.time || '待确认',
          location: item.location || '待确认',
          description: item.description || '',
          status: 'pending',
          statusText: '待确认'
        };
        request({
          url: '/activity/join',
          method: 'POST',
          data: {
            activityId: item.id
          }
        })
          .then((response) => {
            if (!response || !response.success) {
              throw new Error(response?.message || '报名失败');
            }
            return this.saveBooking(bookingPayload);
          })
          .then(() => {
            wx.showToast({
              title: item.buttonText === '报名参加' ? '报名成功' : '预约成功',
              icon: 'success'
            });
            this.loadActivities();
          })
          .catch((err) => {
            console.error('参加活动失败:', err);
            wx.showToast({
              title: requestErrorMessage(err),
              icon: 'none'
            });
          });
      }
    });
  },

  saveBooking: function(bookingData) {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('请先登录'));
    }

    const userId = user.id || user.userId;
    if (!userId) {
      return Promise.reject(new Error('无法获取用户信息'));
    }

    const bookingRequest = {
      userId: userId,
      type: bookingData.type,
      status: bookingData.status || 'pending',
      time: bookingData.time || '待确认',
      location: bookingData.location || '待确认',
      contact: bookingData.contact || '待确认'
    };

    if (bookingData.type === 'experience') {
      bookingRequest.masterId = bookingData.masterId;
      bookingRequest.masterName = bookingData.masterName;
      bookingRequest.skill = bookingData.skill;
      bookingRequest.masterAvatar = bookingData.masterAvatar || '';
    } else if (bookingData.type === 'activity' || bookingData.type === 'watch') {
      bookingRequest.activityId = bookingData.activityId;
      bookingRequest.activityTitle = bookingData.activityTitle;
    }

    return request({
      url: '/user/bookings',
      method: 'POST',
      data: bookingRequest
    }).then((res) => {
      if (!res.success) {
        throw new Error(res.message || '保存预约失败');
      }
      return res;
    });
  }
})

