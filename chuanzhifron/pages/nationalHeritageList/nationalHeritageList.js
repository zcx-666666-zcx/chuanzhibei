// pages/nationalHeritageList/nationalHeritageList.js
import { request } from '../../utils/util.js'

Page({
  data: {
    currentCategory: 'all',
    heritageList: [],
    loading: true
  },

  onLoad: function(options) {
    // 获取传递过来的分类参数
    const category = options.category || 'all';
    this.setData({
      currentCategory: category
    });
    this.loadHeritageData();
  },

  // 加载非遗数据
  loadHeritageData: function() {
    request({
      url: '/heritage'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取非遗数据失败');
      }
      
      const data = res.data || [];
      
      // 处理图片路径，补充服务器地址
      const processedData = data.map(item => ({
        ...item,
        image: item.imageUrl && item.imageUrl.startsWith('http')
          ? item.imageUrl
          : ('http://localhost:8001' + (item.imageUrl || ''))
      }));
      
      // 只获取国家级项目（level === 1）
      let nationalList = processedData.filter(item => item.level === 1);
      
      // 根据分类筛选
      if (this.data.currentCategory !== 'all') {
        nationalList = nationalList.filter(item => item.category === this.data.currentCategory);
      }
      
      this.setData({
        heritageList: nationalList,
        loading: false
      });
    }).catch(err => {
      console.error('获取非遗数据失败:', err);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    });
  },

  // 分类筛选
  onCategoryChange: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.loadHeritageData();
  },

  // 非遗项目点击
  onHeritageTap: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    });
  }
})

