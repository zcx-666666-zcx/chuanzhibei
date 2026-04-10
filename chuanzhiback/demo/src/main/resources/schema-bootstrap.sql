-- =============================================================================
-- 遗韵 · 非遗传承 — 数据库表结构（与小程序前端能力 + Spring JPA 实体对齐）
-- 说明：
--   1. 全部使用 CREATE TABLE IF NOT EXISTS，可重复执行；表已存在则跳过。
--   2. 由 SchemaBootstrapRunner 在 Spring 上下文就绪后执行；continue-on-error 已开启。
--   3. 开发环境若 spring.jpa.hibernate.ddl-auto=update，Hibernate 会先建/更新表，
--      本脚本再次执行时为幂等 no-op，用于团队统一「权威 DDL」与手工建库。
--   4. 若使用 ddl-auto=validate，请先确保本脚本已执行过一次或表已由 Hibernate 建好。
-- =============================================================================

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------- 
-- 用户（登录 / 个人中心 / 收藏与预约外键）
-- 对应实体：User → users
-- -----------------------------------------------------------------------------
<llm-snippet-file>demo/src/main/resources/schema-bootstrap.sql</llm-snippet-file>
-- =============================================================================
-- 遗韵 · 非遗传承 — 数据库表结构（与小程序前端能力 + Spring JPA 实体对齐）
-- 说明：
--   1. 全部使用 CREATE TABLE IF NOT EXISTS，可重复执行；表已存在则跳过。
--   2. 由 SchemaBootstrapRunner 在 Spring 上下文就绪后执行；continue-on-error 已开启。
--   3. 开发环境若 spring.jpa.hibernate.ddl-auto=update，Hibernate 会先建/更新表，
--      本脚本再次执行时为幂等 no-op，用于团队统一「权威 DDL」与手工建库。
--   4. 若使用 ddl-auto=validate，请先确保本脚本已执行过一次或表已由 Hibernate 建好。
-- =============================================================================

SET NAMES utf8mb4;

USE your_database_name;
-- Add this line to select the database

-- ----------------------------------------------------------------------------- 
-- 用户（登录 / 个人中心 / 收藏与预约外键）
-- 对应实体：User → users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    openid      VARCHAR(255) NULL UNIQUE,
    username    VARCHAR(50)  NULL UNIQUE,
    password    VARCHAR(255) NULL,
    nickname    VARCHAR(100) NULL,
    avatar_url  VARCHAR(500) NULL,
    gender      VARCHAR(10)  NULL,
    country     VARCHAR(50)  NULL,
    province    VARCHAR(50)  NULL,
    city        VARCHAR(50)  NULL,
    language    VARCHAR(20)  NULL,
    email       VARCHAR(100) NULL,
    signature   VARCHAR(255) NULL,
    create_time DATETIME(6)  NULL,
    update_time DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 新闻（首页文化热点、列表、详情、搜索、通知聚合）
-- 对应实体：News → news（注意：id 由业务赋值时可关闭自增，此处自增便于演示）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news
(
    id           BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255)  NOT NULL,
    description  VARCHAR(1000) NULL,
    content      TEXT          NULL,
    image_urls   VARCHAR(1000) NULL,
    publish_time DATETIME(6)   NULL,
    create_time  DATETIME(6)   NULL,
    update_time  DATETIME(6)   NULL,
    author       VARCHAR(100)  NULL DEFAULT '非遗文化编辑部'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 非遗项目（名录、详情、推荐、收藏关联）
-- 对应实体：Heritage → heritage；level：1 国家级 / 2 省级（与前端约定一致）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS heritage
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    image_url   VARCHAR(500) NULL,
    region      VARCHAR(100) NULL,
    category    VARCHAR(50)  NULL,
    level       INT          NULL,
    create_time DATETIME(6)  NULL,
    update_time DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 传承人（传承人名录）
-- 对应实体：Inheritor → inheritor
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inheritor
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    skill       VARCHAR(100) NULL,
    description TEXT         NULL,
    image_url   VARCHAR(500) NULL,
    level       VARCHAR(50)  NULL,
    create_time DATETIME(6)  NULL,
    update_time DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AR 体验条目（旧版实体 ArExperience；与 AR 项目列表 POJO 不同）
