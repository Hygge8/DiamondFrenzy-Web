/**
 * 关卡管理器
 * 负责管理游戏中的关卡加载、切换和进度
 */
const Player = require('../entities/Player');
const Diamond = require('../entities/Diamond');
const Obstacle = require('../entities/Obstacle');
const Item = require('../entities/Item');

class LevelManager {
  constructor() {
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.levels = [];
    this.worlds = {};

    // 关卡状态
    this.isLevelLoaded = false;
    this.isLevelCompleted = false;
    this.levelStartTime = 0;
    this.levelElapsedTime = 0;

    // 游戏对象集合
    this.entities = [];
    this.player = null;
    this.diamonds = [];
    this.obstacles = [];
    this.enemies = [];
    this.items = [];

    // 系统管理器
    this.enemyManager = null;
    this.gameState = null;

    // 回调函数
    this.onLevelLoad = null;
    this.onLevelComplete = null;
    this.onLevelFail = null;

    // 加载关卡数据
    this._loadLevelData();
  }

  /**
   * 加载关卡数据
   * @private
   */
  _loadLevelData() {
    // 这里应该从JSON文件加载关卡数据
    // 由于演示目的，创建示例关卡
    this._createSampleLevels();
  }

  /**
   * 创建示例关卡
   * @private
   */
  _createSampleLevels() {
    // 吴哥窟世界
    this.worlds.angkor_wat = {
      name: '吴哥窟',
      description: '古老的寺庙遗迹',
      levels: this._createAngkorWatLevels(),
    };

    // 巴伐利亚世界
    this.worlds.bavaria = {
      name: '巴伐利亚',
      description: '中世纪地牢',
      levels: this._createBavariaLevels(),
    };

    // 西藏世界
    this.worlds.tibet = {
      name: '西藏雪洞',
      description: '雪山中的神秘洞穴',
      levels: this._createTibetLevels(),
    };

    // 合并所有关卡
    Object.values(this.worlds).forEach(world => {
      this.levels.push(...world.levels);
    });
  }

  /**
   * 创建吴哥窟关卡
   * @returns {Array} 关卡数组
   * @private
   */
  _createAngkorWatLevels() {
    return [
      {
        id: 1,
        name: '吴哥窟 - 第一关',
        world: 'angkor_wat',
        width: 800,
        height: 600,
        playerStart: { x: 100, y: 500 },
        exitPoint: { x: 700, y: 100 },
        diamonds: [
          { x: 200, y: 400, value: 10 },
          { x: 400, y: 300, value: 15 },
          { x: 600, y: 200, value: 20 },
        ],
        obstacles: [
          { x: 300, y: 450, width: 50, height: 50, type: 'rock' },
          { x: 500, y: 350, width: 50, height: 50, type: 'ice' },
        ],
        enemies: [{ x: 350, y: 400, type: 'red_snake' }],
        items: [{ x: 150, y: 450, type: 'compass' }],
        timeLimit: 300000, // 5分钟
        targetDiamonds: 3,
      },
      {
        id: 2,
        name: '吴哥窟 - 第二关',
        world: 'angkor_wat',
        width: 800,
        height: 600,
        playerStart: { x: 50, y: 550 },
        exitPoint: { x: 750, y: 50 },
        diamonds: [
          { x: 150, y: 450, value: 10 },
          { x: 300, y: 350, value: 15 },
          { x: 450, y: 250, value: 20 },
          { x: 600, y: 150, value: 25 },
        ],
        obstacles: [
          { x: 200, y: 500, width: 50, height: 50, type: 'rock' },
          { x: 400, y: 400, width: 50, height: 50, type: 'ice' },
          { x: 600, y: 300, width: 50, height: 50, type: 'web' },
        ],
        enemies: [
          { x: 250, y: 450, type: 'red_snake' },
          { x: 500, y: 350, type: 'poison_spider' },
        ],
        items: [{ x: 100, y: 500, type: 'hammer' }],
        timeLimit: 420000, // 7分钟
        targetDiamonds: 4,
      },
    ];
  }

