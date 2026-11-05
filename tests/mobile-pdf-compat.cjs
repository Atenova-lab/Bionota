const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '../dist');
const shim = fs.readFileSync(path.join(root, 'vendor/map-compat.mjs'), 'utf8');
const browser = vm.createContext({});
// Simulate a mobile JavaScript engine that lacks this 2026 Map method.
vm.runInContext('Map.prototype.getOrInsertComputed = undefined;', browser);
vm.runInContext(shim, browser);
assert.equal(vm.runInContext('typeof Map.prototype.getOrInsertComputed', browser), 'function');

const observed = vm.runInContext(`(() => {
  const map = new Map(); let calls = 0;
  const first = map.getOrInsertComputed('tbw', key => {calls++;return key.toUpperCase();});
  const second = map.getOrInsertComputed('tbw', () => {calls++;return 'wrong';});
  map.set('zero', 0);
  const zero = map.getOrInsertComputed('zero', () => {calls++;return 9;});
  map.set('empty', undefined);
  const empty = map.getOrInsertComputed('empty', () => {calls++;return 9;});
  return {first,second,zero,empty,calls,hasEmpty:map.has('empty')};
})()`, browser);
assert.equal(observed.first, 'TBW');
assert.equal(observed.second, 'TBW');
assert.equal(observed.zero, 0);
assert.equal(observed.empty, undefined);
assert.equal(observed.calls, 1);
assert.equal(observed.hasEmpty, true);

for (const bundle of ['pdf.min.mjs', 'pdf.worker.min.mjs']) {
  const contents = fs.readFileSync(path.join(root, 'vendor', bundle), 'utf8');
  assert.match(contents.slice(0,130), /^import '\.\/map-compat\.mjs';/, `${bundle} must load the shim before PDF.js`);
}

const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
assert.match(serviceWorker, /\.\/vendor\/map-compat\.mjs/, 'offline shell must cache the shim');
assert.match(serviceWorker, /bionota-static-v4/, 'installed apps must refresh the cached PDF.js modules');
console.log('Android-compatible PDF.js main thread, worker and offline shell checks passed');
