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

vm.runInContext("state.values = { bmi:'26,1', bcmi:'11,2', ffm:'47,7', fm:'20,7' }; state.selected = new Set(['bmi','bcmi','ffm','fm']); state.format = 'compact';", context);
const lines = vm.runInContext('buildText()', context).split('\n');
assert.deepEqual(Array.from(lines), ['IMC: 26,1 kg/m²','FM: 20,7 kg','FFM: 47,7 kg','BCMI: 11,2 kg/m²']);
vm.runInContext("state.format = 'sections';", context);
const grouped = vm.runInContext('buildText()', context);
assert.match(grouped, /ANTROPOMETRÍA\nIMC: 26,1 kg\/m²/);
assert.match(grouped, /FM: 20,7 kg\nFFM: 47,7 kg\nBCMI: 11,2 kg\/m²/);
console.log('One-parameter-per-line formats passed');
