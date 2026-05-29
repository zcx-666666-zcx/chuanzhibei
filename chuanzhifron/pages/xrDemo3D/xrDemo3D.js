const { getAdaptiveDpr } = require('../../utils/resourceProfile.js')
const { getBaseUrl } = require('../../utils/config.js')
const { request, requestErrorMessage } = require('../../utils/util.js')
const {
  DEVELOPMENT_DEVICE_BASE_URL,
  DEVELOPMENT_DEVICE_BASE_URL_HTTPS
} = require('../../utils/env.js')
const { getLocalFallbackModels, normalizeModelList } = require('../../utils/xrModels.js')

/**
 * 大 glb 直连 xr 易超时；先 downloadFile。石碑约 30MB：1Mbps 理论需约 4～8 分钟，
 * 仍可能触发运行库超时；根本办法是压缩 glb（建议 5MB 以内）或提高出口带宽。
 */
const MODEL_DOWNLOAD_TIMEOUT_MS = 600000

function isLikelyLocalPath(url) {
  return typeof url === 'string' && url.startsWith('wxfile://')
}

Page({
  data: {
    width: 375,
    height: 600,
    renderWidth: 750,
    renderHeight: 1200,
    selectedModelSrc: '',
    modelLoading: true,
    modelLoadHint: '',
    pageTitle: '3D沉浸演示',
    modelList: [],
    currentModelName: ''
  },
  onLoad(options = {}) {
    if (options.title) {
      const pageTitle = decodeURIComponent(options.title)
      this.setData({ pageTitle })
      wx.setNavigationBarTitle({ title: pageTitle })
    }
    const info = wx.getSystemInfoSync()
    const w = info.windowWidth
    const h = info.windowHeight
    const rawDpr = info.pixelRatio || 2
    const dpr0 = getAdaptiveDpr('wifi', rawDpr)
    this.setData({
      width: w,
      height: h,
      renderWidth: Math.floor(w * dpr0),
      renderHeight: Math.floor(h * dpr0)
    })
    wx.getNetworkType({
      success: ({ networkType }) => {
        const dpr = getAdaptiveDpr(networkType, rawDpr)
        this.setData({
          renderWidth: Math.floor(w * dpr),
          renderHeight: Math.floor(h * dpr)
        })
      },
      fail: () => {
        const dpr = getAdaptiveDpr('unknown', rawDpr)
        this.setData({
          renderWidth: Math.floor(w * dpr),
          renderHeight: Math.floor(h * dpr)
        })
      }
    })
    this.warnLocalhostOnRealDevice(info)
    if (info.platform === 'devtools') {
      console.info(
        '[xrDemo3D] 工具内单指旋转/双指缩放：请在模拟器顶部菜单打开「模拟触控」，再在 3D 画布区域操作。'
      )
    }
    this.loadModelCatalog(options.modelId)
  },

  loadModelCatalog(preferredModelId) {
    request({ url: '/ar/models' })
      .then((res) => {
        const rawList = (res && res.data && res.data.list) || []
        const normalized = normalizeModelList(rawList)
        if (normalized.length) {
          this.setData({ modelList: normalized })
          const active = normalized.find((item) => String(item.id) === String(preferredModelId || '')) || normalized[0]
          this.prepareModelAsset(active)
          return
        }
        const fallback = getLocalFallbackModels()
        this.setData({ modelList: fallback })
        this.prepareModelAsset(fallback[0])
      })
      .catch((err) => {
        const fallback = getLocalFallbackModels()
        this.setData({
          modelList: fallback,
          modelLoadHint: requestErrorMessage(err)
        })
        this.prepareModelAsset(fallback[0])
      })
  },

  prepareModelAsset(modelItem) {
    const remoteUrl = modelItem && modelItem.modelUrl
    if (!remoteUrl) {
      this.setData({ modelLoading: false, modelLoadHint: '未配置模型地址' })
      return
    }
    if (isLikelyLocalPath(remoteUrl)) {
      this.setData({
        selectedModelSrc: remoteUrl,
        modelLoading: false,
        modelLoadHint: '',
        currentModelName: (modelItem && modelItem.name) || this.data.pageTitle
      })
      return
    }
    this.setData({
      modelLoading: true,
      selectedModelSrc: '',
      modelLoadHint: '正在连接服务器…',
      currentModelName: (modelItem && modelItem.name) || this.data.pageTitle
    })
    const task = wx.downloadFile({
      url: remoteUrl,
      timeout: MODEL_DOWNLOAD_TIMEOUT_MS,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          this.setData({
            selectedModelSrc: res.tempFilePath,
            modelLoading: false,
            modelLoadHint: ''
          })
          return
        }
        this.setData({
          modelLoading: false,
          modelLoadHint: `下载异常（HTTP ${res.statusCode}）`
        })
        wx.showToast({ title: '模型下载失败', icon: 'none' })
      },
      fail: (err) => {
        console.warn('[xrDemo3D] downloadFile fail', err)
        const tip =
          '下载失败或超时。约 30MB 的 glb 在 1Mbps 下需数分钟，且仍可能被系统中断；请将模型压缩到约 5MB 以内或提高服务器带宽。'
        this.setData({
          modelLoading: false,
          modelLoadHint: tip
        })
        wx.showToast({
          title: '模型下载失败',
          icon: 'none',
          duration: 3200
        })
      }
    })
    if (task && typeof task.onProgressUpdate === 'function') {
      task.onProgressUpdate((res) => {
        const total = res.totalBytesExpectedToWrite
        let hint = ''
        if (total > 0) {
          const pct = Math.min(99, Math.round((res.totalBytesWritten / total) * 100))
          hint = `正在下载模型…${pct}%`
        } else {
          const mb = (res.totalBytesWritten / 1048576).toFixed(1)
          hint = `正在下载模型…已接收 ${mb} MB`
        }
        this.setData({ modelLoadHint: hint })
      })
    }
  },

  /** 真机未配置局域网根地址时，仍会落到 localhost，导致拉不到 glb */
  warnLocalhostOnRealDevice(info) {
    if (info.platform === 'devtools') {
      return
    }
    const base = getBaseUrl() || ''
    if (!/localhost|127\.0\.0\.1/i.test(base)) {
      return
    }
    const hasLan =
      String(DEVELOPMENT_DEVICE_BASE_URL || '').trim().length > 0 ||
      String(DEVELOPMENT_DEVICE_BASE_URL_HTTPS || '').trim().length > 0
    wx.showModal({
      title: '真机无法使用 localhost',
      content: hasLan
        ? '仍检测到请求指向 localhost，请检查 utils/env.js 中 DEVELOPMENT_DEVICE_BASE_URL 是否为 http://你的Mac局域网IP:8001，并重新编译；或清除 Storage 里的 apiBaseUrl。'
        : '手机上的 localhost 不是这台 Mac。请在 utils/env.js 中填写 DEVELOPMENT_DEVICE_BASE_URL（示例 http://192.168.1.8:8001，与手机同一 WiFi），保存后重新编译再真机预览；开发者工具内仍使用 localhost。',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
