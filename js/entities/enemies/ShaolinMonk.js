/**
 * 少林弟子类 - 西藏雪洞世界的远程攻击敌人
 * 以四向飞标投射为主要攻击方式
 * 可通过快速移动让两名弟子互相投掷飞标，或击落其头顶岩石实现击杀
 * 可被冰冻后推送至特定机关
 */
const Enemy = window.Enemy;

class ShaolinMonk extends Enemy {
  constructor(x, y) {
    super(x, y);

    // 少林弟子属性
    this.type = 'shaolinMonk';
    this.width = 28;
    this.height = 28;
    this.color = '#8B0000'; // 深红色
    this.speed = 70;
    this.maxHealth = 80;
    this.health = this.maxHealth;
    this.damage = 20;

    // AI状态
    this.state = 'patrolling'; // patrolling, attacking, frozen, stunned
    this.stateTimer = 0;
    this.target = null;
    this.detectionRange = 180;
    this.attackRange = 120;
    this.attackCooldown = 0;
    this.freezeTimer = 0;
    this.stunTimer = 0;

    // 攻击相关
    this.projectiles = [];
    this.projectileSpeed = 150;
    this.projectileDamage = 15;
    this.shootCooldown = 0;
    this.shootInterval = 2.0; // 2秒射击间隔

    // 特殊行为
    this.canBeFrozen = true;
    this.canBeStunned = true;
    this.immuneToItems = false;
    this.environmentVulnerable = true;

    // 巡逻相关
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.patrolSpeed = 40;

    // 动画相关
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.2;
    this.facingDirection = 'down'; // up, down, left, right
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

    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= deltaTime;
      if (this.freezeTimer <= 0) {
        this.state = 'patrolling';
        this.freezeTimer = 0;
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.state = 'patrolling';
        this.stunTimer = 0;
      }
    }

