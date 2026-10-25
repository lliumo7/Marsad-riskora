
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const weatherDataset = [
 {year:2017,rain:42,wind:28,temp:43,damage:false,loss:0,asset:250000},
 {year:2018,rain:68,wind:35,temp:41,damage:false,loss:0,asset:250000},
 {year:2019,rain:91,wind:52,temp:44,damage:true,loss:18000,asset:250000},
 {year:2020,rain:90,wind:48,temp:45,damage:true,loss:12000,asset:250000},
 {year:2021,rain:53,wind:30,temp:42,damage:false,loss:0,asset:250000},
 {year:2022,rain:110,wind:62,temp:46,damage:true,loss:35000,asset:250000},
 {year:2023,rain:82,wind:45,temp:43,damage:false,loss:0,asset:250000},
 {year:2024,rain:125,wind:68,temp:47,damage:true,loss:47000,asset:250000},
 {year:2025,rain:61,wind:38,temp:44,damage:false,loss:0,asset:250000}
];
function renderWeatherData(){
 const filter=$('#dataYearFilter')?.value||'all';
 const rows=weatherDataset.filter(r=>filter==='all'||String(r.year)===filter);
 const tbody=$('#weatherRows');
 if(!tbody)return;
 tbody.innerHTML=rows.map(r=>`<tr><td>${r.year}</td><td>${r.rain}</td><td>${r.wind}</td><td>${r.temp}</td><td><span class="data-pill ${r.damage?'yes':'no'}">${r.damage?'نعم':'لا'}</span></td><td>${r.loss.toLocaleString('en-US')}</td><td>${r.asset.toLocaleString('en-US')}</td></tr>`).join('');
 $('#dataYears').textContent=weatherDataset.length;
 $('#dataDamageYears').textContent=weatherDataset.filter(r=>r.damage).length;
 $('#dataRainAvg').textContent=(weatherDataset.reduce((s,r)=>s+r.rain,0)/weatherDataset.length).toFixed(1);
}
$('#dataYearFilter')?.addEventListener('change',renderWeatherData);

