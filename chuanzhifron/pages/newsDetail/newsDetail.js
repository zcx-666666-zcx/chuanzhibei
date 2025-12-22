// pages/newsDetail/newsDetail.js
import { request } from '../../utils/util.js'

Page({
  data: {
    newsDetail: {},
    imageList: [],
    contentParagraphs: []
  },

  onLoad: function (options) {
    console.log('新闻详情页面加载，参数:', options);
    // 获取传递过来的新闻ID或其他标识
    const newsId = options.id;
    
    // 这里应该从后端获取新闻详情数据
    // 暂时使用模拟数据演示
    if (newsId) {
      this.loadNewsDetail(newsId);
    } else {
      // 默认示例数据
      this.setData({
        newsDetail: {
          id: 0,
          title: "默认新闻标题",
          author: "非遗文化编辑部",
          publishTime: "2024-06-01 12:00:00",
          description: "这是新闻的简要描述。",
          imageUrls: "http://localhost:8001/uploads/news_index/sample_news.jpg"
        },
        imageList: [
          "http://localhost:8001/uploads/news_index/news_1.jpg",
          "http://localhost:8001/uploads/news_index/news_2.jpg"
        ],
        contentParagraphs: [
          "这是新闻的详细内容。在这里您可以添加任意长度的文章内容，包括非遗项目的详细介绍、历史渊源、传承现状等等。",
          "通过这种方式，我们可以更好地展示非遗文化的丰富内涵和独特魅力。"
        ]
      });
    }
  },

  loadNewsDetail: function(id) {
    console.log('开始加载新闻详情，ID:', id);
    // 从后端获取新闻详情
    request({
      url: `/news/${id}`
    }).then(response => {
      console.log('后端返回的数据:', response);
      
      // 检查响应是否成功
      if (!response.success) {
        console.log('后端返回失败响应:', response.message);
        throw new Error(response.message || '获取新闻详情失败');
      }
      
      const data = response.data;
      console.log('处理的数据:', data);
      
      if (!data) {
        throw new Error('未获取到新闻数据');
      }
      
      // 处理图片URL列表
      let imageList = [];
      if (data.imageUrls) {
        // 为每个图片URL添加服务器地址前缀
        imageList = data.imageUrls.split(',').map(url => {
          const trimmedUrl = url.trim();
          // 如果已经是完整URL则直接使用，否则添加前缀
          if (trimmedUrl.startsWith('http')) {
            return trimmedUrl;
          }
          return 'http://localhost:8001' + trimmedUrl;
        });
        console.log('处理后的图片列表:', imageList);
      } else {
        // 如果没有图片，使用默认图片
        imageList = [
          "http://localhost:8001/uploads/news_index/news_" + id + ".jpg",
          "http://localhost:8001/uploads/news_index/news_" + (parseInt(id) % 5 + 1) + ".jpg"
        ];
      }
      
      // 处理内容段落
      let contentParagraphs = [];
      if (data.content) {
        contentParagraphs = data.content.split('\n').filter(p => p.trim() !== '');
        console.log('处理后的内容段落:', contentParagraphs);
      } else {
        contentParagraphs = [
          "这是新闻ID为 " + id + " 的详细内容。在这里可以展示非遗项目的详细介绍、历史渊源、传承现状等等。非遗文化是中华民族的瑰宝，值得我们去传承和发扬光大。",
          "通过这种方式，我们可以更好地展示非遗文化的丰富内涵和独特魅力。"
        ];
      }
      
      // 格式化时间
      let publishTime = data.publishTime;
      console.log('原始发布时间:', publishTime);
      
      if (publishTime) {
        if (typeof publishTime === 'object' && publishTime.year) {
          // 处理Java LocalDateTime对象
          publishTime = `${publishTime.year}-${String(publishTime.monthValue).padStart(2, '0')}-${String(publishTime.dayOfMonth).padStart(2, '0')} ${String(publishTime.hour).padStart(2, '0')}:${String(publishTime.minute).padStart(2, '0')}:${String(publishTime.second).padStart(2, '0')}`;
        } else if (typeof publishTime === 'object' && publishTime.hasOwnProperty('time')) {
          // 处理时间戳格式
          const date = new Date(publishTime.time);
          publishTime = date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0') + ' ' + 
                       String(date.getHours()).padStart(2, '0') + ':' + 
                       String(date.getMinutes()).padStart(2, '0') + ':' + 
                       String(date.getSeconds()).padStart(2, '0');
        } else if (typeof publishTime === 'string') {
          // 已经是字符串格式，直接使用
        }
        console.log('格式化后的时间:', publishTime);
      } else {
        // 如果没有发布时间，使用默认值
        publishTime = "2024-06-01 12:00:00";
      }
      
      // 处理作者信息
      let author = data.author || "非遗文化编辑部";
      
      const newsDetail = {
        ...data,
        publishTime: publishTime,
        author: author
      };
      
      console.log('最终新闻详情:', newsDetail);
      
      this.setData({
        newsDetail: newsDetail,
        imageList: imageList,
        contentParagraphs: contentParagraphs
      });
      
      console.log('页面数据设置完成');
    }).catch(err => {
      console.error('获取新闻详情失败:', err);
      wx.showToast({
        title: '加载新闻详情失败: ' + (err.message || '未知错误'),
        icon: 'none',
        duration: 3000
      });
      
      // 使用模拟数据
      const mockData = {
        id: parseInt(id) || 0,
        title: "新闻标题 " + id,
        author: "非遗文化编辑部",
        publishTime: "2024-06-01 12:00:00",
        description: "这是新闻ID为 " + id + " 的简要描述。",
        imageUrls: "/uploads/news_index/news_" + id + ".jpg,/uploads/news_index/news_" + (parseInt(id) + 1) + ".jpg"
      };
      
      console.log('使用模拟数据:', mockData);
      
      // 处理图片URL列表
      let imageList = [];
      if (mockData.imageUrls) {
        // 为每个图片URL添加服务器地址前缀
        imageList = mockData.imageUrls.split(',').map(url => 'http://localhost:8001' + url.trim());
      }
      
      this.setData({
        newsDetail: mockData,
        imageList: imageList,
        contentParagraphs: [
          "这是新闻ID为 " + id + " 的详细内容。在这里可以展示非遗项目的详细介绍、历史渊源、传承现状等等。非遗文化是中华民族的瑰宝，值得我们去传承和发扬光大。",
          "通过这种方式，我们可以更好地展示非遗文化的丰富内涵和独特魅力。"
        ]
      });
    });
  }
});