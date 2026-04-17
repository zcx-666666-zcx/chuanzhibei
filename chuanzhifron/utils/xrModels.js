const { buildStaticUrl } = require('./config.js')

function getLocalFallbackModels() {
  return [
    {
      id: 'stone-stele',
      name: '古代石碑',
      modelUrl: buildStaticUrl('/uploads/3D/ancient-stone-stele.glb'),
      source: 'local'
    },
    {
      id: 'manuscript-cylinder',
      name: '古代经卷轴筒',
      modelUrl: buildStaticUrl('/uploads/3D/ancient-manuscript-cylinder.glb'),
      source: 'local'
    },
    {
      id: 'cloisonne-vase',
      name: '景泰蓝花瓶',
      modelUrl: buildStaticUrl('/uploads/3D/cloisonne-vase.glb'),
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
