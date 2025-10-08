# 🚀 Vercel 部署指南

## 方法一：通过 GitHub 自动部署（推荐）

### 1. 访问 Vercel 官网
打开 [vercel.com](https://vercel.com) 并注册/登录账户

### 2. 导入 GitHub 项目
1. 点击 "New Project"
2. 选择 "Import Git Repository"
3. 连接您的 GitHub 账户
4. 选择 `ancient-poetry-game` 仓库
5. 点击 "Import"

### 3. 配置部署设置
- **Framework Preset**: 选择 "Other" 或 "Static Site"
- **Root Directory**: 保持默认 `./`
- **Build Command**: 留空（静态网站无需构建）
- **Output Directory**: 留空
- **Install Command**: 留空

### 4. 环境变量配置
在 Vercel 项目设置中添加以下环境变量（如果需要）：
- `SUPABASE_URL`: 您的 Supabase 项目 URL
- `SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥

### 5. 部署
点击 "Deploy" 按钮，Vercel 将自动部署您的项目

## 方法二：通过 Vercel CLI 部署

### 1. 登录 Vercel
```bash
vercel login
```
按照提示在浏览器中完成登录

### 2. 部署项目
```bash
vercel --prod
```

## 📋 部署后配置

### 1. 配置 Supabase
部署完成后，您需要：
1. 复制 `config.example.js` 为 `js/config.js`
2. 在 `js/config.js` 中填入您的 Supabase 配置
3. 重新部署项目

### 2. 自定义域名（可选）
在 Vercel 项目设置中可以添加自定义域名

## 🔧 vercel.json 配置说明

项目已包含 `vercel.json` 配置文件，包含：
- 静态文件服务配置
- 安全头设置
- 路由规则

## 🌐 访问您的网站

部署完成后，Vercel 会提供：
- 预览 URL: `https://your-project-name.vercel.app`
- 生产 URL: `https://your-project-name-git-master-username.vercel.app`

## 🔄 自动部署

每次推送到 GitHub 的 `master` 分支时，Vercel 会自动重新部署您的网站。

## 📞 需要帮助？

如果遇到问题，请查看：
- [Vercel 官方文档](https://vercel.com/docs)
- [项目 SETUP.md](./SETUP.md)