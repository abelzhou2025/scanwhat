# ⚠️ GitHub Pages 部署的重要限制

## 🚨 关键问题：OCR 功能无法工作

### 问题原因

你的项目使用 **Netlify Functions** 来调用 OCR API，这样可以：
- ✅ 保护 API 密钥（不暴露在前端）
- ✅ 处理 CORS 问题
- ✅ 安全地调用后端 API

但是 **GitHub Pages 只支持静态文件**，无法运行：
- ❌ Netlify Functions
- ❌ 任何服务器端代码
- ❌ 后端 API

### 影响

如果部署到 GitHub Pages：
- ✅ UI 界面可以正常显示
- ✅ 图片上传功能可以工作
- ❌ **OCR 功能无法工作**（因为无法调用 Netlify Functions）

## 💡 解决方案

### 方案 1: 等待 Netlify 额度恢复（推荐）

- Netlify 每月有免费额度
- 等待额度恢复后可以正常使用所有功能
- 不需要修改代码

### 方案 2: 使用其他支持 Functions 的服务

#### Vercel（推荐）
- ✅ 免费，支持 Serverless Functions
- ✅ 类似 Netlify 的功能
- ✅ 可以快速迁移

#### Cloudflare Pages
- ✅ 免费，支持 Workers
- ✅ 性能好
- ✅ 需要一些配置

#### Railway
- ✅ 有免费额度
- ✅ 支持多种后端服务

### 方案 3: 创建代理服务（如果必须用 GitHub Pages）

如果一定要用 GitHub Pages，可以：

1. **创建一个简单的代理服务**（部署到 Vercel/Cloudflare Workers）
2. **修改 `services/geminiService.ts`** 调用代理服务
3. **在代理中调用 OCR API**（保护 API 密钥）

但这需要额外的部署和维护工作。

## 📋 GitHub Pages 部署步骤（如果只展示 UI）

如果你想先在 GitHub Pages 上展示 UI（OCR 功能暂时不可用）：

### 步骤 1: 启用 GitHub Pages

1. 访问: https://github.com/abelzhou2025/sacnwhat/settings/pages
2. Source: 选择 **GitHub Actions**
3. 保存

### 步骤 2: 配置已完成

我已经创建了：
- ✅ `.github/workflows/deploy-pages.yml` - 自动部署工作流
- ✅ `public/404.html` - SPA 路由处理
- ✅ `vite.config.ts` - 已配置 base path

### 步骤 3: 推送代码

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

### 步骤 4: 等待部署

- 在 GitHub 仓库的 **Actions** 标签查看部署状态
- 部署完成后，访问: `https://abelzhou2025.github.io/sacnwhat/`

## ⚙️ 配置说明

### Base Path 配置

在 `vite.config.ts` 中，我设置了：
```typescript
base: '/sacnwhat/',
```

如果你的仓库名不同，需要修改这个值。

### 如果仓库名是 `username.github.io`

如果你的仓库名是 `abelzhou2025.github.io`，需要改为：
```typescript
base: '/',
```

## 🎯 推荐方案

**最佳选择**: 等待 Netlify 额度恢复
- 不需要修改代码
- 所有功能都可以正常使用
- 最简单

**备选方案**: 迁移到 Vercel
- 免费且功能强大
- 支持 Serverless Functions
- 可以快速部署

**临时方案**: GitHub Pages（仅展示 UI）
- OCR 功能不可用
- 只能展示界面
- 适合演示 UI

## 📝 总结

- ✅ GitHub Pages **可以**部署静态网站
- ❌ GitHub Pages **不能**运行 Netlify Functions
- ⚠️ 如果部署到 GitHub Pages，OCR 功能**无法工作**
- 💡 建议等待 Netlify 额度恢复或使用 Vercel

