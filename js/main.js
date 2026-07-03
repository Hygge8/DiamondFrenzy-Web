(function () {
let gameEngine = null;
let initializationPromise = null;
let selectedWorldFilter = 'all';
const PROGRESS_STORAGE_KEY = 'progress';

document.addEventListener('DOMContentLoaded', async () => {
  setupUIEvents();
  setupSettingsEvents();
  setupMobileControls();
  setupCanvasFocus();

  try {
    initializationPromise = initializeGame();
    await initializationPromise;
    gameEngine.start();
    renderLevelCards();
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
  bindClick('start-game', () => startGame(0));
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
      selectedWorldFilter = world.dataset.world || 'all';
      document.querySelectorAll('.world').forEach(item => item.classList.remove('selected'));
      world.classList.add('selected');
      renderLevelCards();
    });
  });
}

function setupMobileControls() {
  document.querySelectorAll('[data-move]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      const [dx, dy] = button.dataset.move.split(',').map(Number);
      moveBy(dx, dy);
    });
  });

  const actionButton = document.getElementById('mobile-action');
  if (actionButton) {
    actionButton.addEventListener('pointerdown', event => {
      event.preventDefault();
      useSelectedTool();
    });
  }
}

function setupCanvasFocus() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  canvas.addEventListener('pointerdown', () => focusGameCanvas());
}

function focusGameCanvas() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas || typeof canvas.focus !== 'function') return;

  try {
    canvas.focus({ preventScroll: true });
  } catch (error) {
    canvas.focus();
  }
}

async function startGame(levelIndex = 0) {
  if (initializationPromise) {
    await initializationPromise;
  }

  if (!gameEngine) return;

  hideAllScreens();
  hideAllOverlays();
  showScreen('loading-screen');

  try {
    await gameEngine.sceneManager.changeScene('game', { levelIndex }, { type: 'none' });

    if (gameEngine.levelManager.currentLevelIndex !== levelIndex) {
      await gameEngine.levelManager.loadLevel(levelIndex);
    }

    if (!gameEngine.isRunning) {
      gameEngine.start();
    }

    saveLastLevel(levelIndex);
    hideAllScreens();
    hideAllOverlays();
    showScreen('game-screen');
    focusGameCanvas();
    updateGameUI();
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
  renderLevelCards();
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

function renderLevelCards() {
  const list = document.getElementById('level-list');
  if (!list || !gameEngine?.levelManager) return;

  const progress = getProgress();
  const levels = gameEngine.levelManager
    .getAvailableLevels()
    .filter(level => selectedWorldFilter === 'all' || level.world === selectedWorldFilter);

  list.innerHTML = '';

  levels.forEach(level => {
    const button = document.createElement('button');
    button.className = 'level-card';
    button.type = 'button';
    button.dataset.levelIndex = String(level.index);
    const levelProgress = progress.completedLevels[String(level.index)];
    if (levelProgress) {
      button.classList.add('completed');
    }

    const timeLimitSeconds = Math.floor((level.timeLimit || 0) / 1000);
    const minutes = Math.floor(timeLimitSeconds / 60);
    const seconds = String(timeLimitSeconds % 60).padStart(2, '0');
    const statusText = levelProgress
      ? `Completed | Best ${levelProgress.bestScore} | ${formatTime(levelProgress.bestTime)}`
      : 'Not completed';

    button.innerHTML = `
      <span class="level-card-title">${level.index + 1}. ${level.name}</span>
      <span class="level-card-meta">${getWorldName(level.world)} · ${level.targetDiamonds} 钻石 · ${minutes}:${seconds}</span>
      <span class="level-card-status">${statusText}</span>
    `;

    button.addEventListener('click', () => startGame(level.index));
    list.appendChild(button);
  });
}

function getWorldName(world) {
  const names = {
    angkor_wat: '吴哥窟',
    bavaria: '巴伐利亚',
    tibet: '西藏雪洞',
  };
  return names[world] || world;
}

function createDefaultProgress() {
  return {
    version: 1,
    lastLevelIndex: 0,
    highestUnlockedLevel: 0,
    completedLevels: {},
    updatedAt: null,
  };
}

function getProgress() {
  let saved = window.StorageUtils?.get(PROGRESS_STORAGE_KEY, null);

  if (!saved) {
    try {
      const raw = window.localStorage?.getItem(`diamond-frenzy-${PROGRESS_STORAGE_KEY}`);
      saved = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Unable to read progress:', error);
    }
  }

  return {
    ...createDefaultProgress(),
    ...(saved || {}),
    completedLevels: saved?.completedLevels || {},
  };
}

function saveProgress(progress) {
  const nextProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  if (window.StorageUtils?.set(PROGRESS_STORAGE_KEY, nextProgress)) {
    return nextProgress;
  }

  try {
    window.localStorage?.setItem(`diamond-frenzy-${PROGRESS_STORAGE_KEY}`, JSON.stringify(nextProgress));
  } catch (error) {
    console.warn('Unable to save progress:', error);
  }

  return nextProgress;
}

function saveLastLevel(levelIndex) {
  const progress = getProgress();
  progress.lastLevelIndex = levelIndex;
  saveProgress(progress);
}

function saveLevelProgress(data) {
  const levelIndex = gameEngine?.levelManager?.currentLevelIndex ?? 0;
  const progress = getProgress();
  const key = String(levelIndex);
  const previous = progress.completedLevels[key] || {};
  const score = data.score ?? 0;
  const time = data.time ?? 0;

  progress.lastLevelIndex = levelIndex;
  progress.highestUnlockedLevel = Math.max(progress.highestUnlockedLevel || 0, levelIndex + 1);
  progress.completedLevels[key] = {
    completed: true,
    bestScore: Math.max(previous.bestScore || 0, score),
    bestTime: previous.bestTime ? Math.min(previous.bestTime, time) : time,
    diamonds: Math.max(previous.diamonds || 0, data.diamonds ?? 0),
    completedAt: new Date().toISOString(),
  };

  saveProgress(progress);
}

function formatTime(milliseconds = 0) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function moveBy(dx, dy) {
  if (!gameEngine?.levelManager || gameEngine.isPaused) return;
  if (gameEngine.levelManager.movePlayer(dx, dy)) {
    updateGameUI();
  }
}

function useSelectedTool() {
  if (!gameEngine?.levelManager || gameEngine.isPaused) return;
  if (gameEngine.levelManager.useSelectedTool()) {
    updateGameUI();
  }
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
    focusGameCanvas();
    updateGameUI();
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
    focusGameCanvas();
    updateGameUI();
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
  saveLevelProgress(data);
  renderLevelCards();
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
    finalTime.textContent = formatTime(data.time ?? 0);
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
  getProgress,
};
})();
