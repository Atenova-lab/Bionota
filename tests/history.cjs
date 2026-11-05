const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{value:'',checked:false,hidden:false,innerHTML:'',textContent:'',disabled:false,style:{},classList:{toggle(){},add(){},remove(){}},querySelector(){return el(id+'-child')},focus(){}});return elements.get(id);}
const context={localStorage:{getItem:()=>null},document:{getElementById:el,querySelectorAll:()=>[]},clearTimeout(){},setTimeout(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8').split('\nlet pdfLibrary=null;')[0],context);
const run=s=>vm.runInContext(s,context);
// Synthetic clinical table. No source report or patient data is committed.
run(`
this.row=(date,smi,overrides={})=>{
 const values={height:'170',weight:'70',bmi:'24.2',resistance:'520',reactance:'55',phase:'6.1',hydration:'73',nutrigram:'800',bmr:'1500',ffm:'50',fm:'20',tbw:'36.5',ffmi:'17.3',fmi:'6.9',bcm:'25',smi:String(smi),smm_janssen:String((smi*1.7*1.7).toFixed(1)),na_k:'0.9',...overrides};
 return {index:0,dateRaws:[date,date],cells:HISTORY_COLUMNS.map(id=>[values[id],values[id]])};
};
this.rows=[row('04/05/2026 17:45',8),row('04/05/2026 09:15',7.5),row('02/01/2025 12:00',7,{reactance:'',phase:''})];
this.result=parseHistoryRows(rows);
`);
assert.equal(run('result.records.length'),3,'same-day measurements at different times must both survive');
assert.equal(run('result.records.map(r=>r.time).join(",")'),'12:00,09:15,17:45');
assert.equal(run('result.records[0].values.phase'),undefined,'blank cells must stay blank');
assert.equal(run("historyDate('3102202612:00')"),null);
assert.equal(run("historyDate('31/02/2026 12:00')"),null);
assert.equal(run("historyDate('03/04/202625:00')"),null);
assert.equal(run("historyDate('03/04/202612:01').time"),'12:01');
assert.equal(run("historyNumber('ffmi',['173','17.3'],50/(1.7*1.7))"),17.3,'missing decimal requires printed corroboration');
assert.equal(run("historyNumber('reactance',['55.2','59.2'])"),null,'conflicting plausible readings must be withheld');
assert.equal(run("historyNumber('reactance',['55.2','59.2','59.2'])"),59.2);
assert.equal(run("historyNumber('ffmi',['',''],17.3)"),null,'a relationship must not manufacture a missing cell');
run("state.values={ecw:'14',spa:'-0.4',height:'170'};state.selected=new Set(['ecw','spa']);state.includeCutoffs=false;installHistory(result)");
assert.equal(run('state.noteMode'),'evolution','import must select evolution without any manual add');
assert.equal(run('state.selected.has("smi")'),true,'historical parameters must be included initially');
assert.match(run('buildText()'),/SMI: 7 → 7,5 → 8 kg\/m²/);
assert.match(run('buildText()'),/ECW: 14 L/,'parameters present only in the current report remain single values');
run("state.values={smi:'7.5'}");
assert.match(run('buildText()'),/ECW: 14 L/,'editing a historical visit must retain current-only data');
const tsv='level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n'+
 '5\t1\t1\t1\t1\t1\t10\t10\t20\t15\t95\t6.2\n'+
 '5\t1\t1\t1\t2\t1\t10\t210\t20\t15\t95\t7.1';
context.tsv=tsv;
assert.equal(run("tsvCells(tsv,[0,100],100,3)[1][0]"),'','OCR omission must not move the third row into the second');
assert.equal(run("tsvCells(tsv,[0,100],100,3)[2][0]"),'7.1');
// Synthetic grid checks: detect topology, reject a table with a missing column.
run(`
this.width=1000;this.height=1400;this.data=new Uint8ClampedArray(width*height*4).fill(255);
this.pixel=(x,y,r,g,b)=>{let i=(y*width+x)*4;data[i]=r;data[i+1]=g;data[i+2]=b;};
for(let y=800;y<825;y++)for(let x=50;x<=950;x++)pixel(x,y,35,175,200);
for(const y of [825,950,1000,1050,1100])for(let x=50;x<=950;x++)pixel(x,y,220,225,230);
for(let c=0;c<=20;c++)for(let y=825;y<=1100;y++)pixel(50+45*c,y,220,225,230);
this.grid=detectHistoryGrid({data,width,height});
`);
assert.equal(run('grid.rowCount'),3);
assert.equal(run('grid.xs.length'),21);
run('for(let y=826;y<1100;y++)pixel(95,y,255,255,255)');
assert.equal(run('detectHistoryGrid({data,width,height})'),null);
console.log('Automatic history: timestamps, sparse columns, OCR conflicts, printed-decimal recovery, default evolution, current-only data and grid geometry passed');
