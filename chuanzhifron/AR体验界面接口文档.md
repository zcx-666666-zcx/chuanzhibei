# AR体验界面接口文档（文物 AR 视频体验版）

## 1. 概述

本文档描述 **文物 AR 体验界面** 所需的后端接口，支持以下前端核心功能：

- **AR体验介绍**：在首页展示可用的 AR 文物体验项目列表。
- **AR体验指南**：为用户提供使用说明（前端文案为主，本接口文档只说明数据字段中相关的介绍内容）。
- **热门AR体验项目**：从项目列表中筛选/标记热门项目进行展示。
- **体验记录**：记录并查询用户历史 AR 体验。

本项目的 AR 体验形式为：  
**通过摄像头识别预设的“文物图片（Marker）”，在该图片平面上叠加播放对应的文物 AR 视频**，而不是突出“文物修复”或复杂 3D 建模。

## 2. 接口列表

### 2.1 获取 AR 体验项目列表（用于“AR体验介绍”“热门AR体验项目”）

#### 接口地址
```
GET /api/ar/projects
```

#### 请求参数
| 参数名   | 类型    | 必填 | 说明                           |
| -------- | ------- | ---- | ------------------------------ |
| category | string  | 否   | 分类筛选条件（如文物类型）     |
| keyword  | string  | 否   | 搜索关键词（按名称/描述模糊） |
| page     | integer | 否   | 页码，默认为1                 |
| size     | integer | 否   | 每页条数，默认为10            |

#### 响应参数
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "景德镇青花瓷 AR 体验",
        "description": "通过摄像头对准青花瓷海报，让器物纹样在画面中“活起来”。",
        "coverImage": "http://localhost:8001/uploads/heritage_index/recommend_heritage_jingdezhenciqi.jpg",
        "markerImage": "http://localhost:8001/uploads/ar_index/ar_architecture.jpg",
        "videoUrl": "http://localhost:8001/uploads/ar_videos/qinghua_demo.mp4",
        "duration": "约 2 分钟",
        "category": "陶瓷艺术",
        "isHot": true
      },
      {
        "id": 2,
        "name": "苏绣·双面绣 AR 体验",
        "description": "扫描指定绣品图片，在画面中叠加展示绣线铺陈与细节放大视频。",
        "coverImage": "http://localhost:8001/uploads/heritage_index/recommend_heritage_shujin.jpg",
        "markerImage": "http://localhost:8001/uploads/ar_index/ar_painting.jpg",
        "videoUrl": "http://localhost:8001/uploads/ar_videos/suxiu_demo.mp4",
        "duration": "约 2 分钟",
        "category": "传统技艺",
        "isHot": false
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10,
    "hasNext": true
  }
}
```

> 说明：
> - `coverImage`：列表、卡片使用的封面图（可直接使用 `heritage_index` 或 `ar_index` 中的图片）。
> - `markerImage`：**用于 AR 识别的“文物图片”**，在 AR 场景的 `xr-ar-tracker` 上作为 `src`。
> - `videoUrl`：**在识别成功后叠加播放的文物 AR 视频**。
> - `isHot`：标记热门项目，前端可作为“热门AR体验项目”的筛选条件。

### 2.2 获取 AR 体验项目详情（用于“AR体验介绍”“AR体验指南”详情页/弹窗）

#### 接口地址
```
GET /api/ar/projects/{id}
```

#### 请求参数
路径参数：
- `id`: AR 项目 ID

#### 响应参数
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "景德镇青花瓷 AR 体验",
    "description": "通过摄像头对准青花瓷海报，让器物纹样在画面中“活起来”。",
    "detail": "本体验项目以景德镇青花瓷为主角，当用户对准指定的青花瓷图片时，画面中会叠加播放一段关于瓷器纹样、烧制工艺和文化故事的短视频，帮助观众在现实展品之外获得更立体的感受。",
    "instruction": "1. 确保网络和摄像头权限已开启。\n2. 走近展板或海报，对准指定青花瓷图片。\n3. 稳定握持手机，等待画面中出现 AR 视频。\n4. 可跟随讲解视角，观察器物纹样和细节变化。",
    "coverImage": "http://localhost:8001/uploads/heritage_index/recommend_heritage_jingdezhenciqi.jpg",
    "markerImage": "http://localhost:8001/uploads/ar_index/ar_architecture.jpg",
    "videoUrl": "http://localhost:8001/uploads/ar_videos/qinghua_demo.mp4",
    "duration": "约 2 分钟",
    "category": "陶瓷艺术",
    "relatedHeritages": [
      {
        "id": 10,
        "name": "景德镇瓷器烧制技艺",
        "level": "国家级"
      }
    ]
  }
}
```

