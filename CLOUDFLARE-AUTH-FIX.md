# Cloudflare Pages 认证错误修复

## 🚨 当前错误

```
✘ [ERROR] A request to the Cloudflare API failed.
Authentication error [code: 10000]
```

## 问题原因

你使用了 `npx wrangler pages deploy dist` 作为 Deploy command，但这个命令需要：
1. `CLOUDFLARE_API_TOKEN` 环境变量
2. API token 需要有 `Pages:Edit` 权限
3. 在构建环境中可能没有正确配置

## ✅ 解决方案

**关键点**：Cloudflare Pages 会自动检测并部署 `dist/` 目录，**不需要**手动运行 `wrangler pages deploy`。

### 修复步骤

1. 进入 Cloudflare Dashboard
2. 进入你的 Pages 项目 → **Settings** → **Builds & deployments**
3. 修改 **Deploy command** 字段：

**从**：
```
npx wrangler pages deploy dist
```

**改为**：
```
echo "Deployment handled by Cloudflare Pages"
```

或者使用：
```
true
```

4. 保存设置
5. 重新部署

## 📋 完整配置

```
Build command: npm run build
Deploy command: echo "Deployment handled by Cloudflare Pages"
Version command: (留空或 echo "Skipping version upload")
Root directory: /
Build output directory: dist
```

## 🔍 为什么这样修复？

### Cloudflare Pages 的自动部署流程

1. **构建阶段**：运行 `npm run build` → 生成 `dist/` 目录
2. **自动检测**：Cloudflare 自动检测 `dist/` 目录
3. **自动部署**：Cloudflare 自动部署静态文件和 Functions
4. **完成**：网站可访问

**不需要**手动运行 `wrangler pages deploy`！

### 为什么 Deploy command 是必填的？

- 可能是 Cloudflare Pages 的 UI 要求
- 但实际部署是自动的
- 使用占位符命令可以满足必填要求，同时让系统自动处理

## ⚠️ 如果确实需要手动部署

如果你确实需要手动部署（不推荐），需要：

1. **创建 API Token**：
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 创建自定义 token
   - 权限：`Account` → `Cloudflare Pages` → `Edit`

2. **在 Cloudflare Pages 项目设置中添加环境变量**：
   - `CLOUDFLARE_API_TOKEN`: 你的 API token

3. **使用部署命令**：
   ```
   npx wrangler pages deploy dist --project-name=scanwhat
   ```

**但这不是必需的！** Cloudflare Pages 会自动处理部署。

## ✅ 推荐方案

使用占位符命令，让 Cloudflare Pages 自动部署：

```
Deploy command: echo "Deployment handled by Cloudflare Pages"
```

这样：
- ✅ 满足必填要求
- ✅ 不需要 API token
- ✅ 不需要额外权限
- ✅ Cloudflare 自动处理部署
- ✅ 简单可靠

## 🧪 验证

修复后，部署应该：
1. ✅ 构建成功（`npm run build`）
2. ✅ Deploy command 执行成功（占位符命令）
3. ✅ Cloudflare 自动部署 `dist/` 目录
4. ✅ 网站可访问（`.pages.dev` 域名）
5. ✅ API 路由工作（`/api/ocr`）

