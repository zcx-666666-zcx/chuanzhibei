// pages/masterList/masterList.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { getCurrentUser, isLoggedIn } = require('../../utils/auth.js')
const { buildStaticUrl } = require('../../utils/config.js')

Page({
  data: {
    currentCategory: 'all',
    /** 接口或兜底全量数据，筛选不修改本数组 */
    masterListAll: [],
    /** 当前分类下的展示列表 */
    displayMasters: [],
    loading: true
  },

  getFavoriteMasterIds() {
    const ids = wx.getStorageSync('favoriteMasterIds')
    return Array.isArray(ids) ? ids.map((n) => Number(n)).filter(Boolean) : []
  },

  setFavoriteMasterIds(ids) {
    wx.setStorageSync('favoriteMasterIds', ids)
  },

  onLoad: function(options) {
    // 获取传递过来的分类参数
    const category = options.category || 'all';
    this.setData({
      currentCategory: category
    });
    this.loadMasterList();
  },

  // 加载传承人列表
  loadMasterList: function() {
    request({
      url: '/inheritor/list'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取传承人失败');
      }

      const list = res.data?.list || res.data || [];

      const favoriteIds = this.getFavoriteMasterIds()
      // 处理传承人数据
      const masterList = list.map((item, index) => {
        // 处理头像
        let avatar = '';
        if (item.avatar || item.imageUrl) {
          const imgUrl = item.avatar || item.imageUrl;
          avatar = imgUrl.startsWith('http')
            ? imgUrl
            : buildStaticUrl(imgUrl);
        } else {
          const imageNames = ['master_jianzhi', 'master_jingjumei', 'master_jingtai', 'master_junci', 'master_suxiu'];
          const imgName = imageNames[index % imageNames.length];
          avatar = buildStaticUrl(`/uploads/masters_InheritorCommunit/${imgName}.jpg`);
        }

        return {
          ...item,
          avatar: avatar,
          introduction: item.introduction || item.description || '暂无介绍',
          skill: item.skill || '传统技艺',
          title: item.title || '国家级传承人',
          isFavorite: favoriteIds.includes(Number(item.id)),
          category: this.getCategoryBySkill(item.skill || '传统技艺')
        };
      });
      
      const source = masterList.length === 0 ? this.getDefaultMasters() : masterList;
      this.setData(
        {
          masterListAll: source,
          loading: false
        },
        () => this.applyCategoryFilter()
      );
    }).catch(err => {
      console.error('获取传承人失败:', err);
      wx.showToast({
        title: requestErrorMessage(err),
        icon: 'none'
      });
      const defaultMasters = this.getDefaultMasters().map((item) => ({
        ...item,
        isFavorite: this.getFavoriteMasterIds().includes(Number(item.id))
      }));
      this.setData(
        {
          masterListAll: defaultMasters,
          loading: false
        },
        () => this.applyCategoryFilter()
      );
    });
  },

  // 根据技能名称获取分类
  getCategoryBySkill: function(skill) {
    if (skill.includes('苏绣')) return 'suxiu';
    if (skill.includes('景泰蓝')) return 'jingtai';
    if (skill.includes('剪纸')) return 'jianzhi';
    if (skill.includes('京剧')) return 'jingju';
    if (skill.includes('钧瓷')) return 'junci';
    return 'all';
  },

  applyCategoryFilter: function() {
    const { currentCategory, masterListAll } = this.data;
    const filtered =
      currentCategory === 'all'
        ? masterListAll.slice()
        : masterListAll.filter(item => item.category === currentCategory);
    this.setData({ displayMasters: filtered });
  },

  onCategoryFilter: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category }, () => this.applyCategoryFilter());
  },

  // 获取默认传承人数据
  getDefaultMasters: function() {
    const baseUrl = buildStaticUrl('/uploads/masters_InheritorCommunit/');
    return [
      {
        id: 1,
        name: '张同禄',
        skill: '景泰蓝制作技艺',
        title: '中国工艺美术大师',
        introduction: '景泰蓝制作技艺国家级传承人，从业50余年，擅长掐丝珐琅工艺，作品多次获得国内外大奖。',
        avatar: baseUrl + 'master_jingtai.jpg',
        isFavorite: false,
        category: 'jingtai'
      },
      {
        id: 2,
        name: '姚建萍',
        skill: '苏绣',
        title: '江苏省工艺美术大师',
        introduction: '苏绣技艺传承人，创新了多种刺绣技法，将传统苏绣与现代艺术相结合，作品风格独特。',
        avatar: baseUrl + 'master_suxiu.jpg',
        isFavorite: false,
        category: 'suxiu'
      },
      {
        id: 3,
        name: '高凤莲',
        skill: '剪纸',
        title: '国家级传承人',
        introduction: '陕北剪纸艺术传承人，擅长传统民间剪纸技艺，作品充满浓厚的乡土气息和民族特色。',
        avatar: baseUrl + 'master_jianzhi.jpg',
        isFavorite: false,
        category: 'jianzhi'
      },
      {
        id: 4,
        name: '梅葆玖',
        skill: '京剧',
        title: '京剧表演艺术家',
        introduction: '京剧大师梅兰芳之子，继承并发扬梅派艺术，在京剧表演和传承方面做出卓越贡献。',
        avatar: baseUrl + 'master_jingjumei.jpg',
        isFavorite: false,
        category: 'jingju'
      },
      {
        id: 5,
        name: '孔相卿',
        skill: '钧瓷烧制技艺',
        title: '中国工艺美术大师',
        introduction: '钧瓷烧制技艺传承人，在传统钧瓷工艺基础上不断创新，作品具有很高的艺术价值和收藏价值。',
        avatar: baseUrl + 'master_junci.jpg',
        isFavorite: false,
        category: 'junci'
      }
    ];
  },

  onMasterTap: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!item || !item.id) {
      return
    }
    wx.navigateTo({
      url: `/pages/inheritorDetail/inheritorDetail?id=${item.id}`
    })
  },

  bookExperience: function(e) {
    const item = e.currentTarget.dataset.item;
    this.confirmAndSubmitBooking(item);
  },

  confirmAndSubmitBooking: function(item) {
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再预约体验',
        confirmText: '去登录',
        success: (r) => {
          if (r.confirm) wx.navigateTo({ url: '/pages/login/login' });
        }
      });
      return;
    }
    wx.showModal({
      title: '预约体验',
      content: `确定要预约「${item.name}」的「${item.skill}」体验吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定预约',
      success: (res) => {
        if (!res.confirm) return;
        this.saveBooking({
          type: 'experience',
          masterId: item.id,
          masterName: item.name,
          skill: item.skill,
          masterAvatar: item.avatar || item.image || '',
          time: this.formatBookingTime(),
          location: '待确认',
          status: 'pending',
          statusText: '待确认'
        })
          .then(() => {
            wx.showToast({ title: '预约成功', icon: 'success' });
          })
          .catch((err) => {
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
      wx.showToast({ title: '请先登录', icon: 'none' });
      return Promise.reject(new Error('未登录'));
    }

    const userId = user.id || user.userId;
    if (!userId) {
      wx.showToast({ title: '无法获取用户信息', icon: 'none' });
      return Promise.reject(new Error('无用户ID'));
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
  },

  // 格式化预约时间（生成未来7-14天的随机时间）
  formatBookingTime: function() {
    const now = new Date();
    const daysLater = Math.floor(Math.random() * 7) + 7; // 7-14天后
    const bookingDate = new Date(now.getTime() + daysLater * 24 * 60 * 60 * 1000);
    
    const year = bookingDate.getFullYear();
    const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
    const day = String(bookingDate.getDate()).padStart(2, '0');
    
    // 随机选择时间段
    const timeSlots = ['10:00-12:00', '14:00-16:00', '15:00-17:00'];
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    
    return `${year}-${month}-${day} ${timeSlot}`;
  },

  toggleFavorite: function(e) {
    const item = e.currentTarget.dataset.item;
    const masterListAll = this.data.masterListAll.map((m) =>
      m.id === item.id ? { ...m, isFavorite: !m.isFavorite } : m
    );
    const next = masterListAll.find((m) => m.id === item.id);
    const favoriteIds = masterListAll.filter((m) => m.isFavorite).map((m) => Number(m.id));
    this.setFavoriteMasterIds(favoriteIds);
    this.setData({ masterListAll }, () => this.applyCategoryFilter());
    if (next) {
      wx.showToast({
        title: next.isFavorite ? '已标记喜欢' : '已取消标记',
        icon: 'success'
      });
    }
  }
})

