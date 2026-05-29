<template>
  <div class="dashboard">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">传智杯后台管理中心</p>
        <h1>非遗内容、用户预约、运营数据统一管理</h1>
        <p class="summary">
          当前后台已接入若依 Vue3 管理壳，配套 Spring Boot + MySQL + Redis 管理接口，
          支持系统管理、内容管理和基础监控页面。
        </p>
      </div>
      <div class="hero-panel">
        <div class="hero-card">
          <span>默认账号</span>
          <strong>admin</strong>
        </div>
        <div class="hero-card">
          <span>默认密码</span>
          <strong>admin123</strong>
        </div>
        <div class="hero-card">
          <span>接口文档</span>
          <a href="http://127.0.0.1:8080/swagger-ui.html" target="_blank">打开 Swagger</a>
        </div>
      </div>
    </section>

    <section class="grid">
      <article class="panel">
        <h3>管理范围</h3>
        <ul>
          <li>系统用户、角色、菜单、部门管理</li>
          <li>非遗、传承人、新闻、轮播、视频管理</li>
          <li>活动、3D 沉浸演示、小程序用户、预约管理</li>
        </ul>
      </article>
      <article class="panel">
        <h3>运行说明</h3>
        <ul>
          <li>后台接口默认地址：`http://127.0.0.1:8080`</li>
          <li>Redis 建议使用 Docker 容器 `redis-chuanzhibei` 或自定义名称</li>
          <li>数据库缺失表会在 `ruoyi-admin` 启动时自动补齐</li>
        </ul>
      </article>
      <article class="panel">
        <h3>当前状态</h3>
        <ul>
          <li>若依登录、菜单、用户信息链路已接通</li>
          <li>统一 SQL 已并入 [schema-bootstrap.sql](/Users/zhangchenxi/Documents/CodeProjects/chuanzhibei-main/chuanzhiback/demo/src/main/resources/schema-bootstrap.sql)</li>
          <li>管理前端位于 [ruoyi-ui](/Users/zhangchenxi/Documents/CodeProjects/chuanzhibei-main/chuanzhiback/ruoyi-ui)</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  min-height: calc(100vh - 120px);
  background:
    radial-gradient(circle at top left, rgba(194, 84, 26, 0.12), transparent 30%),
    linear-gradient(135deg, #f5efe5 0%, #fbf8f3 45%, #f0e6d8 100%);
  padding: 24px;
  color: #3a2a1d;
}

.hero {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.hero-copy,
.hero-panel,
.panel {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(115, 78, 40, 0.12);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(91, 63, 34, 0.08);
  backdrop-filter: blur(12px);
}

.hero-copy {
  padding: 32px;
}

.eyebrow {
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 12px;
  color: #8d5c2f;
  margin-bottom: 16px;
}

h1 {
  margin: 0 0 18px;
  font-size: 40px;
  line-height: 1.15;
}

.summary {
  max-width: 680px;
  font-size: 16px;
  line-height: 1.8;
  color: #634a33;
}

.hero-panel {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.hero-card {
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fffefc 0%, #f6ede0 100%);
  border: 1px solid rgba(115, 78, 40, 0.1);
}

.hero-card span {
  display: block;
  font-size: 13px;
  color: #896446;
  margin-bottom: 8px;
}

.hero-card strong,
.hero-card a {
  font-size: 22px;
  color: #8b3f16;
  text-decoration: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.panel {
  padding: 24px;
}

.panel h3 {
  margin: 0 0 16px;
  font-size: 20px;
}

.panel ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
  color: #5f4730;
}

@media (max-width: 960px) {
  .hero,
  .grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 30px;
  }
}
</style>
