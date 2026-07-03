const { loadGameScripts } = require('../helpers/load-game-scripts');

function makeKeyEvent(type, options) {
  return new window.KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

describe('InputManager', () => {
  test('captures movement keys while a menu button still has focus in game view', () => {
    const { InputManager } = loadGameScripts();

    document.body.innerHTML = `
      <button id="start-game">Start</button>
      <div id="game-screen" class="screen active">
        <canvas id="game-canvas" tabindex="0"></canvas>
      </div>
    `;

    const input = new InputManager();
    const button = document.getElementById('start-game');
    button.focus();

    const keydown = makeKeyEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' });
    const result = button.dispatchEvent(keydown);

    expect(result).toBe(false);
    expect(keydown.defaultPrevented).toBe(true);
    expect(input.isKeyDown('ArrowRight')).toBe(true);

    const keyup = makeKeyEvent('keyup', { code: 'ArrowRight', key: 'ArrowRight' });
    button.dispatchEvent(keyup);

    expect(input.isKeyDown('ArrowRight')).toBe(false);
  });

  test('does not intercept editable controls outside the active game view', () => {
    const { InputManager } = loadGameScripts();

    document.body.innerHTML = `
      <div id="game-screen" class="screen"></div>
      <input id="setting-input" />
    `;

    const input = new InputManager();
    const field = document.getElementById('setting-input');
    field.focus();

    const keydown = makeKeyEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' });
    const result = field.dispatchEvent(keydown);

    expect(result).toBe(true);
    expect(keydown.defaultPrevented).toBe(false);
    expect(input.isKeyDown('ArrowRight')).toBe(false);
  });
});
