const { request, requestErrorMessage } = require('../../utils/util.js')
const { buildStaticUrl } = require('../../utils/config.js')

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
    return request({
      url: `/inheritor/${id}`
    }).then((res) => {
      if (!res.success || !res.data) {
        throw new Error(res.message || '传承人不存在')
      }
      const item = res.data
      const avatar = item.avatar || item.imageUrl || ''
      this.setData({
        inheritor: {
          ...item,
          avatar: avatar.startsWith('http') ? avatar : buildStaticUrl(avatar || ''),
          introduction: item.introduction || item.description || '暂无介绍'
        },
        loading: false,
        loadError: false,
        loadErrorText: ''
      })
    }).catch((err) => {
      this.setData({
        loading: false,
        loadError: true,
        loadErrorText: requestErrorMessage(err)
      })
    })
  },

  onRetryLoad() {
    if (this.data.inheritorId) {
      this.loadInheritor(this.data.inheritorId)
    }
  }
})
