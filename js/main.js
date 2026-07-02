(function () {
let gameEngine = null;
let initializationPromise = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupUIEvents();
  setupSettingsEvents();

  try {
    initializationPromise = initializeGame();
    await initializationPromise;
    gameEngine.start();
    console.log('Diamond Frenzy started.');
  } catch (error) {
    console.error('Failed to start Diamond Frenzy:', error);
    showErrorMessage('游戏启动失败，请刷新页面重试。');
  }
});

async function initializeGame() {
  gameEngine = new window.GameEngine('game-canvas');

  gameEngine.setInitCallback(onGameInit);
  gameEngine.setUpdateCallback(onGameUpdate);
  gameEngine.setRenderCallback(onGameRender);
  gameEngine.setPauseCallback(onGamePause);
  gameEngine.setResumeCallback(onGameResume);
  gameEngine.setShutdownCallback(onGameShutdown);
  gameEngine.setLevelCompleteCallback(onLevelComplete);
  gameEngine.setLevelFailCallback(onLevelFail);

  await gameEngine.init({
    loadAssets: false,
    initialScene: 'mainMenu',
  });

  window.audioManager = gameEngine.audioManager;
  window.levelManager = gameEngine.levelManager;
  window.diamondFrenzy.gameEngine = gameEngine;
}

function setupUIEvents() {
  bindClick('start-game', startGame);
  bindClick('level-select', showLevelSelect);
  bindClick('settings', showSettings);
  bindClick('help', showHelp);

  bindClick('back-to-menu', showMainMenu);
  bindClick('back-to-menu-settings', showMainMenu);
  bindClick('back-to-menu-help', showMainMenu);

  bindClick('pause-btn', togglePause);
  bindClick('restart-btn', restartLevel);
  bindClick('resume-game', resumeGame);
  bindClick('restart-level', restartLevel);
  bindClick('back-to-main-menu', showMainMenu);

  bindClick('next-level', nextLevel);
  bindClick('replay-level', replayLevel);
  bindClick('back-to-level-select', showLevelSelect);

  bindClick('retry-game', retryGame);
  bindClick('back-to-main-menu-gameover', showMainMenu);

  setupWorldSelection();
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (!element) return;

  element.addEventListener('click', event => {
    event.preventDefault();
    handler();
  });
}

function setupSettingsEvents() {
  const musicVolume = document.getElementById('music-volume');
  const sfxVolume = document.getElementById('sfx-volume');
  const difficulty = document.getElementById('difficulty');
  const musicVolumeValue = document.getElementById('music-volume-value');
  const sfxVolumeValue = document.getElementById('sfx-volume-value');

  if (musicVolume && musicVolumeValue) {
    musicVolume.addEventListener('input', event => {
      const value = Number(event.target.value);
      musicVolumeValue.textContent = `${value}%`;
      gameEngine?.audioManager?.setMusicVolume(value / 100);
    });
  }

  if (sfxVolume && sfxVolumeValue) {
    sfxVolume.addEventListener('input', event => {
      const value = Number(event.target.value);
      sfxVolumeValue.textContent = `${value}%`;
      gameEngine?.audioManager?.setSFXVolume(value / 100);
    });
  }

  if (difficulty) {
    difficulty.addEventListener('change', event => {
      window.localStorage?.setItem('diamond-frenzy-difficulty', event.target.value);
    });
  }
}

function setupWorldSelection() {
  document.querySelectorAll('.world').forEach(world => {
    world.addEventListener('click', () => {
      if (world.classList.contains('locked')) {
        showMessage('该世界暂未解锁。');
        return;
      }

      selectWorld(world.dataset.world);
    });
  });
}

async function startGame() {
  if (initializationPromise) {
    await initializationPromise;
  }

  if (!gameEngine) return;

  hideAllScreens();
  hideAllOverlays();
  showScreen('loading-screen');

  try {
    await gameEngine.sceneManager.changeScene('game', null, { type: 'none' });

    if (!gameEngine.isRunning) {
      gameEngine.start();
    }

    hideAllScreens();
    hideAllOverlays();
    showScreen('game-screen');
    gameEngine.audioManager?.playMusic('mainTheme', true);
  } catch (error) {
    console.error('Failed to start game:', error);
    showErrorMessage('开始游戏失败，请重试。');
    await showMainMenu();
  }
}

async function showLevelSelect() {
  await changeSceneIfReady('levelSelect');
  hideAllScreens();
  hideAllOverlays();
  showScreen('level-select-screen');
}

async function showSettings() {
  await changeSceneIfReady('settings');
  hideAllScreens();
  hideAllOverlays();
  showScreen('settings-screen');
}

async function showHelp() {
  await changeSceneIfReady('help');
  hideAllScreens();
  hideAllOverlays();
  showScreen('help-screen');
}

async function showMainMenu() {
  if (gameEngine?.sceneManager?.goToMainMenu) {
    await gameEngine.sceneManager.goToMainMenu();
  } else {
    await changeSceneIfReady('mainMenu');
  }

  hideAllScreens();
  hideAllOverlays();
  showScreen('main-menu');
  gameEngine?.audioManager?.stopMusic();
}

async function changeSceneIfReady(sceneName) {
  if (gameEngine?.sceneManager) {
    await gameEngine.sceneManager.changeScene(sceneName, null, { type: 'none' });
  }
}

function selectWorld(worldName) {
  console.log('Selected world:', worldName);
  showMessage('当前版本先开放吴哥窟第一关。');
}

