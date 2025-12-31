# 🔧 Vercel API 错误修复指南

## 可能的问题和解决方案

### 问题 1: 缺少 @vercel/node 依赖

**症状**: API 函数无法运行，TypeScript 类型错误

**解决**: 我已经在 `package.json` 中添加了 `@vercel/node` 依赖

### 问题 2: 平台检测逻辑

**症状**: API 调用到错误的端点

**解决**: 我已经改进了平台检测逻辑，更准确地识别 Vercel 和 Netlify

### 问题 3: 环境变量未设置

**症状**: API 返回 "API key not configured"

**解决步骤**:
1. 在 Vercel Dashboard 中
2. 进入项目 → **Settings** → **Environment Variables**
3. 添加:
   - **Name**: `DEEPSEEK_API_KEY` (或 `GEMINI_API_KEY`)
   - **Value**: 你的 API 密钥
   - **Environment**: 选择所有环境
4. 保存后，**重新部署**项目

### 问题 4: CORS 错误

**症状**: 浏览器 Console 显示 CORS 错误

**解决**: API 函数已经配置了 CORS headers，如果还有问题，检查 `vercel.json` 配置

## 🔍 如何查看 API 错误日志

### 在 Vercel Dashboard 中:

1. 进入项目
2. 点击 **"Functions"** 标签
3. 找到 `/api/ocr` 函数
4. 点击查看日志
5. 查看错误信息

### 在浏览器中:

1. 打开开发者工具 (F12)
2. **Console** 标签 - 查看 JavaScript 错误
3. **Network** 标签 - 查看 API 请求详情
   - 点击 `/api/ocr` 请求
   - 查看 **Response** 和 **Headers**

## 🧪 测试 API

### 方法 1: 在浏览器 Console 中测试

```javascript
fetch('/api/ocr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    base64Image: 'test',
    mimeType: 'image/jpeg'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### 方法 2: 使用 curl

```bash
curl -X POST https://your-site.vercel.app/api/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "test",
    "mimeType": "image/jpeg"
  }'
```

## 📋 检查清单

- [ ] `@vercel/node` 依赖已添加
- [ ] 环境变量已设置（`DEEPSEEK_API_KEY` 或 `GEMINI_API_KEY`）
- [ ] 代码已推送并重新部署
- [ ] 查看 Functions 日志确认错误
- [ ] 检查浏览器 Console 和 Network 标签

## 🐛 常见错误

### 错误 1: "API key not configured"

**原因**: 环境变量未设置或未重新部署

**解决**: 
1. 在 Vercel 中设置环境变量
2. 重新部署项目

### 错误 2: "Module not found: @vercel/node"

**原因**: 依赖未安装

**解决**: 代码已更新，推送后会自动安装

### 错误 3: CORS 错误

**原因**: CORS headers 配置问题

**解决**: API 函数已配置 CORS，检查 `vercel.json` 中的 headers 配置

### 错误 4: 404 Not Found

**原因**: API 路由路径错误

**解决**: 确认使用 `/api/ocr` 路径（不是 `/.netlify/functions/ocr`）

## 🔄 重新部署

修复后，需要重新部署：

1. **自动部署**: 推送代码到 GitHub，Vercel 会自动部署
2. **手动部署**: 在 Vercel Dashboard → Deployments → Redeploy

## 📝 下一步

1. ✅ 检查环境变量是否设置
2. ✅ 查看 Functions 日志
3. ✅ 测试 API 调用
4. ✅ 如果还有问题，告诉我具体的错误信息

