const { createPageState } = require('../utils/page-state.js')

describe('page-state utils', () => {
  test('createPageState merges overrides', () => {
    const state = createPageState({ loading: true, error: 'failed' })
    expect(state).toEqual({
      loading: true,
      refreshing: false,
      error: 'failed',
      empty: false
    })
  })
})
