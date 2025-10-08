# 🎮 古诗词游戏 - 设置指南

## 📋 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/ancient-poetry-game.git
cd ancient-poetry-game
```

### 2. 配置 Supabase
1. 复制配置文件模板：
   ```bash
   cp config.example.js js/config.js
   ```

2. 编辑 `js/config.js` 文件，填入您的 Supabase 配置：
   - `url`: 您的 Supabase 项目 URL
   - `anonKey`: 您的 Supabase 匿名密钥

### 3. 设置数据库
在 Supabase SQL 编辑器中运行 `supabase-setup.sql` 文件中的 SQL 语句。

### 4. 启动项目
使用任何 HTTP 服务器启动项目，例如：
```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`

## 🔧 配置选项

### 自动配置工具
项目提供了多种配置工具：
- `auto-setup.html` - 自动配置向导
- `simple-setup.html` - 简单配置工具
- `one-click-setup.html` - 一键配置工具

### 手动配置
如果您喜欢手动配置，请参考 `setup-supabase.md` 文件中的详细说明。

## 🔒 安全注意事项

- ⚠️ **永远不要**将包含真实密钥的 `js/config.js` 文件提交到版本控制系统
- ✅ 使用 `config.example.js` 作为模板
- ✅ 确保 `.gitignore` 文件包含 `js/config.js`

## 📚 更多信息

- [项目文档](README.md)
- [产品需求文档](prd.md)
- [Supabase 设置指南](setup-supabase.md)
- [故障排除](troubleshooting.html)