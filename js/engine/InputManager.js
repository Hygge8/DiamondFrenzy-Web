/**
 * 输入管理器
 * 负责处理游戏中的所有输入（键盘、鼠标、触控）
 */
class InputManager {
  constructor() {
    this.keys = new Map();
    this.previousKeys = new Map();
    this.mouse = {
      x: 0,
      y: 0,
      leftButton: false,
      rightButton: false,
      middleButton: false,
      wheelDelta: 0,
    };
    this.touches = new Map();
    this.gamepad = null;
    this.gamepadIndex = -1;

    // 输入状态
    this.isEnabled = true;
    this.isPaused = false;

    // 回调函数
    this.keyDownCallbacks = new Map();
    this.keyUpCallbacks = new Map();
    this.mouseDownCallbacks = new Map();
    this.mouseUpCallbacks = new Map();
    this.mouseMoveCallbacks = new Set();
    this.touchStartCallbacks = new Set();
    this.touchMoveCallbacks = new Set();
    this.touchEndCallbacks = new Set();

    // 游戏手柄支持
    this.gamepadConnected = false;
    this.gamepadButtons = new Map();
    this.gamepadAxes = new Map();

    // 绑定事件监听器
    this._bindEvents();

    // 启动游戏手柄监听
    this._startGamepadMonitoring();
  }

  /**
   * 绑定事件监听器
   * @private
   */
  _bindEvents() {
    // 键盘事件
    document.addEventListener('keydown', e => this._onKeyDown(e));
    document.addEventListener('keyup', e => this._onKeyUp(e));

    // 防止默认行为
    document.addEventListener('keydown', e => {
      if (this._isGameKey(e.code)) {
        e.preventDefault();
      }
    });

    // 鼠标事件
    document.addEventListener('mousedown', e => this._onMouseDown(e));
    document.addEventListener('mouseup', e => this._onMouseUp(e));
    document.addEventListener('mousemove', e => this._onMouseMove(e));
    document.addEventListener('wheel', e => this._onMouseWheel(e));
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 触控事件
    document.addEventListener('touchstart', e => this._onTouchStart(e), { passive: false });
    document.addEventListener('touchmove', e => this._onTouchMove(e), { passive: false });
    document.addEventListener('touchend', e => this._onTouchEnd(e), { passive: false });
    document.addEventListener('touchcancel', e => this._onTouchEnd(e), { passive: false });

    // 游戏手柄事件
    window.addEventListener('gamepadconnected', e => this._onGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', e => this._onGamepadDisconnected(e));

    // 窗口失焦时清除按键状态
    window.addEventListener('blur', () => this._clearAllKeys());
  }

  /**
   * 键盘按下事件处理
   * @param {KeyboardEvent} e - 键盘事件
   * @private
   */
  _onKeyDown(e) {
    if (!this.isEnabled || this.isPaused) return;

    const key = e.code;
    this.keys.set(key, true);

    // 调用回调函数
    const callbacks = this.keyDownCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(e));
    }

