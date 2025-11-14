/**
 * 基础实体类
 * 所有游戏实体的基类
 */
class Entity {
  constructor(x = 0, y = 0, width = 32, height = 32) {
    // 位置和尺寸
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // 速度
    this.velocityX = 0;
    this.velocityY = 0;
    this.maxSpeed = 5;
    this.acceleration = 0.5;
    this.friction = 0.8;

    // 状态
    this.isActive = true;
    this.isVisible = true;
    this.isCollidable = true;
    this.isDead = false;

    // 动画
    this.animationFrame = 0;
    this.animationSpeed = 0.1;
    this.animationTimer = 0;
    this.isAnimating = false;

    // 渲染属性
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.alpha = 1;
    this.color = '#ffffff';
    this.sprite = null;
    this.spriteSheet = null;
    this.spriteFrame = { x: 0, y: 0, width: width, height: height };

    // 物理属性
    this.mass = 1;
    this.gravity = 0;
    this.isGrounded = false;
    this.bounce = 0;

    // 碰撞检测
    this.collisionBounds = { x: 0, y: 0, width: width, height: height };
    this.collisionOffset = { x: 0, y: 0 };

    // 事件系统
    this.eventListeners = new Map();

    // 唯一标识
    this.id = Entity.generateId();
    this.type = 'entity';
    this.name = '';
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  static generateId() {
    return 'entity_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 初始化实体
   */
  init() {
    // 子类实现
  }

  /**
   * 更新实体
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.isActive || this.isDead) return;

    // 更新动画
    this._updateAnimation(deltaTime);

    // 更新物理
    this._updatePhysics(deltaTime);

    // 更新碰撞边界
    this._updateCollisionBounds();
  }

  /**
   * 渲染实体
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.isVisible || this.isDead) return;

    ctx.save();

    // 应用变换
    this._applyTransformations(ctx);

    // 设置透明度
    ctx.globalAlpha = this.alpha;

    // 渲染精灵或几何图形
    if (this.sprite) {
      this._renderSprite(ctx);
    } else {
      this._renderShape(ctx);
    }

    // 渲染调试信息
    if (GameEngine.debugMode) {
      this._renderDebug(ctx);
    }

    ctx.restore();
  }

  /**
   * 销毁实体
   */
  destroy() {
    this.isActive = false;
    this.isDead = true;
    this.eventListeners.clear();
  }

  /**
   * 设置位置
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.collisionBounds.width = width;
    this.collisionBounds.height = height;
  }

  /**
   * 设置速度
   * @param {number} vx - x方向速度
   * @param {number} vy - y方向速度
   */
  setVelocity(vx, vy) {
    this.velocityX = vx;
    this.velocityY = vy;
  }

  /**
   * 设置精灵
   * @param {HTMLImageElement|HTMLCanvasElement} sprite - 精灵图像
   * @param {Object} frame - 精灵帧信息
   */
  setSprite(sprite, frame = null) {
    this.sprite = sprite;
    if (frame) {
      this.spriteFrame = { ...this.spriteFrame, ...frame };
    }
  }

  /**
   * 设置颜色
   * @param {string} color - 颜色
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * 设置透明度
   * @param {number} alpha - 透明度 (0-1)
   */
  setAlpha(alpha) {
    this.alpha = MathUtils.clamp(alpha, 0, 1);
  }

  /**
   * 设置旋转
   * @param {number} rotation - 旋转角度（弧度）
   */
  setRotation(rotation) {
    this.rotation = rotation;
  }

  /**
   * 设置缩放
   * @param {number} scaleX - x方向缩放
   * @param {number} scaleY - y方向缩放
   */
  setScale(scaleX, scaleY) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  /**
   * 获取位置
   * @returns {Object} 位置 {x, y}
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * 获取中心点
   * @returns {Object} 中心点 {x, y}
   */
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  /**
   * 获取边界框
   * @returns {Object} 边界框 {x, y, width, height}
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * 获取碰撞边界框
   * @returns {Object} 碰撞边界框
   */
  getCollisionBounds() {
    return {
      x: this.x + this.collisionOffset.x,
      y: this.y + this.collisionOffset.y,
      width: this.collisionBounds.width,
      height: this.collisionBounds.height,
    };
  }

  /**
   * 检查是否与另一个实体碰撞
   * @param {Entity} other - 另一个实体
   * @returns {boolean} 是否碰撞
   */
  collidesWith(other) {
    if (!this.isCollidable || !other.isCollidable) return false;

    const bounds1 = this.getCollisionBounds();
    const bounds2 = other.getCollisionBounds();

    return MathUtils.rectCollision(bounds1, bounds2);
  }

  /**
   * 检查点是否在实体内部
   * @param {number} x - 点的x坐标
   * @param {number} y - 点的y坐标
   * @returns {boolean} 是否在内部
   */
  containsPoint(x, y) {
    const bounds = this.getBounds();
    return MathUtils.pointInRect(x, y, bounds);
  }

  /**
   * 获取距离
   * @param {Entity} other - 另一个实体
   * @returns {number} 距离
   */
  getDistance(other) {
    const center1 = this.getCenter();
    const center2 = other.getCenter();
    return MathUtils.distance(center1.x, center1.y, center2.x, center2.y);
  }

  /**
   * 获取角度
   * @param {Entity} other - 另一个实体
   * @returns {number} 角度（弧度）
   */
  getAngle(other) {
    const center1 = this.getCenter();
    const center2 = other.getCenter();
    return MathUtils.angle(center1.x, center1.y, center2.x, center2.y);
  }

  /**
   * 移动实体
   * @param {number} dx - x方向移动距离
   * @param {number} dy - y方向移动距离
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * 朝向目标移动
   * @param {number} targetX - 目标x坐标
   * @param {number} targetY - 目标y坐标
   * @param {number} speed - 移动速度
   */
  moveTowards(targetX, targetY, speed) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.velocityX = (dx / distance) * speed;
      this.velocityY = (dy / distance) * speed;
    }
  }

