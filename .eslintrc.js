module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 代码风格
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': 'off',
    'no-console': 'warn',
    'no-debugger': 'error',

    // 最佳实践
    eqeqeq: ['error', 'always'],
    'no-implicit-globals': 'error',
    'no-magic-numbers': ['warn', {
      'ignore': [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 24, 25, 30, 32, 50, 60, 100, 180, 255, 360, 400, 500, 600, 800, 1000, 1024, 300000, 360000, 420000, 480000, 540000, 600000, 720000, 0.8]
    }],
    'prefer-const': 'error',
    'no-var': 'error',

    // 游戏特定规则
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
  },
  globals: {
    // 游戏引擎全局变量
    GameEngine: 'readonly',
    LevelManager: 'readonly',
    EnemyManager: 'readonly',
    SceneManager: 'readonly',
    InputManager: 'readonly',
    AssetManager: 'readonly',
    AudioManager: 'readonly',
    CanvasRenderingContext2D: 'readonly',
    AudioContext: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',

    // 实体类
    Player: 'readonly',
    Diamond: 'readonly',
    Entity: 'readonly',
    Item: 'readonly',
    Obstacle: 'readonly',
    Enemy: 'readonly',
    PoisonSpider: 'readonly',
    RedSnake: 'readonly',
    SaxKnight: 'readonly',
    ShaolinMonk: 'readonly',
    SnowApe: 'readonly',

    // 道具类
    Compass: 'readonly',
    Hammer: 'readonly',
    GrappleHook: 'readonly',
    IceRay: 'readonly',
    Dynamite: 'readonly',
    Shield: 'readonly',
    SpeedBoots: 'readonly',
    GemBag: 'readonly',

    // 场景类
    MainMenuScene: 'readonly',
    GameScene: 'readonly',
    LevelSelectScene: 'readonly',
    SettingsScene: 'readonly',
    HelpScene: 'readonly',

    // 工具类
    MathUtils: 'readonly',
    StringUtils: 'readonly',
    StorageUtils: 'readonly',

    // main.js 中的全局变量
    gameEngine: 'readonly',
    audioManager: 'readonly',
    levelManager: 'readonly',
    SceneManager: 'readonly',
    InputManager: 'readonly',
    AudioManager: 'readonly',
    AssetManager: 'readonly',
    LevelManager: 'readonly',
    EnemyManager: 'readonly',
    MainMenuScene: 'readonly',
    GameScene: 'readonly',
    LevelSelectScene: 'readonly',
    SettingsScene: 'readonly',
    HelpScene: 'readonly',
  },
};
