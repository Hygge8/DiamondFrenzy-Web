(function () {
var Player = window.Player;

class LevelManager {
  constructor() {
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.levels = [];
    this.worlds = {};

    this.isLevelLoaded = false;
    this.isLevelCompleted = false;
    this.isLevelFailed = false;
    this.levelStartTime = 0;
    this.levelElapsedTime = 0;

    this.entities = [];
    this.player = null;
    this.diamonds = [];
    this.obstacles = [];
    this.enemies = [];
    this.items = [];

    this.enemyManager = null;
    this.gameState = null;
    this.onLevelLoad = null;
    this.onLevelComplete = null;
    this.onLevelFail = null;

    this.grid = [];
    this.tileSize = 40;
    this.gridCols = 20;
    this.gridRows = 15;
    this.playerGrid = { col: 1, row: 1 };
    this.playerStartGrid = { col: 1, row: 1 };
    this.exitGrid = { col: 18, row: 1 };
    this.moveCooldown = 0;
    this.rockTimer = 0;
    this.enemyTimer = 0;
    this.message = '';
    this.messageTimer = 0;

    this._loadLevelData();
  }

  _loadLevelData() {
    this._createSampleLevels();
  }

  _createSampleLevels() {
    this.worlds.angkor_wat = {
      name: 'Angkor Wat',
      description: 'Ancient temple ruins with dirt tunnels, gems, snakes, and falling stones.',
      levels: [
        this._buildLevel({
          id: 1,
          name: 'Angkor Wat - Entry Temple',
          world: 'angkor_wat',
          timeLimit: 300000,
          map: [
            '####################',
            '#P.D.R....D...E....#',
            '#.###.######.###...#',
            '#...#....D...#.....#',
            '###.#.#######.#.####',
            '#...#...R.....#....#',
            '#.#####.#####.###..#',
            '#.....#...S...#....#',
            '#.D.#.###.###.#.D..#',
            '#...#.....R...#....#',
            '#.###.#######.#.#..#',
            '#.....H...D.....#..#',
            '#.###########.###..#',
            '#..................#',
            '####################',
          ],
        }),
        this._buildLevel({
          id: 2,
          name: 'Angkor Wat - Hidden Passage',
          world: 'angkor_wat',
          timeLimit: 360000,
          map: [
            '####################',
            '#P..D....R....D..E#',
            '#.######.#####.##.#',
            '#....H...#...D....#',
            '####.###.#.#####.##',
            '#D...#...#.....#..#',
            '#.##.#.#####.###..#',
            '#....#...S...R....#',
            '#.######.#####.####',
            '#......D.....#....#',
            '###.########.#.##.#',
            '#....R....D...#...#',
            '#.#############.#.#',
            '#...............#.#',
            '####################',
          ],
        }),
      ],
    };

    this.worlds.bavaria = {
      name: 'Bavaria',
      description: 'Dungeon rooms with tighter corridors and heavier boulders.',
      levels: [
        this._buildLevel({
          id: 3,
          name: 'Bavaria - Dungeon Gate',
          world: 'bavaria',
          timeLimit: 390000,
          map: [
            '####################',
            '#P..D....R....E...#',
            '#.###.###########.#',
            '#...#....H....D...#',
            '###.#.####.#####.##',
            '#...#....#.....#..#',
            '#.######.#.###.#..#',
            '#....D...#..S..#..#',
            '#.########.###.#.##',
            '#......R.....#....#',
            '###.######.###.##.#',
            '#....D......R.....#',
            '#.###############.#',
            '#................D#',
            '####################',
          ],
        }),
      ],
    };

    this.worlds.tibet = {
      name: 'Tibet',
      description: 'Snow cave layout with longer routes and exposed rock traps.',
      levels: [
        this._buildLevel({
          id: 4,
          name: 'Tibet - Snow Cave',
          world: 'tibet',
          timeLimit: 420000,
          map: [
            '####################',
            '#P....D......R.E..#',
            '#.#######.#####.#.#',
            '#.....H...#...D.#.#',
            '###.#####.#.###.#.#',
            '#...#.....#...#...#',
            '#.#.#.#######.###.#',
            '#.#...D..S....#...#',
            '#.###########.#.###',
            '#....R.....D..#...#',
            '####.#######.###..#',
            '#....#.....R......#',
            '#.##.#.##########.#',
            '#D.................#',
            '####################',
          ],
        }),
      ],
    };

    Object.values(this.worlds).forEach(world => {
      this.levels.push(...world.levels);
    });
  }

  _buildLevel(data) {
    const width = 800;
    const height = 600;
    const grid = this._normalizeMap(data.map, 20);
    const targetDiamonds = grid.reduce((total, row) => {
      return total + Array.from(row).filter(tile => tile === 'D').length;
    }, 0);

    return {
      ...data,
      width,
      height,
      grid,
      targetDiamonds,
      tileSize: Math.floor(Math.min(width / grid[0].length, height / grid.length)),
    };
  }

  _normalizeMap(rows, width) {
    return rows.map((row, index) => {
      if (row.length === width) return row;

      if (row.length < width && row.endsWith('#')) {
        return `${row.slice(0, -1)}${'.'.repeat(width - row.length)}#`;
      }

      throw new Error(`Invalid map row ${index}: expected ${width}, got ${row.length}`);
    });
  }

  async loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= this.levels.length) {
      console.error(`Invalid level index: ${levelIndex}`);
      return false;
    }

    try {
      this._clearCurrentLevel();

      this.currentLevelIndex = levelIndex;
      this.currentLevel = this.levels[levelIndex];
      this.tileSize = this.currentLevel.tileSize;
      this.gridRows = this.currentLevel.grid.length;
      this.gridCols = this.currentLevel.grid[0].length;
      this.grid = this.currentLevel.grid.map(row => Array.from(row));

      this._parseGridObjects();
      this._createPlayer();
      this._refreshEntities();

      this.isLevelLoaded = true;
      this.isLevelCompleted = false;
      this.isLevelFailed = false;
      this.levelStartTime = Date.now();
      this.levelElapsedTime = 0;
      this.moveCooldown = 0;
      this.rockTimer = 0;
      this.enemyTimer = 0;
      this.message = 'Collect every diamond, then reach the exit.';
      this.messageTimer = 2600;

      if (this.onLevelLoad) {
        this.onLevelLoad(this.currentLevel);
      }

      return true;
    } catch (error) {
      console.error('Failed to load level:', error);
      console.error(error.stack);
      return false;
    }
  }

  _parseGridObjects() {
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const tile = this.grid[row][col];

        if (tile === 'P') {
          this.playerStartGrid = { col, row };
          this.playerGrid = { col, row };
          this.grid[row][col] = ' ';
        } else if (tile === 'D') {
          this.diamonds.push(this._makeGridObject('diamond', col, row, { value: 100 }));
          this.grid[row][col] = ' ';
        } else if (tile === 'R') {
          this.obstacles.push(this._makeGridObject('boulder', col, row, { obstacleType: 'rock' }));
        } else if (tile === 'S') {
          this.enemies.push(this._makeGridObject('snake', col, row, { direction: 1 }));
          this.grid[row][col] = ' ';
        } else if (tile === 'H') {
          this.items.push(this._makeGridObject('hammer', col, row, {
            itemType: 'hammer',
            name: 'Hammer',
            quantity: 1,
          }));
          this.grid[row][col] = ' ';
        } else if (tile === 'E') {
          this.exitGrid = { col, row };
        }
      }
    }
  }

  _createPlayer() {
    const start = this.playerStartGrid;
    const x = this._gridToPixelX(start.col, 32);
    const y = this._gridToPixelY(start.row, 32);

    if (Player) {
      this.player = new Player(x, y);
      this.player.init();
    } else {
      this.player = this._makeFallbackPlayer(x, y);
    }

    this.player.width = 32;
    this.player.height = 32;
    this.player.gridCol = start.col;
    this.player.gridRow = start.row;
    this.player.totalDiamonds = this.currentLevel.targetDiamonds;
    this.player.diamondsCollected = 0;
    this.player.score = 0;
    this.player.keys = 0;
    this.player.inventory = [];
    this.player.selectedItemIndex = 0;
    this.player.maxInventorySize = this.player.maxInventorySize || 8;
    this.player.energy = this.player.energy || 100;
    this.player.maxEnergy = this.player.maxEnergy || 100;
    this.player.facingDirection = 'right';
    this.player.invulnerable = false;
    this.player.invulnerabilityTimer = 0;
  }

  _makeFallbackPlayer(x, y) {
    return {
      x,
      y,
      width: 32,
      height: 32,
      health: 3,
      maxHealth: 3,
      score: 0,
      diamondsCollected: 0,
      totalDiamonds: 0,
      keys: 0,
      inventory: [],
      selectedItemIndex: 0,
      maxInventorySize: 8,
      energy: 100,
      maxEnergy: 100,
      isActive: true,
      isVisible: true,
      isDead: false,
      getHealthPercentage() {
        return this.health / this.maxHealth;
      },
      getEnergyPercentage() {
        return this.energy / this.maxEnergy;
      },
      getPlayerState() {
        return { ...this };
      },
      selectItem(index) {
        if (index >= 0 && index < this.inventory.length) this.selectedItemIndex = index;
      },
      addItem(item) {
        this.inventory.push(item);
        return true;
      },
    };
  }

  initEnemyManager(enemyManager) {
    this.enemyManager = enemyManager;
    if (this.gameState && this.enemyManager) {
      this.enemyManager.setGameState(this.gameState);
    }
  }

  setGameState(gameState) {
    this.gameState = gameState;
    if (this.enemyManager) {
      this.enemyManager.setGameState(gameState);
    }
  }

  getGameState() {
    return this.gameState;
  }

  update(deltaTime) {
    if (!this.isLevelLoaded || this.isLevelCompleted || this.isLevelFailed) return;

    this.levelElapsedTime = Date.now() - this.levelStartTime;
    this.moveCooldown = Math.max(0, this.moveCooldown - deltaTime);
    this.rockTimer += deltaTime;
    this.enemyTimer += deltaTime;
    this.messageTimer = Math.max(0, this.messageTimer - deltaTime);

    this._updatePlayerStatus(deltaTime);
    this._handleInput();

    if (this.rockTimer >= 240) {
      this.rockTimer = 0;
      this._updateBoulders();
    }

    if (this.enemyTimer >= 430) {
      this.enemyTimer = 0;
      this._updateEnemies();
    }

    if (this.currentLevel.timeLimit && this.levelElapsedTime >= this.currentLevel.timeLimit) {
      this._failLevel('time_limit');
    }
  }

  _updatePlayerStatus(deltaTime) {
    if (!this.player) return;

    if (this.player.invulnerable) {
      this.player.invulnerabilityTimer -= deltaTime;
      if (this.player.invulnerabilityTimer <= 0) {
        this.player.invulnerable = false;
        this.player.invulnerabilityTimer = 0;
      }
    }
  }

  _handleInput() {
    const input = this.gameState?.inputManager;
    if (!input || this.moveCooldown > 0) return;

    if (this._isInputActive(input, 'Digit1')) {
      this.player.selectItem?.(0);
    }

    if (this._isInputActive(input, 'Space')) {
      if (this._useSelectedTool()) {
        this.moveCooldown = 160;
      }
      return;
    }

    const direction = this._readMoveDirection(input);
    if (direction) {
      this.movePlayer(direction.dx, direction.dy);
      this.moveCooldown = 135;
    }
  }

  _readMoveDirection(input) {
    if (this._isInputActive(input, 'ArrowUp') || this._isInputActive(input, 'KeyW')) return { dx: 0, dy: -1 };
    if (this._isInputActive(input, 'ArrowDown') || this._isInputActive(input, 'KeyS')) return { dx: 0, dy: 1 };
    if (this._isInputActive(input, 'ArrowLeft') || this._isInputActive(input, 'KeyA')) return { dx: -1, dy: 0 };
    if (this._isInputActive(input, 'ArrowRight') || this._isInputActive(input, 'KeyD')) return { dx: 1, dy: 0 };
    return null;
  }

  _isInputActive(input, code) {
    return input.isKeyPressed?.(code) || input.isKeyDown(code);
  }

  movePlayer(dx, dy) {
    if (!this.player || this.player.isDead || this.isLevelCompleted) return false;

    const targetCol = this.playerGrid.col + dx;
    const targetRow = this.playerGrid.row + dy;
    const targetTile = this._getTile(targetCol, targetRow);

    if (dx < 0) this.player.facingDirection = 'left';
    if (dx > 0) this.player.facingDirection = 'right';

    if (targetTile === null || targetTile === '#') {
      this._setMessage('Solid wall.');
      return false;
    }

    if (targetTile === 'R') {
      if (dy === 0 && this._pushBoulder(targetCol, targetRow, dx)) {
        this._setPlayerGridPosition(targetCol, targetRow);
        return true;
      }

      this._setMessage('Boulder blocks the way.');
      return false;
    }

    if (targetTile === 'E' && !this._isExitUnlocked()) {
      this._setMessage('The exit opens after every diamond is collected.');
      return false;
    }

    if (targetTile === '.') {
      this._setTile(targetCol, targetRow, ' ');
      this.player.score += 1;
    }

    this._setPlayerGridPosition(targetCol, targetRow);
    this._collectObjectsAt(targetCol, targetRow);

    if (targetTile === 'E' && this._isExitUnlocked()) {
      this._completeLevel();
    }

    return true;
  }

  _pushBoulder(col, row, dx) {
    const nextCol = col + dx;
    const nextRow = row;

    if (!this._isOpenForBoulder(nextCol, nextRow)) return false;

    const boulder = this._findBoulderAt(col, row);
    if (!boulder) return false;

    this._setTile(col, row, ' ');
    this._setTile(nextCol, nextRow, 'R');
    boulder.col = nextCol;
    boulder.row = nextRow;
    this._syncObjectPixel(boulder);
    this._setMessage('Boulder pushed.');
    return true;
  }

  _useSelectedTool() {
    const selected = this.player.inventory?.[this.player.selectedItemIndex];
    if (!selected || selected.type !== 'hammer') {
      this._setMessage('No hammer selected.');
      return false;
    }

    const facing = this.player.facingDirection === 'left' ? -1 : 1;
    const targetCol = this.playerGrid.col + facing;
    const targetRow = this.playerGrid.row;
    const tile = this._getTile(targetCol, targetRow);

    if (tile === 'R') {
      const boulder = this._findBoulderAt(targetCol, targetRow);
      if (boulder) {
        boulder.isActive = false;
        boulder.isDead = true;
      }
      this._setTile(targetCol, targetRow, ' ');
      this.player.score += 25;
      this._setMessage('Hammer broke the boulder.');
      return true;
    }

    if (tile === '.') {
      this._setTile(targetCol, targetRow, ' ');
      this.player.score += 1;
      return true;
    }

    this._setMessage('Hammer needs dirt or a boulder.');
    return false;
  }

  _collectObjectsAt(col, row) {
    const diamond = this.diamonds.find(item => item.col === col && item.row === row && !item.isCollected);
    if (diamond) {
      diamond.isCollected = true;
      diamond.isActive = false;
      diamond.isDead = true;
      this.player.diamondsCollected++;
      this.player.score += diamond.value;

      if (window.audioManager) {
        window.audioManager.playSFX?.('collect_diamond.wav', 0.7);
      }

      if (this._isExitUnlocked()) {
        this._setMessage('All diamonds collected. Find the exit.');
      }
    }

    const item = this.items.find(entry => entry.col === col && entry.row === row && entry.isActive);
    if (item) {
      item.isActive = false;
      item.isDead = true;
      this.player.addItem?.({
        type: item.itemType,
        itemType: item.itemType,
        name: item.name,
        quantity: item.quantity || 1,
        cooldown: 0,
        use: () => true,
      });
      this._setMessage(`${item.name} collected.`);
    }

    const enemy = this.enemies.find(entry => entry.col === col && entry.row === row && entry.isActive);
    if (enemy) {
      this._damagePlayer(1, 'enemy');
    }
  }

  _updateBoulders() {
    const activeBoulders = this.obstacles
      .filter(boulder => boulder.isActive && !boulder.isDead)
      .sort((a, b) => b.row - a.row);

    activeBoulders.forEach(boulder => {
      const belowCol = boulder.col;
      const belowRow = boulder.row + 1;

      if (this._isPlayerAt(belowCol, belowRow)) {
        this._damagePlayer(1, 'boulder');
        return;
      }

      if (!this._isOpenForBoulder(belowCol, belowRow)) return;

      this._setTile(boulder.col, boulder.row, ' ');
      this._setTile(belowCol, belowRow, 'R');
      boulder.col = belowCol;
      boulder.row = belowRow;
      this._syncObjectPixel(boulder);
    });
  }

  _updateEnemies() {
    this.enemies.forEach(enemy => {
      if (!enemy.isActive || enemy.isDead) return;

      if (this._isPlayerAt(enemy.col, enemy.row)) {
        this._damagePlayer(1, 'enemy');
        return;
      }

      const nextCol = enemy.col + enemy.direction;
      const nextRow = enemy.row;

      if (this._isPlayerAt(nextCol, nextRow)) {
        enemy.col = nextCol;
        this._syncObjectPixel(enemy);
        this._damagePlayer(1, 'enemy');
        return;
      }

      if (this._isOpenForEnemy(nextCol, nextRow)) {
        enemy.col = nextCol;
        this._syncObjectPixel(enemy);
      } else {
        enemy.direction *= -1;
      }
    });
  }

  render(ctx) {
    if (!this.isLevelLoaded) return;

    ctx.save();
    const canvasWidth = ctx.canvas?.width || this.currentLevel.width;
    const canvasHeight = ctx.canvas?.height || this.currentLevel.height;
    ctx.scale(canvasWidth / this.currentLevel.width, canvasHeight / this.currentLevel.height);

    this._renderBackground(ctx);
    this._renderGrid(ctx);
    this._renderDiamonds(ctx);
    this._renderItems(ctx);
    this._renderBoulders(ctx);
    this._renderEnemies(ctx);
    this._renderPlayer(ctx);
    this._renderStatusText(ctx);

    ctx.restore();
  }

  _renderBackground(ctx) {
    const colors = {
      angkor_wat: ['#2a1d12', '#4b3522'],
      bavaria: ['#15191d', '#2b343d'],
      tibet: ['#172433', '#dbe8f0'],
    };
    const palette = colors[this.currentLevel.world] || ['#121212', '#242424'];
    const gradient = ctx.createLinearGradient(0, 0, 0, this.currentLevel.height);
    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(1, palette[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.currentLevel.width, this.currentLevel.height);
  }

  _renderGrid(ctx) {
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        this._renderTile(ctx, col, row, this.grid[row][col]);
      }
    }
  }

  _renderTile(ctx, col, row, tile) {
    const x = col * this.tileSize;
    const y = row * this.tileSize;

    if (tile === '#') {
      ctx.fillStyle = this.currentLevel.world === 'tibet' ? '#8fa5b5' : '#655141';
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.strokeRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x + 4, y + 7, this.tileSize - 8, 3);
      return;
    }

    if (tile === '.') {
      ctx.fillStyle = this.currentLevel.world === 'tibet' ? '#c6d2d8' : '#7a5531';
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(x + 5, y + 8, 8, 4);
      ctx.fillRect(x + 23, y + 23, 10, 5);
    } else {
      ctx.fillStyle = this.currentLevel.world === 'bavaria' ? '#2a2520' : '#2b2118';
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }

    if (tile === 'E') {
      const unlocked = this._isExitUnlocked();
      ctx.fillStyle = unlocked ? '#1f8f58' : '#59344a';
      ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
      ctx.strokeStyle = unlocked ? '#6df0a3' : '#c486a2';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 8, y + 8, this.tileSize - 16, this.tileSize - 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(unlocked ? 'EXIT' : 'LOCK', x + this.tileSize / 2, y + 24);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1);
  }

  _renderDiamonds(ctx) {
    this.diamonds.forEach(diamond => {
      if (diamond.isCollected || diamond.isDead) return;

      const cx = diamond.x + this.tileSize / 2;
      const cy = diamond.y + this.tileSize / 2;
      ctx.fillStyle = '#42d9ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13);
      ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx, cy + 15);
      ctx.lineTo(cx - 13, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e7fbff';
      ctx.fillRect(cx - 3, cy - 8, 6, 5);
    });
  }

  _renderItems(ctx) {
    this.items.forEach(item => {
      if (!item.isActive || item.isDead) return;

      const x = item.x;
      const y = item.y;
      ctx.fillStyle = '#d9b35f';
      ctx.fillRect(x + 9, y + 9, 22, 8);
      ctx.fillStyle = '#7a5130';
      ctx.fillRect(x + 19, y + 13, 5, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('H', x + 20, y + 36);
    });
  }

  _renderBoulders(ctx) {
    this.obstacles.forEach(boulder => {
      if (!boulder.isActive || boulder.isDead) return;

      const cx = boulder.x + this.tileSize / 2;
      const cy = boulder.y + this.tileSize / 2;
      ctx.fillStyle = '#716c66';
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.stroke();
    });
  }

  _renderEnemies(ctx) {
    this.enemies.forEach(enemy => {
      if (!enemy.isActive || enemy.isDead) return;

      const x = enemy.x;
      const y = enemy.y;
      ctx.fillStyle = '#ba2737';
      ctx.fillRect(x + 7, y + 18, 26, 8);
      ctx.fillRect(x + (enemy.direction > 0 ? 25 : 6), y + 14, 8, 8);
      ctx.fillStyle = '#ffe9a6';
      ctx.fillRect(x + (enemy.direction > 0 ? 30 : 8), y + 16, 2, 2);
    });
  }

  _renderPlayer(ctx) {
    if (!this.player || this.player.isDead) return;

    ctx.save();
    if (this.player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const x = this.player.x;
    const y = this.player.y;
    ctx.fillStyle = '#c99645';
    ctx.fillRect(x + 7, y + 6, 18, 8);
    ctx.fillStyle = '#8a5d2a';
    ctx.fillRect(x + 5, y + 12, 22, 15);
    ctx.fillStyle = '#f0c18a';
    ctx.fillRect(x + 10, y + 10, 12, 10);
    ctx.fillStyle = '#263238';
    ctx.fillRect(x + (this.player.facingDirection === 'left' ? 11 : 18), y + 14, 3, 3);
    ctx.fillStyle = '#29475f';
    ctx.fillRect(x + 9, y + 24, 14, 6);
    ctx.restore();
  }

  _renderStatusText(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(8, 8, 300, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.currentLevel.name, 18, 25);
    ctx.fillText(`Diamonds ${this.player.diamondsCollected}/${this.player.totalDiamonds}`, 18, 42);

    if (this.message && this.messageTimer > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(250, 552, 300, 32);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(this.message, 400, 573);
    }
    ctx.restore();
  }

  _damagePlayer(amount, source) {
    if (!this.player || this.player.invulnerable || this.player.isDead) return;

    this.player.health = Math.max(0, this.player.health - amount);
    this.player.invulnerable = true;
    this.player.invulnerabilityTimer = 900;

    if (window.audioManager) {
      window.audioManager.playSFX?.('player_hurt.wav', 0.8);
    }

    if (this.player.health <= 0) {
      this.player.isDead = true;
      this.player.isActive = false;
      this._failLevel(source || 'damage');
      return;
    }

    this._setMessage(source === 'boulder' ? 'A falling boulder hit you.' : 'Enemy hit you.');
    this._setPlayerGridPosition(this.playerStartGrid.col, this.playerStartGrid.row);
  }

  _completeLevel() {
    if (this.isLevelCompleted) return;

    this.isLevelCompleted = true;

    if (window.audioManager) {
      window.audioManager.playSFX?.('level_complete.wav', 0.8);
    }

    if (this.onLevelComplete) {
      this.onLevelComplete({
        level: this.currentLevel,
        score: this.player.score,
        time: this.levelElapsedTime,
        diamonds: this.player.diamondsCollected,
      });
    }
  }

  _failLevel(reason = 'failed') {
    if (this.isLevelCompleted || this.isLevelFailed) return;

    this.isLevelFailed = true;

    if (this.onLevelFail) {
      this.onLevelFail({
        level: this.currentLevel,
        reason,
      });
    }
  }

  _isExitUnlocked() {
    return this.player?.diamondsCollected >= this.currentLevel?.targetDiamonds;
  }

  _setPlayerGridPosition(col, row) {
    this.playerGrid = { col, row };
    this.player.gridCol = col;
    this.player.gridRow = row;
    this.player.x = this._gridToPixelX(col, this.player.width || 32);
    this.player.y = this._gridToPixelY(row, this.player.height || 32);
  }

  _makeGridObject(type, col, row, extra = {}) {
    const object = {
      id: `${type}_${col}_${row}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      col,
      row,
      x: col * this.tileSize,
      y: row * this.tileSize,
      width: this.tileSize,
      height: this.tileSize,
      isActive: true,
      isVisible: true,
      isDead: false,
      isCollidable: true,
      isCollected: false,
      ...extra,
      getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
      },
      getCollisionBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
      },
      getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
      },
      getDistance(other) {
        const a = this.getCenter();
        const b = other.getCenter ? other.getCenter() : {
          x: other.x + other.width / 2,
          y: other.y + other.height / 2,
        };
        return Math.hypot(a.x - b.x, a.y - b.y);
      },
    };

    return object;
  }

  _refreshEntities() {
    this.entities = [
      ...this.diamonds,
      ...this.obstacles,
      ...this.items,
      ...this.enemies,
    ];
  }

  _syncObjectPixel(object) {
    object.x = object.col * this.tileSize;
    object.y = object.row * this.tileSize;
  }

  _gridToPixelX(col, width) {
    return col * this.tileSize + Math.floor((this.tileSize - width) / 2);
  }

  _gridToPixelY(row, height) {
    return row * this.tileSize + Math.floor((this.tileSize - height) / 2);
  }

  _getTile(col, row) {
    if (col < 0 || row < 0 || col >= this.gridCols || row >= this.gridRows) {
      return null;
    }
    return this.grid[row][col];
  }

  _setTile(col, row, tile) {
    if (this._getTile(col, row) === null) return;
    this.grid[row][col] = tile;
  }

  _findBoulderAt(col, row) {
    return this.obstacles.find(boulder => {
      return boulder.col === col && boulder.row === row && boulder.isActive && !boulder.isDead;
    });
  }

  _isPlayerAt(col, row) {
    return this.playerGrid.col === col && this.playerGrid.row === row;
  }

  _isOpenForBoulder(col, row) {
    const tile = this._getTile(col, row);
    if (tile !== ' ') return false;
    if (this._isPlayerAt(col, row)) return true;
    if (this.diamonds.some(item => item.col === col && item.row === row && !item.isCollected)) return false;
    if (this.items.some(item => item.col === col && item.row === row && item.isActive)) return false;
    if (this.enemies.some(item => item.col === col && item.row === row && item.isActive)) return false;
    return true;
  }

  _isOpenForEnemy(col, row) {
    const tile = this._getTile(col, row);
    if (tile !== ' ') return false;
    if (this.obstacles.some(item => item.col === col && item.row === row && item.isActive)) return false;
    if (this.diamonds.some(item => item.col === col && item.row === row && !item.isCollected)) return false;
    return true;
  }

  _setMessage(message) {
    this.message = message;
    this.messageTimer = 1800;
  }

  showExitDirection() {
    if (!this.player || !this.currentLevel) return;
    this._setMessage(`Exit: column ${this.exitGrid.col}, row ${this.exitGrid.row}`);
  }

  getNearbyObstacles(player, range) {
    return this.obstacles.filter(obstacle => {
      return obstacle.isActive && !obstacle.isDead && obstacle.getDistance(player) <= range;
    });
  }

  getNearbyEnemies(player, range) {
    return this.enemies.filter(enemy => {
      return enemy.isActive && !enemy.isDead && enemy.getDistance(player) <= range;
    });
  }

  getObjectsByType(type) {
    if (type === 'diamond') {
      return this.diamonds.filter(diamond => !diamond.isCollected && !diamond.isDead);
    }

    if (type === 'enemy') {
      return this.enemies.filter(enemy => enemy.isActive && !enemy.isDead);
    }

    if (type === 'item') {
      return this.items.filter(item => item.isActive && !item.isDead);
    }

    if (type === 'rock' || type === 'boulder') {
      return this.obstacles.filter(obstacle => obstacle.isActive && !obstacle.isDead);
    }

    return [];
  }

  getGrappleTargets(player, range) {
    return [...this.items, ...this.diamonds].filter(target => {
      return target.isActive && !target.isDead && target.getDistance(player) <= range;
    });
  }

  getEnemiesInRange(area) {
    return this.enemies.filter(enemy => this._objectIntersectsArea(enemy, area));
  }

  getObstaclesInRange(area) {
    return this.obstacles.filter(obstacle => this._objectIntersectsArea(obstacle, area));
  }

  _objectIntersectsArea(object, area) {
    if (!object.isActive || object.isDead) return false;

    return (
      object.x < area.x + area.width &&
      object.x + object.width > area.x &&
      object.y < area.y + area.height &&
      object.y + object.height > area.y
    );
  }

  addReward(reward) {
    if (!reward) return null;

    const col = Math.floor((reward.x || 0) / this.tileSize);
    const row = Math.floor((reward.y || 0) / this.tileSize);
    const item = this._makeGridObject(reward.type || 'hammer', col, row, {
      itemType: reward.type || 'hammer',
      name: reward.name || 'Reward',
      quantity: reward.quantity || 1,
    });

    this.items.push(item);
    this._refreshEntities();
    return item;
  }

  _clearCurrentLevel() {
    this.entities = [];
    this.diamonds = [];
    this.obstacles = [];
    this.enemies = [];
    this.items = [];
    this.player = null;
    this.grid = [];
    this.isLevelLoaded = false;
    this.isLevelCompleted = false;
    this.isLevelFailed = false;
  }

  clearAllEnemies() {
    this.enemies = [];
    if (this.enemyManager) {
      this.enemyManager.clearAllEnemies();
    }
  }

  getCurrentLevelInfo() {
    if (!this.currentLevel) return null;

    return {
      level: this.currentLevel,
      index: this.currentLevelIndex,
      isLoaded: this.isLevelLoaded,
      isCompleted: this.isLevelCompleted,
      isFailed: this.isLevelFailed,
      elapsedTime: this.levelElapsedTime,
      playerState: this.player ? this.player.getPlayerState() : null,
      grid: {
        cols: this.gridCols,
        rows: this.gridRows,
        tileSize: this.tileSize,
        player: { ...this.playerGrid },
        exit: { ...this.exitGrid },
      },
    };
  }

  getAvailableLevels() {
    return this.levels.map((level, index) => ({
      index,
      name: level.name,
      world: level.world,
      targetDiamonds: level.targetDiamonds,
      timeLimit: level.timeLimit,
    }));
  }
}

window.LevelManager = LevelManager;
})();
