# 传智杯 RuoYi 后台管理系统 — 部署指南

## 一、项目结构概览

```
chuanzhiback/
├── pom.xml                 ← 父 POM（多模块管理）
├── demo/                   ← 原有小程序后端（未改动）
│   ├── pom.xml             ← 已添加 parent 引用
│   └── src/...
└── ruoyi-admin/            ← 新增：RuoYi 后台管理系统
    ├── pom.xml
    └── src/main/
        ├── java/com/ruoyi/
        │   ├── RuoYiAdminApplication.java     ← 启动类（端口 8080）
        │   ├── common/core/                   ← AjaxResult, TableDataInfo, BaseEntity
        │   ├── config/                        ← SecurityConfig, MybatisPlusConfig, WebConfig
        │   ├── security/                      ← JWT 认证（JwtUtils, LoginUser, Filter）
        │   ├── framework/web/                 ← PermissionService, GlobalExceptionHandler
        │   ├── system/                        ← 系统管理（用户/角色/菜单 CRUD）
        │   │   ├── domain/    SysUser, SysRole, SysMenu
        │   │   ├── mapper/    SysUserMapper, SysRoleMapper, SysMenuMapper
        │   │   └── service/   及其实现类
        │   ├── heritage/                      ← 业务表实体 + Mapper（MyBatis-Plus）
        │   │   ├── domain/    Heritage, Inheritor, News, Banner, Video, Activity, ...
        │   │   └── mapper/    对应 Mapper 接口
        │   └── web/controller/
        │       ├── system/    LoginController, UserController, RoleController, MenuController
        │       └── business/  HeritageController, InheritorController, NewsController, ...
        └── resources/
            └── application.yml                ← 主配置（端口8080 / MySQL / Redis / JWT）
```

## 二、前置条件

| 工具       | 要求版本        | 验证命令              |
|-----------|---------------|---------------------|
| Java      | **17+**       | `java -version`     |
| Maven     | **3.6+**      | `mvn -version`      |
| MySQL     | **8.0+**      | `mysql --version`   |
| Redis     | **6.0+**（可选）| `redis-cli ping`    |
| Docker    | 最新版（可选）   | `docker --version`  |

## 三、部署步骤

### 步骤 1：初始化数据库

```bash
# 登录 MySQL，执行统一初始化脚本
mysql -u root -p20250709 intangible_heritage < \
  chuanzhiback/demo/src/main/resources/schema-bootstrap.sql
```

> ⚠️ 此脚本会补齐小程序业务表和后台 `sys_*` 系统表，全部为幂等语句，不会删除既有数据。

### 步骤 2：启动 Redis（如需要）

```bash
# 方式一：Docker 部署（推荐）
docker run -d --name redis-chuanzhibei \
  -p 6379:6379 \
  redis:7-alpine

# 方式二：本地已安装 Redis
redis-server &

# 验证
redis-cli ping   # 应返回 PONG
```

> 💡 如果暂时不用 Redis，可在 `application.yml` 中注释掉 `spring.data.redis` 段，但登录状态管理功能将受限。

### 步骤 3：编译整个项目

```bash
cd chuanzhiback

# 编译全部模块（demo + ruoyi-admin）
mvn clean install -DskipTests

# 只编译 ruoyi-admin 模块
mvn clean install -pl ruoyi-admin -am -DskipTests
```

### 步骤 4：启动后台管理系统

```bash
# 方式一：Maven 直接运行
cd chuanzhiback/ruoyi-admin
mvn spring-boot:run

# 方式二：运行 JAR 包
java -jar ruoyi-admin/target/ruoyi-admin-1.0.0.jar
```

