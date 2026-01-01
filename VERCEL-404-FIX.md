# Vercel API 404 错误修复

## 🚨 当前问题

从控制台错误可以看到：
1. `/api/ocr:1 Failed to load resource: the server responded with a status of 404 ()`
2. `Error: models/gemini-pro is not found for API version v1`

## ✅ 解决方案

### 问题 1: API 返回 404

**原因**：Vercel 可能还没有重新部署新代码，或者路由配置有问题。

**解决步骤**：

1. **检查 Vercel 部署状态**
   - 进入 Vercel Dashboard
   - 查看 **Deployments** 标签
   - 确认最新的部署是否成功
   - 确认部署时间是否在代码推送之后

2. **手动触发重新部署**
   - Vercel Dashboard → **Deployments**
   - 找到最新部署，点击 **"..."** → **"Redeploy"**
   - 或者推送一个新的提交：
     ```bash
     git commit --allow-empty -m "Trigger redeploy"
     git push
     ```

3. **检查 API 路由文件**
   - 确认 `api/ocr.ts` 文件存在
   - 确认文件在项目根目录的 `api/` 文件夹中
   - 确认文件导出格式正确

### 问题 2: 仍然使用 v1 API

**原因**：代码可能还在使用旧版本，或者缓存问题。

**解决**：
- 代码已更新，只使用 `v1beta` API
- 等待 Vercel 重新部署
- 清除浏览器缓存

## 🔍 验证步骤

### 1. 检查部署状态

1. Vercel Dashboard → **Deployments**
2. 查看最新部署：
   - ✅ 状态应该是 "Ready"
   - ✅ 部署时间应该是最新的
   - ✅ 点击部署查看构建日志，确认没有错误

### 2. 检查 Functions

1. Vercel Dashboard → **Functions**
2. 应该能看到 `/api/ocr` 函数
3. 如果看不到，说明部署有问题

### 3. 测试 API 端点

在浏览器 Console 中运行：

```javascript
fetch('/api/ocr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    base64Image: 'test',
    mimeType: 'image/jpeg'
  })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(console.log)
.catch(console.error)
```

**预期结果**：
- 如果 API 路由正确：返回错误信息（因为 base64Image 无效）
- 如果返回 404：说明路由不存在，需要重新部署

## 📋 完整检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 已检测到新提交
- [ ] Vercel 部署成功（状态为 "Ready"）
- [ ] Functions 中能看到 `/api/ocr`
- [ ] 环境变量 `GEMINI_API_KEY` 已设置
- [ ] 清除浏览器缓存
- [ ] 测试 API 端点

## 🐛 如果仍然返回 404

### 方法 1: 检查文件结构

确认项目结构：
```
scanwhat/
├── api/
│   └── ocr.ts  ← 这个文件必须存在
├── package.json
└── ...
```

### 方法 2: 检查 Vercel 配置

确认 `vercel.json` 配置正确（如果有的话）。

### 方法 3: 查看构建日志

1. Vercel Dashboard → **Deployments** → 点击最新部署
2. 查看构建日志
3. 确认 `api/ocr.ts` 被正确识别

### 方法 4: 重新连接 GitHub

如果问题持续：
1. Vercel Dashboard → **Settings** → **Git**
2. 断开并重新连接 GitHub 仓库
3. 重新部署

## 💡 快速修复

最快的修复方法：

1. **推送一个空提交触发重新部署**：
   ```bash
   git commit --allow-empty -m "Fix: Trigger Vercel redeploy"
   git push
   ```

2. **在 Vercel Dashboard 手动重新部署**：
   - Deployments → 最新部署 → "..." → "Redeploy"

3. **等待部署完成**（通常 1-2 分钟）

4. **清除浏览器缓存并刷新页面**

## ✅ 验证修复

修复后，你应该能够：

1. ✅ API 端点 `/api/ocr` 返回 200 或 400（不是 404）
2. ✅ 上传图片后能成功提取文字
3. ✅ 没有 "models/gemini-pro is not found for API version v1" 错误
4. ✅ Functions 日志显示使用 `v1beta` API

