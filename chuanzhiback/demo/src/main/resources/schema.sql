-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS intangible_heritage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE intangible_heritage;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    nickname VARCHAR(255),
    avatar_url VARCHAR(255),
    gender VARCHAR(10),
    country VARCHAR(255),
    province VARCHAR(255),
    city VARCHAR(255),
    language VARCHAR(255),
    email VARCHAR(255),
    create_time DATETIME,
    update_time DATETIME
);

-- 创建非遗项目表
CREATE TABLE IF NOT EXISTS heritage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    region VARCHAR(255),
    category VARCHAR(255),
    level INT,
    create_time DATETIME,
    update_time DATETIME
);

-- 创建传承人表
CREATE TABLE IF NOT EXISTS inheritor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    skill VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    level VARCHAR(255),
    create_time DATETIME,
    update_time DATETIME
);

-- 创建新闻表
CREATE TABLE IF NOT EXISTS news (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    date DATE,
    create_time DATETIME,
    update_time DATETIME
);

-- 创建AR体验表
CREATE TABLE IF NOT EXISTS ar_experience (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    is_hot BOOLEAN,
    create_time DATETIME,
    update_time DATETIME
);