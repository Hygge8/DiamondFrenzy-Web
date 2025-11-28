/**
 * 关卡选择场景
 */
class LevelSelectScene extends Scene {
  constructor(gameEngine) {
    super();
    this.gameEngine = gameEngine;
    this.name = 'levelSelect';
  }

  /**
   * 初始化场景
   */
  async init() {
    console.log('LevelSelectScene: 初始化');
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
    // 渲染背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 渲染标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择关卡', ctx.canvas.width / 2, 50);
  }

  /**
   * 销毁场景
   */
  destroy() {
    console.log('LevelSelectScene: 销毁');
  }
}
