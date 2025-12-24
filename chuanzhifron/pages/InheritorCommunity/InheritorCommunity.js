// InheritorCommunity.js
import { request } from '../../utils/util.js'

Page({
  data: {
    masterList: [],
    allMasterList: [], // 保存所有传承人数据用于筛选
    displayMasterList: [], // 首页显示的传承人列表（只显示4个）
    skillVideos: [],
    activities: [],
    communityPosts: [],
    currentCategory: 'all', // 当前筛选的分类
    showFilters: true, // 是否显示筛选器
    loading: true
  },

  onLoad: function() {
    // 页面加载时的初始化
    this.loadMasterList();
    this.loadSkillVideos();
    this.loadCommunityPosts();
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
            : 'http://localhost:8001' + imgUrl;
        } else {
          // 如果没有图片URL，使用默认路径（基于5张图片循环使用）
          const imageNames = ['master_jianzhi', 'master_jingjumei', 'master_jingtai', 'master_junci', 'master_suxiu'];
          const imgName = imageNames[index % imageNames.length];
          avatar = `http://localhost:8001/uploads/masters_InheritorCommunit/${imgName}.jpg`;
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
    const baseUrl = 'http://localhost:8001/uploads/masters_InheritorCommunit/';
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
      const skillVideos = list.map(item => ({
        ...item,
        thumbnail: item.thumbnail && item.thumbnail.startsWith('http')
          ? item.thumbnail
          : ('http://localhost:8001' + (item.thumbnail || '')),
        views: item.views ? (item.views >= 10000 ? (item.views / 10000).toFixed(1) + '万' : item.views) : '0'
      }));
      this.setData({
        skillVideos: skillVideos.length > 0 ? skillVideos : this.getDefaultSkillVideos()
      });
    }).catch(err => {
      console.error('获取视频失败:', err);
      // 使用默认数据
      this.setData({
        skillVideos: this.getDefaultSkillVideos()
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
        thumbnail: 'http://localhost:8001/uploads/masters_InheritorCommunit/master_suxiu.jpg',
        duration: '15:30',
        date: '2024-05-15',
        views: '3.2万'
      },
      {
        id: 2,
        title: '景泰蓝制作工艺',
        description: '工艺美术大师张同禄现场演示景泰蓝的掐丝、点蓝、烧制等关键工艺流程',
        thumbnail: 'http://localhost:8001/uploads/masters_InheritorCommunit/master_jingtai.jpg',
        duration: '18:45',
        date: '2024-05-12',
        views: '2.8万'
      },
      {
        id: 3,
        title: '剪纸艺术创作',
        description: '传承人高凤莲展示传统剪纸技法，从设计到剪裁，展现剪纸艺术的精妙',
        thumbnail: 'http://localhost:8001/uploads/masters_InheritorCommunit/master_jianzhi.jpg',
        duration: '12:20',
        date: '2024-05-10',
        views: '1.9万'
      },
      {
        id: 4,
        title: '京剧身段表演',
        description: '梅派传人展示京剧表演的身段、唱腔和舞台艺术，传承经典剧目',
        thumbnail: 'http://localhost:8001/uploads/masters_InheritorCommunit/master_jingjumei.jpg',
        duration: '20:15',
        date: '2024-05-08',
        views: '4.5万'
      }
    ];
  },

  // 加载社区帖子
  loadCommunityPosts: function() {
    request({
      url: '/community/posts'
    }).then(res => {
      // 与后端 Result<T> 结构对齐：{ success, message, data }
      if (!res.success) {
        throw new Error(res.message || '获取社区帖子失败');
      }

      const list = res.data?.list || res.data || [];

      // 处理社区帖子数据
      const communityPosts = list.map(item => {
        // 处理头像：如果不是完整URL，拼接基础路径
        let avatar = '';
        if (item.avatar || item.userAvatar) {
          const imgUrl = item.avatar || item.userAvatar;
          avatar = imgUrl.startsWith('http')
            ? imgUrl
            : 'http://localhost:8001' + imgUrl;
        } else if (item.id != null) {
          // 如果没有图片URL，使用默认路径
          const imageNames = ['master_jianzhi', 'master_jingjumei', 'master_jingtai', 'master_junci', 'master_suxiu'];
          avatar = `http://localhost:8001/uploads/masters_InheritorCommunit/${imageNames[item.id % 5]}.jpg`;
        } else {
          avatar = 'http://localhost:8001/uploads/masters_InheritorCommunit/master_jingtai.jpg';
        }

        // 处理帖子图片
        let images = [];
        if (item.imageUrls) {
          const urlList = typeof item.imageUrls === 'string' ? item.imageUrls.split(',') : item.imageUrls;
          images = urlList.map(url => {
            const trimmedUrl = url.trim();
            return trimmedUrl.startsWith('http') ? trimmedUrl : 'http://localhost:8001' + trimmedUrl;
          }).filter(url => url);
        } else if (item.images && Array.isArray(item.images)) {
          images = item.images.map(url => {
            return url.startsWith('http') ? url : 'http://localhost:8001' + url;
          });
        }

        return {
          ...item,
          avatar: avatar,
          images: images,
          userName: item.userName || item.username || '非遗爱好者',
          content: item.content || item.text || '',
          likes: item.likes || item.likeCount || 0,
          comments: item.comments || item.commentCount || 0,
          isLiked: item.isLiked || false,
          time: this.formatTimeAgo(item.createTime || item.time || item.publishTime)
        };
      });
      
      // 如果后端数据为空，使用默认数据
      if (communityPosts.length === 0) {
        this.setData({
          communityPosts: this.getDefaultCommunityPosts()
        });
      } else {
        this.setData({
          communityPosts
        });
      }
    }).catch(err => {
      console.error('获取社区帖子失败:', err);
      // 使用默认数据
      this.setData({
        communityPosts: this.getDefaultCommunityPosts()
      });
    });
  },

  // 获取默认社区动态数据
  getDefaultCommunityPosts: function() {
    const baseUrl = 'http://localhost:8001/uploads/masters_InheritorCommunit/';
    return [
      {
        id: 1,
        userName: '剪纸达人',
        avatar: baseUrl + 'master_jianzhi.jpg',
        time: '2小时前',
        content: '今天完成了新的剪纸作品《龙凤呈祥》，融合了传统纹样和现代设计元素，希望大家喜欢！',
        images: [],
        likes: 128,
        comments: 23,
        isLiked: false
      },
      {
        id: 2,
        userName: '苏绣传承人',
        avatar: baseUrl + 'master_suxiu.jpg',
        time: '5小时前',
        content: '分享一个苏绣作品的制作过程，从设计到完成，每一步都需要细心和耐心。传统技艺的传承需要我们每一个人的努力。',
        images: [],
        likes: 256,
        comments: 45,
        isLiked: true
      },
      {
        id: 3,
        userName: '景泰蓝爱好者',
        avatar: baseUrl + 'master_jingtai.jpg',
        time: '1天前',
        content: '参观了景泰蓝制作工坊，亲眼见证了掐丝珐琅的精妙工艺，深感传统手工艺人的匠心独运！',
        images: [],
        likes: 189,
        comments: 32,
        isLiked: false
      },
      {
        id: 4,
        userName: '京剧票友',
        avatar: baseUrl + 'master_jingjumei.jpg',
        time: '2天前',
        content: '参加了梅派艺术传承讲座，学到了很多关于京剧表演的技巧。传统文化的魅力在于它的深厚底蕴和不断创新。',
        images: [],
        likes: 312,
        comments: 67,
        isLiked: true
      }
    ];
  },

  // 格式化时间显示
  formatTimeAgo: function(dateTime) {
    if (!dateTime) return '刚刚';
    
    try {
      let date;
      // 处理后端返回的LocalDateTime对象格式
      if (typeof dateTime === 'object' && dateTime.year) {
        // Java LocalDateTime 对象：{year, monthValue, dayOfMonth, hour, minute, second}
        const year = dateTime.year || new Date().getFullYear();
        const month = (dateTime.monthValue || dateTime.month || 1) - 1;
        const day = dateTime.dayOfMonth || dateTime.day || 1;
        const hour = dateTime.hour || 0;
        const minute = dateTime.minute || 0;
        date = new Date(year, month, day, hour, minute);
      } else if (typeof dateTime === 'object' && dateTime.time) {
        // 时间戳对象
        date = new Date(dateTime.time);
      } else if (typeof dateTime === 'string') {
        // 字符串格式
        date = new Date(dateTime);
      } else {
        date = new Date(dateTime);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '刚刚';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 7) {
        // 超过7天显示具体日期
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else if (diffDays > 0) {
        return `${diffDays}天前`;
      } else if (diffHours > 0) {
        return `${diffHours}小时前`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分钟前`;
      } else {
        return '刚刚';
      }
    } catch (e) {
      console.error('时间格式化错误:', e);
      return '刚刚';
    }
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
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
        }
      }
    });
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
            wx.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 点赞
  likePost: function(e) {
    const item = e.currentTarget.dataset.item;
    const communityPosts = this.data.communityPosts;
    const index = communityPosts.findIndex(post => post.id === item.id);
    
    if (index !== -1) {
      // 向后端发送请求更新点赞状态
      request({
        url: `/community/posts/${item.id}/like`,
        method: 'POST'
      }).then(response => {
        if(response && response.success) {
          // 更新本地数据
          const updatedPosts = this.data.communityPosts;
          const updatedIndex = updatedPosts.findIndex(post => post.id === item.id);
          if(updatedIndex !== -1) {
            updatedPosts[updatedIndex] = response.data; // 使用后端返回的更新后的数据
            this.setData({
              communityPosts: updatedPosts
            });
          }
          
          wx.showToast({
            title: response.data.isLiked ? '已点赞' : '已取消点赞',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('更新点赞状态失败:', err);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      });
    }
  },

  // 评论
  commentPost: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '评论',
      editable: true,
      placeholderText: '请输入评论内容',
      success: (res) => {
        if (res.confirm && res.content) {
          // 这里可以调用后端API发表评论
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          });
          // 可以刷新评论数
          const communityPosts = this.data.communityPosts;
          const index = communityPosts.findIndex(post => post.id === item.id);
          if (index !== -1) {
            communityPosts[index].comments = (communityPosts[index].comments || 0) + 1;
            this.setData({
              communityPosts: communityPosts
            });
          }
        }
      }
    });
  },

  // 查看更多社区动态
  viewMorePosts: function() {
    wx.showToast({
      title: '加载更多动态',
      icon: 'none'
    });
    // 这里可以加载更多数据或跳转到动态列表页面
  },

  // 发布帖子
  publishPost: function() {
    wx.showModal({
      title: '发布帖子',
      content: '是否要发布一个新帖子？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/community/post-editor'
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
      if (activities.length === 0) {
        this.setData({
          activities: this.getDefaultActivities()
        });
      } else {
        this.setData({
          activities
        });
      }
    }).catch(err => {
      console.error('获取活动失败:', err);
      // 使用默认数据
      this.setData({
        activities: this.getDefaultActivities()
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
      this.loadCommunityPosts(),
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
      imageUrl: 'http://localhost:8001/uploads/masters_InheritorCommunit/master_jingtai.jpg'
    };
  }
})