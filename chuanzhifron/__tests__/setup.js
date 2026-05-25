global.wx = {
  getStorageSync: jest.fn(() => ''),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  request: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({ platform: 'devtools' }))
}
