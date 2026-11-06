const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const dist=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(dist,'sw.js'),'utf8');
const assets=[...html.matchAll(/(?:src|href)="\.\/((?:app|styles|glass)\.[a-f0-9]{12}\.(?:js|css))"/g)].map(m=>m[1]);
assert.equal(assets.length,3,'HTML must request a versioned JS bundle and both versioned stylesheets');
for(const name of assets){
  const [stem,hash,extension]=name.split('.');
  const bytes=fs.readFileSync(path.join(dist,name));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),hash,'asset name must match its bytes');
  assert.deepEqual(bytes,fs.readFileSync(path.join(dist,`${stem}.${extension}`)),'published copy must match source');
  assert.ok(sw.includes('./'+name),'the new worker must pre-cache the exact HTML release');
  for(const scope of ['https://app.test/','https://atenova-lab.github.io/Bionota/']){
    const url=new URL('./'+name,scope);
    // Older workers recognized only these stable URLs and ignored the query
    // string. Query-only versioning would still serve the previous JS/CSS.
    const legacyAllowed=new Set(['app.js','styles.css','glass.css'].map(file=>new URL('./'+file,scope).pathname));
    assert.equal(legacyAllowed.has(url.pathname),false,'new content must bypass an already controlling legacy worker');
    assert.equal(url.origin,new URL(scope).origin,'assets must remain local at a subdirectory deployment');
  }
}
assert.ok(fs.existsSync(path.join(dist,'.nojekyll')),'Pages must publish the static files unchanged');
console.log('Release integrity, legacy-worker cache bypass and GitHub Pages subdirectory checks passed');
