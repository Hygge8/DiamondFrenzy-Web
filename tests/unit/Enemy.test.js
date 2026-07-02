const { loadGameScripts } = require('../helpers/load-game-scripts');

describe('Enemy', () => {
  let Enemy;

  beforeEach(() => {
    Enemy = loadGameScripts().Enemy;
  });

  test('initializes through the Entity base class', () => {
    const enemy = new Enemy(10, 20);

    expect(enemy.x).toBe(10);
    expect(enemy.y).toBe(20);
    expect(enemy.width).toBe(32);
    expect(enemy.height).toBe(32);
    expect(enemy.isActive).toBe(true);
    expect(enemy.isVisible).toBe(true);
  });

  test('takes damage and dies at zero health', () => {
    const enemy = new Enemy(0, 0);

    enemy.takeDamage(100);

    expect(enemy.health).toBe(0);
    expect(enemy.isDead).toBe(true);
    expect(enemy.active).toBe(false);
  });
});
