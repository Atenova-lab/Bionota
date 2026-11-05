const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');
const pureFunctions = app.split('\nlet pdfLibrary=null;')[0];
const context = { localStorage: { getItem: () => null } };
vm.createContext(context);
vm.runInContext(pureFunctions + '\nthis.parseReport = parseReport;', context);

const text = [
  'Bodygram HBO',
  'Peso 68,4 kg',
  'Talla 162 cm',
  'IMC 26,1',
  'Resistencia 548 Ohm',
  'Reactancia 58 Ohm',
  'Angulo de fase 6,0 grados',
  'FM (kg) 20,7',
  'FM (%) 30,3',
  'FFM (kg) 47,7',
  'FFMI 18,2',
  'BCM (kg) 25,6',
  'TBW 34,8 L',
  'ECW 14,5 L',
  'ICW 20,3 L',
  'ECW/TBW 41,7 %',
].join('\n');

const parsed = context.parseReport(text);
const expected = {weight:'68,4',height:'162',bmi:'26,1',resistance:'548',reactance:'58',phase:'6,0',fm:'20,7',fm_pct:'30,3',ffm:'47,7',ffmi:'18,2',bcm:'25,6',tbw:'34,8',ecw:'14,5',icw:'20,3',ecw_tbw:'41,7'};
for (const [key, value] of Object.entries(expected)) assert.equal(parsed[key], value, key);
for (const key of ['tbw_pct','ecw_pct','icw_pct','ffm_pct']) assert.equal(parsed[key], undefined, `${key} must not be invented from a nearby value`);
assert.equal(Object.keys(parsed).length, Object.keys(expected).length);
console.log('Parser smoke test passed:', Object.keys(parsed).length, 'fields');

vm.runInContext("state.values = { bmi:'26,1', bcmi:'11,2', ffm:'47,7', fm:'20,7' }; state.selected = new Set(['bmi','bcmi','ffm','fm']); state.format = 'compact'; state.includeCutoffs = false;", context);
const lines = vm.runInContext('buildText()', context).split('\n');
assert.deepEqual(Array.from(lines), ['IMC: 26,1 kg/m²','FM: 20,7 kg','FFM: 47,7 kg','BCMI: 11,2 kg/m²']);
vm.runInContext("state.format = 'sections';", context);
const grouped = vm.runInContext('buildText()', context);
assert.match(grouped, /ANTROPOMETRÍA\nIMC: 26,1 kg\/m²/);
assert.match(grouped, /FM: 20,7 kg\nFFM: 47,7 kg\nBCMI: 11,2 kg\/m²/);
console.log('One-parameter-per-line formats passed');

vm.runInContext("state.values = { bmi:'26,1', height:'162', bcm:'25,6', ffmi:'18,2', phase:'6,0', smi:'8,6', hydration:'73,0' }; state.selected = new Set(['bmi','bcm','ffmi','phase','smi','hydration']); state.format = 'compact'; state.includeCutoffs = true; state.sex = 'female';",context);
const note=vm.runInContext('buildText()',context);
assert.match(note,/IMC: 26,1 kg\/m²/);
assert.doesNotMatch(note,/bajo IMC|obesidad >30/);
assert.match(note,/BCM\/h \(corte: mujer <10 kg\/m\): 15,8 kg\/m/);
assert.match(note,/FFMI \(corte: mujer <15 kg\/m²\): 18,2 kg\/m²/);
assert.match(note,/SMI \(corte: mujer <5,7 kg\/m²\): 8,6 kg\/m²/);
assert.match(note,/PhA \(corte: PhA <3,95°\): 6,0 °/);
assert.match(note,/Hydragram \(TBW\/FFM\) \(corte: >73,5 %\): 73,0 %/);
assert.equal(context.parseReport('Hydragram (TBW/FFM): 72,8 %').hydration,'72,8');
vm.runInContext("state.values.height='1,62';",context);
assert.equal(vm.runInContext('bcmByHeight(state.values)',context),'15,8');
vm.runInContext("state.values.height='';",context);
assert.equal(vm.runInContext('bcmByHeight(state.values)',context),null);
assert.doesNotMatch(vm.runInContext('buildText()',context),/BCM\/h/);
vm.runInContext("state.values.height='162'; state.sex='male';",context);
assert.match(vm.runInContext('buildText()',context),/BCM\/h \(corte: hombre <14 kg\/m\)/);
assert.equal(context.parseReport('Talla 1,62 m\nBCM 25,6 kg').height,'162');
assert.equal(context.parseReport('ECM/BCM 1,2\nBCM 25,6 kg').bcm,'25,6');
console.log('Clinical reference and BCM/height tests passed');

