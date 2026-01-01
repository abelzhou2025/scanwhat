# Cloudflare Pages URL 禁用问题修复

## 🚨 问题

截图显示：
- "No URLs enabled Automatic deployment on upload."
- "workers.dev Disabled"
- "Preview URLs Disabled"

这表明项目可能被创建为 **Workers** 项目而不是 **Pages** 项目，或者 Pages URL 功能被禁用了。

## ✅ 解决方案

### 方法 1: 检查项目类型并转换为 Pages

1. **进入 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 进入 **Workers & Pages**

2. **检查项目类型**
   - 如果项目显示在 "Workers" 下，需要创建新的 Pages 项目
   - 如果项目显示在 "Pages" 下，继续下一步

3. **创建新的 Pages 项目**（如果当前是 Workers 项目）
   - 点击 **Create application** → **Pages** → **Connect to Git**
   - 选择你的 GitHub 仓库：`abelzhou2025/sacnwhat`
   - 配置构建设置：
     - **Framework preset**: `Vite` 或 `None`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `/` (留空)
     - **Deploy command**: `echo "Deployment handled by Cloudflare Pages"`
     - **Version command**: (留空)

4. **启用 Pages URL**
   - 进入项目 → **Settings** → **Domains & routes**
   - 确保 **Pages URL** 已启用
   - 如果没有 `.pages.dev` 域名，系统会自动分配一个

### 方法 2: 在现有项目中启用 Pages URL

1. **进入项目设置**
   - 进入你的 `scanwhat` 项目
   - 点击 **Settings** 标签

2. **检查项目类型**
   - 查看项目设置，确认是 **Pages** 项目
   - 如果显示为 Workers 项目，需要重新创建为 Pages 项目

3. **启用 URL**
   - 进入 **Settings** → **Domains & routes**
   - 找到 **Pages URL** 部分
   - 如果显示 "Disabled"，点击启用
   - 系统会自动分配一个 `.pages.dev` 域名

### 方法 3: 删除并重新创建 Pages 项目（推荐）

如果当前项目确实是 Workers 项目，最好删除它并创建新的 Pages 项目：

1. **删除当前项目**（可选）
   - 进入项目 → **Settings** → 滚动到底部
   - 点击 **Delete project**（如果不需要保留）

2. **创建新的 Pages 项目**
   - 进入 **Workers & Pages** → **Create application**
   - 选择 **Pages**（不是 Workers）
   - 选择 **Connect to Git**
   - 选择仓库：`abelzhou2025/sacnwhat`
   - 配置构建设置（见方法 1）

3. **验证**
   - 创建后，应该自动获得一个 `.pages.dev` 域名
   - 例如：`scanwhat-xxxxx.pages.dev`

## 🔍 如何区分 Workers 和 Pages 项目？

### Workers 项目特征：
- URL 格式：`project-name.account-name.workers.dev`
- 主要用于 API/后端功能
- 需要编写 Worker 脚本

### Pages 项目特征：
- URL 格式：`project-name.pages.dev`
- 用于静态网站 + Functions
- 自动部署 Git 仓库
- 支持 `functions/` 目录中的 Pages Functions

## 📋 正确的 Pages 项目配置

创建 Pages 项目时，确保：

```
项目类型: Pages (不是 Workers)
Git 仓库: abelzhou2025/sacnwhat
Framework preset: Vite 或 None
Build command: npm run build
Build output directory: dist
Root directory: /
Deploy command: echo "Deployment handled by Cloudflare Pages"
Version command: (留空)
```

## ✅ 验证修复

修复后，你应该看到：

1. ✅ 项目类型显示为 **Pages**
2. ✅ 有一个 `.pages.dev` 域名（例如：`scanwhat-xxxxx.pages.dev`）
3. ✅ "No URLs enabled" 消息消失
4. ✅ 可以访问网站
5. ✅ API 路由 `/api/ocr` 工作

## 🔑 环境变量设置

创建 Pages 项目后，别忘了设置环境变量：

1. 进入项目 → **Settings** → **Environment variables**
2. 添加 `GEMINI_API_KEY`
3. 选择环境（Production 和 Preview）
4. 保存后重新部署

## 📝 注意事项

- **Workers** 和 **Pages** 是不同的产品
- 你的项目需要 **Pages**（因为需要部署静态网站 + Functions）
- 如果误创建为 Workers 项目，需要重新创建为 Pages 项目
- Pages 项目会自动获得 `.pages.dev` 域名

