const { loadGameScripts } = require('../helpers/load-game-scripts');

describe('Player', () => {
  let Player;
  let player;

  beforeEach(() => {
    Player = loadGameScripts().Player;
    player = new Player(100, 100);
    player.init();
  });

  test('initializes core player state', () => {
    expect(player.x).toBe(100);
    expect(player.y).toBe(100);
    expect(player.health).toBe(3);
    expect(player.score).toBe(0);
    expect(player.moveSpeed).toBe(3);
    expect(player.width).toBe(32);
    expect(player.height).toBe(32);
    expect(player.facingDirection).toBe('right');
  });

  test('takes damage and enters invulnerability', () => {
    player.takeDamage(1);

    expect(player.health).toBe(2);
    expect(player.invulnerable).toBe(true);
    expect(global.audioManager.playSFX).toHaveBeenCalledWith(player.sounds.hurt, 0.8);
  });

  test('collects diamonds once', () => {
    const diamond = {
      isCollected: false,
      value: 10,
      collect: jest.fn(() => {
        diamond.isCollected = true;
      }),
    };

    player.collectDiamond(diamond);
    player.collectDiamond(diamond);

    expect(player.score).toBe(10);
    expect(player.diamondsCollected).toBe(1);
    expect(diamond.collect).toHaveBeenCalledTimes(1);
  });
});
