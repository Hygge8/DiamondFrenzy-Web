/**
 * 敌人管理器
 * 统一管理游戏中所有敌人的生成、更新和渲染
 */
export default class EnemyManager {
  constructor() {
    this.enemies = [];
    this.enemyFactories = {
      snowApe: () => import('./enemies/SnowApe.js'),
      shaolinMonk: () => import('./enemies/ShaolinMonk.js'),
      redSnake: () => import('./enemies/RedSnake.js'),
      poisonSpider: () => import('./enemies/PoisonSpider.js'),
      saxKnight: () => import('./enemies/SaxKnight.js'),
    };

    // 敌人类型配置
    this.enemyConfigs = {
      snowApe: {
        name: '雪猿',
        world: 'tibet',
        spawnWeight: 3,
        minLevel: 1,
        maxLevel: 10,
      },
      shaolinMonk: {
        name: '少林弟子',
        world: 'tibet',
        spawnWeight: 2,
        minLevel: 2,
        maxLevel: 10,
      },
      redSnake: {
        name: '红蛇',
        world: 'angkor',
        spawnWeight: 4,
        minLevel: 1,
        maxLevel: 8,
      },
      poisonSpider: {
        name: '毒蜘蛛',
        world: 'bavaria',
        spawnWeight: 3,
        minLevel: 3,
        maxLevel: 10,
      },
      saxKnight: {
        name: '萨克斯骑士',
        world: 'bavaria',
        spawnWeight: 1,
        minLevel: 5,
        maxLevel: 10,
        isBoss: true,
      },
    };

    // 游戏状态引用
    this.gameState = null;
  }

  /**
   * 设置游戏状态
   */
  setGameState(gameState) {
    this.gameState = gameState;
  }

  /**
   * 创建敌人
   * @param {string} type - 敌人类型
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {Promise<Object>} 敌人实例
   */
  async createEnemy(type, x, y) {
    try {
      const factory = this.enemyFactories[type];
      if (!factory) {
        console.warn(`未知的敌人类型: ${type}`);
        return null;
      }

      const EnemyClass = await factory();
      const enemy = new EnemyClass.default(x, y);

      if (this.gameState) {
        enemy.setGameState(this.gameState);
      }

      this.enemies.push(enemy);
      console.log(`创建敌人: ${type} at (${x}, ${y})`);
      return enemy;
    } catch (error) {
      console.error(`创建敌人失败: ${type}`, error);
      return null;
    }
  }

  /**
   * 根据关卡数据生成敌人
   * @param {Object} levelData - 关卡数据
   */
  async spawnEnemiesFromLevel(levelData) {
    if (!levelData.enemies) return;

    for (const enemyData of levelData.enemies) {
      await this.createEnemy(enemyData.type, enemyData.x, enemyData.y);
    }
  }

  /**
   * 随机生成敌人（用于程序化关卡）
   * @param {string} world - 世界名称
   * @param {number} level - 关卡等级
   * @param {number} count - 生成数量
   * @param {Object} bounds - 生成边界 {x, y, width, height}
   */
  async spawnRandomEnemies(world, level, count, bounds) {
    const availableTypes = this.getAvailableEnemyTypes(world, level);

    for (let i = 0; i < count; i++) {
      const type = this.selectRandomEnemyType(availableTypes);
      if (!type) continue;

      const position = this.generateRandomPosition(bounds);
      await this.createEnemy(type, position.x, position.y);
    }
  }

  /**
   * 获取可用的敌人类型
   * @param {string} world - 世界名称
   * @param {number} level - 关卡等级
   * @returns {Array} 可用敌人类型数组
   */
  getAvailableEnemyTypes(world, level) {
    const availableTypes = [];

    for (const [type, config] of Object.entries(this.enemyConfigs)) {
      if (config.world === world && level >= config.minLevel && level <= config.maxLevel) {
        availableTypes.push({
          type: type,
          weight: config.spawnWeight,
          isBoss: config.isBoss || false,
        });
      }
    }

    return availableTypes;
  }

  /**
   * 选择随机敌人类型
   * @param {Array} availableTypes - 可用类型数组
   * @returns {string|null} 选中的敌人类型
   */
  selectRandomEnemyType(availableTypes) {
    if (availableTypes.length === 0) return null;

    // 计算总权重
    const totalWeight = availableTypes.reduce((sum, enemy) => sum + enemy.weight, 0);

    // 按权重随机选择
    let random = Math.random() * totalWeight;

    for (const enemy of availableTypes) {
      random -= enemy.weight;
      if (random <= 0) {
        return enemy.type;
      }
    }

    // 兜底返回第一个
    return availableTypes[0].type;
  }