  /**
   * 停止移动
   */
  stop() {
    this.velocityX = 0;
    this.velocityY = 0;
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件回调执行错误:', error);
        }
      });
    }
  }

  /**
   * 克隆实体
   * @returns {Entity} 克隆的实体
   */
  clone() {
    const cloned = new Entity(this.x, this.y, this.width, this.height);

    // 复制属性
    cloned.velocityX = this.velocityX;
    cloned.velocityY = this.velocityY;
    cloned.maxSpeed = this.maxSpeed;
    cloned.acceleration = this.acceleration;
    cloned.friction = this.friction;
    cloned.isActive = this.isActive;
    cloned.isVisible = this.isVisible;
    cloned.isCollidable = this.isCollidable;
    cloned.rotation = this.rotation;
    cloned.scaleX = this.scaleX;
    cloned.scaleY = this.scaleY;
    cloned.alpha = this.alpha;
    cloned.color = this.color;
    cloned.sprite = this.sprite;
    cloned.spriteFrame = { ...this.spriteFrame };
    cloned.mass = this.mass;
    cloned.gravity = this.gravity;
    cloned.bounce = this.bounce;
    cloned.collisionBounds = { ...this.collisionBounds };
    cloned.collisionOffset = { ...this.collisionOffset };
    cloned.type = this.type;
    cloned.name = this.name;

    return cloned;
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateAnimation(deltaTime) {
    if (!this.isAnimating) return;

    this.animationTimer += deltaTime;

    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame++;
      this.animationTimer = 0;
    }
  }

  /**
   * 更新物理
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updatePhysics(deltaTime) {
    // 应用重力
    if (this.gravity > 0) {
      this.velocityY += this.gravity * deltaTime;
    }

    // 应用摩擦力
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // 限制最大速度
    const speed = MathUtils.vectorLength(this.velocityX, this.velocityY);
    if (speed > this.maxSpeed) {
      const normalized = MathUtils.normalize(this.velocityX, this.velocityY);
      this.velocityX = normalized.x * this.maxSpeed;
      this.velocityY = normalized.y * this.maxSpeed;
    }

    // 更新位置
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  /**
   * 更新碰撞边界
   * @private
   */
  _updateCollisionBounds() {
    this.collisionBounds.x = this.collisionOffset.x;
    this.collisionBounds.y = this.collisionOffset.y;
    this.collisionBounds.width = this.width;
    this.collisionBounds.height = this.height;
  }

  /**
   * 应用变换
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _applyTransformations(ctx) {
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-this.width / 2, -this.height / 2);
  }

  /**
   * 渲染精灵
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderSprite(ctx) {
    if (this.sprite instanceof HTMLImageElement && this.sprite.complete) {
      ctx.drawImage(
        this.sprite,
        this.spriteFrame.x,
        this.spriteFrame.y,
        this.spriteFrame.width,
        this.spriteFrame.height,
        0,
        0,
        this.width,
        this.height
      );
    } else if (this.sprite instanceof HTMLCanvasElement) {
      ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
    }
  }

  /**
   * 渲染几何图形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderShape(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染调试信息
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderDebug(ctx) {
    // 渲染边界框
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.width, this.height);

    // 渲染碰撞边界
    ctx.strokeStyle = '#00ff00';
    ctx.strokeRect(
      this.collisionOffset.x,
      this.collisionOffset.y,
      this.collisionBounds.width,
      this.collisionBounds.height
    );

    // 渲染中心点
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(this.width / 2 - 2, this.height / 2 - 2, 4, 4);

    // 渲染文字信息
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.type}:${this.name}`, 5, 15);
  }
}
