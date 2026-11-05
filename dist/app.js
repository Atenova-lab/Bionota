/* BioNota: local-first PDF reading and clinical note drafting. */
const CATEGORIES = [
  { id: 'anthro', name: 'Antropometría' },
  { id: 'electrical', name: 'Parámetros bioeléctricos' },
  { id: 'body', name: 'Composición corporal' },
  { id: 'muscle', name: 'Componente muscular' },
  { id: 'water', name: 'Hidratación' },
  { id: 'other', name: 'Otros indicadores' },
];

// Accepted aliases include labels used in Spanish, Italian and English reports.
// They are candidates, never unquestioned clinical truth: all results require review.
const FIELDS = [
  { id:'weight', cat:'anthro', name:'Peso', unit:'kg', aliases:['peso','weight','peso corporeo'], min:10, max:450 },
  { id:'height', cat:'anthro', name:'Talla', unit:'cm', aliases:['talla','altura','height','stature','altezza'], min:90, max:240 },
  { id:'bmi', cat:'anthro', name:'Índice de masa corporal', short:'IMC', unit:'kg/m²', aliases:['imc','bmi','body mass index','indice de masa corporea','indice di massa corporea'], min:9, max:90 },
  { id:'waist', cat:'anthro', name:'Perímetro de cintura', unit:'cm', aliases:['perimetro de cintura','circunferencia de cintura','waist circumference','circonferenza vita'], min:30, max:240 },
  { id:'calf', cat:'anthro', name:'Circunferencia de pantorrilla', unit:'cm', aliases:['circunferencia de pantorrilla','perimetro de pantorrilla','calf circumference','circonferenza polpaccio'], min:15, max:85 },
  { id:'resistance', cat:'electrical', name:'Resistencia', short:'R', unit:'Ω', aliases:['resistencia','resistance','resistenza','rz','r/h'], min:100, max:1800 },
  { id:'reactance', cat:'electrical', name:'Reactancia', short:'Xc', unit:'Ω', aliases:['reactancia','reactance','reattanza','xc','xc/h'], min:5, max:300 },
  { id:'phase', cat:'electrical', name:'Ángulo de fase', short:'PhA', unit:'°', aliases:['angulo de fase','phase angle','angolo di fase','angolo di fase standardizzato','pha'], min:1, max:15 },
  { id:'spa', cat:'electrical', name:'Ángulo de fase estandarizado', short:'SPA', unit:'', aliases:['angulo de fase estandarizado','standardized phase angle','standardised phase angle','angolo di fase standardizzato','spa'], min:-5, max:5 },
  { id:'fm', cat:'body', name:'Masa grasa', short:'FM', unit:'kg', aliases:['masa grasa','fat mass','massa grassa','fat body mass','fm'], min:0, max:240 },
  { id:'fm_pct', cat:'body', name:'Masa grasa', short:'FM', unit:'%', aliases:['porcentaje de grasa','grasa corporal','body fat percentage','fat mass','massa grassa','pbf','fm'], min:0, max:90 },
  { id:'ffm', cat:'body', name:'Masa libre de grasa', short:'FFM', unit:'kg', aliases:['masa libre de grasa','masa magra','fat free mass','fat-free mass','massa magra','massa libera da grasso','ffm','lbm'], min:3, max:200 },
  { id:'ffm_pct', cat:'body', name:'Masa libre de grasa', short:'FFM', unit:'%', aliases:['masa libre de grasa','fat free mass','massa magra','ffm'], min:5, max:100 },
  { id:'fmi', cat:'body', name:'Índice de masa grasa', short:'FMI', unit:'kg/m²', aliases:['fat mass index','indice de masa grasa','indice di massa grassa','fmi'], min:0, max:70 },
  { id:'ffmi', cat:'body', name:'Índice de masa libre de grasa', short:'FFMI', unit:'kg/m²', aliases:['fat free mass index','fat-free mass index','indice de masa libre de grasa','ffmi'], min:5, max:50 },
  { id:'bcm', cat:'body', name:'Masa celular corporal', short:'BCM', unit:'kg', aliases:['body cell mass','masa celular corporal','massa cellulare','bcm'], min:0, max:100 },
  { id:'bcmi', cat:'body', name:'Índice de masa celular corporal', short:'BCMI', unit:'kg/m²', aliases:['body cell mass index','bcmi'], min:0, max:40 },
  { id:'mm', cat:'muscle', name:'Masa muscular', short:'MM', unit:'kg', aliases:['massa muscolare','masa muscular','muscle mass','mm'], min:0, max:130 },
  { id:'smm', cat:'muscle', name:'Masa muscular esquelética', short:'SMM', unit:'kg', aliases:['skeletal muscle mass','massa muscolare scheletrica','masa muscular esqueletica','smm'], min:0, max:100 },
  { id:'asmm', cat:'muscle', name:'Masa muscular esquelética apendicular', short:'ASMM', unit:'kg', aliases:['masa muscular esqueletica apendicular','appendicular skeletal muscle mass','asmm'], min:0, max:80 },
  { id:'smi', cat:'muscle', name:'Índice muscular esquelético', short:'SMI', unit:'kg/m²', aliases:['skeletal muscle index','skeletal muscle mass index','indice muscular esqueletico','smi'], min:0, max:30 },
  { id:'asmi', cat:'muscle', name:'Índice muscular apendicular', short:'ASMI', unit:'kg/m²', aliases:['asmi','asmm index','appendicular skeletal muscle mass index','indice muscolare appendicolare'], min:0, max:25 },
  { id:'tbw', cat:'water', name:'Agua corporal total', short:'TBW', unit:'L', aliases:['agua corporal total','total body water','acqua corporea totale','tbw'], min:3, max:140 },
  { id:'tbw_pct', cat:'water', name:'Agua corporal total', short:'TBW', unit:'%', aliases:['agua corporal total','total body water','acqua corporea totale','tbw'], min:10, max:95 },
  { id:'hydration', cat:'water', name:'Hydragram · hidratación de la masa libre de grasa', short:'Hydragram (TBW/FFM)', unit:'%', aliases:['hydragram','tbw/ffm','tbw / ffm','hidratacion','idratazione','hydration','ffm hydration'], min:40, max:100 },
  { id:'ecw', cat:'water', name:'Agua extracelular', short:'ECW', unit:'L', aliases:['agua extracelular','extracellular water','acqua extracellulare','ecw'], min:0, max:80 },
  { id:'ecw_pct', cat:'water', name:'Agua extracelular', short:'ECW', unit:'%', aliases:['agua extracelular','extracellular water','acqua extracellulare','ecw'], min:0, max:100 },
  { id:'icw', cat:'water', name:'Agua intracelular', short:'ICW', unit:'L', aliases:['agua intracelular','intracellular water','acqua intracellulare','icw'], min:0, max:90 },
  { id:'icw_pct', cat:'water', name:'Agua intracelular', short:'ICW', unit:'%', aliases:['agua intracelular','intracellular water','acqua intracellulare','icw'], min:0, max:100 },
  { id:'ecw_tbw', cat:'water', name:'Relación agua extracelular/total', short:'ECW/TBW', unit:'%', aliases:['ecw/tbw','ecw / tbw','ecw%tbw','extracellular water ratio','relacion ecw tbw'], min:10, max:90 },
  { id:'oh', cat:'water', name:'Sobrehidratación estimada', short:'OH', unit:'L', aliases:['overhydration','sobrehidratacion','iperidratazione','oh'], min:-30, max:50 },
  { id:'ecm_bcm', cat:'other', name:'Relación matriz extracelular/masa celular', short:'ECM/BCM', unit:'', aliases:['ecm/bcm','ecm / bcm'], min:0, max:15 },
  { id:'bmr', cat:'other', name:'Metabolismo basal estimado', short:'BMR', unit:'kcal/día', aliases:['metabolismo basal','basal metabolic rate','basal metabolism','metabolismo basale','bmr'], min:300, max:6000 },
  { id:'bmr_harris', cat:'other', name:'Metabolismo basal Harris-Benedict', short:'BMR Harris-Benedict', unit:'kcal/día', aliases:['bmr harris benedict','metabolismo basal harris benedict'], min:300, max:6000 },
  { id:'tdee', cat:'other', name:'Gasto energético diario total', short:'TDEE', unit:'kcal/día', aliases:['gasto energetico diario total','total daily energy expenditure','tdee'], min:300, max:10000 },
  { id:'na_k', cat:'other', name:'Relación sodio/potasio', short:'Na/K', unit:'', aliases:['na/k','sodium potassium ratio'], min:0, max:20 },
];

