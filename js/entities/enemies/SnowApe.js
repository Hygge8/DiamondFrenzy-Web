/**
 * 雪猿类 - 西藏雪洞世界的追踪型敌人
 * 具追踪AI，会从冰块中释放并主动跟随玩家位置
 * 可被冰锥下落、瓦缸浮起、风力托举岩石、岩石坠落、与少林弟子互相伤害等手段克制
 */
import Enemy from './Enemy.js';

export default class SnowApe extends Enemy {
    constructor(x, y) {
        super(x, y);
        
        // 雪猿属性
        this.type = 'snowApe';
        this.width = 32;
        this.height = 32;
        this.color = '#8B4513'; // 棕色
        this.speed = 80; // 追踪速度
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 25;
        
        // AI状态
        this.state = 'idle'; // idle, chasing, frozen, stunned
        this.stateTimer = 0;
        this.target = null;
        this.detectionRange = 200;
        this.attackRange = 30;
        this.attackCooldown = 0;
        this.freezeTimer = 0;
        this.stunTimer = 0;
        
        // 特殊行为
        this.canBeFrozen = true;
        this.canBeStunned = true;
        this.immuneToItems = false; // 不免疫道具
        this.environmentVulnerable = true; // 容易受环境影响
        
        // 动画相关
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.15;
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
        
        if (this.freezeTimer > 0) {
            this.freezeTimer -= deltaTime;
            if (this.freezeTimer <= 0) {
                this.state = 'idle';
                this.freezeTimer = 0;
            }
        }
        
        if (this.stunTimer > 0) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.state = 'idle';
                this.stunTimer = 0;
            }
        }
        
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
            case 'chasing':
                this.handleChasingState(deltaTime, gameState);
                break;
            case 'idle':
            default:
                this.handleIdleState(deltaTime, gameState);
                break;
        }
    }

    /**
     * 空闲状态处理
     */
    handleIdleState(deltaTime, gameState) {
        // 寻找玩家
        const player = gameState.player;
        if (player && this.getDistanceTo(player) <= this.detectionRange) {
            this.target = player;
            this.state = 'chasing';
            return;
        }
        
        // 随机移动
        this.velocity.x = (Math.random() - 0.5) * this.speed * 0.5;
        this.velocity.y = (Math.random() - 0.5) * this.speed * 0.5;
    }

    /**
     * 追踪状态处理
     */
    handleChasingState(deltaTime, gameState) {
        const player = gameState.player;
        
        if (!player || this.getDistanceTo(player) > this.detectionRange * 1.5) {
            // 失去目标
            this.target = null;
            this.state = 'idle';
            return;
        }
        
        // 向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
        }
        
        // 攻击检查
        if (distance <= this.attackRange && this.attackCooldown <= 0) {
            this.attackPlayer(player);
            this.attackCooldown = 1.5; // 1.5秒攻击冷却
        }
    }

    /**
     * 冰冻状态处理
     */
    handleFrozenState(deltaTime) {
        // 冰冻状态下无法移动
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.color = '#87CEEB'; // 冰冻时变蓝色
    }

    /**
     * 眩晕状态处理
     */
    handleStunnedState(deltaTime) {
        // 眩晕状态下缓慢移动
        this.velocity.x *= 0.8;
        this.velocity.y *= 0.8;
        this.color = '#FFFF99'; // 眩晕时变黄色
    }

    /**
     * 攻击玩家
     */
    attackPlayer(player) {
        if (player && this.getDistanceTo(player) <= this.attackRange) {
            player.takeDamage(this.damage);
            this.gameState.audioManager.playSound('snowApeAttack');
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
     * 受到环境伤害（如冰锥砸击）
     */
    takeEnvironmentalDamage(damage, source = 'environment') {
        this.health -= damage;
        this.takeStunEffect(1.0);
        
        if (this.health <= 0) {
            this.die();
            this.gameState.audioManager.playSound('snowApeDeath');
        }
    }

    /**
     * 与其他敌人互动（可能被少林弟子攻击）
     */
    interactWithEnemy(enemy) {
        if (enemy.type === 'shaolinMonk') {
            // 雪猿和少林弟子会互相伤害
            const damage = 30;
            this.takeEnvironmentalDamage(damage, 'enemyInteraction');
            enemy.takeEnvironmentalDamage(damage, 'enemyInteraction');
        }
    }

    /**
     * 环境互动检查
     */
    checkEnvironmentInteraction(gameState) {
        // 检查是否在冰锥下落路径上
        const icicles = gameState.level.getObjectsByType('icicle');
        for (const icicle of icicles) {
            if (this.isInRange(icicle, 40) && icicle.isFalling()) {
                this.takeEnvironmentalDamage(80, 'icicle');
                break;
            }
        }
        
        // 检查是否被瓦缸限制
        const jars = gameState.level.getObjectsByType('jar');
        for (const jar of jars) {
            if (jar.isFloating() && this.isCollidingWith(jar)) {
                this.takeStunEffect(1.5);
                break;
            }
        }
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
        
        // 绘制雪猿身体
        ctx.fillStyle = renderColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
        
        // 绘制嘴巴
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 12, this.y + 20, 8, 3);
        
        // 绘制状态指示器
        this.renderStatusIndicator(ctx);
        
        ctx.restore();
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
        
        // 状态图标
        if (this.state === 'frozen') {
            ctx.fillStyle = '#87CEEB';
            ctx.fillText('❄', this.x + this.width/2 - 4, this.y - 15);
        } else if (this.state === 'stunned') {
            ctx.fillStyle = '#FFFF99';
            ctx.fillText('💫', this.x + this.width/2 - 4, this.y - 15);
        }
    }

    /**
     * 动画更新
     */
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
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
            name: '雪猿',
            type: '追踪型敌人',
            health: this.health,
            maxHealth: this.maxHealth,
            damage: this.damage,
            abilities: ['追踪玩家', '近战攻击'],
            weaknesses: ['冰锥砸击', '瓦缸限制', '冰冻效果', '少林弟子攻击'],
            world: '西藏雪洞'
        };
    }
}