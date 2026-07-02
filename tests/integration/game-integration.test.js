const { loadGameScripts } = require('../helpers/load-game-scripts');

describe('Game integration', () => {
  test('loads the first grid puzzle level and creates playable systems', async () => {
    const { GameEngine } = loadGameScripts();

    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    canvas.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 600 }));

    const engine = new GameEngine('gameCanvas');
    await engine.init({ loadAssets: false, initialScene: 'mainMenu' });
    await engine.sceneManager.changeScene('game', null, { type: 'none' });

    expect(engine.levelManager.isLevelLoaded).toBe(true);
    expect(engine.levelManager.player).toBeTruthy();
    expect(engine.levelManager.gridRows).toBe(15);
    expect(engine.levelManager.gridCols).toBe(20);
    expect(engine.levelManager.diamonds).toHaveLength(engine.levelManager.currentLevel.targetDiamonds);
    expect(engine.levelManager.diamonds.length).toBeGreaterThan(3);
    expect(engine.levelManager.obstacles.length).toBeGreaterThanOrEqual(2);
    expect(engine.levelManager.items).toHaveLength(1);
    expect(engine.levelManager.enemies).toHaveLength(1);

    engine.destroy();
  });

  test('supports dirt digging, diamond collection, and a locked exit', async () => {
    const { GameEngine } = loadGameScripts();

    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    canvas.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 600 }));

    const engine = new GameEngine('gameCanvas');
    await engine.init({ loadAssets: false, initialScene: 'mainMenu' });
    await engine.sceneManager.changeScene('game', null, { type: 'none' });

    const level = engine.levelManager;

    expect(level.playerGrid).toEqual({ col: 1, row: 1 });
    expect(level._getTile(2, 1)).toBe('.');

    expect(level.movePlayer(1, 0)).toBe(true);
    expect(level.playerGrid).toEqual({ col: 2, row: 1 });
    expect(level._getTile(2, 1)).toBe(' ');
    expect(level.player.score).toBe(1);

    expect(level.movePlayer(1, 0)).toBe(true);
    expect(level.playerGrid).toEqual({ col: 3, row: 1 });
    expect(level.player.diamondsCollected).toBe(1);
    expect(level.diamonds.find(diamond => diamond.col === 3 && diamond.row === 1).isCollected).toBe(true);

    level._setPlayerGridPosition(level.exitGrid.col - 1, level.exitGrid.row);
    expect(level.movePlayer(1, 0)).toBe(false);
    expect(level.isLevelCompleted).toBe(false);

    level.player.diamondsCollected = level.player.totalDiamonds;
    expect(level.movePlayer(1, 0)).toBe(true);
    expect(level.isLevelCompleted).toBe(true);

    engine.destroy();
  });

  test('loads a selected world level by index', async () => {
    const { GameEngine } = loadGameScripts();

    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    canvas.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 600 }));

    const engine = new GameEngine('gameCanvas');
    await engine.init({ loadAssets: false, initialScene: 'mainMenu' });

    await engine.levelManager.loadLevel(2);

    expect(engine.levelManager.currentLevelIndex).toBe(2);
    expect(engine.levelManager.currentLevel.world).toBe('bavaria');
    expect(engine.levelManager.player.totalDiamonds).toBe(engine.levelManager.currentLevel.targetDiamonds);

    engine.destroy();
  });

  test('uses the hammer to break an adjacent boulder', async () => {
    const { GameEngine } = loadGameScripts();

    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    canvas.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 600 }));

    const engine = new GameEngine('gameCanvas');
    await engine.init({ loadAssets: false, initialScene: 'mainMenu' });
    await engine.levelManager.loadLevel(0);

    const level = engine.levelManager;
    level._setPlayerGridPosition(4, 1);
    level.player.facingDirection = 'right';
    level.player.inventory = [{ type: 'hammer', itemType: 'hammer', name: 'Hammer', quantity: 1 }];
    level.player.selectedItemIndex = 0;

    expect(level._getTile(5, 1)).toBe('R');
    expect(level.useSelectedTool()).toBe(true);
    expect(level._getTile(5, 1)).toBe(' ');
    expect(level.obstacles.find(obstacle => obstacle.col === 5 && obstacle.row === 1).isDead).toBe(true);
    expect(level.player.score).toBe(25);

    engine.destroy();
  });
});
