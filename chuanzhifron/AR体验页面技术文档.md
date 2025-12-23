# AR体验页面技术文档

## 1. 概述

本文档详细描述了非遗传承小程序AR体验页面的功能需求、UI设计建议以及技术实现要点，供前端开发人员参考。

## 2. 页面结构

AR体验页面包含以下几个主要功能区域：
1. 顶部导航栏
2. AR项目展示区
3. 体验记录列表
4. AR体验详情页

## 3. 功能详细说明

### 3.1 顶部导航栏
- 包含标题"AR体验"
- 支持返回上级页面

### 3.2 AR项目展示区
- 采用网格布局展示可用的AR体验项目
- 每个项目包含：
  - 项目封面图
  - 项目名称
  - 简短描述
  - 体验时长
- 支持下拉刷新更新项目列表

### 3.3 体验记录列表
- 展示用户的历史AR体验记录
- 每条记录包含：
  - 项目名称
  - 体验时间
  - 体验时长
  - 项目封面图
- 支持重新体验功能

### 3.4 AR体验详情页
- 点击项目后弹出详情对话框
- 包含：
  - 项目完整封面图
  - 项目名称
  - 详细介绍
  - 体验说明
  - 开始体验按钮

## 4. UI设计建议

### 4.1 整体风格
- 主色调：科技蓝(#007AFF)和深灰色(#1C1C1E)
- 辅助色：浅灰色(#F2F2F7)和白色(#FFFFFF)
- 字体：默认使用系统字体

### 4.2 布局规范
- 页面边距：左右各15px
- 元素间距：模块间间距20px，元素内间距10px
- 圆角：普遍使用12px圆角

### 4.3 组件样式

#### 4.3.1 AR项目卡片
- 宽度：自适应屏幕宽度（2列网格）
- 图片高度：根据屏幕宽度自适应
- 卡片阴影：轻微投影效果
- 悬停效果：轻微放大动画

#### 4.3.2 体验记录卡片
- 宽度：100%
- 高度：80px
- 左侧图片：60px * 60px
- 右侧信息区域：垂直排列文本

#### 4.3.3 详情对话框
- 宽度：90%屏幕宽度
- 最大高度：80%屏幕高度
- 滚动区域：用于展示详细内容
- 底部按钮：固定定位

## 5. 接口调用说明

### 5.1 页面加载流程
1. 页面onLoad时请求获取AR体验项目数据(/api/ar/projects)
2. 获取用户历史体验记录(/api/ar/history)
3. 渲染项目列表和体验记录

### 5.2 下拉刷新
- 重新请求AR体验项目数据
- 更新页面显示

## 6. 图片资源规划

### 6.1 AR项目封面图
- 文件命名建议：ar_project_{项目ID}.jpg
- 尺寸建议：600px * 400px (宽高比 3:2)
- 格式：jpg/png
- 文件大小：建议不超过150KB

### 6.2 体验记录缩略图
- 文件命名建议：ar_thumb_{项目ID}.jpg
- 尺寸建议：120px * 120px (正方形)
- 格式：jpg/png
- 文件大小：建议不超过50KB

## 7. 性能优化建议

### 7.1 图片懒加载
- 非首屏图片使用懒加载技术
- 优先加载可视区域内的图片

### 7.2 数据缓存
- AR项目数据可适当缓存
- 缓存时间建议不超过15分钟

### 7.3 骨架屏
- 在数据加载过程中显示骨架屏占位符
- 提升用户体验

## 8. 异常处理

### 8.1 网络异常
- 显示网络异常提示
- 提供重试按钮

### 8.2 数据为空
- 当无AR项目或体验记录时，显示友好的空状态提示

### 8.3 接口错误
- 记录错误日志
- 给用户友好的错误提示

### 8.4 权限拒绝
- 检测相机权限状态
- 引导用户开启权限

## 9. 技术性修改建议

### 9.1 当前存在的问题分析
1. 当前页面仅实现了基本的项目展示和简单体验流程，缺乏丰富的交互体验
2. 权限检查逻辑较为简单，没有提供完善的引导机制
3. 缺少个性化推荐功能
4. 没有用户成就系统或积分激励机制
5. 缺乏社交分享功能

### 9.2 主流AR体验类应用设计趋势
根据当前主流AR体验类应用的设计模式，AR体验页面应当具备以下特征：
1. **沉浸式体验设计**：结合3D模型、音效等多媒体元素
2. **个性化推荐**：基于用户兴趣和行为数据进行智能推荐
3. **社交化功能**：支持用户分享体验成果和互动交流
4. **成就系统**：通过积分、徽章等方式激励用户持续参与
5. **跨平台兼容**：适配不同设备的AR能力

### 9.3 具体技术实现建议

#### 9.3.1 组件化架构重构
将AR体验页面拆分为多个可复用组件：
- AR项目网格组件(ar-project-grid)
- 体验记录列表组件(experience-history)
- 项目详情组件(ar-project-detail)
- 权限引导组件(permission-guide)
- 骨架屏组件(skeleton-screen)

优势：
- 提高代码可维护性和可复用性
- 便于团队协作开发
- 符合现代前端开发的最佳实践

#### 9.3.2 数据请求优化策略
1. **并行请求**：同时请求项目数据和体验记录，提升加载速度
2. **增量更新**：只更新发生变化的数据，减少网络传输
3. **数据缓存机制**：对项目数据实施本地缓存策略
4. **错误降级处理**：单个接口失败不影响整体页面渲染

#### 9.3.3 用户体验优化措施
1. **骨架屏加载**：在数据加载过程中显示占位符，减少用户等待焦虑
2. **下拉刷新**：提供标准的手势刷新机制
3. **空状态处理**：优雅地处理数据为空的情况
4. **权限引导**：完善的权限申请和引导流程
5. **加载状态反馈**：清晰的加载和操作反馈

#### 9.3.4 性能优化方案
1. **图片懒加载**：非首屏图片延迟加载，减少初始请求压力
2. **资源预加载**：提前加载可能需要的资源
3. **事件防抖节流**：优化高频触发事件的处理
4. **内存泄漏防护**：及时清理定时器、监听器等资源

### 9.4 为什么这样修改能满足比赛评委的要求

#### 9.4.1 技术先进性体现
1. **现代化前端架构**：组件化设计思想体现了良好的工程实践
2. **性能优化意识**：多种优化策略展示了对用户体验的关注
3. **标准化交互设计**：遵循小程序平台的设计规范

#### 9.4.2 创新性亮点
1. **AR技术应用**：将前沿AR技术与传统文化相结合
2. **沉浸式体验**：通过多媒体手段营造身临其境的感受
3. **个性化推荐**：基于用户行为数据进行智能推荐

#### 9.4.3 工程化考量
1. **可扩展性设计**：模块化结构便于后续功能迭代
2. **可维护性保障**：清晰的代码结构有利于长期维护
3. **团队协作友好**：组件化架构支持多人协同开发

///////////////////////////////////////////////////////////////////////

XR-FRAME /开发指南 /开始
开始
xr-frame是一套小程序官方提供的XR/3D应用解决方案，基于混合方案实现，性能逼近原生、效果好、易用、强扩展、渐进式、遵循小程序开发标准。

在这一章中，我们将会带大家从头开始，用它构建一个XR小程序。

本文只是开始指南，更加详细的信息请见组件框架文档和API文档。

⚠️ xr-frame在基础库v2.32.0开始基本稳定，发布为正式版，但仍有一些功能还在开发，请见限制和展望。

新建一个XR组件
首先创建项目，让我们选择小程序工程：



之后先在app.json加上一行配置："lazyCodeLoading": "requiredComponents"。然后创建好组件文件夹，新建一个组件，然后修改组件的内容：

index.json:

{
  "component": true,
  "renderer": "xr-frame",
  "usingComponents": {}
}
index.wxml:

<xr-scene>
  <xr-camera clear-color="0.4 0.8 0.6 1" />
</xr-scene>
在index.json中，我们指定了这个组件的渲染器是xr-frame；在index.wxml中，我们创建了一个场景xr-scene，并在其下添加了一个相机xr-camera。



在页面中使用这个组件
创建完组件后，便可以在页面中使用它，让我们进入pages/index，修改它的json、wxml和ts文件：

在json中：

{
  "usingComponents": {
    "xr-start": "../../components/xr-start/index"
  },
  "disableScroll": true
}
在ts脚本中：

Page({
  data: {
    width: 300,
    height: 300,
    renderWidth: 300,
    renderHeight: 300,
  },
  onLoad() {
    const info = wx.getSystemInfoSync();
    const width = info.windowWidth;
    const height = info.windowHeight;
    const dpi = info.pixelRatio;
    this.setData({
      width, height,
      renderWidth: width * dpi,
      renderHeight: height * dpi
    });
  },
})
在wxml中：

<view>
  <xr-start
    disable-scroll
    id="main-frame"
    width="{{renderWidth}}"
    height="{{renderHeight}}"
    style="width:{{width}}px;height:{{height}}px;"
  />
</view>
这里我们在脚本中设置了xr-frame组件需要渲染的宽高，然后传入wxml，并在其中使用了json中引用的组件进行渲染，目前效果如下，可见整个画布被xr-camera上设置的清屏颜色清屏了：



添加一个物体
接下来我们给场上添加一个物体，直接使用xr-mesh以及内置的几何数据、材质，创建一个立方体：

<xr-scene>
  <xr-mesh node-id="cube" geometry="cube" />
  <xr-camera clear-color="0.4 0.8 0.6 1" position="0 1 4" target="cube" camera-orbit-control />
</xr-scene>
这里我们给物体指定了一个node-id，作为节点的索引，之后修改xr-camera的position和target，让其始终看向这个立方体，最后再给相机加上camera-orbit-control属性，使得我们能对相机进行控制。



至此，一个立方体是渲染了出来，不过...为什么是黑色的？

来点颜色和灯光
物体黑色是因为在我们没有给xr-mesh指定材质时，用的是基于PBR效果的默认材质，需要光照，解决这个问题有两种方法，其一是不需要光照的物体，可以使用simple材质，这里就引入了材质定义：

<xr-asset-material asset-id="simple" effect="simple" uniforms="u_baseColorFactor:0.8 0.4 0.4 1" />
<xr-mesh node-id="cube" geometry="cube" material="simple" />
效果如下：



虽然这可以解决一些问题，但大部分情况下我们还是需要灯光的，就让我们把材质改回去，然后加上一些灯光吧：

<xr-light type="ambient" color="1 1 1" intensity="1" />
<xr-light type="directional" rotation="40 70 0" color="1 1 1" intensity="3" cast-shadow />

<xr-mesh
  node-id="cube" cast-shadow
  geometry="cube" uniforms="u_baseColorFactor:0.8 0.4 0.4 1"
/>
<xr-mesh
  position="0 -1 0" scale="4 1 4" receive-shadow
  geometry="plane" uniforms="u_baseColorFactor:0.4 0.6 0.8 1"
/>
这里我们加入了一个环境光和一个主平行光，调整了亮度和方向，同时加上了一个新的物体，再通过各个组件的caster-shadow和receive-shadow开启了阴影，效果如下：



有点寡淡，加上图像
虽然有了灯光，但只有纯色还是有一些寡淡，接下来我们尝试加入纹理，让场景的色彩更加丰富一些，这里需要用到资源加载器xr-asset-load和xr-assets：

<xr-assets bind:progress="handleAssetsProgress" bind:loaded="handleAssetsLoaded">
  <xr-asset-load type="texture" asset-id="waifu" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/waifu.png" />
</xr-assets>

<xr-mesh
  node-id="cube" cast-shadow
  geometry="cube" uniforms="u_baseColorMap: waifu"
/>
注意到我们在xr-assets上绑定了两个事件progress和loaded，这便于开发者监听资源加载进度，然后按需做一些操作，比如资源加载完成后和wx:if协作再显示物体。默认情况下，我们采用渐进式策略，当资源加载完成后会自动应用到物体上：

methods: {
  handleAssetsProgress: function ({detail}) {
    console.log('assets progress', detail.value);
  },
  handleAssetsLoaded: function ({detail}) {
    console.log('assets loaded', detail.value);
  }
}
这次的修改效果如下：



当然，我们还可以用代码动态加载一张纹理，然后将其设置到物体上，这里以获取用户信息的头像为例：

data: {
  avatarTextureId: 'white'
},

methods: {
  handleReady: function ({detail}) {
    this.scene = detail.value;
    // 该接口已废弃，请授权后，采用 getUserInfo 代替。
    wx.getUserProfile({
      desc: '获取头像',
      success: (res) => {
        this.scene.assets.loadAsset({
          type: 'texture', assetId: 'avatar', src: res.userInfo.avatarUrl
        }).then(() => this.setData({avatarTextureId: 'avatar'}));
      }
    })
  }
}
根据 小程序用户头像昵称获取规则调整公告 wx.getUserProfile 于 2022 年 10 月 25 日 24 时后，被废弃

注意这里的handleReady，我们可以在xr-scene上绑定bind:ready="handleReady"触发。完成头像获取后，将数据设置为uniforms的来源：

<xr-mesh
  position="0 -1 0" scale="4 1 4" receive-shadow
  geometry="plane" uniforms="u_baseColorMap: {{avatarTextureId}}"
/>
效果如下：



让场景更丰富，环境数据
物体有了纹理，那么背景能不能也有纹理呢？当然可以。我们提供了环境元素xr-env来定义环境信息，配合以相机可以渲染天空盒，这里以框架内置的一个环境数据xr-frame-team-workspace-day为例：

<xr-env env-data="xr-frame-team-workspace-day" />

<xr-mesh
  node-id="cube" cast-shadow
  geometry="cube" uniforms="u_baseColorMap: waifu,u_metallicRoughnessValues:1 0.1"
/>

<xr-camera
  position="0 1 4" target="cube" background="skybox"
  clear-color="0.4 0.8 0.6 1" camera-orbit-control
/>
这里我们将xr-camera的backgournd设置为了skybox，同时调整了立方体的金属粗糙度，效果如下：



同时可以看到场景中的物体相机叠加了一层反射，就像是被环境影响了一样，这是因为环境数据里还包括一些IBL的信息，当然这个我们不在这里赘述了，有兴趣的可以详细阅读后面的章节。

天空盒除了图像，还支持视频，我们可以先加载一个视频纹理，然后覆盖掉环境信息中的sky-map：

<xr-asset-load type="video-texture" asset-id="office" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/videos/office-skybox.mp4" options="autoPlay:true,loop:true" />

<xr-env env-data="xr-frame-team-workspace-day" sky-map="video-office" />
效果如下：


同时除了这种天空盒，我们还支持2D背景，这个在做一些商品展示的时候会比较有用：

<xr-asset-load type="texture" asset-id="weakme" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/weakme.jpg" />

<xr-env env-data="xr-frame-team-workspace-day" sky-map="weakme" is-sky2d />
效果如下：



动起来，加入动画
目前我们的整个场景还是静态的，接下来我们会加入一些动画让其丰富起来。这里要使用帧动画资源，让我们先创建一个资源目录，在其下创建一个json文件：

{
  "keyframe": {
    "plane": {
      "0": {
        "rotation.y": 0,
        "material.u_baseColorFactor": [0.2, 0.6, 0.8, 1]
      },
      "50": {
        "material.u_baseColorFactor": [0.2, 0.8, 0.6, 1]
      },
      "100": {
        "rotation.y": 6.28,
        "material.u_baseColorFactor": [0.2, 0.6, 0.8, 1]
      }
    },
    "cube": {
      "0": {
        "position": [-1, 0, 0]
      },
      "25": {
        "position": [-1, 1, 0]
      },
      "50": {
        "position": [1, 1, 0]
      },
      "75": {
        "position": [1, 0, 0]
      }
    }
  },
  "animation": {
    "plane": {
      "keyframe": "plane",
      "duration": 4,
      "ease": "ease-in-out",
      "loop": -1
    },
    "cube": {
      "keyframe": "cube",
      "duration": 4,
      "ease": "steps",
      "loop": -1,
      "direction": "both"
    }
  }
}
然后加载它，并引用到场上的两个物体中：

<xr-asset-load asset-id="anim" type="keyframe" src="/assets/animation.json"/>

<xr-mesh
  node-id="cube" cast-shadow anim-keyframe="anim" anim-autoplay="clip:cube,speed:2"
  geometry="cube" uniforms="u_baseColorMap: waifu,u_metallicRoughnessValues:1 0.1"
/>
<xr-mesh
  node-id="plane" position="0 -1 0" scale="4 1 4" receive-shadow anim-keyframe="anim" anim-autoplay="clip:plane"
  geometry="plane" uniforms="u_baseColorMap: {{avatarTextureId}}"
/>

<xr-camera
  position="0 1 6" target="plane" background="skybox"
  clear-color="0.4 0.8 0.6 1" camera-orbit-control
/>
这里我们将xr-camera的target设置到了plane上，以防其跟随cube乱动。

注意因为是包内的json文件，所以需要在project.config.json的setting字段中增加 "ignoreDevUnusedFiles": false和"ignoreUploadUnusedFiles": false配置参数！ 效果如下：


还是不够，放个模型
看着这个场景，你可能也觉得缺了点什么，不错——都是方方正正的几何体，还是太单调了。所以在这里，我们将加载并使用glTF模型，来让场景更加丰富。为了让场景简洁，我们去掉原场景的所有物体，调整相机的target：

<xr-asset-load type="gltf" asset-id="damage-helmet" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/damage-helmet/index.glb" />
<xr-asset-load type="gltf" asset-id="miku" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/miku.glb" />

<xr-gltf node-id="damage-helmet" model="damage-helmet" />
<xr-gltf model="miku" position="-0.15 0.75 0" scale="0.07 0.07 0.07" rotation="0 180 0" anim-autoplay />

<xr-camera
  position="0 1.5 4" target="damage-helmet" background="skybox"
  clear-color="0.4 0.8 0.6 1" camera-orbit-control
/>
这里我们加载了两个模型：一个静态但支持了所有PBR渲染的特性，一个简单一些但有动画，最后的效果如下：
再来点交互
渲染部分到这里说的就差不多了，但作为一个应用，和用户的交互必不可少。很多场景下开发者可能需要点击场景中的物体来做一些逻辑，所以我们提供了shape系列组件：

<xr-gltf
  node-id="damage-helmet" model="damage-helmet"
  id="helmet" mesh-shape bind:touch-shape="handleTouchModel"
/>
<xr-gltf
  model="miku" position="-0.15 0.75 0" scale="0.07 0.07 0.07" rotation="0 180 0" anim-autoplay
  id="miku" cube-shape="autoFit:true" shape-gizmo bind:touch-shape="handleTouchModel"
/>
我们给几个模型设置了id，添加上了不同形状的shape，一个mesh-shape可以完全匹配模型，但开销较高并有顶点限制，一个cube-shape开销较低，还可以打开debug开关shape-gizmo将它显示出来。最后，我们并绑定了对应的点击事件，之后便可以在脚本里写逻辑，完成相应的操作了：

handleTouchModel: function ({detail}) {
  const {target} = detail.value;
  const id = target.id;
  
  wx.showToast({title: `点击了模型： ${id}`});
}
之后在点击到对应物体时，便会弹出提示：



组件通信，加上HUD
虽然有了交互，但总不能让交互都是这种弹窗吧。很多时候我们会让交互和UI元素互相影响，但目前xr-frame尚未支持和小程序的UI元素混写（会在未来版本支持），但我们可以使用同层方案，而同层方案，就必然涉及到组件通信了。

xr-frame组件和父级的通信与传统组件基本一致，这里让我们用小程序的UI元素实现一下HUD。这里可能会有一些3D变换的知识，但不要紧，只是调用接口而已。

首先，让我们修改组件的wxml，为场景添加tick事件，并且为模型和相机都加上id方便索引。

<xr-scene bind:ready="handleReady" bind:tick="handleTick">
......
<xr-gltf
  node-id="damage-helmet" model="damage-helmet"
  id="helmet" mesh-shape bind:touch-shape="handleTouchModel"
/>
<xr-gltf
  model="miku" position="-0.15 0.75 0" scale="0.07 0.07 0.07" rotation="0 180 0" anim-autoplay
  id="miku" cube-shape="autoFit:true" shape-gizmo bind:touch-shape="handleTouchModel"
/>
<xr-camera
  id="camera" position="0 1.5 4" target="damage-helmet" background="skybox"
  clear-color="0.4 0.8 0.6 1" camera-orbit-control
/>
</xr-scene>
之后在组件的脚本中处理事件，编写逻辑：

handleReady: function ({detail}) {
  this.scene = detail.value;
  const xrFrameSystem = wx.getXrFrameSystem();
  this.camera = this.scene.getElementById('camera').getComponent(xrFrameSystem.Camera);
  this.helmet = {el: this.scene.getElementById('helmet'), color: 'rgba(44, 44, 44, 0.5)'};
  this.miku = {el: this.scene.getElementById('miku'), color: 'rgba(44, 44, 44, 0.5)'};
  this.tmpV3 = new (xrFrameSystem.Vector3)();
},
handleAssetsLoaded: function ({detail}) {
  this.triggerEvent('assetsLoaded', detail.value);
},
handleTick: function({detail}) {
  this.helmet && this.triggerEvent('syncPositions', [
    this.getScreenPosition(this.helmet),
    this.getScreenPosition(this.miku)
  ]);
},
handleTouchModel: function ({detail}) {
  const {target} = detail.value;
  this[target.id].color = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`;
},
getScreenPosition: function(value) {
  const {el, color} = value;
  const xrFrameSystem = wx.getXrFrameSystem();
  this.tmpV3.set(el.getComponent(xrFrameSystem.Transform).worldPosition);
  const clipPos = this.camera.convertWorldPositionToClip(this.tmpV3);
  const {frameWidth, frameHeight} = this.scene;
  return [((clipPos.x + 1) / 2) * frameWidth, (1 - (clipPos.y + 1) / 2) * frameHeight, color, el.id];
}
这里我们在ready事件中通过id索引获取了需要的实例并存了下来，然后在每帧的tick事件中实时获取物体的世界坐标，将其转换为屏幕的位置，并且还加上了在用户点击时改变颜色color的效果。在最后，我们通过this.triggerEvent，从组件向页面发起了通信，一个是资源加载完成的事件assetsLoaded，一个是坐标更新的事件syncPositions。让我们看看在场景的脚本中是如何处理这些事件的：

data: {
  width: 300, height: 300,
  renderWidth: 300, renderHeight: 300,
  loaded: false,
  positions: [[0, 0, 'rgba(44, 44, 44, 0.5)', ''], [0, 0, 'rgba(44, 44, 44, 0.5)', '']],
},
handleLoaded: function({detail}) {
  this.setData({loaded: true});
},
handleSyncPositions: function({detail}) {
  this.setData({positions: detail});
},
可见只是简单地接受了事件，然后将其设置为data而已，那么这个data用在哪里呢，来看看页面的wxml：

<view>
  <xr-start
    disable-scroll
    id="main-frame"
    width="{{renderWidth}}"
    height="{{renderHeight}}"
    style="width:{{width}}px;height:{{height}}px;"
    bind:assetsLoaded="handleLoaded"
    bind:syncPositions="handleSyncPositions"
  />

  <block wx:if="{{loaded}}" wx:for="{{positions}}" wx:for-item="pos" wx:key="*this">
    <view style="display: block; position: absolute;left: {{pos[0]}}px;top: {{pos[1]}}px;background: {{pos[2]}};transform: translate(-50%, -50%);">
      <view style="text-align: center;color: white;font-size: 24px;padding: 8px;">{{pos[3]}}</view>
    </view>
  </block>
</view>
也很简单，就是在xr-start组件上加上了事件的绑定，然后下面多了一些UI，在模型加载完毕后显示，并按照位置和颜色跟随模型移动，这可以认为是基于DOM的HUD。整个完成了，用户点击物体，会让这些HUD变色，效果如下：

注意这里的左侧效果截图是真机截图P上去的，因为工具暂不支持同层渲染！ 

虚拟 x 现实，追加AR能力
到这里，我们实现了3D场景的渲染和交互，但框架毕竟是叫做XR-frame，所以接下来我们就用内置的AR系统来改造一下这个场景，让它具有AR能力吧。改造非常简单，我们首先将所有的无关物体移除，然后使用ar-system和ar-tracker，并修改一下xr-camera的相关属性is-ar-camera和background="ar"就好：

<xr-scene ar-system="modes:Plane" bind:ready="handleReady">
  <xr-assets bind:loaded="handleAssetsLoaded">
    <xr-asset-load type="gltf" asset-id="anchor" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/ar-plane-marker.glb" />
    <xr-asset-load type="gltf" asset-id="miku" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/miku.glb" />
  </xr-assets>

  <xr-env env-data="xr-frame-team-workspace-day" />
  <xr-light type="ambient" color="1 1 1" intensity="1" />
  <xr-light type="directional" rotation="40 70 0" color="1 1 1" intensity="3" cast-shadow />

  <xr-ar-tracker mode="Plane">
    <xr-gltf model="anchor"></xr-gltf>
  </xr-ar-tracker>
  <xr-node node-id="setitem" visible="false">
    <xr-gltf model="miku" anim-autoplay scale="0.08 0.08 0.08" rotation="0 180 0"/>
  </xr-node>

  <xr-camera clear-color="0.4 0.8 0.6 1" background="ar" is-ar-camera />
</xr-scene>
注意这里我们开启的ar-system的模式为Plane，即平面识别，这种模式下相机不能被用户控制，需要将控制器、target等都删掉，同时ar-tracker的mode要和ar-system的完全一致。之后再脚本中写一点简单的逻辑：

handleAssetsLoaded: function({detail}) {
  wx.showToast({title: '点击屏幕放置'});
  this.scene.event.add('touchstart', () => {
    this.scene.ar.placeHere('setitem', true);
  });
}
识别人脸，给自己戴个面具
在初步了解了AR系统后，我们便可以尝试更多不同的模式来玩做一些好玩的效果。接下来的是人脸识别模式，为此我们只需要在上面的代码中改几句，就可以给自己带上Joker的面具（逃）：

⚠️ 手势、人脸、躯体识别都需要基础库v2.28.1以上。

<xr-scene ar-system="modes:Face;camera:Front" bind:ready="handleReady" bind:tick="handleTick">
  <xr-assets bind:loaded="handleAssetsLoaded">
    <xr-asset-load type="gltf" asset-id="mask" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/jokers_mask_persona5.glb" />
  </xr-assets>

  <xr-env env-data="xr-frame-team-workspace-day" />
  <xr-light type="ambient" color="1 1 1" intensity="1" />
  <xr-light type="directional" rotation="40 70 0" color="1 1 1" intensity="3" />

  <xr-ar-tracker mode="Face" auto-sync="43">
    <xr-gltf model="mask" rotation="0 180 0" scale="0.5 0.5 0.5" />
  </xr-ar-tracker>

  <xr-camera clear-color="0.4 0.8 0.6 1" background="ar" is-ar-camera />
</xr-scene>
这里我们将ar-system的modes改为了Face，并且新增设置了camera属性为Front，表示开启前置相机（注意前置相机在客户端8.0.31后才支持，这里仅做演示）。同时在ar-tracker这边，我们将mode改为了和ar-system一样的Face，并追加了属性auto-sync，这是一个数字数组，表示将识别出的面部特征点和对应顺序的子节点绑定并自动同步，具体的特征点可见组件文档详细描述。

手势，给喜欢的作品点赞
除了人脸之外，我们也提供了躯体和人手识别，用法都大同小异，但人手除了上面所属的特征点同步，还提供了“手势”识别，这个比较有趣，让我们来看看：

<xr-scene ar-system="modes:Hand" bind:ready="handleReady" bind:tick="handleTick">
  <xr-assets bind:loaded="handleAssetsLoaded">
    <xr-asset-load type="gltf" asset-id="cool-star" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/cool-star.glb" />
  </xr-assets>

  <xr-env env-data="xr-frame-team-workspace-day" />
  <xr-light type="ambient" color="1 1 1" intensity="1" />
  <xr-light type="directional" rotation="40 70 0" color="1 1 1" intensity="3" cast-shadow />

  <xr-ar-tracker id="tracker" mode="Hand" auto-sync="4">
    <xr-gltf model="cool-star" anim-autoplay />
  </xr-ar-tracker>

  <xr-camera clear-color="0.4 0.8 0.6 1" background="ar" is-ar-camera />
</xr-scene>
wxml这里我们换了个模型，并且将ar-system和ar-tracker的模式都换成了Hand，并修改了ar-tracker的特征点还加上了个id方便索引，最后还给scene绑定了tick事件，而接下来就是js逻辑了：

handleAssetsLoaded: function ({detail}) {
  this.setData({loaded: true});

  const el = this.scene.getElementById('tracker');
  this.tracker = el.getComponent(wx.getXrFrameSystem().ARTracker);
  this.gesture = -1;
},
handleTick: function() {
  if (!this.tracker) return;
  const {gesture, score} = this.tracker;
  if (score < 0.5 || gesture === this.gesture) {
    return;
  }

  this.gesture = gesture;
  gesture === 6 && wx.showToast({title: '好！'});
  gesture === 14 && wx.showToast({title: '唉...'});
}
最重要的是handleTick方法，在每一帧我们拿到tracker的引用，然后获得它的属性gesture和score，其中gesture为手势编号而score为置信度。具体的手势编号可见组件文档，这里我先用置信度过滤了一遍，随后依据手势gesture的值（6为赞，14为踩）来提示不同信息，效果如下：


OSDMarker，给现实物体做标记
人体之外还有的能力就是两个marker了。其一是OSD Marker，一般以一个现实中物体的照片作为识别源，来识别出这个物体的在屏幕中的二维区域，我们已经做好了到三维空间的转换，但开发者需要自己保证tracker下模型的比例是符合识别源的。OSD模式在识别那些二维的、特征清晰的物体效果最好，比如广告牌。

这里是默认示例资源，你可以换成自己的照片和视频，如果只是想要尝试，直接复制访问src的地址到浏览器打开即可。

<xr-scene ar-system="modes:OSD" bind:ready="handleReady">
  <xr-assets bind:loaded="handleAssetsLoaded">
    <xr-asset-material asset-id="mat" effect="simple" uniforms="u_baseColorFactor: 0.8 0.6 0.4 0.7" states="alphaMode:BLEND" />
  </xr-assets>

  <xr-node>
    <xr-ar-tracker
      mode="OSD" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/marker/osdmarker-test.jpg"
    >
      <xr-mesh geometry="plane" material="mat" rotation="-90 0 0" />
    </xr-ar-tracker>
  </xr-node>

  <xr-camera clear-color="0.4 0.8 0.6 1" background="ar" is-ar-camera />
</xr-scene>
这里我们把ar-system的模式改为了OSD，相应的ar-tracker的模式也改为了OSD，这种模式下需要提供src，也就是要识别的图像。并且这次我们使用了一个效果为simple的材质，因为不需要灯光，同时为了更好看效果，在material的states设置了alphaMode:BLEND，即开启透明混合，然后将uniforms设置颜色u_baseColorFactor，并且注意其透明度为0.7。最终效果如下：


2DMarker+视频，让照片动起来
最后的能力就是2D Marker，其用于精准识别有一定纹理的矩形平面，我们可以将其配合视频纹理，只需要非常简单的代码就可以完成一个效果，首先是wxml：

这里是默认示例资源，你可以换成自己的照片和视频，如果只是想要尝试，直接复制访问src的地址到浏览器打开即可。

<xr-scene ar-system="modes:Marker" bind:ready="handleReady">
  <xr-assets bind:loaded="handleAssetsLoaded">
    <xr-asset-load
      type="video-texture" asset-id="hikari" options="loop:true"
      src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/xr-frame-team/2dmarker/hikari-v.mp4"
    />
    <xr-asset-material asset-id="mat" effect="simple" uniforms="u_baseColorMap: video-hikari" />
  </xr-assets>

  <xr-node wx:if="{{loaded}}">
    <xr-ar-tracker
      mode="Marker" bind:ar-tracker-switch="handleTrackerSwitch"
      src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/xr-frame-team/2dmarker/hikari.jpg"
    >
      <xr-mesh node-id="mesh-plane" geometry="plane" material="mat" />
    </xr-ar-tracker>
  </xr-node>

  <xr-camera clear-color="0.4 0.8 0.6 1" background="ar" is-ar-camera />
</xr-scene>
这里我们把ar-system的模式改成了Marker，随后将ar-tracker的类型也改为了Marker，并且换了一个识别源，然后加载一个准备好的视频纹理，并将simple材质的颜色换为了纹理u_baseColorMap，同时关闭了混合。注意我们使用了变量loaded来控制ar-tracker的显示并绑定了事件ar-tracker-switch，这是为了在脚本中处理：

handleAssetsLoaded: function ({detail}) {
  this.setData({loaded: true});
},
handleTrackerSwitch: function ({detail}) {
  const active = detail.value;
  const video = this.scene.assets.getAsset('video-texture', 'hikari');
  active ? video.play() : video.stop();
}
在视频加载完成后再显示内容，并且在ar-tracker-switch事件也就是识别成功后在播放视频，优化体验，最终效果如下：


加上魔法，来点粒子
光是播放视频似乎还是有点单调，这里我们可以请出粒子系统制造一些魔法来让整个场景更加生动：

  ......
  <xr-asset-load type="texture" asset-id="point" src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/particles/point.png" />
  ......
  <xr-node wx:if="{{loaded}}">
    <xr-ar-tracker
      mode="Marker" bind:ar-tracker-switch="handleTrackerSwitch"
      src="https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/xr-frame-team/2dmarker/hikari.jpg"
    >
      <xr-mesh node-id="mesh-plane" geometry="plane" material="mat" />
      <xr-particle
        capacity="500" emit-rate="20"
        size="0.03 0.06" life-time="2 3" speed="0.04 0.1"
        start-color="1 1 1 0.8" end-color="1 1 1 0.2"
        emitter-type="BoxShape"
        emitter-props="minEmitBox:-0.5 0 0.5,maxEmitBox:0.5 0.2 0,direction:0 0 -1,direction2:0 0 -1"
        texture="point"
      />
    </xr-ar-tracker>
  </xr-node>
......
在上一步2DMarker视频的基础上，我们加上了xr-particle元素，使用了新加载的贴图point和boxShape发射器以及其他参数来生成粒子，最终效果如下（当然限于本人美术功底效果非常一般，相信你可以随便调一调完爆我233）：


后处理，让画面更加好玩
在主体渲染结束后，好像还是有些单调，缺乏一种和现实世界的明确分离感，这时候就可以用全屏后处理来实现一些更好玩的效果：

  ......
  <xr-asset-load asset-id="anim" type="keyframe" src="/assets/animation.json"/>
  ......
  <xr-asset-post-process
    asset-id="vignette" type="vignette" data="intensity:1,smoothness:4,color:1 0 0 1"
    anim-keyframe="anim" anim-autoplay
  />
  <xr-camera clear-color="0.4 0.8 0.6 1" background="ar" is-ar-camera post-process="vignette" />
这里我为相机应用了一个渐晕vignette后处理效果，并为其加上了帧动画控制参数：

{
  "keyframe": {
    "vignette": {
      "0": {
        "asset-post-process.assetData.intensity": 0
      },
      "100": {
        "asset-post-process.assetData.intensity": 1
      }
    }
  },
  "animation": {
    "vignette": {
      "keyframe": "vignette",
      "duration": 2,
      "ease": "ease-in-out",
      "loop": -1,
      "direction": "both"
    }
  }
}
最终效果如下：


分享给你的好友吧！
好，终于到了这里，当我们做出了一些令人满意的效果后最重要的什么？当然是分享给好友！下面就让我们用xr-frame内置的分享系统来完成这个功能：

......
<xr-mesh node-id="mesh-plane" geometry="plane" material="mat" cube-shape="autoFit:true" bind:touch-shape="handleShare" />
......
handleShare: function() {
  this.scene.share.captureToFriends();
}
给识别后显示的视频Mesh加上了上面说过的shape绑定了触摸事件，然后在事件处理函数中直接用this.scene.share.captureToFriends()即可，效果如下：

当然，很多时候我们只是需要图片，然后用它接入微信的其他分享接口比如onShareAppMessage生命周期，此时使用share.captureToLocalPath接口即可，详细可见组件文档。


之后的，就交给你的创意
至此，我们简单体验了一下框架的各种能力，但主要是wxml为主，逻辑很少。对于入门的开发者，我们倾向于提供给开发者非常简单就能实现不错的效果，这也是渐进式开发的基础。更多详细的文档教程可见组件文档。

但除了这些简单的用法外，框架还提供了高度灵活的组件化特性。开发者可以按照自身需求，定制属于自己的组件、元素、所有的资源等等，甚至如果有需求，我们还可以开放底层的RenderGraph来定制渲染流程。详细的定制开发能力可见接下来各个部分的文档，我们都做了比较详细的说明和引导。

好，入门就到此为止了，技术始终只是一个工具，剩下的就交给身为创作者的你了！在此之前，不如先看看这些DEMO吧：