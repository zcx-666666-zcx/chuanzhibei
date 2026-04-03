import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'

Page({
  data: {
    title: '',
    content: '',
    videoUrl: ''
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onVideoInput(e) {
    this.setData({ videoUrl: e.detail.value });
  },

  onSubmit() {
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录，再发布传承人社区动态',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return;
    }

    const { title, content, videoUrl } = this.data;
    const trimmedTitle = (title || '').trim();
    const trimmedContent = (content || '').trim();

    if (!trimmedTitle || !trimmedContent) {
      wx.showToast({
        title: '请先填写标题和内容',
        icon: 'none'
      });
      return;
    }

    const user = getCurrentUser() || {};
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const author =
      user.nickname || user.nickName || user.username || user.name || '认证传承人';

    const initials = author
      .toString()
      .trim()
      .slice(0, 2);

    let posts = [];
    try {
      const raw = wx.getStorageSync('inheritorPosts');
      if (Array.isArray(raw)) {
        posts = raw;
      }
    } catch (_) {}

    posts.push({
      id: Date.now(),
      title: trimmedTitle,
      content: trimmedContent,
      videoUrl: (videoUrl || '').trim(),
      author,
      time,
      initials
    });

    wx.setStorageSync('inheritorPosts', posts);

    wx.showToast({
      title: '已发布到社区',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 600);
  }
});

