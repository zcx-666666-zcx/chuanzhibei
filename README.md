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

## 前端

1. 微信开发者工具打开 `chuanzhifron`
2. 如需真机联调，请在小程序运行时设置：

```js
wx.setStorageSync('apiBaseUrl', 'http://你的局域网IP:8001')
```

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
