const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8').split('\nlet pdfLibrary=null;')[0];
const saved = new Map();
const elements = new Map();
function el(id){
  if(!elements.has(id))elements.set(id,{
    innerHTML:'',textContent:'',value:'',checked:false,hidden:false,disabled:false,
    focus(){},classList:{add(){},remove(){},toggle(){}},
  });
  return elements.get(id);
}
const context = {
  localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)},
  document:{getElementById:el,querySelectorAll:()=>[]},
  clearTimeout(){},setTimeout(){return 1;},
};
vm.createContext(context);
vm.runInContext(source,context);

const evaluate = snippet=>vm.runInContext(snippet,context);
assert.equal(evaluate("FIELDS.find(f=>f.id==='hydration').short"),'Hydragram (TBW/FFM)');
assert.equal(evaluate("BUILTINS.find(t=>t.id==='hydration').fields.includes('hydration')"),true);

const noteSelection=evaluate('[...state.selected].join(",")');
evaluate("openModal('nutrition')");
assert.equal(evaluate('[...state.selected].join(",")'),noteSelection,'opening a template editor must not change the current report');
assert.match(el('templateFields').innerHTML,/data-template-field="hydration"/);
assert.equal(evaluate('state.templateDraftFields.size'),15);
evaluate("state.templateSearch='hydragram';renderModalFields()");
assert.match(el('templateFields').innerHTML,/Hydragram \(TBW\/FFM\)/);
assert.doesNotMatch(el('templateFields').innerHTML,/data-template-field="bmi"/);

evaluate("state.templateDraftFields.delete('hydration');state.templateDraftFields.add('na_k');");
evaluate('saveTemplate()');
assert.equal(evaluate('[...state.selected].join(",")'),noteSelection,'saving another template must not change the active report');
assert.equal(evaluate("state.overrides.nutrition.fields.includes('na_k')"),true);
assert.equal(evaluate("state.overrides.nutrition.fields.includes('hydration')"),false);
assert.equal(evaluate("allTemplates().find(t=>t.id==='nutrition').fields.length"),15);
assert.equal(saved.has('bionota_builtin_overrides_v1'),true);
assert.equal(saved.get('bionota_builtin_overrides_v1').includes('patient'),false);

evaluate("applyTemplate('nutrition')");
assert.equal(evaluate("state.selected.has('na_k')"),true);
assert.equal(evaluate("state.selected.has('hydration')"),false);
assert.equal(el('templateSelect').innerHTML.includes('Nutrición clínica'),true);

evaluate("openModal('nutrition');closeModal()");
assert.equal(evaluate("state.selected.has('na_k')"),true,'cancelling an edit must not change the current report');
console.log('Template edit, Hydragram visibility, independent draft and persistence tests passed');
