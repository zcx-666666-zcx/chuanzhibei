# 非遗传承系统（前后端联调版）

本仓库包含两个子项目：

- `chuanzhifron`: 微信小程序前端
- `chuanzhiback/demo`: Spring Boot 后端

## 文档目录

- 总索引：[doc/README.md](doc/README.md)
- 项目总览：[doc/project/项目全面介绍文档.md](doc/project/项目全面介绍文档.md)
- 迭代规划：[doc/project/竞赛迭代规划与实现路径.md](doc/project/竞赛迭代规划与实现路径.md)
- 开发日志：[doc/project/开发日志-2026-03-24.md](doc/project/开发日志-2026-03-24.md)
- 生产部署：[doc/deploy/生产部署指南.md](doc/deploy/生产部署指南.md)
- 后台部署：[doc/deploy/若依后台部署指南.md](doc/deploy/若依后台部署指南.md)
- 专题方案：[doc/specs/非遗传承系统专题页功能设计方案.md](doc/specs/非遗传承系统专题页功能设计方案.md)
- 本地开发记录：[doc/internal/local-dev/本地小程序完善计划.md](doc/internal/local-dev/本地小程序完善计划.md)
- 执行计划归档：[doc/internal/plans/2026-05-29-local-miniapp-improvement.md](doc/internal/plans/2026-05-29-local-miniapp-improvement.md)
- 本地原始文档归档：[doc/archive/法贴雕版拓印-市级非遗项目.docx](<doc/archive/法贴雕版拓印-市级非遗项目.docx>)

## 架构优化结果（本次）

### 1) 前端联调入口统一

- 新增 `chuanzhifron/utils/config.js`，统一管理：
  - API 基础地址
  - 静态资源基础地址
  - API / 静态 URL 组装方法
- `chuanzhifron/utils/util.js` 已改为统一请求层：
  - 自动拼接 API 地址
  - 自动携带 token
  - 增加超时控制
  - 统一错误处理
- `chuanzhifron/utils/auth.js` 已改为复用统一请求层，移除认证链路硬编码地址
- `pages/login/login.js`、`pages/register/register.js`、`pages/PersonalCenter/PersonalCenter.js` 已接入统一 URL 组装
- `utils/env.js` 支持开发/生产双域名配置（`DEVELOPMENT_API_BASE_URL` / `PRODUCTION_API_BASE_URL`），当前联调示例为 `https://1151290dt34oy.vicp.fun`
- `buildStaticUrl` 增加绝对地址重写兜底：历史 `http` 或 `localhost` 资源会自动改写到当前 `https` 基础域名，减少真机图片/视频加载失败

### 2) 后端配置外置化

`chuanzhiback/demo/src/main/resources/application.properties` 已改为环境变量优先：

- `DB_URL` / `DB_USERNAME` / `DB_PASSWORD`
- `REDIS_HOST` / `REDIS_PORT`
- `SERVER_PORT`
- `CORS_ALLOWED_ORIGIN_PATTERNS`
- `PUBLIC_BASE_URL`

`SecurityConfig` 已支持从 `app.cors.allowed-origin-patterns` 读取 CORS 白名单（逗号分隔）。

### 3) 避免后端硬编码域名

`UserController` 删除旧头像逻辑改为 URI 解析，不再依赖固定 `http://localhost:8001`。

### 4) 本地调试功能补全

- 新增新闻搜索接口：`GET /api/news/search?keyword=关键词`
- 新增首页通知接口：`GET /api/home/notifications`
- 新增联调状态接口：`GET /api/home/debug-info`
- 首页搜索、通知、新闻列表关键词过滤、个人中心菜单已改为可执行逻辑
- 后端静态资源映射增加多路径候选（`WebConfig`），降低因启动目录差异造成的 `/uploads/**` 资源 500 风险

## 快速启动

## 后端

1. 准备 MySQL / Redis
2. 在终端设置环境变量（示例）：

```bash
export DB_URL="jdbc:mysql://localhost:3306/intangible_heritage?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true"
export DB_USERNAME="root"
export DB_PASSWORD="你的密码"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export SERVER_PORT="8001"
export CORS_ALLOWED_ORIGIN_PATTERNS="*"
export PUBLIC_BASE_URL="http://localhost:8001"
```

3. 启动服务：

```bash
cd chuanzhiback/demo
./mvnw spring-boot:run
```

### 健康检查

- `GET /actuator/health`
- `GET /actuator/health/liveness`
- `GET /actuator/health/readiness`

