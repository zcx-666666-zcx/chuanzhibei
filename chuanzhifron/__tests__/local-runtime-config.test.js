const env = require('../utils/env.js')
const config = require('../utils/config.js')

describe('local runtime config', () => {
  test('development defaults use the local backend without mock data', () => {
    expect(env.APP_ENV).toBe('development')
    expect(env.useMockApi()).toBe(false)
    expect(config.getBaseUrl()).toBe('http://localhost:8001')
    expect(config.buildApiUrl('/home/debug-info')).toBe('http://localhost:8001/api/home/debug-info')
  })
})
