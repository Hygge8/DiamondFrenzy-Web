(function () {
var Scene = window.Scene;

class GameScene extends Scene {
  constructor(gameEngine) {
    super();
    this.gameEngine = gameEngine;
    this.name = 'game';
  }

  async init(data = {}) {
    const levelIndex = Number.isInteger(data?.levelIndex) ? data.levelIndex : 0;
    await this.gameEngine.levelManager.loadLevel(levelIndex);
  }

  update(deltaTime) {}

  render(ctx) {
    if (this.gameEngine.levelManager) {
      this.gameEngine.levelManager.render(ctx);
    }
  }

  destroy() {}
}

window.GameScene = GameScene;
})();
