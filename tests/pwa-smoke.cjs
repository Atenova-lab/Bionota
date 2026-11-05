const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dist = path.resolve(__dirname, '../dist');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'),'utf8'));
const html = fs.readFileSync(path.join(dist, 'index.html'),'utf8');
const app = fs.readFileSync(path.join(dist, 'app.js'),'utf8');
const sw = fs.readFileSync(path.join(dist, 'sw.js'),'utf8');

assert.equal(manifest.name.startsWith('BioNota'),true);
assert.equal(manifest.display,'standalone');
assert.equal(manifest.scope,'/');
assert.match(html,/rel="manifest"/);
assert.match(html,/id="installApp"/);
assert.match(app,/beforeinstallprompt/);
assert.match(app,/serviceWorker\.register\('\.\/sw\.js'\)/);
assert.match(sw,/request\.method !== 'GET'/);
assert.match(sw,/ALLOWED\.has\(url\.pathname\)/);
assert.match(sw,/caches\.match\('\.\/index\.html'\)/);
for(const icon of manifest.icons){
  const local=path.join(dist,icon.src.replace(/^\//,''));
  assert.ok(fs.existsSync(local),`Missing install icon: ${icon.src}`);
  assert.match(icon.purpose,/maskable/);
}
const dependencies=[
  'app.js','styles.css','index.html',
  'vendor/pdf.min.mjs','vendor/pdf.worker.min.mjs',
  'vendor/tesseract.esm.min.js','vendor/worker.min.js',
  'vendor/lang/eng.traineddata',
  ...['','-simd','-relaxedsimd'].flatMap(suffix=>[
    `vendor/tess-core/tesseract-core${suffix}-lstm.wasm`,
    `vendor/tess-core/tesseract-core${suffix}-lstm.wasm.js`,
  ]),
];
for(const asset of dependencies)assert.ok(fs.existsSync(path.join(dist,asset)),`Missing offline asset: ${asset}`);
console.log('PWA manifest, install flow, local-only service worker and cached OCR dependencies passed');