const BUILTINS = [
  { id:'general', name:'Valoración general', description:'Resumen equilibrado de la evaluación bioimpedanciométrica.', fields:['weight','height','bmi','resistance','reactance','phase','fm','fm_pct','ffm','ffmi','bcm','tbw','ecw','icw','hydration'], format:'compact' },
  { id:'nutrition', name:'Nutrición clínica', description:'Composición corporal, reserva celular e hidratación para consulta nutricional.', fields:['weight','bmi','phase','fm','fm_pct','ffm','ffmi','fmi','bcm','bcmi','tbw','ecw','icw','ecw_tbw','hydration'], format:'sections' },
  { id:'sarcopenia', name:'Sarcopenia y músculo', description:'Indicadores musculares y bioeléctricos útiles en valoración morfofuncional.', fields:['weight','bmi','calf','phase','spa','ffm','ffmi','mm','smm','smi','asmi','bcm','bcmi'], format:'compact' },
  { id:'hydration', name:'Hidratación y BIVA', description:'Parámetros eléctricos y de compartimentos hídricos.', fields:['resistance','reactance','phase','spa','tbw','tbw_pct','hydration','ecw','ecw_pct','icw','icw_pct','ecw_tbw','oh'], format:'sections' },
  { id:'obesity', name:'Obesidad y seguimiento', description:'Medidas para documentar cambios ponderales y de compartimentos.', fields:['weight','height','bmi','waist','fm','fm_pct','fmi','ffm','ffmi','phase','tbw'], format:'compact' },
];
const STORE_KEY = 'bionota_templates_v1';
const OVERRIDES_KEY = 'bionota_builtin_overrides_v1';
const state = { values:{}, derivedFields:new Set(), selected:new Set(BUILTINS[0].fields), templateId:'general', format:'compact', noteMode:'current', measurements:[], editingMeasurementId:null, measurementSequence:0, includeCutoffs:true, sex:'all', custom:readTemplates(), overrides:readOverrides(), rawText:'', source:'', file:null, fileUrl:null, pdfBytes:null, demo:false, verified:false, busy:false, editingTemplateId:null, templateDraftFields:new Set(), templateSearch:'' };

