'use strict';
/** Local, dependency-free behavioral test for index.html. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, 'Inline JavaScript was not found.');
assert.doesNotThrow(() => new Function(scriptMatch[1]), 'JavaScript syntax error.');

function boot() {
  const handlers = {};
  const frames = [];
  const consoleErrors = [];
  const context2d = {
    clearRect() {}, fillRect() {}, fillText() {}, fillStyle: '', font: '', textAlign: 'left',
  };
  const canvas = { width: 800, height: 600, getContext: () => context2d };
  const sandbox = {
    document: { querySelector: (selector) => { assert.equal(selector, '#game'); return canvas; } },
    addEventListener: (type, handler) => { handlers[type] = handler; },
    requestAnimationFrame: (callback) => { frames.push(callback); },
    performance: { now: () => 1000 },
    console: { error: (...args) => consoleErrors.push(args), log() {}, warn() {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${scriptMatch[1]}\nglobalThis.__state={player,shots,enemies,update,overlaps,get score(){return score},get gameState(){return gameState}};`, sandbox);
  return { handlers, frames, consoleErrors, state: sandbox.__state };
}

function tick(game) {
  const frame = game.frames.shift();
  assert.ok(frame, 'No animation frame was scheduled.');
  frame();
}

function key(game, keyValue, code) {
  let prevented = false;
  game.handlers.keydown({ key: keyValue, code, preventDefault: () => { prevented = true; } });
  return prevented;
}

const moveGame = boot();
assert.equal(moveGame.state.enemies.length, 36, 'Expected 4 x 9 enemy grid.');
assert.equal(key(moveGame, 'ArrowRight', 'ArrowRight'), true, 'Arrow key must prevent browser scrolling.');
tick(moveGame);
assert.equal(moveGame.state.player.x, 382, 'Right movement must advance player by speed.');

const spaceKeyGame = boot();
assert.equal(key(spaceKeyGame, ' ', 'Unknown'), true, 'Space key must prevent browser scrolling.');
assert.equal(spaceKeyGame.state.shots.length, 1, 'event.key=" " must fire exactly one shot.');

const spaceCodeGame = boot();
assert.equal(key(spaceCodeGame, 'Spacebar', 'Space'), true, 'event.code="Space" must prevent browser scrolling.');
assert.equal(spaceCodeGame.state.shots.length, 1, 'event.code="Space" must fire exactly one shot.');

const hitGame = boot();
key(hitGame, 'Spacebar', 'Space');
const shot = hitGame.state.shots[0];
hitGame.state.enemies.splice(0, hitGame.state.enemies.length, {
  x: shot.x - 1, y: shot.y - 9, w: shot.w, h: 20,
});
tick(hitGame);
assert.equal(hitGame.state.score, 10, 'One collision must add 10 points.');
assert.equal(hitGame.state.enemies.length, 0, 'One collision must remove the enemy.');
assert.equal(hitGame.state.gameState, 'YOU WIN!', 'Removing final enemy must show exact victory literal.');

const loseGame = boot();
loseGame.state.enemies.splice(0, loseGame.state.enemies.length, {
  x: 100, y: loseGame.state.player.y - 20, w: 32, h: 20,
});
tick(loseGame);
assert.equal(loseGame.state.gameState, 'GAME OVER', 'Enemy reaching player level must end game.');
assert.equal(moveGame.consoleErrors.length + spaceKeyGame.consoleErrors.length + spaceCodeGame.consoleErrors.length + hitGame.consoleErrors.length + loseGame.consoleErrors.length, 0, 'Console errors detected.');

assert.ok(!/https?:\/\//.test(html), 'External network resource detected.');
assert.ok(html.includes('<canvas id="game"'), 'Canvas element missing.');
console.log('PASS: syntax, Canvas boot, movement, event.key space, event.code Space, AABB, +10 score, enemy removal, YOU WIN!, GAME OVER, no simulated-console errors, no external resources.');
