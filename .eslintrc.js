module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 代码风格
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'no-implicit-globals': 'error',
    'no-magic-numbers': ['warn', { 'ignore': [0, 1, -1, 2] }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 游戏特定规则
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
  },
  globals: {
    // 游戏引擎全局变量
    'GameEngine': 'readonly',
    'CanvasRenderingContext2D': 'readonly',
    'AudioContext': 'readonly',
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
  },
};