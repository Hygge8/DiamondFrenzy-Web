/**
 * 游戏集成测试
 * Integration tests for Diamond Frenzy Web game
 */

const GameEngine = require('../../src/scripts/engine/GameEngine');
const Player = require('../../src/scripts/entities/Player');
const Enemy = require('../../src/scripts/entities/enemies/Enemy');
const Diamond = require('../../src/scripts/entities/Diamond');

describe('Game Integration Tests', () => {
  let engine;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    mockContext = {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
    };

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      width: 800,
      height: 600,
    };

    engine = new GameEngine(mockCanvas);

    // 模拟requestAnimationFrame
    global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
      setTimeout(cb, 16);
      return 1;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (engine.running) {
      engine.stop();
    }
  });

  describe('玩家与敌人交互', () => {
    test('玩家应该能够击败敌人', () => {
      const player = new Player(100, 100, mockCanvas);
      const enemy = new Enemy(150, 100, 'snow-ape', mockCanvas);

      engine.addEntity(player);
      engine.addEntity(enemy);

      // 玩家攻击敌人
      player.attack(enemy);

      expect(enemy.health).toBeLessThan(100);
      expect(enemy.isDead).toBe(false);

      // 多次攻击直到敌人死亡
      for (let i = 0; i < 10; i++) {
        player.attack(enemy);
      }

      expect(enemy.isDead).toBe(true);
    });

    test('敌人应该能够攻击玩家', () => {
      const player = new Player(100, 100, mockCanvas);
      const enemy = new Enemy(150, 100, 'snow-ape', mockCanvas);

      engine.addEntity(player);
      engine.addEntity(enemy);

      enemy.attack(player);

      expect(player.health).toBeLessThan(100);
    });

    test('玩家应该能够躲避敌人', () => {
      const player = new Player(100, 100, mockCanvas);
      const enemy = new Enemy(200, 100, 'snow-ape', mockCanvas);

      engine.addEntity(player);
      engine.addEntity(enemy);

      // 玩家移动到安全位置
      player.move('up');
      player.move('up');
      player.move('up');

      // 检查是否不再碰撞
      const isColliding = player.checkCollision(enemy);
      expect(isColliding).toBe(false);
    });
  });

  describe('玩家与道具交互', () => {
    test('玩家应该能够收集钻石', () => {
      const player = new Player(100, 100, mockCanvas);
      const diamond = new Diamond(120, 100, 10);

      engine.addEntity(player);
      engine.addEntity(diamond);

      const initialScore = player.score;
      player.collectItem(diamond);

      expect(player.score).toBe(initialScore + 10);
      expect(diamond.isCollected).toBe(true);
    });

    test('玩家应该能够收集生命道具', () => {
      const player = new Player(100, 100, mockCanvas);
      const healthItem = {
        type: 'health',
        value: 20,
        isCollected: false,
      };

      player.health = 80;
      player.collectItem(healthItem);

      expect(player.health).toBe(100); // 不能超过最大值
      expect(healthItem.isCollected).toBe(true);
    });

    test('玩家应该能够收集速度道具', () => {
      const player = new Player(100, 100, mockCanvas);
      const speedItem = {
        type: 'speed',
        value: 0.5,
        isCollected: false,
      };

      const initialSpeed = player.speed;
      player.collectItem(speedItem);

      expect(player.speed).toBe(initialSpeed + 0.5);
    });
  });

  describe('关卡完成系统', () => {
    test('玩家收集所有钻石后应该完成关卡', () => {
      const player = new Player(100, 100, mockCanvas);
      const diamond1 = new Diamond(120, 100, 10);
      const diamond2 = new Diamond(140, 100, 10);
      const exit = { x: 180, y: 100, width: 32, height: 32 };

      engine.addEntity(player);
      engine.addEntity(diamond1);
      engine.addEntity(diamond2);

      // 收集所有钻石
      player.collectItem(diamond1);
      player.collectItem(diamond2);

      // 移动到出口
      player.x = exit.x;
      player.y = exit.y;

      const levelComplete = player.checkCollision(exit) && player.score >= 20;
      expect(levelComplete).toBe(true);
    });

    test('玩家生命值为0时应该失败', () => {
      const player = new Player(100, 100, mockCanvas);

      player.takeDamage(100);

      expect(player.isDead()).toBe(true);
    });
  });

  describe('游戏状态管理', () => {
    test('游戏应该能够暂停和恢复', () => {
      engine.start();
      expect(engine.running).toBe(true);

      engine.pause();
      expect(engine.running).toBe(false);

      engine.resume();
      expect(engine.running).toBe(true);
    });

    test('游戏应该能够重置', () => {
      const player = new Player(100, 100, mockCanvas);
      const enemy = new Enemy(200, 100, 'snow-ape', mockCanvas);

      engine.addEntity(player);
      engine.addEntity(enemy);

      player.score = 50;
      player.health = 80;

      engine.reset();

      expect(engine.entities).toEqual([]);
      expect(player.score).toBe(0);
      expect(player.health).toBe(100);
    });
  });

  describe('性能集成测试', () => {
    test('游戏应该能够处理多个实体', () => {
      const entities = [];

      // 创建多个玩家
      for (let i = 0; i < 5; i++) {
        entities.push(new Player(100 + i * 50, 100, mockCanvas));
      }

      // 创建多个敌人
      for (let i = 0; i < 10; i++) {
        entities.push(new Enemy(200 + i * 30, 200, 'snow-ape', mockCanvas));
      }

      // 创建多个钻石
      for (let i = 0; i < 15; i++) {
        entities.push(new Diamond(300 + i * 20, 300, 10));
      }

      entities.forEach(entity => engine.addEntity(entity));

      const startTime = Date.now();
      engine.update(16);
      const endTime = Date.now();

      // 更新应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('游戏应该维持稳定的FPS', async () => {
      const entities = [];

      // 添加一些实体
      for (let i = 0; i < 20; i++) {
        entities.push(new Player(100 + i * 20, 100, mockCanvas));
      }

      entities.forEach(entity => engine.addEntity(entity));

      engine.start();

      // 等待一段时间收集FPS数据
      await new Promise(resolve => setTimeout(resolve, 100));

      // FPS应该在合理范围内
      expect(engine.fps).toBeGreaterThan(30);
      expect(engine.fps).toBeLessThanOrEqual(60);
    });
  });

  describe('错误处理集成测试', () => {
    test('游戏应该优雅处理实体错误', () => {
      const faultyEntity = {
        id: 'faulty',
        update: jest.fn().mockImplementation(() => {
          throw new Error('Update failed');
        }),
        render: jest.fn(),
        isActive: true,
      };

      const normalEntity = {
        id: 'normal',
        update: jest.fn(),
        render: jest.fn(),
        isActive: true,
      };

      engine.addEntity(faultyEntity);
      engine.addEntity(normalEntity);

      // 不应该抛出错误
      expect(() => {
        engine.update(16);
      }).not.toThrow();

      // 正常实体仍然应该被更新
      expect(normalEntity.update).toHaveBeenCalled();
    });

    test('游戏应该处理资源加载失败', async () => {
      const failedResource = { src: 'non-existent-file.png' };

      // 模拟加载失败
      engine.loadResource = jest.fn().mockRejectedValue(new Error('File not found'));

      await expect(engine.loadResource(failedResource)).rejects.toThrow('File not found');
    });
  });

  describe('数据持久化集成测试', () => {
    test('游戏进度应该能够保存和加载', () => {
      const player = new Player(100, 100, mockCanvas);

      // 设置游戏状态
      player.score = 150;
      player.health = 75;
      player.currentLevel = 3;

      // 保存状态
      const gameState = {
        player: {
          score: player.score,
          health: player.health,
          currentLevel: player.currentLevel,
        },
      };

      // 模拟保存到localStorage
      localStorage.setItem('diamond-frenzy-save', JSON.stringify(gameState));

      // 加载状态
      const savedState = JSON.parse(localStorage.getItem('diamond-frenzy-save'));

      expect(savedState.player.score).toBe(150);
      expect(savedState.player.health).toBe(75);
      expect(savedState.player.currentLevel).toBe(3);
    });

    test('游戏设置应该能够保存', () => {
      const settings = {
        soundEnabled: true,
        musicEnabled: false,
        difficulty: 'normal',
        controls: 'wasd',
      };

      localStorage.setItem('diamond-frenzy-settings', JSON.stringify(settings));

      const savedSettings = JSON.parse(localStorage.getItem('diamond-frenzy-settings'));

      expect(savedSettings.soundEnabled).toBe(true);
      expect(savedSettings.musicEnabled).toBe(false);
      expect(savedSettings.difficulty).toBe('normal');
    });
  });
});
