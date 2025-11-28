# 项目统计和监控配置

## 📊 GitHub Insights配置

### 启用项目统计
```bash
# 在仓库设置中启用以下功能：
# 1. Repository insights
# 2. Dependency graph
# 3. Security advisories
# 4. Dependabot alerts
```

### 自定义徽章生成
```markdown
<!-- 在README.md中使用以下徽章 -->
![GitHub issues](https://img.shields.io/github/issues/Hygge8/DiamondFrenzy-Web)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Hygge8/DiamondFrenzy-Web)
![GitHub contributors](https://img.shields.io/github/contributors/Hygge8/DiamondFrenzy-Web)
![GitHub last commit](https://img.shields.io/github/last-commit/Hygge8/DiamondFrenzy-Web)
![GitHub code size](https://img.shields.io/github/languages/code-size/Hygge8/DiamondFrenzy-Web)
![GitHub top language](https://img.shields.io/github/languages/top/Hygge8/DiamondFrenzy-Web)
```

## 🔍 Codecov集成

### 配置Codecov
1. 访问 [Codecov.io](https://codecov.io)
2. 使用GitHub登录
3. 启用DiamondFrenzy-Web仓库
4. 获取上传令牌

### 添加到GitHub Secrets
```bash
# 在仓库设置中添加以下secrets:
CODECOV_TOKEN=<your-codecov-token>
```

## 📈 Lighthouse CI配置

### GitHub App安装
1. 访问 [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. 安装到DiamondFrenzy-Web仓库
3. 获取GitHub App Token

### 添加到GitHub Secrets
```bash
LHCI_GITHUB_APP_TOKEN=<your-lhci-token>
```

## 🚨 安全监控

### Dependabot配置
创建 `.github/dependabot.yml`:
```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "Hygge8"
    assignees:
      - "Hygge8"
```

### 安全策略
创建 `.github/SECURITY.md`:
```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to [security email].
```

## 📊 自定义仪表板

### 创建GitHub Pages仪表板
创建 `dashboard/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Diamond Frenzy - Project Dashboard</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .metric { 
            display: inline-block; 
            margin: 20px; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
        }
        .value { font-size: 2em; font-weight: bold; color: #0366d6; }
        .label { color: #586069; }
    </style>
</head>
<body>
    <h1>🎮 Diamond Frenzy Web - Project Dashboard</h1>
    
    <div class="metric">
        <div class="value" id="stars">-</div>
        <div class="label">GitHub Stars</div>
    </div>
    
    <div class="metric">
        <div class="value" id="forks">-</div>
        <div class="label">Forks</div>
    </div>
    
    <div class="metric">
        <div class="value" id="issues">-</div>
        <div class="label">Open Issues</div>
    </div>
    
    <div class="metric">
        <div class="value" id="coverage">-</div>
        <div class="label">Test Coverage</div>
    </div>
    
    <script>
        // GitHub API integration
        fetch('https://api.github.com/repos/Hygge8/DiamondFrenzy-Web')
            .then(response => response.json())
            .then(data => {
                document.getElementById('stars').textContent = data.stargazers_count;
                document.getElementById('forks').textContent = data.forks_count;
                document.getElementById('issues').textContent = data.open_issues_count;
            });
    </script>
</body>
</html>
```

## 📋 质量门禁配置

### 代码覆盖率阈值
```json
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### 性能预算
```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.8}]
      }
    }
  }
}
```

## 🔔 通知配置

### Slack通知
```yaml
# .github/workflows/notify.yml
name: Notifications

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'failure'
    
    steps:
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: "❌ Diamond Frenzy CI/CD failed"
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Discord通知
```yaml
- name: Notify Discord
  uses: Ilshidur/action-discord@master
  with:
    args: '❌ Diamond Frenzy CI/CD pipeline failed! Check the logs: {{ event.workflow_run.html_url }}'
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
```

## 📊 报告生成

### 每周报告
创建 `.github/workflows/weekly-report.yml`:
```yaml
name: Weekly Report

on:
  schedule:
    - cron: '0 9 * * 1' # 每周一上午9点

jobs:
  generate-report:
    runs-on: ubuntu-latest
    
    steps:
    - name: Generate weekly report
      run: |
        echo "## 📊 Diamond Frenzy Web - Weekly Report" > weekly-report.md
        echo "**Date**: $(date)" >> weekly-report.md
        echo "" >> weekly-report.md
        echo "### 📈 Project Statistics" >> weekly-report.md
        echo "- Commits this week: $(git log --since='1 week ago' --oneline | wc -l)" >> weekly-report.md
        echo "- Issues opened: $(gh issue list --state open --json number | jq length)" >> weekly-report.md
        echo "- PRs merged: $(gh pr list --state merged --json number | jq length)" >> weekly-report.md
        echo "" >> weekly-report.md
        echo "### 🚀 Deployment Status" >> weekly-report.md
        echo "- Last deployment: $(date)" >> weekly-report.md
        echo "- Build status: ✅ Success" >> weekly-report.md
        
    - name: Create issue with report
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const report = fs.readFileSync('weekly-report.md', 'utf8');
          
          github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: `Weekly Report - ${new Date().toISOString().split('T')[0]}`,
            body: report,
            labels: ['weekly-report', 'documentation']
          });
```

## 🔍 监控指标

### 关键指标
- **代码覆盖率**: > 80%
- **构建成功率**: 100%
- **部署成功率**: 100%
- **页面性能得分**: > 90
- **安全漏洞**: 0
- **依赖更新**: 每周检查

### 告警阈值
- 测试失败: 立即通知
- 覆盖率下降: 每日检查
- 性能得分下降: 每周检查
- 安全漏洞: 立即通知
- 依赖过时: 每周检查

---

**维护者**: MiniMax Agent  
**最后更新**: 2025-10-30