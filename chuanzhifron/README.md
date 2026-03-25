# 前端小程序说明

前端项目目录：`chuanzhifron`

## 关键结构

- `pages/`: 业务页面（首页、非遗名录、AR、社区、个人中心等）
- `components/`: 通用组件
- `utils/config.js`: 联调地址统一配置（新增）
- `utils/util.js`: 请求封装（统一 token、超时、错误处理）
- `utils/auth.js`: 认证相关 API

## 联调配置

默认后端地址在 `utils/config.js` 的 `DEFAULT_BASE_URL`：

- 默认：`http://localhost:8001`
- 可在运行时通过本地缓存覆盖：
  - `wx.setStorageSync('apiBaseUrl', 'http://你的IP:8001')`

说明：
- `buildApiUrl('/auth/login')` 会自动拼接为 `${base}/api/auth/login`
- `buildStaticUrl('/uploads/xxx.jpg')` 会自动拼接为 `${base}/uploads/xxx.jpg`

## 开发约束（联调稳定性）

- 不要在页面里新增 `http://localhost:8001` 硬编码
- API 请求统一走 `utils/util.js` 的 `request`
- 静态资源 URL 统一走 `buildStaticUrl`
