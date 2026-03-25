// InheritorCommunity.js
import { request } from '../../utils/util.js'
import { getCurrentUser } from '../../utils/auth.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    masterList: [],
    allMasterList: [], // 保存所有传承人数据用于筛选
    displayMasterList: [], // 首页显示的传承人列表（只显示4个）
    skillVideos: [],
    allSkillVideos: [], // 保存所有视频数据
    displaySkillVideos: [], // 首页显示的视频列表（只显示4个）
    activities: [],
    allActivities: [], // 保存所有活动数据
    displayActivities: [], // 首页显示的活动列表（只显示3个）
    currentCategory: 'all', // 当前筛选的分类
    showFilters: true, // 是否显示筛选器
    loading: true
  },

  onLoad: function() {
    // 页面加载时的初始化
    this.loadMasterList();
    this.loadSkillVideos();
    this.loadActivities();
  },
  
  // 加载传承人列表
  loadMasterList: function() {
    request({
      url: '/inheritor/list'
    }).then(res => {
      // 与后端 Result<T> 结构对齐：{ success, message, data }
      if (!res.success) {
        throw new Error(res.message || '获取传承人失败');
      }

      const list = res.data?.list || res.data || [];

      // 处理传承人数据：补充图片与日期字段
      const masterList = list.map((item, index) => {
        // 处理头像：如果不是完整URL，拼接基础路径
        let avatar = '';
        if (item.avatar || item.imageUrl) {
          const imgUrl = item.avatar || item.imageUrl;
          avatar = imgUrl.startsWith('http')
            ? imgUrl
            : buildStaticUrl(imgUrl);
        } else {
          // 如果没有图片URL，使用默认路径（基于5张图片循环使用）
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
          isFavorite: false, // 收藏状态
          category: this.getCategoryBySkill(item.skill || '传统技艺') // 添加分类标识
        };
      });
      
      // 如果后端数据为空，使用默认数据
      if (masterList.length === 0) {
        const defaultMasters = this.getDefaultMasters();
        this.setData({
          allMasterList: defaultMasters,
          loading: false
        }, () => {
          this.filterMasters();
        });
      } else {
        this.setData({
          allMasterList: masterList,
          loading: false
        }, () => {
          this.filterMasters();
        });
      }
    }).catch(err => {
      console.error('获取传承人失败:', err);
      // 使用默认数据
      const defaultMasters = this.getDefaultMasters();
      this.setData({
        allMasterList: defaultMasters,
        loading: false
      }, () => {
        this.filterMasters();
      });
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

  // 筛选传承人
  filterMasters: function() {
    const { currentCategory, allMasterList } = this.data;
    let filteredList = allMasterList;
    
    if (currentCategory !== 'all') {
      filteredList = allMasterList.filter(item => item.category === currentCategory);
    }
    
    // 首页只显示前4个
    const displayMasterList = filteredList.slice(0, 4);
    
    this.setData({
      masterList: filteredList,
      displayMasterList: displayMasterList
    });
  },

  // 分类筛选
  onCategoryFilter: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.filterMasters();
  },

  // 搜索功能
  onSearch: function() {
    wx.showModal({
      title: '搜索传承人',
      editable: true,
      placeholderText: '请输入传承人姓名或技艺名称',
      success: (res) => {
        if (res.confirm && res.content) {
          const keyword = res.content.trim();
          if (keyword) {
            const { allMasterList } = this.data;
            const filteredList = allMasterList.filter(item => {
              return item.name.includes(keyword) || 
                     (item.skill && item.skill.includes(keyword)) ||
                     (item.introduction && item.introduction.includes(keyword));
            });
            
            // 搜索时只显示前4个
            const displayMasterList = filteredList.slice(0, 4);
            
            this.setData({
              masterList: filteredList,
              displayMasterList: displayMasterList,
              currentCategory: 'all'
            });
            
            if (filteredList.length === 0) {
              wx.showToast({
                title: '未找到相关传承人',
                icon: 'none'
              });
            } else {
              wx.showToast({
                title: `找到${filteredList.length}位传承人`,
                icon: 'success'
              });
            }
          }
        }
      }
    });
  },

  // 分享功能
  onShare: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 分享传承人
  shareMaster: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 触发分享
    wx.showToast({
      title: `分享${item.name}的信息`,
      icon: 'success'
    });
  },

  // 切换收藏状态
  toggleFavorite: function(e) {
    const item = e.currentTarget.dataset.item;
    const { allMasterList, masterList, displayMasterList } = this.data;
    
    // 更新所有列表中的收藏状态
    const allIndex = allMasterList.findIndex(master => master.id === item.id);
    if (allIndex !== -1) {
      allMasterList[allIndex].isFavorite = !allMasterList[allIndex].isFavorite;
    }
    
    // 更新当前显示列表中的收藏状态
    const currentIndex = masterList.findIndex(master => master.id === item.id);
    if (currentIndex !== -1) {
      masterList[currentIndex].isFavorite = !masterList[currentIndex].isFavorite;
    }
    
    // 更新显示列表中的收藏状态
    const displayIndex = displayMasterList.findIndex(master => master.id === item.id);
    if (displayIndex !== -1) {
      displayMasterList[displayIndex].isFavorite = !displayMasterList[displayIndex].isFavorite;
    }
    
    this.setData({
      allMasterList: allMasterList,
      masterList: masterList,
      displayMasterList: displayMasterList
    });
    
    // 这里可以调用后端API保存收藏状态
    wx.showToast({
      title: allMasterList[allIndex].isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
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

  // 加载技艺视频
  loadSkillVideos: function() {
    request({
      url: '/video/list'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取视频失败');
      }
      const list = res.data?.list || res.data || [];
      const allSkillVideos = list.map(item => ({
        ...item,
        thumbnail: item.thumbnail && item.thumbnail.startsWith('http')
          ? item.thumbnail
          : buildStaticUrl(item.thumbnail || ''),
        views: item.views ? (item.views >= 10000 ? (item.views / 10000).toFixed(1) + '万' : item.views) : '0'
      }));
      
      // 如果后端数据为空，使用默认数据
      const skillVideos = allSkillVideos.length > 0 ? allSkillVideos : this.getDefaultSkillVideos();
      
      // 首页只显示前4个
      const displaySkillVideos = skillVideos.slice(0, 4);
      
      this.setData({
        allSkillVideos: skillVideos,
        skillVideos: skillVideos,
        displaySkillVideos: displaySkillVideos
      });
    }).catch(err => {
      console.error('获取视频失败:', err);
      // 使用默认数据
      const defaultVideos = this.getDefaultSkillVideos();
      const displaySkillVideos = defaultVideos.slice(0, 4);
      this.setData({
        allSkillVideos: defaultVideos,
        skillVideos: defaultVideos,
        displaySkillVideos: displaySkillVideos
      });
    });
  },

  // 获取默认技艺视频数据
  getDefaultSkillVideos: function() {
    return [
      {
        id: 1,
        title: '苏绣技艺展示',
        description: '国家级传承人姚建萍展示苏绣的精湛技艺和独特魅力，详细介绍平针、套针等传统针法',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_suxiu.jpg'),
        duration: '15:30',
        date: '2024-05-15',
        views: '3.2万'
      },
      {
        id: 2,
        title: '景泰蓝制作工艺',
        description: '工艺美术大师张同禄现场演示景泰蓝的掐丝、点蓝、烧制等关键工艺流程',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingtai.jpg'),
        duration: '18:45',
        date: '2024-05-12',
        views: '2.8万'
      },
      {
        id: 3,
        title: '剪纸艺术创作',
        description: '传承人高凤莲展示传统剪纸技法，从设计到剪裁，展现剪纸艺术的精妙',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jianzhi.jpg'),
        duration: '12:20',
        date: '2024-05-10',
        views: '1.9万'
      },
      {
        id: 4,
        title: '京剧身段表演',
        description: '梅派传人展示京剧表演的身段、唱腔和舞台艺术，传承经典剧目',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingjumei.jpg'),
        duration: '20:15',
        date: '2024-05-08',
        views: '4.5万'
      }
    ];
  },


  // 传承人点击
  onMasterTap: function(e) {
    const item = e.currentTarget.dataset.item;
    // 可以跳转到传承人详情页，这里先显示详情弹窗
    wx.showModal({
      title: item.name,
      content: `${item.title}\n${item.skill}\n\n${item.introduction}`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '预约体验',
      success: (res) => {
        if (res.confirm) {
          this.bookExperience({ currentTarget: { dataset: { item: item } } });
        }
      }
    });
  },

  // 预约体验
  bookExperience: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '预约体验',
      content: `确定要预约${item.name}的${item.skill}体验吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定预约',
      success: (res) => {
        if (res.confirm) {
          // 保存预约信息到本地存储
          this.saveBooking({
            type: 'experience', // 预约类型：体验
            masterId: item.id,
            masterName: item.name,
            skill: item.skill,
            masterAvatar: item.avatar || item.image || '',
            time: this.formatBookingTime(), // 生成预约时间
            location: '待确认',
            status: 'pending',
            statusText: '待确认'
          });
          
          wx.showToast({
            title: '预约成功',
            icon: 'success'
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

  // 视频点击
  onVideoTap: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: item.description,
      showCancel: true,
      cancelText: '取消',
      confirmText: '观看视频',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在播放视频...',
            icon: 'none'
          });
        }
      }
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


  // 加载活动列表
  loadActivities: function() {
    request({
      url: '/activity/list'
    }).then(res => {
      // 与后端 Result<T> 结构对齐：{ success, message, data }
      if (!res.success) {
        throw new Error(res.message || '获取活动失败');
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
      
      // 如果后端数据为空，使用默认数据
      const allActivities = activities.length > 0 ? activities : this.getDefaultActivities();
      
      // 首页只显示前3个
      const displayActivities = allActivities.slice(0, 3);
      
      this.setData({
        allActivities: allActivities,
        activities: allActivities,
        displayActivities: displayActivities
      });
    }).catch(err => {
      console.error('获取活动失败:', err);
      // 使用默认数据
      const defaultActivities = this.getDefaultActivities();
      const displayActivities = defaultActivities.slice(0, 3);
      this.setData({
        allActivities: defaultActivities,
        activities: defaultActivities,
        displayActivities: displayActivities
      });
    });
  },

  // 获取默认活动数据
  getDefaultActivities: function() {
    return [
      {
        id: 1,
        title: '非遗技艺体验日',
        time: '2024-06-15 10:00-16:00',
        location: '北京市东城区非遗展示中心',
        day: '15',
        month: '六月',
        description: '邀请多位非遗传承人现场展示技艺，观众可近距离观摩并参与体验',
        participants: 45,
        capacity: 50,
        buttonText: '报名参加'
      },
      {
        id: 2,
        title: '传承人讲座系列',
        time: '2024-06-18 14:00-16:00',
        location: '线上直播',
        day: '18',
        month: '六月',
        description: '邀请国家级传承人分享非遗保护与传承的经验和心得',
        participants: 1200,
        capacity: 0,
        buttonText: '预约观看'
      },
      {
        id: 3,
        title: '传统工艺工作坊',
        time: '2024-06-22 09:00-12:00',
        location: '上海市非遗保护中心',
        day: '22',
        month: '六月',
        description: '学习传统手工艺制作，体验匠人精神',
        participants: 28,
        capacity: 30,
        buttonText: '报名参加'
      }
    ];
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      loading: true,
      currentCategory: 'all'
    });
    
    // 重新加载所有数据
    Promise.all([
      this.loadMasterList(),
      this.loadSkillVideos(),
      this.loadActivities()
    ]).finally(() => {
      wx.stopPullDownRefresh();
      this.setData({
        loading: false
      });
    });
  },

  // 分享给好友
  onShareAppMessage: function(options) {
    return {
      title: '传承人社区 - 了解非遗传承人，体验传统文化',
      path: '/pages/InheritorCommunity/InheritorCommunity',
      imageUrl: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingtai.jpg')
    };
  }
})