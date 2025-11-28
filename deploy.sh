#!/bin/bash

# 钻石狂潮网页版 - 快速部署脚本
# Diamond Frenzy Web - Quick Deploy Script

echo "🎮 钻石狂潮网页版 - 部署脚本"
echo "=================================="

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装，请先安装Git"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "index.html" ]; then
    echo "❌ 请在游戏根目录运行此脚本"
    exit 1
fi

# 初始化Git仓库 (如果还没有)
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
    echo "✅ Git仓库初始化完成"
fi

# 添加所有文件
echo "📁 添加文件到Git..."
git add .

# 提交代码
echo "💾 提交代码..."
git commit -m "Initial commit: Diamond Frenzy Web game v1.0.0"

# 检查远程仓库是否已设置
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 设置远程仓库..."
    echo "请输入您的GitHub仓库地址 (例如: https://github.com/Hygge8/DiamondFrenzy-Web.git)"
    read -p "仓库地址: " repo_url
    git remote add origin "$repo_url"
    echo "✅ 远程仓库设置完成"
fi

# 推送到GitHub
echo "🚀 推送到GitHub..."
git push -u origin main

echo ""
echo "🎉 部署完成！"
echo "=================================="
echo "📋 下一步操作："
echo "1. 访问您的GitHub仓库"
echo "2. 进入 Settings > Pages"
echo "3. Source选择 'Deploy from a branch'"
echo "4. Branch选择 'main'，Folder选择 '/ (root)'"
echo "5. 点击Save保存设置"
echo ""
echo "🌐 几分钟后，您的游戏就可以在以下地址访问："
echo "   https://您的用户名.github.io/DiamondFrenzy-Web/"
echo ""
echo "📖 详细部署说明请查看 DEPLOY.md 文件"
echo ""
echo "🎮 享受游戏吧！"