// 古诗词数据库
const POEMS_DATABASE = {
    // 初级难度诗词 - 适合诗句修复游戏
    beginner: [
        {
            id: 1,
            title: "静夜思",
            author: "李白",
            dynasty: "唐",
            content: [
                "床前明月光",
                "疑是地上霜",
                "举头望明月",
                "低头思故乡"
            ],
            difficulty: "beginner",
            theme: "思乡"
        },
        {
            id: 2,
            title: "春晓",
            author: "孟浩然",
            dynasty: "唐",
            content: [
                "春眠不觉晓",
                "处处闻啼鸟",
                "夜来风雨声",
                "花落知多少"
            ],
            difficulty: "beginner",
            theme: "春景"
        },
        {
            id: 3,
            title: "登鹳雀楼",
            author: "王之涣",
            dynasty: "唐",
            content: [
                "白日依山尽",
                "黄河入海流",
                "欲穷千里目",
                "更上一层楼"
            ],
            difficulty: "beginner",
            theme: "励志"
        },
        {
            id: 4,
            title: "相思",
            author: "王维",
            dynasty: "唐",
            content: [
                "红豆生南国",
                "春来发几枝",
                "愿君多采撷",
                "此物最相思"
            ],
            difficulty: "beginner",
            theme: "相思"
        },
        {
            id: 5,
            title: "咏鹅",
            author: "骆宾王",
            dynasty: "唐",
            content: [
                "鹅鹅鹅",
                "曲项向天歌",
                "白毛浮绿水",
                "红掌拨清波"
            ],
            difficulty: "beginner",
            theme: "咏物"
        },
        {
            id: 6,
            title: "悯农",
            author: "李绅",
            dynasty: "唐",
            content: [
                "锄禾日当午",
                "汗滴禾下土",
                "谁知盘中餐",
                "粒粒皆辛苦"
            ],
            difficulty: "beginner",
            theme: "农事"
        },
        {
            id: 7,
            title: "江雪",
            author: "柳宗元",
            dynasty: "唐",
            content: [
                "千山鸟飞绝",
                "万径人踪灭",
                "孤舟蓑笠翁",
                "独钓寒江雪"
            ],
            difficulty: "beginner",
            theme: "雪景"
        },
        {
            id: 8,
            title: "寻隐者不遇",
            author: "贾岛",
            dynasty: "唐",
            content: [
                "松下问童子",
                "言师采药去",
                "只在此山中",
                "云深不知处"
            ],
            difficulty: "beginner",
            theme: "寻访"
        },
        {
            id: 9,
            title: "草",
            author: "白居易",
            dynasty: "唐",
            content: [
                "离离原上草",
                "一岁一枯荣",
                "野火烧不尽",
                "春风吹又生"
            ],
            difficulty: "beginner",
            theme: "咏物"
        },
        {
            id: 10,
            title: "山村咏怀",
            author: "邵雍",
            dynasty: "宋",
            content: [
                "一去二三里",
                "烟村四五家",
                "亭台六七座",
                "八九十枝花"
            ],
            difficulty: "beginner",
            theme: "山村"
        }
    ],

    // 中级难度诗词 - 适合诗句编排游戏
    intermediate: [
        {
            id: 11,
            title: "望庐山瀑布",
            author: "李白",
            dynasty: "唐",
            content: [
                "日照香炉生紫烟",
                "遥看瀑布挂前川",
                "飞流直下三千尺",
                "疑是银河落九天"
            ],
            difficulty: "intermediate",
            theme: "山水"
        },
        {
            id: 12,
            title: "黄鹤楼送孟浩然之广陵",
            author: "李白",
            dynasty: "唐",
            content: [
                "故人西辞黄鹤楼",
                "烟花三月下扬州",
                "孤帆远影碧空尽",
                "唯见长江天际流"
            ],
            difficulty: "intermediate",
            theme: "送别"
        },
        {
            id: 13,
            title: "回乡偶书",
            author: "贺知章",
            dynasty: "唐",
            content: [
                "少小离家老大回",
                "乡音无改鬓毛衰",
                "儿童相见不相识",
                "笑问客从何处来"
            ],
            difficulty: "intermediate",
            theme: "思乡"
        }
    ],

    // 高级难度诗词 - 适合诗词默写游戏
    advanced: [
        {
            id: 14,
            title: "将进酒",
            author: "李白",
            dynasty: "唐",
            content: [
                "君不见黄河之水天上来",
                "奔流到海不复回",
                "君不见高堂明镜悲白发",
                "朝如青丝暮成雪",
                "人生得意须尽欢",
                "莫使金樽空对月"
            ],
            difficulty: "advanced",
            theme: "人生"
        }
    ]
};