const $ = id => document.getElementById(id);
const fieldById = id => FIELDS.find(f => f.id === id);
const allTemplates = () => [...BUILTINS.map(t=>state.overrides[t.id]?{...t,...state.overrides[t.id]}:t), ...state.custom];
const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function readTemplates() {
  try { const data=JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); return Array.isArray(data)?data.filter(t=>t&&typeof t.name==='string'&&Array.isArray(t.fields)).slice(0,50).map(t=>({...t,fields:t.fields.filter(id=>FIELDS.some(f=>f.id===id))})):[]; }
  catch { return []; }
}
function readOverrides(){
  try{
    const input=JSON.parse(localStorage.getItem(OVERRIDES_KEY)||'{}');
    if(!input||typeof input!=='object'||Array.isArray(input))return {};
    const overrides={};
    for(const t of BUILTINS){const saved=input[t.id];if(!saved||!Array.isArray(saved.fields))continue;
      const fields=saved.fields.filter(id=>FIELDS.some(f=>f.id===id));
      if(fields.length)overrides[t.id]={name:typeof saved.name==='string'?saved.name.slice(0,60):t.name,description:typeof saved.description==='string'?saved.description.slice(0,120):t.description,fields,format:t.format};
    }
    return overrides;
  }catch{return {};}
}
function persistTemplates(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state.custom));return true;}catch{return false;}}
function persistOverrides(){try{localStorage.setItem(OVERRIDES_KEY,JSON.stringify(state.overrides));return true;}catch{return false;}}
function formatDecimal(input){return String(input).trim().replace(/\s/g,'').replace(/\.(?=\d{3}(?:[.,]|$))/g,'').replace('.',',');}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3500);}
function showView(id){document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active-view',el.id===id+'View'));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===id));$('breadcrumbTitle').textContent={workspace:'Conversor PDF',templates:'Mis plantillas',guide:'Cómo funciona'}[id];window.scrollTo({top:0,behavior:'smooth'});if(id==='templates')renderTemplates();}
function showStatus(message,kind='neutral'){$('processStatus').className='status-note'+(kind==='neutral'?'':' '+kind);$('processStatus').querySelector('span:last-child').textContent=message;}
function setBusy(flag){state.busy=flag;$('forceOcr').disabled=flag||!state.pdfBytes;$('loadDemo').disabled=flag;$('dropzone').style.pointerEvents=flag?'none':'auto';renderMeasurements();}
function resetVerification(){state.verified=false;$('verifiedCheck').checked=false;}
function setValues(values,source,{replace=true,derived=[]}={}) {if(replace)state.values={};for(const [id,v] of Object.entries(values))state.values[id]=v;state.source=source;state.derivedFields=new Set(derived);resetVerification();renderFields();renderPreview();}
function renderFields(){
  const search=$('fieldSearch').value.toLocaleLowerCase('es').trim();
  let html='';
  for(const category of CATEGORIES){const fields=FIELDS.filter(f=>f.cat===category.id&&(f.name.toLocaleLowerCase('es').includes(search)||(f.short||'').toLowerCase().includes(search)));
    if(!fields.length)continue;
    html+=`<div class="field-group"><div class="field-group-header"><h3>${category.name}</h3><span>${fields.filter(f=>state.values[f.id]!=null&&state.values[f.id]!=='').length} con valor</span></div>`;
    for(const f of fields){const v=state.values[f.id]??'';html+=`<div class="field-row ${v===''?'not-found':''}"><input class="field-check" type="checkbox" data-field-check="${f.id}" ${state.selected.has(f.id)?'checked':''} aria-label="Seleccionar ${escapeHtml(f.name)} ${escapeHtml(f.unit)}"/><label class="field-name" for="value-${f.id}">${escapeHtml(f.name)}${f.short?`<small>${escapeHtml(f.short)}${f.id==='bcm'?' · en HC: BCM/h':''}</small>`:''}</label><input class="field-value" id="value-${f.id}" data-field-value="${f.id}" value="${escapeHtml(v)}" placeholder="—" inputmode="decimal" aria-label="Valor de ${escapeHtml(f.name)} en ${escapeHtml(f.unit)}"/><span class="field-unit">${escapeHtml(f.unit)}</span></div>`;}
    html+='</div>';
  }
  $('fieldsContainer').innerHTML=html||'<p class="status-note">No hay parámetros con ese nombre.</p>';
  $('detectedBadge').textContent=`${Object.values(state.values).filter(v=>v!==''&&v!=null).length} detectados`;
  $('selectionCount').textContent=`${state.selected.size} seleccionados`;
}
function renderTemplateSelect(){const el=$('templateSelect');el.innerHTML=allTemplates().map(t=>`<option value="${escapeHtml(t.id)}" ${state.templateId===t.id?'selected':''}>${escapeHtml(t.name)}${BUILTINS.some(b=>b.id===t.id)?'':' · personalizado'}</option>`).join('');$('templateCount').textContent=allTemplates().length;}
function applyTemplate(id){const t=allTemplates().find(x=>x.id===id);if(!t)return;state.templateId=id;state.selected=new Set(t.fields);state.format=t.format||'compact';resetVerification();renderTemplateSelect();renderFormats();renderFields();renderPreview();}
function renderFormats(){document.querySelectorAll('[data-format]').forEach(b=>b.classList.toggle('active',b.dataset.format===state.format));}
function numberFromInput(value){const n=Number(String(value??'').trim().replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:null;}
function heightMeters(value){const h=numberFromInput(value);if(h===null)return null;if(h>=0.9&&h<=2.4)return h;if(h>=90&&h<=240)return h/100;return null;}
function bcmByHeight(values){const bcm=numberFromInput(values.bcm);const metres=heightMeters(values.height);if(bcm===null||bcm<=0||metres===null)return null;return (bcm/metres).toFixed(1).replace('.',',');}
function sexCutoffs(male,female,sex){return sex==='male'?`hombre <${male}`:sex==='female'?`mujer <${female}`:`hombre <${male} / mujer <${female}`;}
function referenceFor(id,sex){
  switch(id){
    case 'bmi': return null;
    case 'waist': return sex==='male'?'hombre ≥102 cm':sex==='female'?'mujer ≥88 cm':'hombre ≥102 cm / mujer ≥88 cm';
    case 'calf': return '<31 cm';
    case 'phase': return 'PhA <3,95°';
    case 'spa': return 'SPA −1,65 (referencia de la tabla)';
    case 'bcm': return sexCutoffs('14 kg/m','10 kg/m',sex);
    case 'ffmi': return sexCutoffs('17 kg/m²','15 kg/m²',sex);
    case 'smi': return sexCutoffs('7 kg/m²','5,7 kg/m²',sex);
    case 'hydration': return '>73,5 %';
    default: return null;
  }
}
function humanField(f,v){
  const converted=f.id==='bcm'?bcmByHeight(state.values):formatDecimal(v);
  if(converted===null)return null;
  const label=f.id==='bcm'?'BCM/h':(f.short||f.name)+(state.derivedFields.has(f.id)?' (calculado)':'');
  const unit=f.id==='bcm'?'kg/m':f.unit;
  const cutoff=state.includeCutoffs?referenceFor(f.id,state.sex):null;
  return `${label}${cutoff?` (corte: ${cutoff})`:''}: ${converted}${unit?' '+unit:''}`;
}
// Measurements live in memory only. Dates are entered explicitly, never guessed from a PDF.
function validMeasurementDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(value+'T12:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function sortedMeasurements(){return [...state.measurements].sort((a,b)=>a.date.localeCompare(b.date));}
function hasValue(values,id){return values[id]!==undefined&&values[id]!==null&&String(values[id]).trim()!=='';}
function measurementValue(f,record){
  if(!hasValue(record.values,f.id))return null;
  return f.id==='bcm'?bcmByHeight(record.values):formatDecimal(record.values[f.id]);
}
function evolutionField(f){
  const records=sortedMeasurements().filter(r=>hasValue(r.values,f.id));
  const values=records.map(r=>measurementValue(f,r)).filter(v=>v!==null);
  if(!values.length)return null;
  const label=f.id==='bcm'?'BCM/h':(f.short||f.name);
  const derived=records.some(r=>r.derived.includes(f.id))?' (incluye calculados)':'';
  const unit=f.id==='bcm'?'kg/m':f.unit;
  const cutoff=state.includeCutoffs?referenceFor(f.id,state.sex):null;
  return `${label}${derived}: ${values.join(' → ')}${unit?' '+unit:''}${cutoff?` (corte: ${cutoff})`:''}`;
}
function noteHasDemo(){return state.noteMode==='evolution'?state.measurements.some(r=>r.demo):state.demo;}
function noteMissingHeight(){
  if(!state.selected.has('bcm'))return false;
  const records=state.noteMode==='evolution'?state.measurements:[{values:state.values}];
  return records.some(r=>hasValue(r.values,'bcm')&&bcmByHeight(r.values)===null);
}
function buildText(){
  const groups=[];let num=0;
  for(const c of CATEGORIES){
    const valid=FIELDS.filter(f=>f.cat===c.id&&state.selected.has(f.id)&&(state.noteMode==='evolution'?state.measurements.some(r=>hasValue(r.values,f.id)):hasValue(state.values,f.id)));
    const lines=valid.map(f=>state.noteMode==='evolution'?evolutionField(f):humanField(f,state.values[f.id])).filter(Boolean);
    if(!lines.length)continue;num+=lines.length;groups.push({name:c.name,lines});
  }
  if(!num)return '';
  const body=state.format==='sections'
    ? groups.map(g=>`${g.name.toUpperCase()}\n${g.lines.join('\n')}`).join('\n\n')
    : groups.flatMap(g=>g.lines).join('\n');
  return (noteHasDemo()?'[EJEMPLO FICTICIO · NO INCORPORAR A HISTORIA CLÍNICA]\n':'')+body;
}
function renderMeasurements(){
  $('measurementCount').textContent=`${state.measurements.length} visita${state.measurements.length===1?'':'s'}`;
  $('measurementList').innerHTML=sortedMeasurements().map(r=>`<li><div><b>${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(r.date+'T12:00:00'))}</b><span>${Object.keys(r.values).filter(id=>hasValue(r.values,id)).length} parámetros${r.demo?' · ficticios':''}${r.id===state.editingMeasurementId?' · editando':''}</span></div><button class="small-outline" type="button" data-edit-measurement="${r.id}" aria-label="Editar medición del ${escapeHtml(r.date)}">Editar</button><button class="mini-button" type="button" data-remove-measurement="${r.id}" aria-label="Eliminar medición del ${escapeHtml(r.date)}"><svg><use href="#i-trash"/></svg></button></li>`).join('');
  $('clearMeasurements').disabled=!state.measurements.length||state.busy;
  $('addMeasurement').disabled=state.busy||!Object.keys(state.values).some(id=>hasValue(state.values,id));
  $('addMeasurement').innerHTML=`<svg><use href="#i-${state.editingMeasurementId?'check':'plus'}"/></svg> ${state.editingMeasurementId?'Actualizar medición':'Añadir a evolución'}`;
  $('measurementDate').disabled=state.busy;
  $('measurementHint').textContent=state.editingMeasurementId?'Corrige los valores o la fecha y pulsa «Actualizar medición».':state.measurements.length?'Carga el siguiente informe o introduce otra medición y asigna su fecha.':'Carga un PDF o introduce los valores y asigna su fecha.';
  document.querySelectorAll('[data-note-mode]').forEach(b=>{const active=b.dataset.noteMode===state.noteMode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('evolutionCaption').hidden=state.noteMode!=='evolution';
  if(state.noteMode==='evolution')$('evolutionCaption').textContent=state.measurements.length?`Orden cronológico: ${sortedMeasurements().map(r=>r.date.split('-').reverse().join('/')).join(' → ')}. Cada parámetro muestra solo sus valores disponibles.`:'Añade al menos una medición con fecha para generar el evolutivo.';
}
function addMeasurement(){
  if(state.busy)return;
  const date=$('measurementDate').value;
  if(!validMeasurementDate(date)){toast('Indica una fecha válida para esta medición.');$('measurementDate').focus();return;}
  const values=Object.fromEntries(Object.entries(state.values).filter(([id])=>hasValue(state.values,id)));
  if(!Object.keys(values).length){toast('Introduce al menos un valor para añadir la medición.');return;}
  if(state.measurements.some(r=>r.date===date&&r.id!==state.editingMeasurementId)){toast('Ya hay una medición en esa fecha. Usa «Editar» para corregirla.');return;}
  const record={id:state.editingMeasurementId||String(++state.measurementSequence),date,values:{...values},derived:[...state.derivedFields],sex:state.sex,demo:state.demo};
  const index=state.measurements.findIndex(r=>r.id===record.id);
  if(index<0)state.measurements.push(record);else state.measurements[index]=record;
  clearFile();state.noteMode='evolution';renderPreview();toast('Medición añadida a la evolución.');
}
function editMeasurement(id){
  if(state.busy)return;
  const record=state.measurements.find(r=>r.id===id);if(!record)return;
  clearFile();state.editingMeasurementId=id;state.demo=record.demo;state.sex=record.sex;$('sexSelect').value=record.sex;$('measurementDate').value=record.date;
  setValues({...record.values},'measurement',{derived:record.derived});
  $('measurementDate').focus();
}
function renderPreview(){
  const note=buildText();const preview=$('previewContent');preview.textContent=note||(state.noteMode==='evolution'?'Añade mediciones por fecha para crear la nota evolutiva.':'Todavía no hay datos disponibles para los parámetros seleccionados. Carga un PDF, corrige los valores o prueba el ejemplo ficticio.');preview.classList.toggle('has-content',!!note);$('previewCharCount').textContent=`${note.length} caracteres`;
  const missingHeight=noteMissingHeight();
  $('calcWarning').hidden=!missingHeight;
  $('copyButton').disabled=!note||!state.verified||noteHasDemo()||state.busy||missingHeight;
  $('resultDisclaimer').textContent=noteHasDemo()?'Los datos mostrados son ficticios. Para copiar, carga un informe real y verifica sus valores.':'No se generan diagnósticos ni interpretaciones automáticas.';
  document.querySelectorAll('.step').forEach((s,i)=>s.classList.toggle('active',i===0?true:i===1?!!Object.keys(state.values).length:!!note));
  renderMeasurements();
}
function renderTemplates(){
  $('templateGrid').innerHTML=allTemplates().map(t=>{const builtin=BUILTINS.some(b=>b.id===t.id);const customized=builtin&&!!state.overrides[t.id];return `<article class="template-card"><div class="template-card-top"><div class="template-card-icon"><svg><use href="#i-layers"/></svg></div><span class="card-tag ${!builtin||customized?'custom':''}">${!builtin?'PERSONALIZADA':customized?'AJUSTADA':'PREDEFINIDA'}</span></div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.description||'Configuración personalizada de parámetros clínicos.')}</p><div class="template-card-bottom"><button class="template-use" data-use="${escapeHtml(t.id)}">Usar modelo →</button><span class="template-count">${t.fields.length} parámetros</span></div><div class="template-card-tools"><button class="template-edit" data-edit="${escapeHtml(t.id)}"><svg><use href="#i-settings"/></svg> Editar parámetros</button>${customized?`<button class="template-rest" data-restore="${escapeHtml(t.id)}" title="Recuperar parámetros originales">Restaurar</button>`:''}${!builtin?`<button class="template-delete" data-delete="${escapeHtml(t.id)}" aria-label="Eliminar plantilla ${escapeHtml(t.name)}" title="Eliminar modelo"><svg><use href="#i-trash"/></svg></button>`:''}</div></article>`;}).join('');
}
function renderModalFields(){
  const search=state.templateSearch.trim().toLocaleLowerCase('es');let html='';
  for(const category of CATEGORIES){const list=FIELDS.filter(f=>f.cat===category.id&&(!search||`${f.name} ${f.short||''} ${f.unit}`.toLocaleLowerCase('es').includes(search)));if(!list.length)continue;
    html+=`<div class="template-field-group"><div class="template-field-group-heading"><b>${escapeHtml(category.name)}</b><span>${list.filter(f=>state.templateDraftFields.has(f.id)).length} de ${list.length}</span></div>`;
    for(const f of list){html+=`<label class="template-field-option"><input type="checkbox" data-template-field="${f.id}" ${state.templateDraftFields.has(f.id)?'checked':''}/><span>${escapeHtml(f.short||f.name)}<small>${escapeHtml(f.short?f.name:f.unit)}</small></span><span class="template-field-unit">${escapeHtml(f.unit)}</span></label>`;}
    html+='</div>';
  }
  $('templateFields').innerHTML=html||'<p class="template-empty">No hay parámetros que coincidan con la búsqueda.</p>';
  $('templateSelectedCount').textContent=`${state.templateDraftFields.size} de ${FIELDS.length} parámetros incluidos`;
  $('templateSelectAll').textContent=search?'Marcar resultados':'Marcar todos';
  $('templateClearAll').textContent=search?'Desmarcar resultados':'Desmarcar todos';
}
function refreshModalFields(){const list=$('templateFields');const scrollTop=list.scrollTop;renderModalFields();list.scrollTop=scrollTop;}
function openModal(id=null){
  const t=id?allTemplates().find(c=>c.id===id):null;
  state.editingTemplateId=t?t.id:null;
  state.templateDraftFields=new Set(t?t.fields:state.selected);
  state.templateSearch='';$('templateFieldSearch').value='';
  $('modalTitle').textContent=t?'Editar parámetros de la plantilla':'Nueva plantilla';
  $('modalDescription').textContent=t?'Marca los parámetros que incluirá este modelo. Los cambios se guardarán solo al confirmar.':'Marca los parámetros que quieras guardar para reutilizarlos en otras consultas.';
  $('templateName').value=t?.name||'';$('templateDescription').value=t?.description||'';
  $('confirmTemplate').innerHTML=t?'<svg><use href="#i-check"/></svg> Guardar cambios':'<svg><use href="#i-check"/></svg> Crear plantilla';
  renderModalFields();$('templateModal').hidden=false;$('templateName').focus();
}
function closeModal(){$('templateModal').hidden=true;state.editingTemplateId=null;state.templateDraftFields=new Set();}
function saveTemplate(){
  const name=$('templateName').value.trim();if(!name){toast('Escribe un nombre para tu plantilla.');$('templateName').focus();return;}
  if(!state.templateDraftFields.size){toast('Selecciona al menos un parámetro para la plantilla.');return;}
  const fields=FIELDS.filter(f=>state.templateDraftFields.has(f.id)).map(f=>f.id);
  const description=$('templateDescription').value.trim();let id=state.editingTemplateId;const isNew=!id;let saved=false;
  if(id&&BUILTINS.some(t=>t.id===id)){
    state.overrides[id]={name,description,fields,format:BUILTINS.find(t=>t.id===id).format};
    saved=persistOverrides();
  }else if(id){
    const t=state.custom.find(c=>c.id===id);if(!t)return;
    t.name=name;t.description=description;t.fields=fields;
    saved=persistTemplates();
  }else{
    if(state.custom.length>=50){toast('Has alcanzado el límite de 50 plantillas.');return;}
    id='custom_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
    state.custom.push({id,name,description,fields,format:state.format});
    saved=persistTemplates();
  }
  closeModal();if(isNew||state.templateId===id)applyTemplate(id);
  renderTemplateSelect();renderTemplates();toast(saved?'Plantilla guardada. Ya puedes usarla.':'No se ha podido guardar en este navegador.');
}

function norm(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\u00a0\u202f]/g,' ').toLowerCase().replace(/\s+/g,' ').trim();}
function aliasMatcher(alias){return new RegExp('(^|[^a-z0-9])'+norm(alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+')+'(?=$|[^a-z0-9])','i');}
function plausible(f,num){return Number.isFinite(num)&&((num>=f.min&&num<=f.max)||(f.id==='height'&&num>=0.9&&num<=2.4));}
function numericMatches(line){return [...line.matchAll(/(?<!\d)([-+−]?\d{1,4}(?:[.,]\d{1,3})?)(?!\d)/g)].map(m=>({raw:m[1].replace('−','-'),start:m.index,end:m.index+m[0].length,num:parseFloat(m[1].replace(',','.').replace('−','-')),after:line.slice(m.index+m[0].length,m.index+m[0].length+13)}));}
function matchUnit(text,unit){const n=norm(text);if(unit==='%')return /%|percent|por ciento/.test(n);if(unit==='kg')return /\bkg\b|kilogr/.test(n);if(unit==='kg/m²')return /kg\s*\/\s*m|kg\s*m\s*-?2|kg\/m2/.test(n);if(unit==='L')return /\bl\b|\blt\b|litro/.test(n);if(unit==='Ω')return /ohm|ω|Ω|\bohm\b/i.test(text);if(unit==='°')return /°|grados|degrees/.test(n);if(unit==='kcal/día')return /kcal/.test(n);return true;}
function chooseNumeric(f, line, aliasEnd, nextLine=''){
  const candidates=numericMatches(line).filter(m=>m.start>=aliasEnd&&plausible(f,m.num));
  const labelPart=line.slice(Math.max(0,aliasEnd-9),aliasEnd+15);
  const explicitUnit=matchUnit(labelPart,f.unit);
  let pool=candidates.map(m=>({...m,score:5-(m.start-aliasEnd)/100+(matchUnit(m.after,f.unit)?7:0)+(explicitUnit?1:0)}));
  // Distinguish percent from kg when both values appear in the same report row.
  if(f.unit==='%'){pool=pool.filter(m=>matchUnit(m.after,'%')||matchUnit(labelPart,'%'));if(!pool.length)return null;}
  if(f.unit==='kg'&&pool.length>1){const withKg=pool.filter(m=>matchUnit(m.after,'kg'));if(withKg.length)pool=withKg;else pool=pool.filter(m=>!matchUnit(m.after,'%'));}
  if(!pool.length&&nextLine){pool=numericMatches(nextLine).filter(m=>plausible(f,m.num)).slice(0,2).map(m=>({...m,score:1}));if(f.unit==='%')pool=pool.filter(m=>matchUnit(m.after,'%')||matchUnit(labelPart,'%'));}
  if(!pool.length)return null;
  pool.sort((a,b)=>b.score-a.score);
  return {value:f.id==='height'&&pool[0].num<3?formatDecimal(String(Math.round(pool[0].num*100))):formatDecimal(pool[0].raw),score:pool[0].score};
}
function parseReport(text){
  const lines=text.replace(/\r/g,'\n').split(/\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const normalized=lines.map(norm);const found={};let ranking={};
  for(const f of FIELDS){
    const aliases=[...f.aliases].sort((a,b)=>b.length-a.length);
    for(let i=0;i<lines.length;i++){
      const line=normalized[i];if(line.length>160)continue;
      // A ratio label contains both component acronyms, but is not a TBW/ECW
      // measurement. Misattributing it would yield a clinically misleading %.
      if(['tbw','tbw_pct','ecw','ecw_pct'].includes(f.id)&&/ecw\s*\/\s*tbw/.test(line))continue;
      if(f.id==='bcm'&&/ecm\s*\/\s*bcm/.test(line))continue;
      if(f.id==='phase'&&/standardi[sz]|estandariz|standardizz|\bspa\b/.test(line))continue;
      for(const alias of aliases){const m=aliasMatcher(alias).exec(line);if(!m)continue;
        const end=m.index+m[0].length;let candidate=chooseNumeric(f,line,end,normalized[i+1]||'');
        if(!candidate)continue;
        // A label explicitly using another unit is not evidence of this quantity.
        const afterAlias=line.slice(end,end+16);
        if(f.unit==='kg'&&/^\s*\(?%\)?/.test(afterAlias))continue;
        if(f.unit==='%'&&/^\s*\(?kg\)?/.test(afterAlias))continue;
        const score=candidate.score+(alias.length>3?Math.min(alias.length,20)/10:0)+(m.index<12?3:0)-(i>lines.length*.9?0:0);
        if(score>(ranking[f.id]??-Infinity)){found[f.id]=candidate.value;ranking[f.id]=score;}
      }
    }
  }
  // If a report says ECW/TBW as a fraction (0.38), express it consistently as % only when explicit.
  if(found.ecw_tbw&&parseFloat(found.ecw_tbw.replace(',','.'))<1){found.ecw_tbw=(parseFloat(found.ecw_tbw.replace(',','.'))*100).toFixed(1).replace('.',',');}
  return found;
}

// Bodygram HBO Evolutivo renders measurements as vector outlines instead of PDF
// text. OCR of the whole page mixes patient values with reference-bar ticks,
// graph axes, explanatory examples and *older visits*. Read only the four
// known measurement regions, and only the RESULT column of each table.
const HBO_RESULT_ROWS = [
  {id:'phase',label:/^angulo de fase\s*\(?pha\)?\s*/},
  {id:'tbw',pct:'tbw_pct',base:'weight',label:/^agua (?:corporal )?total\s*\(?tbw\)?\s*/},
  {id:'ecw',pct:'ecw_pct',base:'tbw',label:/^agua extracelular\s*\(?ecw\)?\s*/},
  {id:'icw',pct:'icw_pct',base:'tbw',label:/^agua intracelular\s*(?:\(?icw\)?)?\s*/},
  {id:'ffm',pct:'ffm_pct',base:'weight',label:/^masa libre de grasa\s*\(?ffm\)?\s*/},
  {id:'fm',pct:'fm_pct',base:'weight',label:/^masa grasa\s*\(?fm\)?\s*/},
  {id:'bcm',base:'ffm',pct:null,label:/^masa celular metabol\w*\s+activa\s*/},
  {id:'mm',base:'weight',pct:null,label:/^masa muscular total\s*\(?mm\)?\s*/},
  {id:'smm',base:'weight',pct:null,label:/^masa del m\w*sculo esqueletico\s*\(?mme\)?\s*/},
  {id:'asmm',label:/^masa muscular esqueletica apendicular\s*/},
  {id:'bmr',label:/^tasa metabolica basal\s*\(?bmr\)?\s*/},
  {id:'bmr_harris',label:/^basal metabolic rate\s*\(?bmr harris\s*/},
  {id:'tdee',label:/^gast[oe] energetico diario total\s*\(?tde[er]\)?\s*/},
  {id:'na_k',label:/^na\s*\/\s*k\s*/},
  {id:'oh',label:/^hiperhidrataci[oe]n\s*\(?oh\)?\s*/},
  {id:'ecw_tbw',label:/^ecw\s*\/\s*tbw[.\s:]*/},
];
const HBO_INDEX_ROWS = [
  {id:'bmi',label:/indice de masa corporal\s*\(?bmi\)?\s*/},
  {id:'bcmi',label:/indice de masa celular metabol\w*\s+activa\s*\(?bcmi\)?\s*/},
  {id:'fmi',label:/indice de masa grasa\s*/},
  {id:'ffmi',label:/indice de masa libre de grasa\s*/},
  {id:'smi',label:/indice de masa muscular esqueletica\s*\(?smi\)?\s*/},
  {id:'asmi',label:/indice de masa muscular esqueletica apendicular\s*/},
  {id:'spa',label:/angulo de fase estandarizado\s*\(?spa\)?\s*/},
];
function hboNumToken(value){
  // OCR can read the zero immediately after a minus sign as letter O:
  // "-O.1 L" is -0.1 L, not +1 L. Preserve the sign before parsing.
  const repaired=String(value||'').replace(/([-+−]\s*)[oO](?=[.,]\d)/g,(_,sign)=>sign+'0');
  const m=repaired.match(/[-+−]?\d{1,5}(?:[.,]\d{1,3})?/);
  return m?m[0].replace('−','-'):null;
}
function hboNumCandidates(raw,id){
  if(!raw)return [];
  const f=fieldById(id);if(!f)return [];
  const n=Number(raw.replace(',','.'));if(!Number.isFinite(n))return [];
  const values=[n];
  if(id==='ecw_tbw'&&n>=0&&n<=1)values.push(n*100);
  // Tiny decimal points are often lost by OCR: "144L" can mean "14.4 L".
  // Only consider repositioning the decimal when it was NOT recognized.
  if(!/[.,]/.test(raw)){
    if(Math.abs(n)>=10)values.push(n/10);
    if(Math.abs(n)>=100)values.push(n/100);
  }
  return [...new Set(values.filter(x=>plausible(f,x)))];
}
function hboRound(n,digits=1){return Number(n.toFixed(digits)).toString().replace('.',',');}
function hboPick(id,raws,expected=null){
  const values=[...new Set(raws.flatMap(raw=>hboNumCandidates(raw,id)))];
  if(!values.length)return null;
  // Percentages printed in the same row are independently useful checks,
  // but never manufacture a measurement from a percentage alone.
  if(expected!==null){
    const close=values.filter(n=>Math.abs(n-expected)<=Math.max(.16,expected*.004));
    if(close.length===1)return close[0];
    if(close.length>1)return close.sort((a,b)=>Math.abs(a-expected)-Math.abs(b-expected))[0];
    return null;
  }
  if(id==='oh'){
    // A clearly printed minus in either independent OCR crop outweighs a
    // second pass that simply missed it. The magnitude must corroborate.
    const negative=values.filter(n=>n<0);
    if(negative.length===1&&values.some(n=>n>0&&Math.abs(n+negative[0])<.011))return negative[0];
    // OH can be negative, so a single unsigned OCR read is not sufficient.
    if(raws.length<2&&values.some(n=>n!==0))return null;
  }
  if(values.length===1)return values[0];
  // If two OCR passes agree on the same clinically plausible value, use it.
  const counts=new Map();
  for(const raw of raws)for(const v of hboNumCandidates(raw,id))counts.set(v,(counts.get(v)||0)+1);
  const agreeing=values.filter(v=>counts.get(v)>=2);
  if(agreeing.length===1)return agreeing[0];
  // Explicit printed decimal always wins over a possible inferred shift.
  const decimal=raws.find(raw=>raw&&/[.,]/.test(raw));
  if(decimal){const val=Number(decimal.replace(',','.'));if(values.includes(val))return val;}
  // Otherwise, ambiguous digits are not safe for a clinical history.
  return null;
}
function hboTableLines(text){return String(text||'').split(/\r?\n/).map(line=>norm(line)).filter(Boolean);}
function hboGetRows(text,specs){
  const rows={};
  for(const line of hboTableLines(text))for(const spec of specs){
    const match=spec.label.exec(line);if(!match)continue;
    const after=line.slice(match.index+match[0].length);
    const raw=hboNumToken(after)||(spec.id==='oh'&&/^[o0]\s*l\b/.test(after)?'0':null);
    if(!raw)continue;
    const pctMatch=after.match(/[-+−]?\d{1,5}(?:[.,]\d{1,2})?\s*(?:kg|l|°)?\s+([-+−]?\d{1,3}(?:[.,]\d{1,2})?)\s*%/);
    const pctRaw=pctMatch?.[1]||null;
    // Favor the first fully recognized row. A duplicate from a heading is
    // not a reason to overwrite it.
    if(!rows[spec.id])rows[spec.id]={raw,pctRaw};
  }
  return rows;
}
function hboResultColumn(text){
  const lines=hboTableLines(text).filter(x=>!/^resultado\b/.test(x));
  // The result strip has exactly one entry per row. If OCR drops or adds a
  // row, positional matching is unsafe and this corroboration is discarded.
  if(lines.length!==HBO_RESULT_ROWS.length)return {};
  const found={};
  lines.forEach((line,i)=>{found[HBO_RESULT_ROWS[i].id]=hboNumToken(line)||(/^[o0]\s*l$/.test(line)?'0':null);});
  return found;
}
function parseBodygramCrops({header='',composition='',results='',indices='',extra=''}={}){
  if(!/parametro\s+resultado/.test(norm(composition))||!/indice de masa corporal/.test(norm(indices)))return null;
  const found={};const needsReview=[],derived=[];
  const summary=norm(header);
  const headSpecs=[
    ['weight',/\bpeso\s*:?\s*([-+]?\d{1,4}(?:[.,]\d{1,2})?)\s*kg/],
    ['height',/\baltura\s*:?\s*([-+]?\d{1,4}(?:[.,]\d{1,2})?)\s*cm/],
    ['hydration',/\b(?:hidrataci[oe]n|hydragram(?:\s*\(?(?:tbw\s*\/\s*ffm)\)?)?)\s*:?\s*([-+]?\d{1,3}(?:[.,]\d{1,2})?)\s*%/],
    ['resistance',/\brz\s*:?\s*([-+]?\d{2,4}(?:[.,]\d{1,2})?)/],
    ['reactance',/\bxc\s*:?\s*([-+]?\d{1,4}(?:[.,]\d{1,2})?)/],
    ['bmi',/\bbmi\s*:?\s*([-+]?\d{1,3}(?:[.,]\d{1,2})?)/],
  ];
  for(const [id,pattern] of headSpecs){
    const m=pattern.exec(summary);if(!m)continue;
    let raw=m[1];
    if(id==='resistance'&&/\d[.,]\d{2}$/.test(raw))raw=raw.slice(0,-1); // Ω often OCRs as 0/9.
    const candidates=hboNumCandidates(raw,id);
    if(candidates.length===1)found[id]=hboRound(candidates[0]);
    else if(candidates.length>1){
      // The printed summary uses explicit decimals except when Ω is mistaken
      // for a final zero; in this case allow a single decimal by context.
      const explicit=Number(raw.replace(',','.'));
      if(/[.,]/.test(raw)&&candidates.includes(explicit))found[id]=hboRound(explicit);
      else if(id==='reactance'&&candidates.includes(explicit/10))found[id]=hboRound(explicit/10);
      else needsReview.push(id);
    }
  }
  const table=hboGetRows(composition,HBO_RESULT_ROWS);
  const column=hboResultColumn(results);
  const p2Rows=new Map(HBO_RESULT_ROWS.map(x=>[x.id,x]));
  const measures=['tbw','ecw','icw','ffm','fm','bcm','mm','smm','asmm'];
  // Values needed as denominators are read first, avoiding accidental use of
  // the separate reference scales in the printed bar charts.
  for(const id of ['phase',...measures,'bmr','bmr_harris','tdee','na_k','oh','ecw_tbw']){
    const spec=p2Rows.get(id);const row=table[id];
    if(!row)continue;
    const raws=[row.raw,column[id]].filter(Boolean);
    const percentValue=row.pctRaw?Number(row.pctRaw.replace(',','.')):null;
    const percentage=percentValue!==null&&Number.isFinite(percentValue)&&percentValue>=0&&percentValue<=100?percentValue:null;
    const base=spec.base&&found[spec.base]?Number(found[spec.base].replace(',','.')):null;
    const expected=percentage!==null&&base!==null?base*percentage/100:null;
    let selected=hboPick(id,raws,expected);
    if(id==='oh'&&selected===null&&/^[o0]\s*l$/i.test(row.raw))selected=0;
    if(selected!==null)found[id]=hboRound(selected);
    else needsReview.push(id);
    if(spec.pct&&percentage!==null)found[spec.pct]=hboRound(percentage);
  }
  // The software gives ECW/TBW as a fraction, even when the visual report
  // places an L beside it. Store the ratio as a percentage only if it agrees
  // with the measured compartment volumes.
  if(found.ecw_tbw){
    const ratio=Number(found.ecw_tbw.replace(',','.'));
    const ecw=Number((found.ecw||'').replace(',','.'));
    const tbw=Number((found.tbw||'').replace(',','.'));
    if(ratio>=0&&ratio<=100&&ecw>0&&tbw>0&&Math.abs(ratio/100-ecw/tbw)<.025)found.ecw_tbw=hboRound(ratio);
    else{delete found.ecw_tbw;needsReview.push('ecw_tbw');}
  }
  // The table sometimes prints this fraction as "0.5 L", and OCR can read
  // it as "O5L". The explicit ECW/TBW row permits an independently checked
  // calculation from the two observed water compartments.
  if(!found.ecw_tbw&&hboTableLines(composition).some(line=>/^ecw\s*\/\s*tbw[.\s:]+/.test(line))){
    const ecw=Number((found.ecw||'').replace(',','.'));
    const tbw=Number((found.tbw||'').replace(',','.'));
    if(ecw>0&&tbw>0&&ecw<=tbw){found.ecw_tbw=hboRound(ecw/tbw*100);derived.push('ecw_tbw');}
  }
  const idx={...hboGetRows(indices,HBO_INDEX_ROWS),...hboGetRows(extra,HBO_INDEX_ROWS)};
  for(const [id,{raw}] of Object.entries(idx)){
    const val=hboPick(id,[raw]);
    if(val===null){needsReview.push(id);continue;}
    found[id]=hboRound(val,id==='spa'?2:1);
  }
  // Indices should agree with the corresponding kg / height² in the SAME
  // report. A conflict means OCR may have read a digit incorrectly.
  const height=Number((found.height||'').replace(',','.'))/100;
  if(height>.9&&height<2.4){
    for(const [id,massId] of [['bmi','weight'],['bcmi','bcm'],['fmi','fm'],['ffmi','ffm'],['smi','smm'],['asmi','asmm']]){
      if(!found[id]||!found[massId])continue;
      const actual=Number(found[id].replace(',','.'));
      const calculated=Number(found[massId].replace(',','.'))/(height*height);
      if(Math.abs(actual-calculated)>.25){delete found[id];needsReview.push(id);}
    }
  }
  const sex=/\bsexo\s*:?\s*mujer\b/.test(summary)?'female':/\bsexo\s*:?\s*hombre\b/.test(summary)?'male':null;
  return {values:found,sex,derived,needsReview:[...new Set(needsReview)].filter(id=>!derived.includes(id))};
}

function extractLinesFromItems(items){
  const rows=[];
  for(const it of items){if(!it.str?.trim())continue;const x=it.transform?.[4]??0,y=it.transform?.[5]??0;let row=rows.find(r=>Math.abs(r.y-y)<2.6);if(!row){row={y,items:[]};rows.push(row);}row.items.push({x,text:it.str.trim()});}
  rows.sort((a,b)=>b.y-a.y);return rows.map(r=>r.items.sort((a,b)=>a.x-b.x).map(x=>x.text).join('  ')).join('\n');
}
let pdfLibrary=null;
async function getPdfLibrary(){if(!pdfLibrary){pdfLibrary=await import('./vendor/pdf.min.mjs');pdfLibrary.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.mjs',import.meta.url).href;}return pdfLibrary;}
function hboCrop(canvas,left,top,right,bottom){
  const cropped=document.createElement('canvas');
  const x=Math.round(canvas.width*left),y=Math.round(canvas.height*top);
  const w=Math.round(canvas.width*(right-left)),h=Math.round(canvas.height*(bottom-top));
  cropped.width=Math.round(w*1.25);cropped.height=Math.round(h*1.25);
  const context=cropped.getContext('2d',{willReadFrequently:true});
  context.fillStyle='#fff';context.fillRect(0,0,cropped.width,cropped.height);
  context.drawImage(canvas,x,y,w,h,0,0,cropped.width,cropped.height);
  return cropped;
}
async function recognizeBodygram(doc,worker){
  if(doc.numPages<4)return null;
  const sections={};
  const requests=[
    {page:1,key:'header',crop:[.04,.155,.965,.213]},
    {page:2,key:'composition',crop:[.041,.063,.448,.568]},
    {page:2,key:'results',crop:[.245,.070,.351,.568]},
    {page:3,key:'indices',crop:[.041,.757,.515,.987]},
    {page:4,key:'extra',crop:[.041,.030,.515,.165]},
  ];
  let canvas=null,lastPage=0;
  for(const req of requests){
    if(lastPage!==req.page){
      if(canvas)canvas.width=canvas.height=0;
      const page=await doc.getPage(req.page);const viewport=page.getViewport({scale:3.0});
      canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      await page.render({canvasContext:canvas.getContext('2d',{willReadFrequently:true}),viewport}).promise;
      lastPage=req.page;
    }
    showStatus(`Leyendo la columna de resultados del informe Bodygram (${req.page}/4)...`);
    const cropped=hboCrop(canvas,...req.crop);
    try {sections[req.key]=(await worker.recognize(cropped)).data.text;}
    finally {cropped.width=cropped.height=0;}
  }
  if(canvas)canvas.width=canvas.height=0;
  return parseBodygramCrops(sections);
}
async function loadPdf(file){
  if(!file||(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf')){toast('Selecciona un archivo PDF.');return;}
  if(file.size>25*1024*1024){toast('El PDF supera los 25 MB permitidos.');return;}
  state.editingMeasurementId=null;$('measurementDate').value='';setBusy(true);state.sex='all';$('sexSelect').value='all';if(state.fileUrl)URL.revokeObjectURL(state.fileUrl);state.file=file;state.fileUrl=URL.createObjectURL(file);state.demo=false;state.pdfBytes=null;state.rawText='';setValues({},'');$('fileSummary').hidden=false;$('fileName').textContent=file.name;$('fileInfo').textContent=`${(file.size/1024/1024).toFixed(2).replace('.',',')} MB · abriendo...`;
  try{
    showStatus('Abriendo PDF y buscando texto reconocible...');
    state.pdfBytes=new Uint8Array(await file.arrayBuffer());
    const pdfjs=await getPdfLibrary();const doc=await pdfjs.getDocument({data:state.pdfBytes.slice(),useSystemFonts:true}).promise;
    const pages=Math.min(doc.numPages,12);const chunks=[];
    for(let i=1;i<=pages;i++){showStatus(`Leyendo texto de la página ${i} de ${pages}...`);const page=await doc.getPage(i);const content=await page.getTextContent();chunks.push(extractLinesFromItems(content.items));}
    state.rawText=chunks.join('\n');let found=parseReport(state.rawText);$('fileInfo').textContent=`${doc.numPages} página${doc.numPages===1?'':'s'} · ${Object.keys(found).length} datos identificados`;
    if(Object.keys(found).length>=3){setValues(found,'pdf');showStatus(`Texto extraído. Se han identificado ${Object.keys(found).length} parámetros. Comprueba que coinciden con el informe.`, 'success');}
    else{setValues(found,'pdf');showStatus('No se han localizado suficientes parámetros en el texto. Iniciando OCR local...');await runOcr(doc,true);}
  }catch(err){console.error('Error leyendo PDF',err);showStatus(`No se ha podido procesar este PDF (${err.message||'error de lectura'}). Prueba con otro informe.`, 'error');}
  finally{setBusy(false);renderPreview();}
}
async function runOcr(existingDoc=null,automatic=false){
  if(!state.pdfBytes){toast('Primero carga un PDF.');return;}
  setBusy(true);let worker;
  try{
    const pdfjs=await getPdfLibrary();const doc=existingDoc||await pdfjs.getDocument({data:state.pdfBytes.slice(),useSystemFonts:true}).promise;
    showStatus('Preparando el motor OCR local. La primera carga puede tardar unos segundos...');
    const module=await import('./vendor/tesseract.esm.min.js');const Tesseract=module.default;
    worker=await Tesseract.createWorker('eng',1,{workerPath:new URL('./vendor/worker.min.js',import.meta.url).href,corePath:new URL('./vendor/tess-core',import.meta.url).href,langPath:new URL('./vendor/lang',import.meta.url).href,gzip:false,workerBlobURL:false,logger:m=>{if(m.status==='recognizing text')showStatus(`Reconociendo caracteres: ${Math.round((m.progress||0)*100)} %...`);}});
    await worker.setParameters({tessedit_pageseg_mode:'6'});
    const specialized=await recognizeBodygram(doc,worker);
    if(specialized){
      if(specialized.sex){state.sex=specialized.sex;$('sexSelect').value=state.sex;}
      setValues(specialized.values,'ocr-bodygram',{derived:specialized.derived});
      const count=Object.keys(specialized.values).length;
      $('fileInfo').textContent=`${doc.numPages} páginas · ${count} parámetros leídos en las columnas «resultado»`;
      const issueNames=specialized.needsReview.map(id=>fieldById(id)?.short||fieldById(id)?.name||id);
      const derivedNote=specialized.derived.length?' La relación ECW/TBW está señalada como calculada.':'';
      showStatus(issueNames.length
        ?`Lectura específica Bodygram: ${count} datos. No se han rellenado los valores dudosos (${issueNames.join(', ')}). Comprueba el PDF antes de copiar.`
        :`Lectura específica Bodygram: ${count} datos reconocidos en las columnas «resultado».${derivedNote} Revísalos con el PDF antes de copiar.`,
        issueNames.length?'neutral':'success');
      return;
    }
    await worker.setParameters({tessedit_pageseg_mode:'3'});
    const pages=Math.min(doc.numPages,12);let text='';
    for(let i=1;i<=pages;i++){showStatus(`Aplicando OCR a la página ${i} de ${pages}...`);const page=await doc.getPage(i);const viewport=page.getViewport({scale:2.0});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d',{willReadFrequently:true}),viewport}).promise;const result=await worker.recognize(canvas);text+='\n'+result.data.text;canvas.width=canvas.height=0;}
    state.rawText+=(state.rawText?'\n':'')+text;const found=parseReport(state.rawText);setValues(found,'ocr');$('fileInfo').textContent=`${doc.numPages} página${doc.numPages===1?'':'s'} · ${Object.keys(found).length} datos identificados (OCR)`;
    showStatus(Object.keys(found).length?`OCR terminado: ${Object.keys(found).length} valores candidatos. Es imprescindible revisarlos y corregirlos si procede.`:'El OCR ha finalizado, pero no ha identificado campos con suficiente seguridad. Puedes introducir los valores manualmente.',Object.keys(found).length?'success':'error');
  }catch(err){console.error('Error OCR',err);showStatus(`No se ha podido completar el OCR local (${err.message||'error'}). Puedes introducir los datos manualmente.`, 'error');if(!automatic)toast('Error al ejecutar OCR.');}
  finally{if(worker)await worker.terminate().catch(()=>{});setBusy(false);renderPreview();}
}
function clearFile(){state.editingMeasurementId=null;$('measurementDate').value='';if(state.fileUrl)URL.revokeObjectURL(state.fileUrl);state.fileUrl=null;state.file=null;state.pdfBytes=null;state.rawText='';state.demo=false;state.sex='all';$('sexSelect').value='all';$('fileSummary').hidden=true;$('fileInput').value='';setValues({},'');setBusy(false);showStatus('Los PDF escaneados se leerán mediante reconocimiento óptico de caracteres (OCR).');}
function loadDemo(){clearFile();state.demo=true;setValues({weight:'68,4',height:'162',bmi:'26,1',waist:'86',calf:'34',resistance:'548',reactance:'58',phase:'6,0',spa:'-0,8',fm:'20,7',fm_pct:'30,3',ffm:'47,7',ffmi:'18,2',fmi:'7,9',bcm:'25,6',mm:'24,1',smm:'22,5',smi:'8,6',tbw:'34,8',hydration:'73,0',ecw:'14,5',icw:'20,3',ecw_tbw:'41,7'},'demo');showStatus('Datos de demostración inventados. No deben incorporarse a ninguna historia clínica.', 'success');toast('Ejemplo ficticio cargado.');}

document.querySelectorAll('[data-note-mode]').forEach(b=>b.addEventListener('click',()=>{state.noteMode=b.dataset.noteMode;resetVerification();renderPreview();}));
$('addMeasurement').addEventListener('click',addMeasurement);
$('measurementDate').addEventListener('input',()=>{resetVerification();renderPreview();});
$('measurementList').addEventListener('click',e=>{
  if(state.busy)return;
  const edit=e.target.closest('[data-edit-measurement]');if(edit){editMeasurement(edit.dataset.editMeasurement);return;}
  const remove=e.target.closest('[data-remove-measurement]');if(!remove)return;
  const id=remove.dataset.removeMeasurement;state.measurements=state.measurements.filter(r=>r.id!==id);
  if(state.editingMeasurementId===id)clearFile();resetVerification();renderPreview();
});
$('clearMeasurements').addEventListener('click',()=>{
  if(state.busy||!confirm('¿Vaciar todas las mediciones y los datos actuales para empezar con otro paciente?'))return;
  state.measurements=[];state.noteMode='current';clearFile();renderPreview();toast('Evolución vacía. Puedes comenzar con otro paciente.');
});

document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('goTemplates').addEventListener('click',()=>showView('templates'));$('backToWorkspace').addEventListener('click',()=>showView('workspace'));
document.querySelectorAll('[data-format]').forEach(b=>b.addEventListener('click',()=>{state.format=b.dataset.format;resetVerification();renderFormats();renderPreview();}));
$('includeCutoffs').addEventListener('change',e=>{state.includeCutoffs=e.target.checked;resetVerification();renderPreview();});
$('sexSelect').addEventListener('change',e=>{state.sex=e.target.value;resetVerification();renderPreview();});
$('templateSelect').addEventListener('change',e=>applyTemplate(e.target.value));
$('fieldSearch').addEventListener('input',renderFields);
$('fieldsContainer').addEventListener('change',e=>{const id=e.target.dataset.fieldCheck;if(!id)return;if(e.target.checked)state.selected.add(id);else state.selected.delete(id);resetVerification();renderFields();renderPreview();});
$('fieldsContainer').addEventListener('input',e=>{const id=e.target.dataset.fieldValue;if(!id)return;const raw=e.target.value.replace(/[^\d,\.\-+]/g,'').slice(0,20);if(raw)state.values[id]=raw;else delete state.values[id];resetVerification();$('detectedBadge').textContent=`${Object.values(state.values).filter(Boolean).length} detectados`;$('selectionCount').textContent=`${state.selected.size} seleccionados`;renderPreview();});
$('selectDetected').addEventListener('click',()=>{const records=state.noteMode==='evolution'?state.measurements:[{values:state.values}];state.selected=new Set(records.flatMap(r=>Object.keys(r.values).filter(id=>hasValue(r.values,id))));resetVerification();renderFields();renderPreview();});
$('clearSelected').addEventListener('click',()=>{state.selected.clear();resetVerification();renderFields();renderPreview();});
$('verifiedCheck').addEventListener('change',e=>{state.verified=e.target.checked;renderPreview();});
$('copyButton').addEventListener('click',async()=>{if(!state.verified||noteHasDemo()||state.busy||noteMissingHeight())return;const content=buildText();if(!content)return;try{await navigator.clipboard.writeText(content);toast('Texto copiado. Ya puedes pegarlo en la HC.');}catch{const node=document.createElement('textarea');node.value=content;document.body.appendChild(node);node.select();const okay=document.execCommand('copy');node.remove();toast(okay?'Texto copiado.':'No se ha podido copiar. Selecciona el texto manualmente.');}});
$('dropzone').addEventListener('click',()=>$('fileInput').click());$('dropzone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click();}});
$('fileInput').addEventListener('change',e=>{if(e.target.files[0])loadPdf(e.target.files[0]);});
for(const type of ['dragenter','dragover'])$('dropzone').addEventListener(type,e=>{e.preventDefault();e.stopPropagation();$('dropzone').classList.add('dragover');});
for(const type of ['dragleave','drop'])$('dropzone').addEventListener(type,e=>{e.preventDefault();e.stopPropagation();$('dropzone').classList.remove('dragover');});
$('dropzone').addEventListener('drop',e=>{if(e.dataTransfer.files[0])loadPdf(e.dataTransfer.files[0]);});
$('removeFile').addEventListener('click',clearFile);$('viewOriginal').addEventListener('click',()=>{if(state.fileUrl)window.open(state.fileUrl,'_blank','noopener');});$('loadDemo').addEventListener('click',loadDemo);$('forceOcr').addEventListener('click',()=>runOcr());
$('saveTemplateFromSelection').addEventListener('click',()=>openModal());$('newTemplate').addEventListener('click',()=>openModal());
$('templateGrid').addEventListener('click',e=>{const use=e.target.closest('[data-use]');if(use){applyTemplate(use.dataset.use);showView('workspace');return;}const edit=e.target.closest('[data-edit]');if(edit){openModal(edit.dataset.edit);return;}const rest=e.target.closest('[data-restore]');if(rest){const base=BUILTINS.find(t=>t.id===rest.dataset.restore);if(!base||!confirm(`¿Restaurar los parámetros originales del modelo «${base.name}»?`))return;delete state.overrides[base.id];persistOverrides();if(state.templateId===base.id)applyTemplate(base.id);renderTemplateSelect();renderTemplates();toast('Modelo restaurado a sus valores originales.');return;}const del=e.target.closest('[data-delete]');if(del){const t=state.custom.find(x=>x.id===del.dataset.delete);if(!t||!confirm(`¿Eliminar la plantilla «${t.name}»?`))return;state.custom=state.custom.filter(x=>x.id!==t.id);if(state.templateId===t.id)applyTemplate('general');persistTemplates();renderTemplateSelect();renderTemplates();toast('Plantilla eliminada.');}});
$('templateFieldSearch').addEventListener('input',e=>{state.templateSearch=e.target.value;renderModalFields();});
$('templateFields').addEventListener('change',e=>{const id=e.target.dataset.templateField;if(!id)return;if(e.target.checked)state.templateDraftFields.add(id);else state.templateDraftFields.delete(id);refreshModalFields();});
$('templateSelectAll').addEventListener('click',()=>{const filter=state.templateSearch.toLocaleLowerCase('es').trim();for(const f of FIELDS){if(!filter||`${f.name} ${f.short||''} ${f.unit}`.toLocaleLowerCase('es').includes(filter))state.templateDraftFields.add(f.id);}refreshModalFields();});
$('templateClearAll').addEventListener('click',()=>{const filter=state.templateSearch.toLocaleLowerCase('es').trim();for(const f of FIELDS){if(!filter||`${f.name} ${f.short||''} ${f.unit}`.toLocaleLowerCase('es').includes(filter))state.templateDraftFields.delete(f.id);}refreshModalFields();});
$('closeModal').addEventListener('click',closeModal);$('cancelModal').addEventListener('click',closeModal);$('templateModal').addEventListener('click',e=>{if(e.target===$('templateModal'))closeModal();});$('confirmTemplate').addEventListener('click',saveTemplate);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('templateModal').hidden)closeModal();});
$('currentDate').textContent=new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(new Date());
renderTemplateSelect();renderFields();renderFormats();renderPreview();

// Installable web app: still processes every patient PDF locally in the
// browser. An Android installation does not transmit clinical documents.
let installPrompt=null;
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(isStandalone())$('installPanel').hidden=true;
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  $('installPanel').hidden=false;
});
window.addEventListener('appinstalled',()=>{
  installPrompt=null;
  $('installPanel').hidden=true;
  toast('BioNota se ha instalado en tu dispositivo.');
});
$('installApp').addEventListener('click',async()=>{
  if(installPrompt){
    const prompt=installPrompt;
    installPrompt=null;
    try{
      await prompt.prompt();
      const result=await prompt.userChoice;
      if(result?.outcome==='accepted')toast('La instalación está en marcha.');
      else $('installHelp').hidden=false;
    }catch{$('installHelp').hidden=false;}
  }else $('installHelp').hidden=!$('installHelp').hidden;
});
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{
      // The website still works online when browser policy blocks SWs.
    });
  });
}
