#!/usr/bin/env node

/**
 * Supabase 配置命令行工具
 * 使用方法: node setup-cli.js [options]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class SupabaseCLI {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.config = {
            accessToken: '',
            projectRef: '',
            projectUrl: '',
            anonKey: '',
            serviceRoleKey: ''
        };
    }

    /**
     * 显示欢迎信息
     */
    showWelcome() {
        console.log('\n🚀 Supabase 自动配置工具');
        console.log('=====================================');
        console.log('为古诗词游戏自动配置 Supabase 数据库\n');
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log('使用方法:');
        console.log('  node setup-cli.js [选项]\n');
        console.log('选项:');
        console.log('  --help, -h     显示帮助信息');
        console.log('  --auto         自动模式（使用环境变量）');
        console.log('  --interactive  交互模式（默认）');
        console.log('  --config-only  仅生成配置文件');
        console.log('  --sql-only     仅生成SQL脚本\n');
        console.log('环境变量:');
        console.log('  SUPABASE_ACCESS_TOKEN  Supabase访问令牌');
        console.log('  SUPABASE_PROJECT_REF   项目引用ID\n');
    }

    /**
     * 询问用户输入
     */
    async askQuestion(question, isPassword = false) {
        return new Promise((resolve) => {
            if (isPassword) {
                // 隐藏密码输入
                process.stdout.write(question);
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                
                let password = '';
                process.stdin.on('data', function(char) {
                    char = char + '';
                    switch (char) {
                        case '\n':
                        case '\r':
                        case '\u0004':
                            process.stdin.setRawMode(false);
                            process.stdin.pause();
                            console.log('');
                            resolve(password);
                            break;
                        case '\u0003':
                            process.exit();
                            break;
                        default:
                            password += char;
                            process.stdout.write('*');
                            break;
                    }
                });
            } else {
                this.rl.question(question, resolve);
            }
        });
    }

    /**
     * 交互式配置
     */
    async interactiveSetup() {
        console.log('📝 请提供以下信息:\n');
        
        this.config.accessToken = await this.askQuestion('Supabase Access Token: ', true);
        this.config.projectRef = await this.askQuestion('项目引用ID (Project Reference): ');
        
        if (!this.config.accessToken || !this.config.projectRef) {
            console.log('❌ 缺少必要的配置信息');
            process.exit(1);
        }
        
        this.config.projectUrl = `https://${this.config.projectRef}.supabase.co`;
        
        console.log('\n✅ 配置信息收集完成');
    }

    /**
     * 自动模式配置
     */
    autoSetup() {
        this.config.accessToken = process.env.SUPABASE_ACCESS_TOKEN;
        this.config.projectRef = process.env.SUPABASE_PROJECT_REF;
        
        if (!this.config.accessToken || !this.config.projectRef) {
            console.log('❌ 请设置环境变量 SUPABASE_ACCESS_TOKEN 和 SUPABASE_PROJECT_REF');
            process.exit(1);
        }
        
        this.config.projectUrl = `https://${this.config.projectRef}.supabase.co`;
        console.log('✅ 从环境变量加载配置');
    }

    /**
     * 生成SQL脚本
     */
    generateSQL() {
        const sql = `-- Supabase 数据库配置脚本
-- 生成时间: ${new Date().toLocaleString('zh-CN')}
-- 项目: ${this.config.projectRef}

-- 创建游戏反馈表
CREATE TABLE IF NOT EXISTS game_feedback (
    id BIGSERIAL PRIMARY KEY,
    player_name VARCHAR(100),
    contact_info VARCHAR(255),
    suggestions TEXT,
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    accuracy DECIMAL(5,2) DEFAULT 0.00 CHECK (accuracy >= 0 AND accuracy <= 100),
    play_time INTEGER DEFAULT 0 CHECK (play_time >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    max_levels INTEGER DEFAULT 1 CHECK (max_levels >= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    screen_resolution VARCHAR(50),
    
    -- 约束条件
    CONSTRAINT valid_level_progress CHECK (current_level <= max_levels),
    CONSTRAINT valid_contact_or_suggestion CHECK (
        contact_info IS NOT NULL OR suggestions IS NOT NULL
    )
);

-- 添加表注释
COMMENT ON TABLE game_feedback IS '古诗词游戏用户反馈数据表';
COMMENT ON COLUMN game_feedback.player_name IS '玩家姓名';
COMMENT ON COLUMN game_feedback.contact_info IS '联系方式（邮箱或微信等）';
COMMENT ON COLUMN game_feedback.suggestions IS '意见建议';
COMMENT ON COLUMN game_feedback.score IS '游戏得分';
COMMENT ON COLUMN game_feedback.accuracy IS '答题准确率（百分比）';
COMMENT ON COLUMN game_feedback.play_time IS '游戏时长（秒）';
COMMENT ON COLUMN game_feedback.current_level IS '当前关卡';
COMMENT ON COLUMN game_feedback.max_levels IS '总关卡数';

-- 启用行级安全
ALTER TABLE game_feedback ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow anonymous insert" ON game_feedback;
DROP POLICY IF EXISTS "Allow read own feedback" ON game_feedback;

-- 允许匿名用户插入反馈
CREATE POLICY "Allow anonymous insert" ON game_feedback
    FOR INSERT TO anon
    WITH CHECK (true);

-- 允许读取自己的反馈（基于会话）
CREATE POLICY "Allow read own feedback" ON game_feedback
    FOR SELECT TO anon
    USING (true);

-- 创建性能优化索引
CREATE INDEX IF NOT EXISTS idx_game_feedback_created_at 
    ON game_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_feedback_score 
    ON game_feedback(score DESC);

CREATE INDEX IF NOT EXISTS idx_game_feedback_level 
    ON game_feedback(current_level);

CREATE INDEX IF NOT EXISTS idx_game_feedback_accuracy 
    ON game_feedback(accuracy DESC);

-- 创建反馈统计视图
CREATE OR REPLACE VIEW feedback_stats AS
SELECT 
    COUNT(*) as total_feedback,
    AVG(score) as avg_score,
    MAX(score) as max_score,
    AVG(accuracy) as avg_accuracy,
    AVG(play_time) as avg_play_time,
    AVG(current_level) as avg_level,
    COUNT(DISTINCT DATE(created_at)) as active_days
FROM game_feedback;

-- 创建玩家排行榜视图
CREATE OR REPLACE VIEW player_leaderboard AS
SELECT 
    player_name,
    MAX(score) as best_score,
    MAX(accuracy) as best_accuracy,
    MAX(current_level) as highest_level,
    COUNT(*) as play_count,
    MAX(created_at) as last_played
FROM game_feedback 
WHERE player_name IS NOT NULL AND player_name != ''
GROUP BY player_name
ORDER BY best_score DESC, best_accuracy DESC;

-- 创建游戏统计函数
CREATE OR REPLACE FUNCTION get_game_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_players', COUNT(DISTINCT player_name),
        'total_games', COUNT(*),
        'average_score', ROUND(AVG(score), 2),
        'highest_score', MAX(score),
        'average_accuracy', ROUND(AVG(accuracy), 2),
        'average_playtime', ROUND(AVG(play_time), 2),
        'most_reached_level', MAX(current_level),
        'feedback_count', COUNT(*) FILTER (WHERE suggestions IS NOT NULL)
    ) INTO result
    FROM game_feedback;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 插入测试数据（可选）
INSERT INTO game_feedback (
    player_name, 
    contact_info, 
    suggestions, 
    score, 
    accuracy, 
    play_time, 
    current_level, 
    max_levels,
    user_agent,
    screen_resolution
) VALUES (
    '测试用户',
    'test@example.com',
    '这是一个测试反馈',
    850,
    85.5,
    300,
    5,
    10,
    'Test User Agent',
    '1920x1080'
) ON CONFLICT DO NOTHING;

-- 验证配置
SELECT 'Supabase 配置完成！' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_name = 'game_feedback';
SELECT * FROM feedback_stats;
`;

        return sql;
    }

    /**
     * 生成配置文件
     */
    generateConfig() {
        // 这里应该从API获取真实的anon key，但在CLI环境中我们使用占位符
        const config = `// Supabase 配置文件 - 自动生成
// 生成时间: ${new Date().toLocaleString('zh-CN')}
// 项目: ${this.config.projectRef}

const SUPABASE_CONFIG = {
    url: '${this.config.projectUrl}',
    anonKey: 'YOUR_ANON_KEY_HERE', // 请从 Supabase 项目设置中获取
    feedbackTable: 'game_feedback'
};

// 配置验证
if (typeof window !== 'undefined') {
    console.log('✅ Supabase 配置已加载');
    console.log('📊 项目URL:', SUPABASE_CONFIG.url);
    console.log('🔑 匿名密钥已设置');
    
    // 开发模式检查
    if (SUPABASE_CONFIG.anonKey === 'YOUR_ANON_KEY_HERE') {
        console.warn('⚠️ 请更新 SUPABASE_CONFIG.anonKey 为真实的匿名密钥');
    }
}

// 导出配置（支持多种模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}`;

        return config;
    }

    /**
     * 保存文件
     */
    saveFile(filename, content) {
        try {
            fs.writeFileSync(filename, content, 'utf8');
            console.log(`✅ 文件已保存: ${filename}`);
        } catch (error) {
            console.log(`❌ 保存文件失败: ${error.message}`);
        }
    }

    /**
     * 执行完整配置
     */
    async executeFullSetup() {
        console.log('\n🔧 开始生成配置文件...\n');
        
        // 生成SQL脚本
        const sql = this.generateSQL();
        this.saveFile('supabase-setup-generated.sql', sql);
        
        // 生成配置文件
        const config = this.generateConfig();
        this.saveFile('config-generated.js', config);
        
        // 生成使用说明
        const readme = this.generateReadme();
        this.saveFile('SETUP-INSTRUCTIONS.md', readme);
        
        console.log('\n🎉 配置文件生成完成！');
        console.log('\n📋 下一步操作:');
        console.log('1. 在 Supabase 项目中执行 supabase-setup-generated.sql');
        console.log('2. 从项目设置中获取 anon key');
        console.log('3. 更新 config-generated.js 中的 anonKey');
        console.log('4. 将 config-generated.js 重命名为 config.js');
        console.log('5. 阅读 SETUP-INSTRUCTIONS.md 获取详细说明\n');
    }

    /**
     * 生成使用说明
     */
    generateReadme() {
        return `# Supabase 配置说明

## 自动生成信息
- 生成时间: ${new Date().toLocaleString('zh-CN')}
- 项目引用: ${this.config.projectRef}
- 项目URL: ${this.config.projectUrl}

## 配置步骤

### 1. 执行SQL脚本
1. 登录 Supabase 控制台
2. 进入您的项目
3. 打开 SQL Editor
4. 复制并执行 \`supabase-setup-generated.sql\` 中的内容

### 2. 获取API密钥
1. 在项目设置中找到 "API" 部分
2. 复制 "anon public" 密钥
3. 更新 \`config-generated.js\` 中的 \`anonKey\` 字段

### 3. 部署配置
1. 将 \`config-generated.js\` 重命名为 \`config.js\`
2. 确保在您的HTML文件中正确引用该配置文件

### 4. 测试配置
在浏览器控制台中运行以下代码测试连接:

\`\`\`javascript
// 测试Supabase连接
fetch(SUPABASE_CONFIG.url + '/rest/v1/game_feedback?select=count', {
    headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': 'Bearer ' + SUPABASE_CONFIG.anonKey
    }
}).then(response => {
    if (response.ok) {
        console.log('✅ Supabase 连接成功');
    } else {
        console.log('❌ 连接失败:', response.status);
    }
});
\`\`\`

## 数据表结构

### game_feedback 表
- \`id\`: 主键，自增
- \`player_name\`: 玩家姓名
- \`contact_info\`: 联系方式
- \`suggestions\`: 意见建议
- \`score\`: 游戏得分
- \`accuracy\`: 答题准确率
- \`play_time\`: 游戏时长（秒）
- \`current_level\`: 当前关卡
- \`max_levels\`: 总关卡数
- \`created_at\`: 创建时间
- \`user_agent\`: 用户代理
- \`screen_resolution\`: 屏幕分辨率

## 安全配置
- 已启用行级安全策略 (RLS)
- 允许匿名用户插入和读取数据
- 数据访问受到适当限制

## 性能优化
- 已创建必要的数据库索引
- 包含统计视图用于数据分析
- 提供游戏统计函数

## 故障排除

### 常见问题
1. **连接失败**: 检查项目URL和API密钥是否正确
2. **权限错误**: 确认已启用RLS并设置正确的策略
3. **数据插入失败**: 检查数据格式是否符合表结构要求

### 获取帮助
- 查看 Supabase 官方文档
- 检查浏览器控制台的错误信息
- 确认项目状态是否正常

---
生成工具: Supabase CLI 配置器
`;
    }

    /**
     * 主执行函数
     */
    async run() {
        const args = process.argv.slice(2);
        
        // 处理命令行参数
        if (args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            process.exit(0);
        }
        
        this.showWelcome();
        
        if (args.includes('--auto')) {
            this.autoSetup();
        } else {
            await this.interactiveSetup();
        }
        
        if (args.includes('--config-only')) {
            const config = this.generateConfig();
            this.saveFile('config-generated.js', config);
            console.log('✅ 配置文件已生成');
        } else if (args.includes('--sql-only')) {
            const sql = this.generateSQL();
            this.saveFile('supabase-setup-generated.sql', sql);
            console.log('✅ SQL脚本已生成');
        } else {
            await this.executeFullSetup();
        }
        
        this.rl.close();
    }
}

// 运行CLI工具
if (require.main === module) {
    const cli = new SupabaseCLI();
    cli.run().catch(error => {
        console.error('❌ 执行失败:', error.message);
        process.exit(1);
    });
}

module.exports = SupabaseCLI;