> 说明：
> - `detail`：可在 “AR体验介绍” 或详情页中展示更长篇幅的文字介绍。
> - `instruction`：用于 “AR体验指南” 中，以步骤形式提示如何正确体验。
> - 不再强制要求 `modelUrl`，如果后续需要 3D 模型体验，可扩展字段。

### 2.3 记录 AR 体验历史（用于“体验记录”写入）

#### 接口地址
```
POST /api/ar/history
```

#### 请求参数
```json
{
  "projectId": 1,
  "duration": 120  // 本次体验时长（秒）
}
```

> 说明：
> - `projectId`：对应 AR 项目 ID。
> - `duration`：从进入 AR 播放页面到退出/结束的时长，由前端统计。

#### 响应参数
```json
{
  "success": true,
  "message": "记录成功"
}
```

### 2.4 获取用户 AR 体验历史（用于“体验记录”列表）

#### 接口地址
```
GET /api/ar/history
```

#### 请求参数
| 参数名 | 类型    | 必填 | 说明           |
| ------ | ------- | ---- | -------------- |
| page   | integer | 否   | 页码，默认为1 |
| size   | integer | 否   | 每页条数，默认为10 |

#### 响应参数
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "projectId": 1,
        "projectName": "景德镇青花瓷 AR 体验",
        "projectThumb": "http://localhost:8001/uploads/heritage_index/recommend_heritage_jingdezhenciqi.jpg",
        "startTime": "2024-05-20 14:30:00",
        "duration": 120
      },
      {
        "id": 2,
        "projectId": 2,
        "projectName": "苏绣·双面绣 AR 体验",
        "projectThumb": "http://localhost:8001/uploads/heritage_index/recommend_heritage_shujin.jpg",
        "startTime": "2024-05-18 10:15:00",
        "duration": 95
      }
    ],
    "total": 2,
    "page": 1,
    "size": 10,
    "hasNext": false
  }
}
```

> 前端 “体验记录” 区域可展示：
> - 项目缩略图 `projectThumb`
> - 项目名称 `projectName`
> - 最近体验时间 `startTime`
> - 时长 `duration`
> - “再次体验”按钮（点击后根据 `projectId` 跳转到 AR 播放页）

### 2.5 获取 AR 体验统计数据（可用于“AR体验介绍”中的概览信息）

#### 接口地址
```
GET /api/ar/statistics
```

#### 请求参数
无

#### 响应参数
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "totalExperiences": 128,
    "totalDuration": 124500,
    "favoriteProject": {
      "id": 1,
      "name": "景德镇青花瓷 AR 体验",
      "count": 45
    }
  }
}
```

> 前端可选择性在 “AR体验介绍” 模块展示简单统计信息，如累计体验次数、最受欢迎项目等。

## 3. 资源与技术说明（与 AR 文物视频体验直接相关）

- **封面图 `coverImage`**：用于 “AR体验介绍”“热门AR体验项目” 卡片展示，可复用 `chuanzhiback/uploads/heritage_index` 或 `chuanzhiback/uploads/ar_index` 中的图片。
- **识别图 `markerImage`**：用于 AR 识别的文物图片，在 `xr-ar-tracker mode="Marker"` 中作为 `src`。
- **视频资源 `videoUrl`**：在识别成功后叠加在平面上的 AR 视频，建议尺寸适中、码率适中，保证流畅度。

前端 AR 场景建议基于微信小程序 `xr-frame` 的 `Marker + video-texture` 实现，具体技术细节在 **《AR体验页面技术文档》** 中说明，此处只要求后端提供稳定的 URL 与基础字段。

## 4. 错误响应格式

所有接口在发生错误时均返回以下格式：
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 5. 权限与安全要求

1. 所有接口均需要用户认证，在请求头中添加：
   ```
   Authorization: Bearer <token>
   ```
2. 用户体验历史数据属于敏感信息，仅对当前登录用户可见。
3. 视频与图片资源建议做基础的防盗链和权限控制。
4. 所有接口通信必须通过 HTTPS 加密传输。

## 6. 分页参数说明

对于支持分页的接口，分页参数遵循以下规范：
- `page`: 页码，从 1 开始计数
- `size`: 每页条数，建议范围 10–50
- 返回数据中包含 `total`(总条数)、`hasNext`(是否有下一页) 等分页信息