// 干扰选项数据库 - 用于生成错误选项
const DISTRACTOR_LINES = {
    // 按主题分类的干扰句子
    思乡: [
        "独在异乡为异客",
        "每逢佳节倍思亲",
        "春风又绿江南岸",
        "明月何时照我还",
        "洛阳亲友如相问",
        "一片冰心在玉壶"
    ],
    春景: [
        "春色满园关不住",
        "一枝红杏出墙来",
        "春江潮水连海平",
        "海上明月共潮生",
        "竹外桃花三两枝",
        "春江水暖鸭先知"
    ],
    励志: [
        "山重水复疑无路",
        "柳暗花明又一村",
        "长风破浪会有时",
        "直挂云帆济沧海",
        "会当凌绝顶",
        "一览众山小"
    ],
    相思: [
        "在天愿作比翼鸟",
        "在地愿为连理枝",
        "身无彩凤双飞翼",
        "心有灵犀一点通",
        "两情若是久长时",
        "又岂在朝朝暮暮"
    ],
    咏物: [
        "墙角数枝梅",
        "凌寒独自开",
        "不要人夸好颜色",
        "只留清气满乾坤",
        "千磨万击还坚劲",
        "任尔东西南北风"
    ],
    农事: [
        "春种一粒粟",
        "秋收万颗子",
        "四海无闲田",
        "农夫犹饿死",
        "足蒸暑土气",
        "背灼炎天光"
    ],
    雪景: [
        "忽如一夜春风来",
        "千树万树梨花开",
        "窗含西岭千秋雪",
        "门泊东吴万里船",
        "雪花飞舞满天飘",
        "银装素裹分外娇"
    ],
    寻访: [
        "不识庐山真面目",
        "只缘身在此山中",
        "山穷水尽疑无路",
        "柳暗花明又一村",
        "踏破铁鞋无觅处",
        "得来全不费工夫"
    ],
    山水: [
        "桂林山水甲天下",
        "阳朔山水甲桂林",
        "山清水秀风光好",
        "鸟语花香春意浓",
        "青山绿水绕人家",
        "白云深处有人家"
    ],
    送别: [
        "劝君更尽一杯酒",
        "西出阳关无故人",
        "桃花潭水深千尺",
        "不及汪伦送我情",
        "莫愁前路无知己",
        "天下谁人不识君"
    ],
    山村: [
        "绿树村边合",
        "青山郭外斜",
        "开轩面场圃",
        "把酒话桑麻",
        "采菊东篱下",
        "悠然见南山"
    ]
};

// 工具函数：根据难度获取诗词
function getPoemsByDifficulty(difficulty) {
    return POEMS_DATABASE[difficulty] || [];
}

// 工具函数：随机获取一首诗
function getRandomPoem(difficulty = 'beginner') {
    const poems = getPoemsByDifficulty(difficulty);
    if (poems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * poems.length);
    return poems[randomIndex];
}

// 工具函数：生成干扰选项
function generateDistractors(correctLine, theme, count = 3) {
    const themeDistractors = DISTRACTOR_LINES[theme] || [];
    const allDistractors = Object.values(DISTRACTOR_LINES).flat();
    
    // 获取正确答案的字数
    const correctLineLength = correctLine.length;
    
    // 优先从相同主题中选择干扰项，并过滤字数相同的
    let distractors = themeDistractors.filter(line => 
        line !== correctLine && line.length === correctLineLength
    );
    
    // 如果同主题字数相同的干扰项不够，从其他主题补充字数相同的
    if (distractors.length < count) {
        const otherDistractors = allDistractors.filter(line => 
            !themeDistractors.includes(line) && 
            line !== correctLine && 
            line.length === correctLineLength
        );
        distractors = distractors.concat(otherDistractors);
    }
    
    // 如果字数相同的干扰项还是不够，放宽条件选择字数相近的（±1字）
    if (distractors.length < count) {
        const nearLengthDistractors = allDistractors.filter(line => 
            line !== correctLine && 
            !distractors.includes(line) &&
            Math.abs(line.length - correctLineLength) <= 1
        );
        distractors = distractors.concat(nearLengthDistractors);
    }
    
    // 随机选择指定数量的干扰项
    const shuffled = distractors.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 工具函数：为诗句修复游戏准备数据
function preparePoemForRepair(poem) {
    if (!poem || !poem.content || poem.content.length === 0) {
        return null;
    }
    
    // 随机选择一句作为缺失句
    const missingIndex = Math.floor(Math.random() * poem.content.length);
    const missingLine = poem.content[missingIndex];
    
    // 生成干扰选项
    const distractors = generateDistractors(missingLine, poem.theme, 3);
    
    // 创建选项数组（包含正确答案和干扰项）
    const options = [missingLine, ...distractors].sort(() => Math.random() - 0.5);
    
    // 创建显示用的诗句数组
    const displayContent = poem.content.map((line, index) => ({
        text: index === missingIndex ? '___________' : line,
        isMissing: index === missingIndex,
        originalText: line
    }));
    
    return {
        ...poem,
        displayContent,
        missingIndex,
        missingLine,
        options,
        correctAnswer: missingLine
    };
}

// 导出数据和函数（如果在Node.js环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        POEMS_DATABASE,
        DISTRACTOR_LINES,
        getPoemsByDifficulty,
        getRandomPoem,
        generateDistractors,
        preparePoemForRepair
    };
}