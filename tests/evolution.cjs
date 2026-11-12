const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const elements=new Map();
const saved=new Map();
function el(id){
  if(!elements.has(id))elements.set(id,{value:'',checked:false,disabled:false,hidden:false,textContent:'',innerHTML:'',style:{},listeners:{},classList:{toggle(){},add(){},remove(){}},focus(){},querySelector(){return el(id+'-child');},addEventListener(type,fn){this.listeners[type]=fn;}});
  return elements.get(id);
}
let copied='';
const context={
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},
  localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},
  window:{addEventListener(){},matchMedia:()=>({matches:false})},
  navigator:{clipboard:{writeText:async text=>{copied=text;}}},
  URL:{revokeObjectURL(){}},clearTimeout(){},setTimeout(){return 1;},confirm:()=>true,console,
};
vm.createContext(context);
const source=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8').replaceAll('import.meta.url',"'https://bionota.test/app.js'");
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);
assert.equal(typeof el('addMeasurement').listeners.click,'function','new controls must be bound on first load');
assert.equal(run("validMeasurementDate('2026-02-30')"),false);
assert.equal(run("validMeasurementDate('2024-02-29')"),true);
assert.equal(run("validMeasurementDate('05/11/2026')"),false);
run("state.includeCutoffs=false;state.selected=new Set(['smi','weight','bmi','bcm','oh']);setValues({smi:'8.1',bmi:'25',bcm:'24',height:'160'},'pdf')");
el('measurementDate').value='2026-11-05';
el('addMeasurement').listeners.click();
assert.equal(run('state.measurements.length'),1);
assert.equal(run('state.noteMode'),'evolution');
assert.equal(run('Object.keys(state.values).length'),0,'adding a visit must clear the draft');
assert.equal(el('measurementDate').value,'');
run("setValues({smi:'6.9',weight:'60',bcm:'24',height:'150',oh:'0'},'pdf')");
el('measurementDate').value='2026-09-01';
el('addMeasurement').listeners.click();
run("setValues({smi:'7',bmi:'26'},'pdf')");
el('measurementDate').value='2026-10-01';
el('addMeasurement').listeners.click();
const note=run('buildText()');
assert.match(note,/SMI: 6,9 --> 7 --> 8,1 kg\/m²/,'values must follow dates, not import order');
assert.match(note,/Peso: 60 kg/,'single observations must remain single values');
assert.match(note,/IMC: 26 --> 25 kg\/m²/,'missing observations must be omitted');
assert.match(note,/BCM\/h: 16,0 --> 15,0 kg\/m/,'each visit must use its own height');
assert.match(note,/OH: 0 L/,'zero is a valid observation');
assert.doesNotMatch(note,/undefined|null|NaN/);
assert.equal(run('noteMissingHeight()'),false);
assert.equal(el('copyButton').disabled,true,'verification is required');
run('state.verified=true;renderPreview()');
assert.equal(el('copyButton').disabled,false);
el('copyButton').listeners.click();
assert.equal(copied,note,'clipboard must match the preview');
assert.doesNotMatch(copied,/→/,'clinical notes must use compatible text arrows');
run("editMeasurement('2');state.values.smi='7.2';state.values.weight='61';");
assert.match(run('buildText()'),/SMI: 6,9 --> 7 --> 8,1/,'draft edits must not silently alter a saved measurement');
assert.equal(run('state.verified'),false);
el('addMeasurement').listeners.click();
assert.equal(run('state.measurements.length'),3,'editing must replace, not append');
assert.match(run('buildText()'),/SMI: 7,2 --> 7 --> 8,1/);
run("setValues({smi:'10'},'manual')");
el('measurementDate').value='2026-09-01';
el('addMeasurement').listeners.click();
assert.equal(run('state.measurements.length'),3,'duplicate dates must not replace existing values');
assert.match(el('toast').textContent,/Ya hay una medición/);
run("state.includeCutoffs=true");
assert.equal(run("referenceFor('bmi','female')"),null);
assert.doesNotMatch(run('buildText()'),/IMC \(corte:/);
run("state.measurements[0].values.height='';state.verified=true;renderPreview()");
assert.equal(run('noteMissingHeight()'),true);
assert.equal(el('copyButton').disabled,true,'missing historical height must block copying');
run("state.measurements[0].values.height='160';state.measurements[1].demo=true;renderPreview()");
assert.match(run('buildText()'),/^\[EJEMPLO FICTICIO/);
assert.equal(el('copyButton').disabled,true,'a fictitious historical measurement must block copying');
assert.equal(saved.size,0,'patient measurements must never be written to localStorage');
run("state.noteMode='current';setValues({smi:'9'},'manual')");
assert.match(run('buildText()'),/SMI.*: 9 kg\/m²/);
assert.doesNotMatch(run('buildText()'),/-->/);
run("state.noteMode='evolution';state.format='sections'");
assert.match(run('buildText()'),/COMPONENTE MUSCULAR\nSMI/);
el('clearMeasurements').listeners.click();
assert.equal(run('state.measurements.length'),0);
assert.equal(run('Object.keys(state.values).length'),0);
assert.equal(run('state.noteMode'),'current');
assert.equal(el('copyButton').disabled,true);
console.log('Evolution: chronological order, sparse and zero values, per-visit height, edits, duplicate dates, copy verification, demo isolation and memory-only data passed');

// Imported visits retain their distinct times and current-only fields after editing.
run("state.values={ecw:'14'};state.sex='female';installHistory({records:[{date:'2026-05-04',time:'09:15',values:{smi:'7.5'},derived:[]},{date:'2026-05-04',time:'17:45',values:{smi:'8'},derived:[]}],issues:[]});state.selected=new Set(['smi','ecw']);state.includeCutoffs=false;");
run('editMeasurement(state.measurements[0].id)');
assert.equal(el('manualMeasurement').open,true);
assert.equal(el('measurementTime').value,'09:15');
el('addMeasurement').listeners.click();
assert.equal(run('state.measurements.length'),2);
assert.equal(run('state.sex'),'female');
assert.match(run('buildText()'),/SMI: 7,5 --> 8/);
assert.match(run('buildText()'),/ECW: 14 L/);
console.log('Imported measurement editing retains timestamps, reference sex and current-only parameters');

run('state.busy=true;renderPreview()');
assert.match(el('previewContent').textContent,/Leyendo el PDF/);
assert.equal(el('measurementCount').textContent,'Leyendo…');
assert.equal(el('copyButton').disabled,true);
run('state.busy=false;renderPreview()');
assert.match(el('previewContent').textContent,/SMI: 7,5 --> 8/);
console.log('Processing progress stays visible until the evolution is ready');

run(`
  state.values=parseReport('Peso: 68 kg\\nComentarios:\\nPeso habitual: 72 kg\\n%PP: 5,6 %\\nCP: 34 cm\\nDinamometría: 24 kg\\nTest silla: 12,8 s');
  state.selected=new Set(BUILTINS[0].fields);
  state.includeCutoffs=false;state.format='compact';
  installHistory({records:[{date:'2026-05-04',time:'09:15',values:{weight:'70'},derived:[]},{date:'2026-06-04',time:'09:15',values:{weight:'68'},derived:[]}],issues:[]});
  state.verified=true;renderPreview();
`);
el('copyButton').listeners.click();
assert.match(copied,/Peso: 70 --> 68 kg/);
assert.match(copied,/Peso habitual: 72 kg\n%PP: 5,6 %\nCP: 34 cm/);
assert.match(copied,/Dinamometría: 24 kg\nTest silla: 12,8 s/);
assert.ok(run('state.measurements.every(record=>record.values.chair_test===undefined)'), 'current comments cannot be assigned to previous visits');
el('fieldsContainer').listeners.input({target:{dataset:{fieldValue:'chair_test'},value:'9 repeticiones en 30 s'}});
assert.match(run('buildText()'),/Test silla: 9 repeticiones en 30 s/);
console.log('Comments are editable and copy once beside the historical measurements');

