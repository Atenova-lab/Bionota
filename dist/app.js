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
  { id:'smi', cat:'muscle', name:'Índice muscular esquelético', short:'SMI', unit:'kg/m²', aliases:['skeletal muscle index','skeletal muscle mass index','indice muscular esqueletico','smi'], min:0, max:30 },
  { id:'asmi', cat:'muscle', name:'Índice muscular apendicular', short:'ASMI', unit:'kg/m²', aliases:['asmi','asmm index','appendicular skeletal muscle mass index','indice muscolare appendicolare'], min:0, max:25 },
  { id:'tbw', cat:'water', name:'Agua corporal total', short:'TBW', unit:'L', aliases:['agua corporal total','total body water','acqua corporea totale','tbw'], min:3, max:140 },
  { id:'tbw_pct', cat:'water', name:'Agua corporal total', short:'TBW', unit:'%', aliases:['agua corporal total','total body water','acqua corporea totale','tbw'], min:10, max:95 },
  { id:'hydration', cat:'water', name:'Hidratación de la masa libre de grasa', short:'Hidratación', unit:'%', aliases:['hidratacion','idratazione','hydration','ffm hydration'], min:40, max:100 },
  { id:'ecw', cat:'water', name:'Agua extracelular', short:'ECW', unit:'L', aliases:['agua extracelular','extracellular water','acqua extracellulare','ecw'], min:0, max:80 },
  { id:'ecw_pct', cat:'water', name:'Agua extracelular', short:'ECW', unit:'%', aliases:['agua extracelular','extracellular water','acqua extracellulare','ecw'], min:0, max:100 },
  { id:'icw', cat:'water', name:'Agua intracelular', short:'ICW', unit:'L', aliases:['agua intracelular','intracellular water','acqua intracellulare','icw'], min:0, max:90 },
  { id:'icw_pct', cat:'water', name:'Agua intracelular', short:'ICW', unit:'%', aliases:['agua intracelular','intracellular water','acqua intracellulare','icw'], min:0, max:100 },
  { id:'ecw_tbw', cat:'water', name:'Relación agua extracelular/total', short:'ECW/TBW', unit:'%', aliases:['ecw/tbw','ecw / tbw','ecw%tbw','extracellular water ratio','relacion ecw tbw'], min:10, max:90 },
  { id:'oh', cat:'water', name:'Sobrehidratación estimada', short:'OH', unit:'L', aliases:['overhydration','sobrehidratacion','iperidratazione','oh'], min:-30, max:50 },
  { id:'ecm_bcm', cat:'other', name:'Relación matriz extracelular/masa celular', short:'ECM/BCM', unit:'', aliases:['ecm/bcm','ecm / bcm'], min:0, max:15 },
  { id:'bmr', cat:'other', name:'Metabolismo basal estimado', short:'BMR', unit:'kcal/día', aliases:['metabolismo basal','basal metabolic rate','basal metabolism','metabolismo basale','bmr'], min:300, max:6000 },
];

const BUILTINS = [
  { id:'general', name:'Valoración general', description:'Resumen equilibrado de la evaluación bioimpedanciométrica.', fields:['weight','height','bmi','resistance','reactance','phase','fm','fm_pct','ffm','ffmi','bcm','tbw','ecw','icw','hydration'], format:'compact' },
  { id:'nutrition', name:'Nutrición clínica', description:'Composición corporal, reserva celular e hidratación para consulta nutricional.', fields:['weight','bmi','phase','fm','fm_pct','ffm','ffmi','fmi','bcm','bcmi','tbw','ecw','icw','ecw_tbw','hydration'], format:'sections' },
  { id:'sarcopenia', name:'Sarcopenia y músculo', description:'Indicadores musculares y bioeléctricos útiles en valoración morfofuncional.', fields:['weight','bmi','calf','phase','spa','ffm','ffmi','mm','smm','smi','asmi','bcm','bcmi'], format:'compact' },
  { id:'hydration', name:'Hidratación y BIVA', description:'Parámetros eléctricos y de compartimentos hídricos.', fields:['resistance','reactance','phase','spa','tbw','tbw_pct','hydration','ecw','ecw_pct','icw','icw_pct','ecw_tbw','oh'], format:'sections' },
  { id:'obesity', name:'Obesidad y seguimiento', description:'Medidas para documentar cambios ponderales y de compartimentos.', fields:['weight','height','bmi','waist','fm','fm_pct','fmi','ffm','ffmi','phase','tbw'], format:'compact' },
];
const STORE_KEY = 'bionota_templates_v1';
const state = { values:{}, selected:new Set(BUILTINS[0].fields), templateId:'general', format:'compact', includeCutoffs:true, sex:'all', custom:readTemplates(), rawText:'', source:'', file:null, fileUrl:null, pdfBytes:null, demo:false, verified:false, busy:false, editingTemplateId:null };