// Entirely synthetic Bodygram layout. The numbers to the right of each row
// belong to reference bars, not to the patient; later visits are excluded.
const mockSections = {
  header:'Sexo: Mujer  Peso: 68.0 kg  Hidratación: 71.1% (TBW/FFM) RZ: 580.80 BMI: 26.6 kg/m²\nAltura: 160.0 cm XC: 580',
  composition:[
    'Parametro resultado % Referencias',
    'Angulo de fase (PhA) 62° 2.7 4.5 8.5',
    'Agua total (TBW) 320L 47.1% 25.0 42.0',
    'Agua extracelular (ECW) 144L 45.0% 12.0 40.0',
    'Agua intracelular 17.6L 55.0% 12.0 40.0',
    'Masa libre de grasa (FFM) 45.0kg 66.2% 38.2',
    'Masa grasa (FM) 23.0kg 33.8% 18.0',
    'Masa celular Metabolicamente activa 22.0kg 48.9% 18.0',
    '(BCM)',
    'Masa muscular total (MM) 38.0kg 44.1% 30.0',
    'Masa del Musculo Esqueletico (MME) 20.0kg 29.4% 19.0',
    'Masa muscular esqueletica apendicular 18.0kg 16.0',
    'Tasa metabolica basal (BMR) 1250.0kcal',
    'Basal Metabolic Rate (BMR Harris 1330.0kcal',
    'Benedict)',
    'Gasto energetico diario total(TDEE) 1720.0 kcal',
    'Na/K 1.0 0.5',
    'Hiperhidratacion (OH) OL',
    'ECW / TBW 0.45L 0.7',
  ].join('\n'),
  results:[
    'resultado','62°','32.0 L','14.4 L','17.6 L','45.0 kg','23.0 kg',
    '22.0 kg','30.0 kg','20.0kg','18.0kg','1250.0kcal','1330.0kcal',
    '1720.0kcal','1.0','OL','0.45 L',
  ].join('\n'),
  indices:[
    'Parametro resultado Referencias',
    'Indice de masa corporal (BMI) 26.6 kg/m² 15.0 25.0 60.0',
    'Indice de masa celular Metabolicamente activa (BCMI) 8.6 kg/m² 2.0 6.4',
    'Indice de masa grasa 9.0 kg/m² 6.0 18.0',
    'Indice de masa libre de grasa 17.6 kg/m² 12.0 25.0',
    'Indice de Masa muscular esqueletica (SMI) 7.8 kg/m² 6.2 7.0',
  ].join('\n'),
  extra:'Indice de masa muscular esqueletica apendicular 7.0 kg/m² 4.1 8.4\nAngulo de fase estandarizado (SPA) -0.75 -4.0 0.0',
};
const hbo=context.parseBodygramCrops(mockSections);
assert.equal(hbo.sex,'female');
const expectedHbo={
  weight:'68',height:'160',bmi:'26,6',hydration:'71,1',resistance:'580,8',reactance:'58',
  phase:'6,2',tbw:'32',tbw_pct:'47,1',ecw:'14,4',ecw_pct:'45',icw:'17,6',icw_pct:'55',
  ffm:'45',ffm_pct:'66,2',fm:'23',fm_pct:'33,8',bcm:'22',mm:'30',smm:'20',asmm:'18',
  bmr:'1250',bmr_harris:'1330',tdee:'1720',na_k:'1',oh:'0',ecw_tbw:'45',
  bcmi:'8,6',fmi:'9',ffmi:'17,6',smi:'7,8',asmi:'7',spa:'-0,75',
};
for(const [key,value] of Object.entries(expectedHbo))assert.equal(hbo.values[key],value,`HBO ${key}`);
assert.equal(Object.keys(hbo.values).length,Object.keys(expectedHbo).length);
assert.equal(context.parseBodygramCrops({...mockSections,composition:'Otros datos 5.0'}),null);
const uncertain=context.parseBodygramCrops({...mockSections,results:'resultado\nuna lectura incompleta'});
assert.equal(uncertain.values.mm,undefined,'conflicting measured value must not be copied');
assert.ok(uncertain.needsReview.includes('mm'));
console.log('HBO table-column extraction and conservative cross-check tests passed');

// Independent OCR crops may disagree on the sign of a *negative* OH value;
// the faint minus sign must not silently become a positive clinical result.
const faintMinus=context.parseBodygramCrops({
  ...mockSections,
  header:mockSections.header.replace('Hidratación','Hidratacién'),
  composition:mockSections.composition.replace('Hiperhidratacion (OH) OL','Hiperhidratacién (OH) 0.1L'),
  results:mockSections.results.replace('\nOL\n0.45 L','\n-O.1L\n0.45 L'),
});
assert.equal(faintMinus.values.hydration,'71,1','accent OCR variant should not lose hydration');
assert.equal(faintMinus.values.oh,'-0,1','signed corroborating crop must preserve negative OH');
const signUncertain=context.parseBodygramCrops({
  ...mockSections,
  composition:mockSections.composition.replace('Hiperhidratacion (OH) OL','Hiperhidratacion (OH) 0.1L'),
  results:'resultado\nlectura incompleta',
});
assert.equal(signUncertain.values.oh,undefined,'single unsigned reading of OH must remain unfilled');
assert.ok(signUncertain.needsReview.includes('oh'));
console.log('Signed hydration OCR regression checks passed');
