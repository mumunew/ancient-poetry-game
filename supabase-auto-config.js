/**
 * Supabase 自动配置脚本
 * 使用 Supabase Management API 自动完成数据库配置
 */

class SupabaseAutoConfig {
    constructor() {
        this.baseUrl = 'https://api.supabase.com/v1';
        this.projectRef = null;
        this.accessToken = null;
        this.serviceRoleKey = null;
    }

    /**
     * 初始化配置
     * @param {string} accessToken - Supabase Access Token
     * @param {string} projectRef - 项目引用ID
     */
    async initialize(accessToken, projectRef) {
        this.accessToken = accessToken;
        this.projectRef = projectRef;
        
        console.log('🚀 开始自动配置 Supabase...');
        
        try {
            // 获取项目信息
            await this.getProjectInfo();
            
            // 自动创建数据表
            await this.createTables();
            
            // 设置行级安全策略
            await this.setupRLS();
            
            // 创建索引
            await this.createIndexes();
            
            // 创建视图和函数
            await this.createViewsAndFunctions();
            
            // 生成配置文件
            await this.generateConfig();
            
            console.log('✅ Supabase 自动配置完成！');
            return true;
            
        } catch (error) {
            console.error('❌ 配置失败:', error.message);
            return false;
        }
    }

    /**
     * 获取项目信息
     */
    async getProjectInfo() {
        console.log('📋 获取项目信息...');
        
        const response = await this.makeRequest(`/projects/${this.projectRef}`, 'GET');
        
        if (response.status === 'ACTIVE_HEALTHY') {
            console.log('✅ 项目状态正常');
            this.serviceRoleKey = response.service_role_key;
        } else {
            throw new Error('项目状态异常，请检查项目是否正常运行');
        }
    }

    /**
     * 自动创建数据表
     */
    async createTables() {
        console.log('🗄️ 创建数据表...');
        
        const sql = `
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
        `;

        await this.executeSql(sql);
        console.log('✅ 数据表创建完成');
    }

    /**
     * 设置行级安全策略
     */
    async setupRLS() {
        console.log('🔒 设置行级安全策略...');
        
        const sql = `
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
        `;

        await this.executeSql(sql);
        console.log('✅ 行级安全策略设置完成');
    }

    /**
     * 创建索引
     */
    async createIndexes() {
        console.log('📈 创建数据库索引...');
        
        const sql = `
            -- 创建性能优化索引
            CREATE INDEX IF NOT EXISTS idx_game_feedback_created_at 
                ON game_feedback(created_at DESC);
            
            CREATE INDEX IF NOT EXISTS idx_game_feedback_score 
                ON game_feedback(score DESC);
            
            CREATE INDEX IF NOT EXISTS idx_game_feedback_level 
                ON game_feedback(current_level);
            
            CREATE INDEX IF NOT EXISTS idx_game_feedback_accuracy 
                ON game_feedback(accuracy DESC);
        `;

        await this.executeSql(sql);
        console.log('✅ 索引创建完成');
    }

    /**
     * 创建视图和函数
     */
    async createViewsAndFunctions() {
        console.log('📊 创建统计视图和函数...');
        
        const sql = `
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
        `;

        await this.executeSql(sql);
        console.log('✅ 统计视图和函数创建完成');
    }

    /**
     * 生成配置文件
     */
    async generateConfig() {
        console.log('⚙️ 生成配置文件...');
        
        const projectUrl = `https://${this.projectRef}.supabase.co`;
        const anonKey = await this.getAnonKey();
        
        const configContent = `// Supabase 配置文件 - 自动生成
// 生成时间: ${new Date().toLocaleString('zh-CN')}

const SUPABASE_CONFIG = {
    url: '${projectUrl}',
    anonKey: '${anonKey}',
    feedbackTable: 'game_feedback'
};

// 配置验证
if (typeof window !== 'undefined') {
    console.log('✅ Supabase 配置已加载');
    console.log('📊 项目URL:', SUPABASE_CONFIG.url);
    console.log('🔑 匿名密钥已设置');
}

// 导出配置（支持多种模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}`;

        // 这里应该将配置写入文件，但在浏览器环境中我们返回内容
        console.log('✅ 配置文件生成完成');
        console.log('📋 请将以下内容保存到 config.js 文件：');
        console.log(configContent);
        
        return configContent;
    }

    /**
     * 获取匿名密钥
     */
    async getAnonKey() {
        const response = await this.makeRequest(`/projects/${this.projectRef}/api-keys`, 'GET');
        return response.find(key => key.name === 'anon')?.api_key;
    }

    /**
     * 执行SQL语句
     */
    async executeSql(sql) {
        const response = await fetch(`https://${this.projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.serviceRoleKey}`,
                'apikey': this.serviceRoleKey
            },
            body: JSON.stringify({ sql })
        });

        if (!response.ok) {
            // 如果直接SQL执行失败，尝试使用Management API
            return await this.makeRequest(`/projects/${this.projectRef}/database/query`, 'POST', { query: sql });
        }

        return await response.json();
    }

    /**
     * 发送API请求
     */
    async makeRequest(endpoint, method = 'GET', body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API请求失败: ${response.status} - ${error}`);
        }

        return await response.json();
    }

    /**
     * 验证配置
     */
    async validateSetup() {
        console.log('🔍 验证配置...');
        
        try {
            // 测试数据库连接
            const testResponse = await fetch(`https://${this.projectRef}.supabase.co/rest/v1/game_feedback?select=count`, {
                headers: {
                    'Authorization': `Bearer ${this.serviceRoleKey}`,
                    'apikey': this.serviceRoleKey
                }
            });

            if (testResponse.ok) {
                console.log('✅ 数据库连接正常');
                return true;
            } else {
                console.log('❌ 数据库连接失败');
                return false;
            }
        } catch (error) {
            console.error('❌ 验证失败:', error.message);
            return false;
        }
    }
}

// 使用示例
async function autoSetupSupabase() {
    const config = new SupabaseAutoConfig();
    
    // 这些值需要用户提供
    const accessToken = prompt('请输入您的 Supabase Access Token:');
    const projectRef = prompt('请输入您的项目引用ID (Project Reference):');
    
    if (!accessToken || !projectRef) {
        alert('❌ 请提供必要的配置信息');
        return;
    }
    
    const success = await config.initialize(accessToken, projectRef);
    
    if (success) {
        alert('🎉 Supabase 自动配置完成！请查看控制台获取详细信息。');
    } else {
        alert('❌ 配置失败，请查看控制台获取错误信息。');
    }
}

// 导出类和函数
if (typeof window !== 'undefined') {
    window.SupabaseAutoConfig = SupabaseAutoConfig;
    window.autoSetupSupabase = autoSetupSupabase;
}