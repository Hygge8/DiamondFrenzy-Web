/**
 * 红蛇类 - 吴哥窟世界的免疫型敌人
 * 对所有工具与武器免疫，无法直接击杀
 * 必须借助环境陷阱，典型做法是推动岩石砸击或等待其进入特定路径后以坠落岩石消灭
 */
import Enemy from './Enemy.js';

export default class RedSnake extends Enemy {
  constructor(x, y) {
    super(x, y);

    // 红蛇属性
    this.type = 'redSnake';
    this.width = 24;
    this.height = 16;
    this.color = '#DC143C'; // 深红色
    this.speed = 60;
    this.maxHealth = 999; // 高血量，表示几乎无法直接击杀
    this.health = this.maxHealth;
    this.damage = 15;

    // AI状态
    this.state = 'slithering'; // slithering, trapped, stunned
    this.stateTimer = 0;
    this.target = null;
    this.detectionRange = 100;
    this.attackRange = 20;
    this.attackCooldown = 0;
    this.stunTimer = 0;

    // 特殊行为
    this.canBeFrozen = false; // 对冰冻免疫
    this.canBeStunned = true; // 可以被眩晕
    this.immuneToItems = true; // 对道具免疫
    this.immuneToWeapons = true; // 对武器免疫
    this.environmentVulnerable = true; // 受环境影响

    // 移动模式
    this.movementPattern = 'random'; // random, patrol, followPath
    this.direction = { x: 1, y: 0 }; // 当前移动方向
    this.directionChangeTimer = 0;
    this.directionChangeInterval = 2.0; // 2秒改变一次方向

    // 路径跟随
    this.pathPoints = [];
    this.currentPathIndex = 0;
    this.pathFollowSpeed = 40;

    // 动画相关
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.3;
    this.bodySegments = []; // 蛇身段
    this.maxSegments = 5;
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

    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.state = 'slithering';
        this.stunTimer = 0;
      }
    }

    // 更新方向改变计时器
    this.directionChangeTimer += deltaTime;

    // 更新蛇身段
    this.updateBodySegments();

    // 更新动画
    this.updateAnimation(deltaTime);

    // 根据状态执行行为
    switch (this.state) {
    case 'trapped':
      this.handleTrappedState(deltaTime);
      break;
    case 'stunned':
      this.handleStunnedState(deltaTime);
      break;
    case 'slithering':
    default:
      this.handleSlitheringState(deltaTime, gameState);
      break;
    }
  }

  /**
   * 游走状态处理
   */
  handleSlitheringState(deltaTime, gameState) {
    // 检查玩家碰撞
    const player = gameState.player;
    if (player && this.getDistanceTo(player) <= this.attackRange && this.attackCooldown <= 0) {
      this.attackPlayer(player);
      this.attackCooldown = 1.0;
    }

    // 根据移动模式执行移动
    switch (this.movementPattern) {
    case 'random':
      this.handleRandomMovement(deltaTime);
      break;
    case 'patrol':
      this.handlePatrolMovement(deltaTime);
      break;
    case 'followPath':
      this.handlePathMovement(deltaTime);
      break;
    }

    // 检查环境陷阱
    this.checkEnvironmentalTraps(gameState);
  }

  /**
   * 随机移动处理
   */
  handleRandomMovement(deltaTime) {
    // 定期改变方向
    if (this.directionChangeTimer >= this.directionChangeInterval) {
      this.changeRandomDirection();
      this.directionChangeTimer = 0;
    }

    // 应用移动
    this.velocity.x = this.direction.x * this.speed;
    this.velocity.y = this.direction.y * this.speed;
  }

  /**
   * 巡逻移动处理
   */
  handlePatrolMovement(deltaTime) {
    // 简单的往返移动
    if (this.directionChangeTimer >= this.directionChangeInterval) {
      this.direction.x *= -1; // 反向
      this.directionChangeTimer = 0;
    }

    this.velocity.x = this.direction.x * this.speed;
    this.velocity.y = this.direction.y * this.speed;
  }

  /**
   * 路径跟随移动处理
   */
  handlePathMovement(deltaTime) {
    if (this.pathPoints.length === 0) return;

    const targetPoint = this.pathPoints[this.currentPathIndex];
    const dx = targetPoint.x - this.x;
    const dy = targetPoint.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 15) {
      // 到达路径点，切换到下一个
      this.currentPathIndex = (this.currentPathIndex + 1) % this.pathPoints.length;
    } else {
      // 向路径点移动
      this.velocity.x = (dx / distance) * this.pathFollowSpeed;
      this.velocity.y = (dy / distance) * this.pathFollowSpeed;
    }
  }

  /**
   * 改变随机方向
   */
  changeRandomDirection() {
    const angles = [
      { x: 1, y: 0 }, // 右
      { x: -1, y: 0 }, // 左
      { x: 0, y: 1 }, // 下
      { x: 0, y: -1 }, // 上
      { x: 0.7, y: 0.7 }, // 右下
      { x: -0.7, y: 0.7 }, // 左下
      { x: 0.7, y: -0.7 }, // 右上
      { x: -0.7, y: -0.7 }, // 左上
    ];

    this.direction = angles[Math.floor(Math.random() * angles.length)];
  }

  /**
   * 陷阱状态处理
   */
  handleTrappedState(deltaTime) {
    // 陷阱状态下无法移动
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.color = '#696969'; // 灰色表示被困
  }

  /**
   * 眩晕状态处理
   */
  handleStunnedState(deltaTime) {
    this.velocity.x *= 0.5;
    this.velocity.y *= 0.5;
    this.color = '#FFFF99'; // 黄色表示眩晕
  }

  /**
   * 攻击玩家
   */
  attackPlayer(player) {
    if (player && this.getDistanceTo(player) <= this.attackRange) {
      player.takeDamage(this.damage);
      this.gameState.audioManager.playSound('snakeBite');
    }
  }

  /**
   * 更新蛇身段
   */
  updateBodySegments() {
    // 添加当前头部位置到身段数组
    this.bodySegments.unshift({ x: this.x, y: this.y });

    // 限制身段数量
    if (this.bodySegments.length > this.maxSegments) {
      this.bodySegments.pop();
    }
  }

  /**
   * 检查环境陷阱
   */
  checkEnvironmentalTraps(gameState) {
    // 检查岩石砸击
    const rocks = gameState.level.getObjectsByType('rock');
    for (const rock of rocks) {
      if (rock.isFalling() && this.isInRange(rock, 30)) {
        this.takeEnvironmentalDamage(rock.fallDamage || 100, 'rockCrush');
        break;
      }
    }

    // 检查坠落陷阱
    const traps = gameState.level.getObjectsByType('trap');
    for (const trap of traps) {
      if (trap.isTriggered() && this.isCollidingWith(trap)) {
        this.takeEnvironmentalDamage(trap.damage || 80, 'trap');
        break;
      }
    }

    // 检查是否被困在特定区域
    const barriers = gameState.level.getObjectsByType('barrier');
    for (const barrier of barriers) {
      if (barrier.isActive() && this.isCollidingWith(barrier)) {
        this.state = 'trapped';
        break;
      }
    }
  }

  /**
   * 受到环境伤害（红蛇只受环境伤害）
   */
  takeEnvironmentalDamage(damage, source = 'environment') {
    this.health -= damage;
    this.takeStunEffect(1.0);

    if (this.health <= 0) {
      this.die();
      this.gameState.audioManager.playSound('snakeDeath');
    }
  }

  /**
   * 受到眩晕效果（红蛇可以被眩晕）
   */
  takeStunEffect(duration = 2.0) {
    if (this.stunTimer <= 0) {
      this.stunTimer = duration;
      this.state = 'stunned';
      this.gameState.audioManager.playSound('stun');
    }
  }

  /**
   * 免疫道具效果
   */
  takeItemEffect(itemType, effect) {
    // 红蛇对所有道具免疫
    this.gameState.audioManager.playSound('immune');
    return false;
  }

  /**
   * 免疫武器攻击
   */
  takeWeaponDamage(damage, weaponType) {
    // 红蛇对武器免疫
    this.gameState.audioManager.playSound('immune');
    return false;
  }

  /**
   * 设置移动模式
   */
  setMovementPattern(pattern) {
    this.movementPattern = pattern;
    if (pattern === 'random') {
      this.changeRandomDirection();
    }
  }

  /**
   * 设置巡逻路径
   */
  setPatrolPath(pathPoints) {
    this.pathPoints = pathPoints;
    this.movementPattern = 'followPath';
    this.currentPathIndex = 0;
  }

  /**
   * 设置巡逻方向
   */
  setPatrolDirection(direction) {
    this.direction = direction;
    this.movementPattern = 'patrol';
  }

  /**
   * 渲染敌人
   */
  render(ctx) {
    ctx.save();

    // 根据状态调整颜色
    let renderColor = this.color;
    if (this.state === 'trapped') {
      renderColor = '#696969';
    } else if (this.state === 'stunned') {
      renderColor = '#FFFF99';
    }

    // 绘制蛇身段
    this.renderBodySegments(ctx, renderColor);

    // 绘制蛇头
    this.renderSnakeHead(ctx, renderColor);

    // 渲染状态指示器
    this.renderStatusIndicator(ctx);

    ctx.restore();
  }

  /**
   * 绘制蛇身段
   */
  renderBodySegments(ctx, color) {
    ctx.fillStyle = color;

    for (let i = this.bodySegments.length - 1; i >= 0; i--) {
      const segment = this.bodySegments[i];
      const alpha = 1.0 - i * 0.15; // 渐变透明度
      ctx.globalAlpha = alpha;

      const segmentSize = this.width - i * 2;
      const offsetX = (this.width - segmentSize) / 2;
      const offsetY = (this.height - segmentSize) / 2;

      ctx.fillRect(segment.x + offsetX, segment.y + offsetY, segmentSize, segmentSize);
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * 绘制蛇头
   */
  renderSnakeHead(ctx, color) {
    // 绘制头部
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 4, this.y + 3, 3, 3);
    ctx.fillRect(this.x + this.width - 7, this.y + 3, 3, 3);

    // 绘制舌头
    ctx.fillStyle = '#FF4500';
    if (this.direction.x > 0) {
      // 向右
      ctx.fillRect(this.x + this.width, this.y + this.height / 2 - 1, 4, 2);
    } else if (this.direction.x < 0) {
      // 向左
      ctx.fillRect(this.x - 4, this.y + this.height / 2 - 1, 4, 2);
    } else if (this.direction.y > 0) {
      // 向下
      ctx.fillRect(this.x + this.width / 2 - 1, this.y + this.height, 2, 4);
    } else {
      // 向上
      ctx.fillRect(this.x + this.width / 2 - 1, this.y - 4, 2, 4);
    }
  }

  /**
   * 渲染状态指示器
   */
  renderStatusIndicator(ctx) {
    // 免疫指示器
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🛡', this.x + this.width / 2 - 4, this.y - 8);

    // 状态图标
    if (this.state === 'trapped') {
      ctx.fillStyle = '#696969';
      ctx.fillText('⛓', this.x + this.width / 2 - 4, this.y - 15);
    } else if (this.state === 'stunned') {
      ctx.fillStyle = '#FFFF99';
      ctx.fillText('💫', this.x + this.width / 2 - 4, this.y - 15);
    }
  }

  /**
   * 动画更新
   */
  updateAnimation(deltaTime) {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationFrame = (this.animationFrame + 1) % 2;
      this.animationTimer = 0;
    }
  }

  /**
   * 获取敌人描述
   */
  getDescription() {
    return {
      name: '红蛇',
      type: '免疫型敌人',
      health: this.health,
      maxHealth: this.maxHealth,
      damage: this.damage,
      abilities: ['对道具免疫', '对武器免疫', '游走移动', '路径跟随'],
      weaknesses: ['岩石砸击', '环境陷阱', '坠落伤害'],
      world: '吴哥窟',
      immuneTo: ['所有道具', '所有武器', '冰冻效果'],
    };
  }
}
