// pages/newsList/newsList.js
import { request } from '../../utils/util.js'

Page({
  data: {
    newsList: [],
    loading: true
  },

  onLoad: function () {
    this.loadNewsData();
  },

  // 加载新闻数据
  loadNewsData: function() {
    request({
      url: '/news/recent'
    }).then(res => {
      // 与后端 Result<T> 结构对齐：{ success, message, data }
      if (!res.success) {
        throw new Error(res.message || '获取新闻失败');
      }

      const list = res.data || [];

      // 处理新闻数据：补充图片与日期字段
      const newsList = list.map(item => {
        // 处理封面图：取 imageUrls 中第一张，没有则按 id 兜底
        let image = '';
        if (item.imageUrls) {
          const first = item.imageUrls.split(',')[0].trim();
          image = first.startsWith('http')
            ? first
            : 'http://localhost:8001' + first;
        } else if (item.id != null) {
          image = `http://localhost:8001/uploads/news_index/news_${item.id}.jpg`;
        }

        // 处理发布日期，转换为字符串，供界面展示
        let dateStr = '';
        let publishTime = item.publishTime;
        if (publishTime) {
          if (typeof publishTime === 'object' && publishTime.year) {
            // Java LocalDateTime 对象
            dateStr = `${publishTime.year}-${String(publishTime.monthValue).padStart(2, '0')}-${String(publishTime.dayOfMonth).padStart(2, '0')}`;
          } else if (typeof publishTime === 'object' && Object.prototype.hasOwnProperty.call(publishTime, 'time')) {
            // 时间戳对象
            const d = new Date(publishTime.time);
            dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } else if (typeof publishTime === 'string') {
            // 已经是字符串，按"日期 时间"拆分，只取日期部分
            dateStr = publishTime.split(' ')[0];
          }
        }

        return {
          ...item,
          image,
          date: dateStr
        };
      });
      
      this.setData({
        newsList,
        loading: false
      });
    }).catch(err => {
      console.error('获取新闻失败:', err);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '加载新闻失败',
        icon: 'none'
      });
    });
  },

  // 新闻点击
  onNewsTap: function(e) {
    const item = e.currentTarget.dataset.item
    // 跳转到新闻详情页面
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${item.id}`
    })
  }
})