启动成功后看到：
```
(♥◠‿◠)ﾉﾞ  传智杯后台管理系统启动成功   ლ(´ڡ`ლ)ﾞ
后台接口文档: http://localhost:8080/swagger-ui.html
```

### 步骤 5：验证接口

```bash
# 测试登录（默认账号 admin / admin123）
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 返回示例：
# {"code":200,"msg":"登录成功","data":{"token":"eyJhbGciOi..."}}
```

### 步骤 6：克隆 RuoYi-Vue3 前端

```bash
# 克隆若依 Vue3 前端（需在主机上执行）
git clone https://github.com/yangzongzhuan/RuoYi-Vue3.git

cd RuoYi-Vue3

# 安装依赖
npm install

# 修改 .env.development 中的接口地址
# VITE_APP_BASE_API = 'http://localhost:8080'

# 启动前端开发服务器
npm run dev
```

前端默认地址：`http://localhost:80`

## 四、端口与服务关系

| 服务              | 端口    | 用途                    |
|------------------|---------|------------------------|
| demo（小程序后端）  | **8001**| 微信小程序 API（不变）     |
| ruoyi-admin（后台）| **8080**| 管理后台 API + Swagger    |
| RuoYi-Vue3 前端   | **80**  | 浏览器访问的管理界面       |
| MySQL             | 3306    | 两者共享数据库            |
| Redis             | 6379    | 后台 token / 缓存管理     |

## 五、接口清单

### 系统管理接口
| 接口                    | 方法   | 说明         |
|------------------------|--------|-------------|
| `/login`               | POST   | 登录获取Token |
| `/getInfo`             | GET    | 获取当前用户信息 |
| `/getRouters`          | GET    | 获取菜单路由树  |
| `/system/user/list`    | GET    | 用户列表      |
| `/system/role/list`    | GET    | 角色列表      |
| `/system/menu/list`    | GET    | 菜单树列表    |

### 业务管理接口
| 接口                          | 方法      | 说明        |
|------------------------------|----------|------------|
| `/business/heritage/list`    | GET/POST | 非遗项目CRUD |
| `/business/inheritor/list`   | GET/POST | 传承人 CRUD  |
| `/business/news/list`        | GET/POST | 新闻 CRUD    |
| `/business/banner/list`      | GET/POST | 轮播 CRUD    |
| `/business/video/list`       | GET/POST | 视频 CRUD    |
| `/business/activity/list`    | GET/POST | 活动 CRUD    |
| `/business/ar/list`          | GET/POST | AR体验 CRUD  |
| `/business/wxuser/list`      | GET      | 小程序用户查看 |
| `/business/booking/list`     | GET/PUT  | 预约管理      |

### Swagger 在线文档
```
http://localhost:8080/swagger-ui.html
```

## 六、常见问题

### Q1: Maven 依赖下载慢
在 `~/.m2/settings.xml` 中添加阿里云镜像：
```xml
<mirror>
  <id>aliyun</id>
  <mirrorOf>central</mirrorOf>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

### Q2: 编译报错 Java 版本不匹配
确保 JAVA_HOME 指向 Java 17+：
```bash
export JAVA_HOME=/path/to/jdk-17
export PATH=$JAVA_HOME/bin:$PATH
```

### Q3: Redis 连接失败
检查 Redis 是否启动：
```bash
redis-cli ping
# 如果返回 Could not connect，启动 Redis：
docker start redis-chuanzhibei
# 或者在 application.yml 中注释掉 redis 配置段
```

### Q4: 数据库连接失败
确认 MySQL 中存在 `intangible_heritage` 数据库：
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'intangible_heritage';"
```

### Q5: demo 模块编译失败
检查 demo 的 parent 引用是否正确。确保 chuanzhiback/pom.xml 父 POM 已执行过一次 `mvn install`。

## 七、两个系统共存说明

- **demo** 模块（端口 8001）：为微信小程序提供 API，使用 JPA 访问数据库
- **ruoyi-admin** 模块（端口 8080）：后台管理系统，使用 MyBatis-Plus 访问同一数据库
- 两者**共享同一数据库**但使用**不同的 ORM 框架**，互不干扰
- demo 模块的代码完全未改动，可照常使用
