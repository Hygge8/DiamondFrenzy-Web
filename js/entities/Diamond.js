/**
 * 钻石类
 * 游戏中的收集物品
 */
class Diamond extends Entity {
  constructor(x, y, value = 10) {
    super(x, y, 24, 24);

    this.type = 'diamond';
    this.name = 'Diamond';
    this.value = value;
    this.isCollected = false;
    this.isGlowing = true;
    this.glowIntensity = 0;
    this.glowDirection = 1;

    // 动画属性
    this.floatOffset = 0;
    this.floatSpeed = 0.05;
    this.floatAmplitude = 3;

    // 粒子效果
    this.particles = [];
    this.particleTimer = 0;
    this.particleInterval = 100; // 每100ms生成一个粒子

    // 音效
    this.soundName = 'collect_diamond';

    // 设置颜色
    this.setColor('#00ffff'); // 青色代表钻石
  }

  /**
   * 更新钻石
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (this.isDead || this.isCollected) return;

    // 更新浮动动画
    this._updateFloatAnimation(deltaTime);

    // 更新发光效果
    this._updateGlowEffect(deltaTime);

    // 更新粒子效果
    this._updateParticles(deltaTime);

    // 调用父类更新
    super.update(deltaTime);
  }

  /**
   * 收集钻石
   */
  collect() {
    if (this.isCollected) return;

    this.isCollected = true;
    this.isActive = false;

    // 触发收集事件
    this.emit('diamondCollected', this);

    // 播放收集音效
    if (audioManager) {
      audioManager.playSFX(this.soundName, 0.7);
    }

    // 生成收集粒子效果
    this._createCollectParticles();

    console.log(`收集了价值 ${this.value} 的钻石`);
  }

  /**
   * 渲染钻石
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.isVisible || this.isDead) return;

    ctx.save();

    // 应用浮动变换
    const floatY = this.y + this.floatOffset;
    ctx.translate(this.x, floatY);

    // 应用缩放
    ctx.scale(this.scaleX, this.scaleY);

    // 设置透明度
    ctx.globalAlpha = this.alpha;

    // 渲染发光效果
    if (this.isGlowing) {
      this._renderGlowEffect(ctx);
    }

    // 渲染钻石本体
    this._renderDiamondShape(ctx);

    // 渲染粒子效果
    this._renderParticles(ctx);

    // 渲染调试信息
    if (GameEngine.debugMode) {
      this._renderDebug(ctx);
    }

    ctx.restore();
  }

  /**
   * 更新浮动动画
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateFloatAnimation(deltaTime) {
    this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * this.floatAmplitude;
  }

  /**
   * 更新发光效果
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateGlowEffect(deltaTime) {
    this.glowIntensity += this.glowDirection * 0.02;

    if (this.glowIntensity >= 1) {
      this.glowIntensity = 1;
      this.glowDirection = -1;
    } else if (this.glowIntensity <= 0.3) {
      this.glowIntensity = 0.3;
      this.glowDirection = 1;
    }
  }

  /**
   * 更新粒子效果
   * @param {number} deltaTime - 帧间隔时间
   * @private
   */
  _updateParticles(deltaTime) {
    this.particleTimer += deltaTime;

    if (this.particleTimer >= this.particleInterval) {
      this._createParticle();
      this.particleTimer = 0;
    }

    // 更新现有粒子
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return !particle.isDead;
    });
  }

  /**
   * 创建粒子
   * @private
   */
  _createParticle() {
    const particle = new Particle(
      this.x + this.width / 2 + Math.random() * 20 - 10,
      this.y + this.height / 2 + Math.random() * 20 - 10,
      '#00ffff',
      500 // 500ms生命周期
    );

    // 设置粒子属性
    particle.velocityX = (Math.random() - 0.5) * 2;
    particle.velocityY = (Math.random() - 0.5) * 2 - 1;
    particle.size = Math.random() * 3 + 1;

    this.particles.push(particle);
  }

  /**
   * 创建收集粒子效果
   * @private
   */
  _createCollectParticles() {
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 3;

      const particle = new Particle(
        this.x + this.width / 2,
        this.y + this.height / 2,
        '#ffffff',
        800
      );

      particle.velocityX = Math.cos(angle) * speed;
      particle.velocityY = Math.sin(angle) * speed;
      particle.size = 4;

      this.particles.push(particle);
    }
  }

  /**
   * 渲染发光效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderGlowEffect(ctx) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.max(this.width, this.height) / 2 + 8;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

    gradient.addColorStop(0, `rgba(0, 255, 255, ${this.glowIntensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 渲染钻石形状
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderDiamondShape(ctx) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = Math.min(this.width, this.height) / 2;

    // 钻石主体
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX + size * 0.8, centerY);
    ctx.lineTo(centerX, centerY + size);
    ctx.lineTo(centerX - size * 0.8, centerY);
    ctx.closePath();
    ctx.fill();

    // 高光效果
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.8);
    ctx.lineTo(centerX + size * 0.3, centerY - size * 0.2);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX - size * 0.3, centerY - size * 0.2);
    ctx.closePath();
    ctx.fill();

    // 边框
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#0088aa';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * 渲染粒子效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @private
   */
  _renderParticles(ctx) {
    this.particles.forEach(particle => {
      particle.render(ctx);
    });
  }

  /**
   * 设置价值
   * @param {number} value - 价值
   */
  setValue(value) {
    this.value = Math.max(1, value);
  }

  /**
   * 设置发光状态
   * @param {boolean} glowing - 是否发光
   */
  setGlowing(glowing) {
    this.isGlowing = glowing;
  }

  /**
   * 获取钻石信息
   * @returns {Object} 钻石信息
   */
  getDiamondInfo() {
    return {
      value: this.value,
      isCollected: this.isCollected,
      isGlowing: this.isGlowing,
      position: { x: this.x, y: this.y },
    };
  }
}

/**
 * 粒子类
 */
class Particle extends Entity {
  constructor(x, y, color, lifetime = 1000) {
    super(x, y, 2, 2);

    this.color = color;
    this.lifetime = lifetime;
    this.age = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 0.1;
    this.friction = 0.98;

    this.type = 'particle';
    this.isCollidable = false;
  }

  /**
   * 更新粒子
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    this.age += deltaTime;

    if (this.age >= this.lifetime) {
      this.isDead = true;
      return;
    }

    // 应用重力
    this.velocityY += this.gravity;

    // 应用摩擦力
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // 更新位置
    this.x += this.velocityX;
    this.y += this.velocityY;

    // 更新透明度
    const lifeRatio = this.age / this.lifetime;
    this.alpha = 1 - lifeRatio;

    // 更新大小
    const sizeRatio = 1 - lifeRatio * 0.5;
    this.scaleX = sizeRatio;
    this.scaleY = sizeRatio;
  }

  /**
   * 渲染粒子
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (this.isDead || this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