function togglePause() {
  if (!gameEngine) return;

  gameEngine.togglePause();

  if (gameEngine.isPaused) {
    showOverlay('pause-menu');
  } else {
    hideOverlay('pause-menu');
  }
}

function resumeGame() {
  hideOverlay('pause-menu');
  gameEngine?.resume();
}

async function restartLevel() {
  if (!gameEngine?.levelManager) return;

  hideAllScreens();
  hideAllOverlays();
  showScreen('loading-screen');

  try {
    await gameEngine.levelManager.loadLevel(gameEngine.levelManager.currentLevelIndex);
    hideAllScreens();
    hideAllOverlays();
    showScreen('game-screen');
  } catch (error) {
    console.error('Failed to restart level:', error);
    showErrorMessage('重新开始关卡失败。');
    await showMainMenu();
  }
}

async function nextLevel() {
  if (!gameEngine?.levelManager) return;

  const nextIndex = gameEngine.levelManager.currentLevelIndex + 1;

  if (nextIndex >= gameEngine.levelManager.levels.length) {
    showMessage('所有关卡已完成。');
    await showLevelSelect();
    return;
  }

  hideAllScreens();
  hideAllOverlays();
  showScreen('loading-screen');

  try {
    await gameEngine.levelManager.loadLevel(nextIndex);
    hideAllScreens();
    hideAllOverlays();
    showScreen('game-screen');
  } catch (error) {
    console.error('Failed to load next level:', error);
    showErrorMessage('加载下一关失败。');
    await showLevelSelect();
  }
}

async function replayLevel() {
  await restartLevel();
}

async function retryGame() {
  await restartLevel();
}

function showScreen(screenId) {
  document.getElementById(screenId)?.classList.add('active');
}

function hideScreen(screenId) {
  document.getElementById(screenId)?.classList.remove('active');
}

function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
}

function showOverlay(overlayId) {
  document.getElementById(overlayId)?.classList.add('active');
}

function hideOverlay(overlayId) {
  document.getElementById(overlayId)?.classList.remove('active');
}

function hideAllOverlays() {
  document.querySelectorAll('.overlay').forEach(overlay => overlay.classList.remove('active'));
}

function showMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-toast';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

function showErrorMessage(message) {
  console.error(message);
  showMessage(`错误：${message}`);
}

function onGameInit() {
  hideScreen('loading-screen');
  showScreen('main-menu');
}

function onGameUpdate() {
  updateGameUI();
}

function onGameRender() {}

function onGamePause() {
  console.log('Game paused.');
}

function onGameResume() {
  console.log('Game resumed.');
}

function onGameShutdown() {
  console.log('Game shutdown.');
}

function onLevelComplete(data) {
  updateLevelCompleteUI(data);
  showOverlay('level-complete');
  gameEngine?.audioManager?.playSFX('level_complete.wav', 0.8);
}

function onLevelFail(data) {
  console.log('Level failed:', data);
  showOverlay('game-over');
  gameEngine?.audioManager?.playSFX('game_over.wav', 0.8);
}

function updateGameUI() {
  const player = gameEngine?.levelManager?.player;
  if (!player) return;

  const healthFill = document.getElementById('health-fill');
  const healthText = document.getElementById('health-text');
  if (healthFill && healthText) {
    healthFill.style.width = `${player.getHealthPercentage() * 100}%`;
    healthText.textContent = String(player.health);
  }

  setText('score-text', player.score);
  setText('diamonds-text', `${player.diamondsCollected}/${player.totalDiamonds}`);
  setText('keys-text', player.keys);

  const energyFill = document.getElementById('energy-fill');
  if (energyFill) {
    energyFill.style.width = `${player.getEnergyPercentage() * 100}%`;
  }

  updateInventoryUI();
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = String(value);
  }
}

function updateInventoryUI() {
  const player = gameEngine?.levelManager?.player;
  const inventorySlots = document.getElementById('inventory-slots');
  if (!player || !inventorySlots) return;

  inventorySlots.innerHTML = '';

  for (let i = 0; i < player.maxInventorySize; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';

    if (i < player.inventory.length) {
      const item = player.inventory[i];
      slot.classList.add('has-item');

      if (i === player.selectedItemIndex) {
        slot.classList.add('selected');
      }

      const icon = document.createElement('div');
      icon.className = 'item-icon';
      icon.textContent = getItemIcon(item.itemType || item.type);
      slot.appendChild(icon);

      if (item.quantity > 1) {
        const count = document.createElement('div');
        count.className = 'item-count';
        count.textContent = item.quantity;
        slot.appendChild(count);
      }

      slot.addEventListener('click', () => {
        player.selectItem(i);
        updateInventoryUI();
      });
    }

    inventorySlots.appendChild(slot);
  }
}

function getItemIcon(itemType) {
  const icons = {
    compass: 'C',
    hammer: 'H',
    grapple_hook: 'G',
    ice_ray: 'I',
    dynamite: 'D',
    shield: 'S',
    speed_boots: 'B',
    gem_bag: '$',
  };

  return icons[itemType] || '?';
}

function updateLevelCompleteUI(data) {
  setText('final-score', data.score ?? 0);
  setText('final-diamonds', `${data.diamonds ?? 0}/${data.level?.targetDiamonds ?? 0}`);

  const finalTime = document.getElementById('final-time');
  if (finalTime) {
    const seconds = Math.floor((data.time ?? 0) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    finalTime.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
}

window.diamondFrenzy = {
  get gameEngine() {
    return gameEngine;
  },
  set gameEngine(value) {
    gameEngine = value;
  },
  startGame,
  showMainMenu,
  togglePause,
};
})();
