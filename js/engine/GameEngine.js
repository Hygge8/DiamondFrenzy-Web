/**
 * 游戏引擎
 * 整个游戏的核心引擎，负责游戏循环、资源管理、场景切换等
 */
// 模块导入（在浏览器环境中，这些类应该通过 <script> 标签全局可用）
const AssetManager = window.AssetManager;
const InputManager = window.InputManager;
const AudioManager = window.AudioManager;
const SceneManager = window.SceneManager;
const LevelManager = window.LevelManager;
const EnemyManager = window.EnemyManager;

// 场景类
const MainMenuScene = window.MainMenuScene;
const GameScene = window.GameScene;
const LevelSelectScene = window.LevelSelectScene;
const SettingsScene = window.SettingsScene;
const HelpScene = window.HelpScene;
// const AssetManager = require('./AssetManager');
// const InputManager = require('./InputManager');
// const AudioManager = require('./AudioManager');
// const SceneManager = require('./SceneManager');
// const LevelManager = require('../systems/LevelManager');
// const EnemyManager = require('../systems/EnemyManager');

// 场景类
// const MainMenuScene = require('../scenes/MainMenuScene');
// const GameScene = require('../scenes/GameScene');
// const LevelSelectScene = require('../scenes/LevelSelectScene');
// const SettingsScene = require('../scenes/SettingsScene');
// const HelpScene = require('../scenes/HelpScene');

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
    this.assetManager = new AssetManager();
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.sceneManager = new SceneManager(); // 立即初始化

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
    this.onLevelComplete = null;
    this.onLevelFail = null;

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
      this.assetManager.setProgressCallback(progress => {
        this._updateLoadingProgress(progress);
      });

      this.assetManager.setCompleteCallback(() => {
        this._onAssetsLoaded();
      });

      // 加载资源
      if (options.loadAssets !== false) {
        await this.assetManager.loadAll();
      }

      // 初始化游戏系统
      await this._initGameSystems();

      // 注册场景
      this._registerScenes();

      // 绑定关卡管理器回调
      this.levelManager.onLevelComplete = this._onLevelComplete.bind(this);
      this.levelManager.onLevelFail = this._onLevelFail.bind(this);

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

    try {
      this.isRunning = true;
      this.isPaused = false;
      this.lastTime = performance.now();

      // 开始游戏循环
      this._gameLoop();
    } catch (e) {
      console.error('游戏引擎启动失败:', e);
      this.isRunning = false;
    }
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
   * 设置关卡完成回调
   * @param {Function} callback - 回调函数
   */
  setLevelCompleteCallback(callback) {
    this.onLevelComplete = callback;
  }

  /**
   * 设置关卡失败回调
   * @param {Function} callback - 回调函数
   */
  setLevelFailCallback(callback) {
    this.onLevelFail = callback;
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
      assetManager: this.assetManager,
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
        height: this.canvas.height,
      },
    };
  }



  /**
   * 更新加载进度
   * @private
   */
  _updateLoadingProgress(progress) {
    // 可以在这里更新加载界面
    console.log(`资源加载进度: ${progress}%`);
  }

  /**
   * 资源加载完成
   * @private
   */
  _onAssetsLoaded() {
    console.log('资源加载完成');
  }

  /**
   * 注册场景
   * @private
   */
  _registerScenes() {
    // 注册游戏场景
    this.sceneManager.registerScene('mainMenu', new MainMenuScene(this));
    this.sceneManager.registerScene('game', new GameScene(this));
    this.sceneManager.registerScene('levelSelect', new LevelSelectScene(this));
    this.sceneManager.registerScene('settings', new SettingsScene(this));
    this.sceneManager.registerScene('help', new HelpScene(this));
  }

  /**
   * 初始化游戏系统
   * @private
   */
  async _initGameSystems() {
    // 初始化场景管理器
    this.sceneManager.setSceneChangeCallback(this._onSceneChange.bind(this));

    // 【新增】初始化音频管理器
    this.audioManager.init(this.assetManager);

    // 初始化音频管理器
    this.audioManager.init(this.assetManager);

    // 初始化关卡管理器
    this.levelManager.initEnemyManager(this.enemyManager);
    this.levelManager.setGameState(this.getGameState());


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
    this.onLevelComplete = null;
    this.onLevelFail = null;
  }

  /**
   * 关卡完成回调
   * @private
   */
  _onLevelComplete(data) {
    if (this.onLevelComplete) {
      this.onLevelComplete(data);
    }
  }

  /**
   * 关卡失败回调
   * @private
   */
  _onLevelFail(data) {
    if (this.onLevelFail) {
      this.onLevelFail(data);
    }
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
   * 处理窗口大小改变
   * @private
   */
  _handleResize() {
    this._setupCanvas();
    // 可以在这里添加其他响应式处理
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

    // 更新关卡管理器
    this.levelManager.update(this.deltaTime);

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
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染场景
    this.sceneManager.render(this.ctx);

    // 渲染调试信息
    if (this.debugMode) {
      this._renderDebugInfo();
    }

    // 触发渲染回调
    if (this.onRender) {
      this.onRender(this.ctx);
    }
  }
















}



window.GameEngine = GameEngine;

window.GameEngine = GameEngine;
