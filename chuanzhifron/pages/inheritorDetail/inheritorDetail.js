const { loadInheritorDetail } = require('../../services/content.service.js')

Page({
  data: {
    inheritorId: '',
    inheritor: null,
    loading: true,
    loadError: false,
    loadErrorText: ''
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      this.setData({
        loading: false,
        loadError: true,
        loadErrorText: '缺少传承人 ID'
      })
      return
    }
    this.setData({ inheritorId: id })
    this.loadInheritor(id)
  },

  loadInheritor(id) {
    this.setData({ loading: true, loadError: false, loadErrorText: '' })
    return loadInheritorDetail(id).then((inheritor) => {
      this.setData({
        inheritor,
        loading: false,
        loadError: false,
        loadErrorText: ''
      })
    }).catch((err) => {
      this.setData({
        loading: false,
        loadError: true,
        loadErrorText: err.message || '加载传承人失败'
      })
    })
  },

  onRetryLoad() {
    if (this.data.inheritorId) {
      this.loadInheritor(this.data.inheritorId)
    }
  }
})
