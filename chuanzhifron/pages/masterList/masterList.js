const { requireLogin } = require('../../utils/guard.js')
const {
  bookMasterExperience,
  listMasters,
  setFavoriteMasterIds
} = require('../../services/experience.service.js')

Page({
  data: {
    currentCategory: 'all',
    masterListAll: [],
    displayMasters: [],
    loading: true
  },

  onLoad(options) {
    const category = options.category || 'all'
    this.setData({
      currentCategory: category
    })
    this.loadMasterList()
  },

  loadMasterList() {
    return listMasters().then((source) => {
      this.setData(
        {
          masterListAll: source,
          loading: false
        },
        () => this.applyCategoryFilter()
      )
    }).catch((err) => {
      wx.showToast({
        title: err.message || '获取传承人失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    })
  },

  applyCategoryFilter() {
    const { currentCategory, masterListAll } = this.data
    const filtered =
      currentCategory === 'all'
        ? masterListAll.slice()
        : masterListAll.filter(item => item.category === currentCategory)
    this.setData({ displayMasters: filtered })
  },

  onCategoryFilter(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category }, () => this.applyCategoryFilter())
  },

  onMasterTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item || !item.id) {
      return
    }
    wx.navigateTo({
      url: `/pages/inheritorDetail/inheritorDetail?id=${item.id}`
    })
  },

  bookExperience(e) {
    const item = e.currentTarget.dataset.item
    this.confirmAndSubmitBooking(item)
  },

  confirmAndSubmitBooking(item) {
    if (!requireLogin({ content: '请先登录后再预约体验' })) {
      return
    }
    wx.showModal({
      title: '预约体验',
      content: `确定要预约「${item.name}」的「${item.skill}」体验吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定预约',
      success: (res) => {
        if (!res.confirm) return
        bookMasterExperience(item)
          .then(() => {
            wx.showToast({ title: '预约成功', icon: 'success' })
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || '预约失败',
              icon: 'none'
            })
          })
      }
    })
  },

  toggleFavorite(e) {
    const item = e.currentTarget.dataset.item
    const masterListAll = this.data.masterListAll.map((m) =>
      m.id === item.id ? { ...m, isFavorite: !m.isFavorite } : m
    )
    const next = masterListAll.find((m) => m.id === item.id)
    const favoriteIds = masterListAll.filter((m) => m.isFavorite).map((m) => Number(m.id))
    setFavoriteMasterIds(favoriteIds)
    this.setData({ masterListAll }, () => this.applyCategoryFilter())
    if (next) {
      wx.showToast({
        title: next.isFavorite ? '已标记喜欢' : '已取消标记',
        icon: 'success'
      })
    }
  }
})
