# 从 Workers 项目切换到 Pages 项目

## 🚨 当前问题

你的截图显示的是 **Workers 项目**的设置页面，特征：
- ❌ 标题显示 "Configure your Worker project"
- ❌ 有 "Deploy command" 字段（值为 `npx wrangler deploy`）
- ❌ 有 "Non-production branch deploy command" 字段
- ❌ **没有 "Build output directory" 字段**（这是 Pages 特有的）
- ❌ 有 "Path" 字段（Workers 特有）

## ✅ 解决方案

### 方法 1: 取消当前创建，重新选择 Pages（推荐）

1. **取消当前创建**
   - 点击页面上的 "Cancel" 或 "Back" 按钮
   - 或者关闭当前页面

2. **重新进入创建页面**
   - 在 Cloudflare Dashboard 中
   - 进入 **Workers & Pages**
   - 点击 **Create application**

3. **选择 Pages（不是 Workers）**
   - 在创建页面，应该能看到两个选项：
     - **Pages** - 用于静态网站和前端应用
     - **Workers** - 用于 API 和后端服务
   - **选择 "Pages"**

4. **连接 GitHub 仓库**
   - 选择 **"Continue with GitHub"**
   - 授权并选择仓库：`abelzhou2025/sacnwhat`

5. **配置 Pages 项目**
   - 在 Pages 项目的配置页面，你应该看到：
     - **Framework preset**: `Vite` 或 `None`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist` ← **这个字段在 Pages 中有！**
     - **Root directory**: `/` (留空)

### 方法 2: 检查是否在正确的页面

如果你不确定当前页面是 Workers 还是 Pages：

#### Workers 项目设置页面特征：
- ❌ 标题包含 "Worker"
- ❌ 有 "Deploy command" 字段
- ❌ 有 "Non-production branch deploy command" 字段
- ❌ 有 "Path" 字段
- ❌ **没有 "Build output directory" 字段**

#### Pages 项目设置页面特征：
- ✅ 标题包含 "Pages" 或 "Site"
- ✅ 有 "Build output directory" 字段（必须设置为 `dist`）
- ✅ 有 "Build command" 字段
- ✅ **没有 "Deploy command" 字段**（或字段可选）
- ✅ **没有 "Path" 字段**

### 方法 3: 如果已经创建了 Workers 项目

如果你已经创建了 Workers 项目：

1. **删除 Workers 项目**（可选）
   - 进入 Workers 项目
   - **Settings** → 滚动到底部
   - 点击 **Delete** 删除项目

2. **创建新的 Pages 项目**
   - 按照方法 1 的步骤创建 Pages 项目

## 📋 Pages 项目的正确配置

创建 Pages 项目时，配置页面应该显示：

```
项目类型: Pages
Repository: abelzhou2025/sacnwhat
Project name: scanwhat
Framework preset: Vite 或 None
Build command: npm run build
Build output directory: dist  ← 重要！这个字段必须在！
Root directory: / (留空)
Production branch: main
```

**注意**：Pages 项目通常**没有**以下字段：
- ❌ Deploy command（或字段可选）
- ❌ Non-production branch deploy command
- ❌ Path

## 🔍 如何找到 Pages 选项

### 在 Cloudflare Dashboard 中：

1. **进入 Workers & Pages**
   - 在左侧导航栏
   - 点击 **Workers & Pages**

2. **查看项目列表**
   - 应该能看到两个部分：
     - **Pages** - 你的 Pages 项目列表
     - **Workers** - 你的 Workers 项目列表

3. **创建新项目**
   - 点击 **Create application** 或 **Create**
   - 应该能看到选项：
     - **Pages** - 选择这个
     - **Workers** - 不要选择这个

### 如果看不到 Pages 选项：

1. **检查账户类型**
   - 确保你使用的是 Cloudflare 账户（不是 Workers 专用账户）
   - Pages 功能在大多数 Cloudflare 账户中都可用

2. **检查 URL**
   - Pages 项目 URL 应该类似：`https://dash.cloudflare.com/.../pages`
   - Workers 项目 URL 应该类似：`https://dash.cloudflare.com/.../workers`

## ✅ 验证修复

创建 Pages 项目后，你应该看到：

1. ✅ 设置页面标题包含 "Pages" 或 "Site"
2. ✅ 有 **"Build output directory"** 字段
3. ✅ 可以设置为 `dist`
4. ✅ **没有** "Deploy command" 字段（或字段可选）
5. ✅ **没有** "Path" 字段

## 🔑 环境变量设置

创建 Pages 项目后，设置环境变量：

1. 进入项目 → **Settings** → **Environment variables**
2. 点击 **"Add variable"**
3. 添加：
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: 你的 Google Gemini API 密钥
   - **Environment**: 选择 **Production** 和 **Preview**
4. 点击 **Save**
5. **重要**：环境变量更改后需要重新部署才能生效

## 📝 重要提示

- **Workers** 和 **Pages** 是完全不同的产品
- 你的项目需要 **Pages**（因为需要部署静态网站）
- 如果误创建为 Workers 项目，需要重新创建为 Pages 项目
- Pages 项目会自动获得 `.pages.dev` 域名
- Pages 项目有 "Build output directory" 字段，Workers 没有

## 🐛 如果仍然看不到 Pages 选项

1. **检查账户权限**
   - 确保你的账户有 Pages 访问权限
   - 免费账户通常都支持 Pages

2. **尝试直接访问**
   - 访问：`https://dash.cloudflare.com/workers/pages`
   - 或者：`https://dash.cloudflare.com/pages`

3. **联系 Cloudflare 支持**
   - 如果确实看不到 Pages 选项，可能需要联系支持

