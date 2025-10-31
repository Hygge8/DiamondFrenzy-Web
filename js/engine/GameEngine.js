/**
 * 游戏引擎
 * 整个游戏的核心引擎，负责游戏循环、资源管理、场景切换等
 */
class GameEngine {
    constructor(canvasId) {
        // 画布和上下文
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`画布元素未找到: ${canvasId}`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('无法获取画布上下文');
        }
        
        // 引擎组件
        this.sceneManager = new SceneManager();
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.assetManager = new AssetManager();
        
        // 游戏系统管理器
        this.levelManager = new LevelManager();
        this.enemyManager = new EnemyManager();
        
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.isInitialized = false;
        
        // 时间管理
        this.lastTime = 0;
        this.currentTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        // 游戏循环
        this.gameLoop = null;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 调试信息
        this.debugMode = false;
        this.showFPS = false;
        this.showDebugInfo = false;
        
        // 回调函数
        this.onInit = null;
        this.onUpdate = null;
        this.onRender = null;
        this.onPause = null;
        this.onResume = null;
        this.onShutdown = null;
        
        // 初始化引擎
        this._setupCanvas();
        this._bindEvents();
    }
    
    /**
     * 初始化游戏引擎
     * @param {Object} options - 初始化选项
     * @returns {Promise} 初始化完成的Promise
     */
    async init(options = {}) {
        if (this.isInitialized) {
            console.warn('游戏引擎已经初始化');
            return;
        }
        
        console.log('初始化游戏引擎...');
        
        try {
            // 设置画布
            this._setupCanvas();
            
            // 设置资源加载回调
            this.assetManager.setProgressCallback((progress) => {
                this._updateLoadingProgress(progress);
            });
            
            this.assetManager.setCompleteCallback(() => {
                this._onAssetsLoaded();
            });
            
            // 加载资源
            if (options.loadAssets !== false) {
                await this.assetManager.loadAll();
            }
            
            // 注册场景
            this._registerScenes();
            
            // 初始化游戏系统
            await this._initGameSystems();
            
            // 设置初始场景
            if (options.initialScene) {
                await this.sceneManager.changeScene(options.initialScene);
            }
            
            this.isInitialized = true;
            
            // 触发初始化回调
            if (this.onInit) {
                this.onInit();
            }
            
            console.log('游戏引擎初始化完成');
            
        } catch (error) {
            console.error('游戏引擎初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 启动游戏引擎
     */
    start() {
        if (!this.isInitialized) {
            console.error('游戏引擎尚未初始化');
            return;
        }
        
        if (this.isRunning) {
            console.warn('游戏引擎已经在运行');
            return;
        }
        
        console.log('启动游戏引擎...');
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        // 开始游戏循环
        this._gameLoop();
    }
    
    /**
     * 停止游戏引擎
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        console.log('停止游戏引擎...');
        
        this.isRunning = false;
        
        // 取消动画帧
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 触发关闭回调
        if (this.onShutdown) {
            this.onShutdown();
        }
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        console.log('暂停游戏');
        this.isPaused = true;
        
        // 暂停音频
        this.audioManager.pauseMusic();
        
        // 触发暂停回调
        if (this.onPause) {
            this.onPause();
        }
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        if (!this.isRunning || !this.isPaused) {
            return;
        }
        
        console.log('恢复游戏');
        this.isPaused = false;
        
        // 恢复音频
        this.audioManager.resumeMusic();
        
        // 重置时间
        this.lastTime = performance.now();
        
        // 触发恢复回调
        if (this.onResume) {
            this.onResume();
        }
    }
    
    /**
     * 切换暂停/恢复状态
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * 设置目标FPS
     * @param {number} fps - 目标帧率
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(1, Math.min(120, fps));
        this.frameInterval = 1000 / this.targetFPS;
    }
    
    /**
     * 启用/禁用调试模式
     * @param {boolean} enabled - 是否启用
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.showFPS = enabled;
        this.showDebugInfo = enabled;
    }
    
    /**
     * 切换调试模式
     */
    toggleDebugMode() {
        this.setDebugMode(!this.debugMode);
    }
    
    /**
     * 设置初始化回调
     * @param {Function} callback - 回调函数
     */
    setInitCallback(callback) {
        this.onInit = callback;
    }
    
    /**
     * 设置更新回调
     * @param {Function} callback - 回调函数
     */
    setUpdateCallback(callback) {
        this.onUpdate = callback;
    }
    
    /**
     * 设置渲染回调
     * @param {Function} callback - 回调函数
     */
    setRenderCallback(callback) {
        this.onRender = callback;
    }
    
    /**
     * 设置暂停回调
     * @param {Function} callback - 回调函数
     */
    setPauseCallback(callback) {
        this.onPause = callback;
    }
    
    /**
     * 设置恢复回调
     * @param {Function} callback - 回调函数
     */
    setResumeCallback(callback) {
        this.onResume = callback;
    }
    
    /**
     * 设置关闭回调
     * @param {Function} callback - 回调函数
     */
    setShutdownCallback(callback) {
        this.onShutdown = callback;
    }
    
    /**
     * 获取游戏状态
     * @returns {Object} 游戏状态
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isInitialized: this.isInitialized,
            currentScene: this.sceneManager.getCurrentScene()?.name || null,
            fps: this.fps,
            frameCount: this.frameCount,
            deltaTime: this.deltaTime,
            levelManager: this.levelManager,
            enemyManager: this.enemyManager,
            audioManager: this.audioManager,
            inputManager: this.inputManager,
            assetManager: this.assetManager
        };
    }
    
    /**
     * 获取性能统计信息
     * @returns {Object} 性能统计
     */
    getPerformanceStats() {
        return {
            fps: this.fps,
            frameCount: this.frameCount,
            deltaTime: this.deltaTime,
            targetFPS: this.targetFPS,
            memoryUsage: this._getMemoryUsage(),
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        };
    }
    
    /**
     * 销毁游戏引擎
     */
    destroy() {
        console.log('销毁游戏引擎...');
        
        // 停止引擎
        this.stop();
        
        // 销毁各个组件
        this.sceneManager.destroy();
        this.assetManager.unloadAll();
        this.audioManager.destroy();
        
        // 销毁游戏系统
        if (this.levelManager) {
            this.levelManager.clearAllEnemies();
        }
        if (this.enemyManager) {
            this.enemyManager.clearAllEnemies();
        }
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 重置状态
        this.isInitialized = false;
        this.lastTime = 0;
        this.currentTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        
        // 清空回调
        this.onInit = null;
        this.onUpdate = null;
        this.onRender = null;
        this.onPause = null;
        this.onResume = null;
        this.onShutdown = null;
    }
    
    /**
     * 设置画布
     * @private
     */
    _setupCanvas() {
        // 设置画布尺寸
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || 800;
        this.canvas.height = rect.height || 600;
        
        // 设置画布样式
        this.ctx.imageSmoothingEnabled = false; // 像素风格游戏
        
        // 设置变换原点
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            this._handleResize();
        });
        
        // 键盘事件
        this.inputManager.addKeyDownCallback('Escape', () => {
            this.togglePause();
        });
        
        // 游戏手柄事件
        this.inputManager.addKeyDownCallback('F1', () => {
            this.toggleDebugMode();
        });
    }
    
    /**
     * 游戏主循环
     * @private
     */
    _gameLoop() {
        if (!this.isRunning) {
            return;
        }
        
        this.gameLoop = requestAnimationFrame(() => this._gameLoop());
        
        // 计算时间
        this.currentTime = performance.now();
        this.deltaTime = this.currentTime - this.lastTime;
        
        // 限制帧率
        if (this.deltaTime < this.frameInterval) {
            return;
        }
        
        // 更新FPS
        this._updateFPS();
        
        // 更新游戏状态
        if (!this.isPaused) {
            this._update();
        }
        
        // 渲染游戏
        this._render();
        
        this.lastTime = this.currentTime;
    }
    
    /**
     * 更新游戏状态
     * @private
     */
    _update() {
        // 更新输入管理器
        this.inputManager.update();
        
        // 更新场景管理器
        this.sceneManager.update(this.deltaTime);
        
        // 更新游戏系统
        if (this.levelManager && this.levelManager.isLevelLoaded) {
            this.levelManager.update(this.deltaTime / 1000); // 转换为秒
        }
        
        // 触发更新回调
        if (this.onUpdate) {
            this.onUpdate(this.deltaTime);
        }
    }
    
    /**
     * 渲染游戏
     * @private
     */
    _render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置背景色
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染当前场景
        this.sceneManager.render(this.ctx);
        
        // 渲染游戏系统
        if (this.levelManager && this.levelManager.isLevelLoaded) {
            this.levelManager.render(this.ctx);
        }
        
        // 渲染调试信息
        if (this.debugMode) {
            this._renderDebugInfo();
        }
        
        // 触发渲染回调
        if (this.onRender) {
            this.onRender(this.ctx);
        }
    }
    
    /**
     * 更新FPS
     * @private
     */
    _updateFPS() {
        this.frameCount++;
        this.fpsUpdateTime += this.deltaTime;
        
        if (this.fpsUpdateTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / this.fpsUpdateTime);
            this.frameCount = 0;
            this.fpsUpdateTime = 0;
        }
    }
    
    /**
     * 渲染调试信息
     * @private
     */
    _renderDebugInfo() {
        this.ctx.save();
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#00ff00';
        this.ctx.textAlign = 'left';
        
        let y = 20;
        const lineHeight = 16;
        
        // FPS信息
        if (this.showFPS) {
            this.ctx.fillText(`FPS: ${this.fps}`, 10, y);
            y += lineHeight;
        }
        
        // 场景信息
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene) {
            this.ctx.fillText(`Scene: ${currentScene.name}`, 10, y);
            y += lineHeight;
        }
        
        // 性能信息
        if (this.showDebugInfo) {
            this.ctx.fillText(`DeltaTime: ${this.deltaTime.toFixed(2)}ms`, 10, y);
            y += lineHeight;
            
            this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, y);
            y += lineHeight;
            
            // 输入状态
            const stats = this.inputManager.getStats();
            this.ctx.fillText(`Keys: ${stats.keysPressed.length}`, 10, y);
            y += lineHeight;
            
            this.ctx.fillText(`Mouse: (${stats.mousePosition.x}, ${stats.mousePosition.y})`, 10, y);
            y += lineHeight;
        }
        
        this.ctx.restore();
    }
    
    /**
     * 处理窗口大小改变
     * @private
     */
    _handleResize() {
        this._setupCanvas();
    }
    
    /**
     * 注册场景
     * @private
     */
    _registerScenes() {
        // 这里需要注册实际的游戏场景
        // 由于文件较多，这里先注册一个基础场景作为示例
        const mainMenuScene = new MainMenuScene();
        this.sceneManager.registerScene('mainMenu', mainMenuScene);
        
        // 其他场景将在后续添加
        // const gameScene = new GameScene();
        // this.sceneManager.registerScene('game', gameScene);
    }
    
    /**
     * 初始化游戏系统
     * @private
     */
    async _initGameSystems() {
        console.log('初始化游戏系统...');
        
        // 初始化关卡管理器
        this.levelManager.setGameState(this.getGameState());
        
        // 初始化敌人管理器
        this.enemyManager.setGameState(this.getGameState());
        this.levelManager.initEnemyManager(this.enemyManager);
        
        console.log('游戏系统初始化完成');
    }
    
    /**
     * 更新加载进度
     * @param {number} progress - 进度百分比
     * @private
     */
    _updateLoadingProgress(progress) {
        const progressElement = document.getElementById('loading-progress');
        const textElement = document.getElementById('loading-text');
        
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
        
        if (textElement) {
            textElement.textContent = `${Math.round(progress)}%`;
        }
    }
    
    /**
     * 资源加载完成
     * @private
     */
    _onAssetsLoaded() {
        console.log('所有资源加载完成');
        
        // 隐藏加载界面
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
        
        // 显示主菜单
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.add('active');
        }
    }
    
    /**
     * 获取内存使用情况
     * @returns {Object} 内存使用信息
     * @private
     */
    _getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
}

/**
 * 主菜单场景（示例）
 */
class MainMenuScene extends Scene {
    constructor() {
        super();
    }
    
    async init(data) {
        await super.init(data);
        console.log('主菜单场景初始化');
    }
    
    update(deltaTime) {
        // 主菜单更新逻辑
    }
    
    render(ctx) {
        // 主菜单渲染逻辑
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('主菜单', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
    
    exit() {
        super.exit();
        console.log('退出主菜单场景');
    }
}