    // 更新投射物
    this.updateProjectiles(deltaTime, gameState);

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
    case 'attacking':
      this.handleAttackingState(deltaTime, gameState);
      break;
    case 'patrolling':
    default:
      this.handlePatrollingState(deltaTime, gameState);
      break;
    }
  }

  /**
   * 巡逻状态处理
   */
  handlePatrollingState(deltaTime, gameState) {
    // 寻找玩家
    const player = gameState.player;
    if (player && this.getDistanceTo(player) <= this.detectionRange) {
      this.target = player;
      this.state = 'attacking';
      return;
    }

    // 巡逻移动
    if (this.patrolPoints.length > 0) {
      this.moveToPatrolPoint(deltaTime);
    } else {
      // 随机巡逻
      this.velocity.x = (Math.random() - 0.5) * this.patrolSpeed;
      this.velocity.y = (Math.random() - 0.5) * this.patrolSpeed;
    }
  }

  /**
   * 攻击状态处理
   */
  handleAttackingState(deltaTime, gameState) {
    const player = gameState.player;

    if (!player || this.getDistanceTo(player) > this.detectionRange * 1.2) {
      // 失去目标
      this.target = null;
      this.state = 'patrolling';
      return;
    }

    // 更新朝向
    this.updateFacingDirection(player);

    // 射击检查
    if (this.shootCooldown <= 0) {
      this.shootProjectiles();
      this.shootCooldown = this.shootInterval;
    }

    // 缓慢接近玩家
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.attackRange * 0.7) {
      this.velocity.x = (dx / distance) * this.speed * 0.5;
      this.velocity.y = (dy / distance) * this.speed * 0.5;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
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
    this.velocity.x *= 0.7;
    this.velocity.y *= 0.7;
    this.color = '#FFFF99';
  }

  /**
   * 移动到巡逻点
   */
  moveToPatrolPoint(deltaTime) {
    const targetPoint = this.patrolPoints[this.currentPatrolIndex];
    const dx = targetPoint.x - this.x;
    const dy = targetPoint.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20) {
      // 到达巡逻点，切换到下一个
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    } else {
      // 向巡逻点移动
      this.velocity.x = (dx / distance) * this.patrolSpeed;
      this.velocity.y = (dy / distance) * this.patrolSpeed;
    }
  }

  /**
   * 更新朝向方向
   */
  updateFacingDirection(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.facingDirection = dx > 0 ? 'right' : 'left';
    } else {
      this.facingDirection = dy > 0 ? 'down' : 'up';
    }
  }

  /**
   * 射击四向飞标
   */
  shootProjectiles() {
    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 0, y: 1 }, // 下
      { x: -1, y: 0 }, // 左
      { x: 1, y: 0 }, // 右
    ];

    for (const dir of directions) {
      this.projectiles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: dir.x * this.projectileSpeed,
        vy: dir.y * this.projectileSpeed,
        damage: this.projectileDamage,
        life: 3.0, // 3秒生存时间
      });
    }

    this.gameState.audioManager.playSound('shaolinShoot');
  }

  /**
   * 更新投射物
   */
  updateProjectiles(deltaTime, gameState) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];

      // 更新位置
      proj.x += proj.vx * deltaTime;
      proj.y += proj.vy * deltaTime;
      proj.life -= deltaTime;

      // 检查与玩家碰撞
      const player = gameState.player;
      if (player && this.isCollidingWithPoint(proj.x, proj.y, player)) {
        player.takeDamage(proj.damage);
        this.projectiles.splice(i, 1);
        this.gameState.audioManager.playSound('projectileHit');
        continue;
      }

      // 检查与其他敌人碰撞（实现互相伤害）
      const enemies = gameState.enemies;
      for (const enemy of enemies) {
        if (enemy !== this && this.isCollidingWithPoint(proj.x, proj.y, enemy)) {
          enemy.takeEnvironmentalDamage(proj.damage, 'projectile');
          this.projectiles.splice(i, 1);
          break;
        }
      }

      // 移除过期投射物
      if (proj.life <= 0 || this.isOutOfBounds(proj.x, proj.y)) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * 受到冰冻效果
   */
  takeFreezeEffect(duration = 3.0) {
    if (this.freezeTimer <= 0) {
      this.freezeTimer = duration;
      this.state = 'frozen';
      this.gameState.audioManager.playSound('freeze');
    }
  }

  /**
   * 受到眩晕效果
   */
  takeStunEffect(duration = 2.0) {
    if (this.stunTimer <= 0) {
      this.stunTimer = duration;
      this.state = 'stunned';
      this.gameState.audioManager.playSound('stun');
    }
  }

  /**
   * 受到环境伤害（如岩石砸击）
   */
  takeEnvironmentalDamage(damage, source = 'environment') {
    this.health -= damage;
    this.takeStunEffect(1.5);

    if (this.health <= 0) {
      this.die();
      this.gameState.audioManager.playSound('shaolinMonkDeath');
    }
  }

  /**
   * 与其他敌人互动
   */
  interactWithEnemy(enemy) {
    if (enemy.type === 'snowApe') {
      // 少林弟子和雪猿会互相伤害
      const damage = 25;
      this.takeEnvironmentalDamage(damage, 'enemyInteraction');
      enemy.takeEnvironmentalDamage(damage, 'enemyInteraction');
    }
  }

  /**
   * 环境互动检查
   */
  checkEnvironmentInteraction(gameState) {
    // 检查头顶岩石
    const rocks = gameState.level.getObjectsByType('rock');
    for (const rock of rocks) {
      if (rock.isAbove(this) && rock.isFalling()) {
        this.takeEnvironmentalDamage(70, 'fallingRock');
        break;
      }
    }

    // 检查是否被推送到机关
    const mechanisms = gameState.level.getObjectsByType('mechanism');
    for (const mechanism of mechanisms) {
      if (mechanism.isTriggered() && this.isCollidingWith(mechanism)) {
        this.takeEnvironmentalDamage(50, 'mechanism');
        break;
      }
    }
  }

  /**
   * 设置巡逻点
   */
  setPatrolPoints(points) {
    this.patrolPoints = points;
    this.currentPatrolIndex = 0;
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
    }

    // 绘制少林弟子身体
    ctx.fillStyle = renderColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制头部
    ctx.fillStyle = '#FFDBAC'; // 肤色
    ctx.fillRect(this.x + 6, this.y + 2, 16, 12);

    // 绘制眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 8, this.y + 6, 2, 2);
    ctx.fillRect(this.x + 18, this.y + 6, 2, 2);

    // 绘制僧袍
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x + 4, this.y + 14, 20, 14);

    // 绘制朝向指示
    this.renderDirectionIndicator(ctx);

    // 渲染投射物
    this.renderProjectiles(ctx);

    // 渲染状态指示器
    this.renderStatusIndicator(ctx);

    ctx.restore();
  }

  /**
   * 渲染朝向指示器
   */
  renderDirectionIndicator(ctx) {
    ctx.fillStyle = '#FFFF00';
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    switch (this.facingDirection) {
    case 'up':
      ctx.fillRect(centerX - 2, this.y - 4, 4, 4);
      break;
    case 'down':
      ctx.fillRect(centerX - 2, this.y + this.height, 4, 4);
      break;
    case 'left':
      ctx.fillRect(this.x - 4, centerY - 2, 4, 4);
      break;
    case 'right':
      ctx.fillRect(this.x + this.width, centerY - 2, 4, 4);
      break;
    }
  }

  /**
   * 渲染投射物
   */
  renderProjectiles(ctx) {
    ctx.fillStyle = '#FFD700'; // 金色飞标
    for (const proj of this.projectiles) {
      ctx.fillRect(proj.x - 2, proj.y - 2, 4, 4);
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
    }
  }

  /**
   * 动画更新
   */
  updateAnimation(deltaTime) {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame = (this.animationFrame + 1) % 3;
      this.animationTimer = 0;
    }
  }

  /**
   * 获取敌人描述
   */
  getDescription() {
    return {
      name: '少林弟子',
      type: '远程攻击敌人',
      health: this.health,
      maxHealth: this.maxHealth,
      damage: this.damage,
      abilities: ['四向飞标投射', '房间巡游', '追踪攻击'],
      weaknesses: ['头顶岩石砸击', '冰冻效果', '互相投掷飞标', '环境机关'],
      world: '西藏雪洞',
    };
  }
}

window.ShaolinMonk = ShaolinMonk;
