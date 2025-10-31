/**
 * 游戏引擎单元测试
 * Unit tests for GameEngine
 */

const GameEngine = require('../../src/scripts/engine/GameEngine');

describe('GameEngine', () => {
    let engine;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        mockContext = {
            fillStyle: '',
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn()
        };
        
        mockCanvas = {
            getContext: jest.fn().mockReturnValue(mockContext),
            width: 800,
            height: 600,
            style: {}
        };

        // 模拟requestAnimationFrame
        global.requestAnimationFrame = jest.fn().mockImplementation((cb) => {
            setTimeout(cb, 16);
            return 1;
        });
        
        global.cancelAnimationFrame = jest.fn();

        engine = new GameEngine(mockCanvas);
    });

    afterEach(() => {
        jest.clearAllMocks();
        if (engine.running) {
            engine.stop();
        }
    });

    describe('初始化', () => {
        test('应该正确初始化引擎属性', () => {
            expect(engine.canvas).toBe(mockCanvas);
            expect(engine.context).toBe(mockContext);
            expect(engine.width).toBe(800);
            expect(engine.height).toBe(600);
            expect(engine.running).toBe(false);
            expect(engine.fps).toBe(60);
            expect(engine.entities).toEqual([]);
        });

        test('应该设置默认配置', () => {
            expect(engine.config).toBeDefined();
            expect(engine.config.targetFPS).toBe(60);
            expect(engine.config.maxDeltaTime).toBe(100);
        });
    });

    describe('游戏循环控制', () => {
        test('应该能够启动游戏', () => {
            engine.start();
            expect(engine.running).toBe(true);
            expect(global.requestAnimationFrame).toHaveBeenCalled();
        });

        test('应该能够停止游戏', () => {
            engine.start();
            engine.stop();
            expect(engine.running).toBe(false);
            expect(global.cancelAnimationFrame).toHaveBeenCalled();
        });

        test('重复启动应该不重复初始化', () => {
            engine.start();
            const initialRAFCalls = global.requestAnimationFrame.mock.calls.length;
            engine.start();
            expect(global.requestAnimationFrame.mock.calls.length).toBe(initialRAFCalls);
        });
    });

    describe('实体管理', () => {
        test('应该能够添加实体', () => {
            const entity = {
                id: 'test-entity',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity);
            expect(engine.entities).toContain(entity);
            expect(engine.entities.length).toBe(1);
        });

        test('应该能够移除实体', () => {
            const entity = {
                id: 'test-entity',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity);
            engine.removeEntity(entity);
            expect(engine.entities).not.toContain(entity);
            expect(engine.entities.length).toBe(0);
        });

        test('应该能够通过ID移除实体', () => {
            const entity = {
                id: 'test-entity',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity);
            engine.removeEntityById('test-entity');
            expect(engine.entities).not.toContain(entity);
        });

        test('应该能够获取实体', () => {
            const entity = {
                id: 'test-entity',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity);
            const found = engine.getEntity('test-entity');
            expect(found).toBe(entity);
        });

        test('应该过滤非活跃实体', () => {
            const activeEntity = {
                id: 'active',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            const inactiveEntity = {
                id: 'inactive',
                update: jest.fn(),
                render: jest.fn(),
                isActive: false
            };
            
            engine.addEntity(activeEntity);
            engine.addEntity(inactiveEntity);
            
            engine.update(16);
            
            // 非活跃实体不应该被更新
            expect(inactiveEntity.update).not.toHaveBeenCalled();
        });
    });

    describe('游戏循环', () => {
        test('应该正确执行游戏循环', async () => {
            const entity = {
                id: 'test-entity',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity);
            engine.start();
            
            // 等待一帧
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(entity.update).toHaveBeenCalled();
            expect(mockContext.clearRect).toHaveBeenCalled();
            expect(entity.render).toHaveBeenCalled();
        });

        test('应该计算正确的FPS', async () => {
            engine.start();
            
            // 等待几帧
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(engine.fps).toBeGreaterThan(0);
            expect(engine.frameCount).toBeGreaterThan(0);
        });

        test('应该处理delta时间', async () => {
            const entity = {
                id: 'test-entity',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity);
            engine.start();
            
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(entity.update).toHaveBeenCalledWith(expect.any(Number));
        });
    });

    describe('渲染系统', () => {
        test('应该清空画布', () => {
            engine.render();
            
            expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
        });

        test('应该渲染所有活跃实体', () => {
            const entity1 = {
                id: 'entity1',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            const entity2 = {
                id: 'entity2',
                update: jest.fn(),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(entity1);
            engine.addEntity(entity2);
            
            engine.render();
            
            expect(entity1.render).toHaveBeenCalledWith(mockContext);
            expect(entity2.render).toHaveBeenCalledWith(mockContext);
        });

        test('不应该渲染非活跃实体', () => {
            const inactiveEntity = {
                id: 'inactive',
                update: jest.fn(),
                render: jest.fn(),
                isActive: false
            };
            
            engine.addEntity(inactiveEntity);
            engine.render();
            
            expect(inactiveEntity.render).not.toHaveBeenCalled();
        });
    });

    describe('性能监控', () => {
        test('应该跟踪帧数', async () => {
            const initialFrameCount = engine.frameCount;
            engine.start();
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(engine.frameCount).toBeGreaterThan(initialFrameCount);
        });

        test('应该计算平均FPS', () => {
            engine.frameCount = 60;
            engine.elapsedTime = 1000; // 1秒
            
            const avgFPS = engine.getAverageFPS();
            expect(avgFPS).toBe(60);
        });

        test('应该检测性能问题', () => {
            // 模拟低FPS情况
            engine.fps = 30;
            
            const hasPerformanceIssues = engine.hasPerformanceIssues();
            expect(hasPerformanceIssues).toBe(true);
        });
    });

    describe('事件系统', () => {
        test('应该能够添加事件监听器', () => {
            const callback = jest.fn();
            engine.addEventListener('test-event', callback);
            
            expect(engine.eventListeners['test-event']).toContain(callback);
        });

        test('应该能够移除事件监听器', () => {
            const callback = jest.fn();
            engine.addEventListener('test-event', callback);
            engine.removeEventListener('test-event', callback);
            
            expect(engine.eventListeners['test-event']).not.toContain(callback);
        });

        test('应该能够触发事件', () => {
            const callback = jest.fn();
            engine.addEventListener('test-event', callback);
            
            engine.triggerEvent('test-event', { data: 'test' });
            
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });
    });

    describe('资源管理', () => {
        test('应该能够加载资源', async () => {
            const resource = { src: 'test-image.png' };
            const loadPromise = Promise.resolve(resource);
            
            engine.loadResource = jest.fn().mockReturnValue(loadPromise);
            
            const result = await engine.loadResource(resource);
            expect(result).toBe(resource);
        });

        test('应该能够批量加载资源', async () => {
            const resources = [
                { src: 'image1.png' },
                { src: 'image2.png' }
            ];
            
            engine.loadResource = jest.fn().mockImplementation((res) => 
                Promise.resolve(res)
            );
            
            const results = await engine.loadResources(resources);
            expect(results).toHaveLength(2);
        });
    });

    describe('边界情况', () => {
        test('应该处理无效的canvas', () => {
            expect(() => {
                new GameEngine(null);
            }).not.toThrow();
        });

        test('应该处理空的实体列表', () => {
            engine.render();
            expect(mockContext.clearRect).toHaveBeenCalled();
        });

        test('应该处理异常情况', () => {
            const faultyEntity = {
                id: 'faulty',
                update: jest.fn().mockImplementation(() => {
                    throw new Error('Update failed');
                }),
                render: jest.fn(),
                isActive: true
            };
            
            engine.addEntity(faultyEntity);
            
            // 不应该抛出错误，而应该记录错误
            expect(() => {
                engine.update(16);
            }).not.toThrow();
        });
    });
});