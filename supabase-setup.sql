-- =====================================================
-- 古诗词游戏 - Supabase 数据库配置脚本
-- =====================================================
-- 使用说明：
-- 1. 在 Supabase 项目中打开 SQL Editor
-- 2. 创建新查询并粘贴此脚本
-- 3. 点击 "Run" 执行脚本
-- =====================================================

-- 创建游戏反馈表
CREATE TABLE IF NOT EXISTS game_feedback (
    -- 主键
    id BIGSERIAL PRIMARY KEY,
    
    -- 用户信息
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
    
    -- 数据约束
    CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
    CONSTRAINT valid_level CHECK (current_level > 0 AND current_level <= max_levels),
    CONSTRAINT valid_score CHECK (score >= 0)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_feedback_created_at ON game_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_feedback_score ON game_feedback(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_feedback_level ON game_feedback(current_level);
CREATE INDEX IF NOT EXISTS idx_game_feedback_user ON game_feedback(user_name);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_feedback_user_score ON game_feedback(user_name, score DESC);

-- 创建部分索引（只索引有反馈内容的记录）
CREATE INDEX IF NOT EXISTS idx_feedback_with_content ON game_feedback(created_at DESC) 
WHERE user_feedback IS NOT NULL AND user_feedback != '';

-- 启用行级安全性 (RLS)
ALTER TABLE game_feedback ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "允许匿名用户提交反馈" ON game_feedback;
DROP POLICY IF EXISTS "允许查看反馈统计" ON game_feedback;
DROP POLICY IF EXISTS "限制反馈提交频率" ON game_feedback;

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
    ROUND(AVG(score), 2) as avg_score,
    ROUND(AVG(accuracy), 2) as avg_accuracy,
    ROUND(AVG(play_time), 2) as avg_play_time,
    MAX(score) as highest_score,
    MIN(score) as lowest_score,
    COUNT(DISTINCT user_name) as unique_players,
    DATE_TRUNC('day', created_at) as feedback_date
FROM game_feedback
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY feedback_date DESC;

-- 创建视图：玩家排行榜
CREATE OR REPLACE VIEW player_leaderboard AS
SELECT 
    user_name,
    MAX(score) as best_score,
    ROUND(AVG(accuracy), 2) as avg_accuracy,
    COUNT(*) as games_played,
    MAX(current_level) as highest_level,
    MIN(created_at) as first_played,
    MAX(created_at) as last_played
FROM game_feedback
WHERE user_name != '游客' AND user_name != '测试用户'
GROUP BY user_name
ORDER BY best_score DESC, avg_accuracy DESC
LIMIT 50;

-- 创建函数：获取游戏统计
CREATE OR REPLACE FUNCTION get_game_statistics()
RETURNS TABLE (
    total_players BIGINT,
    total_games BIGINT,
    avg_score NUMERIC,
    avg_accuracy NUMERIC,
    highest_score INTEGER,
    most_active_player TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT user_name)::BIGINT as total_players,
        COUNT(*)::BIGINT as total_games,
        ROUND(AVG(score), 2) as avg_score,
        ROUND(AVG(accuracy), 2) as avg_accuracy,
        MAX(score) as highest_score,
        (SELECT user_name FROM game_feedback 
         GROUP BY user_name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_active_player
    FROM game_feedback
    WHERE user_name != '测试用户';
END;
$$ LANGUAGE plpgsql;

-- 创建函数：清理测试数据
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM game_feedback 
    WHERE user_name = '测试用户' 
    AND created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 插入示例数据（用于测试）
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
    '这是一个测试反馈，游戏体验很好！', 
    85, 
    85.00, 
    120, 
    3, 
    17, 
    20,
    'Mozilla/5.0 (Test)',
    '1920x1080'
),
(
    '诗词爱好者',
    '希望能增加更多唐诗宋词，界面很美观！',
    92,
    92.00,
    180,
    4,
    23,
    25,
    'Mozilla/5.0 (Windows NT 10.0)',
    '1366x768'
);

-- 验证数据插入
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM game_feedback;
    RAISE NOTICE '数据库配置完成！当前反馈记录数：%', record_count;
    
    IF record_count >= 2 THEN
        RAISE NOTICE '✅ 测试数据插入成功';
    ELSE
        RAISE NOTICE '⚠️  测试数据插入可能失败';
    END IF;
END $$;

-- 显示配置摘要
SELECT 
    '配置完成' as status,
    COUNT(*) as total_records,
    MAX(created_at) as latest_record
FROM game_feedback;

-- =====================================================
-- 配置完成提示
-- =====================================================
-- 🎉 数据库配置完成！
-- 
-- 接下来请：
-- 1. 复制项目 URL 和 anon key 到 js/config.js
-- 2. 测试游戏反馈功能
-- 3. 在 Table Editor 中查看数据
-- 
-- 有用的查询：
-- - 查看所有反馈：SELECT * FROM game_feedback ORDER BY created_at DESC;
-- - 查看统计信息：SELECT * FROM feedback_stats;
-- - 查看排行榜：SELECT * FROM player_leaderboard;
-- - 获取游戏统计：SELECT * FROM get_game_statistics();
-- =====================================================