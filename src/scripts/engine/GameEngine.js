const path = require('path');
const mod = require(path.resolve(__dirname, '../../../js/engine/GameEngine'));
module.exports = mod && mod.__esModule ? mod.default : mod;
