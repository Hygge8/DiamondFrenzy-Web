# 🚀 部署指南 - GitHub Pages

本项目是一个纯静态网站，最推荐的部署方式是使用 **GitHub Pages**。

## 步骤一：准备工作

1.  **克隆项目**：将项目克隆到本地。
    ```bash
    git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
    cd DiamondFrenzy-Web
    ```
2.  **推送至您的仓库**：如果您是在自己的仓库中进行部署，请确保代码已推送到 `main` 分支。
    ```bash
    git push origin main
    ```

## 步骤二：启用 GitHub Pages

1.  **进入设置**：在您的 GitHub 仓库页面，点击 **Settings**。
2.  **导航到 Pages**：在左侧菜单中选择 **Pages**。
3.  **配置部署源**：
    *   将 **Source** 设置为 **Deploy from a branch**。
    *   将 **Branch** 设置为 `main`，并选择 `/ (root)` 文件夹。
4.  **保存**：点击 **Save**。

## 步骤三：访问游戏

等待 GitHub Pages 部署完成（通常需要 1-5 分钟）。部署成功后，您可以通过以下地址访问游戏：

`https://<您的用户名>.github.io/DiamondFrenzy-Web/`

## 📁 项目结构

项目结构已简化，核心文件如下：

```
DiamondFrenzy-Web/
├── index.html              # 游戏主页面
├── README.md               # 项目说明
├── css/                    # 样式文件
├── js/                     # JavaScript 游戏逻辑代码
├── assets/                 # 游戏资源 (图片、音频等)
└── tests/                  # 单元测试文件
```

## ⚠️ 故障排除

*   **404 错误**：请检查 `index.html` 是否位于仓库根目录，并确保 GitHub Pages 的部署源分支和文件夹设置正确。
*   **游戏无法加载**：请使用浏览器开发者工具（F12）查看 **Console** 和 **Network** 标签页，检查是否有 JavaScript 错误或资源加载失败（404 错误）。

---

**部署成功，开始您的钻石狂潮之旅！🎉**
