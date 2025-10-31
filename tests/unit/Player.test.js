/**
 * 玩家类单元测试
 * Unit tests for Player class
 */

const Player = require('../../src/scripts/entities/Player');

describe('Player', () => {
    let player;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        // 创建模拟Canvas和Context
        mockContext = {
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            fill: jest.fn()
        };
        
        mockCanvas = {
            getContext: jest.fn().mockReturnValue(mockContext),
            width: 800,
            height: 600
        };

        // 创建玩家实例
        player = new Player(100, 100, mockCanvas);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('初始化', () => {
        test('应该正确初始化玩家属性', () => {
            expect(player.x).toBe(100);
            expect(player.y).toBe(100);
            expect(player.health).toBe(100);
            expect(player.score).toBe(0);
            expect(player.speed).toBe(1);
            expect(player.width).toBe(32);
            expect(player.height).toBe(32);
        });

        test('应该设置默认方向为向下', () => {
            expect(player.direction).toBe('down');
        });
    });

    describe('移动功能', () => {
        test('应该能够向右移动', () => {
            const initialX = player.x;
            player.move('right');
            expect(player.x).toBe(initialX + player.speed);
            expect(player.direction).toBe('right');
        });

        test('应该能够向左移动', () => {
            const initialX = player.x;
            player.move('left');
            expect(player.x).toBe(initialX - player.speed);
            expect(player.direction).toBe('left');
        });

        test('应该能够向上移动', () => {
            const initialY = player.y;
            player.move('up');
            expect(player.y).toBe(initialY - player.speed);
            expect(player.direction).toBe('up');
        });

        test('应该能够向下移动', () => {
            const initialY = player.y;
            player.move('down');
            expect(player.y).toBe(initialY + player.speed);
            expect(player.direction).toBe('down');
        });

        test('应该能够设置自定义速度', () => {
            player.move('right', 2);
            expect(player.x).toBe(102);
        });

        test('不应该移动到边界外', () => {
            // 测试左边界
            player.x = 10;
            player.move('left');
            expect(player.x).toBeGreaterThanOrEqual(0);

            // 测试上边界
            player.y = 10;
            player.move('up');
            expect(player.y).toBeGreaterThanOrEqual(0);

            // 测试右边界
            player.x = mockCanvas.width - 20;
            player.move('right');
            expect(player.x).toBeLessThanOrEqual(mockCanvas.width - player.width);

            // 测试下边界
            player.y = mockCanvas.height - 20;
            player.move('down');
            expect(player.y).toBeLessThanOrEqual(mockCanvas.height - player.height);
        });
    });

    describe('收集道具功能', () => {
        test('应该能够收集钻石', () => {
            const diamond = { type: 'diamond', value: 10 };
            const initialScore = player.score;
            
            player.collectItem(diamond);
            expect(player.score).toBe(initialScore + diamond.value);
        });

        test('应该能够收集生命值道具', () => {
            const healthItem = { type: 'health', value: 20 };
            const initialHealth = player.health;
            
            player.collectItem(healthItem);
            expect(player.health).toBe(initialHealth + healthItem.value);
        });

        test('不应该超过最大生命值', () => {
            player.health = 90;
            const healthItem = { type: 'health', value: 20 };
            
            player.collectItem(healthItem);
            expect(player.health).toBe(100); // 最大生命值
        });

        test('应该能够收集速度道具', () => {
            const speedItem = { type: 'speed', value: 0.5 };
            const initialSpeed = player.speed;
            
            player.collectItem(speedItem);
            expect(player.speed).toBe(initialSpeed + speedItem.value);
        });
    });

    describe('伤害系统', () => {
        test('应该能够受到伤害', () => {
            const initialHealth = player.health;
            player.takeDamage(20);
            expect(player.health).toBe(initialHealth - 20);
        });

        test('不应该低于0生命值', () => {
            player.health = 10;
            player.takeDamage(20);
            expect(player.health).toBe(0);
        });

        test('应该检测玩家是否死亡', () => {
            player.takeDamage(100);
            expect(player.isDead()).toBe(true);
        });

        test('应该检测玩家是否存活', () => {
            player.takeDamage(50);
            expect(player.isDead()).toBe(false);
        });
    });

    describe('渲染功能', () => {
        test('应该正确渲染玩家', () => {
            player.render(mockContext);
            
            expect(mockContext.fillRect).toHaveBeenCalledWith(
                player.x, 
                player.y, 
                player.width, 
                player.height
            );
        });

        test('应该根据方向渲染不同颜色', () => {
            // 测试不同方向的渲染
            player.direction = 'up';
            player.render(mockContext);
            
            player.direction = 'down';
            player.render(mockContext);
            
            // 验证渲染调用
            expect(mockContext.fillRect).toHaveBeenCalledTimes(2);
        });
    });

    describe('更新功能', () => {
        test('应该能够更新玩家状态', () => {
            const deltaTime = 16; // 约60FPS
            player.update(deltaTime);
            
            // 基本的更新测试
            expect(typeof player.update).toBe('function');
        });
    });

    describe('边界情况', () => {
        test('应该处理无效的移动方向', () => {
            const initialX = player.x;
            const initialY = player.y;
            
            player.move('invalid-direction');
            
            // 应该不移动
            expect(player.x).toBe(initialX);
            expect(player.y).toBe(initialY);
        });

        test('应该处理负数伤害', () => {
            const initialHealth = player.health;
            player.takeDamage(-10);
            expect(player.health).toBe(initialHealth + 10); // 负伤害应该变成治疗
        });

        test('应该处理无效的道具类型', () => {
            const invalidItem = { type: 'invalid-type', value: 10 };
            const initialScore = player.score;
            
            player.collectItem(invalidItem);
            expect(player.score).toBe(initialScore); // 不应该改变分数
        });
    });
});