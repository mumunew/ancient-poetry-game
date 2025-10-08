# Supabase 自动配置指南

## 🚀 快速开始

本指南将帮助您快速配置 Supabase 数据库，为古诗词游戏提供后端支持。

## 📋 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com)
2. 注册账号并登录
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - **Name**: `古诗词游戏` 或 `poem-game`
   - **Database Password**: 设置一个强密码（请记住）
   - **Region**: 选择离您最近的区域（推荐 `Southeast Asia (Singapore)`）
5. 点击 "Create new project" 并等待项目创建完成

### 2. 获取项目配置信息

项目创建完成后：
1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 选择 "API" 选项卡
3. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 以 `eyJ` 开头的长字符串

### 3. 创建数据库表

1. 在 Supabase 项目中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query" 创建新查询
3. 复制并粘贴以下 SQL 代码：

```sql
-- 创建游戏反馈表
CREATE TABLE IF NOT EXISTS game_feedback (
    id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(100) DEFAULT '游客',
    user_contact VARCHAR(255),
    user_feedback TEXT,
    
    -- 游戏统计数据
    score INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    play_time INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    max_levels INTEGER DEFAULT 5,
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    
    -- 系统信息
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    screen_resolution VARCHAR(50),
    
    -- 索引字段
    CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
    CONSTRAINT valid_level CHECK (current_level > 0 AND current_level <= max_levels)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_feedback_created_at ON game_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_feedback_score ON game_feedback(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_feedback_level ON game_feedback(current_level);

-- 启用行级安全性
ALTER TABLE game_feedback ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名用户插入反馈数据
CREATE POLICY "允许匿名用户提交反馈" ON game_feedback
    FOR INSERT TO anon
    WITH CHECK (true);

-- 创建策略：允许匿名用户查看反馈统计（可选）
CREATE POLICY "允许查看反馈统计" ON game_feedback
    FOR SELECT TO anon
    USING (true);

-- 创建视图：反馈统计摘要
CREATE OR REPLACE VIEW feedback_stats AS
SELECT 
    COUNT(*) as total_feedback,
    AVG(score) as avg_score,
    AVG(accuracy) as avg_accuracy,
    AVG(play_time) as avg_play_time,
    MAX(score) as highest_score,
    COUNT(DISTINCT user_name) as unique_players,
    DATE_TRUNC('day', created_at) as feedback_date
FROM game_feedback
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY feedback_date DESC;

-- 插入测试数据（可选）
INSERT INTO game_feedback (
    user_name, 
    user_feedback, 
    score, 
    accuracy, 
    play_time, 
    current_level, 
    correct_answers, 
    total_answers,
    user_agent,
    screen_resolution
) VALUES 
(
    '测试用户', 
    '游戏很有趣，希望能增加更多诗词！', 
    85, 
    85.00, 
    120, 
    3, 
    17, 
    20,
    'Test User Agent',
    '1920x1080'
);
```

4. 点击 "Run" 执行 SQL 脚本
5. 确认看到 "Success. No rows returned" 消息

### 4. 更新应用配置

1. 打开项目中的 `js/config.js` 文件
2. 将第2步获取的信息填入配置：

```javascript
// Supabase配置
const SUPABASE_CONFIG = {
    // 替换为您的项目URL
    url: 'https://your-project-id.supabase.co',
    
    // 替换为您的anon public key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    
    // 表名（通常不需要修改）
    feedbackTable: 'game_feedback'
};

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
```

### 5. 测试配置

1. 启动本地服务器：`python -m http.server 8086`
2. 打开浏览器访问：`http://localhost:8086`
3. 完成一局游戏后，点击反馈按钮
4. 填写反馈信息并提交
5. 在 Supabase 项目的 "Table Editor" 中查看 `game_feedback` 表，确认数据已成功提交

## 🔧 高级配置

### 数据库优化

```sql
-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_feedback_user_score ON game_feedback(user_name, score DESC);

-- 创建部分索引（只索引有反馈内容的记录）
CREATE INDEX IF NOT EXISTS idx_feedback_with_content ON game_feedback(created_at DESC) 
WHERE user_feedback IS NOT NULL AND user_feedback != '';
```

### 数据清理策略

```sql
-- 创建函数：清理超过30天的测试数据
CREATE OR REPLACE FUNCTION cleanup_old_test_data()
RETURNS void AS $$
BEGIN
    DELETE FROM game_feedback 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND user_name = '测试用户';
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（需要在 Supabase Dashboard 中配置）
-- SELECT cron.schedule('cleanup-test-data', '0 2 * * *', 'SELECT cleanup_old_test_data();');
```

## 🛡️ 安全配置

### 行级安全策略

```sql
-- 更严格的插入策略
DROP POLICY IF EXISTS "允许匿名用户提交反馈" ON game_feedback;

CREATE POLICY "限制反馈提交频率" ON game_feedback
    FOR INSERT TO anon
    WITH CHECK (
        -- 限制同一IP在1分钟内只能提交一次
        NOT EXISTS (
            SELECT 1 FROM game_feedback 
            WHERE created_at > NOW() - INTERVAL '1 minute'
            AND user_agent = NEW.user_agent
        )
    );
```

### API 密钥管理

- ✅ **anon key**: 可以在前端使用，权限受 RLS 策略限制
- ❌ **service_role key**: 绝对不要在前端使用，具有完全访问权限

## 📊 数据分析

### 查看反馈统计

```sql
-- 查看最近的反馈
SELECT user_name, score, accuracy, user_feedback, created_at
FROM game_feedback
ORDER BY created_at DESC
LIMIT 10;

-- 查看得分分布
SELECT 
    CASE 
        WHEN score >= 90 THEN '优秀 (90+)'
        WHEN score >= 70 THEN '良好 (70-89)'
        WHEN score >= 50 THEN '及格 (50-69)'
        ELSE '需要努力 (<50)'
    END as score_range,
    COUNT(*) as player_count,
    AVG(accuracy) as avg_accuracy
FROM game_feedback
GROUP BY score_range
ORDER BY MIN(score) DESC;
```

## 🚨 故障排除

### 常见问题

1. **"Configuration not found" 错误**
   - 检查 `config.js` 文件是否正确加载
   - 确认 `window.SUPABASE_CONFIG` 对象存在

2. **"HTTP error! status: 401" 错误**
   - 检查 anon key 是否正确
   - 确认 RLS 策略是否正确配置

3. **"HTTP error! status: 404" 错误**
   - 检查表名是否正确
   - 确认表是否已创建

4. **数据提交成功但看不到数据**
   - 检查 RLS 策略是否允许查看数据
   - 在 SQL Editor 中直接查询表数据

### 调试模式

在浏览器控制台中启用详细日志：

```javascript
// 临时启用详细日志
localStorage.setItem('debug', 'true');
location.reload();
```

## 📝 备注

- 配置完成后，游戏将自动使用 Supabase 存储用户反馈
- 如果配置不完整，游戏会自动进入模拟模式
- 所有敏感信息都通过 HTTPS 加密传输
- 建议定期备份数据库数据

---

**配置完成后，您的古诗词游戏就具备了完整的后端数据收集能力！** 🎉