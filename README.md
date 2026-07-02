# Diamond Frenzy Web

一个基于 HTML5 Canvas 和原生 JavaScript 的网页小游戏原型，灵感来自经典冒险解谜玩法。项目当前可以通过本地 HTTP 服务直接运行，并包含 Jest 自动化测试覆盖核心启动链。

## 本地运行

项目使用传统 `<script>` 方式加载浏览器全局脚本。请通过本地 Web 服务访问，不要直接双击 `index.html`。

```bash
npm install
npm start
```

启动后访问：

```text
http://127.0.0.1:8080
```

## 测试

```bash
npm test
```

当前测试覆盖：

- `GameEngine` 初始化、启动和停止
- `Player` 初始化、受伤、钻石收集
- `Enemy` 基类初始化和死亡状态
- 首个关卡加载以及玩家、钻石、障碍物、道具、敌人创建

## 操作

- 移动：`WASD` 或方向键
- 跳跃/使用道具：`Space`
- 选择道具：数字键 `1-8`
- 暂停：`Esc`

## 技术说明

- 前端：HTML5 Canvas、CSS、原生 JavaScript
- 测试：Jest + jsdom
- 本地服务：http-server

当前仓库不依赖外部图片和音频资源即可启动。游戏实体会使用 Canvas 几何图形作为兜底渲染；缺失音频资源会安全跳过。
