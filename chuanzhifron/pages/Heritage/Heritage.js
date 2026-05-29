const { buildHeritageSections, loadHeritageCatalog } = require('../../services/content.service.js')

Page({
  data: {
    currentCategory: 'all',
    heritageList: [],
    allNationalList: [],
    allProvincialList: [],
    nationalList: [],
    provincialList: [],
    displayNationalList: [],
    displayProvincialList: [],
    loading: true
  },

  onLoad() {
    this.loadHeritageData()
  },

  loadHeritageData() {
    this.setData({ loading: true })
    return loadHeritageCatalog()
      .then((heritageList) => {
        this.setData({
          heritageList,
          loading: false
        }, () => {
          this.filterHeritage()
        })
      })
      .catch((err) => {
        this.setData({
          heritageList: [],
          allNationalList: [],
          allProvincialList: [],
          nationalList: [],
          provincialList: [],
          displayNationalList: [],
          displayProvincialList: [],
          loading: false
        })
        wx.showToast({
          title: err.message || '加载数据失败',
          icon: 'none'
        })
      })
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category
    })
    this.filterHeritage()
  },

  filterHeritage() {
    const { currentCategory, heritageList } = this.data
    const sections = buildHeritageSections(heritageList, {
      category: currentCategory,
      limitPerLevel: 4
    })

    this.setData({
      allNationalList: sections.nationalList,
      allProvincialList: sections.provincialList,
      nationalList: sections.nationalList,
      provincialList: sections.provincialList,
      displayNationalList: sections.displayNationalList,
      displayProvincialList: sections.displayProvincialList
    })
  },

  onHeritageTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    })
  }
})
