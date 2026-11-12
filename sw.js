/* BioNota offline shell: only application assets, never patient PDFs or values. */
const CACHE_NAME = 'bionota-static-v8-a040b4343bce';
const OCR_CACHE_NAME = 'bionota-ocr-v1';
const RELEASE_ASSETS = ["./app.6f50abb9e6b4.js","./styles.0bcaf4c8274a.css","./glass.548b35cd79ba.css"];
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
const OCR_PATHS = new Set(OCR_ASSETS.map(path => new URL(path,self.registration.scope).pathname));
let ocrPreparation;

async function prepareOcr(){
  const cache=await caches.open(OCR_CACHE_NAME);
  for(const asset of OCR_ASSETS){
    const url=new URL(asset,self.registration.scope).href;
    if(!await cache.match(url,{ignoreSearch:true}))await cache.add(url).catch(()=>{});
  }
}

self.addEventListener('message',event=>{
  if(event.data!=='bionota:prepare-ocr')return;
  ocrPreparation??=prepareOcr().catch(()=>{}).finally(()=>{ocrPreparation=null;});
  event.waitUntil(ocrPreparation);
});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(BASE_ASSETS.map(asset => new Request(new URL(asset,self.registration.scope),{cache:'reload'})));
    // The app prepares OCR after activation, without delaying the new shell.
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
    const cacheName=OCR_PATHS.has(url.pathname)?OCR_CACHE_NAME:CACHE_NAME;
    const cache=await caches.open(cacheName).catch(()=>null);
    const cached=await cache?.match(request,{ignoreSearch:true}).catch(()=>null);
    if(cached)return cached;
    const response = await fetch(request);
    if(cache&&response.status===200)await cache.put(request,response.clone()).catch(()=>{});
    return response;
  })());
});

