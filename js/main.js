/**
 * 钻石狂潮游戏主入口
 * 游戏的主启动文件
 */

// 全局游戏引擎实例
let gameEngine = null;

import GameEngine from './engine/GameEngine.js';

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', async () => {
  console.log('钻石狂潮游戏启动中...');

  // 设置UI事件监听
  setupUIEvents();
  setupSettingsEvents(); // <-- 确保在 DOMContentLoaded 内部调用

  try {
    // 初始化游戏引擎
    await initializeGame();

    // 启动游戏
    gameEngine.start();

    console.log('游戏启动完成！');
  } catch (error) {
    console.error('游戏启动失败:', error);
    showErrorMessage('游戏启动失败，请刷新页面重试。');
  }
});



/**
 * 初始化游戏
 */
async function initializeGame() {
  // 创建游戏引擎
  gameEngine = new GameEngine('game-canvas');

  // 设置引擎回调
  gameEngine.setInitCallback(onGameInit);
  gameEngine.setUpdateCallback(onGameUpdate);
  gameEngine.setRenderCallback(onGameRender);
  gameEngine.setPauseCallback(onGamePause);
  gameEngine.setResumeCallback(onGameResume);
  gameEngine.setShutdownCallback(onGameShutdown);
  gameEngine.setLevelCompleteCallback(onLevelComplete);
  gameEngine.setLevelFailCallback(onLevelFail);

  // 创建关卡管理器
  // 注意：levelManager现在由GameEngine内部管理
  // levelManager = new LevelManager();

  // 设置关卡管理器回调
  // 注意：现在通过gameEngine.levelManager访问

  // 初始化游戏引擎
  await gameEngine.init({
    loadAssets: true,
    initialScene: 'mainMenu',
  });
}

/**
 * 设置UI事件监听
 */
function setupUIEvents() {
  // 主菜单按钮
  document.getElementById('start-game').addEventListener('click', () => startGame());
  document.getElementById('level-select').addEventListener('click', () => showLevelSelect());
  document.getElementById('settings').addEventListener('click', () => showSettings());
  document.getElementById('help').addEventListener('click', () => showHelp());

  // 关卡选择
  document.getElementById('back-to-menu').addEventListener('click', () => showMainMenu());

  // 设置界面
  document.getElementById('back-to-menu-settings').addEventListener('click', showMainMenu);

  // 帮助界面
  document.getElementById('back-to-menu-help').addEventListener('click', showMainMenu);

  // 游戏控制
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('restart-btn').addEventListener('click', restartLevel);

  // 暂停菜单
  document.getElementById('resume-game').addEventListener('click', resumeGame);
  document.getElementById('restart-level').addEventListener('click', () => restartLevel());
  document.getElementById('back-to-main-menu').addEventListener('click', () => showMainMenu());

  // 关卡完成
  document.getElementById('next-level').addEventListener('click', () => nextLevel());
  document.getElementById('replay-level').addEventListener('click', () => replayLevel());
  document.getElementById('back-to-level-select').addEventListener('click', () => showLevelSelect());

  // 游戏结束
  document.getElementById('retry-game').addEventListener('click', () => retryGame());
  document.getElementById('back-to-main-menu-gameover').addEventListener('click', () => showMainMenu());

  // 世界选择
  setupWorldSelection();
}

/**
 * 设置设置界面事件
 */
function setupSettingsEvents() {
  const musicVolume = document.getElementById('music-volume');
  const sfxVolume = document.getElementById('sfx-volume');
  const difficulty = document.getElementById('difficulty');
  const musicVolumeValue = document.getElementById('music-volume-value');
  const sfxVolumeValue = document.getElementById('sfx-volume-value');

  // 音乐音量
  if (musicVolume) {
    musicVolume.addEventListener('input', e => {
      const value = e.target.value;
      musicVolumeValue.textContent = value + '%';
      if (gameEngine && gameEngine.audioManager) {
        gameEngine.audioManager.setMusicVolume(value / 100);
      }
    });
  }

  // 音效音量
  if (sfxVolume) {
    sfxVolume.addEventListener('input', e => {
      const value = e.target.value;
      sfxVolumeValue.textContent = value + '%';
      if (gameEngine && gameEngine.audioManager) {
        gameEngine.audioManager.setSFXVolume(value / 100);
      }
    });
  }

  // 难度设置
  if (difficulty) {
    difficulty.addEventListener('change', e => {
      // 这里可以保存难度设置到本地存储
      console.log('难度设置为:', e.target.value);
    });
  }
}

/**
 * 设置世界选择事件
 */
function setupWorldSelection() {
  const worlds = document.querySelectorAll('.world');

  worlds.forEach(world => {
    world.addEventListener('click', () => {
      if (world.classList.contains('locked')) {
        showMessage('该世界尚未解锁！');
        return;
      }

      const worldName = world.dataset.world;
      selectWorld(worldName);
    });
  });
}

