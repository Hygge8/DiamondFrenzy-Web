/**
 * 指南针道具
 */
class Compass extends Item {
  constructor(x, y) {
    super(x, y, 'compass', '指南针');
    this.maxCooldown = 0; // 指南针无冷却
  }

  _executeUse(player) {
    // 指南针显示出口方向
    if (levelManager && levelManager.currentLevel) {
      levelManager.showExitDirection();
    }

    return true;
  }
}

/**
 * 锤子道具
 */
class Hammer extends Item {
  constructor(x, y) {
    super(x, y, 'hammer', '锤子');
    this.maxCooldown = 500; // 0.5秒冷却
  }

  _executeUse(player) {
    // 锤子可以破坏岩石、冰块、蜘蛛网
    const obstacles = levelManager ? levelManager.getNearbyObstacles(player, this.range) : [];

    for (const obstacle of obstacles) {
      if (
        obstacle.obstacleType === 'rock' ||
        obstacle.obstacleType === 'ice' ||
        obstacle.obstacleType === 'web'
      ) {
        obstacle.breakObstacle(player);
        return true;
      }
    }

    return false;
  }
}

/**
 * 抓钩道具
 */
class GrappleHook extends Item {
  constructor(x, y) {
    super(x, y, 'grapple_hook', '抓钩');
    this.maxCooldown = 1000; // 1秒冷却
  }

  _executeUse(player) {
    // 抓钩可以抓取远处的物品或打开机关
    const targets = levelManager ? levelManager.getGrappleTargets(player, this.range) : [];

    if (targets.length > 0) {
      const target = targets[0];
      target.grappled(player);
      return true;
    }

    return false;
  }
}

/**
 * 冰冻射线道具
 */
class IceRay extends Item {
  constructor(x, y) {
    super(x, y, 'ice_ray', '冰冻射线');
    this.maxCooldown = 2000; // 2秒冷却
  }

  _executeUse(player) {
    // 冰冻射线可以冻结敌人
    const enemies = levelManager ? levelManager.getNearbyEnemies(player, this.range) : [];

    for (const enemy of enemies) {
      if (enemy.canBeFrozen) {
        enemy.freeze(this.duration);
        return true;
      }
    }

    return false;
  }
}

/**
 * 炸药道具
 */
class Dynamite extends Item {
  constructor(x, y) {
    super(x, y, 'dynamite', '炸药');
    this.maxCooldown = 3000; // 3秒冷却
  }

  _executeUse(player) {
    // 炸药造成范围伤害
    const explosion = this._createExplosion(player.x, player.y, this.range);

    // 对范围内的敌人造成伤害
    const enemies = levelManager ? levelManager.getEnemiesInRange(explosion) : [];
    enemies.forEach(enemy => {
      enemy.takeDamage(this.power * 2);
    });

    // 破坏范围内的可破坏障碍物
    const obstacles = levelManager ? levelManager.getObstaclesInRange(explosion) : [];
    obstacles.forEach(obstacle => {
      if (obstacle.isBreakable) {
        obstacle.breakObstacle(player);
      }
    });

    return true;
  }

  _createExplosion(x, y, radius) {
    return {
      x: x - radius / 2,
      y: y - radius / 2,
      width: radius,
      height: radius,
      radius: radius,
    };
  }
}

/**
 * 护盾道具
 */
class Shield extends Item {
  constructor(x, y) {
    super(x, y, 'shield', '护盾');
    this.maxCooldown = 10000; // 10秒冷却
  }

  _executeUse(player) {
    // 给玩家添加护盾
    player.getShield(this.duration);
    return true;
  }
}

/**
 * 速度靴道具
 */
class SpeedBoots extends Item {
  constructor(x, y) {
    super(x, y, 'speed_boots', '速度靴');
    this.maxCooldown = 8000; // 8秒冷却
  }

  _executeUse(player) {
    // 给玩家添加速度提升
    player.getSpeedBoost(this.duration);
    return true;
  }
}

/**
 * 宝石袋道具
 */
class GemBag extends Item {
  constructor(x, y) {
    super(x, y, 'gem_bag', '宝石袋');
    this.maxCooldown = 0; // 宝石袋无冷却
    this.isConsumable = false; // 非消耗品
  }

  _executeUse(player) {
    // 宝石袋增加得分倍数
    player.scoreMultiplier = (player.scoreMultiplier || 1) * this.power;

    // 5秒后恢复
    setTimeout(() => {
      player.scoreMultiplier = 1;
    }, 5000);

    return true;
  }
}