let selectedType='منزل',selectedPackage='المتوازنة',assetName='منزلي في الرياض',region='الرياض',requestSent=false,accepted=false,paid=false;
const WORKFLOW_KEY='riskora_workflow_v1'; let workflow={requests:[],documents:[],currentId:null}; try{workflow=JSON.parse(localStorage.getItem(WORKFLOW_KEY))||workflow}catch(e){}; function saveWorkflow(){try{localStorage.setItem(WORKFLOW_KEY,JSON.stringify(workflow))}catch(e){}} function currentReq(){return workflow.requests.find(r=>r.id===workflow.currentId)||null;} function statusLabel(s){return ({pending:'قيد مراجعة الأصل',more:'بانتظار استكمال البيانات',accepted:'تم قبول الأصل',offer:'بانتظار إكمال العرض',issued:'صدرت وثيقة تجريبية',rejected:'لم تتم الموافقة'})[s]||'قيد المراجعة'}const pages=['home','asset','hazard','review','packages','offer','policy','indicator','claim','requests','data','settings','notifications','about','policy-use','contact','faq','terms','privacy'];const titles={home:'الرئيسية',asset:'أصولي',hazard:'طلب التغطية',review:'مراجعة الطلب',packages:'اختيار الباقة',offer:'مراجعة العرض والدفع',policy:'إصدار الوثيقة',indicator:'المؤشرات',claim:'طلب تعويض',requests:'طلباتي ووثائقي',data:'بيانات النموذج',settings:'الإعدادات',notifications:'الإشعارات',about:'عن مرصد رسكورا','policy-use':'سياسة الاستخدام',contact:'تواصل معنا',faq:'الأسئلة الشائعة',terms:'شروط وأحكام الاستخدام',privacy:'سياسة الخصوصية'};function go(id){if((id==='packages'||id==='offer'||id==='policy'||id==='indicator'||id==='claim')&&!accepted){toast('تظهر هذه المرحلة بعد قبول الأصل في رحلة الطلب.');if(requestSent)showPage('review');else showPage('asset');return}showPage(id)}function showPage(id){if(id==='home'||id==='settings')applyDemoName(getSavedDemoName());$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id||(id==='hazard'&&b.dataset.page==='hazard')||(['review','packages','offer'].includes(id)&&b.dataset.page==='hazard')));window.scrollTo({top:0,behavior:'smooth'});if(id==='hazard')syncAsset();if(id==='packages')syncPackageRiskCopy();if(id==='offer')syncOffer();if(id==='policy')syncPolicy();if(id==='indicator')syncIndicator();if(id==='requests')syncRequests();if(id==='data')renderWeatherData();if(id==='settings')syncSettings()}function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}document.addEventListener('click',e=>{const goBtn=e.target.closest('[data-go]');if(goBtn)go(goBtn.dataset.go);const nav=e.target.closest('[data-page]');if(nav)go(nav.dataset.page)});$$('.type').forEach(b=>b.addEventListener('click',()=>{$$('.type').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedType=b.dataset.type}));function syncAsset(){assetName=$('#assetName').value.trim()||`أصل ${selectedType} في ${$('#region').value}`;region=$('#region').value;$('#summaryAsset').textContent=assetName;$('#summaryRegion').textContent=region}$('#saveAsset').addEventListener('click',()=>{syncAsset();if(!$('#address').value.trim()){toast('أضيفي وصف الموقع أو العنوان قبل المتابعة.');$('#address').focus();return}let draft=currentReq(); if(!draft || draft.status==='issued'){draft={id:'REQ-2026-'+String(Date.now()).slice(-6),assetName,assetType:selectedType,region,address:$('#address').value.trim(),status:'draft',createdAt:new Date().toISOString(),risks:[]};workflow.requests.push(draft);workflow.currentId=draft.id;saveWorkflow()}else{draft.assetName=assetName;draft.assetType=selectedType;draft.region=region;draft.address=$('#address').value.trim();saveWorkflow()} toast('تم حفظ بيانات الأصل. أكملي تحديد الأخطار لإرسال الطلب.');go('hazard')});$('#submitRequest').addEventListener('click',()=>{syncAsset();if(document.querySelector('.haz-option[data-risk=\"other\"] input').checked && !$('#otherHazardText').value.trim()){toast('اكتبي الخطر الطبيعي الذي ترغبين في تغطيته.');$('#otherHazardText').focus();return}requestSent=true;let req=currentReq();if(!req){req={id:'REQ-2026-'+String(Date.now()).slice(-6),createdAt:new Date().toISOString()};workflow.requests.push(req);workflow.currentId=req.id}req.assetName=assetName;req.assetType=selectedType;req.region=region;req.address=$('#address').value.trim();req.risks=[...document.querySelectorAll('.haz-option input:checked')].map(x=>({key:x.closest('.haz-option').dataset.risk,label:x.closest('.haz-option').querySelector('b').textContent}));req.otherRisk=$('#otherHazardText').value.trim();req.notes=$('#hazNotes').value.trim();req.status='pending';req.updatedAt=new Date().toISOString();accepted=false;paid=false;saveWorkflow();$('#requestId').textContent=req.id;syncRequests();showPage('review');toast('تم إنشاء الطلب وحفظه في طلباتي.')});$('#approveDemo').addEventListener('click',()=>{accepted=true;const req=currentReq();if(req){req.status='accepted';req.updatedAt=new Date().toISOString();saveWorkflow()}syncRequests();toast('تمت محاكاة قبول الأصل. الباقات أصبحت متاحة.');showPage('packages')});$$('.selectPackage').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.package');selectedPackage=card.dataset.package;$$('.package').forEach(p=>{p.classList.toggle('selected',p===card);p.classList.toggle('featured',p===card)});$$('.selectPackage').forEach(btn=>{btn.textContent=btn.closest('.package')===card?'✓ تم اختيار الباقة':'اختيار الباقة';btn.classList.toggle('outline',btn.closest('.package')!==card)});const req=currentReq();if(req){req.package=selectedPackage;req.status='offer';saveWorkflow()}toast('تم اختيار '+selectedPackage)}));const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590},benefits={'الأساسية':'2,500','المتوازنة':'5,000','الأعمال':'10,000'};
const packageRiskCopy={
 rain:{name:'الأمطار الغزيرة والسيول',basic:['تغطية الأمطار الغزيرة والسيول وفق شروط الوثيقة','تنبيهات عند رصد ظروف مرتبطة بالأمطار الغزيرة والسيول'],mid:['تغطية الأمطار الغزيرة والسيول وفق شروط الوثيقة','متابعة مؤشرات هطول الأمطار وتجمّع المياه والسيول','تنبيهات وقائية وإرشادات للحد من أضرار الأمطار والسيول'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد الأمطار الغزيرة والسيول','متابعة مؤشرات الأمطار والسيول في موقع المنشأة','تنبيهات وقائية مرتبطة بالأمطار الغزيرة والسيول']},
 wind:{name:'الرياح الشديدة',basic:['تغطية أضرار الرياح الشديدة وفق شروط الوثيقة','تنبيهات عند رصد ظروف مرتبطة بالرياح الشديدة'],mid:['تغطية أضرار الرياح الشديدة وفق شروط الوثيقة','متابعة مؤشرات سرعة الرياح وشدتها','تنبيهات وقائية وإرشادات للحد من أضرار الرياح الشديدة'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد الرياح الشديدة','متابعة مؤشرات سرعة الرياح في موقع المنشأة','تنبيهات وقائية مرتبطة بالرياح الشديدة']},
 heat:{name:'موجات الحرارة',basic:['تغطية موجات الحرارة وفق شروط الوثيقة','تنبيهات عند ارتفاع درجات الحرارة إلى مستويات خطرة'],mid:['تغطية موجات الحرارة وفق شروط الوثيقة','متابعة درجات الحرارة القصوى وفترات الحر الشديد','تنبيهات وقائية وإرشادات للحد من أضرار موجات الحرارة'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد موجات الحرارة','متابعة درجات الحرارة القصوى في موقع المنشأة','تنبيهات وقائية مرتبطة بموجات الحرارة']},
 storm:{name:'العواصف الرعدية',basic:['تغطية العواصف الرعدية وفق شروط الوثيقة','تنبيهات عند رصد ظروف مرتبطة بالعواصف الرعدية'],mid:['تغطية العواصف الرعدية وفق شروط الوثيقة','متابعة مؤشرات العواصف الرعدية وشدة الرياح واحتمال الصواعق','تنبيهات وقائية وإرشادات للحد من أضرار العواصف الرعدية'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد العواصف الرعدية','متابعة مؤشرات العواصف الرعدية في موقع المنشأة','تنبيهات وقائية مرتبطة بالعواصف الرعدية']},
 dust:{name:'العواصف الترابية',basic:['تغطية العواصف الترابية وفق شروط الوثيقة','تنبيهات عند رصد الغبار الكثيف وانخفاض الرؤية'],mid:['تغطية العواصف الترابية وفق شروط الوثيقة','متابعة مؤشرات الغبار الكثيف ومستوى الرؤية','تنبيهات وقائية وإرشادات للحد من أضرار العواصف الترابية'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد العواصف الترابية','متابعة مؤشرات الغبار والرؤية في موقع المنشأة','تنبيهات وقائية مرتبطة بالعواصف الترابية']},
 other:{name:'الخطر الطبيعي المحدد',basic:['تغطية الخطر الطبيعي المحدد في الطلب وفق شروط الوثيقة','تنبيهات مرتبطة بالخطر بعد تحديد مؤشره'],mid:['تغطية الخطر الطبيعي المحدد في الطلب وفق شروط الوثيقة','متابعة المؤشر المرتبط بالخطر بعد تحديده','تنبيهات وقائية وإرشادات مناسبة للخطر بعد مراجعته'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد الخطر الطبيعي المحدد','متابعة مؤشر الخطر في موقع المنشأة بعد تحديده','تنبيهات وقائية مرتبطة بالخطر بعد مراجعته']}
};
function syncPackageRiskCopy(){const req=currentReq();const key=(req&&req.risks&&req.risks[0]&&req.risks[0].key)||getSelectedRisk()||'rain';const c=packageRiskCopy[key]||packageRiskCopy.other;const custom=(key==='other'?(req?.otherRisk||$('#otherHazardText')?.value||'').trim():'');const name=custom||c.name;const put=(sel,val)=>{const el=$(sel);if(el)el.textContent=val.replace('الخطر الطبيعي المحدد',name)};put('[data-feature=basic-coverage]',c.basic[0]);put('[data-feature=basic-alert]',c.basic[1]);put('[data-feature=mid-coverage]',c.mid[0]);put('[data-feature=mid-monitor]',c.mid[1]);put('[data-feature=mid-alert]',c.mid[2]);put('[data-feature=biz-coverage]',c.biz[0]);put('[data-feature=biz-monitor]',c.biz[1]);put('[data-feature=biz-alert]',c.biz[2]);}
$('#continueOffer').addEventListener('click',()=>{syncOffer();go('offer')});function syncOffer(){syncAsset();$('#offerAsset').textContent=assetName;$('#offerRegion').textContent=region;$('#offerPackage').textContent=selectedPackage;$('#offerPrice').textContent=prices[selectedPackage]+' ريال';$('#offerBenefit').textContent=benefits[selectedPackage]+' ريال';if($('#paySummaryPrice'))$('#paySummaryPrice').textContent=prices[selectedPackage]+' ريال';if($('#paySummaryTotal'))$('#paySummaryTotal').textContent=prices[selectedPackage]+' ريال'}$('#payDemo').addEventListener('click',()=>{if(!$('#terms').checked){toast('يرجى الموافقة على الشروط التوضيحية أولًا.');return}paid=true;const req=currentReq();if(req){req.status='issued';req.package=selectedPackage;req.price=prices[selectedPackage];req.policyId='POL-DEMO-'+req.id.slice(-6);req.issuedAt=new Date().toISOString();workflow.documents=workflow.documents.filter(d=>d.requestId!==req.id);workflow.documents.push({requestId:req.id,id:req.policyId,assetName:req.assetName,assetType:req.assetType,region:req.region,package:selectedPackage,price:prices[selectedPackage],risks:req.risks||[],status:'demo',issuedAt:req.issuedAt});saveWorkflow()}toast('تم إصدار وثيقة تجريبية وحفظها في وثائقي — لا توجد عملية مالية فعلية.');syncRequests();syncPolicy();showPage('policy')});function syncPolicy(){const req=currentReq();if(req){assetName=req.assetName||assetName;region=req.region||region;selectedPackage=req.package||selectedPackage}$('#policyAsset').textContent=assetName;$('#policyPackage').textContent=selectedPackage;$('#policyPrice').textContent=(prices[selectedPackage]||0)+' ريال'}
let selectedRisk = 'rain';
const riskConfig = {
 rain: {label:'كمية الهطول المطري', unit:'ملم', field:'rain', threshold:70, source:'ملف Excel تجريبي', glyph:'rain'},
 wind: {label:'سرعة الرياح', unit:'كم/ساعة', field:'wind', threshold:60, source:'ملف Excel تجريبي', glyph:'wind'},
 heat: {label:'درجة الحرارة العظمى', unit:'°م', field:'temp', threshold:45, source:'ملف Excel تجريبي', glyph:'heat'},
 storm: {label:'مؤشر العواصف الرعدية (سرعة الرياح)', unit:'كم/ساعة', field:'wind', threshold:60, source:'مؤشر تقريبي من بيانات الرياح التجريبية', glyph:'storm'},
 dust: {label:'مؤشر العواصف الترابية (سرعة الرياح)', unit:'كم/ساعة', field:'wind', threshold:50, source:'مؤشر تقريبي من بيانات الرياح التجريبية', glyph:'wind'}
};
const regionFactors = {
 'الرياض':1.00,'جدة':1.08,'مكة المكرمة':1.05,'المدينة المنورة':0.96,'تبوك':0.92,
 'حائل':0.94,'أبها':1.06,'جازان':1.10,'الدمام':1.03,'القصيم':0.98,'الجوف':0.91,
 'المنطقة الشرقية':1.03,'منطقة عسير':1.06,'منطقة تبوك':0.92,'المنطقة الشمالية':0.93
};
function getSelectedRisk(){
 const chosen = document.querySelector('.haz-option input:checked');
 return chosen?.closest('.haz-option')?.dataset.risk || selectedRisk || 'rain';
}
function syncIndicator(){
 syncAsset();
 selectedRisk = getSelectedRisk();
 const customRisk = selectedRisk === 'other';
 const customName = ($('#otherHazardText')?.value || '').trim();
 const cfg = riskConfig[selectedRisk];
 const regionName = region || $('#region')?.value || 'الرياض';
 const factor = regionFactors[regionName] || 1.0;
 const row = weatherDataset[weatherDataset.length - 1];
 const value = customRisk ? '—' : Math.round(row[cfg.field] * factor);
 const unit = customRisk ? '—' : cfg.unit;
 $('#indicatorAsset').textContent = assetName;
 $('#indicatorRegion').textContent = regionName + ' · ' + (customRisk ? (customName || 'أخطار طبيعية أخرى') : (document.querySelector('.haz-option[data-risk="'+selectedRisk+'"] b')?.textContent || 'الخطر المختار'));
 $('#indicatorRegionValue').textContent = regionName;
 $('#indicatorMetricLabel').textContent = customRisk ? 'المؤشر المناخي' : cfg.label;
 $('#indicatorValue').textContent = value;
 $('#indicatorUnit').textContent = unit;
 $('#thresholdCurrent').textContent = value;
 $('#thresholdUnit').textContent = unit;
 $('#thresholdValue').textContent = customRisk ? 'يُحدد لاحقًا' : cfg.threshold;
 $('#thresholdUnit2').textContent = customRisk ? '' : unit;
 $('#indicatorType').textContent = customRisk ? 'يُحدد المؤشر بعد مراجعة الخطر' : cfg.label;
 $('#indicatorSource').textContent = customRisk ? 'غير محدد — نموذج تجريبي' : cfg.source;
 const pct = customRisk ? 0 : Math.min(100, Math.round(value / cfg.threshold * 100));
 $('#indicatorMeter').style.width = pct + '%';
 const glyphs = {
  rain:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17a5 5 0 1 1 .7-9.9A6 6 0 0 1 19 9a4 4 0 0 1 0 8Z"/><path d="m8 19-1 2m6-2-1 2m6-2-1 2"/></svg>',
  wind:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h13a3 3 0 1 0-3-3M2 12h19a2 2 0 1 1-2 2M4 16h10"/></svg>',
  heat:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M12 1v2m0 8v2M6 7H4m16 0h-2M10 15a2 2 0 0 1 4 0v5a2 2 0 0 1-4 0Z"/></svg>',
  storm:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a5 5 0 0 1 5-5 6 6 0 0 1 11 2 4 4 0 0 1 0 8H7"/><path d="m13 12-4 6h4l-2 4 6-8h-4l2-2"/></svg>',
  other:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18"/></svg>'
 };
 $('#indicatorGlyph').innerHTML = glyphs[customRisk ? 'other' : (cfg.glyph || selectedRisk)] || glyphs.other;
 const status = $('#thresholdStatus');
 if(customRisk){status.textContent='يُحدد المؤشر وحد التفعيل بعد مراجعة الخطر — نموذج تجريبي';status.className='status pending';}
 else if(value >= cfg.threshold){status.textContent='تم بلوغ حد المؤشر في المحاكاة — مثال فقط';status.className='status';}
 else {status.textContent='لم يتحقق حد التفعيل في المحاكاة — مثال فقط';status.className='status pending';}
}
document.querySelectorAll('.haz-option input').forEach(input => input.addEventListener('change', () => {
  const all = [...document.querySelectorAll('.haz-option input')];
  const checked = all.filter(x=>x.checked);
  const risk = input.closest('.haz-option').dataset.risk || 'rain';
  if(input.checked){
    all.forEach(x=>{ if(x!==input) x.checked=false; });
    if(risk !== 'other') selectedRisk = risk;
  } else if(!checked.length) {
    input.checked=true;
  }
  const otherChosen = document.querySelector('.haz-option[data-risk="other"] input').checked;
  $('#otherHazardField').hidden = !otherChosen;
  if(!otherChosen) $('#otherHazardText').value = '';
  syncIndicator();
}));
$('#otherHazardText')?.addEventListener('input', () => { if(document.querySelector('.haz-option[data-risk="other"] input').checked) syncIndicator(); });
function syncRequests(){
 const reqs=workflow.requests||[],docs=workflow.documents||[];
 $('#requestCount').textContent=reqs.length;
 $('#pendingCount').textContent=reqs.filter(r=>['draft','pending','more','offer'].includes(r.status)).length;
 $('#completeCount').textContent=reqs.filter(r=>r.status==='issued').length;
 const list=$('#dynamicRequests');
 if(list){list.innerHTML=reqs.length?reqs.slice().reverse().map(r=>`<article class="request-row redesigned-request"><span class="row-icon"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></span><div class="row-content"><b>طلب تغطية — ${escapeText(r.assetName||'أصل جديد')}</b><small>${escapeText(r.id)} · ${new Date(r.createdAt||Date.now()).toLocaleDateString('ar-SA')}</small><div class="request-meta"><span class="status ${r.status==='issued'||r.status==='accepted'?'':'pending'}">${statusLabel(r.status)}</span><span class="next-step">${r.status==='pending'?'بانتظار المراجعة':r.status==='accepted'?'يمكنك اختيار الباقة':r.status==='issued'?'الوثيقة التجريبية متاحة في وثائقي':r.status==='draft'?'أكملي اختيار الأخطار':'تابعي تفاصيل الطلب'}</span></div></div><button class="btn outline request-detail" data-open-request="${escapeText(r.id)}">عرض التفاصيل ←</button></article>`).join(''):'<div class="empty-docs-note">ما عندك طلبات حتى الآن. ابدئي بإضافة أصل جديد.</div>';
 list?.querySelectorAll('[data-open-request]').forEach(btn=>btn.addEventListener('click',()=>{workflow.currentId=btn.dataset.openRequest;saveWorkflow();const r=currentReq();if(!r)return;assetName=r.assetName||assetName;region=r.region||region;selectedType=r.assetType||selectedType;requestSent=true;accepted=['accepted','offer','issued'].includes(r.status);paid=r.status==='issued';$('#requestId').textContent=r.id;$('#assetName').value=r.assetName||'';$('#region').value=r.region||'الرياض';$('#address').value=r.address||'';if(r.status==='accepted'||r.status==='offer'){showPage('packages')}else if(r.status==='issued'){showPage('requests');$$('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab==='mydocs'));$('#myrequests').hidden=true;$('#mydocs').hidden=false}else{showPage('review')}}));
 }
 $('#docCount').textContent=docs.length;$('#docActiveCount').textContent=0;$('#docExpiredCount').textContent=0;$('#docSuspendedCount').textContent=0;
 const docsEl=$('#dynamicDocs'); if(docsEl){docsEl.innerHTML=docs.map(d=>`<article class="document-card"><div class="document-top"><span class="row-icon"><svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7zM15 3v5h4M10 12h6M10 16h4"/></svg></span><div class="document-title"><b>وثيقة مرصد رسكورا التجريبية</b><small>رقم الوثيقة: ${escapeText(d.id)}</small></div><span class="status info-status">معاينة تجريبية</span></div><div class="document-facts"><div><small>الأصل المؤمن عليه</small><b>${escapeText(d.assetName)}</b></div><div><small>الباقة</small><b>${escapeText(d.package)}</b></div><div><small>قيمة التغطية</small><b>${escapeText(d.price)} ريال — تجريبي</b></div><div><small>الأخطار المحددة</small><b>${escapeText((d.risks||[]).map(x=>x.label).join('، ')||'حسب الطلب')}</b></div></div><div class="hint document-notice">وثيقة نموذج تجريبي فقط؛ لا تمثل وثيقة تأمين فعلية أو تغطية سارية.</div><button class="btn outline document-detail" data-open-doc="${escapeText(d.requestId)}">عرض التفاصيل ←</button></article>`).join('');docsEl.querySelectorAll('[data-open-doc]').forEach(btn=>btn.addEventListener('click',()=>{const d=workflow.documents.find(x=>x.requestId===btn.dataset.openDoc);if(!d)return;workflow.currentId=d.requestId;saveWorkflow();syncPolicy();showPage('policy')}));}
 $('#demoDocumentCard').hidden=true;$('#emptyDocsNote').hidden=docs.length>0;
 const r=currentReq();if(r){$('#requestId').textContent=r.id;assetName=r.assetName||assetName;region=r.region||region;$('#docAsset').textContent=assetName;$('#docPackage').textContent=r.package||selectedPackage;}
}
function escapeText(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#claimDemo').addEventListener('click',()=>{window.claimSent=true;syncRequests();toast('تم إرسال طلب التعويض التجريبي للمراجعة.');go('requests')});$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#myrequests').hidden=b.dataset.tab!=='myrequests';$('#mydocs').hidden=b.dataset.tab!=='mydocs'}));

function getSavedDemoName(){
 try { return (localStorage.getItem('riskora_demo_name') || sessionStorage.getItem('riskora_demo_name') || localStorage.getItem('riskora_user_name') || sessionStorage.getItem('riskora_user_name') || '').trim(); }
 catch(e){ return (sessionStorage.getItem('riskora_demo_name') || sessionStorage.getItem('riskora_user_name') || '').trim(); }
}
function applyDemoName(name){
 const clean=(name||'').trim();
 const welcome=$('#welcomeName');
 if(welcome) welcome.textContent=clean || 'زائرنا';
 const profile=$('#profileName');
 if(profile && document.activeElement!==profile) profile.value=clean;
 const contactName=$('#contactName');
 if(contactName && !contactName.value.trim() && clean) contactName.value=clean;
}
function syncSettings(){
 const theme=document.body.classList.contains('theme-dark')?'dark':'light';
 $$('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
 applyDemoName(getSavedDemoName());
}
applyDemoName(getSavedDemoName());
$('#saveProfileName')?.addEventListener('click',()=>{
 const field=$('#profileName');
 const name=field.value.trim();
 if(!name){toast('اكتب الاسم أولًا.');field.focus();return;}
 try { localStorage.setItem('riskora_demo_name',name); } catch(e) {}
 try { sessionStorage.setItem('riskora_demo_name',name); } catch(e) {}
 applyDemoName(name);
 toast('تم حفظ الاسم وتحديث الترحيب.');
});


// Settings sub-sections and appearance controls
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-settings-tab]');
 if(tab){
  $$('[data-settings-tab]').forEach(b=>b.classList.toggle('active',b===tab));
  $$('[data-settings-pane]').forEach(p=>p.classList.toggle('active',p.dataset.settingsPane===tab.dataset.settingsTab));
 }
 const themeBtn=e.target.closest('[data-theme]');
 if(themeBtn){
  document.body.classList.toggle('theme-dark',themeBtn.dataset.theme==='dark');
  $$('[data-theme]').forEach(b=>b.classList.toggle('active',b===themeBtn));
 }
});

// In-app help assistant. This is a local FAQ helper, not a live AI service.
const helpAnswers=[
 [/بارامتري|بارامتري|المؤشر|التعويض/, 'التأمين البارامتري يعتمد على مؤشر متفق عليه مسبقًا، مثل كمية الأمطار. عند تحقق المؤشر تُطبّق شروط الوثيقة. في هذا النموذج، جميع النتائج توضيحية.'],
 [/طلب|تغطية|كيف/, 'ابدأ من «أصولي» وسجّل نوع الأصل وموقعه، ثم اختر الخطر وأرسل الطلب للمراجعة. بعد محاكاة قبول الأصل ستظهر الباقات، ثم تراجع العرض قبل خطوة الدفع التجريبي.'],
 [/دفع|بطاقة|فلوس|حقيقي/, 'لا، الدفع هنا تجريبي فقط. لا تدخلي بيانات بطاقة حقيقية، ولا يتم تحصيل أي مبلغ.'],
 [/بيانات|طقس|مصدر|أمطار/, 'بيانات الأمطار والرياح والحرارة والأضرار في النسخة الحالية بيانات محاكاة تعليمية للفترة 2017–2025، وليست سجلات رسمية أو بيانات مباشرة.'],
 [/باقة|باقات|سعر|الأسعار/, 'الباقات والأسعار في النموذج أمثلة توضيحية. في رحلة العرض تظهر الباقات بعد قبول الأصل التجريبي ومراجعة الطلب.'],
 [/وثيقة|وثائق/, 'الوثيقة التي تظهر في الموقع نموذج تجريبي للعرض وليست وثيقة تأمين فعلية.'],
 [/تواصل|مساعدة|مشكلة/, 'يمكنك فتح «تواصل معنا» من القائمة وإرسال ملاحظة. الرسالة تُعرض داخل هذه الجلسة فقط ولا تُرسل إلى خادم.'],
 [/سياسة|خصوصية|أمان/, 'افتح «سياسة الاستخدام» لقراءة توضيح عن طبيعة النموذج والبيانات والدفع والوثائق.']
];
function appendChat(text,kind){
 const box=$('#chatMessages');if(!box)return;
 const el=document.createElement('div');el.className=kind==='user'?'user-message':'bot-message';el.textContent=text;box.appendChild(el);box.scrollTop=box.scrollHeight;
}
function answerChat(q){
 const item=helpAnswers.find(([rx])=>rx.test(q));
 return item?item[1]:'أقدر أساعدك في خطوات طلب التغطية، المؤشر البارامتري، الباقات، البيانات التجريبية، أو الدفع. جرّبي اختيار أحد الأسئلة المقترحة.';
}
$('#chatLauncher')?.addEventListener('click',()=>{$('#chatWidget').hidden=!$('#chatWidget').hidden;});
$('#chatClose')?.addEventListener('click',()=>{$('#chatWidget').hidden=true;});
$$('[data-chat]').forEach(b=>b.addEventListener('click',()=>{const q=b.dataset.chat;appendChat(q,'user');appendChat(answerChat(q),'bot');}));
$('#chatForm')?.addEventListener('submit',e=>{e.preventDefault();const input=$('#chatInput');const q=input.value.trim();if(!q)return;appendChat(q,'user');appendChat(answerChat(q),'bot');input.value='';});
const topicSelect=$('#contactTopic');
function syncOtherTopic(){const wrap=$('#otherTopicWrap');if(wrap)wrap.hidden=topicSelect?.value!=='أخرى';}
topicSelect?.addEventListener('change',syncOtherTopic);syncOtherTopic();
$('#contactForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget, name=$('#contactName').value.trim(), topic=topicSelect.value==='أخرى'?$('#contactOtherTopic').value.trim():topicSelect.value, msg=$('#contactMessage').value.trim(), result=$('#contactResult'), submit=$('#contactSubmit');
 if(!msg){toast('اكتبي رسالتك أولًا.');$('#contactMessage').focus();return;}
 if(topicSelect.value==='أخرى'&&!topic){toast('اكتبي موضوع الرسالة في حقل «أخرى».');$('#contactOtherTopic').focus();return;}
 const data=new FormData(form);data.set('name',name||'زائر مرصد رسكورا');data.set('topic',topic);data.set('_subject',`رسالة جديدة من مرصد رسكورا: ${topic}`);data.delete('other_topic');
 if(submit){submit.disabled=true;submit.textContent='جارٍ الإرسال...';}
 if(result){result.hidden=false;result.className='contact-result';result.textContent='جارٍ إرسال رسالتك...';}
 try{
   const response=await fetch('https://formspree.io/f/xoejojnk',{method:'POST',body:data,headers:{'Accept':'application/json'}});
   if(!response.ok) throw new Error('form submission failed');
   if(result){result.className='contact-result success';result.textContent='تم إرسال رسالتك بنجاح. شكرًا لتواصلك مع مرصد رسكورا.';}
   form.reset();syncOtherTopic();toast('تم إرسال رسالتك بنجاح.');
 }catch(err){
   if(result){result.className='contact-result error';result.textContent='تعذّر إرسال الرسالة الآن. تحققي من اتصال الإنترنت وحاولي مرة أخرى.';}
   toast('لم يتم إرسال الرسالة. حاولي مرة أخرى.');
 }finally{if(submit){submit.disabled=false;submit.textContent='إرسال الرسالة';}}
});
// Side drawer interactions
const drawer=$('#sideDrawer'), backdrop=$('#drawerBackdrop'), menuToggle=$('#menuToggle');
function setDrawer(open){if(!drawer||!backdrop||!menuToggle)return;drawer.classList.toggle('open',open);backdrop.hidden=!open;drawer.setAttribute('aria-hidden',String(!open));menuToggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('drawer-open',open);}
menuToggle?.addEventListener('click',()=>setDrawer(!drawer.classList.contains('open')));
$('#drawerClose')?.addEventListener('click',()=>setDrawer(false));backdrop?.addEventListener('click',()=>setDrawer(false));
drawer?.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>setDrawer(false)));
drawer?.querySelector('[data-drawer-page="assistant"]')?.addEventListener('click',()=>{setDrawer(false);$('#chatWidget').hidden=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setDrawer(false)});
// Active state for bottom navigation
function updateMobileNav(id){$$('.mobile-nav [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id || (['review','packages','offer','policy'].includes(id)&&b.dataset.page==='hazard')));}
const originalShowPage=showPage;
showPage=function(id){originalShowPage(id);updateMobileNav(id);};

// File selection previews: files remain local to the browser demo and are not uploaded.
document.querySelectorAll('input[type="file"]').forEach((input,index)=>{
 const preview=document.createElement('div');
 preview.className='file-selection-preview';
 preview.setAttribute('aria-live','polite');
 input.insertAdjacentElement('afterend',preview);
 input.addEventListener('change',()=>{
  preview.innerHTML='';
  const files=[...(input.files||[])];
  if(!files.length)return;
  const title=document.createElement('div');title.className='file-selection-title';title.textContent=`تم اختيار ${files.length} ملف`;preview.appendChild(title);
  files.forEach(file=>{
   const row=document.createElement('div');row.className='file-selection-row';
   if(file.type.startsWith('image/')){
    const img=document.createElement('img');img.alt=file.name;img.src=URL.createObjectURL(file);row.appendChild(img);
   }else{
    const ico=document.createElement('span');ico.className='file-generic-icon';ico.textContent='FILE';row.appendChild(ico);
   }
   const info=document.createElement('span');info.className='file-selection-info';
   const name=document.createElement('b');name.textContent=file.name;
   const size=document.createElement('small');size.textContent=file.size<1024*1024?`${Math.max(1,Math.round(file.size/1024))} KB`:`${(file.size/1024/1024).toFixed(1)} MB`;
   info.append(name,size);row.appendChild(info);preview.appendChild(row);
  });
 });
});


// Demo-only name + password sign-in (no email).
(function setupDemoLogin(){
  const screen = document.getElementById('loginScreen');
  const form = document.getElementById('loginForm');
  if (!screen || !form) return;
  const nameField = document.getElementById('loginName');
  const passwordField = document.getElementById('loginPassword');
  const error = document.getElementById('loginError');
  const toggle = document.getElementById('togglePassword');
  const app = document.querySelector('body');
  const storedName = getSavedDemoName();
  const signedIn = sessionStorage.getItem('riskora_demo_signed_in') === '1' && !!storedName;
  if (signedIn) screen.hidden = true;
  if (storedName) { nameField.value = storedName; applyDemoName(storedName); }
  if (toggle) toggle.addEventListener('click', () => {
    const reveal = passwordField.type === 'password';
    passwordField.type = reveal ? 'text' : 'password';
    toggle.textContent = reveal ? 'إخفاء' : 'إظهار';
    toggle.setAttribute('aria-label', reveal ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = nameField.value.trim();
    const password = passwordField.value;
    if (!username || !password) {
      error.textContent = 'اكتب الاسم وكلمة المرور للمتابعة.';
      error.hidden = false;
      return;
    }
    // This is a UI prototype only; no server-side authentication.
    sessionStorage.setItem('riskora_demo_signed_in', '1');
    sessionStorage.setItem('riskora_demo_name', username);
    sessionStorage.setItem('riskora_user_name', username);
    try { localStorage.setItem('riskora_demo_name', username); localStorage.setItem('riskora_user_name', username); } catch(e) {}
    screen.hidden = true;
    applyDemoName(username);
  });
})();




// Reliable page navigation, page-local back button, and Arabic/English UI.
(function riskoraLanguageAndNavigation(){
  const languageSelect = document.getElementById('languageSelect');
  const pages = [...document.querySelectorAll('main .page')];
  let previousPage = 'home';
  const pageStack = ['home'];

  const translations = {
    'الرئيسية':'Home','أصولي':'My Assets','تغطية':'Coverage','طلب تغطية':'Coverage Request',
    'طلباتي ووثائقي':'My Requests & Policies','طلباتي':'My Requests','المؤشرات':'Indicators',
    'بيانات النموذج':'Model Data','الإشعارات':'Notifications','الإعدادات':'Settings',
    'عن مرصد رسكورا':'About Mirsad Riskora','سياسة الاستخدام':'Usage Policy','تواصل معنا':'Contact Us',
    'رجوع':'Back','السابق':'Previous','التالي':'Next','إلغاء':'Cancel','حفظ':'Save',
    'إضافة الأصل':'Add Asset','أضف الأصل المراد تأمينه':'Add the asset to insure',
    'اختيار نوع الأصل وإضافة موقعه وصوره':'Choose asset type, location and photos',
    'الاسم':'Name','كلمة المرور':'Password','تسجيل الدخول':'Sign In',
    'مظهر التطبيق':'App Appearance','اللغة':'Language','لغة واجهة التطبيق':'App language',
    'الوضع الفاتح والداكن':'Light and dark mode','العربية':'Arabic',
    'الإشعارات':'Notifications','الخصوصية والأمان':'Privacy & Security',
    'المساعدة':'Help','مساعد رسكورا':'Riskora Assistant','عن مرصد رسكورا':'About Mirsad Riskora',
    'الأمطار والسيول':'Rain & Floods','الأمطار الغزيرة والسيول':'Heavy Rain & Floods',
    'الرياح الشديدة':'Strong Winds','موجات الحرارة':'Heat Waves','العواصف الرعدية':'Thunderstorms',
    'العواصف الترابية':'Dust Storms','اختر الخطر':'Choose Risk','اختيار الباقة':'Choose Package',
    'طلب التغطية':'Coverage Request','حالة الطلب':'Request Status','حفظ الأصل والمتابعة ←':'Save Asset & Continue →',
    'إرسال الطلب للمراجعة ←':'Submit for Review →','ابدأ طلب التغطية ←':'Start Coverage Request →',
    'رحلتك في 4 خطوات واضحة':'Your journey in 4 clear steps','سجّل الأصل':'Register Asset',
    'اختر الخطر':'Choose Risk','انتظر المراجعة':'Await Review','راجع العرض':'Review Offer',
    'بدون دفع في البداية':'No payment at the start','معلومات مهمة قبل تجربة المنصة':'Important information before using the prototype',
    'الوضع الفاتح':'Light','داكن':'Dark','فاتح':'Light','اختر المنطقة':'Choose Region',
    'المنطقة':'Region','اسم الأصل':'Asset Name','العنوان أو وصف الموقع':'Address or Location Description',
    'صور الأصل الحالية':'Current Asset Photos','إرسال الملاحظة':'Send Feedback'
  };
  const originals = new WeakMap();
  function applyLanguage(lang){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.body.classList.toggle('lang-en', lang === 'en');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      if(!n.nodeValue.trim() || n.parentElement.closest('script,style,select,option,input,textarea,.no-translate')) continue;
      if(!originals.has(n)) originals.set(n,n.nodeValue);
      const original = originals.get(n);
      if(lang === 'ar'){ n.nodeValue = original; continue; }
      let value = original;
      const trimmed = value.trim();
      const key = Object.keys(translations).sort((a,b)=>b.length-a.length).find(k=>trimmed===k);
      if(key) value = value.replace(trimmed, translations[key]);
      n.nodeValue = value;
    }
    document.querySelectorAll('[data-page-back] .back-label').forEach(el=>el.textContent = lang==='en'?'Back':'رجوع');
    document.querySelectorAll('[data-page-back] .back-arrow').forEach(el=>el.textContent = lang==='en'?'←':'→');
    document.querySelectorAll('[data-page-back]').forEach(el=>el.setAttribute('aria-label',lang==='en'?'Back':'رجوع'));
    if(languageSelect) languageSelect.value=lang;
    try { localStorage.setItem('riskora_language',lang); } catch(e){}
  }
  if(languageSelect) languageSelect.addEventListener('change',()=>applyLanguage(languageSelect.value));
  let saved='ar'; try { saved=localStorage.getItem('riskora_language')||'ar'; } catch(e){}
  applyLanguage(saved);

  function activePageId(){
    return document.querySelector('main .page.active')?.id || 'home';
  }
  document.querySelectorAll('[data-page]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.page;
      const current=activePageId();
      if(id && id!==current){ previousPage=current; pageStack.push(id); }
    });
  });
  document.querySelectorAll('[data-go]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.go;
      const current=activePageId();
      if(id && id!==current){ previousPage=current; pageStack.push(id); }
    });
  });
  document.querySelectorAll('[data-page-back]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const current=activePageId();
      while(pageStack.length && pageStack[pageStack.length-1]===current) pageStack.pop();
      let target=pageStack.pop() || (current==='settings'?'home':previousPage) || 'home';
      const navButton=document.querySelector('[data-page="'+target+'"]');
      if(navButton) navButton.click();
      else {
        const goButton=document.querySelector('[data-go="'+target+'"]');
        if(goButton) goButton.click();
        else document.querySelector('[data-page="home"]')?.click();
      }
    });
  });
  window.addEventListener('popstate',()=>{
    const target=pageStack.pop() || 'home';
    document.querySelector('[data-page="'+target+'"]')?.click();
  });
})();

try{syncRequests()}catch(e){console.warn('workflow init',e)}
const restoredRequest=currentReq(); if(restoredRequest){assetName=restoredRequest.assetName||assetName;region=restoredRequest.region||region;selectedType=restoredRequest.assetType||selectedType;selectedPackage=restoredRequest.package||selectedPackage;requestSent=!['draft'].includes(restoredRequest.status);accepted=['accepted','offer','issued'].includes(restoredRequest.status);paid=restoredRequest.status==='issued';}
