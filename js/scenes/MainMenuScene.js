/**
 * 主菜单场景
 */
class MainMenuScene extends Scene {
  constructor(gameEngine) {
    super();
    this.gameEngine = gameEngine;
    this.name = 'mainMenu';
  }

  /**
   * 初始化场景
   */
  async init() {
    console.log('MainMenuScene: 初始化');
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
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('钻石狂潮', ctx.canvas.width / 2, ctx.canvas.height / 3);

    // 渲染提示
    ctx.font = '24px Arial';
    ctx.fillText('点击开始游戏', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }

  /**
   * 销毁场景
   */
  destroy() {
    console.log('MainMenuScene: 销毁');
  }
}
