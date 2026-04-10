const { buildStaticUrl } = require('./config.js')

function getLocalFallbackModels() {
  return [
    {
      id: 'jingde',
      name: '青花瓷（本地示例）',
      modelUrl: buildStaticUrl('/uploads/xr-demo/cool-star.glb'),
      source: 'local'
    },
    {
      id: 'bronze',
      name: '青铜器（待替换）',
      modelUrl: buildStaticUrl('/uploads/xr-demo/bronze-vessel.glb'),
      source: 'local'
    },
    {
      id: 'embroidery',
      name: '苏绣纹样（待替换）',
      modelUrl: buildStaticUrl('/uploads/xr-demo/embroidery-frame.glb'),
      source: 'local'
    }
  ]
}

function normalizeModelList(rawList) {
  if (!Array.isArray(rawList)) {
    return []
  }
  return rawList
    .map((item, index) => {
      if (!item) return null
      const name = String(item.name || item.title || `模型 ${index + 1}`).trim()
      const src = item.modelUrl || item.url || item.src || ''
      if (!src) return null
      return {
        id: String(item.id || `model-${index + 1}`),
        name,
        modelUrl: src.startsWith('http') ? src : buildStaticUrl(src),
        source: item.source || 'api'
      }
    })
    .filter(Boolean)
}

module.exports = {
  getLocalFallbackModels,
  normalizeModelList
}
