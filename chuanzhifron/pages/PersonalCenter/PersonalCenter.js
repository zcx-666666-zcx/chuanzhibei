const { getCurrentUser, isLoggedIn } = require('../../utils/auth.js')
const { buildApiUrl, buildStaticUrl, DEFAULT_IMAGE_DATA_URI } = require('../../utils/config.js')
const { createPageState, patchPageState } = require('../../utils/page-state.js')
const { requireLogin } = require('../../utils/guard.js')
const { cancelMyBooking, loadMyOverview, removeMyCollection, updateMyProfile } = require('../../services/profile.service.js')
const { logout } = require('../../services/auth.service.js')

const DEFAULT_AVATAR = DEFAULT_IMAGE_DATA_URI
const NICKNAME_MAX_LEN = 32
const SIGNATURE_MAX_LEN = 50

Page({
  data: {
    userInfo: {
      name: '访客',
      title: '非遗文化爱好者',
      avatar: DEFAULT_AVATAR
    },
    userStats: {
      collections: 0,
      bookings: 0
    },
    collections: [],
    displayCollections: [],
    bookings: [],
    loading: true,
    showEditModal: false,
    savingProfile: false,
    pageState: createPageState({ loading: true }),
    editForm: {
      name: '',
      signature: '',
      avatar: ''
    }
  },

  onLoad() {
    this.initializeVisitorView()
    this.loadOverviewData()
  },

  onShow() {
    if (isLoggedIn()) {
      this.loadOverviewData()
    } else {
      this.initializeVisitorView()
    }
  },

  onPullDownRefresh() {
    this.loadOverviewData()
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },

  initializeVisitorView() {
    const user = getCurrentUser()
    const name = user?.nickname || user?.nickName || user?.username || '访客'
    const avatar = user?.avatarUrl || user?.avatar || DEFAULT_AVATAR
    const title = user?.signature || '非遗文化爱好者'
    this.setData({
      userInfo: {
        name,
        title,
        avatar
      },
      userStats: {
        collections: 0,
        bookings: 0
      },
      collections: [],
      displayCollections: [],
      bookings: [],
      loading: false,
      pageState: createPageState({ loading: false, empty: !isLoggedIn() })
    })
  },

  loadOverviewData() {
    if (!isLoggedIn()) {
      this.initializeVisitorView()
      return Promise.resolve()
    }

    this.setData({ loading: true })
    patchPageState(this, { loading: true, error: '' })
    return loadMyOverview()
      .then((payload) => {
        const profile = payload.profile || {}
        const collections = payload.collections || []
        const bookings = payload.bookings || []
        this.setData({
          userInfo: {
            name: profile.displayName || profile.nickname || profile.username || '访客',
            title: profile.displayTitle || profile.signature || '非遗文化爱好者',
            avatar: profile.avatarUrl || DEFAULT_AVATAR
          },
          userStats: payload.stats || {
            collections: collections.length,
            bookings: bookings.length
          },
          collections,
          displayCollections: collections.slice(0, 3),
          bookings,
          loading: false
        })
        patchPageState(this, {
          loading: false,
          empty: collections.length === 0 && bookings.length === 0
        })
      })
      .catch((err) => {
        this.setData({
          loading: false,
          collections: [],
          displayCollections: [],
          bookings: []
        })
        patchPageState(this, {
          loading: false,
          empty: true,
          error: err.message || '加载失败'
        })
        wx.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        })
      })
  },

  onAvatarError() {
    this.setData({
      'userInfo.avatar': DEFAULT_AVATAR
    })
  },

  onUserCardTap() {
    if (!requireLogin({ content: '请先登录后编辑个人资料' })) {
      return
    }

    const user = getCurrentUser()
    this.setData({
      showEditModal: true,
      editForm: {
        name: user?.nickname || user?.nickName || user?.username || '',
        signature: user?.signature || '',
        avatar: user?.avatarUrl || this.data.userInfo.avatar
      }
    })
  },

  closeEditModal() {
    this.setData({
      showEditModal: false
    })
  },

  stopPropagation() {},

  onNameInput(e) {
    this.setData({
      'editForm.name': e.detail.value
    })
  },

  onSignatureInput(e) {
    this.setData({
      'editForm.signature': e.detail.value
    })
  },

  chooseAvatar() {
    if (!requireLogin({ content: '请先登录后上传头像' })) {
      return
    }

    const token = wx.getStorageSync('token')
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        wx.uploadFile({
          url: buildApiUrl('/files/upload-image'),
          filePath: tempFilePath,
          name: 'file',
          header: {
            Authorization: token ? `Bearer ${token}` : ''
          },
          formData: {
            type: 'avatar'
          },
          success: (uploadRes) => {
            try {
              const payload = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data
              if (uploadRes.statusCode < 200 || uploadRes.statusCode >= 300 || !payload.success) {
                throw new Error(payload?.message || '上传失败')
              }
              let imageUrl = payload?.data?.url || ''
              if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = buildStaticUrl(imageUrl)
              }
              this.setData({
                'editForm.avatar': imageUrl
              })
              wx.showToast({
                title: '头像上传成功',
                icon: 'success'
              })
            } catch (e) {
              wx.showToast({
                title: e.message || '上传失败',
                icon: 'none'
              })
            }
          },
          fail: () => {
            wx.showToast({
              title: '上传失败，请重试',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  saveUserInfo() {
    if (this.data.savingProfile) {
      return
    }
    const nickname = (this.data.editForm.name || '').trim()
    const signature = (this.data.editForm.signature || '').trim()

    if (!nickname) {
      wx.showToast({
        title: '用户名称不能为空',
        icon: 'none'
      })
      return
    }
    if (nickname.length > NICKNAME_MAX_LEN) {
      wx.showToast({
        title: '用户名称最长 32 字',
        icon: 'none'
      })
      return
    }
    if (signature.length > SIGNATURE_MAX_LEN) {
      wx.showToast({
        title: '个人签名最长 50 字',
        icon: 'none'
      })
      return
    }

    this.setData({ savingProfile: true })
    updateMyProfile({
      nickname,
      signature,
      avatarUrl: this.data.editForm.avatar || ''
    }).then((profile) => {
      this.setData({
        userInfo: {
          name: profile.displayName || profile.nickname || profile.username || '访客',
          title: profile.displayTitle || profile.signature || '非遗文化爱好者',
          avatar: profile.avatarUrl || DEFAULT_AVATAR
        },
        showEditModal: false
      })
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }).catch((err) => {
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      })
    }).finally(() => {
      this.setData({ savingProfile: false })
    })
  },

  onSettings() {
    wx.showActionSheet({
      itemList: ['编辑资料', '隐私设置', '通知设置'],
      success: (res) => {
        const actions = ['编辑资料', '隐私设置', '通知设置']
        if (res.tapIndex === 0) {
          this.onUserCardTap()
          return
        }
        const key = res.tapIndex === 1 ? 'privacyEnabled' : 'notificationEnabled'
        const enabled = wx.getStorageSync(key) !== false
        wx.setStorageSync(key, !enabled)
        wx.showToast({
          title: `${actions[res.tapIndex]}已${enabled ? '关闭' : '开启'}`,
          icon: 'none'
        })
      }
    })
  },

  onCollectionTap(e) {
    const item = e.currentTarget.dataset.item
    const heritageId = item.heritageId || item.id
    if (!heritageId) {
      wx.showToast({
        title: '收藏项信息不完整',
        icon: 'none'
      })
      return
    }

    wx.setStorageSync('tempCollectionData', {
      name: item.name,
      description: item.description,
      level: item.level,
      imageUrl: item.imageUrl || item.image,
      heritageId
    })

    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${heritageId}&fromCollection=true`
    })
  },

  removeCollection(e) {
    const item = e.currentTarget.dataset.item
    const heritageName = item.name || '该项目'

    wx.showModal({
      title: '移除收藏',
      content: `确定要移除"${heritageName}"的收藏吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        const heritageId = item.heritageId || item.id
        removeMyCollection(heritageId)
          .then(() => this.loadOverviewData())
          .then(() => {
            wx.showToast({
              title: '已移除收藏',
              icon: 'success'
            })
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || '移除收藏失败',
              icon: 'none'
            })
          })
      }
    })
  },

  cancelBooking(e) {
    const item = e.currentTarget.dataset.item
    const bookingTitle = item.skill ? `${item.masterName} - ${item.skill}` : item.masterName
    wx.showModal({
      title: '取消预约',
      content: `确定要取消"${bookingTitle}"的预约吗？`,
      showCancel: true,
      cancelText: '不取消',
      confirmText: '确定取消',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        cancelMyBooking(item.id)
          .then(() => this.loadOverviewData())
          .then(() => {
            wx.showToast({
              title: '已取消预约',
              icon: 'success'
            })
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || '取消预约失败',
              icon: 'none'
            })
          })
      }
    })
  },

  viewAllCollections() {
    if (!requireLogin({ content: '请先登录后查看收藏列表' })) {
      return
    }
    wx.navigateTo({
      url: '/pages/collectionList/collectionList'
    })
  },

  viewAllBookings() {
    if (!requireLogin({ content: '请先登录后查看预约列表' })) {
      return
    }
    wx.navigateTo({
      url: '/pages/bookingList/bookingList'
    })
  },

  onMenuTap(e) {
    const type = e.currentTarget.dataset.type
    const menuMap = {
      profile: '个人资料',
      settings: '设置',
      help: '帮助与反馈',
      about: '关于我们'
    }

    if (type === 'settings') {
      wx.showActionSheet({
        itemList: ['编辑资料', '隐私设置', '通知设置', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 3) {
            wx.showModal({
              title: '退出登录',
              content: '确定要退出登录吗？',
              success: (confirmRes) => {
                if (confirmRes.confirm) {
                  logout()
                  this.initializeVisitorView()
                  wx.redirectTo({
                    url: '/pages/login/login'
                  })
                }
              }
            })
            return
          }
          if (res.tapIndex === 0) {
            this.onUserCardTap()
            return
          }
          const key = res.tapIndex === 1 ? 'privacyEnabled' : 'notificationEnabled'
          const enabled = wx.getStorageSync(key) !== false
          wx.setStorageSync(key, !enabled)
          wx.showToast({
            title: `${['隐私设置', '通知设置'][res.tapIndex - 1]}已${enabled ? '关闭' : '开启'}`,
            icon: 'none'
          })
        }
      })
    } else if (type === 'help') {
      wx.showModal({
        title: '帮助与反馈',
        content: '建议先启动后端与 Redis，再打开微信开发者工具联调；如遇接口异常，可在后台和数据库中查看自动初始化结果。',
        showCancel: false,
        confirmText: '知道了'
      })
    } else if (type === 'about') {
      wx.showModal({
        title: '关于我们',
        content: '传智杯项目致力于用更完整的数字产品体验连接非遗内容、传承人和公众。',
        showCancel: false,
        confirmText: '知道了'
      })
    } else {
      wx.showToast({
        title: `${menuMap[type] || '功能'}开发中`,
        icon: 'none'
      })
    }
  }
})
