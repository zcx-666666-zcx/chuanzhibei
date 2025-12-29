// pages/communityPostList/communityPostList.js
import { request } from '../../utils/util.js'

Page({
  data: {
    communityPosts: [],
    loading: true
  },

  onLoad: function(options) {
    this.loadCommunityPosts();
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
      
      this.setData({
        communityPosts: communityPosts,
        loading: false
      });
    }).catch(err => {
      console.error('获取社区帖子失败:', err);
      // 如果接口失败，显示空列表
      this.setData({
        communityPosts: [],
        loading: false
      });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
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
  }
})

