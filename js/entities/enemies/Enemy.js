(function () {
/**
 * 敌人基类
 * 游戏中的所有敌人的基类
 */
var Entity = window.Entity;
var MathUtils = window.MathUtils;

class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);

    // 基础属性
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.velocity = { x: 0, y: 0 };
    this.active = true;
    this.visible = true;

    // 敌人属性
    this.type = 'enemy';
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.damage = 10;
    this.speed = 50;

    // AI状态
    this.state = 'idle';
    this.detectionRange = 100;
    this.attackRange = 30;
    this.attackCooldown = 0;

    // 特殊属性
    this.canBeFrozen = false;
    this.freezeTimer = 0;
    this.stunTimer = 0;
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;

    // 游戏状态引用
    this.gameState = null;

    // 音效
    this.sounds = {
      hurt: 'enemy_hurt',
      death: 'enemy_death',
      attack: 'enemy_attack',
    };
  }

  /**
   * 设置游戏状态引用
   */
  setGameState(gameState) {
    this.gameState = gameState;
  }

  /**
   * 检查是否死亡
   */
  get isDead() {
    return this._isDead || this.health <= 0;
  }

  set isDead(value) {
    this._isDead = value;
  }

  /**
   * 检查是否活跃
   */
  get isActive() {
    return this.active && !this.isDead;
  }

  set isActive(value) {
    this.active = value;
  }

  /**
   * 检查是否可见
   */
  get isVisible() {
    return this.visible;
  }

  set isVisible(value) {
    this.visible = value;
  }

  /**
   * 更新敌人
   * @param {number} deltaTime - 帧间隔时间（秒）
   * @param {Object} gameState - 游戏状态
   */
  update(deltaTime, gameState) {
    if (!this.active || this.isDead) return;

    // 设置游戏状态引用
    if (gameState) {
      this.setGameState(gameState);
    }

    // 检查是否被冻结
    if (this.freezeTimer > 0) {
      this.freezeTimer -= deltaTime;
      if (this.freezeTimer <= 0) {
        this.freezeTimer = 0;
        this.state = 'idle';
      }
      return; // 被冻结时不能移动
    }

    // 检查眩晕
    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.state = 'idle';
      }
    }

    // 检查无敌时间
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerabilityTimer = 0;
        this.invulnerable = false;
      }
    }

    // 更新攻击冷却
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    // 更新位置
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;

    // 环境互动检查（子类可重写）
    if (gameState && this.checkEnvironmentInteraction) {
      this.checkEnvironmentInteraction(gameState);
    }
  }

  /**
   * 获取与目标的距离
   * @param {Object} target - 目标对象
   * @returns {number} 距离
   */
  getDistanceTo(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 检查是否在范围内
   * @param {Object} target - 目标对象
   * @param {number} range - 范围
   * @returns {boolean} 是否在范围内
   */
  isInRange(target, range) {
    return this.getDistanceTo(target) <= range;
  }

  /**
   * 检查碰撞
   * @param {Object} other - 其他对象
   * @returns {boolean} 是否碰撞
   */
  isCollidingWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  /**
   * 检查点碰撞
   * @param {number} px - 点X坐标
   * @param {number} py - 点Y坐标
   * @param {Object} rect - 矩形对象
   * @returns {boolean} 是否碰撞
   */
  isCollidingWithPoint(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height;
  }

  /**
   * 检查是否超出边界
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {boolean} 是否超出边界
   */
  isOutOfBounds(x, y) {
    return x < 0 || x > 800 || y < 0 || y > 600; // 假设画布大小为800x600
  }

  /**
   * 死亡
   */
  die() {
    this.active = false;
    this._isDead = true;
    this.state = 'dead';

    // 播放死亡音效
    if (this.gameState && this.gameState.audioManager) {
      this.gameState.audioManager.playSound(this.sounds.death);
    }

    console.log(`${this.type} 死亡`);
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   * @param {string} source - 伤害来源
   */
  takeDamage(damage, source = 'unknown') {
    if (this.invulnerable || this.isDead) return;

    this.health -= damage;
    this.health = Math.max(0, this.health);

    // 设置短暂无敌时间
    this.invulnerable = true;
    this.invulnerabilityTimer = 0.5; // 0.5秒无敌时间

    // 播放受伤音效
    if (this.gameState && this.gameState.audioManager) {
      this.gameState.audioManager.playSound(this.sounds.hurt);
    }

    // 检查是否死亡
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * 冻结敌人
   * @param {number} duration - 冻结时间（秒）
   */
  takeFreezeEffect(duration = 3.0) {
    if (!this.canBeFrozen || this.isDead) return false;

    this.freezeTimer = duration;
    this.state = 'frozen';

    // 播放冰冻音效
    if (this.gameState && this.gameState.audioManager) {
      this.gameState.audioManager.playSound('freeze');
    }

    console.log(`${this.type} 被冻结了 ${duration}秒`);
    return true;
  }

  /**
   * 眩晕敌人
   * @param {number} duration - 眩晕时间（秒）
   */
  takeStunEffect(duration = 2.0) {
    this.stunTimer = duration;
    this.state = 'stunned';

    // 播放眩晕音效
    if (this.gameState && this.gameState.audioManager) {
      this.gameState.audioManager.playSound('stun');
    }

    console.log(`${this.type} 被眩晕了 ${duration}秒`);
    return true;
  }

  /**
   * 攻击玩家
   * @param {Player} player - 玩家对象
   */
  attackPlayer(player) {
    if (this.attackCooldown > 0 || this.isDead) return;

    // 检查是否在攻击范围内
    const distance = this.getDistanceTo(player);
    if (distance > this.attackRange) return;

    // 执行攻击
    player.takeDamage(this.damage);

    // 设置攻击冷却
    this.attackCooldown = 1.0; // 1秒攻击冷却

    // 播放攻击音效
    if (this.gameState && this.gameState.audioManager) {
      this.gameState.audioManager.playSound(this.sounds.attack);
    }

    console.log(`${this.type} 攻击了玩家，造成 ${this.damage} 点伤害`);
  }

  /**
   * 渲染敌人
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.visible || this.isDead) return;

    ctx.save();

    // 设置透明度
    ctx.globalAlpha = this.invulnerable && Math.floor(Date.now() / 100) % 2 ? 0.5 : 1.0;

    // 冰冻时蓝色效果
    if (this.freezeTimer > 0) {
      ctx.filter = 'hue-rotate(180deg) brightness(1.2)';
    }

    // 绘制敌人身体
    ctx.fillStyle = '#FF0000'; // 默认红色
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制简单脸部
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + 8, this.y + 8, 4, 4); // 左眼
    ctx.fillRect(this.x + 20, this.y + 8, 4, 4); // 右眼
    ctx.fillRect(this.x + 14, this.y + 16, 4, 2); // 嘴巴

    // 渲染血条
    this.renderHealthBar(ctx);

    ctx.restore();
  }

  /**
   * 渲染血条
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderHealthBar(ctx) {
    if (this.health >= this.maxHealth) return;

    const barWidth = this.width;
    const barHeight = 4;
    const healthPercentage = this.health / this.maxHealth;

    // 背景
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);

    // 血量
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(this.x, this.y - 8, barWidth * healthPercentage, barHeight);
  }

  /**
   * 获取敌人信息
   * @returns {Object} 敌人信息
   */
  getEnemyInfo() {
    return {
      type: this.type,
      health: this.health,
      maxHealth: this.maxHealth,
      state: this.state,
      damage: this.damage,
      canBeFrozen: this.canBeFrozen,
      isFrozen: this.freezeTimer > 0,
      isStunned: this.stunTimer > 0,
      isInvulnerable: this.invulnerable,
    };
  }

  /**
   * 获取描述信息
   * @returns {Object} 描述信息
   */
  getDescription() {
    return {
      name: this.type,
      type: '普通敌人',
      health: this.health,
      maxHealth: this.maxHealth,
      damage: this.damage,
      abilities: ['基本攻击'],
      weaknesses: ['标准弱点'],
      world: '未知',
    };
  }
}

window.Enemy = Enemy;
})();
