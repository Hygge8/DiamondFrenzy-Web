const { loadGameScripts } = require('../helpers/load-game-scripts');

describe('Game integration', () => {
  test('loads the first level and creates playable entities', async () => {
    const { GameEngine } = loadGameScripts();

    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    canvas.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 600 }));

    const engine = new GameEngine('gameCanvas');
    await engine.init({ loadAssets: false, initialScene: 'mainMenu' });
    await engine.sceneManager.changeScene('game', null, { type: 'none' });

    expect(engine.levelManager.isLevelLoaded).toBe(true);
    expect(engine.levelManager.player).toBeTruthy();
    expect(engine.levelManager.diamonds).toHaveLength(3);
    expect(engine.levelManager.obstacles).toHaveLength(2);
    expect(engine.levelManager.items).toHaveLength(1);
    expect(engine.levelManager.enemies).toHaveLength(1);

    engine.destroy();
  });
});
