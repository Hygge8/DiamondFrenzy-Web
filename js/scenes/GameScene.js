/**
 * 游戏场景
 */
class GameScene {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.name = 'game';
  }

  /**
   * 初始化场景
   */
  async init() {
    console.log('GameScene: 初始化');
    // 可以在这里加载场景特有的资源
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
  }

  /**
   * 销毁场景
   */
  destroy() {
    console.log('GameScene: 销毁');
  }
}
