module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 测试文件匹配模式
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.spec.js'],

  // 测试覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js', '!js/**/*.test.js', '!js/**/*.spec.js', '!js/**/node_modules/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/js/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // 忽略的文件
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/test-config.js'],

  // 禁用默认 Babel 转换（当前环境缺少 preset 依赖）
  transform: {},

  // 使用 V8 覆盖率，避免走 Babel 插桩
  coverageProvider: 'v8',

  // 模拟文件
  moduleFileExtensions: ['js', 'json', 'html'],

  // 测试超时时间
  testTimeout: 10000,

  // 详细输出
  verbose: true,

  // 强制退出
  forceExit: true,

  // 清除模拟
  clearMocks: true,

  // 恢复模拟
  restoreMocks: true,
};
