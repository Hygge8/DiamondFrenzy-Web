# GitHub仓库操作指南

## 🚀 快速部署到GitHub

### 方法一：GitHub Web界面 (推荐)

#### 1. 创建GitHub仓库
```bash
# 访问 https://github.com
# 点击 "New repository"
# 仓库名: DiamondFrenzy-Web
# 设置为 Public
# 不要勾选 "Add a README file"
# 点击 "Create repository"
```

#### 2. 上传项目文件
```bash
# 在新仓库页面点击 "uploading an existing file"
# 将 diamond-frenzy-web 目录中的所有文件拖拽到上传区域
# 提交信息: "feat: initial project setup with complete structure"
# 点击 "Commit changes"
```

#### 3. 启用GitHub Pages
```bash
# 进入仓库 Settings 页面
# 滚动到左侧 "Pages" 选项
# Source 选择 "Deploy from a branch"
# Branch 选择 "main"
# Folder 选择 "/ (root)"
# 点击 "Save"
```

#### 4. 配置分支保护
```bash
# 进入仓库 Settings > Branches
# 点击 "Add rule"
# Branch name pattern: main
# 勾选:
#   ✓ Require pull request reviews before merging
#   ✓ Dismiss stale PR approvals when new commits are pushed
#   ✓ Require status checks to pass before merging
#   ✓ Require branches to be up to date before merging
# 点击 "Create"
```

### 方法二：Git命令行部署

#### 1. 克隆并设置远程仓库
```bash
# 克隆仓库
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web

# 复制项目文件 (将diamond-frenzy-web/中所有文件复制到仓库根目录)
# 然后提交代码
git add .
git commit -m "feat: initial project setup with complete structure"
git push origin main
```

#### 2. 设置分支策略
```bash
# 创建develop分支
git checkout -b develop
git push origin develop

# 创建feature分支示例
git checkout develop
git checkout -b feature/new-game-feature
git push origin feature/new-game-feature
```

## 📋 分支管理流程

### 日常开发流程

#### 1. 开始新功能
```bash
# 切换到develop分支
git checkout develop
git pull origin develop

# 创建功能分支
git checkout -b feature/your-feature-name

# 开发功能...
git add .
git commit -m "feat: add new game feature"

# 推送分支
git push origin feature/your-feature-name
```

#### 2. 创建Pull Request
- 在GitHub上访问您的分支
- 点击 "Create Pull Request"
- 填写PR模板
- 指定审查者
- 提交PR

#### 3. 代码审查和合并
- 等待审查者批准
- 确保所有CI检查通过
- 使用 "Squash and Merge" 合并到develop

#### 4. 发布到生产环境
```bash
# 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 更新版本和CHANGELOG
# 合并到main
git checkout main
git merge release/v1.1.0
git tag v1.1.0
git push origin main --tags

# 更新develop
git checkout develop
git merge release/v1.1.0
git push origin develop
```

## 🔧 GitHub Actions配置

### 自动化测试工作流
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Generate coverage report
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
```

### 自动部署工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 🏷️ 版本管理

### 创建发布版本
```bash
# 1. 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 2. 创建发布分支
git checkout -b release/v1.1.0

# 3. 更新CHANGELOG.md
# 4. 提交更改
git commit -m "chore: prepare release v1.1.0"

# 5. 合并到main并创建标签
git checkout main
git merge release/v1.1.0
git tag v1.1.0
git push origin main --tags

# 6. 删除发布分支
git branch -d release/v1.1.0
```

## 📊 项目徽章配置

在README.md中添加徽章：
```markdown
[![CI Status](https://github.com/Hygge8/DiamondFrenzy-Web/workflows/CI/badge.svg)](https://github.com/Hygge8/DiamondFrenzy-Web/actions)
[![Coverage Status](https://codecov.io/gh/Hygge8/DiamondFrenzy-Web/branch/main/graph/badge.svg)](https://codecov.io/gh/Hygge8/DiamondFrenzy-Web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Hygge8/DiamondFrenzy-Web.svg?style=social&label=Star)](https://github.com/Hygge8/DiamondFrenzy-Web)
```

## 🔍 代码质量检查

### 设置CodeQL安全扫描
```yaml
# .github/workflows/codeql.yml
name: "CodeQL"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: ${{ matrix.language }}

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

## 🐛 Issue和PR管理

### Issue模板使用
- Bug报告: 使用 `.github/ISSUE_TEMPLATE/bug_report.md`
- 功能请求: 使用 `.github/ISSUE_TEMPLATE/feature_request.md`

### PR模板使用
所有Pull Request必须填写 `.github/PULL_REQUEST_TEMPLATE.md` 中的检查清单

### 标签管理
推荐标签：
- `bug` - Bug修复
- `enhancement` - 功能增强
- `documentation` - 文档更新
- `good first issue` - 适合新手的任务
- `help wanted` - 需要帮助
- `question` - 问题讨论

## 📈 项目统计和分析

### GitHub Insights
- 访问仓库 "Insights" → "Traffic" 查看访问统计
- "Insights" → "Dependency graph" 查看依赖关系
- "Insights" → "Network" 查看分支关系

### Codecov集成
```bash
# 1. 在 https://codecov.io 注册
# 2. 连接您的GitHub仓库
# 3. 上传覆盖率报告 (已在Actions中配置)
```

## 🚨 故障排除

### 常见问题

**Q: GitHub Pages显示404错误**
A: 检查index.html是否在仓库根目录，确保GitHub Pages已启用

**Q: CI检查失败**
A: 查看Actions日志，检查测试和linting错误

**Q: 无法推送代码**
A: 检查远程仓库URL是否正确，确保有推送权限

**Q: PR无法合并**
A: 检查分支保护规则，确保所有检查通过

### 调试命令
```bash
# 查看远程仓库
git remote -v

# 查看分支状态
git branch -a

# 查看提交历史
git log --oneline --graph

# 查看文件状态
git status

# 查看差异
git diff
```

---

**维护者**: MiniMax Agent  
**最后更新**: 2025-10-30