-- =============================================================================
-- 传智杯统一数据库初始化脚本
-- 说明：
--   1. 统一维护小程序业务表与后台管理系统所需 sys_* 表。
--   2. 全部使用 IF NOT EXISTS / ON DUPLICATE KEY UPDATE，支持重复执行。
--   3. 该脚本不会删除或覆盖既有业务数据，只补齐缺失结构与初始后台账号。
-- =============================================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- 小程序业务表
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(255) NULL UNIQUE,
    username VARCHAR(255) NULL UNIQUE,
    password VARCHAR(255) NULL,
    nickname VARCHAR(255) NULL,
    avatar_url VARCHAR(255) NULL,
    gender VARCHAR(255) NULL,
    country VARCHAR(255) NULL,
    province VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    language VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    signature VARCHAR(255) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news (
    id BIGINT NOT NULL PRIMARY KEY,
    title VARCHAR(255) NULL,
    description VARCHAR(1000) NULL,
    content VARCHAR(10000) NULL,
    image_urls VARCHAR(255) NULL,
    publish_time DATETIME(6) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    author VARCHAR(255) NULL,
    date DATE NULL,
    image_url VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS heritage (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    category VARCHAR(255) NULL,
    description VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    level INT NULL,
    name VARCHAR(255) NULL,
    region VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inheritor (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    description VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    level VARCHAR(255) NULL,
    name VARCHAR(255) NULL,
    skill VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ar_experience (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    description VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    model_url VARCHAR(500) NULL,
    instructions TEXT NULL,
    is_hot BIT(1) NULL,
    name VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @ar_model_url_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ar_experience'
      AND COLUMN_NAME = 'model_url'
);
SET @ar_model_url_sql := IF(
    @ar_model_url_exists = 0,
    'ALTER TABLE ar_experience ADD COLUMN model_url VARCHAR(500) NULL AFTER image_url',
    'SELECT 1'
);
PREPARE stmt FROM @ar_model_url_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ar_instructions_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ar_experience'
      AND COLUMN_NAME = 'instructions'
);
SET @ar_instructions_sql := IF(
    @ar_instructions_exists = 0,
    'ALTER TABLE ar_experience ADD COLUMN instructions TEXT NULL AFTER model_url',
    'SELECT 1'
);
PREPARE stmt FROM @ar_instructions_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS banner (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    title VARCHAR(255) NULL,
    description VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @banner_news_id_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'banner'
      AND COLUMN_NAME = 'news_id'
);
SET @banner_news_id_sql := IF(
    @banner_news_id_exists = 0,
    'ALTER TABLE banner ADD COLUMN news_id BIGINT NULL COMMENT ''关联新闻ID'' AFTER image_url',
    'SELECT 1'
);
PREPARE stmt_banner_news_id FROM @banner_news_id_sql;
EXECUTE stmt_banner_news_id;
DEALLOCATE PREPARE stmt_banner_news_id;

CREATE TABLE IF NOT EXISTS user_collections (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    heritage_id BIGINT NULL,
    heritage_name VARCHAR(255) NULL,
    heritage_description TEXT NULL,
    heritage_level VARCHAR(50) NULL,
    image_url VARCHAR(255) NULL,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    KEY idx_uc_user (user_id),
    KEY idx_uc_heritage (heritage_id),
    CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_bookings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    activity_id BIGINT NULL,
    activity_title VARCHAR(255) NULL,
    contact VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    master_avatar VARCHAR(255) NULL,
    master_id BIGINT NULL,
    master_name VARCHAR(255) NULL,
    skill VARCHAR(255) NULL,
    status VARCHAR(255) NULL,
    booking_time VARCHAR(255) NULL,
    booking_type VARCHAR(255) NULL,
    user_id BIGINT NULL,
    KEY idx_ub_user (user_id),
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    capacity INT NULL,
    description VARCHAR(255) NULL,
    end_time DATETIME(6) NULL,
    location VARCHAR(255) NULL,
    participants INT NULL,
    start_time DATETIME(6) NULL,
    status VARCHAR(255) NULL,
    title VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    category VARCHAR(255) NULL,
    description VARCHAR(255) NULL,
    duration VARCHAR(255) NULL,
    inheritor_id BIGINT NULL,
    thumbnail VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    video_url VARCHAR(255) NULL,
    views BIGINT NULL,
    KEY idx_video_inheritor (inheritor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    KEY idx_aer_user (user_id),
    KEY idx_aer_project (project_id),
    CONSTRAINT fk_aer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS app_client_config (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL,
    config_name VARCHAR(100) NOT NULL,
    config_value VARCHAR(2000) NULL,
    config_type VARCHAR(32) NOT NULL DEFAULT 'string',
    status CHAR(1) NOT NULL DEFAULT '0',
    sort_order INT NOT NULL DEFAULT 0,
    remark VARCHAR(500) NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_app_client_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小程序客户端配置表';

CREATE TABLE IF NOT EXISTS learning_progress (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chapter_id VARCHAR(64) NOT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 1,
    create_time DATETIME(6) NULL,
    update_time DATETIME(6) NULL,
    KEY idx_learning_progress_user (user_id),
    KEY idx_learning_progress_user_completed (user_id, completed),
    CONSTRAINT fk_learning_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户学习进度表';

SET @uk_learning_progress_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'learning_progress'
      AND INDEX_NAME = 'uk_learning_progress_user_chapter'
);
SET @uk_learning_progress_sql := IF(
    @uk_learning_progress_exists = 0,
    'ALTER TABLE learning_progress ADD CONSTRAINT uk_learning_progress_user_chapter UNIQUE (user_id, chapter_id)',
    'SELECT 1'
);
PREPARE stmt_uk_learning_progress FROM @uk_learning_progress_sql;
EXECUTE stmt_uk_learning_progress;
DEALLOCATE PREPARE stmt_uk_learning_progress;

SET @idx_uc_user_time_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_collections'
      AND INDEX_NAME = 'idx_user_collections_user_time'
);
SET @idx_uc_user_time_sql := IF(
    @idx_uc_user_time_exists = 0,
    'CREATE INDEX idx_user_collections_user_time ON user_collections (user_id, create_time)',
    'SELECT 1'
);
PREPARE stmt_idx_uc_user_time FROM @idx_uc_user_time_sql;
EXECUTE stmt_idx_uc_user_time;
DEALLOCATE PREPARE stmt_idx_uc_user_time;

SET @idx_ub_user_time_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_bookings'
      AND INDEX_NAME = 'idx_user_bookings_user_time'
);
SET @idx_ub_user_time_sql := IF(
    @idx_ub_user_time_exists = 0,
    'CREATE INDEX idx_user_bookings_user_time ON user_bookings (user_id, create_time)',
    'SELECT 1'
);
PREPARE stmt_idx_ub_user_time FROM @idx_ub_user_time_sql;
EXECUTE stmt_idx_ub_user_time;
DEALLOCATE PREPARE stmt_idx_ub_user_time;

-- -----------------------------------------------------------------------------
-- 后台管理系统表
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sys_menu (
    menu_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
    menu_name VARCHAR(64) NOT NULL COMMENT '菜单名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    order_num INT DEFAULT 0 COMMENT '显示顺序',
    path VARCHAR(255) DEFAULT '' COMMENT '路由地址',
    component VARCHAR(255) DEFAULT NULL COMMENT '组件路径',
    query VARCHAR(255) DEFAULT NULL COMMENT '路由参数',
    is_frame INT DEFAULT 1 COMMENT '是否为外链（0是 1否）',
    is_cache INT DEFAULT 0 COMMENT '是否缓存（0缓存 1不缓存）',
    menu_type CHAR(1) DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
    visible CHAR(1) DEFAULT '0' COMMENT '显示状态（0显示 1隐藏）',
    status CHAR(1) DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
    perms VARCHAR(128) DEFAULT NULL COMMENT '权限标识',
    icon VARCHAR(128) DEFAULT '#' COMMENT '菜单图标',
    create_by VARCHAR(64) DEFAULT '' COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) DEFAULT '' COMMENT '更新者',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) DEFAULT '' COMMENT '备注',
    PRIMARY KEY (menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单权限表';

CREATE TABLE IF NOT EXISTS sys_user (
    user_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    dept_id BIGINT DEFAULT NULL COMMENT '部门ID',
    user_name VARCHAR(64) NOT NULL COMMENT '用户账号',
    nick_name VARCHAR(64) NOT NULL COMMENT '用户昵称',
    user_type VARCHAR(2) DEFAULT '01' COMMENT '用户类型（00系统用户）',
    email VARCHAR(128) DEFAULT '' COMMENT '用户邮箱',
    phone_number VARCHAR(11) DEFAULT '' COMMENT '手机号码',
    sex CHAR(1) DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像地址',
    password VARCHAR(255) DEFAULT '' COMMENT '密码',
    status CHAR(1) DEFAULT '0' COMMENT '帐号状态（0正常 1停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0存在 2删除）',
    login_ip VARCHAR(128) DEFAULT '' COMMENT '最后登录IP',
    login_date DATETIME DEFAULT NULL COMMENT '最后登录时间',
    create_by VARCHAR(64) DEFAULT '' COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) DEFAULT '' COMMENT '更新者',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_sys_user_user_name (user_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

CREATE TABLE IF NOT EXISTS sys_role (
    role_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    role_name VARCHAR(64) NOT NULL COMMENT '角色名称',
    role_key VARCHAR(128) NOT NULL COMMENT '角色权限字符串',
    role_sort INT NOT NULL COMMENT '显示顺序',
    data_scope CHAR(1) DEFAULT '1' COMMENT '数据范围',
    menu_check_strictly TINYINT DEFAULT 1 COMMENT '菜单树选择项是否关联显示',
    dept_check_strictly TINYINT DEFAULT 1 COMMENT '部门树选择项是否关联显示',
    status CHAR(1) NOT NULL COMMENT '角色状态（0正常 1停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0存在 2删除）',
    create_by VARCHAR(64) DEFAULT '' COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) DEFAULT '' COMMENT '更新者',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (role_id),
    UNIQUE KEY uk_sys_role_role_key (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色信息表';

CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户和角色关联表';

CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id BIGINT NOT NULL COMMENT '角色ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    PRIMARY KEY (role_id, menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色和菜单关联表';

CREATE TABLE IF NOT EXISTS sys_dept (
    dept_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '部门id',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门id',
    ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表',
    dept_name VARCHAR(64) DEFAULT '' COMMENT '部门名称',
    order_num INT DEFAULT 0 COMMENT '显示顺序',
    leader VARCHAR(64) DEFAULT NULL COMMENT '负责人',
    phone VARCHAR(11) DEFAULT NULL COMMENT '联系电话',
    email VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
    status CHAR(1) DEFAULT '0' COMMENT '部门状态（0正常 1停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0存在 2删除）',
    create_by VARCHAR(64) DEFAULT '' COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) DEFAULT '' COMMENT '更新者',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

SET @sys_dept_remark_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sys_dept'
      AND COLUMN_NAME = 'remark'
);
SET @sys_dept_remark_sql := IF(
    @sys_dept_remark_exists = 0,
    'ALTER TABLE sys_dept ADD COLUMN remark VARCHAR(500) DEFAULT NULL COMMENT ''备注''',
    'SELECT 1'
);
PREPARE stmt_sys_dept_remark FROM @sys_dept_remark_sql;
EXECUTE stmt_sys_dept_remark;
DEALLOCATE PREPARE stmt_sys_dept_remark;

CREATE TABLE IF NOT EXISTS sys_oper_log (
    oper_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志主键',
    title VARCHAR(64) DEFAULT '' COMMENT '模块',
    business_type INT DEFAULT 0 COMMENT '业务类型',
    method VARCHAR(200) DEFAULT '' COMMENT '方法名称',
    request_method VARCHAR(10) DEFAULT '' COMMENT '请求方式',
    operator_type INT DEFAULT 0 COMMENT '操作类别',
    oper_name VARCHAR(64) DEFAULT '' COMMENT '操作人员',
    dept_name VARCHAR(64) DEFAULT '' COMMENT '部门名称',
    oper_url VARCHAR(255) DEFAULT '' COMMENT '请求URL',
    oper_ip VARCHAR(128) DEFAULT '' COMMENT '主机地址',
    oper_location VARCHAR(255) DEFAULT '' COMMENT '操作地点',
    oper_param VARCHAR(2000) DEFAULT '' COMMENT '请求参数',
    json_result VARCHAR(2000) DEFAULT '' COMMENT '返回参数',
    status INT DEFAULT 0 COMMENT '操作状态（0正常 1异常）',
    error_msg VARCHAR(2000) DEFAULT '' COMMENT '错误消息',
    oper_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    cost_time BIGINT DEFAULT 0 COMMENT '消耗时间',
    PRIMARY KEY (oper_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志记录';

CREATE TABLE IF NOT EXISTS sys_logininfor (
    info_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '访问ID',
    user_name VARCHAR(64) DEFAULT '' COMMENT '用户账号',
    ipaddr VARCHAR(128) DEFAULT '' COMMENT '登录IP地址',
    login_location VARCHAR(255) DEFAULT '' COMMENT '登录地点',
    browser VARCHAR(64) DEFAULT '' COMMENT '浏览器类型',
    os VARCHAR(64) DEFAULT '' COMMENT '操作系统',
    status CHAR(1) DEFAULT '0' COMMENT '登录状态（0成功 1失败）',
    msg VARCHAR(255) DEFAULT '' COMMENT '提示消息',
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    PRIMARY KEY (info_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统访问记录';

-- -----------------------------------------------------------------------------
-- 后台初始化数据
-- -----------------------------------------------------------------------------
INSERT INTO sys_user (user_id, user_name, nick_name, email, password, status, del_flag, create_time)
VALUES (1, 'admin', '管理员', 'admin@chuanzhibei.com',
        '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '0', '0', NOW())
ON DUPLICATE KEY UPDATE update_time = NOW();

INSERT INTO sys_role (role_id, role_name, role_key, role_sort, data_scope, status, del_flag, create_time)
VALUES (1, '超级管理员', 'admin', 1, '1', '0', '0', NOW())
ON DUPLICATE KEY UPDATE update_time = NOW();

INSERT INTO sys_user_role (user_id, role_id)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status, create_time)
VALUES (100, 0, '0', '传智杯项目组', 1, '管理员', '0', NOW()),
       (101, 100, '0,100', '研发部门', 1, '管理员', '0', NOW()),
       (102, 100, '0,100', '运营部门', 2, '管理员', '0', NOW())
ON DUPLICATE KEY UPDATE update_time = NOW();

INSERT INTO app_client_config (id, config_key, config_name, config_value, config_type, status, sort_order, remark)
VALUES
    (1, 'appName', '小程序名称', '传智杯', 'string', '0', 1, '小程序展示名称'),
    (2, 'homeNewsSize', '首页新闻条数', '5', 'number', '0', 2, '首页聚合资讯数量'),
    (3, 'homeRecommendSize', '首页推荐条数', '4', 'number', '0', 3, '首页推荐非遗数量'),
    (4, 'profileCollectionPreviewSize', '个人中心收藏预览数', '3', 'number', '0', 4, '个人中心展示收藏预览数量'),
    (5, 'profileBookingPreviewSize', '个人中心预约预览数', '3', 'number', '0', 5, '个人中心展示预约预览数量'),
    (6, 'wechatLoginEnabled', '微信登录开关', 'true', 'boolean', '0', 6, '控制是否展示微信登录入口'),
    (7, 'usernameLoginEnabled', '账号登录开关', 'true', 'boolean', '0', 7, '控制是否展示账号登录入口'),
    (8, 'supportPhone', '客服联系电话', '400-800-2026', 'string', '0', 8, '小程序客服联系方式'),
    (9, 'helpMessage', '帮助文案', '建议先启动后端和 Redis，再打开微信开发者工具进行联调。', 'string', '0', 9, '小程序帮助说明'),
    (10, 'miniProgramVersion', '小程序版本', 'enterprise-preview-1', 'string', '0', 10, '当前客户端版本标记')
ON DUPLICATE KEY UPDATE
    config_name = VALUES(config_name),
    config_value = VALUES(config_value),
    config_type = VALUES(config_type),
    status = VALUES(status),
    sort_order = VALUES(sort_order),
    remark = VALUES(remark),
    update_time = NOW();

UPDATE banner
SET news_id = CASE id
    WHEN 1 THEN 1
    WHEN 2 THEN 2
    WHEN 3 THEN 3
    WHEN 4 THEN 4
    WHEN 5 THEN 5
    ELSE news_id
END
WHERE (news_id IS NULL OR news_id = 0)
  AND id BETWEEN 1 AND 5;

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, menu_type, visible, status, icon, perms)
VALUES (1, '系统管理', 0, 1, 'system', NULL, 1, 'M', '0', '0', 'system', NULL),
       (2, '内容管理', 0, 2, 'content', NULL, 1, 'M', '0', '0', 'edit', NULL),
       (3, '系统监控', 0, 3, 'monitor', NULL, 1, 'M', '0', '0', 'monitor', NULL),
       (100, '用户管理', 1, 1, 'user', 'system/user/index', 1, 'C', '0', '0', 'user', 'system:user:list'),
       (101, '角色管理', 1, 2, 'role', 'system/role/index', 1, 'C', '0', '0', 'peoples', 'system:role:list'),
       (102, '菜单管理', 1, 3, 'menu', 'system/menu/index', 1, 'C', '0', '0', 'tree-table', 'system:menu:list'),
       (103, '部门管理', 1, 4, 'dept', 'system/dept/index', 1, 'C', '0', '0', 'tree', 'system:dept:list'),
       (104, '操作日志', 3, 1, 'operlog', 'monitor/operlog/index', 1, 'C', '0', '0', 'log', 'monitor:operlog:list'),
       (105, '登录日志', 3, 2, 'logininfor', 'monitor/logininfor/index', 1, 'C', '0', '0', 'logininfor', 'monitor:logininfor:list'),
       (500, '非遗管理', 2, 1, 'heritage', 'business/heritage/index', 1, 'C', '0', '0', 'education', 'heritage:list'),
       (501, '传承人管理', 2, 2, 'inheritor', 'business/inheritor/index', 1, 'C', '0', '0', 'peoples', 'inheritor:list'),
       (502, '新闻管理', 2, 3, 'news', 'business/news/index', 1, 'C', '0', '0', 'edit', 'news:list'),
       (503, '轮播管理', 2, 4, 'banner', 'business/banner/index', 1, 'C', '0', '0', 'picture', 'banner:list'),
       (504, '视频管理', 2, 5, 'video', 'business/video/index', 1, 'C', '0', '0', 'video', 'video:list'),
       (505, '活动管理', 2, 6, 'activity', 'business/activity/index', 1, 'C', '0', '0', 'date-range', 'activity:list'),
       (506, '3D沉浸演示管理', 2, 7, 'ar', 'business/ar/index', 1, 'C', '0', '0', 'guide', 'ar:list'),
       (507, '用户管理', 2, 8, 'wxuser', 'business/wxuser/index', 1, 'C', '0', '0', 'user', 'wxuser:list'),
       (508, '预约管理', 2, 9, 'booking', 'business/booking/index', 1, 'C', '0', '0', 'time', 'booking:list'),
       (1000, '用户查询', 100, 1, '', NULL, 1, 'F', '0', '0', NULL, 'system:user:query'),
       (1001, '用户新增', 100, 2, '', NULL, 1, 'F', '0', '0', NULL, 'system:user:add'),
       (1002, '用户修改', 100, 3, '', NULL, 1, 'F', '0', '0', NULL, 'system:user:edit'),
       (1003, '用户删除', 100, 4, '', NULL, 1, 'F', '0', '0', NULL, 'system:user:remove'),
       (1004, '用户导出', 100, 5, '', NULL, 1, 'F', '0', '0', NULL, 'system:user:export'),
       (1005, '角色查询', 101, 1, '', NULL, 1, 'F', '0', '0', NULL, 'system:role:query'),
       (1006, '角色新增', 101, 2, '', NULL, 1, 'F', '0', '0', NULL, 'system:role:add'),
       (1007, '角色修改', 101, 3, '', NULL, 1, 'F', '0', '0', NULL, 'system:role:edit'),
       (1008, '角色删除', 101, 4, '', NULL, 1, 'F', '0', '0', NULL, 'system:role:remove'),
       (1009, '菜单查询', 102, 1, '', NULL, 1, 'F', '0', '0', NULL, 'system:menu:query'),
       (1010, '菜单新增', 102, 2, '', NULL, 1, 'F', '0', '0', NULL, 'system:menu:add'),
       (1011, '菜单修改', 102, 3, '', NULL, 1, 'F', '0', '0', NULL, 'system:menu:edit'),
       (1012, '菜单删除', 102, 4, '', NULL, 1, 'F', '0', '0', NULL, 'system:menu:remove'),
       (1013, '用户重置密码', 100, 6, '', NULL, 1, 'F', '0', '0', NULL, 'system:user:resetPwd'),
       (5000, '非遗查询', 500, 1, '', NULL, 1, 'F', '0', '0', NULL, 'heritage:query'),
       (5001, '非遗新增', 500, 2, '', NULL, 1, 'F', '0', '0', NULL, 'heritage:add'),
       (5002, '非遗修改', 500, 3, '', NULL, 1, 'F', '0', '0', NULL, 'heritage:edit'),
       (5003, '非遗删除', 500, 4, '', NULL, 1, 'F', '0', '0', NULL, 'heritage:remove'),
       (5004, '传承人查询', 501, 1, '', NULL, 1, 'F', '0', '0', NULL, 'inheritor:query'),
       (5005, '传承人新增', 501, 2, '', NULL, 1, 'F', '0', '0', NULL, 'inheritor:add'),
       (5006, '传承人修改', 501, 3, '', NULL, 1, 'F', '0', '0', NULL, 'inheritor:edit'),
       (5007, '传承人删除', 501, 4, '', NULL, 1, 'F', '0', '0', NULL, 'inheritor:remove'),
       (5008, '新闻查询', 502, 1, '', NULL, 1, 'F', '0', '0', NULL, 'news:query'),
       (5009, '新闻新增', 502, 2, '', NULL, 1, 'F', '0', '0', NULL, 'news:add'),
       (5010, '新闻修改', 502, 3, '', NULL, 1, 'F', '0', '0', NULL, 'news:edit'),
       (5011, '新闻删除', 502, 4, '', NULL, 1, 'F', '0', '0', NULL, 'news:remove'),
       (5012, '轮播查询', 503, 1, '', NULL, 1, 'F', '0', '0', NULL, 'banner:query'),
       (5013, '轮播新增', 503, 2, '', NULL, 1, 'F', '0', '0', NULL, 'banner:add'),
       (5014, '轮播修改', 503, 3, '', NULL, 1, 'F', '0', '0', NULL, 'banner:edit'),
       (5015, '轮播删除', 503, 4, '', NULL, 1, 'F', '0', '0', NULL, 'banner:remove'),
       (5016, '视频查询', 504, 1, '', NULL, 1, 'F', '0', '0', NULL, 'video:query'),
       (5017, '视频新增', 504, 2, '', NULL, 1, 'F', '0', '0', NULL, 'video:add'),
       (5018, '视频修改', 504, 3, '', NULL, 1, 'F', '0', '0', NULL, 'video:edit'),
       (5019, '视频删除', 504, 4, '', NULL, 1, 'F', '0', '0', NULL, 'video:remove'),
       (5020, '活动查询', 505, 1, '', NULL, 1, 'F', '0', '0', NULL, 'activity:query'),
       (5021, '活动新增', 505, 2, '', NULL, 1, 'F', '0', '0', NULL, 'activity:add'),
       (5022, '活动修改', 505, 3, '', NULL, 1, 'F', '0', '0', NULL, 'activity:edit'),
       (5023, '活动删除', 505, 4, '', NULL, 1, 'F', '0', '0', NULL, 'activity:remove'),
       (5024, '沉浸演示查询', 506, 1, '', NULL, 1, 'F', '0', '0', NULL, 'ar:query'),
       (5025, '沉浸演示新增', 506, 2, '', NULL, 1, 'F', '0', '0', NULL, 'ar:add'),
       (5026, '沉浸演示修改', 506, 3, '', NULL, 1, 'F', '0', '0', NULL, 'ar:edit'),
       (5027, '沉浸演示删除', 506, 4, '', NULL, 1, 'F', '0', '0', NULL, 'ar:remove'),
       (5028, '小程序用户查询', 507, 1, '', NULL, 1, 'F', '0', '0', NULL, 'wxuser:query'),
       (5029, '小程序用户删除', 507, 2, '', NULL, 1, 'F', '0', '0', NULL, 'wxuser:remove'),
       (5030, '预约查询', 508, 1, '', NULL, 1, 'F', '0', '0', NULL, 'booking:query'),
       (5031, '预约修改', 508, 2, '', NULL, 1, 'F', '0', '0', NULL, 'booking:edit'),
       (5032, '预约删除', 508, 3, '', NULL, 1, 'F', '0', '0', NULL, 'booking:remove')
ON DUPLICATE KEY UPDATE update_time = NOW();

UPDATE sys_menu
SET parent_id = CASE
        WHEN menu_id = 104 THEN 3
        WHEN menu_id = 105 THEN 3
        ELSE parent_id
    END,
    order_num = CASE
        WHEN menu_id = 104 THEN 1
        WHEN menu_id = 105 THEN 2
        ELSE order_num
    END
WHERE menu_id IN (104, 105);

UPDATE sys_dept
SET dept_name = CASE
        WHEN dept_id = 100 THEN '传智杯项目组'
        WHEN dept_id = 101 THEN '研发部门'
        WHEN dept_id = 102 THEN '运营部门'
        ELSE dept_name
    END
WHERE dept_id IN (100, 101, 102);

UPDATE sys_menu
SET menu_name = CASE
        WHEN menu_id = 506 THEN '3D沉浸演示管理'
        WHEN menu_id = 5024 THEN '沉浸演示查询'
        WHEN menu_id = 5025 THEN '沉浸演示新增'
        WHEN menu_id = 5026 THEN '沉浸演示修改'
        WHEN menu_id = 5027 THEN '沉浸演示删除'
        ELSE menu_name
    END
WHERE menu_id IN (506, 5024, 5025, 5026, 5027);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, menu_id FROM sys_menu
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);
