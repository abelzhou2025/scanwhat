# Cloudflare Pages 必填字段修复

## 🚨 问题

如果 Cloudflare Pages 的 **Deploy command** 字段显示 **"Required"**（必填），系统要求必须填写，不能留空。

## ✅ 解决方案

### 如果 Deploy command 显示 "Required"（必填）

**重要**：由于 Cloudflare Pages 会自动部署 `dist/` 目录，Deploy command 应该使用占位符命令，而不是实际部署命令。

填写以下命令之一：

**选项 1（推荐）**：
```
echo "Deployment handled by Cloudflare Pages"
```

**选项 2**：
```
true
```

**完整步骤**：
1. 点击 **Deploy command** 输入框
2. 删除当前内容（`npx wrangler pages deploy dist` 或 `/`）
3. 输入：`echo "Deployment handled by Cloudflare Pages"`
4. 保存设置

**为什么不用 `wrangler pages deploy`？**
- 该命令需要 API token 认证和权限
- Cloudflare Pages 会自动检测并部署 `dist/` 目录
- 使用占位符命令可以满足必填要求，同时让系统自动处理部署

### Version command 字段

#### 如果字段可选（没有 "Required" 标记）
- **留空**，不要填写任何内容

#### 如果字段必填（显示 "Required"）
- 填写：`echo "Skipping version upload"`
- 或者：`true`（一个总是成功的命令）

## 📋 完整配置示例

### 场景 1: Deploy command 必填，Version command 可选

```
Build command: npm run build
Deploy command: echo "Deployment handled by Cloudflare Pages"
Version command: (留空)
Root directory: /
Build output directory: dist
```

### 场景 2: 两个字段都必填

```
Build command: npm run build
Deploy command: echo "Deployment handled by Cloudflare Pages"
Version command: echo "Skipping version upload"
Root directory: /
Build output directory: dist
```

## 🔍 命令说明

### `echo "Deployment handled by Cloudflare Pages"`
- **作用**: 占位符命令，用于满足必填要求
- **为什么**: 
  - Cloudflare Pages 会自动检测 `dist/` 目录并自动部署
  - 不需要手动运行 `wrangler pages deploy`（需要 API token 权限）
  - 这个命令总是成功，满足必填要求，同时让系统自动处理部署

### `true`
- **作用**: 另一个占位符选项，总是返回成功
- **为什么**: 如果 `echo` 命令有问题，可以使用 `true`

### `echo "Skipping version upload"`
- **作用**: 占位符命令，用于满足 Version command 必填要求
- **为什么**: Version command 是用于 Workers 的，Pages 不需要，但系统要求必填时使用此占位符

### ⚠️ 为什么不使用 `npx wrangler pages deploy dist`？
- 该命令需要 `CLOUDFLARE_API_TOKEN` 环境变量
- 需要 API token 有正确的权限（Pages:Edit）
- 在构建环境中可能没有配置或权限不足
- Cloudflare Pages 会自动部署，不需要手动命令

## ⚠️ 重要提示

1. **不要使用** `npx wrangler deploy`（这是 Workers 的命令）
2. **使用** `npx wrangler pages deploy dist`（这是 Pages 的命令）
3. **确保** Build output directory 设置为 `dist`
4. **确保** 环境变量已设置（`GEMINI_API_KEY`）

## 🧪 验证部署

部署成功后：
1. ✅ Build 成功（`npm run build`）
2. ✅ Deploy 成功（`npx wrangler pages deploy dist`）
3. ✅ 网站可访问（`.pages.dev` 域名）
4. ✅ API 路由工作（`/api/ocr`）

## 🔑 环境变量设置

别忘了设置环境变量：

1. **Settings** → **Environment variables**
2. 添加 `GEMINI_API_KEY`
3. 选择环境（Production 和 Preview）
4. 保存后**重新部署**才能生效

## 📝 为什么需要这个命令？

- **自动部署**（推荐）：Cloudflare 自动检测 `dist/` 并部署
- **手动部署**（当系统要求时）：使用 `npx wrangler pages deploy dist` 命令

如果系统强制要求填写 Deploy command，使用手动部署命令是正确的方式。