/**
 * 开始游戏
 */
async function startGame() {
  console.log('startGame: 开始执行');
  hideAllScreens();
  showScreen('loading-screen');

  try {
    // 切换到游戏场景，加载第一个关卡的操作应该在 GameScene 的 init 中完成
    console.log('startGame: 尝试切换到游戏场景...');
    await gameEngine.sceneManager.changeScene('game');
    console.log('startGame: 场景切换完成，开始显示游戏屏幕。');

    // 隐藏所有屏幕，显示游戏屏幕
    hideAllScreens();
    showScreen('game-screen');

    // 播放背景音乐
    if (gameEngine.audioManager) {
      gameEngine.audioManager.playMusic('mainTheme', true);
    }
  } catch (error) {
    console.error('开始游戏失败:', error);
    console.error(error.stack); // 确保打印堆栈
    showErrorMessage('开始游戏失败，请重试。');
    showMainMenu();
  }
}

/**
 * 显示关卡选择
 */
async function showLevelSelect() {
  await gameEngine.sceneManager.changeScene('levelSelect');
  hideAllScreens();
  showScreen('level-select-screen');
}

/**
 * 显示设置
 */
async function showSettings() {
  await gameEngine.sceneManager.changeScene('settings');
  hideAllScreens();
  showScreen('settings-screen');
}

/**
 * 显示帮助
 */
async function showHelp() {
  await gameEngine.sceneManager.changeScene('help');
  hideAllScreens();
  showScreen('help-screen');
}

/**
 * 显示主菜单
 */
async function showMainMenu() {
  await gameEngine.sceneManager.goToMainMenu();
  hideAllScreens();
  showScreen('main-menu');

  // 停止游戏音乐
  if (gameEngine && gameEngine.audioManager) {
    gameEngine.audioManager.stopMusic();
  }
}

/**
 * 选择世界
 */
function selectWorld(worldName) {
  console.log('选择世界:', worldName);
  // 这里可以实现世界选择逻辑
}

/**
 * 切换暂停状态
 */
function togglePause() {
  if (gameEngine) {
    gameEngine.togglePause();

    if (gameEngine.isPaused) {
      showScreen('pause-menu');
    } else {
      hideScreen('pause-menu');
    }
  }
}

/**
 * 恢复游戏
 */
function resumeGame() {
  hideScreen('pause-menu');
  if (gameEngine) {
    gameEngine.resume();
  }
}

/**
 * 重新开始关卡
 */
async function restartLevel() {
  hideAllScreens();
  showScreen('loading-screen');

  try {
    await gameEngine.levelManager.loadLevel(gameEngine.levelManager.currentLevelIndex);
    hideAllScreens();
    showScreen('game-screen');
  } catch (error) {
    console.error('重新开始关卡失败:', error);
    showErrorMessage('重新开始关卡失败。');
    showMainMenu();
  }
}

/**
 * 下一关
 */
async function nextLevel() {
  const nextIndex = gameEngine.levelManager.currentLevelIndex + 1;

  if (nextIndex >= gameEngine.levelManager.levels.length) {
    showMessage('恭喜！您已经完成了所有关卡！');
    showLevelSelect();
    return;
  }

  hideAllScreens();
  showScreen('loading-screen');

  try {
    await gameEngine.levelManager.loadLevel(nextIndex);
    hideAllScreens();
    showScreen('game-screen');
  } catch (error) {
    console.error('加载下一关失败:', error);
    showErrorMessage('加载下一关失败。');
    showLevelSelect();
  }
}

/**
 * 重玩关卡
 */
async function replayLevel() {
  await restartLevel();
}

/**
 * 重试游戏
 */
async function retryGame() {
  await restartLevel();
}

/**
 * 显示屏幕
 */
function showScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
  }
}

/**
 * 隐藏屏幕
 */
function hideScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('active');
  }
}

/**
 * 隐藏所有屏幕
 */
function hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
}

/**
 * 显示消息
 */
function showMessage(message) {
  // 创建消息元素
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-toast';
  messageDiv.textContent = message;

  document.body.appendChild(messageDiv);

  // 3秒后移除消息
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
  console.error(message);
  showMessage('错误: ' + message);
}

/**
 * 游戏初始化回调
 */
function onGameInit() {
  console.log('游戏引擎初始化完成');

  // 隐藏加载界面，显示主菜单
  hideScreen('loading-screen');
  showScreen('main-menu');
}

/**
 * 游戏更新回调
 */
function onGameUpdate(deltaTime) {
  // 更新游戏内UI
  updateGameUI();
}

/**
 * 游戏渲染回调
 */
function onGameRender(ctx) {
  // 渲染游戏内UI等自定义内容
  // 注意：关卡渲染现在由GameEngine自动处理
}

/**
 * 游戏暂停回调
 */
