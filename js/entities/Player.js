/**
 * 玩家类
 * 游戏中的玩家角色
 */
class Player extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);

    // 玩家特定属性
    this.type = 'player';
    this.name = 'Player';

    // 生命值和状态
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.energy = 100;
    this.maxEnergy = 100;
    this.score = 0;
    this.diamondsCollected = 0;
    this.totalDiamonds = 0;
    this.keys = 0;

    // 移动属性
    this.moveSpeed = 3;
    this.jumpPower = 8;
    this.isGrounded = false;
    this.canJump = true;
    this.jumpCooldown = 0;

    // 道具系统
    this.inventory = [];
    this.selectedItemIndex = 0;
    this.maxInventorySize = 8;

    // 动画状态
    this.animationState = 'idle'; // idle, walk, jump, hurt, useItem
    this.facingDirection = 'right'; // left, right

    // 技能和状态效果
    this.shield = false;
    this.speedBoost = false;
    this.speedBoostTimer = 0;
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;

    // 输入状态
    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      useItem: false,
    };

    // 音效
    this.sounds = {
      jump: 'jump.wav',
      hurt: 'player_hurt.wav',
      collect: 'collect_diamond.wav',
      useItem: 'use_item.wav',
    };
  }

  /**
   * 初始化玩家
   */
  init() {
    super.init();

    // 设置精灵
    this._setupSprites();

    // 设置初始动画
    this.animationState = 'idle';
  }

  /**
   * 更新玩家
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.isActive || this.isDead) return;

    // 更新输入
    this._updateInput();

    // 更新移动
    this._updateMovement(deltaTime);

    // 更新动画状态
    this._updateAnimationState();

    // 更新状态效果
    this._updateStatusEffects(deltaTime);

    // 更新道具冷却
    this._updateItemCooldowns(deltaTime);

    // 更新跳跃冷却
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }

    // 调用父类更新
    super.update(deltaTime);
  }

  /**
   * 处理输入
   * @param {Object} inputManager - 输入管理器
   */
  handleInput(inputManager) {
    // 移动输入
    this.input.left = inputManager.isKeyDown('KeyA') || inputManager.isKeyDown('ArrowLeft');
    this.input.right = inputManager.isKeyDown('KeyD') || inputManager.isKeyDown('ArrowRight');
    this.input.up = inputManager.isKeyDown('KeyW') || inputManager.isKeyDown('ArrowUp');
    this.input.down = inputManager.isKeyDown('KeyS') || inputManager.isKeyDown('ArrowDown');

    // 跳跃输入
    if (
      inputManager.isKeyPressed('Space') ||
      inputManager.isKeyPressed('KeyW') ||
      inputManager.isKeyPressed('ArrowUp')
    ) {
      this.input.jump = true;
    }

    // 使用道具输入
    if (inputManager.isKeyPressed('Space')) {
      this.input.useItem = true;
    }

    // 选择道具输入
    for (let i = 1; i <= 8; i++) {
      if (inputManager.isKeyPressed(`Digit${i}`)) {
        this.selectItem(i - 1);
      }
    }
  }

  /**
   * 移动玩家
   * @param {number} deltaTime - 帧间隔时间
   */
  _updateMovement(deltaTime) {
    let moveX = 0;
    const moveY = 0;

    // 水平移动
    if (this.input.left) {
      moveX = -this.moveSpeed;
      this.facingDirection = 'left';
    } else if (this.input.right) {
      moveX = this.moveSpeed;
      this.facingDirection = 'right';
    }

    // 跳跃
    if (this.input.jump && this.canJump && this.jumpCooldown <= 0) {
      this.velocityY = -this.jumpPower;
      this.canJump = false;
      this.jumpCooldown = 200; // 200ms冷却
      this.animationState = 'jump';

      // 播放跳跃音效
      if (audioManager) {
        audioManager.playSFX(this.sounds.jump, 0.5);
      }
    }

    // 应用移动
    this.velocityX = moveX;

    // 重力
    if (!this.isGrounded) {
      this.velocityY += 0.5; // 重力
    }

    // 限制最大速度
    const maxSpeed = this.speedBoost ? this.moveSpeed * 1.5 : this.moveSpeed;
    this.velocityX = MathUtils.clamp(this.velocityX, -maxSpeed, maxSpeed);
  }

  /**
   * 收集钻石
   * @param {Diamond} diamond - 钻石对象
   */
  collectDiamond(diamond) {
    if (!diamond || diamond.isCollected) return;

    this.diamondsCollected++;
    this.score += diamond.value;

    // 播放收集音效
    if (audioManager) {
      audioManager.playSFX(this.sounds.collect, 0.7);
    }

    // 触发收集事件
    this.emit('diamondCollected', diamond);

    // 标记钻石为已收集
    diamond.collect();
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   * @param {Entity} source - 伤害来源
   */
  takeDamage(damage, source = null) {
    if (this.invulnerable || this.isDead) return;

    this.health -= damage;
    this.health = Math.max(0, this.health);

    // 设置无敌时间
    this.invulnerable = true;
    this.invulnerabilityTimer = 1000; // 1秒无敌时间

    // 播放受伤音效
    if (audioManager) {
      audioManager.playSFX(this.sounds.hurt, 0.8);
    }

    // 触发受伤事件
    this.emit('playerHurt', { damage, source });

    // 检查是否死亡
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * 使用道具
   * @param {number} itemIndex - 道具索引
   */
  useItem(itemIndex = null) {
    const index = itemIndex !== null ? itemIndex : this.selectedItemIndex;

    if (index < 0 || index >= this.inventory.length) {
      return false;
    }

    const item = this.inventory[index];
    if (!item || item.quantity <= 0) {
      return false;
    }

    // 使用道具
    const success = item.use(this);

    if (success) {
      // 播放使用音效
      if (audioManager) {
        audioManager.playSFX(this.sounds.useItem, 0.6);
      }

      // 触发使用事件
      this.emit('itemUsed', item);
    }

    return success;
  }

  /**
   * 添加道具
   * @param {Item} item - 道具对象
   * @returns {boolean} 是否添加成功
   */
  addItem(item) {
    if (this.inventory.length >= this.maxInventorySize) {
      return false;
    }

    // 检查是否已存在相同道具
    const existingItem = this.inventory.find(invItem => invItem.type === item.type);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.inventory.push(item);
    }

    // 触发添加事件
    this.emit('itemAdded', item);

    return true;
  }

  /**
   * 移除道具
   * @param {number} itemIndex - 道具索引
   * @returns {Item|null} 移除的道具
   */
  removeItem(itemIndex) {
    if (itemIndex < 0 || itemIndex >= this.inventory.length) {
      return null;
    }

    const item = this.inventory.splice(itemIndex, 1)[0];

    // 调整选中索引
    if (this.selectedItemIndex >= this.inventory.length) {
      this.selectedItemIndex = this.inventory.length - 1;
    }

    // 触发移除事件
    this.emit('itemRemoved', item);

    return item;
  }

  /**
   * 选择道具
   * @param {number} itemIndex - 道具索引
   */
  selectItem(itemIndex) {
    if (itemIndex >= 0 && itemIndex < this.inventory.length) {
      this.selectedItemIndex = itemIndex;
      this.emit('itemSelected', this.inventory[itemIndex]);
    }
  }

  /**
   * 获得护盾
   * @param {number} duration - 持续时间（毫秒）
   */
  getShield(duration = 5000) {
    this.shield = true;
    this.emit('shieldActivated', duration);

    // 设置护盾过期时间
    setTimeout(() => {
      this.shield = false;
      this.emit('shieldDeactivated');
    }, duration);
  }

  /**
   * 获得速度提升
   * @param {number} duration - 持续时间（毫秒）
   */
  getSpeedBoost(duration = 3000) {
    this.speedBoost = true;
    this.speedBoostTimer = duration;
    this.emit('speedBoostActivated', duration);
  }

  /**
   * 死亡
   */
  die() {
    this.isDead = true;
    this.isActive = false;
    this.animationState = 'dead';

    // 触发死亡事件
    this.emit('playerDied');

    console.log('玩家死亡');
  }

  /**
   * 重生
   * @param {number} x - 重生x坐标
   * @param {number} y - 重生y坐标
   */
  respawn(x, y) {
    this.health = this.maxHealth;
    this.isDead = false;
    this.isActive = true;
    this.invulnerable = true;
    this.invulnerabilityTimer = 2000; // 2秒重生无敌时间

    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;

    this.animationState = 'idle';

    // 触发重生事件
    this.emit('playerRespawned', { x, y });
  }

  /**
   * 获取生命值百分比
   * @returns {number} 生命值百分比
   */
  getHealthPercentage() {
    return this.health / this.maxHealth;
  }

  /**
   * 获取能量百分比
   * @returns {number} 能量百分比
   */
  getEnergyPercentage() {
    return this.energy / this.maxEnergy;
  }

  /**
   * 获取当前选中道具
   * @returns {Item|null} 当前道具
   */
  getSelectedItem() {
    return this.inventory[this.selectedItemIndex] || null;
  }

  /**
   * 检查是否可以移动
   * @returns {boolean} 是否可以移动
   */
  canMove() {
    return !this.isDead && this.isActive && !this.invulnerable;
  }

  /**
   * 检查是否可以跳跃
   * @returns {boolean} 是否可以跳跃
   */
  canJumpAction() {
    return this.canJump && this.jumpCooldown <= 0 && this.canMove();
  }

  /**
   * 更新输入状态
   * @private
   */
  _updateInput() {
    // 重置跳跃输入
    this.input.jump = false;
    this.input.useItem = false;
  }

  /**
   * 更新动画状态
   * @private
   */
  _updateAnimationState() {
    if (this.isDead) {
      this.animationState = 'dead';
      return;
    }

    if (this.invulnerable) {
      this.animationState = 'hurt';
      return;
    }

    if (Math.abs(this.velocityX) > 0.1) {
      this.animationState = 'walk';
    } else {
      this.animationState = 'idle';
    }
  }

  /**
   * 更新状态效果
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateStatusEffects(deltaTime) {
    // 更新无敌时间
    if (this.invulnerable) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
        this.emit('invulnerabilityEnded');
      }
    }

    // 更新速度提升时间
    if (this.speedBoost) {
      this.speedBoostTimer -= deltaTime;
      if (this.speedBoostTimer <= 0) {
        this.speedBoost = false;
        this.emit('speedBoostEnded');
      }
    }
  }

  /**
   * 更新道具冷却
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateItemCooldowns(deltaTime) {
    this.inventory.forEach(item => {
      if (item.cooldown > 0) {
        item.cooldown -= deltaTime;
        if (item.cooldown < 0) {
          item.cooldown = 0;
        }
      }
    });
  }

  /**
   * 设置精灵
   * @private
   */
  _setupSprites() {
    // 这里应该设置玩家的精灵图像
    // 由于资源加载是异步的，这里先设置颜色
    this.setColor('#ffd700'); // 金色代表玩家
  }

  /**
   * 渲染玩家
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.isVisible || this.isDead) return;

    ctx.save();

    // 应用变换
    this._applyTransformations(ctx);

    // 设置透明度
    ctx.globalAlpha = this.alpha;

    // 无敌时闪烁效果
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha *= 0.5;
    }

    // 渲染精灵或几何图形
    if (this.sprite) {
      this._renderSprite(ctx);
    } else {
      this._renderPlayerShape(ctx);
    }

    // 渲染护盾效果
    if (this.shield) {
      this._renderShieldEffect(ctx);
    }

    // 渲染速度提升效果
    if (this.speedBoost) {
      this._renderSpeedBoostEffect(ctx);
    }

    // 渲染调试信息
    if (GameEngine.debugMode) {
      this._renderDebug(ctx);
    }

    ctx.restore();
  }

  /**
   * 渲染玩家形状
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderPlayerShape(ctx) {
    // 身体
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);

    // 脸部
    ctx.fillStyle = '#ffdbac'; // 肤色
    ctx.fillRect(4, 4, this.width - 8, this.height - 12);

    // 眼睛
    ctx.fillStyle = '#000000';
    const eyeY = 8;
    if (this.facingDirection === 'left') {
      ctx.fillRect(6, eyeY, 4, 4);
      ctx.fillRect(14, eyeY, 4, 4);
    } else {
      ctx.fillRect(14, eyeY, 4, 4);
      ctx.fillRect(22, eyeY, 4, 4);
    }

    // 嘴巴
    ctx.fillRect(this.width / 2 - 2, 14, 4, 2);
  }

  /**
   * 渲染护盾效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderShieldEffect(ctx) {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.max(this.width, this.height) / 2 + 5;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * 渲染速度提升效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderSpeedBoostEffect(ctx) {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    // 绘制速度线效果
    for (let i = 0; i < 3; i++) {
      const offset = i * 3;
      ctx.beginPath();
      ctx.moveTo(-offset, this.height / 2);
      ctx.lineTo(this.width + offset, this.height / 2);
      ctx.stroke();
    }
  }

  /**
   * 获取玩家状态
   * @returns {Object} 玩家状态
   */
  getPlayerState() {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      score: this.score,
      diamondsCollected: this.diamondsCollected,
      totalDiamonds: this.totalDiamonds,
      keys: this.keys,
      shield: this.shield,
      speedBoost: this.speedBoost,
      invulnerable: this.invulnerable,
      animationState: this.animationState,
      facingDirection: this.facingDirection,
      inventory: this.inventory.map(item => ({
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        cooldown: item.cooldown,
      })),
      selectedItemIndex: this.selectedItemIndex,
    };
  }
}
