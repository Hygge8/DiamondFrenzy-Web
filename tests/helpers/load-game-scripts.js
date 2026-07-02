const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

const exportedGlobals = [
  'MathUtils',
  'StringUtils',
  'StorageUtils',
  'AssetManager',
  'AudioManager',
  'InputManager',
  'SceneManager',
  'Scene',
  'Entity',
  'Player',
  'Diamond',
  'Obstacle',
  'Item',
  'Enemy',
  'SnowApe',
  'ShaolinMonk',
  'RedSnake',
  'PoisonSpider',
  'SaxKnight',
  'Compass',
  'Hammer',
  'GrappleHook',
  'IceRay',
  'Dynamite',
  'Shield',
  'SpeedBoots',
  'GemBag',
  'LevelManager',
  'EnemyManager',
  'MainMenuScene',
  'GameScene',
  'LevelSelectScene',
  'SettingsScene',
  'HelpScene',
  'GameEngine',
];

const scriptOrder = [
  'js/utils/MathUtils.js',
  'js/utils/StringUtils.js',
  'js/utils/StorageUtils.js',
  'js/engine/AssetManager.js',
  'js/engine/AudioManager.js',
  'js/engine/InputManager.js',
  'js/engine/SceneManager.js',
  'js/entities/Entity.js',
  'js/entities/Player.js',
  'js/entities/Diamond.js',
  'js/entities/Obstacle.js',
  'js/entities/Item.js',
  'js/entities/enemies/Enemy.js',
  'js/entities/enemies/SnowApe.js',
  'js/entities/enemies/ShaolinMonk.js',
  'js/entities/enemies/RedSnake.js',
  'js/entities/enemies/PoisonSpider.js',
  'js/entities/enemies/SaxKnight.js',
  'js/entities/items/Compass.js',
  'js/systems/LevelManager.js',
  'js/systems/EnemyManager.js',
  'js/scenes/MainMenuScene.js',
  'js/scenes/GameScene.js',
  'js/scenes/LevelSelectScene.js',
  'js/scenes/SettingsScene.js',
  'js/scenes/HelpScene.js',
  'js/engine/GameEngine.js',
];

function installCanvasMock() {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    canvas: {},
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    imageSmoothingEnabled: false,
    filter: 'none',
    setTransform: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    drawImage: jest.fn(),
    createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  }));
}

function installAudioMock() {
  global.AudioContext = function AudioContextMock() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    this.createGain = jest.fn(() => ({
      connect: jest.fn(),
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
      },
    }));
    this.resume = jest.fn(() => Promise.resolve());
    this.close = jest.fn(() => Promise.resolve());
  };

  window.AudioContext = global.AudioContext;
  window.webkitAudioContext = global.AudioContext;
}

function loadGameScripts() {
  jest.resetModules();

  for (const key of exportedGlobals) {
    delete window[key];
    delete global[key];
  }

  installCanvasMock();
  installAudioMock();

  global.audioManager = {
    playSFX: jest.fn(),
    playSound: jest.fn(),
  };
  window.audioManager = global.audioManager;

  for (const relativePath of scriptOrder) {
    require(path.join(rootDir, relativePath));
  }

  return window;
}

module.exports = {
  loadGameScripts,
};
