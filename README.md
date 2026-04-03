# 非遗传承系统（前后端联调版）

本仓库包含两个子项目：

- `chuanzhifron`: 微信小程序前端
- `chuanzhiback/demo`: Spring Boot 后端

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

生产环境部署细节请参考：`生产部署指南.md`

## 前端

1. 微信开发者工具打开 `chuanzhifron`
2. 如需真机联调，请在小程序运行时设置：

```js
wx.setStorageSync('apiBaseUrl', 'http://你的局域网IP:8001')
```

### 前端页面结构与传承人社区

- 一级 Tab 页：
  - 首页：`pages/index/index`（遗韵长卷 · 寻迹导航 · 文化热点与精选非遗）
  - 探索：`pages/Heritage/Heritage`（国家级 / 省级非遗名录 + 分类筛选）
  - AR：`pages/ARExperience/ARExperience`（AR 项目列表 + 体验记录）
  - 我的：`pages/PersonalCenter/PersonalCenter`（收藏、预约、传承人认证入口）

- 传承人社区链路（本地数据模式下可先离线体验）：
  1. 用户在「我的」页点击「申请成为非遗传承人」（本地 `isInheritor` 标记，用于呈现完整流程）
  2. 认证后，可：
     - 进入 `pages/InheritorCommunity/InheritorCommunity` 查看传承人、技艺视频、活动
     - 进入 `pages/inheritorPost/inheritorPost` 发布「传承人动态」（文章 + 可选视频链接）
  3. 发布的动态缓存在本地存储中，并在传承人社区页的「传承人动态」分区统一展示，形成「我的 → 认证 → 社区 → 发布 → 社区展示」闭环

> 说明：`app.js` 中 `globalData.localDataMode` 为 `true` 时，请求由 `utils/mockApi.js` 本地适配；接入真实后端后将其设为 `false` 即可。

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