  /**
   * 创建巴伐利亚关卡
   * @returns {Array} 关卡数组
   * @private
   */
  _createBavariaLevels() {
    return [
      {
        id: 3,
        name: '巴伐利亚 - 第一关',
        world: 'bavaria',
        width: 800,
        height: 600,
        playerStart: { x: 100, y: 500 },
        exitPoint: { x: 700, y: 100 },
        diamonds: [
          { x: 200, y: 400, value: 15 },
          { x: 400, y: 300, value: 20 },
          { x: 600, y: 200, value: 25 },
        ],
        obstacles: [
          { x: 300, y: 450, width: 50, height: 50, type: 'door' },
          { x: 500, y: 350, width: 50, height: 50, type: 'spikes' },
        ],
        enemies: [
          { x: 350, y: 400, type: 'poison_spider' },
          { x: 550, y: 300, type: 'sax_knight' },
        ],
        items: [{ x: 150, y: 450, type: 'grapple_hook' }],
        timeLimit: 360000, // 6分钟
        targetDiamonds: 3,
      },
    ];
  }

  /**
   * 创建西藏关卡
   * @returns {Array} 关卡数组
   * @private
   */
  _createTibetLevels() {
    return [
      {
        id: 4,
        name: '西藏雪洞 - 第一关',
        world: 'tibet',
        width: 800,
        height: 600,
        playerStart: { x: 100, y: 500 },
        exitPoint: { x: 700, y: 100 },
        diamonds: [
          { x: 200, y: 400, value: 20 },
          { x: 400, y: 300, value: 25 },
          { x: 600, y: 200, value: 30 },
        ],
        obstacles: [
          { x: 300, y: 450, width: 50, height: 50, type: 'fire' },
          { x: 500, y: 350, width: 50, height: 50, type: 'ice' },
        ],
        enemies: [
          { x: 350, y: 400, type: 'snow_ape' },
          { x: 450, y: 350, type: 'shaolin_monkey' },
        ],
        items: [{ x: 150, y: 450, type: 'ice_ray' }],
        timeLimit: 300000, // 5分钟
        targetDiamonds: 3,
      },
    ];
  }

