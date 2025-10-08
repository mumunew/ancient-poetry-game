// Supabase 配置文件模板
// 请复制此文件为 config.js 并填入您的实际配置信息

const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here', // 从 Supabase 项目设置中获取
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
}