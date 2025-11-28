# Git分支策略

## 🌳 分支模型

我们采用 **Git Flow** 分支模型来管理项目开发。

### 主要分支

#### `main` - 生产环境分支
- **用途**: 稳定的生产环境代码
- **保护**: 受保护的分支，需要PR才能合并
- **部署**: 每次合并都会自动部署到生产环境
- **状态**: 始终保持可发布状态

#### `develop` - 开发环境分支
- **用途**: 集成所有功能分支的最新开发代码
- **保护**: 受保护的分支，需要PR才能合并
- **部署**: 每次合并会部署到开发环境
- **状态**: 包含所有最新功能，但可能不稳定

### 辅助分支

#### `feature/*` - 功能开发分支
- **命名**: `feature/功能名称`
- **来源**: 从 `develop` 分支创建
- **合并**: 合并回 `develop` 分支
- **生命周期**: 功能完成后删除

**示例**:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-enemy-ai
# 开发新功能...
git push origin feature/new-enemy-ai
# 创建PR到develop分支
```

#### `hotfix/*` - 紧急修复分支
- **命名**: `hotfix/问题描述`
- **来源**: 从 `main` 分支创建
- **合并**: 同时合并回 `main` 和 `develop` 分支
- **生命周期**: 修复完成后删除

**示例**:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix
# 修复bug...
git push origin hotfix/critical-bug-fix
# 创建PR到main分支
```

#### `release/*` - 发布准备分支
- **命名**: `release/版本号`
- **来源**: 从 `develop` 分支创建
- **合并**: 合并回 `main` 和 `develop` 分支
- **生命周期**: 发布完成后删除

## 🔄 工作流程

### 日常开发流程

1. **开始新功能**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **开发功能**
   ```bash
   # 编写代码
   git add .
   git commit -m "feat: add new game feature"
   
   # 推送分支
   git push origin feature/your-feature-name
   ```

3. **创建Pull Request**
   - 在GitHub上创建PR到 `develop` 分支
   - 填写PR模板
   - 请求代码审查
   - 运行CI检查

4. **代码审查和合并**
   - 至少需要1个审查者批准
   - 所有CI检查必须通过
   - Squash and Merge到develop分支

### 发布流程

1. **创建发布分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.1.0
   ```

2. **准备发布**
   - 更新版本号
   - 更新CHANGELOG.md
   - 修复最后的bug
   - 运行完整测试

3. **合并到main**
   ```bash
   git checkout main
   git merge release/v1.1.0
   git tag v1.1.0
   git push origin main --tags
   ```

4. **更新develop**
   ```bash
   git checkout develop
   git merge release/v1.1.0
   git push origin develop
   ```

5. **清理**
   ```bash
   git branch -d release/v1.1.0
   ```

### 紧急修复流程

1. **创建hotfix分支**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **修复问题**
   ```bash
   # 快速修复
   git commit -m "fix: resolve critical security issue"
   ```

3. **合并修复**
   ```bash
   # 合并到main
   git checkout main
   git merge hotfix/critical-issue
   git tag v1.0.1
   
   # 合并到develop
   git checkout develop
   git merge hotfix/critical-issue
   
   # 推送
   git push origin main develop --tags
   ```

## 📋 提交信息规范

### 格式
```
类型(范围): 简短描述

详细描述（可选）

BREAKING CHANGE: 破坏性变更说明（可选）
```

### 类型
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（即不是新增功能，也不是修改bug的代码变动）
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: 持续集成相关
- `build`: 构建相关
- `revert`: 回滚

### 范围
可选，用于说明影响的范围：
- `game`: 游戏核心逻辑
- `ui`: 用户界面
- `engine`: 游戏引擎
- `audio`: 音频系统
- `levels`: 关卡设计

### 示例
```bash
feat(game): add new enemy type - PoisonSpider
fix(ui): resolve mobile responsive layout issue
docs(api): update game engine documentation
style(engine): improve code formatting consistency
refactor(audio): optimize sound loading performance
test(levels): add unit tests for level manager
chore: update dependencies
perf(game): optimize collision detection algorithm
```

## 🛡️ 分支保护规则

### main分支保护
- 要求PR才能合并
- 要求代码审查（至少1人）
- 要求状态检查通过
- 禁止强制推送
- 禁止删除

### develop分支保护
- 要求PR才能合并
- 要求状态检查通过
- 允许管理员强制推送
- 允许删除

## 🧪 质量保证

### CI检查
- ESLint代码检查
- Prettier代码格式化
- 单元测试
- 集成测试
- 端到端测试
- 性能测试

### 代码审查检查清单
- [ ] 代码遵循项目规范
- [ ] 功能按预期工作
- [ ] 添加了适当的测试
- [ ] 更新了相关文档
- [ ] 考虑了边缘情况
- [ ] 性能影响评估
- [ ] 安全性考虑

## 📊 分支统计

查看分支信息：
```bash
# 查看所有分支
git branch -a

# 查看分支最后提交
git branch -v

# 查看已合并到develop的分支
git branch --merged develop

# 查看未合并到develop的分支
git branch --no-merged develop
```

---

**维护者**: MiniMax Agent  
**最后更新**: 2025-10-30