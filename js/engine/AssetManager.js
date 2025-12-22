/**
 * 资源管理器
 * 负责加载和管理游戏中的所有资源（图片、音频、字体等）
 */
class AssetManager {
  constructor() {
    this.images = new Map();
    this.audio = new Map();
    this.fonts = new Map();
    this.loadingProgress = 0;
    this.totalResources = 0;
    this.loadedResources = 0;
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
    this.isLoading = false;

    // 预定义的资源路径
    this.resourcePaths = {
      images: {
        // 玩家和角色精灵
        player: 'assets/images/sprites/player.png',
        playerWalk: 'assets/images/sprites/player_walk.png',
        playerIdle: 'assets/images/sprites/player_idle.png',

        // 敌人精灵
        snowApe: 'assets/images/enemies/snow_ape.png',
        shaolinMonk: 'assets/images/enemies/shaolin_monk.png',
        redSnake: 'assets/images/enemies/red_snake.png',
        poisonSpider: 'assets/images/enemies/poison_spider.png',
        saxKnight: 'assets/images/enemies/sax_knight.png',

        // 道具精灵
        compass: 'assets/images/items/compass.png',
        hammer: 'assets/images/items/hammer.png',
        grappleHook: 'assets/images/items/grapple_hook.png',
        iceRay: 'assets/images/items/ice_ray.png',
        dynamite: 'assets/images/items/dynamite.png',
        shield: 'assets/images/items/shield.png',
        speedBoots: 'assets/images/items/speed_boots.png',
        gemBag: 'assets/images/items/gem_bag.png',

        // 游戏对象
        diamond: 'assets/images/sprites/diamond.png',
        key: 'assets/images/sprites/key.png',
        exit: 'assets/images/sprites/exit.png',

        // 障碍物
        rock: 'assets/images/tiles/rock.png',
        ice: 'assets/images/tiles/ice.png',
        fire: 'assets/images/tiles/fire.png',
        web: 'assets/images/tiles/web.png',

        // UI元素
        heart: 'assets/images/ui/heart.png',
        energyBar: 'assets/images/ui/energy_bar.png',
        inventorySlot: 'assets/images/ui/inventory_slot.png',

        // 背景
        angkorWatBg: 'assets/images/backgrounds/angkor_wat.jpg',
        bavariaBg: 'assets/images/backgrounds/bavaria.jpg',
        tibetBg: 'assets/images/backgrounds/tibet.jpg',

        // 瓦片地图
        tileset: 'assets/images/tiles/tileset.png',
      },
      audio: {
        // 背景音乐
        mainTheme: 'assets/audio/music/main_theme.mp3',
        angkorWatMusic: 'assets/audio/music/angkor_wat.mp3',
        bavariaMusic: 'assets/audio/music/bavaria.mp3',
        tibetMusic: 'assets/audio/music/tibet.mp3',

        // 音效
        collectDiamond: 'assets/audio/sfx/collect_diamond.wav',
        useItem: 'assets/audio/sfx/use_item.wav',
        enemyHit: 'assets/audio/sfx/enemy_hit.wav',
        playerHurt: 'assets/audio/sfx/player_hurt.wav',
        levelComplete: 'assets/audio/sfx/level_complete.wav',
        gameOver: 'assets/audio/sfx/game_over.wav',
        buttonClick: 'assets/audio/sfx/button_click.wav',
        walk: 'assets/audio/sfx/walk.wav',
        doorOpen: 'assets/audio/sfx/door_open.wav',
        explosion: 'assets/audio/sfx/explosion.wav',
      },
    };
  }

  /**
   * 设置进度回调函数
   * @param {Function} callback - 回调函数，接收进度参数 (0-100)
   */
  setProgressCallback(callback) {
    this.onProgressCallback = callback;
  }

  /**
   * 设置加载完成回调函数
   * @param {Function} callback - 回调函数
   */
  setCompleteCallback(callback) {
    this.onCompleteCallback = callback;
  }