-- 对应实体：ArExperience → ar_experience
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_experience
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    image_url   VARCHAR(500) NULL,
    is_hot      TINYINT(1)   NULL DEFAULT 0,
    create_time DATETIME(6)  NULL,
    update_time DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 首页轮播
-- 对应实体：Banner → banner
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banner
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    image_url   VARCHAR(500) NULL,
    create_time DATETIME(6)  NULL,
    update_time DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 用户收藏非遗
-- 对应实体：UserCollection → user_collections
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_collections
(
    id                   BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT       NOT NULL,
    heritage_id          BIGINT       NULL,
    heritage_name        VARCHAR(255) NULL,
    heritage_description TEXT         NULL,
    heritage_level       VARCHAR(50)  NULL,
    image_url            VARCHAR(500) NULL,
    create_time          DATETIME(6)  NULL,
    update_time          DATETIME(6)  NULL,
    CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    KEY idx_uc_user (user_id),
    KEY idx_uc_heritage (heritage_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 用户预约（活动 / 传承人体验等）
-- 对应实体：UserBooking → user_bookings；booking_type 存 experience/activity/watch
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_bookings
(
    id             BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    booking_type   VARCHAR(50)  NOT NULL,
    master_id      BIGINT       NULL,
    master_name    VARCHAR(255) NULL,
    skill          VARCHAR(255) NULL,
    master_avatar  VARCHAR(500) NULL,
    activity_id    BIGINT       NULL,
    activity_title VARCHAR(255) NULL,
    booking_time   VARCHAR(255) NULL,
    location       VARCHAR(255) NULL,
    contact        VARCHAR(255) NULL,
    status         VARCHAR(50)  NULL DEFAULT 'pending',
    create_time    DATETIME(6)  NULL,
    update_time    DATETIME(6)  NULL,
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    KEY idx_ub_user (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 线下活动
-- 对应实体：Activity → activity
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity
(
    id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NULL,
    description  TEXT         NULL,
    start_time   DATETIME(6)  NULL,
    end_time     DATETIME(6)  NULL,
    location     VARCHAR(255) NULL,
    capacity     INT          NULL,
    participants INT          NULL,
    status       VARCHAR(50)  NULL,
    create_time  DATETIME(6)  NULL,
    update_time  DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 技艺视频
-- 对应实体：Video → video
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video
(
    id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NULL,
    description  TEXT         NULL,
    thumbnail    VARCHAR(500) NULL,
    video_url    VARCHAR(500) NULL,
    duration     VARCHAR(50)  NULL,
    views        BIGINT       NULL,
    inheritor_id BIGINT       NULL,
    category     VARCHAR(100) NULL,
    create_time  DATETIME(6)  NULL,
    update_time  DATETIME(6)  NULL,
    KEY idx_video_inheritor (inheritor_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AR 体验历史（沉浸 Tab「我的体验记录」、POST /api/ar/history）
-- 对应实体：ARExperienceRecord → ar_experience_records
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_experience_records
(
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    project_id    BIGINT       NULL,
    project_name  VARCHAR(255) NULL,
    project_thumb VARCHAR(500) NULL,
    start_time    DATETIME(6)  NULL,
    duration      INT          NULL,
    create_time   DATETIME(6)  NULL,
    update_time   DATETIME(6)  NULL,
    CONSTRAINT fk_aer_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    KEY idx_aer_user (user_id),
    KEY idx_aer_project (project_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AR 项目（可选：当前后端多为内存 ARProject POJO；落库后可改服务读此表）
-- 无对应 @Entity 时 Hibernate 不会管理本表，仅由本脚本创建。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_project
(
    id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    description  TEXT         NULL,
    detail       TEXT         NULL,
    instruction  TEXT         NULL,
    cover_image  VARCHAR(500) NULL,
    marker_image VARCHAR(500) NULL,
    video_url    VARCHAR(500) NULL,
    duration     VARCHAR(50)  NULL,
    category     VARCHAR(100) NULL,
    is_hot       TINYINT(1)   NULL DEFAULT 0,
    create_time  DATETIME(6)  NULL,
    update_time  DATETIME(6)  NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;;

-- -----------------------------------------------------------------------------
-- 新闻（首页文化热点、列表、详情、搜索、通知聚合）
-- 对应实体：News → news（注意：id 由业务赋值时可关闭自增，此处自增便于演示）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NULL,
    content TEXT NULL,
    image_urls VARCHAR(1000) NULL,
    publish_time DATETIME(6) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    author VARCHAR(100) NULL DEFAULT '非遗文化编辑部'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 非遗项目（名录、详情、推荐、收藏关联）
-- 对应实体：Heritage → heritage；level：1 国家级 / 2 省级（与前端约定一致）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS heritage (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    region VARCHAR(100) NULL,
    category VARCHAR(50) NULL,
    level INT NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 传承人（传承人名录）
-- 对应实体：Inheritor → inheritor
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inheritor (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    skill VARCHAR(100) NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    level VARCHAR(50) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AR 体验条目（旧版实体 ArExperience；与 AR 项目列表 POJO 不同）
-- 对应实体：ArExperience → ar_experience
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_experience (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    is_hot TINYINT(1) NULL DEFAULT 0,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 首页轮播
-- 对应实体：Banner → banner
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banner (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 用户收藏非遗
-- 对应实体：UserCollection → user_collections
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_collections (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    heritage_id BIGINT NULL,
    heritage_name VARCHAR(255) NULL,
    heritage_description TEXT NULL,
    heritage_level VARCHAR(50) NULL,
    image_url VARCHAR(500) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_uc_user (user_id),
    KEY idx_uc_heritage (heritage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 用户预约（活动 / 传承人体验等）
-- 对应实体：UserBooking → user_bookings；booking_type 存 experience/activity/watch
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_bookings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booking_type VARCHAR(50) NOT NULL,
    master_id BIGINT NULL,
    master_name VARCHAR(255) NULL,
    skill VARCHAR(255) NULL,
    master_avatar VARCHAR(500) NULL,
    activity_id BIGINT NULL,
    activity_title VARCHAR(255) NULL,
    booking_time VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    contact VARCHAR(255) NULL,
    status VARCHAR(50) NULL DEFAULT 'pending',
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_ub_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 线下活动
-- 对应实体：Activity → activity
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NULL,
    description TEXT NULL,
    start_time DATETIME(6) NULL,
    end_time DATETIME(6) NULL,
    location VARCHAR(255) NULL,
    capacity INT NULL,
    participants INT NULL,
    status VARCHAR(50) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 技艺视频
-- 对应实体：Video → video
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NULL,
    description TEXT NULL,
    thumbnail VARCHAR(500) NULL,
    video_url VARCHAR(500) NULL,
    duration VARCHAR(50) NULL,
    views BIGINT NULL,
    inheritor_id BIGINT NULL,
    category VARCHAR(100) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    KEY idx_video_inheritor (inheritor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AR 体验历史（沉浸 Tab「我的体验记录」、POST /api/ar/history）
-- 对应实体：ARExperienceRecord → ar_experience_records
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_experience_records (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT NULL,
    project_name VARCHAR(255) NULL,
    project_thumb VARCHAR(500) NULL,
    start_time DATETIME(6) NULL,
    duration INT NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    CONSTRAINT fk_aer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_aer_user (user_id),
    KEY idx_aer_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AR 项目（可选：当前后端多为内存 ARProject POJO；落库后可改服务读此表）
-- 无对应 @Entity 时 Hibernate 不会管理本表，仅由本脚本创建。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ar_project (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    detail TEXT NULL,
    instruction TEXT NULL,
    cover_image VARCHAR(500) NULL,
    marker_image VARCHAR(500) NULL,
    video_url VARCHAR(500) NULL,
    duration VARCHAR(50) NULL,
    category VARCHAR(100) NULL,
    is_hot TINYINT(1) NULL DEFAULT 0,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
