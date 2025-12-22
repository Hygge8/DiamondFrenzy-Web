/**
 * 道具基类
 * 游戏中的各种道具
 */
const Entity = window.Entity;
const MathUtils = window.MathUtils;

class Item extends Entity {
  constructor(x, y, type, name) {
    super(x, y, 24, 24);

    this.type = 'item';
    this.itemType = type;
    this.name = name;

    // 道具属性
    this.quantity = 1;
    this.maxQuantity = 99;
    this.isConsumable = true;
    this.cooldown = 0;
    this.maxCooldown = 0;

    // 使用属性
    this.range = 64;
    this.duration = 0;
    this.power = 1;

    // 状态属性
    this.isUsable = true;
    this.isStackable = true;
    this.isRare = false;

    // 视觉效果
    this.glowColor = '#ffffff';
    this.particleColor = '#ffffff';

    // 音效
    this.useSound = 'use_item.wav';
    this.pickupSound = 'pickup_item.wav';

    // 设置初始颜色
    this._setupByType(type);
  }

  /**
   * 根据类型设置属性
   * @param {string} type - 道具类型
   * @private
   */
  _setupByType(type) {
    switch (type) {
    case 'compass':
      this.name = '指南针';
      this.color = '#FFD700';
      this.glowColor = '#FFD700';
      this.particleColor = '#FFD700';
      this.isConsumable = false;
      this.power = 1;
      break;

    case 'hammer':
      this.name = '锤子';
      this.color = '#8B4513';
      this.glowColor = '#8B4513';
      this.particleColor = '#8B4513';
      this.power = 2;
      this.range = 32;
      break;

    case 'grapple_hook':
      this.name = '抓钩';
      this.color = '#C0C0C0';
      this.glowColor = '#C0C0C0';
      this.particleColor = '#C0C0C0';
      this.power = 1;
      this.range = 128;
      break;

    case 'ice_ray':
      this.name = '冰冻射线';
      this.color = '#87CEEB';
      this.glowColor = '#87CEEB';
      this.particleColor = '#87CEEB';
      this.power = 1;
      this.duration = 3000; // 3秒冰冻
      this.range = 96;
      break;

    case 'dynamite':
      this.name = '炸药';
      this.color = '#FF4500';
      this.glowColor = '#FF4500';
      this.particleColor = '#FF4500';
      this.power = 3;
      this.range = 64;
      break;

    case 'shield':
      this.name = '护盾';
      this.color = '#00FFFF';
      this.glowColor = '#00FFFF';
      this.particleColor = '#00FFFF';
      this.duration = 5000; // 5秒护盾
      break;

    case 'speed_boots':
      this.name = '速度靴';
      this.color = '#32CD32';
      this.glowColor = '#32CD32';
      this.particleColor = '#32CD32';
      this.duration = 3000; // 3秒加速
      break;

    case 'gem_bag':
      this.name = '宝石袋';
      this.color = '#9932CC';
      this.glowColor = '#9932CC';
      this.particleColor = '#9932CC';
      this.power = 2; // 得分加成
      this.isConsumable = false;
      break;

    default:
      this.name = `Item_${type}`;
      this.color = '#FFFFFF';
      break;
    }
  }

  /**
   * 使用道具
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功使用
   */
  use(player) {
    if (!this.isUsable || this.cooldown > 0 || this.quantity <= 0) {
      return false;
    }

    // 执行具体的使用逻辑
    const success = this._executeUse(player);

    if (success) {
      // 消耗道具
      if (this.isConsumable) {
        this.quantity--;

        // 播放使用音效
        if (audioManager) {
          audioManager.playSFX(this.useSound, 0.6);
        }

        // 设置冷却时间
        if (this.maxCooldown > 0) {
          this.cooldown = this.maxCooldown;
        }

        // 如果数量为0，销毁道具
        if (this.quantity <= 0) {
          this.destroy();
        }
      }

      // 触发使用事件
      this.emit('itemUsed', { player, item: this });
    }

    return success;
  }

  /**
   * 执行具体的使用逻辑
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功
   * @protected
   */
  _executeUse(player) {
    // 子类实现具体逻辑
    return false;
  }

  /**
   * 拾取道具
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否成功拾取
   */
  pickup(player) {
    const success = player.addItem(this);

    if (success) {
      // 销毁场景中的道具
      this.isActive = false;
      this.isDead = true;

      // 播放拾取音效
      if (audioManager) {
        audioManager.playSFX(this.pickupSound, 0.5);
      }

      // 触发拾取事件
      this.emit('itemPicked', { player, item: this });

      console.log(`拾取了道具: ${this.name}`);
    }

    return success;
  }

