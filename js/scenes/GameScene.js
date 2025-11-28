/**
 * 游戏场景
 */
class GameScene extends Scene {
  constructor(gameEngine) {
    super();
    this.gameEngine = gameEngine;
    this.name = 'game';
  }

  /**
   * 初始化场景
   */
  async init() {
    console.log('GameScene: 初始化');
    // 加载第一个关卡
    await this.gameEngine.levelManager.loadLevel(0);
  }

  /**
   * 更新场景
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 场景逻辑更新
  }

  /**
   * 渲染场景
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    // 游戏渲染由 LevelManager 处理
    if (this.gameEngine.levelManager) {
      this.gameEngine.levelManager.render(ctx);
    }
  }

  /**
   * 销毁场景
   */
  destroy() {
    console.log('GameScene: 销毁');
  }
}
