// pages/masterList/masterList.js
import { request } from '../../utils/util.js'

Page({
  data: {
    currentCategory: 'all',
    masterList: [],
    loading: true
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

      // 处理传承人数据
      const masterList = list.map((item, index) => {
        // 处理头像
        let avatar = '';
        if (item.avatar || item.imageUrl) {
          const imgUrl = item.avatar || item.imageUrl;
          avatar = imgUrl.startsWith('http')
            ? imgUrl
            : 'http://localhost:8001' + imgUrl;
        } else {
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
          isFavorite: false,
          category: this.getCategoryBySkill(item.skill || '传统技艺')
        };
      });
      
      // 如果后端数据为空，使用默认数据
      if (masterList.length === 0) {
        const defaultMasters = this.getDefaultMasters();
        this.setData({
          masterList: defaultMasters,
          loading: false
        });
        this.filterMasters();
      } else {
        this.setData({
          masterList: masterList,
          loading: false
        });
        this.filterMasters();
      }
    }).catch(err => {
      console.error('获取传承人失败:', err);
      // 使用默认数据
      const defaultMasters = this.getDefaultMasters();
      this.setData({
        masterList: defaultMasters,
        loading: false
      });
      this.filterMasters();
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
    const { currentCategory, masterList } = this.data;
    let filteredList = masterList;
    
    if (currentCategory !== 'all') {
      filteredList = masterList.filter(item => item.category === currentCategory);
    }
    
    this.setData({
      masterList: filteredList
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

  // 传承人点击
  onMasterTap: function(e) {
    const item = e.currentTarget.dataset.item;
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

  // 切换收藏状态
  toggleFavorite: function(e) {
    const item = e.currentTarget.dataset.item;
    const masterList = this.data.masterList;
    const index = masterList.findIndex(master => master.id === item.id);
    
    if (index !== -1) {
      masterList[index].isFavorite = !masterList[index].isFavorite;
      this.setData({
        masterList: masterList
      });
      
      wx.showToast({
        title: masterList[index].isFavorite ? '已收藏' : '已取消收藏',
        icon: 'success'
      });
    }
  }
})

