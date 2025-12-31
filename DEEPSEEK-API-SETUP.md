# 🔐 DeepSeek API 密钥设置指南

## ✅ 关于 "sk-" 前缀

**是的，DeepSeek API 密钥需要包含 "sk-" 前缀！**

- ✅ **正确格式**: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ❌ **错误格式**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（缺少前缀）

## 📋 在 Vercel 中设置 DeepSeek API 密钥

### 步骤 1: 获取完整的 API 密钥

从 DeepSeek 控制台复制 API 密钥时，确保包含完整的密钥，包括 "sk-" 前缀。

例如：
```
sk-1234567890abcdef1234567890abcdef
```

### 步骤 2: 在 Vercel 中设置

1. 登录 Vercel Dashboard
2. 进入你的项目
3. **Settings** → **Environment Variables**
4. 添加环境变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-你的完整密钥`（包括 sk- 前缀）
   - **Environment**: 选择所有（Production, Preview, Development）
5. 点击 **Save**

### 步骤 3: 重新部署

⚠️ **重要**: 环境变量修改后必须重新部署！

1. **Deployments** → 找到最新部署
2. 点击 **"..."** → **"Redeploy"**
3. 等待部署完成

## 🔧 已更新的代码

我已经更新了 `api/ocr.ts` 来支持 DeepSeek API：

1. ✅ 自动检测使用 DeepSeek 还是 Gemini API
2. ✅ 如果设置了 `DEEPSEEK_API_KEY`，使用 DeepSeek API
3. ✅ 如果只设置了 `GEMINI_API_KEY`，使用 Gemini API
4. ✅ DeepSeek API 使用 Bearer token 认证（包含 sk- 前缀）

## 📝 验证设置

### 检查环境变量

在 Vercel Functions 日志中，你应该看到：
```
Environment check: {
  hasDEEPSEEK: true,
  hasGEMINI: false,
  hasApiKey: true,
  usingDeepSeek: true
}
```

### 测试 API

上传图片并提取文本，应该可以正常工作。

## ⚠️ 注意事项

1. **密钥格式**: 确保包含完整的 "sk-" 前缀
2. **没有空格**: 复制时注意不要包含多余空格
3. **重新部署**: 修改环境变量后必须重新部署
4. **API 端点**: 代码已更新为使用 DeepSeek API 端点

## 🐛 如果仍然报错

### 检查清单

- [ ] API 密钥包含 "sk-" 前缀
- [ ] 密钥完整（没有截断）
- [ ] 没有多余空格
- [ ] 环境变量名称是 `DEEPSEEK_API_KEY`
- [ ] 已重新部署项目
- [ ] 等待部署完成

### 查看日志

在 Vercel Dashboard → Functions → `/api/ocr` → 查看日志，确认：
- 环境变量是否正确加载
- API 调用是否成功
- 具体的错误信息

## 💡 提示

- DeepSeek API 密钥格式: `sk-` + 32 个字符（通常）
- 如果密钥以 "sk-" 开头，直接使用完整密钥
- 如果不确定，查看 DeepSeek 控制台中的密钥格式

