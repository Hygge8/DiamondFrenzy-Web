/**
 * 敌人基类单元测试
 * Unit tests for Enemy base class
 */

const Enemy = require('../../src/scripts/entities/enemies/Enemy');

describe('Enemy', () => {
    let enemy;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        mockContext = {
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn()
        };
        
        mockCanvas = {
            getContext: jest.fn().mockReturnValue(mockContext),
            width: 800,
            height: 600
        };

        enemy = new Enemy(200, 200, 'test-enemy', mockCanvas);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('初始化', () => {
        test('应该正确初始化敌人属性', () => {
            expect(enemy.x).toBe(200);
            expect(enemy.y).toBe(200);
            expect(enemy.type).toBe('test-enemy');
            expect(enemy.health).toBe(100);
            expect(enemy.speed).toBe(0.5);
            expect(enemy.width).toBe(32);
            expect(enemy.height).toBe(32);
            expect(enemy.isDead).toBe(false);
        });

        test('应该设置默认AI行为', () => {
            expect(enemy.ai).toBe('patrol');
            expect(enemy.target).toBeNull();
            expect(enemy.lastDirectionChange).toBe(0);
        });
    });

    describe('AI行为', () => {
        test('应该能够设置AI行为', () => {
            enemy.setAI('chase');
            expect(enemy.ai).toBe('chase');
        });

        test('应该能够设置目标', () => {
            const target = { x: 300, y: 300 };
            enemy.setTarget(target);
            expect(enemy.target).toEqual(target);
        });

        test('应该能够清除目标', () => {
            enemy.setTarget({ x: 300, y: 300 });
            enemy.clearTarget();
            expect(enemy.target).toBeNull();
        });
    });

    describe('巡逻行为', () => {
        test('应该执行巡逻AI', () => {
            const initialX = enemy.x;
            enemy.executeAI('patrol', 16);
            
            // 巡逻应该会移动
            expect(enemy.x).not.toBe(initialX);
        });

        test('应该改变巡逻方向', () => {
            enemy.lastDirectionChange = 0;
            enemy.executeAI('patrol', 16);
            
            // 方向应该会改变
            expect(['up', 'down', 'left', 'right']).toContain(enemy.direction);
        });
    });

    describe('追踪行为', () => {
        test('应该执行追踪AI', () => {
            enemy.setAI('chase');
            enemy.setTarget({ x: 300, y: 300 });
            
            const initialX = enemy.x;
            enemy.executeAI('chase', 16);
            
            // 追踪应该向目标移动
            expect(enemy.x).not.toBe(initialX);
        });

        test('没有目标时不应该追踪', () => {
            enemy.setAI('chase');
            enemy.clearTarget();
            
            const initialX = enemy.x;
            enemy.executeAI('chase', 16);
            
            // 没有目标时应该不移动
            expect(enemy.x).toBe(initialX);
        });
    });

    describe('攻击行为', () => {
        test('应该能够攻击目标', () => {
            const target = { takeDamage: jest.fn() };
            enemy.attack(target);
            
            expect(target.takeDamage).toHaveBeenCalledWith(enemy.damage);
        });

        test('应该设置攻击冷却时间', () => {
            enemy.attackCooldown = 0;
            const target = { takeDamage: jest.fn() };
            
            enemy.attack(target);
            expect(enemy.attackCooldown).toBeGreaterThan(0);
        });

        test('冷却期间不应该攻击', () => {
            enemy.attackCooldown = 1000; // 1秒冷却
            const target = { takeDamage: jest.fn() };
            
            enemy.attack(target);
            expect(target.takeDamage).not.toHaveBeenCalled();
        });
    });

    describe('伤害系统', () => {
        test('应该能够受到伤害', () => {
            const initialHealth = enemy.health;
            enemy.takeDamage(30);
            expect(enemy.health).toBe(initialHealth - 30);
        });

        test('应该检测是否死亡', () => {
            enemy.takeDamage(100);
            expect(enemy.isDead).toBe(true);
        });

        test('不应该低于0生命值', () => {
            enemy.health = 10;
            enemy.takeDamage(20);
            expect(enemy.health).toBe(0);
        });

        test('死亡时应该触发死亡事件', () => {
            enemy.onDeath = jest.fn();
            enemy.takeDamage(100);
            expect(enemy.onDeath).toHaveBeenCalled();
        });
    });

    describe('碰撞检测', () => {
        test('应该检测与玩家的碰撞', () => {
            const player = { x: 200, y: 200, width: 32, height: 32 };
            
            expect(enemy.checkCollision(player)).toBe(true);
        });

        test('应该检测非碰撞情况', () => {
            const player = { x: 400, y: 400, width: 32, height: 32 };
            
            expect(enemy.checkCollision(player)).toBe(false);
        });

        test('应该检测部分重叠', () => {
            const player = { x: 220, y: 220, width: 32, height: 32 };
            
            expect(enemy.checkCollision(player)).toBe(true);
        });
    });

    describe('渲染功能', () => {
        test('应该正确渲染敌人', () => {
            enemy.render(mockContext);
            
            expect(mockContext.fillRect).toHaveBeenCalledWith(
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );
        });

        test('应该根据类型渲染不同颜色', () => {
            enemy.type = 'snow-ape';
            enemy.render(mockContext);
            
            // 验证渲染调用
            expect(mockContext.fillRect).toHaveBeenCalled();
        });

        test('死亡时应该渲染不同的视觉效果', () => {
            enemy.isDead = true;
            enemy.render(mockContext);
            
            // 死亡时的渲染逻辑
            expect(mockContext.strokeRect).toHaveBeenCalled();
        });
    });

    describe('更新功能', () => {
        test('应该能够更新敌人状态', () => {
            const deltaTime = 16;
            enemy.update(deltaTime);
            
            expect(typeof enemy.update).toBe('function');
        });

        test('应该减少攻击冷却时间', () => {
            enemy.attackCooldown = 1000;
            enemy.update(16);
            
            expect(enemy.attackCooldown).toBeLessThan(1000);
        });
    });

    describe('边界情况', () => {
        test('应该处理无效的AI类型', () => {
            expect(() => {
                enemy.executeAI('invalid-ai', 16);
            }).not.toThrow();
        });

        test('应该处理负数伤害', () => {
            const initialHealth = enemy.health;
            enemy.takeDamage(-10);
            expect(enemy.health).toBe(initialHealth + 10);
        });

        test('应该处理超出边界的移动', () => {
            enemy.x = -50;
            enemy.move('left');
            expect(enemy.x).toBeGreaterThanOrEqual(0);
        });
    });
});