  /**
   * 更新道具
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.isActive || this.isDead) return;

    // 更新冷却时间
    if (this.cooldown > 0) {
      this.cooldown -= deltaTime;
      if (this.cooldown < 0) {
        this.cooldown = 0;
      }
    }

    // 更新持续效果
    this._updateDurationEffects(deltaTime);

    // 调用父类更新
    super.update(deltaTime);
  }

  /**
   * 渲染道具
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.isVisible || this.isDead) return;

    ctx.save();

    // 应用变换
    this._applyTransformations(ctx);

    // 设置透明度
    ctx.globalAlpha = this.alpha;

    // 冷却时半透明
    if (this.cooldown > 0) {
      ctx.globalAlpha *= 0.5;
    }

    // 渲染发光效果
    this._renderGlowEffect(ctx);

    // 渲染道具
    this._renderItemShape(ctx);

    // 渲染数量
    if (this.quantity > 1) {
      this._renderQuantity(ctx);
    }

    // 渲染冷却指示
    if (this.cooldown > 0) {
      this._renderCooldownIndicator(ctx);
    }

    // 渲染调试信息
    if (GameEngine.debugMode) {
      this._renderDebug(ctx);
    }

    ctx.restore();
  }

  /**
   * 渲染发光效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderGlowEffect(ctx) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.max(this.width, this.height) / 2 + 4;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

    gradient.addColorStop(0, `${this.glowColor}40`);
    gradient.addColorStop(1, `${this.glowColor}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 渲染道具形状
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderItemShape(ctx) {
    // 子类实现具体渲染
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染数量
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderQuantity(ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    const text = this.quantity.toString();
    ctx.strokeText(text, this.width - 2, this.height - 2);
    ctx.fillText(text, this.width - 2, this.height - 2);
  }

  /**
   * 渲染冷却指示
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderCooldownIndicator(ctx) {
    const cooldownRatio = this.cooldown / this.maxCooldown;
    const barHeight = this.height * cooldownRatio;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, this.height - barHeight, this.width, barHeight);
  }

  /**
   * 更新持续效果
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateDurationEffects(deltaTime) {
    // 子类实现持续效果更新
  }

  /**
   * 设置数量
   * @param {number} quantity - 数量
   */
  setQuantity(quantity) {
    this.quantity = MathUtils.clamp(quantity, 0, this.maxQuantity);
  }

  /**
   * 增加数量
   * @param {number} amount - 增加数量
   */
  addQuantity(amount) {
    this.setQuantity(this.quantity + amount);
  }

  /**
   * 减少数量
   * @param {number} amount - 减少数量
   */
  removeQuantity(amount) {
    this.setQuantity(this.quantity - amount);
  }

  /**
   * 设置冷却时间
   * @param {number} cooldown - 冷却时间（毫秒）
   */
  setCooldown(cooldown) {
    this.maxCooldown = cooldown;
    this.cooldown = cooldown;
  }

  /**
   * 检查是否可以使用的
   * @returns {boolean} 是否可以使用
   */
  canUse() {
    return this.isUsable && this.cooldown <= 0 && this.quantity > 0;
  }

  /**
   * 获取道具信息
   * @returns {Object} 道具信息
   */
  getItemInfo() {
    return {
      type: this.itemType,
      name: this.name,
      quantity: this.quantity,
      maxQuantity: this.maxQuantity,
      cooldown: this.cooldown,
      maxCooldown: this.maxCooldown,
      isUsable: this.canUse(),
      isConsumable: this.isConsumable,
      power: this.power,
      range: this.range,
      duration: this.duration,
    };
  }

  /**
   * 克隆道具
   * @returns {Item} 克隆的道具
   */
  clone() {
    const cloned = new Item(this.x, this.y, this.itemType, this.name);

    // 复制属性
    cloned.quantity = this.quantity;
    cloned.maxQuantity = this.maxQuantity;
    cloned.isConsumable = this.isConsumable;
    cloned.cooldown = this.cooldown;
    cloned.maxCooldown = this.maxCooldown;
    cloned.range = this.range;
    cloned.duration = this.duration;
    cloned.power = this.power;
    cloned.isUsable = this.isUsable;
    cloned.isStackable = this.isStackable;
    cloned.isRare = this.isRare;
    cloned.glowColor = this.glowColor;
    cloned.particleColor = this.particleColor;
    cloned.useSound = this.useSound;
    cloned.pickupSound = this.pickupSound;

    return cloned;
  }
}

window.Item = Item;
