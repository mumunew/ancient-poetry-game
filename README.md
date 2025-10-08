# 古诗词游戏 - Supabase数据库配置指南

## 概述
本游戏使用Supabase作为后端数据库来收集用户反馈信息。

## Supabase配置步骤

### 1. 创建Supabase项目
1. 访问 [Supabase官网](https://supabase.com)
2. 注册账号并创建新项目
3. 记录项目的URL和API密钥

### 2. 创建反馈表
在Supabase SQL编辑器中执行以下SQL语句：

```sql
-- 创建游戏反馈表
CREATE TABLE game_feedback (
    id BIGSERIAL PRIMARY KEY,
    player_name VARCHAR(100) DEFAULT 'Guest',
    contact_info VARCHAR(255),
    suggestions TEXT,
    score INTEGER,
    accuracy DECIMAL(5,2),
    play_time INTEGER,
    current_level INTEGER,
    max_levels INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    screen_resolution VARCHAR(20)
);

-- 启用行级安全性（可选）
ALTER TABLE game_feedback ENABLE ROW LEVEL SECURITY;

-- 创建插入策略（允许匿名用户插入数据）
CREATE POLICY "Allow anonymous inserts" ON game_feedback
    FOR INSERT TO anon
    WITH CHECK (true);
```

### 3. 配置应用
编辑 `js/config.js` 文件，替换以下配置：

```javascript
const SUPABASE_CONFIG = {
    // 替换为您的Supabase项目URL
    url: 'https://your-project-id.supabase.co',
    
    // 替换为您的Supabase匿名密钥
    anonKey: 'your-anon-key-here',
    
    // 反馈表名（如果您使用了不同的表名，请修改）
    feedbackTable: 'game_feedback'
};
```

### 4. 获取配置信息
1. 在Supabase项目仪表板中，点击"Settings" > "API"
2. 复制"Project URL"到config.js的url字段
3. 复制"anon public"密钥到config.js的anonKey字段

## 功能特性

### 反馈收集
- 玩家姓名（默认为"游客"）
- 联系方式（可选）
- 意见和建议（可选）
- 游戏统计数据（分数、准确率、游戏时长等）
- 技术信息（用户代理、屏幕分辨率等）

### 错误处理
- 配置检查：自动检测配置是否完整
- 模拟模式：配置不完整时使用模拟提交
- 本地备份：网络错误时将反馈保存到本地存储
- 重试机制：支持网络恢复后重新提交

### 数据安全
- 使用HTTPS加密传输
- 支持行级安全性策略
- 不收集敏感个人信息

## 开发模式
如果您暂时不想配置Supabase，游戏会自动进入模拟模式：
- 反馈提交会在控制台显示数据
- 模拟网络延迟和成功响应
- 不会实际发送数据到服务器

## 故障排除

### 常见问题
1. **提交失败**：检查网络连接和Supabase配置
2. **权限错误**：确保已创建正确的RLS策略
3. **表不存在**：确认已创建game_feedback表

### 调试信息
打开浏览器开发者工具的控制台，查看详细的错误信息和调试日志。

## 技术栈
- 前端：HTML5, CSS3, JavaScript (ES6+)
- 后端：Supabase (PostgreSQL)
- 部署：可部署到任何静态网站托管服务

## 许可证
本项目仅供学习和演示使用。