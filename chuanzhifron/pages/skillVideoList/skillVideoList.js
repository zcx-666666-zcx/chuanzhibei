// pages/skillVideoList/skillVideoList.js
import { request } from '../../utils/util.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    skillVideos: [],
    loading: true
  },

  onLoad: function(options) {
    this.loadSkillVideos();
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
          : buildStaticUrl(item.thumbnail || ''),
        views: item.views ? (item.views >= 10000 ? (item.views / 10000).toFixed(1) + '万' : item.views) : '0'
      }));
      
      // 如果后端数据为空，使用默认数据
      if (skillVideos.length === 0) {
        const defaultVideos = this.getDefaultSkillVideos();
        this.setData({
          skillVideos: defaultVideos,
          loading: false
        });
      } else {
        this.setData({
          skillVideos: skillVideos,
          loading: false
        });
      }
    }).catch(err => {
      console.error('获取视频失败:', err);
      // 使用默认数据
      const defaultVideos = this.getDefaultSkillVideos();
      this.setData({
        skillVideos: defaultVideos,
        loading: false
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
        description: '工艺美术大师张同禄现场呈现景泰蓝的掐丝、点蓝、烧制等关键工艺流程',
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
      },
      {
        id: 5,
        title: '钧瓷烧制技艺',
        description: '钧瓷烧制技艺传承人展示传统钧瓷工艺，包括选料、成型、施釉、烧制等完整流程',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_junci.jpg'),
        duration: '22:30',
        date: '2024-05-05',
        views: '2.1万'
      }
    ];
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
  }
})

