const { getAdaptiveDpr, isSlowNetwork } = require('../../utils/resourceProfile.js')
const { request } = require('../../utils/util.js')
const { getLocalFallbackModels, normalizeModelList } = require('../../utils/xrModels.js')

Page({
  data: {
    width: 375,
    height: 600,
    renderWidth: 750,
    renderHeight: 1200,
    networkType: 'unknown',
    isSlowNetwork: false,
    modelReady: false,
    modelOptions: [],
    modelNames: [],
    modelIndex: 0,
    selectedModelSrc: '',
    modelHint: ''
  },
  onLoad() {
    const info = wx.getSystemInfoSync();
    const w = info.windowWidth;
    const h = info.windowHeight;
    const rawDpr = info.pixelRatio || 2;
    wx.getNetworkType({
      success: ({ networkType }) => {
        const dpr = getAdaptiveDpr(networkType, rawDpr);
        this.setData({
          width: w,
          height: h,
          renderWidth: Math.floor(w * dpr),
          renderHeight: Math.floor(h * dpr),
          networkType,
          isSlowNetwork: isSlowNetwork(networkType)
        });
      },
      fail: () => {
        const dpr = getAdaptiveDpr('unknown', rawDpr);
        this.setData({
          width: w,
          height: h,
          renderWidth: Math.floor(w * dpr),
          renderHeight: Math.floor(h * dpr),
          networkType: 'unknown',
          isSlowNetwork: true
        });
      }
    });
    this.initModelOptions();
  },

  initModelOptions() {
    this.applyModelOptions(getLocalFallbackModels(), '默认本地模型，可在后端接入后自动切换')
    request({ url: '/ar/models' })
      .then((res) => {
        const raw = res.data && (res.data.list || res.data)
        const models = normalizeModelList(raw)
        if (!models.length) {
          this.applyModelOptions(getLocalFallbackModels(), '未获取到后端模型清单，已切换本地兜底模型')
          return
        }
        this.applyModelOptions(models, '模型清单来自后端 /ar/models')
      })
      .catch((err) => {
        console.warn('加载模型清单失败，使用本地兜底:', err)
        this.applyModelOptions(getLocalFallbackModels(), '模型清单加载失败，已切换本地兜底模型')
      })
  },

  applyModelOptions(models, hint) {
    const list = Array.isArray(models) ? models : []
    if (!list.length) {
      return
    }
    this.setData({
      modelOptions: list,
      modelNames: list.map((m) => m.name),
      modelIndex: 0,
      selectedModelSrc: list[0].modelUrl,
      modelHint: hint || ''
    })
  },

  onModelChange(e) {
    const idx = Number(e.detail && e.detail.value)
    const list = this.data.modelOptions || []
    if (!Number.isInteger(idx) || idx < 0 || idx >= list.length) {
      return
    }
    this.setData({
      modelIndex: idx,
      selectedModelSrc: list[idx].modelUrl
    })
  },

  onStartRender() {
    this.setData({ modelReady: true });
  }
});
