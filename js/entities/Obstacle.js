(function () {
/**
 * 障碍物类
 * 游戏中的各种障碍物和机关
 */
var Entity = window.Entity;

class Obstacle extends Entity {
  constructor(x, y, width, height, type = 'rock') {
    super(x, y, width, height);

    this.type = 'obstacle';
    this.obstacleType = type;
    this.name = `Obstacle_${type}`;

    // 障碍物状态
    this.isBreakable = false;
    this.isMovable = false;
    this.isDestructible = false;
    this.isPassable = false;

    // 交互属性
    this.requiredItem = null;
    this.interactionRange = 32;
    this.isInteracted = false;

    // 动画属性
    this.animationFrame = 0;
    this.animationSpeed = 0.1;
    this.animationTimer = 0;

    // 物理属性
    this.isStatic = true;
    this.mass = Infinity; // 静态物体

    // 特殊属性
    this.damage = 0;
    this.effect = null;

    // 根据类型设置属性
    this._setupByType(type);
  }

  /**
   * 根据类型设置属性
   * @param {string} type - 障碍物类型
   * @private
   */
  _setupByType(type) {
    switch (type) {
    case 'rock':
      this.name = 'Rock';
      this.color = '#8B4513';
      this.isBreakable = true;
      this.requiredItem = 'hammer';
      this.setColor('#8B4513');
      break;

    case 'ice':
      this.name = 'Ice Block';
      this.color = '#87CEEB';
      this.isBreakable = true;
      this.requiredItem = 'hammer';
      this.setColor('#87CEEB');
      break;

    case 'fire':
      this.name = 'Fire Trap';
      this.color = '#FF4500';
      this.isDestructible = false;
      this.damage = 1;
      this._setupFireAnimation();
      this.setColor('#FF4500');
      break;

    case 'web':
      this.name = 'Spider Web';
      this.color = '#D3D3D3';
      this.isBreakable = true;
      this.requiredItem = 'hammer';
      this.setColor('#D3D3D3');
      break;

    case 'door':
      this.name = 'Door';
      this.color = '#8B4513';
      this.isPassable = false;
      this.isBreakable = false;
      this.requiredItem = 'key';
      this.setColor('#8B4513');
      break;

    case 'spikes':
      this.name = 'Spikes';
      this.color = '#C0C0C0';
      this.isDestructible = false;
      this.damage = 2;
      this.isPassable = true;
      this.setColor('#C0C0C0');
      break;

    case 'switch':
      this.name = 'Switch';
      this.color = '#FFFF00';
      this.isBreakable = false;
      this.isPassable = true;
      this.requiredItem = null;
      this.setColor('#FFFF00');
      break;

    case 'pressure_plate':
      this.name = 'Pressure Plate';
      this.color = '#808080';
      this.isBreakable = false;
      this.isPassable = true;
      this.requiredItem = null;
      this.setColor('#808080');
      break;

    default:
      this.name = `Obstacle_${type}`;
      this.setColor('#666666');
      break;
    }
  }

  /**
   * 设置火焰动画
   * @private
   */
  _setupFireAnimation() {
    this.animationFrames = [
      { color: '#FF4500', intensity: 1.0 },
      { color: '#FF6347', intensity: 0.8 },
      { color: '#FF7F50', intensity: 0.6 },
      { color: '#FFA500', intensity: 0.9 },
    ];
    this.animationSpeed = 0.15;
    this.isAnimating = true;
  }

  /**
   * 更新障碍物
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.isActive || this.isDead) return;

    // 更新动画
    if (this.isAnimating) {
      this._updateAnimation(deltaTime);
    }

    // 更新特殊效果
    this._updateSpecialEffects(deltaTime);

    // 调用父类更新
    super.update(deltaTime);
  }

  /**
   * 与玩家交互
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功交互
   */
  interact(player) {
    if (this.isInteracted) return false;

    // 检查是否在交互范围内
    const distance = this.getDistance(player);
    if (distance > this.interactionRange) {
      return false;
    }

    // 检查是否需要特定道具
    if (this.requiredItem) {
      const hasRequiredItem = player.inventory.some(
        item => item.type === this.requiredItem && item.quantity > 0
      );

      if (!hasRequiredItem) {
        this.emit('interactionFailed', {
          player,
          reason: 'missing_item',
          requiredItem: this.requiredItem,
        });
        return false;
      }
    }

    // 执行交互
    const success = this._performInteraction(player);

    if (success) {
      this.isInteracted = true;
      this.emit('interacted', { player, obstacle: this });
    }

    return success;
  }

  /**
   * 执行交互
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功
   * @private
   */
  _performInteraction(player) {
    switch (this.obstacleType) {
    case 'rock':
    case 'ice':
    case 'web':
      return this._breakObstacle(player);

    case 'door':
      return this._openDoor(player);

    case 'switch':
      return this._activateSwitch(player);

    case 'pressure_plate':
      return this._activatePressurePlate(player);

    default:
      return false;
    }
  }

  /**
   * 破坏障碍物
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功
   * @private
   */
  _breakObstacle(player) {
    if (!this.isBreakable) return false;

    // 使用指定道具
    if (this.requiredItem) {
      const item = player.inventory.find(invItem => invItem.type === this.requiredItem);
      if (item && item.use(player)) {
        // 破坏障碍物
        this.isDead = true;
        this.isActive = false;

        // 播放破坏音效
        if (audioManager) {
          audioManager.playSFX('break.wav', 0.6);
        }

        return true;
      }
    }

    return false;
  }

  /**
   * 开门
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功
   * @private
   */
  _openDoor(player) {
    if (this.obstacleType !== 'door') return false;

    // 检查钥匙
    if (player.keys > 0) {
      player.keys--;
      this.isPassable = true;
      this.isActive = false;

      // 播放开门音效
      if (audioManager) {
        audioManager.playSFX('door_open.wav', 0.7);
      }

      return true;
    }

    return false;
  }

  /**
   * 激活开关
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功
   * @private
   */
  _activateSwitch(player) {
    if (this.obstacleType !== 'switch') return false;

    this.isInteracted = true;

    // 播放激活音效
    if (audioManager) {
      audioManager.playSFX('switch.wav', 0.5);
    }

    return true;
  }

  /**
   * 激活压力板
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功
   * @private
   */
  _activatePressurePlate(player) {
    if (this.obstacleType !== 'pressure_plate') return false;

    // 检查玩家是否在压力板上
    if (this.containsPoint(player.x + player.width / 2, player.y + player.height / 2)) {
      this.isInteracted = true;

      // 播放激活音效
      if (audioManager) {
        audioManager.playSFX('pressure.wav', 0.4);
      }

      return true;
    }

    return false;
  }

  /**
   * 造成伤害
   * @param {Entity} target - 目标实体
   * @returns {boolean} 是否造成伤害
   */
  causeDamage(target) {
    if (this.damage <= 0 || !target.takeDamage) return false;

    target.takeDamage(this.damage, this);

    // 播放伤害音效
    if (audioManager && target.type === 'player') {
      audioManager.playSFX('damage.wav', 0.8);
    }

    return true;
  }

  /**
   * 渲染障碍物
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.isVisible || this.isDead) return;

    ctx.save();

    // 应用变换
    this._applyTransformations(ctx);

    // 设置透明度
    ctx.globalAlpha = this.alpha;

    // 渲染障碍物
    this._renderObstacleShape(ctx);

    // 渲染特殊效果
    this._renderSpecialEffects(ctx);

    // 渲染调试信息
    if (GameEngine.debugMode) {
      this._renderDebug(ctx);
    }

    ctx.restore();
  }

  /**
   * 渲染障碍物形状
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderObstacleShape(ctx) {
    switch (this.obstacleType) {
    case 'rock':
      this._renderRock(ctx);
      break;
    case 'ice':
      this._renderIce(ctx);
      break;
    case 'fire':
      this._renderFire(ctx);
      break;
    case 'web':
      this._renderWeb(ctx);
      break;
    case 'door':
      this._renderDoor(ctx);
      break;
    case 'spikes':
      this._renderSpikes(ctx);
      break;
    case 'switch':
      this._renderSwitch(ctx);
      break;
    case 'pressure_plate':
      this._renderPressurePlate(ctx);
      break;
    default:
      this._renderDefault(ctx);
      break;
    }
  }

  /**
   * 渲染岩石
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderRock(ctx) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, this.width, this.height);

    // 添加纹理
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(2, 2, this.width - 4, this.height - 4);

    // 边框
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染冰块
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderIce(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#E0F6FF');
    gradient.addColorStop(0.5, '#87CEEB');
    gradient.addColorStop(1, '#4682B4');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 冰晶效果
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * this.width, 0);
      ctx.lineTo(Math.random() * this.width, this.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * 渲染火焰
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderFire(ctx) {
    if (this.animationFrames && this.animationFrames[this.animationFrame]) {
      const frame = this.animationFrames[this.animationFrame];
      const gradient = ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        0,
        this.width / 2,
        this.height / 2,
        this.width / 2
      );

      gradient.addColorStop(0, frame.color);
      gradient.addColorStop(0.7, this.color);
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0.3)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);

      // 火焰效果
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, this.width / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 渲染蜘蛛网
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderWeb(ctx) {
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 1;

    // 绘制网状结构
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(this.width / 2, this.height / 2);
      ctx.lineTo(
        this.width / 2 + (Math.cos(angle) * this.width) / 2,
        this.height / 2 + (Math.sin(angle) * this.height) / 2
      );
      ctx.stroke();
    }

    // 绘制同心圆
    for (let r = this.width / 4; r < this.width / 2; r += this.width / 8) {
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * 渲染门
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderDoor(ctx) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, this.width, this.height);

    // 门框
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, this.width, this.height);

    // 门把手
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.width - 8, this.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 渲染尖刺
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderSpikes(ctx) {
    ctx.fillStyle = '#C0C0C0';

    const spikeWidth = this.width / 4;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * spikeWidth, this.height);
      ctx.lineTo((i + 0.5) * spikeWidth, 0);
      ctx.lineTo((i + 1) * spikeWidth, this.height);
      ctx.closePath();
      ctx.fill();
    }

    // 边框
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染开关
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderSwitch(ctx) {
    ctx.fillStyle = this.isInteracted ? '#00FF00' : '#FFFF00';
    ctx.fillRect(0, 0, this.width, this.height);

    // 开关手柄
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.width / 2 - 2, 2, 4, this.height - 4);

    // 边框
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染压力板
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderPressurePlate(ctx) {
    ctx.fillStyle = this.isInteracted ? '#808080' : '#A0A0A0';
    ctx.fillRect(0, 0, this.width, this.height);

    // 压力感应指示器
    ctx.fillStyle = this.isInteracted ? '#FF0000' : '#00FF00';
    ctx.fillRect(this.width / 2 - 2, 2, 4, this.height - 4);

    // 边框
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染默认形状
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderDefault(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染特殊效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderSpecialEffects(ctx) {
    // 交互范围提示
    if (GameEngine.debugMode && !this.isInteracted) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.interactionRange,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateAnimation(deltaTime) {
    if (!this.isAnimating || !this.animationFrames || this.animationFrames.length === 0) {
      return;
    }

    this.animationTimer += deltaTime;

    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame = (this.animationFrame + 1) % this.animationFrames.length;
      this.animationTimer = 0;
    }
  }

  /**
   * 更新特殊效果
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateSpecialEffects(deltaTime) {
    // 重置压力板状态
    if (this.obstacleType === 'pressure_plate') {
      this.isInteracted = false;
    }
  }

  /**
   * 获取障碍物信息
   * @returns {Object} 障碍物信息
   */
  getObstacleInfo() {
    return {
      type: this.obstacleType,
      isBreakable: this.isBreakable,
      isPassable: this.isPassable,
      requiredItem: this.requiredItem,
      isInteracted: this.isInteracted,
      damage: this.damage,
    };
  }
}

window.Obstacle = Obstacle;
})();
