// Heritage.js
import { request } from '../../utils/util.js'

Page({
  data: {
    currentCategory: 'all',
    allNationalList: [],  // 所有国家级项目（原始数据）
    allProvincialList: [], // 所有省级项目（原始数据）
    nationalList: [],      // 当前筛选后的国家级项目
    provincialList: [],    // 当前筛选后的省级项目
    loading: true
  },

  onLoad: function() {
    this.loadHeritageData();
  },
  
  // 加载非遗数据
  loadHeritageData: function() {
    // 获取所有非遗项目
    request({
      url: '/heritage'
    }).then(res => {
      // 处理后端返回的 Result 结构
      if (!res.success) {
        throw new Error(res.message || '获取非遗数据失败');
      }
      
      const data = res.data || [];
      
      // 处理图片路径，补充服务器地址
      const processedData = data.map(item => ({
        ...item,
        image: item.imageUrl && item.imageUrl.startsWith('http')
          ? item.imageUrl
          : ('http://localhost:8001' + (item.imageUrl || '')),
        isBookmarked: false
      }));
      
      // 分离国家级和省级项目
      const nationalList = processedData.filter(item => item.level === 1);
      const provincialList = processedData.filter(item => item.level === 2);
      
      this.setData({
        allNationalList: nationalList,  // 保存原始数据
        allProvincialList: provincialList, // 保存原始数据
        loading: false
      }, () => {
        this.filterHeritage();  // 初始化时执行筛选
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
    this.filterHeritage();
  },

  // 筛选非遗项目（根据分类筛选国家级和省级列表）
  filterHeritage: function() {
    const { currentCategory, allNationalList, allProvincialList } = this.data;
    
    let filteredNational = [];
    let filteredProvincial = [];
    
    if (currentCategory === 'all') {
      // 显示全部
      filteredNational = allNationalList;
      filteredProvincial = allProvincialList;
    } else {
      // 按分类筛选
      filteredNational = allNationalList.filter(item => item.category === currentCategory);
      filteredProvincial = allProvincialList.filter(item => item.category === currentCategory);
    }
    
    this.setData({
      nationalList: filteredNational,
      provincialList: filteredProvincial
    });
  },

  // 非遗项目点击
  onHeritageTap: function(e) {
    const item = e.currentTarget.dataset.item;
    // 复用与首页相同的详情展示页面
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    });
  },

  // 收藏功能
  onBookmarkTap: function(e) {
    const item = e.currentTarget.dataset.item;
    const { allNationalList, allProvincialList } = this.data;
    
    // 更新原始数据中的收藏状态
    const nationalIndex = allNationalList.findIndex(heritage => heritage.id === item.id);
    if (nationalIndex !== -1) {
      allNationalList[nationalIndex].isBookmarked = !allNationalList[nationalIndex].isBookmarked;
    }
    
    const provincialIndex = allProvincialList.findIndex(heritage => heritage.id === item.id);
    if (provincialIndex !== -1) {
      allProvincialList[provincialIndex].isBookmarked = !allProvincialList[provincialIndex].isBookmarked;
    }
    
    // 重新执行筛选，确保展示列表同步更新
    this.setData({
      allNationalList: allNationalList,
      allProvincialList: allProvincialList
    }, () => {
      this.filterHeritage();  // 重新筛选以更新展示列表
    });
    
    wx.showToast({
      title: !item.isBookmarked ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  }
})