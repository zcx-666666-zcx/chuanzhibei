# 前端小程序说明

前端项目目录：`chuanzhifron`

## 关键结构

- `pages/`: 业务页面（首页三 Tab、二级列表与详情、沉浸与 AR、登录注册等）
- `components/`: 复用组件；**已使用**：`xr-demo-viewer`（3D 演示）。**未接入**：`news-card`（与 `newsList` 内联卡片重复，可删或后续接入）
- `utils/env.js`: `APP_ENV`、`USE_MOCK_IN_DEVELOPMENT`、开发/生产 API 根地址；控制是否走 mock
- `utils/config.js`: `getBaseUrl` / `buildApiUrl` / `buildStaticUrl`、`API_PREFIX=/api`
- `utils/util.js`: `request`（token、超时、401/403）、`requestErrorMessage`、`formatTime`
- `utils/auth.js`: 登录注册与本地会话
- `utils/newsDisplay.js`: 新闻列表分页结构解析与列表项映射（首页、`newsList`）
- `utils/resourceProfile.js`: 视频预加载策略、3D 页网络与 DPR 自适应（`ARExperience`、`ARPlay`、`ARProjectList`、`xrDemo3D`）
- `utils/xrModels.js`: 3D 模型清单规范化与本地兜底（`xrDemo3D`）
- `utils/mockApi.js`: 本地 mock 数据（仅 `useMockApi()` 为 true 时经 `util.js` 调用）

## 环境与联调配置

- `utils/env.js`：`APP_ENV`（`development` / `production`）、`USE_MOCK_IN_DEVELOPMENT`、`PRODUCTION_API_BASE_URL`。生产发布前改为 `production` 并填写 https 根地址（见根目录 `doc/deploy/生产部署指南.md`）。
- `utils/config.js` 默认开发地址 `DEFAULT_BASE_URL`：`http://localhost:8001`
- 运行时覆盖（优先级最高）：
  - `wx.setStorageSync('apiBaseUrl', 'http://你的IP:8001')` 或生产 `https://...`

说明：
- `buildApiUrl('/auth/login')` 会自动拼接为 `${base}/api/auth/login`
- `buildStaticUrl('/uploads/xxx.jpg')` 会自动拼接为 `${base}/uploads/xxx.jpg`

## 开发约束（联调稳定性）

- 不要在页面里新增 `http://localhost:8001` 硬编码
- API 请求统一走 `utils/util.js` 的 `request`
- 静态资源 URL 统一走 `buildStaticUrl`

## 小程序功能说明（页面与能力）

以下为「遗韵 · 非遗传承」小程序各页产品能力说明，与 `app.json` 三 Tab（**首页 / 沉浸 / 我的**）及二级页一致。

### 首页 `pages/index/index`

1. **遗韵卡片（顶区）**
   - **搜索资讯**：按关键词检索新闻，主要匹配**标题**（支持模糊匹配），结果在新闻列表页展示。
   - **通知**：拉取首页通知数据并弹窗展示最新动态。

2. **寻迹导航（八宫格，与 `pages/index/index.wxml` 一致）**
   - **新闻列表** → `newsList` → **新闻详情** `newsDetail`。
   - **国家级名录 / 省级名录** → `nationalHeritageList` / `provincialHeritageList`：客户端按类别筛选；点项 → **非遗详情** `heritageDetail`（收藏、标签等）。
   - **传承人名录** → `masterList`：可 **预约体验**（`POST /user/bookings`）；点卡 → **传承人详情** `inheritorDetail`（`GET /inheritor/{id}`）。
   - **技艺视频** → `skillVideoList`（`GET /video/list`）。
   - **活动列表** → `activityList`（报名/预约观看，串联 `activity/join` 与 `user/bookings`）。
   - **我的收藏** → `collectionList`（需登录）。
   - **我的预约** → `bookingList`（需登录）。
   - **说明**：首页九宫格**未**放置「学习中心」入口；`pages/learning/learning` 仍在 `app.json` 中注册，供后续研学迭代或手动路径调试，当前主链路不依赖。

3. **推荐跳转链**
   - **链 A～D**（见 `index.wxml`）：链 A 新闻列表；链 B `Heritage`（须 `navigateTo`）；链 C 直达非遗详情（优先 `GET /heritage/recommended` 首条，避免硬编码）；链 D **switchTab** 至沉浸 Tab（界面文案可能仍写「AR 沉浸」，能力与沉浸页一致）。

4. **轮播图**
   - `GET /banners`；点击结合 `newsId` / 标题 / 关键词跳转新闻详情或列表（见 `index.js`）。

5. **寻迹 · 文化热点**
   - 使用 `GET /news/recent` 等拉取；首页展示若干条（与 `index.js` 中展示条数一致）；「全部」→ `newsList`；列表页支持搜索与分页（`utils/newsDisplay.js`）。

6. **精选非遗**
   - 横向展示约 **4～5 个**各地代表性非遗项目（可轮换展示），点击进入**非遗详情**。

7. **文物复原 / 沉浸体验通栏**
   - 「立即体验」等入口 **切换至沉浸 Tab**（`pages/ARExperience/ARExperience`）。

### 沉浸 Tab `pages/ARExperience/ARExperience`

- **前若干块**：品牌与**体验引导**类静态文案/配图（说明向，无复杂交互）。
- **3D 沉浸演示**：进入 `pages/xrDemo3D/xrDemo3D`，使用预设 **3D 模型（如 glTF）** 演示（组件 `components/xr-demo-viewer`）。
- **3D / 沉浸体验项目**：横向卡片展示若干精选非遗相关体验项（约 3 个量级）；点击进入与 **3D 演示或相机体验页**（如 `ARPlay`）衔接的链路。产品表述侧重 **数字化沉浸与 3D 体验**；具体能力以当前接口与页面为准。
- **我的体验记录**：登录后展示本账号**最近若干条**（如 2～3 条）体验记录，可配合「重新体验」等操作。

### 我的 `pages/PersonalCenter/PersonalCenter`

- **个人简介卡片**：头像、昵称、个人签名、**收藏数量**与**预约数量**等摘要；点击进入**编辑资料**（本地上传头像、修改昵称与签名，保存后同步后端）。
- **我的收藏 / 预约体验**：各展示**最近 3 条**左右摘要，支持「查看更多」进入完整列表页。

### 相关文档

- 根目录 `README.md`：联调与启动。
- `doc/project/项目全面介绍文档.md`：架构与模块总览。
- `doc/project/竞赛迭代规划与实现路径.md`：与界面对照的接口与迭代任务。
- `doc/deploy/生产部署指南.md`：上线与环境变量。