  /**
   * 生成随机位置
   * @param {Object} bounds - 边界对象
   * @returns {Object} 位置坐标
   */
  generateRandomPosition(bounds) {
    const margin = 50; // 边距
    return {
      x: bounds.x + margin + Math.random() * (bounds.width - margin * 2),
      y: bounds.y + margin + Math.random() * (bounds.height - margin * 2),
    };
  }

  /**
   * 更新所有敌人
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 更新所有敌人
    for (const enemy of this.enemies) {
      if (enemy.isActive) {
        enemy.update(deltaTime, this.gameState);
      }
    }

    // 清理死亡敌人
    this.cleanupDeadEnemies();

    // 敌人间互动
    this.handleEnemyInteractions();
  }

  /**
   * 渲染所有敌人
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    for (const enemy of this.enemies) {
      if (enemy.isVisible && enemy.isActive) {
        enemy.render(ctx);
      }
    }

    // 渲染敌人信息（调试模式）
    if (this.gameState && this.gameState.debugMode) {
      this.renderDebugInfo(ctx);
    }
  }

  /**
   * 清理死亡敌人
   */
  cleanupDeadEnemies() {
    this.enemies = this.enemies.filter(enemy => !enemy.isDead);
  }

  /**
   * 处理敌人间互动
   */
  handleEnemyInteractions() {
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const enemy1 = this.enemies[i];
        const enemy2 = this.enemies[j];

        if (enemy1.isActive && enemy2.isActive && enemy1.isCollidingWith(enemy2)) {
          // 处理特殊敌人互动
          if (enemy1.interactWithEnemy) {
            enemy1.interactWithEnemy(enemy2);
          }
          if (enemy2.interactWithEnemy) {
            enemy2.interactWithEnemy(enemy1);
          }
        }
      }
    }
  }

  /**
   * 渲染调试信息
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderDebugInfo(ctx) {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';

    let y = 20;
    for (const enemy of this.enemies) {
      if (enemy.isActive) {
        const info = enemy.getEnemyInfo();
        ctx.fillText(
          `${enemy.type}: HP(${info.health}/${info.maxHealth}) State(${info.state})`,
          10,
          y
        );
        y += 15;
      }
    }

    ctx.restore();
  }

  /**
   * 获取所有敌人
   * @returns {Array} 敌人数组
   */
  getEnemies() {
    return this.enemies;
  }

  /**
   * 获取特定类型的敌人
   * @param {string} type - 敌人类型
   * @returns {Array} 敌人数组
   */
  getEnemiesByType(type) {
    return this.enemies.filter(enemy => enemy.type === type && enemy.isActive);
  }

  /**
   * 获取范围内的敌人
   * @param {Object} center - 中心点 {x, y}
   * @param {number} range - 范围
   * @returns {Array} 敌人数组
   */
  getEnemiesInRange(center, range) {
    return this.enemies.filter(enemy => {
      if (!enemy.isActive) return false;
      const dx = enemy.x - center.x;
      const dy = enemy.y - center.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }

  /**
   * 清除所有敌人
   */
  clearAllEnemies() {
    this.enemies = [];
    console.log('已清除所有敌人');
  }

  /**
   * 获取敌人统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const stats = {
      total: this.enemies.length,
      active: this.enemies.filter(e => e.isActive).length,
      byType: {},
      byWorld: {},
      bosses: 0,
    };

    for (const enemy of this.enemies) {
      // 按类型统计
      if (!stats.byType[enemy.type]) {
        stats.byType[enemy.type] = 0;
      }
      stats.byType[enemy.type]++;

      // 按世界统计
      const config = this.enemyConfigs[enemy.type];
      if (config) {
        if (!stats.byWorld[config.world]) {
          stats.byWorld[config.world] = 0;
        }
        stats.byWorld[config.world]++;
      }

      // Boss统计
      if (config && config.isBoss) {
        stats.bosses++;
      }
    }

    return stats;
  }

  /**
   * 获取敌人配置
   * @param {string} type - 敌人类型
   * @returns {Object|null} 敌人配置
   */
  getEnemyConfig(type) {
    return this.enemyConfigs[type] || null;
  }

  /**
   * 获取所有敌人配置
   * @returns {Object} 所有配置
   */
  getAllEnemyConfigs() {
    return { ...this.enemyConfigs };
  }
}
