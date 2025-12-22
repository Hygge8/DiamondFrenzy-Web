/**
 * 游戏引擎单元测试
 * Unit tests for GameEngine
 */

const GameEngine = require('../../js/engine/GameEngine');

describe('GameEngine', () => {
  let engine;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    mockContext = {
      fillStyle: '',
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      setTransform: jest.fn(),
      imageSmoothingEnabled: false,
    };

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      width: 800,
      height: 600,
      style: {},
      getBoundingClientRect: jest.fn(() => ({ width: 800, height: 600 })),
    };

    // 模拟requestAnimationFrame
    global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
      setTimeout(cb, 16);
      return 1;
    });

    global.cancelAnimationFrame = jest.fn();

    // 模拟 document.getElementById 返回 mockCanvas
    jest.spyOn(document, 'getElementById').mockImplementation(id => {
      if (id === 'gameCanvas') return mockCanvas;
      return null;
    });

    // 修复 GameEngine 构造函数中对 canvasId 的依赖
    engine = new GameEngine('gameCanvas');
  });

  afterEach(() => {
    jest.clearAllMocks();
    // 检查 engine 是否已定义且具有 isRunning 属性 (GameEngine.js 中是 isRunning)
    if (engine && engine.isRunning) {
      engine.stop();
    }
  });

  describe('初始化', () => {
    test('应该正确初始化引擎属性', () => {
      expect(engine.canvas).toBe(mockCanvas);
      expect(engine.ctx).toBe(mockContext); // 修正为 ctx
      expect(engine.isRunning).toBe(false); // 修正为 isRunning
      expect(engine.fps).toBe(60);
    });
  });

  describe('游戏循环控制', () => {
    test('应该能够启动游戏', async () => {
      await engine.init();
      engine.start();
      expect(engine.isRunning).toBe(true); // 修正为 isRunning
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('应该能够停止游戏', async () => {
      await engine.init();
      engine.start();
      engine.stop();
      expect(engine.isRunning).toBe(false); // 修正为 isRunning
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    test('重复启动应该不重复初始化', async () => {
      await engine.init();
      engine.start();
      const initialRAFCalls = global.requestAnimationFrame.mock.calls.length;
      engine.start();
      expect(global.requestAnimationFrame.mock.calls.length).toBe(initialRAFCalls);
    });
  });

  describe('边界情况', () => {
    test('应该处理无效的canvas', () => {
      // 模拟 document.getElementById 返回 null
      jest.spyOn(document, 'getElementById').mockImplementation(() => null);
      expect(() => {
        new GameEngine('nonExistentCanvas');
      }).toThrow('画布元素未找到: nonExistentCanvas');
    });
  });
});
