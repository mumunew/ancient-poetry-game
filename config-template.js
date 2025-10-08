// =====================================================
// Supabase 配置模板
// =====================================================
// 使用说明：
// 1. 复制此文件内容到 js/config.js
// 2. 替换 URL 和 API Key 为您的实际值
// 3. 保存文件并测试功能
// =====================================================

const SUPABASE_CONFIG = {
    // 🔗 项目 URL
    // 在 Supabase 项目 Settings > API 中找到 "Project URL"
    // 格式：https://your-project-id.supabase.co
    url: 'https://your-project-id.supabase.co',
    
    // 🔑 匿名密钥 (anon key)
    // 在 Supabase 项目 Settings > API 中找到 "anon public"
    // 这是一个以 "eyJ" 开头的长字符串
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here',
    
    // 📊 数据表名
    // 通常不需要修改，除非您使用了不同的表名
    feedbackTable: 'game_feedback'
};

// 导出配置到全局作用域
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

// =====================================================
// 配置验证（开发模式下使用）
// =====================================================
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 开发环境下的配置检查
    console.group('🔧 Supabase 配置检查');
    
    if (SUPABASE_CONFIG.url.includes('your-project-id')) {
        console.warn('⚠️  请替换 URL 为您的实际 Supabase 项目 URL');
    } else {
        console.log('✅ URL 配置正确');
    }
    
    if (SUPABASE_CONFIG.anonKey.includes('your-anon-key')) {
        console.warn('⚠️  请替换 anonKey 为您的实际匿名密钥');
    } else {
        console.log('✅ API Key 配置正确');
    }
    
    if (!SUPABASE_CONFIG.url.includes('your-project-id') && 
        !SUPABASE_CONFIG.anonKey.includes('your-anon-key')) {
        console.log('🎉 Supabase 配置完成！');
    }
    
    console.groupEnd();
}

// =====================================================
// 使用示例
// =====================================================
/*
// 在应用中使用配置：
const config = window.SUPABASE_CONFIG;

// 发送数据到 Supabase
fetch(`${config.url}/rest/v1/${config.feedbackTable}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
    },
    body: JSON.stringify(data)
});
*/