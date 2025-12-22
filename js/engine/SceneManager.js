/**
 * 场景管理器
 * 负责管理游戏中的不同场景（菜单、游戏、设置等）
 */
class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.currentScene = null;
    this.previousScene = null;
    this.sceneStack = [];
    this.isTransitioning = false;

    // 场景切换配置
    this.transitionConfig = {
      duration: 500, // 切换动画持续时间（毫秒）
      type: 'fade', // 切换类型：'fade', 'slide', 'none'
      easing: 'easeInOutCubic', // 缓动函数
    };

    // 回调函数
    this.onSceneChange = null;
    this.onTransitionStart = null;
    this.onTransitionEnd = null;
  }

  /**
   * 注册场景
   * @param {string} name - 场景名称
   * @param {Scene} scene - 场景实例
   */
  registerScene(name, scene) {
    if (!scene || typeof scene.update !== 'function' || typeof scene.render !== 'function') {
      console.error('场景必须实现update和render方法');
      return;
    }

    scene.name = name;
    this.scenes.set(name, scene);

    // 如果是第一个场景，设为当前场景
    if (this.scenes.size === 1) {
      this.currentScene = scene;
    }
  }

  /**
   * 切换到指定场景
   * @param {string} sceneName - 场景名称
   * @param {Object} data - 传递给场景的数据
   * @param {Object} options - 切换选项
   */
  async changeScene(sceneName, data = null, options = {}) {
    if (this.isTransitioning) {
      console.warn('场景切换正在进行中，请等待');
      return;
    }

    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      console.error(`场景未找到: ${sceneName}`);
      return;
    }

    // 如果是当前场景，不做任何操作
    if (this.currentScene === newScene) {
      return;
    }

    this.isTransitioning = true;

    // 触发切换开始回调
    if (this.onTransitionStart) {
      this.onTransitionStart(this.currentScene, newScene);
    }

    try {
      // 执行切换动画
      await this._performTransition(newScene, options);

      // 保存当前场景到栈中
      if (this.currentScene) {
        this.sceneStack.push(this.currentScene);
      }

      // 退出当前场景
      if (this.currentScene && typeof this.currentScene.exit === 'function') {
        this.currentScene.exit();
      }

      // 设置新场景
      this.previousScene = this.currentScene;
      this.currentScene = newScene;

      // 初始化新场景
      if (typeof newScene.init === 'function') {
        await newScene.init(data);
      }

      // 触发场景改变回调
      if (this.onSceneChange) {
        this.onSceneChange(this.previousScene, this.currentScene);
      }
    } catch (error) {
      console.error('场景切换失败:', error);
    } finally {
      this.isTransitioning = false;

      // 触发切换结束回调
      if (this.onTransitionEnd) {
        this.onTransitionEnd(this.previousScene, this.currentScene);
      }
    }
  }

  /**
   * 返回上一个场景
   * @param {Object} data - 传递给场景的数据
   */
  async goBack(data = null) {
    if (this.sceneStack.length === 0) {
      console.warn('没有可返回的场景');
      return;
    }

    const previousScene = this.sceneStack.pop();
    await this.changeScene(previousScene.name, data);
  }

  /**
   * 返回主菜单
   * @param {Object} data - 传递给场景的数据
   */
  async goToMainMenu(data = null) {
    // 清空场景栈
    this.sceneStack = [];
    await this.changeScene('mainMenu', data);
  }

  /**
   * 重新开始游戏
   * @param {Object} data - 传递给场景的数据
   */
  async restartGame(data = null) {
    // 清空场景栈，返回游戏场景
    this.sceneStack = [];
    await this.changeScene('game', data);
  }

  /**
   * 执行场景切换动画
   * @param {Scene} newScene - 新场景
   * @param {Object} options - 切换选项
   * @returns {Promise} 切换完成的Promise
   * @private
   */
  async _performTransition(newScene, options) {
    const transitionType = options.type || this.transitionConfig.type;
    const duration = options.duration || this.transitionConfig.duration;

    switch (transitionType) {
    case 'fade':
      return this._fadeTransition(newScene, duration);
    case 'slide':
      return this._slideTransition(newScene, duration);
    case 'none':
    default:
      return Promise.resolve();
    }
  }

  /**
   * 淡入淡出切换
   * @param {Scene} newScene - 新场景
   * @param {number} duration - 持续时间
   * @returns {Promise} 切换完成的Promise
   * @private
   */
  async _fadeTransition(newScene, duration) {
    console.log(	'_fadeTransition: 开始	');
    return new Promise(resolve => {
      const canvas = document.getElementById('game-canvas');
      if (!canvas) {
        resolve();
        return;
      }

      const ctx = canvas.getContext('2d');
      let opacity = 0;
      const startTime = Date.now();

      const fadeStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 淡出
        if (progress < 0.5) {
          opacity = progress * 2;
        } else {
          // 淡入
          opacity = 2 - progress * 2;
        }

        // 绘制当前场景
        if (this.currentScene) {
          this.currentScene.render(ctx);
        }

        // 绘制遮罩
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (progress < 1) {
          requestAnimationFrame(fadeStep);
        } else {
          console.log(	'_fadeTransition: 完成	');
          resolve();
        }
      };

      fadeStep();
    });
  }

  /**
   * 滑动切换
   * @param {Scene} newScene - 新场景
   * @param {number} duration - 持续时间
   * @returns {Promise} 切换完成的Promise
   * @private
   */
  async _slideTransition(newScene, duration) {
    return new Promise(resolve => {
      const canvas = document.getElementById('game-canvas');
      if (!canvas) {
        resolve();
        return;
      }

      const ctx = canvas.getContext('2d');
      let offset = 0;
      const startTime = Date.now();

      const slideStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制当前场景（向左滑动）
        if (this.currentScene) {
          ctx.save();
          ctx.translate(-offset, 0);
          this.currentScene.render(ctx);
          ctx.restore();
        }

        // 绘制新场景（从右侧滑入）
        ctx.save();
        ctx.translate(canvas.width - offset, 0);
        newScene.render(ctx);
        ctx.restore();

        offset = progress * canvas.width;

        if (progress < 1) {
          requestAnimationFrame(slideStep);
        } else {
          console.log(	'_fadeTransition: 完成	');
          resolve();
        }
      };

      slideStep();
    });
  }

  /**
   * 更新当前场景
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * 渲染当前场景
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (this.currentScene) {
      this.currentScene.render(ctx);
    }
  }

  /**
   * 获取当前场景
   * @returns {Scene|null} 当前场景
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * 获取场景栈
   * @returns {Array} 场景栈
   */
  getSceneStack() {
    return [...this.sceneStack];
  }

  /**
   * 检查是否在指定场景
   * @param {string} sceneName - 场景名称
   * @returns {boolean} 是否在指定场景
   */
  isInScene(sceneName) {
    return this.currentScene && this.currentScene.name === sceneName;
  }

  /**
   * 设置场景切换回调
   * @param {Function} callback - 回调函数
   */
  setSceneChangeCallback(callback) {
    this.onSceneChange = callback;
  }

  /**
   * 设置切换开始回调
   * @param {Function} callback - 回调函数
   */
  setTransitionStartCallback(callback) {
    this.onTransitionStart = callback;
  }

  /**
   * 设置切换结束回调
   * @param {Function} callback - 回调函数
   */
  setTransitionEndCallback(callback) {
    this.onTransitionEnd = callback;
  }

  /**
   * 设置切换配置
   * @param {Object} config - 配置对象
   */
  setTransitionConfig(config) {
    this.transitionConfig = { ...this.transitionConfig, ...config };
  }

  /**
   * 获取可用场景列表
   * @returns {Array} 场景名称数组
   */
  getAvailableScenes() {
    return Array.from(this.scenes.keys());
  }

  /**
   * 销毁场景管理器
   */
  destroy() {
    // 退出当前场景
    if (this.currentScene && typeof this.currentScene.exit === 'function') {
      this.currentScene.exit();
    }

    // 清空场景栈
    this.sceneStack = [];

    // 清空场景集合
    this.scenes.clear();

    // 重置状态
    this.currentScene = null;
    this.previousScene = null;
    this.isTransitioning = false;

    // 清空回调
    this.onSceneChange = null;
    this.onTransitionStart = null;
    this.onTransitionEnd = null;
  }

  /**
   * 获取场景管理器统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      currentScene: this.currentScene ? this.currentScene.name : null,
      previousScene: this.previousScene ? this.previousScene.name : null,
      sceneStack: this.sceneStack.map(scene => scene.name),
      totalScenes: this.scenes.size,
      isTransitioning: this.isTransitioning,
      transitionConfig: this.transitionConfig,
    };
  }
}

/**
 * 基础场景类
 */
class Scene {
  constructor() {
    this.name = '';
    this.isInitialized = false;
    this.isActive = false;
  }

  /**
   * 初始化场景
   * @param {Object} data - 初始化数据
   */
  async init(data) {
    this.isInitialized = true;
    this.isActive = true;
  }

  /**
   * 更新场景
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 子类实现
  }

  /**
   * 渲染场景
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    // 子类实现
  }

  /**
   * 退出场景
   */
  exit() {
    this.isActive = false;
  }

  /**
   * 暂停场景
   */
  pause() {
    this.isActive = false;
  }

  /**
   * 恢复场景
   */
  resume() {
    this.isActive = true;
  }
}

window.SceneManager = SceneManager;

window.Scene = Scene;