  /**
   * 加载关卡
   * @param {number} levelIndex - 关卡索引
   * @returns {Promise} 加载完成的Promise
   */
  async loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= this.levels.length) {
      console.error(`关卡索引无效: ${levelIndex}`);
      return false;
    }

    console.log(`加载关卡 ${levelIndex + 1}: ${this.levels[levelIndex].name}`);

    try {
      // 清理当前关卡
      this._clearCurrentLevel();

      // 设置当前关卡
      this.currentLevelIndex = levelIndex;
      this.currentLevel = this.levels[levelIndex];

      // 创建玩家
      this._createPlayer();

      // 创建游戏对象
      await this._createGameObjects();

      // 设置关卡状态
      this.isLevelLoaded = true;
      this.isLevelCompleted = false;
      this.levelStartTime = Date.now();
      this.levelElapsedTime = 0;

      // 触发加载完成回调
      if (this.onLevelLoad) {
        this.onLevelLoad(this.currentLevel);
      }

      console.log('关卡加载完成');
      return true;
    } catch (error) {
      console.error('关卡加载失败:', error);
      console.error(error.stack);
      return false;
    }
  }

  /**
   * 创建玩家
   * @private
   */
  _createPlayer() {
    const startPos = this.currentLevel.playerStart;
    this.player = new Player(startPos.x, startPos.y);
    this.player.init();

    // 设置玩家属性
    this.player.totalDiamonds = this.currentLevel.targetDiamonds;
  }

  /**
   * 初始化敌人管理器
   * @param {EnemyManager} enemyManager - 敌人管理器实例
   */
  initEnemyManager(enemyManager) {
    this.enemyManager = enemyManager;
    if (this.gameState) {
      this.enemyManager.setGameState(this.gameState);
    }
  }

  /**
   * 设置游戏状态
   * @param {Object} gameState - 游戏状态对象
   */
  setGameState(gameState) {
    this.gameState = gameState;
    if (this.enemyManager) {
      this.enemyManager.setGameState(gameState);
    }
  }

  /**
   * 获取游戏状态
   * @returns {Object} 游戏状态对象
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * 创建游戏对象
   * @private
   */
  async _createGameObjects() {
    // 创建钻石
    this.currentLevel.diamonds.forEach(diamondData => {
      const diamond = new Diamond(diamondData.x, diamondData.y, diamondData.value);
      diamond.init();
      this.diamonds.push(diamond);
      this.entities.push(diamond);
    });

    // 创建障碍物
    this.currentLevel.obstacles.forEach(obstacleData => {
      const obstacle = new Obstacle(
        obstacleData.x,
        obstacleData.y,
        obstacleData.width,
        obstacleData.height,
        obstacleData.type
      );
      obstacle.init();
      this.obstacles.push(obstacle);
      this.entities.push(obstacle);
    });

    // 创建敌人
    for (const enemyData of this.currentLevel.enemies) {
      const enemy = await this._createEnemy(enemyData);
      if (enemy) {
        this.enemies.push(enemy);
        this.entities.push(enemy);
      }
    }

    // 创建道具
    this.currentLevel.items.forEach(itemData => {
      const item = new Item(itemData.x, itemData.y, itemData.type);
      item.init();
      this.items.push(item);
      this.entities.push(item);
    });

  /**
   * 创建敌人
   * @param {Object} enemyData - 敌人数据
   * @returns {Promise<Enemy|null>} 敌人对象
   * @private
   */
  async _createEnemy(enemyData) {
    if (!this.enemyManager) {
      console.warn('敌人管理器未初始化');
      return null;
    }

    return await this.enemyManager.createEnemy(enemyData.type, enemyData.x, enemyData.y);
  }

  /**
   * 创建道具
   * @param {Object} itemData - 道具数据
   * @returns {Item|null} 道具对象
   * @private
   */
  _createItem(itemData) {
    switch (itemData.type) {
    case 'compass':
      return new Compass(itemData.x, itemData.y);
    case 'hammer':
      return new Hammer(itemData.x, itemData.y);
    case 'grapple_hook':
      return new GrappleHook(itemData.x, itemData.y);
    case 'ice_ray':
      return new IceRay(itemData.x, itemData.y);
    case 'dynamite':
      return new Dynamite(itemData.x, itemData.y);
    case 'shield':
      return new Shield(itemData.x, itemData.y);
    case 'speed_boots':
      return new SpeedBoots(itemData.x, itemData.y);
    case 'gem_bag':
      return new GemBag(itemData.x, itemData.y);
    default:
      console.warn(`未知的道具类型: ${itemData.type}`);
      return null;
    }
  }

  /**
   * 更新关卡
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.isLevelLoaded || this.isLevelCompleted) return;

    // 更新玩家
    if (this.player && this.player.isActive) {
      this.player.update(deltaTime);
    }

    // 更新实体
    this.entities.forEach(entity => {
      if (entity.isActive && entity.update) {
        entity.update(deltaTime, this.getGameState());
      }
    });

    // 更新敌人管理器
    if (this.enemyManager) {
      this.enemyManager.update(deltaTime);
    }

    // 处理碰撞
    this._handleCollisions();

    // 检查关卡完成条件
    this._checkLevelCompletion();

    // 更新关卡时间
    this.levelElapsedTime = Date.now() - this.levelStartTime;

    // 检查时间限制
    if (this.currentLevel.timeLimit && this.levelElapsedTime >= this.currentLevel.timeLimit) {
      this._failLevel();
    }
  }

  /**
   * 渲染关卡
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.isLevelLoaded) return;

    // 渲染背景
    this._renderBackground(ctx);

    // 渲染出口
    this._renderExit(ctx);

    // 渲染实体
    this.entities.forEach(entity => {
      if (entity.isVisible && !entity.isDead && entity.render) {
        entity.render(ctx);
      }
    });

    // 渲染敌人管理器
    if (this.enemyManager) {
      this.enemyManager.render(ctx);
    }

    // 渲染玩家
    if (this.player && this.player.isVisible && !this.player.isDead) {
      this.player.render(ctx);
    }

    // 渲染调试信息
    if (GameEngine.debugMode) {
      this._renderDebugInfo(ctx);
    }
  }

  /**
   * 处理碰撞
   * @private
   */
  _handleCollisions() {
    if (!this.player) return;

    // 玩家与钻石碰撞
    this.diamonds.forEach(diamond => {
      if (!diamond.isCollected && this.player.collidesWith(diamond)) {
        this.player.collectDiamond(diamond);
      }
    });

    // 玩家与道具碰撞
    this.items.forEach(item => {
      if (item.isActive && this.player.collidesWith(item)) {
        item.pickup(this.player);
      }
    });

    // 玩家与障碍物碰撞
    this.obstacles.forEach(obstacle => {
      if (obstacle.isActive && this.player.collidesWith(obstacle)) {
        // 处理障碍物交互
        obstacle.causeDamage(this.player);
      }
    });

    // 玩家与敌人碰撞
    this.enemies.forEach(enemy => {
      if (enemy.isActive && this.player.collidesWith(enemy)) {
        enemy.attackPlayer(this.player);
      }
    });

    // 玩家与出口碰撞
    this._checkExitCollision();
  }

  /**
   * 检查出口碰撞
   * @private
   */
  _checkExitCollision() {
    const exitBounds = {
      x: this.currentLevel.exitPoint.x - 25,
      y: this.currentLevel.exitPoint.y - 25,
      width: 50,
      height: 50,
    };

    const playerBounds = this.player.getBounds();

    if (MathUtils.rectCollision(exitBounds, playerBounds)) {
      this._completeLevel();
    }
  }

  /**
   * 检查关卡完成条件
   * @private
   */
  _checkLevelCompletion() {
    if (this.player.diamondsCollected >= this.currentLevel.targetDiamonds) {
      this._completeLevel();
    }
  }

  /**
   * 完成关卡
   * @private
   */
  _completeLevel() {
    if (this.isLevelCompleted) return;

    this.isLevelCompleted = true;

    // 播放完成音效
    if (audioManager) {
      audioManager.playSFX('level_complete.wav', 0.8);
    }

    // 触发完成回调
    if (this.onLevelComplete) {
      this.onLevelComplete({
        level: this.currentLevel,
        score: this.player.score,
        time: this.levelElapsedTime,
        diamonds: this.player.diamondsCollected,
      });
    }

    console.log('关卡完成！');
  }

  /**
   * 失败关卡
   * @private
   */
  _failLevel() {
    // 触发失败回调
    if (this.onLevelFail) {
      this.onLevelFail({
        level: this.currentLevel,
        reason: 'time_limit',
      });
    }

    console.log('关卡失败：时间用完');
  }

  /**
   * 显示出口方向
   */
  showExitDirection() {
    if (!this.player || !this.currentLevel) return;

    // 这里可以实现指南针功能，显示出口方向
    console.log('显示出口方向');
  }

  /**
   * 获取附近障碍物
   * @param {Player} player - 玩家对象
   * @param {number} range - 范围
   * @returns {Array} 障碍物数组
   */
  getNearbyObstacles(player, range) {
    return this.obstacles.filter(obstacle => {
      return obstacle.isActive && !obstacle.isDead && player.getDistance(obstacle) <= range;
    });
  }

  /**
   * 获取附近敌人
   * @param {Player} player - 玩家对象
   * @param {number} range - 范围
   * @returns {Array} 敌人数组
   */
  getNearbyEnemies(player, range) {
    return this.enemies.filter(enemy => {
      return enemy.isActive && !enemy.isDead && player.getDistance(enemy) <= range;
    });
  }

  /**
   * 清理当前关卡
   * @private
   */
  _clearCurrentLevel() {
    // 清理所有实体
    this.entities = [];
    this.diamonds = [];
    this.obstacles = [];
    this.enemies = [];
    this.items = [];
    this.player = null;

    this.isLevelLoaded = false;
    this.isLevelCompleted = false;
  }

  /**
   * 清除所有敌人
   */
  clearAllEnemies() {
    this.enemies = [];
    if (this.enemyManager) {
      this.enemyManager.clearAllEnemies();
    }
  }

  /**
   * 渲染背景
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderBackground(ctx) {
    // 根据世界类型渲染不同背景
    const worldType = this.currentLevel.world;

    switch (worldType) {
    case 'angkor_wat':
      ctx.fillStyle = '#8B4513'; // 棕色
      break;
    case 'bavaria':
      ctx.fillStyle = '#2F4F4F'; // 深灰色
      break;
    case 'tibet':
      ctx.fillStyle = '#E0E0E0'; // 浅灰色
      break;
    default:
      ctx.fillStyle = '#1a1a2e';
      break;
    }

    ctx.fillRect(0, 0, this.currentLevel.width, this.currentLevel.height);
  }

  /**
   * 渲染出口
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderExit(ctx) {
    const exit = this.currentLevel.exitPoint;

    // 渲染出口光效
    const gradient = ctx.createRadialGradient(exit.x, exit.y, 0, exit.x, exit.y, 30);
    gradient.addColorStop(0, '#00FF00');
    gradient.addColorStop(1, '#00FF0040');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, 30, 0, Math.PI * 2);
    ctx.fill();

    // 渲染出口标识
    ctx.fillStyle = '#00FF00';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('出口', exit.x, exit.y + 5);
  }

  /**
   * 渲染调试信息
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderDebugInfo(ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    let y = 20;
    const lineHeight = 14;

    ctx.fillText(`关卡: ${this.currentLevel.name}`, 10, y);
    y += lineHeight;

    ctx.fillText(`时间: ${Math.floor(this.levelElapsedTime / 1000)}s`, 10, y);
    y += lineHeight;

    ctx.fillText(
      `钻石: ${this.player.diamondsCollected}/${this.currentLevel.targetDiamonds}`,
      10,
      y
    );
    y += lineHeight;

    ctx.fillText(`得分: ${this.player.score}`, 10, y);
    y += lineHeight;

    ctx.fillText(`敌人: ${this.enemies.filter(e => e.isActive).length}`, 10, y);
    y += lineHeight;

    ctx.fillText(`障碍物: ${this.obstacles.filter(o => o.isActive).length}`, 10, y);
  }

  /**
   * 获取当前关卡信息
   * @returns {Object} 关卡信息
   */
  getCurrentLevelInfo() {
    if (!this.currentLevel) return null;

    return {
      level: this.currentLevel,
      index: this.currentLevelIndex,
      isLoaded: this.isLevelLoaded,
      isCompleted: this.isLevelCompleted,
      elapsedTime: this.levelElapsedTime,
      playerState: this.player ? this.player.getPlayerState() : null,
    };
  }

  /**
   * 获取可用关卡
   * @returns {Array} 关卡数组
   */
  getAvailableLevels() {
    return this.levels.map((level, index) => ({
      index,
      name: level.name,
      world: level.world,
      targetDiamonds: level.targetDiamonds,
      timeLimit: level.timeLimit,
    }));
  }
}

module.exports = LevelManager;
