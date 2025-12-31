# 📄 GitHub Pages 部署指南

## ⚠️ 重要限制

### GitHub Pages 的限制

1. **不支持 Netlify Functions**
   - GitHub Pages 只能托管静态文件
   - OCR API 调用需要后端（Netlify Functions）
   - **解决方案**: 需要将 OCR API 调用改为直接调用外部 API（不推荐，会暴露 API 密钥）

2. **需要配置 base path**
   - 如果仓库名不是 `username.github.io`，URL 会是 `username.github.io/repo-name/`
   - 需要配置 Vite 的 `base` 选项

3. **SPA 路由问题**
   - 需要配置 404.html 来处理路由

## 🚀 部署步骤

### 步骤 1: 启用 GitHub Pages

1. 访问你的仓库: https://github.com/abelzhou2025/sacnwhat
2. 点击 **Settings** → **Pages**
3. 在 **Source** 中选择:
   - **GitHub Actions** (推荐)
   - 或 **Deploy from a branch** → 选择 `main` 分支和 `/dist` 目录

### 步骤 2: 配置 Vite（如果仓库名不是 username.github.io）

如果你的仓库 URL 是 `username.github.io/repo-name/`，需要更新 `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/sacnwhat/',  // 改为你的仓库名
  // ... 其他配置
});
```

### 步骤 3: 处理 SPA 路由

创建 `public/404.html` 文件（GitHub Pages 会使用它处理 404）：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ScanWhat</title>
    <script>
      // 重定向到 index.html
      sessionStorage.redirect = location.href;
      location.replace(location.pathname.split('/').slice(0, -1).join('/') + '/index.html');
    </script>
  </head>
  <body></body>
</html>
```

### 步骤 4: 修改 OCR 服务（重要！）

由于 GitHub Pages 不支持 Functions，需要修改 `services/geminiService.ts`:

**选项 A: 使用代理服务**（推荐）
- 创建一个简单的代理服务（可以用 Vercel、Cloudflare Workers 等）
- 在代理中调用 OCR API

**选项 B: 直接调用 API**（不推荐，会暴露密钥）
- 修改代码直接调用 API
- ⚠️ 这会暴露你的 API 密钥，不安全

## 📝 已创建的 GitHub Actions 工作流

我已经创建了 `.github/workflows/deploy-pages.yml`，它会：
- 自动构建项目
- 部署到 GitHub Pages
- 在每次推送到 `main` 分支时自动更新

## ⚙️ 配置说明

### 如果仓库名是 `username.github.io`

- URL: `https://username.github.io`
- `vite.config.ts` 中 `base: '/'`

### 如果仓库名是其他名称（如 `sacnwhat`）

- URL: `https://username.github.io/sacnwhat/`
- `vite.config.ts` 中 `base: '/sacnwhat/'`

## 🔧 完整配置步骤

1. **更新 `vite.config.ts`**:
   ```typescript
   base: '/sacnwhat/',  // 根据你的仓库名调整
   ```

2. **创建 `public/404.html`**（处理 SPA 路由）

3. **修改 OCR 服务**（因为不能使用 Netlify Functions）

4. **启用 GitHub Pages**:
   - Settings → Pages → Source: GitHub Actions

5. **推送代码**:
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push
   ```

6. **等待部署完成**:
   - 在 Actions 标签中查看部署状态
   - 通常需要 1-2 分钟

## ⚠️ OCR 功能的限制

**重要**: GitHub Pages 无法运行 Netlify Functions，所以 OCR 功能需要：

1. **使用代理服务**（推荐）:
   - 部署一个简单的代理到 Vercel/Cloudflare Workers
   - 在代理中调用 OCR API
   - 前端调用代理服务

2. **或者暂时禁用 OCR 功能**:
   - 只展示 UI
   - 等 Netlify 额度恢复后再使用完整功能

## 🎯 推荐方案

由于你的项目需要 OCR API（后端功能），建议：

1. **等待 Netlify 额度恢复**（每月有免费额度）
2. **或使用其他支持 Functions 的服务**:
   - Vercel（免费，支持 Serverless Functions）
   - Cloudflare Pages（免费，支持 Workers）
   - Railway（有免费额度）

## 📋 检查清单

- [ ] 更新 `vite.config.ts` 的 `base` 路径
- [ ] 创建 `public/404.html` 处理路由
- [ ] 修改 OCR 服务（或使用代理）
- [ ] 启用 GitHub Pages
- [ ] 推送代码并等待部署
- [ ] 测试网站功能

