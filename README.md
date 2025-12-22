# 💎 钻石狂潮 - Diamond Frenzy (Web版)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Hygge8/DiamondFrenzy-Web.svg?style=social&label=Star)](https://github.com/Hygge8/DiamondFrenzy-Web)
[![GitHub issues](https://img.shields.io/github/issues/Hygge8/DiamondFrenzy-Web)](https://github.com/Hygge8/DiamondFrenzy-Web/issues)

一个基于经典手机游戏**钻石狂潮 (Diamond Rush)** 的网页版冒险解谜游戏，使用原生 **HTML5 Canvas** 和 **JavaScript** 开发。

本项目已进行**代码清理、模块化修复和运行环境优化**，确保游戏可以成功运行，并简化了项目结构。

## 🚀 立即体验

**[🎮 开始游戏](https://hygge8.github.io/DiamondFrenzy-Web/)** | **[🐛 报告问题](https://github.com/Hygge8/DiamondFrenzy-Web/issues)**

## 🛠️ 本地运行指南

由于项目使用了 **JavaScript 类和模块**，为避免浏览器跨域限制（CORS），**必须**通过本地 Web 服务器运行，而不能直接双击 `index.html` 文件。

### 步骤一：克隆项目

```bash
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web
```

### 步骤二：安装依赖

项目依赖 `http-server` 和 `jest` 进行本地服务和测试。

```bash
npm install
```

### 步骤三：启动本地服务器

使用 `npm start` 脚本启动本地服务器。

```bash
npm start
```

服务器启动后，在浏览器中访问显示的地址（通常是 `http://localhost:8080`）即可开始游戏。

### 步骤四：运行测试

项目包含单元测试，可以使用以下命令运行：

```bash
npm test
```

## 🎮 游戏简介与特色

钻石狂潮是一款经典的冒险解谜类游戏，玩家将扮演一名勇敢的探险家，在危机四伏的遗迹中探索、解谜、打怪，并收集钻石和宝藏。

| 特色 | 描述 |
| :--- | :--- |
| **核心玩法** | 忠实还原原版游戏的核心机制，包括推石、挖土、收集钻石等。 |
| **三大世界** | 吴哥窟、巴伐利亚、西藏雪洞三大主题世界。 |
| **丰富敌人** | 5种不同类型的敌人，各具特色 AI 行为。 |
| **多样道具** | 8种功能各异的道具，帮助玩家克服困难。 |
| **技术栈** | 原生 HTML5 + CSS3 + JavaScript (ES6+)，使用 Canvas 2D API 渲染。 |

## 🕹️ 游戏操作

| 操作 | 键盘控制 |
| :--- | :--- |
| **移动** | `WASD` 或 `方向键` |
| **使用道具** | `空格键` |
| **暂停** | `ESC` |

## 📄 许可证

本项目采用 **MIT 许可证**。

**免责声明：** 本项目仅为学习和交流目的，灵感来源于 Gameloft 的经典游戏《钻石狂潮》(Diamond Rush)。

---

**享受游戏，收集钻石！💎**
