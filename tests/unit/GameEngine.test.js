const { loadGameScripts } = require('../helpers/load-game-scripts');

describe('GameEngine', () => {
  let GameEngine;
  let engine;

  beforeEach(() => {
    GameEngine = loadGameScripts().GameEngine;
    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    canvas.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 600 }));
    engine = new GameEngine('gameCanvas');
  });

  afterEach(() => {
    if (engine?.isRunning) {
      engine.stop();
    }
  });

  test('initializes engine properties', () => {
    expect(engine.canvas).toBe(document.getElementById('gameCanvas'));
    expect(engine.ctx).toBeTruthy();
    expect(engine.isRunning).toBe(false);
    expect(engine.fps).toBe(60);
  });

  test('starts and stops after initialization', async () => {
    await engine.init({ loadAssets: false, initialScene: 'mainMenu' });
    engine.start();

    expect(engine.isRunning).toBe(true);

    engine.stop();
    expect(engine.isRunning).toBe(false);
  });

  test('throws for a missing canvas', () => {
    expect(() => new GameEngine('missingCanvas')).toThrow('画布元素未找到: missingCanvas');
  });
});
