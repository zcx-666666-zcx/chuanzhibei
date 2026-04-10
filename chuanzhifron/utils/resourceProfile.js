/**
 * 资源加载策略：
 * - 慢网时降低 3D 渲染分辨率（减少 GPU/CPU 压力）
 * - 列表预览视频只拉取 metadata，慢网下可关闭预加载
 */
function isSlowNetwork(networkType) {
  return networkType === '2g' || networkType === '3g' || networkType === 'none' || networkType === 'unknown'
}

function getVideoPreloadMode(networkType) {
  return isSlowNetwork(networkType) ? 'none' : 'metadata'
}

function getAdaptiveDpr(networkType, pixelRatio) {
  const raw = Number(pixelRatio) || 2
  if (isSlowNetwork(networkType)) {
    return Math.min(raw, 1.5)
  }
  return Math.min(raw, 2)
}

module.exports = {
  isSlowNetwork,
  getVideoPreloadMode,
  getAdaptiveDpr
}
