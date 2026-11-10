/* BioNota offline shell: only application assets, never patient PDFs or values. */
const CACHE_NAME = 'bionota-static-v8-e92b7878debf';
const RELEASE_ASSETS = ["./app.d664a9e33eb5.js","./styles.0bcaf4c8274a.css","./glass.548b35cd79ba.css"];
const BASE_ASSETS = [
  ...RELEASE_ASSETS, './', './index.html', './styles.css', './glass.css', './fonts/jakarta-regular.ttf', './fonts/jakarta-semibold.ttf', './fonts/jakarta-bold.ttf', './app.js', './manifest.webmanifest',
  './icons/bionota-192.png', './icons/bionota-512.png',
  './vendor/pdf.min.mjs', './vendor/pdf.worker.min.mjs', './vendor/map-compat.mjs',
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
    await cache.addAll(BASE_ASSETS.map(asset => new Request(new URL(asset,self.registration.scope),{cache:'reload'})));
    // OCR assets are cached on demand so large downloads do not delay updates.
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
    event.respondWith(fetch(request,{cache:'no-store'}).catch(async () => (await caches.match('./index.html')) || Response.error()));
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

