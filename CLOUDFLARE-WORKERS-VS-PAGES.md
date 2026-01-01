# Cloudflare Workers vs Pages - 重要区别

## 🚨 当前问题

你的截图显示的是 **Workers** 的设置页面，而不是 **Pages** 的设置页面。

### Workers 设置页面特征：
- ❌ 没有 "Build output directory" 字段
- ❌ 有 "Deploy command"、"Version command" 等字段
- ❌ 标题显示 "Worker"
- ❌ URL 格式：`project-name.account-name.workers.dev`

### Pages 设置页面特征：
- ✅ 有 "Build output directory" 字段（必须设置为 `dist`）
- ✅ 有 "Build command" 字段
- ✅ 标题显示 "Pages"
- ✅ URL 格式：`project-name.pages.dev`

## ✅ 解决方案

### 方法 1: 创建新的 Pages 项目（推荐）

你的项目需要 **Pages**，而不是 **Workers**。

#### 步骤 1: 创建新的 Pages 项目

1. **进入 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 进入 **Workers & Pages**

2. **创建 Pages 项目**
   - 点击 **Create application**
   - **重要**：选择 **Pages**（不是 Workers）
   - 选择 **Connect to Git**
   - 选择你的 GitHub 仓库：`abelzhou2025/sacnwhat`

3. **配置构建设置**
   
   在 Pages 项目设置中，你应该看到：
   
   ```
   Framework preset: Vite 或 None
   Build command: npm run build
   Build output directory: dist  ← 这个字段在 Pages 中有！
   Root directory: /
   ```

   **注意**：Pages 项目**没有** "Deploy command" 和 "Version command" 字段（或这些字段是可选的）

4. **保存并部署**
   - 点击 **Save and Deploy**
   - 系统会自动分配一个 `.pages.dev` 域名

#### 步骤 2: 删除旧的 Workers 项目（可选）

如果你不再需要 Workers 项目：

1. 进入旧的 Workers 项目
2. 进入 **Settings** → 滚动到底部
3. 点击 **Delete** 删除项目

### 方法 2: 检查当前项目类型

如果你不确定当前项目是 Workers 还是 Pages：

1. **查看项目列表**
   - 在 **Workers & Pages** 页面
   - 查看项目是在 "Workers" 部分还是 "Pages" 部分

2. **查看项目 URL**
   - Workers 项目：`project-name.account-name.workers.dev`
   - Pages 项目：`project-name.pages.dev`

3. **查看设置页面**
   - Workers：没有 "Build output directory" 字段
   - Pages：有 "Build output directory" 字段

## 📋 Pages 项目的正确配置

创建 Pages 项目后，设置应该是：

```
项目类型: Pages (不是 Workers)
Git 仓库: abelzhou2025/sacnwhat
Framework preset: Vite 或 None
Build command: npm run build
Build output directory: dist  ← 重要！
Root directory: /
```

**注意**：Pages 项目通常**不需要** "Deploy command" 和 "Version command"。

## 🔍 如何区分 Workers 和 Pages？

### 使用场景：

**Workers**：
- API/后端服务
- 边缘计算
- 不需要静态文件部署

**Pages**：
- 静态网站
- React/Vue 等前端应用
- 需要部署 HTML/CSS/JS 文件
- 支持 Pages Functions（`functions/` 目录）

### 你的项目需要：

你的项目是 **React 应用**，需要：
- ✅ 部署静态文件（HTML/CSS/JS）
- ✅ 支持 Pages Functions（`functions/api/ocr.ts`）
- ✅ 自动部署 Git 仓库

所以你需要 **Pages**，不是 **Workers**。

## ✅ 验证修复

创建 Pages 项目后：

1. ✅ 设置页面有 "Build output directory" 字段
2. ✅ 可以设置为 `dist`
3. ✅ 项目 URL 是 `.pages.dev` 格式
4. ✅ 网站可以正常显示（不是 "Hello world"）
5. ✅ API 路由 `/api/ocr` 工作

## 🔑 环境变量设置

创建 Pages 项目后，设置环境变量：

1. 进入项目 → **Settings** → **Environment variables**
2. 添加 `GEMINI_API_KEY`
3. 选择环境（Production 和 Preview）
4. 保存后重新部署

## 📝 重要提示

- **Workers** 和 **Pages** 是不同的产品
- 你的项目需要 **Pages**（因为需要部署静态网站）
- 如果误创建为 Workers 项目，需要重新创建为 Pages 项目
- Pages 项目会自动获得 `.pages.dev` 域名
- Pages 项目有 "Build output directory" 字段，Workers 没有

