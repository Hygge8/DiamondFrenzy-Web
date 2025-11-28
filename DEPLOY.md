# Diamond Frenzy Web - GitHub Pages 部署配置

## 快速部署指南

### 方法一：使用GitHub Web界面 (推荐)

1. **创建新仓库**
   - 访问 [GitHub](https://github.com)
   - 点击 "New repository"
   - 仓库名: `DiamondFrenzy-Web`
   - 设置为 Public
   - 不勾选 "Add a README file" (我们已经有了)
   - 点击 "Create repository"

2. **上传文件**
   - 在仓库页面点击 "uploading an existing file"
   - 将 `diamond-frenzy-web` 目录中的所有文件拖拽到上传区域
   - 提交信息: "Initial commit: Diamond Frenzy Web game"
   - 点击 "Commit changes"

3. **启用GitHub Pages**
   - 进入仓库 Settings 页面
   - 滚动到 "Pages" 部分
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 
   - Folder 选择 "/ (root)"
   - 点击 "Save"

4. **访问游戏**
   - 等待2-3分钟部署完成
   - 访问: `https://你的用户名.github.io/DiamondFrenzy-Web/`

### 方法二：使用Git命令行

```bash
# 1. 克隆仓库
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web

# 2. 复制游戏文件 (如果需要)
# 将 diamond-frenzy-web/ 目录中的所有文件复制到仓库根目录

# 3. 提交代码
git add .
git commit -m "Initial commit: Diamond Frenzy Web game"
git push origin main

# 4. 启用GitHub Pages (通过Web界面)
```

## 项目结构

```
DiamondFrenzy-Web/
├── index.html              # 主游戏页面
├── README.md               # 项目说明
├── css/                    # 样式文件
├── js/                     # JavaScript代码
├── assets/                 # 游戏资源
│   ├── audio/              # 音频文件
│   ├── images/             # 图片资源
│   └── fonts/              # 字体文件
└── docs/                   # 文档
```

## 自定义域名 (可选)

如果您有自己的域名，可以在仓库根目录创建 `CNAME` 文件：

```
echo "your-domain.com" > CNAME
```

然后在域名提供商处添加CNAME记录指向 `你的用户名.github.io`。

## 故障排除

### 页面显示404错误
- 检查文件是否正确上传到仓库根目录
- 确认 `index.html` 文件存在
- 等待GitHub Pages部署完成 (通常需要2-5分钟)

### 游戏无法加载
- 检查浏览器控制台是否有错误信息
- 确认所有资源文件路径正确
- 尝试清除浏览器缓存

### 移动端显示异常
- 确认 `responsive.css` 文件存在
- 检查viewport meta标签是否正确设置

## 性能优化建议

1. **启用Gzip压缩**
   - GitHub Pages默认启用，无需额外配置

2. **使用CDN**
   - 可以考虑将静态资源迁移到CDN以提升加载速度

3. **图片优化**
   - 使用WebP格式可以进一步减少文件大小

## 更新游戏

要更新游戏，只需：

1. 修改本地文件
2. 重新上传到GitHub仓库
3. GitHub Pages会自动重新部署

---

**部署完成后，您的钻石狂潮游戏就可以在全世界访问了！🎉**