function createPageState(overrides) {
  return Object.assign({
    loading: false,
    refreshing: false,
    error: '',
    empty: false
  }, overrides || {})
}

function patchPageState(page, patch) {
  page.setData({
    pageState: Object.assign({}, page.data.pageState || createPageState(), patch || {})
  })
}

module.exports = {
  createPageState,
  patchPageState
}
