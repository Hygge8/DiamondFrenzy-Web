# 贡献指南

感谢您对钻石狂潮网页版项目的兴趣！我们欢迎所有形式的贡献。

## 🚀 快速开始

### 开发环境设置

1. **Fork项目**
   ```bash
   git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
   cd DiamondFrenzy-Web
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **打开浏览器访问**
   ```
   http://localhost:8080
   ```

## 📋 贡献方式

### 🐛 报告Bug
如果您发现了bug，请创建一个Issue并包含：
- 详细的bug描述
- 重现步骤
- 预期行为
- 实际行为
- 屏幕截图（如果适用）
- 您的环境信息

### 💡 提出功能建议
我们欢迎新功能建议！请在Issue中包含：
- 清晰的功能描述
- 使用场景
- 预期的实现方式
- 可能的替代方案

### 🔧 提交代码
1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **进行您的更改**
   - 遵循我们的代码规范
   - 添加必要的测试
   - 更新相关文档

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add new game feature"
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建Pull Request**

## 📝 代码规范

### JavaScript规范
- 使用ES6+语法特性
- 使用const/let，避免var
- 使用有意义的变量名
- 添加JSDoc注释
- 遵循项目中的命名约定

```javascript
/**
 * 玩家类 - 管理玩家角色的一切行为和状态
 * @class Player
 * @extends Entity
 */
class Player extends Entity {
    /**
     * 玩家移动方法
     * @param {string} direction - 移动方向
     * @param {number} speed - 移动速度
     * @returns {void}
     */
    move(direction, speed = 1) {
        // 实现代码
    }
}
```

### CSS规范
- 使用BEM命名规范
- 使用CSS变量
- 移动端优先的响应式设计
- 保持样式的一致性

```css
/* BEM命名规范示例 */
.game {
    /* 游戏容器样式 */
}

.game__player {
    /* 玩家元素样式 */
}

.game__player--active {
    /* 玩家激活状态样式 */
}
```

### 文件命名
- 使用kebab-case: `game-engine.js`
- HTML文件: `index.html`, `game.html`
- CSS文件: `main.css`, `game.css`
- JS文件: `main.js`, `GameEngine.js`

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 编写测试
- 为新功能添加单元测试
- 确保测试覆盖率达到80%以上
- 使用描述性的测试名称
- 测试边界条件和错误情况

```javascript
describe('Player', () => {
    test('should move in specified direction', () => {
        const player = new Player();
        player.move('right', 1);
        expect(player.position.x).toBe(1);
    });
});
```

## 🎮 游戏开发规范

### 游戏对象设计
- 每个游戏对象都应该继承自基类
- 实现必要的生命周期方法
- 遵循单一职责原则

```javascript
class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        this.health = 100;
    }

    update(deltaTime) {
        // 更新逻辑
        this.move();
        this.checkCollisions();
    }

    render(ctx) {
        // 渲染逻辑
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
```

### 性能优化
- 避免在游戏循环中创建新对象
- 使用对象池复用游戏对象
- 实现视口裁剪
- 优化图片和音频资源

### 兼容性要求
- 支持现代浏览器 (Chrome 60+, Firefox 55+, Safari 12+)
- 移动设备兼容性
- 响应式设计

## 🔍 代码审查

### 审查清单
- [ ] 代码遵循项目规范
- [ ] 功能按预期工作
- [ ] 没有明显的性能问题
- [ ] 添加了适当的测试
- [ ] 更新了相关文档
- [ ] 考虑了边缘情况

### 审查重点
- 代码质量和可读性
- 性能影响
- 安全性考虑
- 用户体验
- 维护性

## 📚 文档要求

### 必需文档
- 新功能的API文档
- 复杂算法的说明
- 重要的设计决策
- 性能优化的说明

### 文档格式
- 使用Markdown格式
- 包含代码示例
- 添加图表说明（如果需要）
- 保持文档的更新

## 🎯 优先级指南

### 高优先级
- 🐛 Bug修复
- ⚡ 性能优化
- 🔒 安全性问题
- 📱 移动端兼容性

### 中优先级
- ✨ 新功能
- 🎨 UI/UX改进
- 📚 文档完善
- 🧪 测试覆盖率

### 低优先级
- 🔧 开发工具改进
- 🎵 音效和视觉效果
- 🌐 国际化
- 📊 分析和监控

## 💬 社区参与

### 沟通渠道
- GitHub Issues: 报告问题和讨论功能
- GitHub Discussions: 一般讨论和问答
- Pull Requests: 代码贡献和审查

### 行为准则
- 尊重他人
- 保持建设性的讨论
- 欢迎新手
- 分享知识和经验

## 🏆 贡献者

感谢所有为项目做出贡献的开发者！

## 📄 许可证

通过贡献代码，您同意您的贡献将在MIT许可证下发布。

---

**感谢您对钻石狂潮网页版的贡献！** 🎮✨