const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'),'utf8');
const manifestPath = html.match(/<link rel="manifest" href="(\.\/[^"\/]+)"/)?.[1];
assert.equal(manifestPath,'./bionota.webmanifest','the previous manifest URL can still be cached');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, manifestPath),'utf8'));
assert.deepEqual(manifest, JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'),'utf8')));
const app = fs.readFileSync(path.join(dist, 'app.js'),'utf8');
const sw = fs.readFileSync(path.join(dist, 'sw.js'),'utf8');

assert.equal(manifest.name.startsWith('BioNota'),true);
assert.equal(manifest.display,'standalone');
assert.equal(manifest.scope,'./');
const githubPages = 'https://atenova-lab.github.io/Bionota/';
const manifestUrl = new URL(manifestPath, githubPages);
const startUrl = new URL(manifest.start_url, manifestUrl);
const id = new URL(manifest.id, startUrl.origin);
assert.equal(id.href, githubPages,'BioNota must have its own identity on the shared GitHub Pages origin');
assert.notEqual(id.href, new URL('./', startUrl.origin).href,'must not reuse Endonutri’s identity');
assert.equal(startUrl.pathname, '/Bionota/');
assert.equal(new URL(manifest.scope, manifestUrl).href, githubPages);
assert.ok(sw.includes(`'${manifestPath}'`),'the corrected manifest must be available offline');
assert.match(html,/id="installApp"/);
assert.match(app,/beforeinstallprompt/);
assert.match(app,/serviceWorker\.register\('\.\/sw\.js'/);
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
