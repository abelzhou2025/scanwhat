# Cloudflare Pages 部署错误修复

## 错误信息

```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

## 问题原因

这个错误通常是因为在 Cloudflare Pages 项目设置中配置了自定义部署命令（Deploy command）`npx wrangler deploy`，但 `wrangler deploy` 是用于 Cloudflare Workers 的，不是用于 Pages 的。

## 解决方案

### 方法 1：移除自定义部署命令（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的 Pages 项目
3. 进入 **Settings** → **Builds & deployments**
4. **删除或清空 "Deploy command" 字段**（留空）
5. 确保以下设置正确：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (留空或 `/`)
6. 保存设置
7. 重新部署项目

### 方法 2：使用正确的 Pages 部署命令（如果需要自定义）

如果你确实需要使用自定义部署命令，应该使用：

```bash
npx wrangler pages deploy dist --project-name=scanwhat
```

而不是 `npx wrangler deploy`。

## Cloudflare Pages 标准流程

Cloudflare Pages 的标准部署流程是：

1. **自动检测 Git 提交** → 触发构建
2. **运行构建命令** (`npm run build`) → 生成 `dist/` 目录
3. **自动部署** → 不需要自定义部署命令
4. **自动识别 Functions** → 从 `functions/` 目录加载 Pages Functions

## 验证配置

确保你的 Cloudflare Pages 项目设置如下：

```
Framework preset: Vite (或 None)
Build command: npm run build
Build output directory: dist
Root directory: / (留空)
Deploy command: (留空，不要设置)
```

## 环境变量设置

在 Cloudflare Pages 项目设置中：

1. 进入 **Settings** → **Environment variables**
2. 添加 `GEMINI_API_KEY` 或 `DEEPSEEK_API_KEY`
3. 选择环境（Production, Preview, 或 Both）
4. 保存后需要重新部署才能生效

## 测试部署

部署完成后，测试 API 路由：

```bash
curl -X POST https://your-project.pages.dev/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"base64Image":"...","mimeType":"image/jpeg"}'
```

## 如果问题仍然存在

1. 检查构建日志，确认 `dist/` 目录已生成
2. 检查 Functions 日志，确认 `functions/api/ocr.ts` 被识别
3. 查看 Cloudflare Pages 的 Functions 标签页，确认函数已部署

