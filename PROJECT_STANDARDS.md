# 钻石狂潮网页版 - 项目规范

## 📁 目录结构规范

```
diamond-frenzy-web/
├── 📄 README.md                    # 项目说明文档
├── 📄 CHANGELOG.md                 # 版本更新日志
├── 📄 CONTRIBUTING.md              # 贡献指南
├── 📄 LICENSE                      # 开源许可证
├── 📄 package.json                 # 项目配置
├── 📄 .gitignore                   # Git忽略文件
├── 📄 .eslintrc.js                 # ESLint配置
├── 📄 .prettierrc                  # Prettier配置
├── 📄 .github/                     # GitHub配置
│   ├── 📁 workflows/
│   │   ├── 📄 deploy.yml           # 部署工作流
│   │   └── 📄 ci.yml               # 持续集成
│   ├── 📁 ISSUE_TEMPLATE/          # Issue模板
│   └── 📁 PULL_REQUEST_TEMPLATE.md # PR模板
├── 📄 index.html                   # 主页面
├── 📁 assets/                      # 静态资源
│   │   ├── 📁 audio/               # 音频文件
│   │   │   ├── 📁 music/           # 背景音乐
│   │   │   └── 📁 sfx/             # 音效文件
│   │   ├── 📁 images/              # 图片资源
│   │   │   ├── 📁 sprites/         # 精灵图片
│   │   │   ├── 📁 ui/              # UI图片
│   │   │   ├── 📁 backgrounds/     # 背景图片
│   │   │   └── 📁 tiles/           # 瓦片图片
│   │   └── 📁 fonts/               # 字体文件
├── 📁 css/                     # 样式文件
│   │   ├── 📄 main.css             # 主样式
│   │   ├── 📄 game.css             # 游戏样式
│   │   ├── 📄 responsive.css       # 响应式样式
│   │   └── 📄 components/          # 组件样式
├── 📁 js/                      # JavaScript代码
│   │   ├── 📄 main.js              # 主入口文件
│   │   ├── 📁 engine/              # 游戏引擎
│   │   ├── 📁 entities/            # 游戏实体
│   │   ├── 📁 systems/             # 游戏系统
│   │   ├── 📁 utils/               # 工具函数
│   │   └── 📁 config/              # 配置文件
├── 📁 data/                    # 游戏数据
│       ├── 📁 levels/              # 关卡数据
│       ├── 📄 config.json          # 游戏配置
│       └── 📄 achievements.json    # 成就数据
├── 📄 tests/                       # 测试文件
│   ├── 📁 unit/                    # 单元测试
│   ├── 📁 integration/             # 集成测试
│   └── 📁 e2e/                     # 端到端测试
├── 📄 tools/                       # 开发工具
│   ├── 📄 build.js                 # 构建脚本
│   ├── 📄 deploy.js                # 部署脚本
│   └── 📄 lint.js                  # 代码检查
└── 📄 examples/                    # 示例代码
    └── 📁 tutorials/               # 教程示例
```

## 📝 代码规范

### JavaScript编码标准
- 使用ES6+语法特性
- 优先使用const/let，避免var
- 使用箭头函数和解构赋值
- 采用async/await处理异步操作
- 使用JSDoc注释规范

### CSS编码标准
- 使用BEM命名规范
- 优先使用Flexbox和Grid布局
- 使用CSS变量管理主题色彩
- 移动端优先的响应式设计

### 文件命名规范
- 文件名使用kebab-case: `game-engine.js`
- 类名使用PascalCase: `GameEngine`
- 常量使用UPPER_SNAKE_CASE: `MAX_HEALTH`
- 私有属性使用下划线前缀: `_privateMethod`

## 🔧 开发工具配置

### ESLint规则
- 强制使用分号
- 禁止未使用的变量
- 要求使用严格模式
- 强制一致的缩进

### Prettier配置
- 使用2空格缩进
- 使用单引号
- 尾随逗号
- 行宽限制100字符

## 📦 依赖管理

### 生产依赖
- 无外部依赖 (纯HTML5/CSS3/JS)

### 开发依赖
- http-server: 本地开发服务器
- eslint: 代码质量检查
- prettier: 代码格式化
- jest: 单元测试框架

## 🚀 部署规范

### GitHub Pages配置
- 自动部署main分支
- 支持自定义域名
- 启用Gzip压缩
- 配置缓存策略

### 环境变量
- 无敏感信息存储
- 使用配置文件管理设置
- 支持多环境配置

## 📊 质量保证

### 代码审查
- 所有PR必须经过审查
- 强制运行测试
- 检查代码覆盖率
- 性能基准测试

### 测试策略
- 单元测试覆盖率 > 80%
- 集成测试关键功能
- 端到端测试用户流程
- 性能测试关键指标

## 🔄 分支策略

### Git Flow
- `main`: 生产环境分支
- `develop`: 开发环境分支
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支
- `release/*`: 发布准备分支

### 合并策略
- 使用Pull Request
- 要求代码审查
- 自动运行测试
- Squash and Merge

---

**版本**: v1.0.0  
**最后更新**: 2025-10-30  
**维护者**: MiniMax Agent