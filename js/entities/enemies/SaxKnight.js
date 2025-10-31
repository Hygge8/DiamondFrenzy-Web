/**
 * 萨克斯骑士类 - 巴伐利亚地牢世界的Boss敌人
 * 通过"引落头顶岩石—砸击"的循环打法被克制
 * 玩家在其攻击后闪避，待岩石坠落再以岩石为武器
 */
import Enemy from './Enemy.js';

export default class SaxKnight extends Enemy {
    constructor(x, y) {
        super(x, y);
        
        // 萨克斯骑士属性
        this.type = 'saxKnight';
        this.width = 40;
        this.height = 48;
        this.color = '#2F4F4F'; // 深灰色
        this.speed = 40;
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.damage = 35;
        
        // AI状态
        this.state = 'patrolling'; // patrolling, charging, attacking, stunned, vulnerable
        this.stateTimer = 0;
        this.target = null;
        this.detectionRange = 200;
        this.attackRange = 50;
        this.attackCooldown = 0;
        this.stunTimer = 0;
        this.vulnerabilityTimer = 0;
        
        // Boss特殊行为
        this.canBeRockCrushed = true;
        this.rockCrushVulnerability = true;
        this.attackPattern = 'charge'; // charge, swing, stomp
        this.currentAttackPattern = 0;
        this.attackPatterns = ['charge', 'swing', 'stomp'];
        this.attackIndex = 0;
        
        // 攻击相关
        this.chargeSpeed = 120;
        this.normalSpeed = 40;
        this.chargeRange = 150;
        this.chargeDamage = 40;
        this.swingDamage = 30;
        this.stompDamage = 25;
        this.stompRange = 60;
        
        // 岩石互动
        this.aboveRocks = []; // 头顶的岩石
        this.canDropRocks = true;
        this.rockDropCooldown = 0;
        this.rockDropInterval = 5.0; // 5秒掉落岩石间隔
        
        // 动画相关
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.2;
        this.facingDirection = 'down';
        this.isCharging = false;
        this.isAttacking = false;
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
        
        if (this.rockDropCooldown > 0) {
            this.rockDropCooldown -= deltaTime;
        }
        
        if (this.stunTimer > 0) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = 'patrolling';
                this.stunTimer = 0;
            }
        }
        
        if (this.vulnerabilityTimer > 0) {
            this.vulnerabilityTimer -= deltaTime;
            if (this.vulnerabilityTimer <= 0) {
                this.state = 'patrolling';
                this.vulnerabilityTimer = 0;
            }
        }
        
        // 检查头顶岩石
        this.checkAboveRocks(gameState);
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 根据状态执行行为
        switch (this.state) {
            case 'charging':
                this.handleChargingState(deltaTime, gameState);
                break;
            case 'attacking':
                this.handleAttackingState(deltaTime, gameState);
                break;
            case 'stunned':
                this.handleStunnedState(deltaTime);
                break;
            case 'vulnerable':
                this.handleVulnerableState(deltaTime);
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
            this.state = 'charging';
            return;
        }
        
        // 缓慢巡逻
        this.speed = this.normalSpeed;
        this.velocity.x = (Math.random() - 0.5) * this.speed;
        this.velocity.y = (Math.random() - 0.5) * this.speed;
        
        // 定期掉落岩石
        if (this.rockDropCooldown <= 0) {
            this.dropRock(gameState);
            this.rockDropCooldown = this.rockDropInterval;
        }
    }

    /**
     * 冲锋状态处理
     */
    handleChargingState(deltaTime, gameState) {
        const player = gameState.player;
        
        if (!player || this.getDistanceTo(player) > this.detectionRange * 1.3) {
            // 失去目标
            this.target = null;
            this.state = 'patrolling';
            return;
        }
        
        this.isCharging = true;
        this.speed = this.chargeSpeed;
        
        // 向玩家冲锋
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
        }
        
        // 更新朝向
        this.updateFacingDirection(player);
        
        // 检查碰撞攻击
        if (distance <= this.attackRange && this.attackCooldown <= 0) {
            this.performChargeAttack(player);
            this.attackCooldown = 2.0;
        }
        
        // 冲锋一定时间后切换到攻击状态
        this.stateTimer += deltaTime;
        if (this.stateTimer >= 3.0) {
            this.state = 'attacking';
            this.stateTimer = 0;
            this.isCharging = false;
        }
    }

    /**
     * 攻击状态处理
     */
    handleAttackingState(deltaTime, gameState) {
        const player = gameState.player;
        
        if (!player) {
            this.state = 'patrolling';
            return;
        }
        
        this.isAttacking = true;
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // 执行当前攻击模式
        const currentPattern = this.attackPatterns[this.attackIndex];
        switch (currentPattern) {
            case 'swing':
                this.performSwingAttack(player, deltaTime);
                break;
            case 'stomp':
                this.performStompAttack(gameState, deltaTime);
                break;
            case 'charge':
            default:
                this.performChargeAttack(player);
                break;
        }
        
        // 攻击完成后切换到易伤状态
        this.stateTimer += deltaTime;
        if (this.stateTimer >= 2.0) {
            this.state = 'vulnerable';
            this.stateTimer = 0;
            this.isAttacking = false;
            this.attackIndex = (this.attackIndex + 1) % this.attackPatterns.length;
        }
    }

    /**
     * 易伤状态处理
     */
    handleVulnerableState(deltaTime) {
        // 易伤状态下移动缓慢且受到更多伤害
        this.velocity.x *= 0.5;
        this.velocity.y *= 0.5;
        this.color = '#CD5C5C'; // 易伤时变红色
        
        // 检查是否被岩石砸中
        if (this.rockCrushVulnerability && this.isBeingRockCrushed()) {
            this.takeRockCrushDamage();
        }
    }

    /**
     * 眩晕状态处理
     */
    handleStunnedState(deltaTime) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.color = '#FFFF99'; // 黄色表示眩晕
    }

    /**
     * 执行冲锋攻击
     */
    performChargeAttack(player) {
        if (player && this.getDistanceTo(player) <= this.attackRange) {
            player.takeDamage(this.chargeDamage);
            this.gameState.audioManager.playSound('knightCharge');
        }
    }

    /**
     * 执行挥砍攻击
     */
    performSwingAttack(player, deltaTime) {
        // 挥砍攻击有前摇和后摇
        this.stateTimer += deltaTime;
        
        if (this.stateTimer >= 0.5 && this.stateTimer <= 1.0) {
            // 攻击窗口
            if (player && this.getDistanceTo(player) <= this.attackRange + 20) {
                player.takeDamage(this.swingDamage);
                this.gameState.audioManager.playSound('knightSwing');
            }
        }
    }

    /**
     * 执行践踏攻击
     */
    performStompAttack(gameState, deltaTime) {
        // 践踏攻击影响周围区域
        this.stateTimer += deltaTime;
        
        if (this.stateTimer >= 0.8 && this.stateTimer <= 1.2) {
            // 践踏窗口
            const player = gameState.player;
            if (player && this.getDistanceTo(player) <= this.stompRange) {
                player.takeDamage(this.stompDamage);
                this.gameState.audioManager.playSound('knightStomp');
            }
            
            // 践踏可能震落头顶岩石
            this.shakeAboveRocks();
        }
    }

    /**
     * 掉落岩石
     */
    dropRock(gameState) {
        const rock = {
            x: this.x + this.width / 2 - 15,
            y: this.y - 40,
            width: 30,
            height: 30,
            isFalling: false,
            fallSpeed: 0,
            gravity: 200,
            damage: 80,
            triggered: false
        };
        
        gameState.level.addObject(rock);
        this.aboveRocks.push(rock);
        this.gameState.audioManager.playSound('rockDrop');
    }

    /**
     * 检查头顶岩石
     */
    checkAboveRocks(gameState) {
        for (let i = this.aboveRocks.length - 1; i >= 0; i--) {
            const rock = this.aboveRocks[i];
            
            // 检查岩石是否还在头顶
            if (Math.abs(rock.x - (this.x + this.width / 2)) > 50 ||
                rock.y > this.y - 20) {
                this.aboveRocks.splice(i, 1);
                continue;
            }
            
            // 检查岩石是否应该开始下落
            if (!rock.isFalling && this.state === 'vulnerable') {
                rock.isFalling = true;
                rock.fallSpeed = 0;
            }
            
            // 更新岩石位置
            if (rock.isFalling) {
                rock.fallSpeed += rock.gravity * gameState.deltaTime;
                rock.y += rock.fallSpeed * gameState.deltaTime;
                
                // 检查是否砸中骑士
                if (this.isCollidingWithPoint(rock.x + rock.width/2, rock.y + rock.height, this)) {
                    this.takeRockCrush(rock.damage);
                    rock.triggered = true;
                    this.aboveRocks.splice(i, 1);
                    this.gameState.audioManager.playSound('rockCrush');
                }
            }
        }
    }

    /**
     * 震动头顶岩石
     */
    shakeAboveRocks() {
        for (const rock of this.aboveRocks) {
            if (!rock.isFalling) {
                rock.y += Math.sin(Date.now() * 0.01) * 2;
            }
        }
    }

    /**
     * 检查是否被岩石砸中
     */
    isBeingRockCrushed() {
        for (const rock of this.aboveRocks) {
            if (rock.isFalling && this.isCollidingWith(rock)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 受到岩石砸击伤害
     */
    takeRockCrush(damage = 100) {
        this.health -= damage;
        this.takeStunEffect(3.0);
        this.state = 'stunned';
        
        if (this.health <= 0) {
            this.die();
            this.gameState.audioManager.playSound('knightDeath');
        }
    }

    /**
     * 受到眩晕效果
     */
    takeStunEffect(duration = 3.0) {
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
        if (source === 'rockCrush') {
            this.takeRockCrush(damage);
        } else {
            this.health -= damage;
            this.takeStunEffect(2.0);
            
            if (this.health <= 0) {
                this.die();
                this.gameState.audioManager.playSound('knightDeath');
            }
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
     * 渲染敌人
     */
    render(ctx) {
        ctx.save();
        
        // 根据状态调整颜色
        let renderColor = this.color;
        if (this.state === 'stunned') {
            renderColor = '#FFFF99';
        } else if (this.state === 'vulnerable') {
            renderColor = '#CD5C5C';
        }
        
        // 绘制骑士身体
        this.renderKnightBody(ctx, renderColor);
        
        // 绘制武器
        this.renderWeapon(ctx);
        
        // 绘制头顶岩石
        this.renderAboveRocks(ctx);
        
        // 渲染状态指示器
        this.renderStatusIndicator(ctx);
        
        ctx.restore();
    }

    /**
     * 绘制骑士身体
     */
    renderKnightBody(ctx, color) {
        // 绘制盔甲身体
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y + 10, this.width, this.height - 10);
        
        // 绘制头部
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(this.x + 8, this.y, this.width - 16, 15);
        
        // 绘制头盔装饰
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + this.width/2 - 3, this.y - 5, 6, 5);
        
        // 绘制眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 5, 3, 3);
        ctx.fillRect(this.x + this.width - 15, this.y + 5, 3, 3);
        
        // 绘制盾牌
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - 8, this.y + 15, 8, 20);
    }

    /**
     * 绘制武器
     */
    renderWeapon(ctx) {
        ctx.fillStyle = '#C0C0C0';
        
        switch (this.attackPatterns[this.attackIndex]) {
            case 'swing':
                // 绘制剑
                if (this.isAttacking) {
                    ctx.fillRect(this.x + this.width, this.y + 20, 25, 4);
                } else {
                    ctx.fillRect(this.x + this.width - 5, this.y + 20, 20, 4);
                }
                break;
            case 'stomp':
                // 绘制战锤
                ctx.fillRect(this.x + this.width/2 - 2, this.y - 10, 4, 15);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + this.width/2 - 8, this.y - 15, 16, 8);
                break;
            case 'charge':
            default:
                // 绘制长矛
                ctx.fillRect(this.x + this.width, this.y + 25, 30, 3);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x + this.width + 28, this.y + 24, 4, 5);
                break;
        }
    }

    /**
     * 绘制头顶岩石
     */
    renderAboveRocks(ctx) {
        ctx.fillStyle = '#696969';
        for (const rock of this.aboveRocks) {
            ctx.fillRect(rock.x, rock.y, rock.width, rock.height);
            
            // 绘制裂纹
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rock.x + 5, rock.y + 5);
            ctx.lineTo(rock.x + 15, rock.y + 15);
            ctx.lineTo(rock.x + 25, rock.y + 5);
            ctx.stroke();
        }
    }

    /**
     * 渲染状态指示器
     */
    renderStatusIndicator(ctx) {
        // 血量条
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
            
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
        }
        
        // Boss标识
        ctx.fillStyle = '#FFD700';
        ctx.fillText('BOSS', this.x + this.width/2 - 12, this.y - 15);
        
        // 状态图标
        if (this.state === 'stunned') {
            ctx.fillStyle = '#FFFF99';
            ctx.fillText('💫', this.x + this.width/2 - 4, this.y - 20);
        } else if (this.state === 'vulnerable') {
            ctx.fillStyle = '#CD5C5C';
            ctx.fillText('⚠', this.x + this.width/2 - 4, this.y - 20);
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
            name: '萨克斯骑士',
            type: 'Boss敌人',
            health: this.health,
            maxHealth: this.maxHealth,
            damage: this.damage,
            abilities: ['冲锋攻击', '挥砍攻击', '践踏攻击', '岩石掉落'],
            weaknesses: ['头顶岩石砸击', '攻击后易伤窗口'],
            world: '巴伐利亚地牢',
            special: ['Boss级血量', '多种攻击模式', '岩石互动机制', '攻击后硬直']
        };
    }
}