    // 检查组合键
    this._checkCombinations(key, true);
  }

  /**
   * 键盘释放事件处理
   * @param {KeyboardEvent} e - 键盘事件
   * @private
   */
  _onKeyUp(e) {
    if (!this.isEnabled) return;

    const key = e.code;
    this.keys.set(key, false);

    // 调用回调函数
    const callbacks = this.keyUpCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(e));
    }
  }

  /**
   * 鼠标按下事件处理
   * @param {MouseEvent} e - 鼠标事件
   * @private
   */
  _onMouseDown(e) {
    if (!this.isEnabled || this.isPaused) return;

    this._updateMousePosition(e);

    switch (e.button) {
    case 0: // 左键
      this.mouse.leftButton = true;
      break;
    case 1: // 中键
      this.mouse.middleButton = true;
      break;
    case 2: // 右键
      this.mouse.rightButton = true;
      break;
    }

    // 调用回调函数
    const callbacks = this.mouseDownCallbacks.get(e.button);
    if (callbacks) {
      callbacks.forEach(callback => callback(e));
    }
  }

  /**
   * 鼠标释放事件处理
   * @param {MouseEvent} e - 鼠标事件
   * @private
   */
  _onMouseUp(e) {
    if (!this.isEnabled) return;

    this._updateMousePosition(e);

    switch (e.button) {
    case 0: // 左键
      this.mouse.leftButton = false;
      break;
    case 1: // 中键
      this.mouse.middleButton = false;
      break;
    case 2: // 右键
      this.mouse.rightButton = false;
      break;
    }

    // 调用回调函数
    const callbacks = this.mouseUpCallbacks.get(e.button);
    if (callbacks) {
      callbacks.forEach(callback => callback(e));
    }
  }

  /**
   * 鼠标移动事件处理
   * @param {MouseEvent} e - 鼠标事件
   * @private
   */
  _onMouseMove(e) {
    if (!this.isEnabled) return;

    this._updateMousePosition(e);

    // 调用回调函数
    this.mouseMoveCallbacks.forEach(callback => callback(e));
  }

  /**
   * 鼠标滚轮事件处理
   * @param {WheelEvent} e - 滚轮事件
   * @private
   */
  _onMouseWheel(e) {
    if (!this.isEnabled || this.isPaused) return;

    this.mouse.wheelDelta = e.deltaY;

    // 防止页面滚动
    e.preventDefault();
  }

  /**
   * 触控开始事件处理
   * @param {TouchEvent} e - 触控事件
   * @private
   */
  _onTouchStart(e) {
    if (!this.isEnabled || this.isPaused) return;

    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      });
    }

    // 调用回调函数
    this.touchStartCallbacks.forEach(callback => callback(e));
  }

  /**
   * 触控移动事件处理
   * @param {TouchEvent} e - 触控事件
   * @private
   */
  _onTouchMove(e) {
    if (!this.isEnabled || this.isPaused) return;

    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (this.touches.has(touch.identifier)) {
        const touchData = this.touches.get(touch.identifier);
        touchData.x = touch.clientX;
        touchData.y = touch.clientY;
      }
    }

    // 调用回调函数
    this.touchMoveCallbacks.forEach(callback => callback(e));
  }

  /**
   * 触控结束事件处理
   * @param {TouchEvent} e - 触控事件
   * @private
   */
  _onTouchEnd(e) {
    if (!this.isEnabled) return;

    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.touches.delete(touch.identifier);
    }

    // 调用回调函数
    this.touchEndCallbacks.forEach(callback => callback(e));
  }

  /**
   * 游戏手柄连接事件处理
   * @param {GamepadEvent} e - 游戏手柄事件
   * @private
   */
  _onGamepadConnected(e) {
    console.log('游戏手柄已连接:', e.gamepad.id);
    this.gamepad = e.gamepad;
    this.gamepadIndex = e.gamepad.index;
    this.gamepadConnected = true;
  }

  /**
   * 游戏手柄断开事件处理
   * @param {GamepadEvent} e - 游戏手柄事件
   * @private
   */
  _onGamepadDisconnected(e) {
    console.log('游戏手柄已断开:', e.gamepad.id);
    this.gamepad = null;
    this.gamepadIndex = -1;
    this.gamepadConnected = false;
    this.gamepadButtons.clear();
    this.gamepadAxes.clear();
  }

  /**
   * 检查按键是否被按下
   * @param {string} key - 按键代码
   * @returns {boolean} 是否被按下
   */
  isKeyDown(key) {
    return this.keys.get(key) === true;
  }

  /**
   * 检查按键是否刚被按下（这一帧）
   * @param {string} key - 按键代码
   * @returns {boolean} 是否刚被按下
   */
  isKeyPressed(key) {
    return this.keys.get(key) === true && this.previousKeys.get(key) !== true;
  }

  /**
   * 检查按键是否刚被释放（这一帧）
   * @param {string} key - 按键代码
   * @returns {boolean} 是否刚被释放
   */
  isKeyReleased(key) {
    return this.keys.get(key) !== true && this.previousKeys.get(key) === true;
  }

  /**
   * 检查鼠标按钮是否被按下
   * @param {number} button - 按钮代码 (0=左键, 1=中键, 2=右键)
   * @returns {boolean} 是否被按下
   */
  isMouseDown(button) {
    switch (button) {
    case 0:
      return this.mouse.leftButton;
    case 1:
      return this.mouse.middleButton;
    case 2:
      return this.mouse.rightButton;
    default:
      return false;
    }
  }

  /**
   * 获取鼠标位置
   * @returns {Object} 鼠标位置 {x, y}
   */
  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /**
   * 获取触控数量
   * @returns {number} 触控数量
   */
  getTouchCount() {
    return this.touches.size;
  }

  /**
   * 获取指定触控点
   * @param {number} index - 触控点索引
   * @returns {Object|null} 触控点信息
   */
  getTouch(index) {
    const touches = Array.from(this.touches.values());
    return touches[index] || null;
  }

  /**
   * 获取游戏手柄按钮状态
   * @param {number} buttonIndex - 按钮索引
   * @returns {boolean} 按钮是否被按下
   */
  isGamepadButtonDown(buttonIndex) {
    if (!this.gamepad || !this.gamepad.connected) return false;
    return this.gamepad.buttons[buttonIndex]?.pressed || false;
  }

  /**
   * 获取游戏手柄轴值
   * @param {number} axisIndex - 轴索引
   * @returns {number} 轴值 (-1到1)
   */
  getGamepadAxis(axisIndex) {
    if (!this.gamepad || !this.gamepad.connected) return 0;
    return this.gamepad.axes[axisIndex] || 0;
  }

  /**
   * 添加键盘按下回调
   * @param {string} key - 按键代码
   * @param {Function} callback - 回调函数
   */
  addKeyDownCallback(key, callback) {
    if (!this.keyDownCallbacks.has(key)) {
      this.keyDownCallbacks.set(key, new Set());
    }
    this.keyDownCallbacks.get(key).add(callback);
  }

  /**
   * 添加键盘释放回调
   * @param {string} key - 按键代码
   * @param {Function} callback - 回调函数
   */
  addKeyUpCallback(key, callback) {
    if (!this.keyUpCallbacks.has(key)) {
      this.keyUpCallbacks.set(key, new Set());
    }
    this.keyUpCallbacks.get(key).add(callback);
  }

  /**
   * 添加鼠标按下回调
   * @param {number} button - 按钮代码
   * @param {Function} callback - 回调函数
   */
  addMouseDownCallback(button, callback) {
    if (!this.mouseDownCallbacks.has(button)) {
      this.mouseDownCallbacks.set(button, new Set());
    }
    this.mouseDownCallbacks.get(button).add(callback);
  }

  /**
   * 添加鼠标释放回调
   * @param {number} button - 按钮代码
   * @param {Function} callback - 回调函数
   */
  addMouseUpCallback(button, callback) {
    if (!this.mouseUpCallbacks.has(button)) {
      this.mouseUpCallbacks.set(button, new Set());
    }
    this.mouseUpCallbacks.get(button).add(callback);
  }

  /**
   * 添加鼠标移动回调
   * @param {Function} callback - 回调函数
   */
  addMouseMoveCallback(callback) {
    this.mouseMoveCallbacks.add(callback);
  }

  /**
   * 添加触控开始回调
   * @param {Function} callback - 回调函数
   */
  addTouchStartCallback(callback) {
    this.touchStartCallbacks.add(callback);
  }

  /**
   * 添加触控移动回调
   * @param {Function} callback - 回调函数
   */
  addTouchMoveCallback(callback) {
    this.touchMoveCallbacks.add(callback);
  }

  /**
   * 添加触控结束回调
   * @param {Function} callback - 回调函数
   */
  addTouchEndCallback(callback) {
    this.touchEndCallbacks.add(callback);
  }

  /**
   * 移除回调函数
   * @param {string} type - 回调类型
   * @param {string|number} key - 按键或按钮代码
   * @param {Function} callback - 回调函数
   */
  removeCallback(type, key, callback) {
    switch (type) {
    case 'keydown':
      if (this.keyDownCallbacks.has(key)) {
        this.keyDownCallbacks.get(key).delete(callback);
      }
      break;
    case 'keyup':
      if (this.keyUpCallbacks.has(key)) {
        this.keyUpCallbacks.get(key).delete(callback);
      }
      break;
    case 'mousedown':
      if (this.mouseDownCallbacks.has(key)) {
        this.mouseDownCallbacks.get(key).delete(callback);
      }
      break;
    case 'mouseup':
      if (this.mouseUpCallbacks.has(key)) {
        this.mouseUpCallbacks.get(key).delete(callback);
      }
      break;
    }
  }

  /**
   * 更新输入状态（每帧调用）
   */
  update() {
    // 更新游戏手柄状态
    this._updateGamepad();

    // 重置鼠标滚轮增量
    this.mouse.wheelDelta = 0;

    // 保存当前按键状态用于检测边沿触发
    this.previousKeys.clear();
    this.keys.forEach((value, key) => {
      this.previousKeys.set(key, value);
    });
  }

  /**
   * 启用/禁用输入
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this._clearAllKeys();
    }
  }

  /**
   * 暂停/恢复输入
   * @param {boolean} paused - 是否暂停
   */
  setPaused(paused) {
    this.isPaused = paused;
  }

  /**
   * 清除所有按键状态
   * @private
   */
  _clearAllKeys() {
    this.keys.clear();
    this.previousKeys.clear();
    this.mouse.leftButton = false;
    this.mouse.rightButton = false;
    this.mouse.middleButton = false;
  }

  /**
   * 更新鼠标位置
   * @param {MouseEvent} e - 鼠标事件
   * @private
   */
  _updateMousePosition(e) {
    const rect = document.getElementById('game-canvas').getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  /**
   * 检查按键是否为游戏按键
   * @param {string} code - 按键代码
   * @returns {boolean} 是否为游戏按键
   * @private
   */
  _isGameKey(code) {
    const gameKeys = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD', // WASD
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight', // 方向键
      'Space',
      'Enter',
      'Escape', // 动作键
      'Digit1',
      'Digit2',
      'Digit3',
      'Digit4',
      'Digit5', // 数字键
      'Digit6',
      'Digit7',
      'Digit8',
      'Digit9',
      'Digit0',
    ];
    return gameKeys.includes(code);
  }

  /**
   * 检查组合键
   * @param {string} key - 按键代码
   * @param {boolean} isDown - 是否按下
   * @private
   */
  _checkCombinations(key, isDown) {
    // 这里可以添加组合键检查逻辑
    // 例如 Ctrl+C, Shift+ESC 等
  }

  /**
   * 启动游戏手柄监控
   * @private
   */
  _startGamepadMonitoring() {
    const pollGamepad = () => {
      if (navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        if (gamepads[this.gamepadIndex]) {
          this.gamepad = gamepads[this.gamepadIndex];
          this.gamepadConnected = true;
        }
      }
      requestAnimationFrame(pollGamepad);
    };
    pollGamepad();
  }

  /**
   * 更新游戏手柄状态
   * @private
   */
  _updateGamepad() {
    if (!this.gamepad || !this.gamepad.connected) return;

    // 更新按钮状态
    for (let i = 0; i < this.gamepad.buttons.length; i++) {
      this.gamepadButtons.set(i, this.gamepad.buttons[i].pressed);
    }

    // 更新轴状态
    for (let i = 0; i < this.gamepad.axes.length; i++) {
      this.gamepadAxes.set(i, this.gamepad.axes[i]);
    }
  }

  /**
   * 获取输入统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      isEnabled: this.isEnabled,
      isPaused: this.isPaused,
      keysPressed: Array.from(this.keys.keys()).filter(key => this.keys.get(key)),
      mousePosition: { x: this.mouse.x, y: this.mouse.y },
      mouseButtons: {
        left: this.mouse.leftButton,
        middle: this.mouse.middleButton,
        right: this.mouse.rightButton,
      },
      touchCount: this.touches.size,
      gamepadConnected: this.gamepadConnected,
      gamepadIndex: this.gamepadIndex,
    };
  }
}

window.InputManager = InputManager;