生产环境部署细节请参考：[`doc/deploy/生产部署指南.md`](doc/deploy/生产部署指南.md)（含后端 `prod` 启动校验、`utils/env.js` 发布开关、小程序合法域名）。

- 小程序：`chuanzhifron/utils/env.js` 中 `APP_ENV` / `PRODUCTION_API_BASE_URL`
- 后端：`SPRING_PROFILES_ACTIVE=prod` 且满足 `TOKEN_SECRET`、`PUBLIC_BASE_URL`（https）、`CORS_ALLOWED_ORIGIN_PATTERNS`（禁止 `*`）

## 前端

1. 微信开发者工具打开 `chuanzhifron`
2. 如需真机联调，请在小程序运行时设置：

```js
wx.setStorageSync('apiBaseUrl', 'https://你的可访问域名')
```

### 前端页面结构与导航

**完整产品说明**（首页区块、九宫格、沉浸 Tab、个人中心细则）见 [`chuanzhifron/README.md`](chuanzhifron/README.md) 中的「小程序功能说明」。

- **底部 Tab（与 `app.json` 一致）**：
  - **首页** `pages/index/index`：遗韵区（**搜索资讯**标题模糊匹配、**通知**）；**寻迹导航**八宫格（与 `index.wxml` 一致）：新闻列表、国家级名录、省级名录、传承人名录、技艺视频、活动列表、我的收藏、我的预约；**推荐跳转链**链 A～D；**轮播**；**文化热点**；**精选非遗**；通栏 **switchTab** 至沉浸 Tab。
  - **沉浸** `pages/ARExperience/ARExperience`：引导文案；**3D 沉浸演示**（`pages/xrDemo3D` + `components/xr-demo-viewer`）；横向体验项目（`GET /ar/projects`，「全部」→ `ARProjectList` → `ARPlay`）；**我的体验记录**（`GET /ar/history` 等）。
  - **我的** `pages/PersonalCenter/PersonalCenter`：简介与统计、编辑资料（含头像上传）；最近收藏/预约摘要与列表入口。

- **非 Tab 二级页**：以 `app.json` 的 `pages` 为准，主要包括：登录/注册、非遗名录与详情、国家/省级列表、新闻列表/详情、传承人列表与 `inheritorDetail`、技艺视频、活动、收藏/预约列表、`ARProjectList`、`ARPlay`、`xrDemo3D` 等。
- **已注册但当前无首页入口的页面**：`pages/learning/learning`（学习中心，后端已有 `GET/POST /api/learning/*`，竞赛主链路暂缓）；`pages/logs/logs`（仅展示 `app.js` 写入的本地时间戳，无业务跳转）。
- **未写入 `app.json` 的占位目录**（打包不收录，演示中不可用）：`pages/Admin/`、`pages/bannerManagement/`。
- **未接入的组件**：`components/news-card`（新闻列表页使用内联结构，未在 `usingComponents` 中引用）。

> 说明：`app.js` 中 `globalData.localDataMode` 与 `utils/env.js` 的 `useMockApi()` 一致；为 `true` 时 `request` 走 `utils/mockApi.js`。生产环境 `APP_ENV=production` 时 mock 强制关闭。联调默认见 `utils/env.js` 中 `USE_MOCK_IN_DEVELOPMENT`。

## 当前状态（2026-04-05）

- 核心链路（登录/注册、资讯、非遗详情、收藏、预约、沉浸项目、AR 历史）联调通过，可用于比赛演示。
- 图片/视频在 `https` 域名下已可正常访问（配合小程序合法域名配置）。
- 3D 页已具备进入、模型切换与基础渲染能力；高质量模型效果与视觉调优待后续补充。
- 根目录与各子文档已按当前代码（页面注册、八宫格、接口与遗留模块）统一更新，详见 [`doc/project/开发日志-2026-03-24.md`](doc/project/开发日志-2026-03-24.md) 中「文档与代码全量对齐」一节。

## 联调稳定性检查清单

- 后端端口是否与前端配置一致（默认 `8001`）
- 真机联调是否使用 IP 而非 `localhost`
- CORS 白名单是否包含当前前端来源
- 上传接口是否返回相对路径（前端统一通过 `buildStaticUrl` 转完整地址）
- 登录态过期时是否自动清理 token（请求层已处理 401）

## 后续建议（可持续演进）

- 持续将页面内零散 `localhost` 字符串迁移到 `buildStaticUrl`
- 统一后端响应格式字段（`success/message/data`）并补充接口契约文档
- 增加前后端联调冒烟脚本（登录、列表、上传、收藏、预约）
