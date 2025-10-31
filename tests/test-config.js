/**
 * 钻石狂潮网页版 - 测试配置
 * Test Configuration for Diamond Frenzy Web
 */

// 测试环境配置
const testConfig = {
    // 测试超时时间
    timeout: 5000,
    
    // Canvas测试配置
    canvas: {
        width: 800,
        height: 600,
        backgroundColor: '#000000'
    },
    
    // 游戏测试配置
    game: {
        playerSpeed: 1,
        enemySpeed: 0.5,
        diamondValue: 10,
        maxHealth: 100
    },
    
    // 模拟对象
    mocks: {
        localStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        AudioContext: {
            prototype: {
                createGain: jest.fn(),
                createOscillator: jest.fn(),
                currentTime: 0
            }
        }
    }
};

// Jest DOM测试环境配置
global.testConfig = testConfig;

// 模拟浏览器API
global.localStorage = testConfig.mocks.localStorage;

// 模拟Canvas
global.CanvasRenderingContext2D = function() {
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 1;
    this.font = '';
    
    this.fillRect = jest.fn();
    this.strokeRect = jest.fn();
    this.clearRect = jest.fn();
    this.beginPath = jest.fn();
    this.arc = jest.fn();
    this.fill = jest.fn();
    this.stroke = jest.fn();
    this.save = jest.fn();
    this.restore = jest.fn();
    this.translate = jest.fn();
    this.rotate = jest.fn();
    this.scale = jest.fn();
};

// 模拟AudioContext
global.AudioContext = function() {
    this.currentTime = 0;
    this.createGain = jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        gain: { value: 1 }
    });
    this.createOscillator = jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 440 }
    });
};

// 模拟requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation((callback) => {
    return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn();

// 模拟console以减少测试输出噪音
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

module.exports = testConfig;