function onGamePause() {
  console.log('游戏已暂停');
}

/**
 * 游戏恢复回调
 */
function onGameResume() {
  console.log('游戏已恢复');
}

/**
 * 游戏关闭回调
 */
function onGameShutdown() {
  console.log('游戏已关闭');
}

/**
 * 关卡加载回调
 */
function onLevelLoad(level) {
  console.log('关卡加载完成:', level.name);

  // 更新游戏内UI
  updateGameUI();
}

/**
 * 关卡完成回调
 */
function onLevelComplete(data) {
  console.log('关卡完成:', data.level.name);

  // 更新完成界面
  updateLevelCompleteUI(data);

  // 显示完成界面
  showScreen('level-complete');

  // 播放完成音效
  if (gameEngine && gameEngine.audioManager) {
    gameEngine.audioManager.playSFX('level_complete.wav', 0.8);
  }
}

/**
 * 关卡失败回调
 */
function onLevelFail(data) {
  console.log('关卡失败:', data.level.name, '原因:', data.reason);

  // 显示失败界面
  showScreen('game-over');

  // 播放失败音效
  if (gameEngine && gameEngine.audioManager) {
    gameEngine.audioManager.playSFX('game_over.wav', 0.8);
  }
}

/**
 * 更新游戏内UI
 */
function updateGameUI() {
  if (!gameEngine || !gameEngine.levelManager || !gameEngine.levelManager.player) return;

  const player = gameEngine.levelManager.player;

  // 更新生命值
  const healthFill = document.getElementById('health-fill');
  const healthText = document.getElementById('health-text');
  if (healthFill && healthText) {
    const healthPercentage = player.getHealthPercentage();
    healthFill.style.width = healthPercentage * 100 + '%';
    healthText.textContent = player.health;
  }

  // 更新得分
  const scoreText = document.getElementById('score-text');
  if (scoreText) {
    scoreText.textContent = player.score;
  }

  // 更新钻石计数
  const diamondsText = document.getElementById('diamonds-text');
  if (diamondsText) {
    diamondsText.textContent = `${player.diamondsCollected}/${player.totalDiamonds}`;
  }

  // 更新钥匙计数
  const keysText = document.getElementById('keys-text');
  if (keysText) {
    keysText.textContent = player.keys;
  }

  // 更新能量条
  const energyFill = document.getElementById('energy-fill');
  if (energyFill) {
    const energyPercentage = player.getEnergyPercentage();
    energyFill.style.width = energyPercentage * 100 + '%';
  }

  // 更新道具栏
  updateInventoryUI();
}

/**
 * 更新道具栏UI
 */
function updateInventoryUI() {
  if (!gameEngine || !gameEngine.levelManager || !gameEngine.levelManager.player) return;

  const player = gameEngine.levelManager.player;
  const inventorySlots = document.getElementById('inventory-slots');

  if (!inventorySlots) return;

  // 清空现有道具槽
  inventorySlots.innerHTML = '';

  // 创建道具槽
  for (let i = 0; i < player.maxInventorySize; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';

    if (i < player.inventory.length) {
      const item = player.inventory[i];
      slot.classList.add('has-item');

      if (i === player.selectedItemIndex) {
        slot.classList.add('selected');
      }

      // 添加道具图标
      const icon = document.createElement('div');
      icon.className = 'item-icon';
      icon.textContent = getItemIcon(item.type);
      slot.appendChild(icon);

      // 添加数量显示
      if (item.quantity > 1) {
        const count = document.createElement('div');
        count.className = 'item-count';
        count.textContent = item.quantity;
        slot.appendChild(count);
      }

      // 添加点击事件
      slot.addEventListener('click', () => {
        player.selectItem(i);
        updateInventoryUI();
      });
    }

    inventorySlots.appendChild(slot);
  }
}

/**
 * 获取道具图标
 */
function getItemIcon(itemType) {
  const icons = {
    compass: '🧭',
    hammer: '🔨',
    grapple_hook: '🪝',
    ice_ray: '❄️',
    dynamite: '💣',
    shield: '🛡️',
    speed_boots: '👢',
    gem_bag: '💎',
  };

  return icons[itemType] || '❓';
}

/**
 * 更新关卡完成UI
 */
function updateLevelCompleteUI(data) {
  const finalScore = document.getElementById('final-score');
  const finalDiamonds = document.getElementById('final-diamonds');
  const finalTime = document.getElementById('final-time');

  if (finalScore) {
    finalScore.textContent = data.score;
  }

  if (finalDiamonds) {
    finalDiamonds.textContent = `${data.diamonds}/${data.level.targetDiamonds}`;
  }

  if (finalTime) {
    const seconds = Math.floor(data.time / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    finalTime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// 导出到全局作用域（用于调试）
window.diamondFrenzy = {
  gameEngine,
  startGame,
  showMainMenu,
  togglePause,
};
