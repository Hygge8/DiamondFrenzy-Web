/**
 * 数学工具类
 * 提供游戏开发中常用的数学函数和常量
 */
class MathUtils {
  /**
   * 圆周率
   */
  static PI = Math.PI;

  /**
   * 2倍圆周率
   */
  static TWO_PI = Math.PI * 2;

  /**
   * 角度转弧度
   * @param {number} degrees - 角度
   * @returns {number} 弧度
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   * @param {number} radians - 弧度
   * @returns {number} 角度
   */
  static toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * 限制数值在指定范围内
   * @param {number} value - 要限制的值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的值
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * 线性插值
   * @param {number} start - 起始值
   * @param {number} end - 结束值
   * @param {number} factor - 插值因子 (0-1)
   * @returns {number} 插值结果
   */
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * 获取两点之间的距离
   * @param {number} x1 - 点1的x坐标
   * @param {number} y1 - 点1的y坐标
   * @param {number} x2 - 点2的x坐标
   * @param {number} y2 - 点2的y坐标
   * @returns {number} 距离
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取两点之间的角度
   * @param {number} x1 - 点1的x坐标
   * @param {number} y1 - 点1的y坐标
   * @param {number} x2 - 点2的x坐标
   * @param {number} y2 - 点2的y坐标
   * @returns {number} 角度（弧度）
   */
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * 生成指定范围内的随机数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机数
   */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * 生成指定范围内的随机整数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机整数
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 检查两个矩形是否碰撞
   * @param {Object} rect1 - 矩形1 {x, y, width, height}
   * @param {Object} rect2 - 矩形2 {x, y, width, height}
   * @returns {boolean} 是否碰撞
   */
  static rectCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * 检查点是否在矩形内
   * @param {number} x - 点的x坐标
   * @param {number} y - 点的y坐标
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @returns {boolean} 是否在矩形内
   */
  static pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  /**
   * 检查两个圆形是否碰撞
   * @param {Object} circle1 - 圆形1 {x, y, radius}
   * @param {Object} circle2 - 圆形2 {x, y, radius}
   * @returns {boolean} 是否碰撞
   */
  static circleCollision(circle1, circle2) {
    const distance = MathUtils.distance(circle1.x, circle1.y, circle2.x, circle2.y);
    return distance < circle1.radius + circle2.radius;
  }

  /**
   * 获取矩形的中心点
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @returns {Object} 中心点 {x, y}
   */
  static rectCenter(rect) {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };
  }

  /**
   * 将值映射到新的范围
   * @param {number} value - 要映射的值
   * @param {number} inMin - 输入范围最小值
   * @param {number} inMax - 输入范围最大值
   * @param {number} outMin - 输出范围最小值
   * @param {number} outMax - 输出范围最大值
   * @returns {number} 映射后的值
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  }

  /**
   * 检查数值是否在指定范围内
   * @param {number} value - 要检查的值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {boolean} 是否在范围内
   */
  static inRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * 获取数字的符号
   * @param {number} value - 数值
   * @returns {number} 符号 (-1, 0, 1)
   */
  static sign(value) {
    if (value > 0) return 1;
    if (value < 0) return -1;
    return 0;
  }

  /**
   * 角度标准化到0-360度范围
   * @param {number} angle - 角度
   * @returns {number} 标准化后的角度
   */
  static normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  /**
   * 计算向量的长度
   * @param {number} x - x分量
   * @param {number} y - y分量
   * @returns {number} 向量长度
   */
  static vectorLength(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  /**
   * 向量归一化
   * @param {number} x - x分量
   * @param {number} y - y分量
   * @returns {Object} 归一化后的向量 {x, y}
   */
  static normalize(x, y) {
    const length = MathUtils.vectorLength(x, y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
  }

  /**
   * 向量加法
   * @param {Object} v1 - 向量1 {x, y}
   * @param {Object} v2 - 向量2 {x, y}
   * @returns {Object} 向量和 {x, y}
   */
  static add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  /**
   * 向量减法
   * @param {Object} v1 - 向量1 {x, y}
   * @param {Object} v2 - 向量2 {x, y}
   * @returns {Object} 向量差 {x, y}
   */
  static subtract(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  /**
   * 向量缩放
   * @param {Object} v - 向量 {x, y}
   * @param {number} scalar - 缩放因子
   * @returns {Object} 缩放后的向量 {x, y}
   */
  static scale(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
  }
}
