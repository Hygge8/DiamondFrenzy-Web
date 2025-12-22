/**
 * 场景基类
 * 所有游戏场景都应该继承自这个类
 */
class Scene {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.name = this.constructor.name;
    this.isActive = false;
  }

  /**
   * 初始化场景
   * @param {Object} data - 场景间传递的数据
   */
  async init(data) {
    this.isActive = true;
    // console.log(`场景 ${this.name} 初始化`);
  }

  /**
   * 更新场景逻辑
   * @param {number} deltaTime - 帧时间差（毫秒）
   */
  update(deltaTime) {
    // 场景更新逻辑
  }

  /**
   * 渲染场景
   * @param {CanvasRenderingContext2D} ctx - 绘图上下文
   */
  render(ctx) {
    // 场景渲染逻辑
  }

  /**
   * 退出场景
   */
  exit() {
    this.isActive = false;
    // console.log(`场景 ${this.name} 退出`);
  }

  /**
   * 处理窗口大小变化
   * @param {number} width - 新的宽度
   * @param {number} height - 新的高度
   */
  resize(width, height) {
    // 响应式布局处理
  }
}

window.Scene = Scene;
