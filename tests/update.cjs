const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../dist');
(async()=>{
  const handlers={};let fetched,cached,skipped=false;
  const offline={offline:true};
  const scope='https://atenova-lab.github.io/Bionota/';
  const context={URL,Request,Response,Promise,
    self:{registration:{scope},location:{origin:new URL(scope).origin},addEventListener:(name,fn)=>{handlers[name]=fn;},skipWaiting:async()=>{skipped=true;}},
    caches:{open:async()=>({addAll:async requests=>{cached=requests;}}),match:async()=>offline},
    fetch:async(request,options)=>{fetched=options;return {fresh:true};},
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
  let task;handlers.install({waitUntil:p=>{task=p;}});await task;
  assert.equal(skipped,true);
  assert.ok(cached.every(request=>request.cache==='reload'));
  assert.ok(cached.every(request=>!request.url.includes('traineddata')&&!request.url.includes('tess-core')),'large OCR downloads must not delay activation');
  handlers.fetch({request:{method:'GET',url:scope,mode:'navigate'},respondWith:p=>{task=p;}});
  assert.equal((await task).fresh,true);assert.equal(fetched.cache,'no-store');
  context.fetch=async()=>{throw Error('offline');};
  handlers.fetch({request:{method:'GET',url:scope,mode:'navigate'},respondWith:p=>{task=p;}});
  assert.equal(await task,offline,'offline launch must retain the cached shell');

  const html=fs.readFileSync(path.join(root,'actualizar.html'),'utf8');
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const button={disabled:false,addEventListener:(name,fn)=>{button.click=fn;}},status={};
  const removed=[],unregistered=[];let destination;
  const recovery={URL,Date,Promise,Error,document:{getElementById:id=>id==='update'?button:status},
    location:{href:scope+'actualizar.html',replace:url=>{destination=url;}},window:{caches:{}},
    fetch:async()=>({ok:true,text:async()=>'<meta name="bionota-version" content="1.8" />'}),
    navigator:{serviceWorker:{getRegistrations:async()=>[
      {scope,unregister:async()=>{unregistered.push(scope);}},
      {scope:'https://atenova-lab.github.io/ENDOTURNOS-WEB/',unregister:async()=>{throw Error('unrelated app touched');}},
    ]}},caches:{keys:async()=>['bionota-static-old','bionota-static-new','endoturnos-cache'],delete:async name=>{removed.push(name);}},
  };
  vm.runInNewContext(script,recovery);await button.click();
  assert.deepEqual(unregistered,[scope]);assert.deepEqual(removed,['bionota-static-old','bionota-static-new']);
  assert.equal(new URL(destination).pathname,'/Bionota/');assert.equal(new URL(destination).searchParams.get('version'),'1.8');
  assert.doesNotMatch(script,/localStorage|indexedDB/,'saved templates must remain untouched');
  removed.length=0;unregistered.length=0;destination=undefined;
  recovery.fetch=async()=>{throw Error('offline');};
  await button.click();assert.equal(destination,undefined);assert.equal(removed.length,0);assert.equal(unregistered.length,0);assert.equal(button.disabled,false);
  console.log('Fresh online navigation, offline fallback, immediate activation and scoped update recovery passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