const $ = id => document.getElementById(id);
const fieldById = id => FIELDS.find(f => f.id === id);
const allTemplates = () => [...BUILTINS, ...state.custom];
const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function readTemplates() {
  try { const data=JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); return Array.isArray(data)?data.filter(t=>t&&typeof t.name==='string'&&Array.isArray(t.fields)).slice(0,50).map(t=>({...t,fields:t.fields.filter(id=>FIELDS.some(f=>f.id===id))})):[]; }
  catch { return []; }
}
function persistTemplates(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state.custom));return true;}catch{return false;}}
function formatDecimal(input){return String(input).trim().replace(/\s/g,'').replace(/\.(?=\d{3}(?:[.,]|$))/g,'').replace('.',',');}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3500);}
function showView(id){document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active-view',el.id===id+'View'));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===id));$('breadcrumbTitle').textContent={workspace:'Conversor PDF',templates:'Mis plantillas',guide:'Cómo funciona'}[id];window.scrollTo({top:0,behavior:'smooth'});if(id==='templates')renderTemplates();}
function showStatus(message,kind='neutral'){$('processStatus').className='status-note'+(kind==='neutral'?'':' '+kind);$('processStatus').querySelector('span:last-child').textContent=message;}
function setBusy(flag){state.busy=flag;$('forceOcr').disabled=flag||!state.pdfBytes;$('loadDemo').disabled=flag;$('dropzone').style.pointerEvents=flag?'none':'auto';}
function resetVerification(){state.verified=false;$('verifiedCheck').checked=false;}
function setValues(values,source,{replace=true}={}) {if(replace)state.values={};for(const [id,v] of Object.entries(values))state.values[id]=v;state.source=source;resetVerification();renderFields();renderPreview();}
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
    case 'bmi': return 'bajo IMC <20 (<70 años) / <22 (≥70 años); obesidad >30';
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
  const label=f.id==='bcm'?'BCM/h':(f.short||f.name);
  const unit=f.id==='bcm'?'kg/m':f.unit;
  const cutoff=state.includeCutoffs?referenceFor(f.id,state.sex):null;
  return `${label}${cutoff?` (corte: ${cutoff})`:''}: ${converted}${unit?' '+unit:''}`;
}
function buildText(){
  const groups=[];let num=0;
  for(const c of CATEGORIES){const valid=FIELDS.filter(f=>f.cat===c.id&&state.selected.has(f.id)&&state.values[f.id]!==undefined&&String(state.values[f.id]).trim()!=='');const lines=valid.map(f=>humanField(f,state.values[f.id])).filter(Boolean);if(!lines.length)continue;num+=lines.length;groups.push({name:c.name,lines});}
  if(!num)return '';
  const body=state.format==='sections'
    ? groups.map(g=>`${g.name.toUpperCase()}\n${g.lines.join('\n')}`).join('\n\n')
    : groups.flatMap(g=>g.lines).join('\n');
  return (state.demo?'[EJEMPLO FICTICIO · NO INCORPORAR A HISTORIA CLÍNICA]\n':'')+body;
}
function renderPreview(){
  const note=buildText();const preview=$('previewContent');preview.textContent=note||'Todavía no hay datos disponibles para los parámetros seleccionados. Carga un PDF, corrige los valores o prueba el ejemplo ficticio.';preview.classList.toggle('has-content',!!note);$('previewCharCount').textContent=`${note.length} caracteres`;
  const missingHeight=state.selected.has('bcm')&&String(state.values.bcm??'').trim()!==''&&bcmByHeight(state.values)===null;
  $('calcWarning').hidden=!missingHeight;
  $('copyButton').disabled=!note||!state.verified||state.demo||state.busy||missingHeight;
  $('resultDisclaimer').textContent=state.demo?'Los datos mostrados son ficticios. Para copiar, carga un informe real y verifica sus valores.':'No se generan diagnósticos ni interpretaciones automáticas.';
  document.querySelectorAll('.step').forEach((s,i)=>s.classList.toggle('active',i===0?true:i===1?!!Object.keys(state.values).length:!!note));
}
function renderTemplates(){
  $('templateGrid').innerHTML=allTemplates().map(t=>{const custom=!BUILTINS.some(b=>b.id===t.id);return `<article class="template-card"><div class="template-card-top"><div class="template-card-icon"><svg><use href="#i-layers"/></svg></div><span class="card-tag ${custom?'custom':''}">${custom?'PERSONALIZADA':'PREDEFINIDA'}</span></div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.description||'Configuración personalizada de parámetros clínicos.')}</p><div class="template-card-bottom"><button class="template-use" data-use="${escapeHtml(t.id)}">Usar este modelo →</button>${custom?`<button class="template-delete" data-edit="${escapeHtml(t.id)}" aria-label="Editar plantilla ${escapeHtml(t.name)}" title="Editar modelo"><svg><use href="#i-settings"/></svg></button><button class="template-delete" data-delete="${escapeHtml(t.id)}" aria-label="Eliminar plantilla ${escapeHtml(t.name)}" title="Eliminar modelo"><svg><use href="#i-trash"/></svg></button>`:''}<span class="template-count">${t.fields.length} parámetros</span></div></article>`;}).join('');
}
function openModal(id=null){state.editingTemplateId=id;const t=id?state.custom.find(c=>c.id===id):null;if(t){state.selected=new Set(t.fields);renderFields();renderPreview();}$('modalTitle').textContent=t?'Editar plantilla':'Nueva plantilla';$('templateName').value=t?.name||'';$('templateDescription').value=t?.description||'';$('templateModal').hidden=false;$('templateName').focus();}
function closeModal(){$('templateModal').hidden=true;state.editingTemplateId=null;}
function saveTemplate(){const name=$('templateName').value.trim();if(!name){toast('Escribe un nombre para tu plantilla.');$('templateName').focus();return;}if(!state.selected.size){toast('Selecciona al menos un parámetro.');return;}
  if(state.editingTemplateId){const t=state.custom.find(c=>c.id===state.editingTemplateId);if(t){t.name=name;t.description=$('templateDescription').value.trim();t.fields=[...state.selected];t.format=state.format;state.templateId=t.id;}}
  else {if(state.custom.length>=50){toast('Has alcanzado el límite de 50 plantillas.');return;}const id='custom_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);state.custom.push({id,name,description:$('templateDescription').value.trim(),fields:[...state.selected],format:state.format});state.templateId=id;}
  const saved=persistTemplates();closeModal();renderTemplateSelect();renderTemplates();toast(saved?'Plantilla guardada en este navegador.':'No se ha podido guardar en este navegador.');}

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

function extractLinesFromItems(items){
  const rows=[];
  for(const it of items){if(!it.str?.trim())continue;const x=it.transform?.[4]??0,y=it.transform?.[5]??0;let row=rows.find(r=>Math.abs(r.y-y)<2.6);if(!row){row={y,items:[]};rows.push(row);}row.items.push({x,text:it.str.trim()});}
  rows.sort((a,b)=>b.y-a.y);return rows.map(r=>r.items.sort((a,b)=>a.x-b.x).map(x=>x.text).join('  ')).join('\n');
}
let pdfLibrary=null;
async function getPdfLibrary(){if(!pdfLibrary){pdfLibrary=await import('./vendor/pdf.min.mjs');pdfLibrary.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.mjs',import.meta.url).href;}return pdfLibrary;}
async function loadPdf(file){
  if(!file||(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf')){toast('Selecciona un archivo PDF.');return;}
  if(file.size>25*1024*1024){toast('El PDF supera los 25 MB permitidos.');return;}
  setBusy(true);state.sex='all';$('sexSelect').value='all';if(state.fileUrl)URL.revokeObjectURL(state.fileUrl);state.file=file;state.fileUrl=URL.createObjectURL(file);state.demo=false;state.pdfBytes=null;state.rawText='';setValues({},'');$('fileSummary').hidden=false;$('fileName').textContent=file.name;$('fileInfo').textContent=`${(file.size/1024/1024).toFixed(2).replace('.',',')} MB · abriendo...`;
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
    const pages=Math.min(doc.numPages,12);let text='';
    for(let i=1;i<=pages;i++){showStatus(`Aplicando OCR a la página ${i} de ${pages}...`);const page=await doc.getPage(i);const viewport=page.getViewport({scale:2.0});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d',{willReadFrequently:true}),viewport}).promise;const result=await worker.recognize(canvas);text+='\n'+result.data.text;canvas.width=canvas.height=0;}
    state.rawText+=(state.rawText?'\n':'')+text;const found=parseReport(state.rawText);setValues(found,'ocr');$('fileInfo').textContent=`${doc.numPages} página${doc.numPages===1?'':'s'} · ${Object.keys(found).length} datos identificados (OCR)`;
    showStatus(Object.keys(found).length?`OCR terminado: ${Object.keys(found).length} valores candidatos. Es imprescindible revisarlos y corregirlos si procede.`:'El OCR ha finalizado, pero no ha identificado campos con suficiente seguridad. Puedes introducir los valores manualmente.',Object.keys(found).length?'success':'error');
  }catch(err){console.error('Error OCR',err);showStatus(`No se ha podido completar el OCR local (${err.message||'error'}). Puedes introducir los datos manualmente.`, 'error');if(!automatic)toast('Error al ejecutar OCR.');}
  finally{if(worker)await worker.terminate().catch(()=>{});setBusy(false);renderPreview();}
}
function clearFile(){if(state.fileUrl)URL.revokeObjectURL(state.fileUrl);state.fileUrl=null;state.file=null;state.pdfBytes=null;state.rawText='';state.demo=false;state.sex='all';$('sexSelect').value='all';$('fileSummary').hidden=true;$('fileInput').value='';setValues({},'');setBusy(false);showStatus('Los PDF escaneados se leerán mediante reconocimiento óptico de caracteres (OCR).');}
function loadDemo(){clearFile();state.demo=true;setValues({weight:'68,4',height:'162',bmi:'26,1',waist:'86',calf:'34',resistance:'548',reactance:'58',phase:'6,0',spa:'-0,8',fm:'20,7',fm_pct:'30,3',ffm:'47,7',ffmi:'18,2',fmi:'7,9',bcm:'25,6',mm:'24,1',smm:'22,5',smi:'8,6',tbw:'34,8',hydration:'73,0',ecw:'14,5',icw:'20,3',ecw_tbw:'41,7'},'demo');showStatus('Datos de demostración inventados. No deben incorporarse a ninguna historia clínica.', 'success');toast('Ejemplo ficticio cargado.');}

document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('goTemplates').addEventListener('click',()=>showView('templates'));$('backToWorkspace').addEventListener('click',()=>showView('workspace'));
document.querySelectorAll('[data-format]').forEach(b=>b.addEventListener('click',()=>{state.format=b.dataset.format;resetVerification();renderFormats();renderPreview();}));
$('includeCutoffs').addEventListener('change',e=>{state.includeCutoffs=e.target.checked;resetVerification();renderPreview();});
$('sexSelect').addEventListener('change',e=>{state.sex=e.target.value;resetVerification();renderPreview();});
$('templateSelect').addEventListener('change',e=>applyTemplate(e.target.value));
$('fieldSearch').addEventListener('input',renderFields);
$('fieldsContainer').addEventListener('change',e=>{const id=e.target.dataset.fieldCheck;if(!id)return;if(e.target.checked)state.selected.add(id);else state.selected.delete(id);resetVerification();renderFields();renderPreview();});
$('fieldsContainer').addEventListener('input',e=>{const id=e.target.dataset.fieldValue;if(!id)return;const raw=e.target.value.replace(/[^\d,\.\-+]/g,'').slice(0,20);if(raw)state.values[id]=raw;else delete state.values[id];resetVerification();$('detectedBadge').textContent=`${Object.values(state.values).filter(Boolean).length} detectados`;$('selectionCount').textContent=`${state.selected.size} seleccionados`;renderPreview();});
$('selectDetected').addEventListener('click',()=>{state.selected=new Set(Object.entries(state.values).filter(([,v])=>String(v).trim()).map(([id])=>id));resetVerification();renderFields();renderPreview();});
$('clearSelected').addEventListener('click',()=>{state.selected.clear();resetVerification();renderFields();renderPreview();});
$('verifiedCheck').addEventListener('change',e=>{state.verified=e.target.checked;renderPreview();});
$('copyButton').addEventListener('click',async()=>{if(!state.verified||state.demo||state.busy)return;const content=buildText();if(!content)return;try{await navigator.clipboard.writeText(content);toast('Texto copiado. Ya puedes pegarlo en la HC.');}catch{const node=document.createElement('textarea');node.value=content;document.body.appendChild(node);node.select();const okay=document.execCommand('copy');node.remove();toast(okay?'Texto copiado.':'No se ha podido copiar. Selecciona el texto manualmente.');}});
$('dropzone').addEventListener('click',()=>$('fileInput').click());$('dropzone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click();}});
$('fileInput').addEventListener('change',e=>{if(e.target.files[0])loadPdf(e.target.files[0]);});
for(const type of ['dragenter','dragover'])$('dropzone').addEventListener(type,e=>{e.preventDefault();e.stopPropagation();$('dropzone').classList.add('dragover');});
for(const type of ['dragleave','drop'])$('dropzone').addEventListener(type,e=>{e.preventDefault();e.stopPropagation();$('dropzone').classList.remove('dragover');});
$('dropzone').addEventListener('drop',e=>{if(e.dataTransfer.files[0])loadPdf(e.dataTransfer.files[0]);});
$('removeFile').addEventListener('click',clearFile);$('viewOriginal').addEventListener('click',()=>{if(state.fileUrl)window.open(state.fileUrl,'_blank','noopener');});$('loadDemo').addEventListener('click',loadDemo);$('forceOcr').addEventListener('click',()=>runOcr());
$('saveTemplateFromSelection').addEventListener('click',()=>openModal());$('newTemplate').addEventListener('click',()=>openModal());
$('templateGrid').addEventListener('click',e=>{const use=e.target.closest('[data-use]');if(use){applyTemplate(use.dataset.use);showView('workspace');return;}const edit=e.target.closest('[data-edit]');if(edit){openModal(edit.dataset.edit);return;}const del=e.target.closest('[data-delete]');if(del){const t=state.custom.find(x=>x.id===del.dataset.delete);if(!t||!confirm(`¿Eliminar la plantilla «${t.name}»?`))return;state.custom=state.custom.filter(x=>x.id!==t.id);if(state.templateId===t.id)applyTemplate('general');persistTemplates();renderTemplateSelect();renderTemplates();toast('Plantilla eliminada.');}});
$('closeModal').addEventListener('click',closeModal);$('cancelModal').addEventListener('click',closeModal);$('templateModal').addEventListener('click',e=>{if(e.target===$('templateModal'))closeModal();});$('confirmTemplate').addEventListener('click',saveTemplate);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('templateModal').hidden)closeModal();});
$('currentDate').textContent=new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(new Date());
renderTemplateSelect();renderFields();renderFormats();renderPreview();
