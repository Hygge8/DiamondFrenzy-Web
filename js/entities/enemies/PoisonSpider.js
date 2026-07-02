(function () {
/**
 * 毒蜘蛛类 - 巴伐利亚地牢世界的环境互动敌人
 * 可通过岩石砸击或冰冻后推压机关触发奖励
 * 与水下机关紧密相关，可被环境消灭
 */
var Enemy = window.Enemy;

class PoisonSpider extends Enemy {
  constructor(x, y) {
    super(x, y);

    // 毒蜘蛛属性
    this.type = 'poisonSpider';
    this.width = 20;
    this.height = 20;
    this.color = '#2F4F2F'; // 深绿色
    this.speed = 50;
    this.maxHealth = 60;
    this.health = this.maxHealth;
    this.damage = 20;

    // AI状态
    this.state = 'webbing'; // webbing, hunting, frozen, stunned, underwater
    this.stateTimer = 0;
    this.target = null;
    this.detectionRange = 150;
    this.attackRange = 25;
    this.attackCooldown = 0;
    this.freezeTimer = 0;
    this.stunTimer = 0;

    // 特殊行为
    this.canBeFrozen = true;
    this.canBeStunned = true;
    this.immuneToItems = false;
    this.environmentVulnerable = true;
    this.canEnterWater = true; // 可以进入水中
    this.webShootingRange = 80;
    this.webCooldown = 0;
    this.webInterval = 3.0; // 3秒吐网间隔

    // 环境互动
    this.inWater = false;
    this.canTriggerMechanisms = true;
    this.mechanismTriggerRange = 30;

    // 奖励系统
    this.canDropRewards = true;
    this.rewardChance = 0.7; // 70%概率掉落奖励
    this.possibleRewards = ['mysteriousWater', 'redDiamond', 'key', 'speedBoots'];

    // 动画相关
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.25;
    this.legAnimationPhase = 0;
    this.webProjectiles = [];
  }

  /**
   * 更新敌人状态
   */
  update(deltaTime, gameState) {
    super.update(deltaTime, gameState);

    // 更新冷却计时器
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    if (this.webCooldown > 0) {
      this.webCooldown -= deltaTime;
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= deltaTime;
      if (this.freezeTimer <= 0) {
        this.state = this.inWater ? 'underwater' : 'hunting';
        this.freezeTimer = 0;
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.state = this.inWater ? 'underwater' : 'hunting';
        this.stunTimer = 0;
      }
    }

    // 检查是否在水中
    this.checkWaterState(gameState);

    // 更新投射物
    this.updateWebProjectiles(deltaTime, gameState);

    // 更新动画
    this.updateAnimation(deltaTime);

    // 根据状态执行行为
    switch (this.state) {
    case 'frozen':
      this.handleFrozenState(deltaTime);
      break;
    case 'stunned':
      this.handleStunnedState(deltaTime);
      break;
    case 'underwater':
      this.handleUnderwaterState(deltaTime, gameState);
      break;
    case 'webbing':
      this.handleWebbingState(deltaTime, gameState);
      break;
    case 'hunting':
    default:
      this.handleHuntingState(deltaTime, gameState);
      break;
    }
  }

  /**
   * 狩猎状态处理
   */
  handleHuntingState(deltaTime, gameState) {
    // 寻找玩家
    const player = gameState.player;
    if (player && this.getDistanceTo(player) <= this.detectionRange) {
      this.target = player;
      this.state = 'webbing';
      return;
    }

    // 随机游走
    this.velocity.x = (Math.random() - 0.5) * this.speed;
    this.velocity.y = (Math.random() - 0.5) * this.speed;

    // 检查机关触发
    this.checkMechanismTrigger(gameState);
  }

  /**
   * 吐网状态处理
   */
  handleWebbingState(deltaTime, gameState) {
    const player = gameState.player;

    if (!player || this.getDistanceTo(player) > this.detectionRange * 1.2) {
      // 失去目标
      this.target = null;
      this.state = this.inWater ? 'underwater' : 'hunting';
      return;
    }

    // 射击蜘蛛网
    if (this.webCooldown <= 0) {
      this.shootWeb(player);
      this.webCooldown = this.webInterval;
    }

    // 缓慢接近玩家
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.attackRange) {
      this.velocity.x = (dx / distance) * this.speed * 0.7;
      this.velocity.y = (dy / distance) * this.speed * 0.7;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  /**
   * 水下状态处理
   */
  handleUnderwaterState(deltaTime, gameState) {
    const player = gameState.player;

    // 水下移动更慢
    this.speed = 30;

    if (player && player.isInWater() && this.getDistanceTo(player) <= this.detectionRange) {
      this.target = player;
      this.state = 'webbing';
      return;
    }

    // 水下随机游动
    this.velocity.x = (Math.random() - 0.5) * this.speed;
    this.velocity.y = (Math.random() - 0.5) * this.speed;

    // 检查水下机关
    this.checkUnderwaterMechanisms(gameState);
  }

  /**
   * 冰冻状态处理
   */
  handleFrozenState(deltaTime) {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.color = '#87CEEB';
  }

  /**
   * 眩晕状态处理
   */
  handleStunnedState(deltaTime) {
    this.velocity.x *= 0.6;
    this.velocity.y *= 0.6;
    this.color = '#FFFF99';
  }

  /**
   * 检查水中状态
   */
  checkWaterState(gameState) {
    const waterAreas = gameState.level.getObjectsByType('water');
    this.inWater = false;

    for (const water of waterAreas) {
      if (this.isCollidingWith(water)) {
        this.inWater = true;
        break;
      }
    }

    // 如果在水中但状态不是水下，则切换到水下状态
    if (this.inWater && this.state !== 'frozen' && this.state !== 'stunned') {
      this.state = 'underwater';
    } else if (!this.inWater && this.state === 'underwater') {
      this.state = 'hunting';
    }
  }

  /**
   * 射击蜘蛛网
   */
  shootWeb(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.webShootingRange) {
      const speed = 100;
      this.webProjectiles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: (dx / distance) * speed,
        vy: (dy / distance) * speed,
        damage: 10,
        life: 2.0, // 2秒生存时间
      });

      this.gameState.audioManager.playSound('webShoot');
    }
  }

  /**
   * 更新蜘蛛网投射物
   */
  updateWebProjectiles(deltaTime, gameState) {
    for (let i = this.webProjectiles.length - 1; i >= 0; i--) {
      const web = this.webProjectiles[i];

      // 更新位置
      web.x += web.vx * deltaTime;
      web.y += web.vy * deltaTime;
      web.life -= deltaTime;

      // 检查与玩家碰撞
      const player = gameState.player;
      if (player && this.isCollidingWithPoint(web.x, web.y, player)) {
        player.takeDamage(web.damage);
        player.applyWebEffect(1.5); // 1.5秒网困效果
        this.webProjectiles.splice(i, 1);
        this.gameState.audioManager.playSound('webHit');
        continue;
      }

      // 移除过期投射物
      if (web.life <= 0 || this.isOutOfBounds(web.x, web.y)) {
        this.webProjectiles.splice(i, 1);
      }
    }
  }

  /**
   * 检查机关触发
   */
  checkMechanismTrigger(gameState) {
    if (!this.canTriggerMechanisms) return;

    const mechanisms = gameState.level.getObjectsByType('mechanism');
    for (const mechanism of mechanisms) {
      if (this.getDistanceTo(mechanism) <= this.mechanismTriggerRange) {
        mechanism.trigger();

        // 触发机关后可能有奖励
        if (Math.random() < this.rewardChance) {
          this.dropReward(gameState, mechanism.position);
        }

        this.gameState.audioManager.playSound('mechanismTrigger');
        break;
      }
    }
  }

  /**
   * 检查水下机关
   */
  checkUnderwaterMechanisms(gameState) {
    if (!this.inWater) return;

    const underwaterMechanisms = gameState.level.getObjectsByType('underwaterMechanism');
    for (const mechanism of underwaterMechanisms) {
      if (this.getDistanceTo(mechanism) <= this.mechanismTriggerRange) {
        mechanism.trigger();

        // 水下机关触发有更高奖励概率
        if (Math.random() < this.rewardChance * 1.2) {
          this.dropReward(gameState, mechanism.position, true);
        }

        this.gameState.audioManager.playSound('underwaterMechanism');
        break;
      }
    }
  }

  /**
   * 掉落奖励
   */
  dropReward(gameState, position, isUnderwater = false) {
    const rewardType =
      this.possibleRewards[Math.floor(Math.random() * this.possibleRewards.length)];

    const reward = {
      type: rewardType,
      x: position.x,
      y: position.y,
      value: this.getRewardValue(rewardType),
      isUnderwater: isUnderwater,
    };

    gameState.level.addReward(reward);
    this.gameState.audioManager.playSound('rewardDrop');
  }

  /**
   * 获取奖励价值
   */
  getRewardValue(rewardType) {
    const values = {
      mysteriousWater: 50,
      redDiamond: 100,
      key: 25,
      speedBoots: 75,
    };
    return values[rewardType] || 30;
  }

  /**
   * 受到冰冻效果
   */
  takeFreezeEffect(duration = 4.0) {
    if (this.freezeTimer <= 0) {
      this.freezeTimer = duration;
      this.state = 'frozen';
      this.gameState.audioManager.playSound('freeze');
    }
  }

  /**
   * 受到眩晕效果
   */
  takeStunEffect(duration = 2.5) {
    if (this.stunTimer <= 0) {
      this.stunTimer = duration;
      this.state = 'stunned';
      this.gameState.audioManager.playSound('stun');
    }
  }

  /**
   * 受到环境伤害
   */
  takeEnvironmentalDamage(damage, source = 'environment') {
    this.health -= damage;
    this.takeStunEffect(1.0);

    if (this.health <= 0) {
      this.die();
      this.gameState.audioManager.playSound('spiderDeath');

      // 死亡时也有概率掉落奖励
      if (Math.random() < this.rewardChance * 0.5) {
        this.dropReward(this.gameState, { x: this.x, y: this.y });
      }
    }
  }

  /**
   * 受到岩石砸击
   */
  takeRockCrush(damage = 60) {
    this.takeEnvironmentalDamage(damage, 'rockCrush');
  }

  /**
   * 渲染敌人
   */
  render(ctx) {
    ctx.save();

    // 根据状态调整颜色
    let renderColor = this.color;
    if (this.state === 'frozen') {
      renderColor = '#87CEEB';
    } else if (this.state === 'stunned') {
      renderColor = '#FFFF99';
    } else if (this.inWater) {
      renderColor = '#4169E1'; // 水中变蓝色
    }

    // 绘制蜘蛛身体
    this.renderSpiderBody(ctx, renderColor);

    // 绘制蜘蛛腿
    this.renderSpiderLegs(ctx);

    // 渲染投射物
    this.renderWebProjectiles(ctx);

    // 渲染状态指示器
    this.renderStatusIndicator(ctx);

    ctx.restore();
  }

  /**
   * 绘制蜘蛛身体
   */
  renderSpiderBody(ctx, color) {
    ctx.fillStyle = color;

    // 绘制腹部
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 绘制头部
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height / 4,
      this.width / 3,
      this.height / 4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  /**
   * 绘制蜘蛛腿
   */
  renderSpiderLegs(ctx) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    const legLength = 15;
    const legAngles = [-60, -30, 30, 60, 120, 150, 210, 240]; // 8条腿的角度

    for (let i = 0; i < legAngles.length; i++) {
      const angle = ((legAngles[i] + this.legAnimationPhase) * Math.PI) / 180;
      const startX = this.x + this.width / 2;
      const startY = this.y + this.height / 2;
      const endX = startX + Math.cos(angle) * legLength;
      const endY = startY + Math.sin(angle) * legLength;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  /**
   * 渲染蜘蛛网投射物
   */
  renderWebProjectiles(ctx) {
    ctx.fillStyle = '#F5F5DC'; // 米色蜘蛛网
    for (const web of this.webProjectiles) {
      ctx.beginPath();
      ctx.arc(web.x, web.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 渲染状态指示器
   */
  renderStatusIndicator(ctx) {
    // 血量条
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;

      ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.x, this.y - 6, barWidth, barHeight);

      ctx.fillStyle = '#00FF00';
      ctx.fillRect(this.x, this.y - 6, barWidth * healthPercent, barHeight);
    }

    // 状态图标
    if (this.state === 'frozen') {
      ctx.fillStyle = '#87CEEB';
      ctx.fillText('❄', this.x + this.width / 2 - 4, this.y - 12);
    } else if (this.state === 'stunned') {
      ctx.fillStyle = '#FFFF99';
      ctx.fillText('💫', this.x + this.width / 2 - 4, this.y - 12);
    } else if (this.inWater) {
      ctx.fillStyle = '#4169E1';
      ctx.fillText('💧', this.x + this.width / 2 - 4, this.y - 12);
    }
  }

  /**
   * 动画更新
   */
  updateAnimation(deltaTime) {
    this.animationTimer += deltaTime;
    this.legAnimationPhase += deltaTime * 100; // 腿部动画

    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }
  }

  /**
   * 获取敌人描述
   */
  getDescription() {
    return {
      name: '毒蜘蛛',
      type: '环境互动敌人',
      health: this.health,
      maxHealth: this.maxHealth,
      damage: this.damage,
      abilities: ['吐网攻击', '水下生存', '机关触发', '奖励掉落'],
      weaknesses: ['岩石砸击', '冰冻效果', '水下机关'],
      world: '巴伐利亚地牢',
      special: ['可触发机关获得奖励', '水中状态特殊行为'],
    };
  }
}

window.PoisonSpider = PoisonSpider;
})();
