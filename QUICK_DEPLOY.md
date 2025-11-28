# 钻石狂潮网页版 - 完整部署指南

## 🎯 快速部署 (3分钟完成)

### 方案一：GitHub Web界面部署 (推荐新手)

1. **创建GitHub仓库**
   - 访问 [GitHub.com](https://github.com)
   - 登录您的账户
   - 点击右上角 "+" → "New repository"
   - 仓库名输入: `DiamondFrenzy-Web`
   - 选择 "Public"
   - **不要**勾选 "Add a README file"
   - 点击 "Create repository"

2. **上传游戏文件**
   - 在新创建的仓库页面，点击 "uploading an existing file"
   - 将 `diamond-frenzy-web` 文件夹中的**所有内容**拖拽到上传区域
   - 或者点击 "choose your files" 选择所有文件
   - 提交信息填写: `Initial commit: Diamond Frenzy Web game v1.0.0`
   - 点击 "Commit changes"

3. **启用GitHub Pages**
   - 进入仓库页面，点击 "Settings" 标签
   - 滚动到左侧 "Pages" 选项
   - 在 "Source" 部分选择 "Deploy from a branch"
   - Branch选择 "main"
   - Folder选择 "/ (root)"
   - 点击 "Save"

4. **访问游戏**
   - 等待2-3分钟部署完成
   - 访问: `https://您的用户名.github.io/DiamondFrenzy-Web/`
   - 🎉 开始游戏！

### 方案二：Git命令行部署 (推荐开发者)

```bash
# 1. 克隆仓库
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web

# 2. 复制游戏文件 (将diamond-frenzy-web/中所有文件复制到仓库根目录)

# 3. 提交并推送
git add .
git commit -m "Initial commit: Diamond Frenzy Web game v1.0.0"
git push origin main

# 4. 启用GitHub Pages (通过Web界面，步骤同上)
```

### 方案三：使用部署脚本

```bash
# 在diamond-frenzy-web目录中运行
./deploy.sh
```

## 🔧 自定义配置

### 修改游戏标题
编辑 `index.html` 文件中的 `<title>` 标签：

```html
<title>您的游戏标题</title>
```

### 修改游戏描述
编辑 `index.html` 文件中的 meta 标签：

```html
<meta name="description" content="您的游戏描述">
```

### 添加自定义域名
在仓库根目录创建 `CNAME` 文件：

```
echo "your-domain.com" > CNAME
```

然后在域名提供商处添加CNAME记录。

## 📱 移动端优化

游戏已内置响应式设计，支持：
- 触控操作
- 虚拟摇杆
- 自适应屏幕尺寸
- 移动端优化UI

## 🚀 性能优化

### 已实现的优化
- ✅ Canvas渲染优化
- ✅ 对象池管理
- ✅ 资源预加载
- ✅ 响应式图片
- ✅ Gzip压缩 (GitHub Pages)

### 可选的进一步优化
- 图片格式转换 (WebP)
- 音频压缩
- 代码压缩
- CDN部署

## 🐛 故障排除

### 常见问题

**Q: 页面显示404错误**
A: 检查 `index.html` 是否在仓库根目录，确保GitHub Pages已启用

**Q: 游戏加载很慢**
A: 等待GitHub Pages部署完成，通常需要2-5分钟

**Q: 移动端显示异常**
A: 清除浏览器缓存，检查网络连接

**Q: 音效无法播放**
A: 现代浏览器需要用户交互后才能播放音频，点击任意按钮激活

### 调试方法
1. 打开浏览器开发者工具 (F12)
2. 查看Console选项卡是否有错误信息
3. 检查Network选项卡确认资源加载状态

## 📊 监控和分析

### GitHub Pages 统计
- 访问仓库的 "Insights" → "Traffic"
- 查看访问量和访问来源

### 游戏数据
- 游戏内置本地存储，记录玩家进度
- 可以通过浏览器开发者工具查看localStorage数据

## 🔄 更新游戏

要更新游戏内容：

1. 修改本地文件
2. 重新上传到GitHub仓库
3. GitHub Pages会自动重新部署

```bash
git add .
git commit -m "Update: 游戏功能改进"
git push origin main
```

## 📈 推广建议

### 社交媒体分享
在 `index.html` 中添加分享按钮：

```html
<!-- 分享到微信 -->
<button onclick="shareToWeChat()">分享到微信</button>

<!-- 分享到微博 -->
<button onclick="shareToWeibo()">分享到微博</button>
```

### SEO优化
- 修改页面标题和描述
- 添加关键词meta标签
- 创建sitemap.xml

### 游戏评分
在 `index.html` 中添加评分系统：

```html
<div id="game-rating">
  <h3>为游戏评分</h3>
  <div class="stars">
    <span onclick="rateGame(1)">⭐</span>
    <span onclick="rateGame(2)">⭐</span>
    <span onclick="rateGame(3)">⭐</span>
    <span onclick="rateGame(4)">⭐</span>
    <span onclick="rateGame(5)">⭐</span>
  </div>
</div>
```

## 🎉 完成！

恭喜！您的钻石狂潮网页版游戏已经成功部署到GitHub Pages。

**游戏地址**: `https://您的用户名.github.io/DiamondFrenzy-Web/`

现在全世界的人都可以访问和游玩您的游戏了！

---

**技术支持**: 如有问题请查看 [DEPLOY.md](./DEPLOY.md) 或提交GitHub Issue