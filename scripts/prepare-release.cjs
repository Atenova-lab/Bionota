// Fresh HTML must load matching assets even while a previous service worker
// still controls the page. Old workers never cached these content-hashed URLs.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const dist=path.resolve(__dirname,'../dist');
const assets={};
for(const source of ['app.js','styles.css','glass.css']){
  const bytes=fs.readFileSync(path.join(dist,source));
  const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
  const [stem,extension]=source.split('.');
  const name=`${stem}.${hash}.${extension}`;
  fs.writeFileSync(path.join(dist,name),bytes);assets[source]=name;
}
const generated=new Set(Object.values(assets));
for(const name of fs.readdirSync(dist)){
  if(/^(app\.[a-f0-9]{12}\.js|(?:styles|glass)\.[a-f0-9]{12}\.css)$/.test(name)&&!generated.has(name))fs.unlinkSync(path.join(dist,name));
}
const htmlFile=path.join(dist,'index.html');
let html=fs.readFileSync(htmlFile,'utf8');
for(const [source,name] of Object.entries(assets)){
  const [stem,extension]=source.split('.');
  html=html.replace(new RegExp(`\\./${stem}(?:\\.[a-f0-9]{12})?\\.${extension}`,'g'),'./'+name);
}
fs.writeFileSync(htmlFile,html);
const releaseId=crypto.createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0,12);
const swFile=path.join(dist,'sw.js');
let sw=fs.readFileSync(swFile,'utf8');
sw=sw.replace(/const CACHE_NAME = '[^']+';/,`const CACHE_NAME = 'bionota-static-v8-${releaseId}';`);
const entry=`const RELEASE_ASSETS = ${JSON.stringify(Object.values(assets).map(name=>'./'+name))};`;
if(/const RELEASE_ASSETS = [^\n]+/.test(sw))sw=sw.replace(/const RELEASE_ASSETS = [^\n]+/,entry);
else sw=sw.replace('const BASE_ASSETS = [',entry+'\nconst BASE_ASSETS = [');
sw=sw.replace("  './', './index.html'","  ...RELEASE_ASSETS, './', './index.html'");
sw=sw.replace(/(?:\.\.\.RELEASE_ASSETS, ){2,}/,'...RELEASE_ASSETS, ');
fs.writeFileSync(swFile,sw);
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
console.log(`Prepared release ${releaseId}`);
