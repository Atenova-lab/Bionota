/* BioNota offline shell: only application assets, never patient PDFs or values. */
const CACHE_NAME = 'bionota-static-v1';
const BASE_ASSETS = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './icons/bionota-192.png', './icons/bionota-512.png',
  './vendor/pdf.min.mjs', './vendor/pdf.worker.min.mjs',
  './vendor/tesseract.esm.min.js', './vendor/worker.min.js',
];
const OCR_ASSETS = [
  './vendor/lang/eng.traineddata',
  './vendor/tess-core/tesseract-core-lstm.wasm',
  './vendor/tess-core/tesseract-core-lstm.wasm.js',
  './vendor/tess-core/tesseract-core-simd-lstm.wasm',
  './vendor/tess-core/tesseract-core-simd-lstm.wasm.js',
  './vendor/tess-core/tesseract-core-relaxedsimd-lstm.wasm',
  './vendor/tess-core/tesseract-core-relaxedsimd-lstm.wasm.js',
];
const ALLOWED = new Set([...BASE_ASSETS,...OCR_ASSETS].map(path => new URL(path,self.registration.scope).pathname));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(BASE_ASSETS);
    // OCR files are large. If storage is limited the app remains installable,
    // but OCR may need a connection the first time it is used.
    try {await cache.addAll(OCR_ASSETS);} catch { /* Retry naturally when requested. */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('bionota-static-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET')return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin)return;

  if(request.mode === 'navigate'){
    event.respondWith(fetch(request).catch(async () => (await caches.match('./index.html')) || Response.error()));
    return;
  }
  if(!ALLOWED.has(url.pathname))return;
  event.respondWith((async () => {
    const cached = await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request,response.clone());
    }
    return response;
  })());
});
