const { mapNewsItem, normalizeNewsResponseData } = require('../utils/newsDisplay.js')

describe('newsDisplay utils', () => {
  test('normalizeNewsResponseData handles array payload', () => {
    const data = [{ id: 1 }, { id: 2 }]
    expect(normalizeNewsResponseData(data)).toEqual({
      list: data,
      total: 2,
      page: 0,
      size: 2,
      hasMore: false
    })
  })

  test('mapNewsItem builds display fields', () => {
    const item = mapNewsItem({
      id: 7,
      title: '测试新闻',
      author: '管理员',
      imageUrls: '/uploads/news/test.jpg',
      publishTime: '2026-05-26 10:00:00'
    })

    expect(item.image).toContain('/uploads/news/test.jpg')
    expect(item.authorDisplay).toBe('管理员')
    expect(item.date).toBe('2026-05-26')
    expect(item.relTime).toBeTruthy()
  })
})
