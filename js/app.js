// 古诗词学习助手 - 主应用逻辑
class PoemLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentPoem = null;
        this.currentScreen = 'welcome';
        this.score = 0;
        this.selectedOption = null;
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: null
        };
        this.clickToNextHandler = null;
        
        // 十关挑战相关
        this.currentLevel = 1;
        this.maxLevels = 5;
        this.levelPoems = []; // 存储按字数排序的诗词
        this.completedLevels = 0;
        
        this.init();
    }

    // 初始化应用
    init() {
        this.generateUser();
        this.bindEvents();
        this.showScreen('welcome');
        console.log('古诗词学习助手已启动');
    }

    // 生成临时用户
    generateUser() {
        const randomId = Math.floor(Math.random() * 9999) + 1;
        this.currentUser = {
            name: `游客${randomId.toString().padStart(4, '0')}`,
            id: randomId,
            joinTime: new Date()
        };
        
        // 更新界面显示
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name;
        }
        
        console.log('用户生成:', this.currentUser);
    }

    // 绑定事件监听器
    bindEvents() {
        // 难度选择按钮
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = btn.dataset.level;
                if (!btn.disabled) {
                    this.startGame(level);
                }
            });
        });

        // 返回按钮
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showScreen('welcome');
                this.resetGame();
            });
        }

        // 提交答案按钮
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitAnswer();
            });
        }

        // 底部导航按钮
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                this.showScreen(screen);
            });
        });

        // 添加点击进入下一题的监听器
    }
    


    // 重试当前关卡（答错时重新出题）
    retryCurrentLevel() {
        // 隐藏结果反馈
        this.hideResultFeedback();
        
        // 重置选择状态
        this.selectedOption = null;
        
        // 启用所有选项按钮并清除样式
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // 重置按钮状态
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = true;
        }
        if (nextBtn) nextBtn.style.display = 'none';
        
        // 重新生成当前关卡的题目（不改变currentLevel）
        const currentPoem = this.levelPoems[this.currentLevel - 1];
        if (currentPoem) {
            // 重新准备诗词修复数据，生成新的选项
            this.currentPoem = preparePoemForRepair(currentPoem);
            if (this.currentPoem) {
                // 更新界面显示新题目
                this.updateGameInterface();
                console.log('重新出题 - 当前关卡:', this.currentLevel, '新题目:', this.currentPoem);
            }
        }
    }

    // 下一题按钮事件绑定
    bindNextButton() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        // 底部导航
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                this.showScreen(screen);
                this.updateNavigation(screen);
            });
        });

        // 结果反馈点击关闭
        const resultFeedback = document.getElementById('resultFeedback');
        if (resultFeedback) {
            resultFeedback.addEventListener('click', () => {
                this.hideResultFeedback();
            });
        }
    }

    // 显示指定屏幕
    showScreen(screenName) {
        // 隐藏所有屏幕
        const screens = ['welcomeScreen', 'gameScreen', 'leaderboardScreen'];
        screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (element) {
                element.style.display = 'none';
            }
        });

        // 显示目标屏幕
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.style.display = 'block';
            this.currentScreen = screenName;
        }

        // 更新导航状态
        this.updateNavigation(screenName);
    }

    // 更新导航状态
    updateNavigation(activeScreen) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.screen === activeScreen) {
                btn.classList.add('active');
            }
        });
        
        // 如果切换到排行榜，初始化排行榜数据
        if (activeScreen === 'leaderboard') {
            this.initializeLeaderboard();
        }
    }

    // 初始化排行榜
    initializeLeaderboard() {
        this.bindLeaderboardTabs();
        this.showLeaderboardData('beginner');
    }

    // 绑定排行榜标签事件
    bindLeaderboardTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 更新标签状态
                tabButtons.forEach(tab => tab.classList.remove('active'));
                btn.classList.add('active');
                
                // 显示对应难度的排行榜数据
                const level = btn.dataset.level;
                this.showLeaderboardData(level);
            });
        });
    }

    // 显示排行榜数据
    showLeaderboardData(level) {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        // 获取排行榜数据
        const leaderboardData = this.getLeaderboardData(level);
        
        if (leaderboardData.length === 0) {
            leaderboardList.innerHTML = `
                <div class="empty-leaderboard">
                    <div class="empty-icon">🏆</div>
                    <p>暂无${this.getLevelName(level)}排行榜数据</p>
                    <p>快来挑战游戏，成为第一名吧！</p>
                </div>
            `;
            return;
        }

        // 生成排行榜列表
        const listHTML = leaderboardData.map((player, index) => {
            const rank = index + 1;
            const rankIcon = this.getRankIcon(rank);
            const isCurrentUser = player.username === this.currentUser.name;
            
            return `
                <div class="leaderboard-item ${rank <= 3 ? 'top-rank' : ''} ${isCurrentUser ? 'current-user' : ''}">
                    <div class="rank">
                        <span class="rank-icon">${rankIcon}</span>
                        <span class="rank-number">${rank}</span>
                    </div>
                    <div class="player-info">
                        <div class="player-name">${player.username}${isCurrentUser ? ' (我)' : ''}</div>
                        <div class="player-stats">
                            <span class="score">得分: ${player.score}</span>
                            <span class="accuracy">正确率: ${player.accuracy}%</span>
                        </div>
                    </div>
                    <div class="play-time">${player.playTime}</div>
                </div>
            `;
        }).join('');

        leaderboardList.innerHTML = listHTML;
    }

    // 获取排行榜数据
    getLeaderboardData(level) {
        const storageKey = `leaderboard_${level}`;
        const data = localStorage.getItem(storageKey);
        
        if (!data) {
            // 如果没有数据，返回一些示例数据
            return this.getDefaultLeaderboardData(level);
        }
        
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('解析排行榜数据失败:', e);
            return this.getDefaultLeaderboardData(level);
        }
    }

    // 获取默认排行榜数据
    getDefaultLeaderboardData(level) {
        const defaultData = {
            beginner: [
                { username: '诗词达人001', score: 95, accuracy: 95, playTime: '2分30秒' },
                { username: '古韵悠扬', score: 88, accuracy: 88, playTime: '3分15秒' },
                { username: '文学爱好者', score: 82, accuracy: 82, playTime: '4分05秒' },
                { username: '诗意人生', score: 76, accuracy: 76, playTime: '3分45秒' },
                { username: '墨香书生', score: 70, accuracy: 70, playTime: '4分20秒' }
            ],
            intermediate: [
                { username: '诗词高手', score: 92, accuracy: 92, playTime: '5分10秒' },
                { username: '文化传承者', score: 85, accuracy: 85, playTime: '6分30秒' },
                { username: '古典文学迷', score: 78, accuracy: 78, playTime: '7分15秒' }
            ],
            advanced: [
                { username: '诗词大师', score: 98, accuracy: 98, playTime: '8分45秒' },
                { username: '国学专家', score: 90, accuracy: 90, playTime: '10分20秒' }
            ]
        };
        
        return defaultData[level] || [];
    }

    // 保存用户成绩到排行榜
    saveToLeaderboard(level, playerData) {
        const storageKey = `leaderboard_${level}`;
        let leaderboardData = this.getLeaderboardData(level);
        
        // 添加新成绩
        leaderboardData.push(playerData);
        
        // 按分数排序（降序）
        leaderboardData.sort((a, b) => b.score - a.score);
        
        // 只保留前20名
        leaderboardData = leaderboardData.slice(0, 20);
        
        // 保存到本地存储
        localStorage.setItem(storageKey, JSON.stringify(leaderboardData));
    }

    // 获取难度级别名称
    getLevelName(level) {
        const levelNames = {
            beginner: '初级',
            intermediate: '中级',
            advanced: '高级'
        };
        return levelNames[level] || level;
    }

    // 获取排名图标
    getRankIcon(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    }

    // 开始游戏
    startGame(difficulty) {
        console.log('开始游戏，难度:', difficulty);
        
        if (difficulty === 'beginner') {
            this.startBeginnerGame();
        } else {
            // 其他难度暂未实现
            alert('该难度正在开发中，敬请期待！');
            return;
        }

        this.showScreen('game');
        this.gameStats.startTime = new Date();
        this.gameStats.correct = 0;
        this.gameStats.total = 0;
        this.score = 0;
        this.updateScore();
    }

    // 开始初级游戏（诗句修复）
    startBeginnerGame() {
        console.log('🎯 startBeginnerGame被调用');
        console.log('📚 当前levelPoems长度:', this.levelPoems.length);
        console.log('🎮 当前关卡:', this.currentLevel);
        
        // 如果是第一次开始游戏，初始化关卡诗词
        if (this.levelPoems.length === 0) {
            console.log('🔄 初始化关卡诗词');
            this.initializeLevelPoems();
            console.log('✅ 初始化完成，levelPoems长度:', this.levelPoems.length);
        }
        
        // 检查是否已完成所有关卡
        if (this.currentLevel > this.maxLevels) {
            console.log('🏆 所有关卡已完成');
            this.showCompletionMessage();
            return;
        }
        
        // 获取当前关卡的诗词
        const currentPoem = this.levelPoems[this.currentLevel - 1];
        console.log('📖 获取当前关卡诗词:', currentPoem ? '成功' : '失败', currentPoem);
        
        if (!currentPoem) {
            console.error('❌ 无法获取当前关卡诗词数据');
            return;
        }

        // 准备诗句修复数据
        console.log('🔧 准备诗词修复数据');
        this.currentPoem = preparePoemForRepair(currentPoem);
        if (!this.currentPoem) {
            console.error('❌ 无法准备诗词修复数据');
            return;
        }

        console.log('✅ 当前诗词准备完成:', this.currentPoem);
        
        // 更新界面
        console.log('🖼️ 更新游戏界面');
        this.updateGameInterface();
        this.selectedOption = null;
        
        // 更新关卡显示
        const currentLevelElement = document.getElementById('currentLevel');
        if (currentLevelElement) {
            currentLevelElement.textContent = `第${this.currentLevel}关 / 共${this.maxLevels}关`;
            console.log('📊 关卡显示已更新');
        } else {
            console.warn('⚠️ 找不到currentLevel元素');
        }
        
        console.log('🎉 startBeginnerGame执行完成');
    }

    // 初始化关卡诗词（按字数排序）
    initializeLevelPoems() {
        const beginnerPoems = getPoemsByDifficulty('beginner');
        
        // 按诗词总字数排序（从少到多）
        this.levelPoems = beginnerPoems.sort((a, b) => {
            const totalCharsA = a.content.join('').length;
            const totalCharsB = b.content.join('').length;
            return totalCharsA - totalCharsB;
        }).slice(0, this.maxLevels); // 只取前10首
        
        console.log('关卡诗词已按字数排序:', this.levelPoems.map(p => ({
            title: p.title,
            totalChars: p.content.join('').length
        })));
    }

    // 更新游戏界面
    updateGameInterface() {
        if (!this.currentPoem) return;

        // 更新诗词信息
        const titleElement = document.getElementById('poemTitle');
        const authorElement = document.getElementById('poemAuthor');
        
        if (titleElement) titleElement.textContent = this.currentPoem.title;
        if (authorElement) authorElement.textContent = `${this.currentPoem.author} · ${this.currentPoem.dynasty}`;

        // 更新诗词内容
        this.updatePoemContent();
        
        // 更新选项
        this.updateOptions();
        
        // 重置按钮状态
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.display = 'inline-block';
        }
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    }

    // 更新诗词内容显示
    updatePoemContent() {
        const contentElement = document.getElementById('poemContent');
        if (!contentElement || !this.currentPoem.displayContent) return;

        contentElement.innerHTML = '';
        
        this.currentPoem.displayContent.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'poem-line';
            
            if (line.isMissing) {
                lineElement.classList.add('missing-line');
                lineElement.textContent = line.text;
            } else {
                lineElement.textContent = line.text;
            }
            
            contentElement.appendChild(lineElement);
        });
    }

    // 更新选项显示
    updateOptions() {
        const optionsContainer = document.getElementById('optionsContainer');
        if (!optionsContainer || !this.currentPoem.options) return;

        optionsContainer.innerHTML = '';
        
        this.currentPoem.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-btn';
            optionButton.textContent = option;
            optionButton.dataset.option = option;
            optionButton.dataset.index = index;
            
            optionButton.addEventListener('click', () => {
                this.selectOption(option, optionButton);
            });
            
            optionsContainer.appendChild(optionButton);
        });
    }

    // 选择选项
    selectOption(option, buttonElement) {
        // 清除之前的选择
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => btn.classList.remove('selected'));
        
        // 标记当前选择
        buttonElement.classList.add('selected');
        this.selectedOption = option;
        
        console.log('选择了选项:', option);
        
        // 立即自动提交答案
        this.submitAnswer();
    }

    // 提交答案
    submitAnswer() {
        if (!this.selectedOption || !this.currentPoem) {
            return;
        }

        const isCorrect = this.selectedOption === this.currentPoem.correctAnswer;
        this.gameStats.total++;
        
        if (isCorrect) {
            this.gameStats.correct++;
            this.score += 10;
        }

        // 更新选项样式
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            const option = btn.dataset.option;
            if (option === this.currentPoem.correctAnswer) {
                btn.classList.add('correct');
            } else if (option === this.selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });

        // 更新按钮状态
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (submitBtn) submitBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'inline-block';

        // 更新分数
        this.updateScore();
        
        // 根据答题结果决定下一步行为
        if (isCorrect) {
            // 答对了，显示结果反馈并进入下一题
            this.showResultFeedback(isCorrect, true);
        } else {
            // 答错了，显示结果反馈但不自动进入下一题，而是重新出题
            this.showResultFeedback(isCorrect, false);
            // 延迟后重新出题（同一关卡）
            setTimeout(() => {
                this.retryCurrentLevel();
            }, 2000);
        }
        
        console.log('答案提交:', {
            selected: this.selectedOption,
            correct: this.currentPoem.correctAnswer,
            isCorrect: isCorrect,
            score: this.score,
            currentLevel: this.currentLevel
        });
    }

    // 显示结果反馈
    showResultFeedback(isCorrect, clickToNext = false) {
        const feedbackElement = document.getElementById('resultFeedback');
        const iconElement = document.getElementById('feedbackIcon');
        const textElement = document.getElementById('feedbackText');
        const animationElement = document.getElementById('characterAnimation');
        
        if (!feedbackElement) return;

        // 清除之前可能存在的事件监听器
        const oldClickHandler = feedbackElement._clickHandler;
        if (oldClickHandler) {
            feedbackElement.removeEventListener('click', oldClickHandler);
            const feedbackContent = feedbackElement.querySelector('.feedback-content');
            if (feedbackContent) {
                feedbackContent.removeEventListener('click', oldClickHandler);
            }
        }

        // 设置反馈内容
        if (isCorrect) {
            iconElement.textContent = '✅';
            textElement.textContent = '回答正确！';
            animationElement.style.display = 'block';
        } else {
            iconElement.textContent = '❌';
            textElement.textContent = '答案错误，继续加油！';
            animationElement.style.display = 'none';
        }

        // 显示反馈
        feedbackElement.style.display = 'flex';
        
        // 创建新的点击处理函数
        const clickHandler = (event) => {
            event.stopPropagation();
            event.preventDefault();
            
            // 立即隐藏窗口
            this.hideResultFeedback();
            
            // 移除事件监听器
            feedbackElement.removeEventListener('click', clickHandler);
            const feedbackContent = feedbackElement.querySelector('.feedback-content');
            if (feedbackContent) {
                feedbackContent.removeEventListener('click', clickHandler);
            }
            feedbackElement._clickHandler = null;
            
            // 如果需要进入下一题
            if (clickToNext) {
                // 使用setTimeout确保窗口先关闭再进入下一题
                setTimeout(() => {
                    this.nextQuestion();
                }, 100);
            }
        };
        
        // 保存处理函数引用以便后续清理
        feedbackElement._clickHandler = clickHandler;
        
        // 添加点击事件监听器
        feedbackElement.addEventListener('click', clickHandler);
        
        // 为内容区域也添加点击事件
        const feedbackContent = feedbackElement.querySelector('.feedback-content');
        if (feedbackContent) {
            feedbackContent.addEventListener('click', clickHandler);
        }
    }

    // 隐藏结果反馈
    hideResultFeedback() {
        const feedbackElement = document.getElementById('resultFeedback');
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
            
            // 清理事件监听器
            const clickHandler = feedbackElement._clickHandler;
            if (clickHandler) {
                feedbackElement.removeEventListener('click', clickHandler);
                const feedbackContent = feedbackElement.querySelector('.feedback-content');
                if (feedbackContent) {
                    feedbackContent.removeEventListener('click', clickHandler);
                }
                feedbackElement._clickHandler = null;
            }
        }
    }

    // 下一题
    nextQuestion() {
        // 移除点击监听器
        if (this.clickToNextHandler) {
            document.removeEventListener('click', this.clickToNextHandler);
            this.clickToNextHandler = null;
        }
        
        // 重置选择状态
        this.selectedOption = null;
        
        // 隐藏结果反馈（如果还没有隐藏的话）
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.style.display = 'none';
            // 移除提示信息
            const hintElement = resultDiv.querySelector('.click-hint');
            if (hintElement) {
                hintElement.remove();
            }
        }
        
        // 启用所有选项按钮
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // 进入下一关
        this.currentLevel++;
        
        // 开始新的游戏
        this.startBeginnerGame();
    }

    // 显示通关完成信息
    showCompletionMessage() {
        const gameContainer = document.querySelector('.beginner-game');
        if (!gameContainer) return;
        
        // 保存成绩到排行榜
        const playerData = {
            username: this.currentUser.name,
            score: this.score,
            accuracy: this.gameStats.total > 0 ? Math.round((this.gameStats.correct / this.gameStats.total) * 100) : 0,
            playTime: this.formatPlayTime(new Date() - this.gameStats.startTime)
        };
        this.saveToLeaderboard('beginner', playerData);
        
        gameContainer.innerHTML = `
            <div class="completion-container">
                <div class="completion-header">
                    <h2>🎉 恭喜通关！</h2>
                    <p>您已成功完成所有${this.maxLevels}关古诗词挑战！</p>
                </div>
                
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-label">总得分：</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">正确率：</span>
                        <span class="stat-value">${this.gameStats.total > 0 ? Math.round((this.gameStats.correct / this.gameStats.total) * 100) : 0}%</span>
                    </div>
                </div>
                
                <div class="completion-message">
                    <p>感谢您参与古诗词学习游戏！</p>
                    <p>通过这次挑战，您不仅复习了经典诗词，还提升了文学素养。</p>
                    <p>希望这些千古传诵的诗句能在您心中留下美好的印象。</p>
                </div>
                
                <div class="completion-actions">
                    <button class="btn-primary" onclick="app.showFeedbackForm()">留下反馈</button>
                    <button class="btn-secondary" onclick="app.restartGame()">重新开始</button>
                </div>
            </div>
        `;
    }

    // 格式化游戏时间
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}分${remainingSeconds.toString().padStart(2, '0')}秒`;
    }



    // 重新开始游戏
    restartGame() {
        console.log('🔄 重新开始游戏被调用');
        
        // 重置游戏状态（保留积分）
        this.currentLevel = 1;
        this.completedLevels = 0;
        // 保留积分不清零：this.score = 0;
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: new Date()
        };
        this.selectedOption = null;
        this.levelPoems = []; // 清空关卡诗词，重新初始化
        
        console.log('✅ 游戏状态已重置（积分保留）:', {
            currentLevel: this.currentLevel,
            score: this.score,
            levelPoemsLength: this.levelPoems.length
        });
        
        // 重新显示游戏界面
        this.showScreen('game');
        console.log('📺 切换到游戏界面');
        
        // 确保游戏容器存在并重新初始化完整的游戏界面
        const gameContainer = document.querySelector('.beginner-game');
        console.log('🎮 检查游戏容器:', gameContainer ? '存在' : '不存在');
        
        if (!gameContainer) {
            // 如果游戏容器不存在，重新创建完整的游戏界面
            const gameScreen = document.getElementById('gameScreen');
            console.log('🖥️ 游戏屏幕元素:', gameScreen ? '存在' : '不存在');
            
            if (gameScreen) {
                // 重新创建完整的游戏界面结构
                const gameHeader = gameScreen.querySelector('.game-header');
                const existingBeginnerGame = gameScreen.querySelector('.beginner-game');
                const resultFeedback = gameScreen.querySelector('.result-feedback');
                
                console.log('🔍 DOM元素检查:', {
                    gameHeader: gameHeader ? '存在' : '不存在',
                    existingBeginnerGame: existingBeginnerGame ? '存在' : '不存在',
                    resultFeedback: resultFeedback ? '存在' : '不存在'
                });
                
                // 如果beginner-game不存在，创建完整结构
                if (!existingBeginnerGame) {
                    console.log('🏗️ 创建新的游戏界面结构');
                    const beginnerGameHTML = `
                        <div class="beginner-game" id="beginnerGame">
                            <div class="poem-display">
                                <div class="poem-info">
                                    <h3 class="poem-title" id="poemTitle">静夜思</h3>
                                    <p class="poem-author" id="poemAuthor">李白</p>
                                </div>
                                
                                <div class="poem-content" id="poemContent">
                                    <!-- 诗句将通过JavaScript动态生成 -->
                                </div>
                            </div>

                            <div class="options-container" id="optionsContainer">
                                <!-- 选项将通过JavaScript动态生成 -->
                            </div>

                            <div class="game-controls">
                                <button class="submit-btn" id="submitBtn" disabled>提交答案</button>
                                <button class="next-btn" id="nextBtn" style="display: none;">下一题</button>
                            </div>
                        </div>
                    `;
                    
                    // 插入到game-header之后，result-feedback之前
                    if (gameHeader && resultFeedback) {
                        gameHeader.insertAdjacentHTML('afterend', beginnerGameHTML);
                        console.log('✅ 在header和feedback之间插入游戏界面');
                    } else if (gameHeader) {
                        gameHeader.insertAdjacentHTML('afterend', beginnerGameHTML);
                        console.log('✅ 在header之后插入游戏界面');
                    } else {
                        gameScreen.insertAdjacentHTML('afterbegin', beginnerGameHTML);
                        console.log('✅ 在游戏屏幕开头插入游戏界面');
                    }
                }
            }
        } else {
            // 如果容器存在但可能内容被清空，确保有完整结构
            const poemDisplay = gameContainer.querySelector('.poem-display');
            console.log('📝 诗词显示区域:', poemDisplay ? '存在' : '不存在');
            
            if (!poemDisplay) {
                console.log('🔧 修复游戏容器内容');
                gameContainer.innerHTML = `
                    <div class="poem-display">
                        <div class="poem-info">
                            <h3 class="poem-title" id="poemTitle">静夜思</h3>
                            <p class="poem-author" id="poemAuthor">李白</p>
                        </div>
                        
                        <div class="poem-content" id="poemContent">
                            <!-- 诗句将通过JavaScript动态生成 -->
                        </div>
                    </div>

                    <div class="options-container" id="optionsContainer">
                        <!-- 选项将通过JavaScript动态生成 -->
                    </div>

                    <div class="game-controls">
                        <button class="submit-btn" id="submitBtn" disabled>提交答案</button>
                        <button class="next-btn" id="nextBtn" style="display: none;">下一题</button>
                    </div>
                `;
            }
        }
        
        console.log('🚀 开始调用startBeginnerGame');
        this.startBeginnerGame();
        console.log('📊 更新分数显示');
        this.updateScore();
    }

    // 更新分数显示
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `得分: ${this.score}`;
        }
    }

    // 重置游戏
    resetGame() {
        this.currentPoem = null;
        this.selectedOption = null;
        this.score = 0;
        this.currentLevel = 1;
        this.completedLevels = 0;
        this.levelPoems = [];
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: null
        };
        this.updateScore();
    }

    // 显示反馈表单
    showFeedbackForm() {
        const gameContainer = document.querySelector('.beginner-game');
        if (!gameContainer) return;
        
        gameContainer.innerHTML = `
            <div class="feedback-container">
                <div class="feedback-header">
                    <h2>📝 留下您的反馈</h2>
                    <p>您的意见对我们非常重要，帮助我们改进游戏体验</p>
                </div>
                
                <form class="feedback-form" id="feedbackForm">
                    <div class="form-group">
                        <label for="userName">姓名：</label>
                        <input type="text" id="userName" name="userName" placeholder="请输入您的姓名（默认：${this.currentUser.name}）" value="${this.currentUser.name}">
                    </div>
                    
                    <div class="form-group">
                        <label for="userContact">联系方式：</label>
                        <input type="text" id="userContact" name="userContact" placeholder="邮箱或微信（可选）">
                    </div>
                    
                    <div class="form-group">
                        <label for="userFeedback">意见和建议：</label>
                        <textarea id="userFeedback" name="userFeedback" rows="4" placeholder="请分享您的游戏体验、建议或意见（可选）"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-primary" onclick="app.submitFeedback()">提交反馈</button>
                        <button type="button" class="btn-secondary" onclick="app.skipFeedback()">没意见</button>
                    </div>
                </form>
            </div>
        `;
    }

    // 提交反馈
    async submitFeedback() {
        const form = document.getElementById('feedbackForm');
        if (!form) return;
        
        const formData = {
            userName: form.userName.value || '游客',
            userContact: form.userContact.value || '',
            userFeedback: form.userFeedback.value || '',
            gameStats: this.getGameStats(),
            timestamp: new Date().toISOString()
        };
        
        try {
            // 显示提交中状态
            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;
            
            // 调用Supabase提交数据
            await this.submitToSupabase(formData);
            
            // 显示成功信息
            this.showFeedbackSuccess();
            
        } catch (error) {
            console.error('提交反馈失败:', error);
            alert('提交失败，请稍后重试');
            
            // 恢复按钮状态
            const submitBtn = form.querySelector('.btn-primary');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // 跳过反馈
    skipFeedback() {
        this.showFeedbackSuccess('感谢您的参与！');
    }

    // 显示反馈成功页面
    showFeedbackSuccess(message = '感谢您的反馈！') {
        const gameContainer = document.querySelector('.beginner-game');
        if (!gameContainer) return;
        
        gameContainer.innerHTML = `
            <div class="feedback-success">
                <div class="success-icon">✅</div>
                <h2>${message}</h2>
                <p>您的反馈已成功提交，我们会认真考虑您的建议。</p>
                <div class="success-actions">
                    <button class="btn-primary" onclick="app.restartGame()">再玩一次</button>
                    <button class="btn-secondary" onclick="app.showScreen('welcome')">返回首页</button>
                </div>
            </div>
        `;
    }

    // 提交反馈到Supabase数据库
    async submitToSupabase(feedbackData) {
        try {
            // 检查配置是否存在
            if (!window.SUPABASE_CONFIG) {
                console.error('Supabase配置未找到');
                return { success: false, error: 'Configuration not found' };
            }

            const { url, anonKey, feedbackTable } = window.SUPABASE_CONFIG;
            
            // 检查配置是否完整
            if (!url || !anonKey || url.includes('your-project-id') || anonKey.includes('your-anon-key')) {
                console.warn('Supabase配置未完成，使用模拟模式');
                // 模拟网络延迟
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, id: Date.now(), mode: 'simulation' };
            }

            // 准备要提交的数据
            const submitData = {
                ...feedbackData,
                created_at: new Date().toISOString(),
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`
            };

            // 发送到Supabase
            const response = await fetch(`${url}/rest/v1/${feedbackTable}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('反馈提交成功');
            return { success: true, id: Date.now(), mode: 'production' };

        } catch (error) {
            console.error('提交反馈时出错:', error);
            
            // 如果是网络错误，尝试本地存储作为备份
            try {
                const localFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
                localFeedback.push({
                    ...feedbackData,
                    timestamp: Date.now(),
                    status: 'pending'
                });
                localStorage.setItem('pendingFeedback', JSON.stringify(localFeedback));
                console.log('反馈已保存到本地存储，等待网络恢复后重试');
            } catch (localError) {
                console.error('本地存储失败:', localError);
            }

            return { success: false, error: error.message };
        }
    }

    // 获取游戏统计
    getGameStats() {
        const accuracy = this.gameStats.total > 0 ? 
            Math.round((this.gameStats.correct / this.gameStats.total) * 100) : 0;

        const playTime = this.gameStats.startTime ? 
            Math.round((new Date() - this.gameStats.startTime) / 1000) : 0;

        return {
            ...this.gameStats,
            accuracy: accuracy,
            playTime: playTime,
            score: this.score,
            currentLevel: this.currentLevel,
            maxLevels: this.maxLevels
        };
    }
}

// 应用实例
let app;

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化应用...');
    app = new PoemLearningApp();
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
});

// 导出应用实例（用于调试）
window.PoemApp = app;