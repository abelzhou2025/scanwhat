# 🚀 Vercel 部署完整指南

## ✅ Vercel 的优势

- ✅ **免费** - 有充足的免费额度
- ✅ **支持 Serverless Functions** - 可以运行后端代码
- ✅ **自动部署** - 连接 GitHub 后自动部署
- ✅ **快速** - 全球 CDN 加速
- ✅ **简单** - 配置简单，易于使用

## 📋 部署步骤

### 步骤 1: 创建 Vercel 账号

1. 访问: https://vercel.com
2. 点击 **"Sign Up"**
3. 选择 **"Continue with GitHub"**（推荐，方便连接仓库）

### 步骤 2: 导入项目

1. 登录 Vercel Dashboard
2. 点击 **"Add New..."** → **"Project"**
3. 选择 **"Import Git Repository"**
4. 找到并选择 `sacnwhat` 仓库
5. 点击 **"Import"**

### 步骤 3: 配置项目

Vercel 会自动检测配置，但请确认：

**Framework Preset**: Vite (应该自动检测)

**Root Directory**: `./` (项目根目录)

**Build Command**: `npm run build` (应该自动填充)

**Output Directory**: `dist` (应该自动填充)

**Install Command**: `npm install` (应该自动填充)

### 步骤 4: 设置环境变量

在项目配置页面，找到 **"Environment Variables"**：

添加以下环境变量：

1. **DEEPSEEK_API_KEY** (或 GEMINI_API_KEY)
   - Value: 你的 API 密钥
   - Environment: Production, Preview, Development (全部勾选)

2. (可选) **NODE_ENV**
   - Value: `production`
   - Environment: Production

### 步骤 5: 部署

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（通常 1-3 分钟）
3. 部署成功后，会显示你的网站 URL

## 🔧 已创建的配置文件

我已经创建了以下文件来支持 Vercel：

### 1. `vercel.json` - Vercel 配置
- 构建和部署设置
- 路由重写规则（SPA 支持）
- CORS 配置

### 2. `api/ocr.ts` - Vercel Serverless Function
- OCR API 处理函数
- 替代 Netlify Functions
- 保护 API 密钥

### 3. 更新了 `services/geminiService.ts`
- 自动检测平台（Vercel 或 Netlify）
- 使用正确的 API 路径

## 🌐 部署后的 URL

部署成功后，你会得到：
- **生产环境**: `https://your-project-name.vercel.app`
- **预览环境**: 每次推送会创建新的预览 URL

## 🔄 自动部署

连接 GitHub 后，Vercel 会：
- ✅ 每次推送到 `main` 分支自动部署生产环境
- ✅ 每次创建 Pull Request 自动创建预览环境
- ✅ 自动运行构建和测试

## 📝 验证部署

部署完成后，测试：

1. **访问网站**
   - 打开 Vercel 提供的 URL
   - 应该可以正常显示

2. **测试 OCR 功能**
   - 上传一张图片
   - 点击 "Extract Text"
   - 应该可以正常提取文本

3. **检查 Functions**
   - 在 Vercel Dashboard → Functions
   - 查看 `/api/ocr` 函数的日志

## 🐛 常见问题

### 问题 1: 构建失败

**检查**:
- 查看构建日志
- 确认 Node.js 版本（Vercel 自动使用 18+）
- 确认所有依赖都安装了

### 问题 2: OCR 功能不工作

**检查**:
- 环境变量是否设置正确
- Functions 日志是否有错误
- API 密钥是否有效

### 问题 3: 404 错误

**检查**:
- `vercel.json` 中的 rewrites 配置
- 路由是否正确

## 🔐 环境变量设置

在 Vercel Dashboard 中：

1. 进入项目
2. **Settings** → **Environment Variables**
3. 添加变量：
   - **Key**: `DEEPSEEK_API_KEY`
   - **Value**: 你的 API 密钥
   - **Environment**: 选择所有环境（Production, Preview, Development）

## 📊 Vercel vs Netlify

| 功能 | Vercel | Netlify |
|------|--------|---------|
| 免费额度 | ✅ 充足 | ✅ 有限 |
| Serverless Functions | ✅ 支持 | ✅ 支持 |
| 自动部署 | ✅ 是 | ✅ 是 |
| 配置复杂度 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| 性能 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 很好 |

## 🎯 下一步

1. ✅ 创建 Vercel 账号
2. ✅ 导入 GitHub 仓库
3. ✅ 设置环境变量
4. ✅ 部署
5. ✅ 测试功能

## 💡 提示

- Vercel 的免费额度很充足，通常足够使用
- 每次代码推送都会自动部署
- 可以在 Vercel Dashboard 中查看详细的日志和指标
- 支持自定义域名（免费）

## 📚 相关文档

- Vercel 文档: https://vercel.com/docs
- Vercel Functions: https://vercel.com/docs/functions
- 环境变量: https://vercel.com/docs/environment-variables