  /**
   * 加载所有资源
   * @returns {Promise} 加载完成的Promise
   */
  async loadAll() {
    if (this.isLoading) {
      console.warn('资源加载正在进行中');
      return;
    }

    this.isLoading = true;
    this.loadingProgress = 0;
    this.loadedResources = 0;
    this.totalResources = this._countTotalResources();

    try {
      await Promise.all([this.loadImages(), this.loadAudio(), this.loadFonts()]);

      this._notifyProgress(100);
      this._notifyComplete();
    } catch (error) {
      console.error('资源加载失败:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 加载图片资源
   * @returns {Promise} 加载完成的Promise
   */
  async loadImages() {
    const imagePromises = [];

    for (const [name, path] of Object.entries(this.resourcePaths.images)) {
      imagePromises.push(this.loadImage(name, path));
    }

    return Promise.all(imagePromises);
  }

  /**
   * 加载单个图片
   * @param {string} name - 图片名称
   * @param {string} path - 图片路径
   * @returns {Promise} 加载完成的Promise
   */
  loadImage(name, path) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.images.set(name, img);
        this._incrementProgress();
        resolve(img);
      };

      img.onerror = () => {
        console.warn(`图片加载失败: ${path}`);
        this._incrementProgress();
        // 创建占位图片
        const placeholder = this._createPlaceholderImage();
        this.images.set(name, placeholder);
        resolve(placeholder);
      };

      img.src = path;
    });
  }

  /**
   * 加载音频资源
   * @returns {Promise} 加载完成的Promise
   */
  async loadAudio() {
    const audioPromises = [];

    for (const [name, path] of Object.entries(this.resourcePaths.audio)) {
      audioPromises.push(this.loadAudioClip(name, path));
    }

    return Promise.all(audioPromises);
  }

  /**
   * 加载单个音频
   * @param {string} name - 音频名称
   * @param {string} path - 音频路径
   * @returns {Promise} 加载完成的Promise
   */
  loadAudioClip(name, path) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.oncanplaythrough = () => {
        this.audio.set(name, audio);
        this._incrementProgress();
        resolve(audio);
      };

      audio.onerror = () => {
        console.warn(`音频加载失败: ${path}`);
        this._incrementProgress();
        // 创建空的音频对象
        const emptyAudio = new Audio();
        this.audio.set(name, emptyAudio);
        resolve(emptyAudio);
      };

      audio.src = path;
    });
  }

  /**
   * 加载字体资源
   * @returns {Promise} 加载完成的Promise
   */
  async loadFonts() {
    // 字体加载逻辑（如果需要自定义字体）
    // 目前使用系统字体，所以这里只是一个占位
    return Promise.resolve();
  }

  /**
   * 获取图片资源
   * @param {string} name - 图片名称
   * @returns {HTMLImageElement|null} 图片对象
   */
  getImage(name) {
    return this.images.get(name) || null;
  }

  /**
   * 获取音频资源
   * @param {string} name - 音频名称
   * @returns {HTMLAudioElement|null} 音频对象
   */
  getAudio(name) {
    return this.audio.get(name) || null;
  }

  /**
   * 播放音频
   * @param {string} name - 音频名称
   * @param {number} volume - 音量 (0-1)
   * @param {boolean} loop - 是否循环
   */
  playAudio(name, volume = 1, loop = false) {
    const audio = this.getAudio(name);
    if (audio) {
      audio.volume = volume;
      audio.loop = loop;
      audio.currentTime = 0;
      audio.play().catch(e => console.warn('音频播放失败:', e));
    }
  }

  /**
   * 停止音频
   * @param {string} name - 音频名称
   */
  stopAudio(name) {
    const audio = this.getAudio(name);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * 暂停音频
   * @param {string} name - 音频名称
   */
  pauseAudio(name) {
    const audio = this.getAudio(name);
    if (audio) {
      audio.pause();
    }
  }

  /**
   * 恢复音频
   * @param {string} name - 音频名称
   */
  resumeAudio(name) {
    const audio = this.getAudio(name);
    if (audio) {
      audio.play().catch(e => console.warn('音频播放失败:', e));
    }
  }

  /**
   * 卸载所有资源
   */
  unloadAll() {
    this.images.clear();
    this.audio.clear();
    this.fonts.clear();
    this.loadingProgress = 0;
    this.loadedResources = 0;
    this.totalResources = 0;
  }

  /**
   * 获取加载进度
   * @returns {number} 进度百分比 (0-100)
   */
  getProgress() {
    return this.loadingProgress;
  }

  /**
   * 检查资源是否加载完成
   * @returns {boolean} 是否加载完成
   */
  isLoaded() {
    return this.loadedResources >= this.totalResources && this.totalResources > 0;
  }

  /**
   * 创建占位图片
   * @returns {HTMLCanvasElement} 占位图片
   * @private
   */
  _createPlaceholderImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // 绘制占位图案
    ctx.fillStyle = '#666666';
    ctx.fillRect(0, 0, 32, 32);
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 30, 30);

    ctx.fillStyle = '#cccccc';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', 16, 20);

    return canvas;
  }

  /**
   * 计算总资源数量
   * @returns {number} 总资源数量
   * @private
   */
  _countTotalResources() {
    return (
      Object.keys(this.resourcePaths.images).length + Object.keys(this.resourcePaths.audio).length
    );
  }

  /**
   * 增加加载进度
   * @private
   */
  _incrementProgress() {
    this.loadedResources++;
    const progress = (this.loadedResources / this.totalResources) * 100;
    this._notifyProgress(progress);
  }

  /**
   * 通知进度更新
   * @param {number} progress - 进度百分比
   * @private
   */
  _notifyProgress(progress) {
    this.loadingProgress = progress;
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }
  }

  /**
   * 通知加载完成
   * @private
   */
  _notifyComplete() {
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  /**
   * 预加载关键资源
   * @returns {Promise} 加载完成的Promise
   */
  async preloadCritical() {
    const criticalImages = ['player', 'diamond', 'tileset'];
    const criticalAudio = ['buttonClick'];

    const promises = [];

    // 预加载关键图片
    criticalImages.forEach(name => {
      const path = this.resourcePaths.images[name];
      if (path) {
        promises.push(this.loadImage(name, path));
      }
    });

    // 预加载关键音频
    criticalAudio.forEach(name => {
      const path = this.resourcePaths.audio[name];
      if (path) {
        promises.push(this.loadAudioClip(name, path));
      }
    });

    return Promise.all(promises);
  }

  /**
   * 缓存图片到内存
   * @param {string} name - 图片名称
   * @param {HTMLImageElement} image - 图片对象
   */
  cacheImage(name, image) {
    this.images.set(name, image);
  }

  /**
   * 从缓存中移除图片
   * @param {string} name - 图片名称
   */
  uncacheImage(name) {
    this.images.delete(name);
  }

  /**
   * 获取所有已加载的图片名称
   * @returns {Array} 图片名称数组
   */
  getLoadedImageNames() {
    return Array.from(this.images.keys());
  }

  /**
   * 获取所有已加载的音频名称
   * @returns {Array} 音频名称数组
   */
  getLoadedAudioNames() {
    return Array.from(this.audio.keys());
  }
}

window.AssetManager = AssetManager;
