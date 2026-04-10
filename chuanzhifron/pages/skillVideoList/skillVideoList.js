// pages/skillVideoList/skillVideoList.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { buildStaticUrl } = require('../../utils/config.js')

Page({
  data: {
    skillVideos: [],
    loading: true,
    playingVideo: null,
    showVideoPlayer: false
  },

  onLoad: function() {
    this.loadSkillVideos()
  },

  // 加载技艺视频
  loadSkillVideos: function() {
    return request({
      url: '/video/list'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取视频失败')
      }
      const list = res.data?.list || res.data || []
      const skillVideos = list.map(item => ({
        ...item,
        thumbnail: item.thumbnail && item.thumbnail.startsWith('http')
          ? item.thumbnail
          : buildStaticUrl(item.thumbnail || ''),
        videoUrl: item.videoUrl && item.videoUrl.startsWith('http')
          ? item.videoUrl
          : (item.videoUrl ? buildStaticUrl(item.videoUrl) : ''),
        views: item.views ? (item.views >= 10000 ? (item.views / 10000).toFixed(1) + '万' : item.views) : '0'
      }))

      if (skillVideos.length === 0) {
        const defaultVideos = this.getDefaultSkillVideos().map((item) => ({ ...item, isFallback: true }))
        this.setData({
          skillVideos: defaultVideos,
          loading: false
        })
        return
      }
      this.setData({
        skillVideos,
        loading: false
      })
    }).catch(err => {
      console.error('获取视频失败:', err)
      const defaultVideos = this.getDefaultSkillVideos().map((item) => ({ ...item, isFallback: true }))
      this.setData({
        skillVideos: defaultVideos,
        loading: false
      })
      wx.showToast({
        title: requestErrorMessage(err),
        icon: 'none'
      })
    })
  },

  // 获取默认技艺视频数据（演示兜底）
  getDefaultSkillVideos: function() {
    return [
      {
        id: 1,
        title: '苏绣技艺展示',
        description: '国家级传承人姚建萍展示苏绣的精湛技艺和独特魅力，详细介绍平针、套针等传统针法',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_suxiu.jpg'),
        videoUrl: buildStaticUrl('/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4'),
        duration: '15:30',
        date: '2024-05-15',
        views: '3.2万'
      },
      {
        id: 2,
        title: '景泰蓝制作工艺',
        description: '工艺美术大师张同禄现场呈现景泰蓝的掐丝、点蓝、烧制等关键工艺流程',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingtai.jpg'),
        videoUrl: buildStaticUrl('/uploads/video_ARExperinece/景德镇青花瓷.mp4'),
        duration: '18:45',
        date: '2024-05-12',
        views: '2.8万'
      },
      {
        id: 3,
        title: '剪纸艺术创作',
        description: '传承人高凤莲展示传统剪纸技法，从设计到剪裁，展现剪纸艺术的精妙',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jianzhi.jpg'),
        videoUrl: buildStaticUrl('/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4'),
        duration: '12:20',
        date: '2024-05-10',
        views: '1.9万'
      },
      {
        id: 4,
        title: '京剧身段表演',
        description: '梅派传人展示京剧表演的身段、唱腔和舞台艺术，传承经典剧目',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingjumei.jpg'),
        videoUrl: '',
        duration: '20:15',
        date: '2024-05-08',
        views: '4.5万'
      },
      {
        id: 5,
        title: '钧瓷烧制技艺',
        description: '钧瓷烧制技艺传承人展示传统钧瓷工艺，包括选料、成型、施釉、烧制等完整流程',
        thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_junci.jpg'),
        videoUrl: buildStaticUrl('/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'),
        duration: '22:30',
        date: '2024-05-05',
        views: '2.1万'
      }
    ]
  },

  // 视频点击
  onVideoTap: function(e) {
    const item = e.currentTarget.dataset.item
    if (!item.videoUrl) {
      wx.showToast({
        title: '当前视频暂不可播放',
        icon: 'none'
      })
      return
    }
    this.setData({
      playingVideo: item,
      showVideoPlayer: true
    })
  },

  closeVideoPlayer() {
    this.setData({
      showVideoPlayer: false,
      playingVideo: null
    })
  }
})

