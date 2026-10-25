
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
const WORKFLOW_KEY_PREFIX='riskora_workflow_user_v1:';
function activeAccountName(){try{return (sessionStorage.getItem('riskora_demo_signed_in')==='1'?(sessionStorage.getItem('riskora_demo_name')||sessionStorage.getItem('riskora_user_name')||''):'').trim()}catch(e){return ''}}
function accountWorkflowKey(name=activeAccountName()){return WORKFLOW_KEY_PREFIX+(name?name.toLocaleLowerCase('ar'):'signed-out')}
function emptyWorkflow(){return {requests:[],documents:[],currentId:null}}
let workflow=emptyWorkflow();
function loadWorkflow(){try{workflow=JSON.parse(localStorage.getItem(accountWorkflowKey()))||emptyWorkflow()}catch(e){workflow=emptyWorkflow()}requestSent=!!currentReqSafe()?.status&&currentReqSafe().status!=='draft';accepted=['accepted','offer','signed','amendment_pending','issued'].includes(currentReqSafe()?.status);paid=currentReqSafe()?.status==='issued';}
function currentReqSafe(){return workflow.requests.find(r=>r.id===workflow.currentId)||null}
function saveWorkflow(){try{localStorage.setItem(accountWorkflowKey(),JSON.stringify(workflow))}catch(e){}}
function currentReq(){return workflow.requests.find(r=>r.id===workflow.currentId)||null;}
window.riskoraLoadUserWorkflow=function(){loadWorkflow();syncRequests();const r=currentReq();if(r){assetName=r.assetName||'منزلي في الرياض';region=r.region||'الرياض';selectedType=r.assetType||'منزل';selectedPackage=r.package||'المتوازنة';$('#assetName').value=r.assetName||'';$('#region').value=r.region||'الرياض';$('#address').value=r.address||'';}else{requestSent=false;accepted=false;paid=false;assetName='منزلي في الرياض';region='الرياض';selectedType='منزل';selectedPackage='المتوازنة';$('#assetName').value='';$('#address').value='';}showPage('home')};
loadWorkflow(); function statusLabel(s){return ({pending:'قيد مراجعة الأصل',more:'بانتظار استكمال البيانات',accepted:'تم قبول الأصل',offer:'بانتظار إكمال العرض',offer_review:'العرض جاهز لمراجعة الإصدار',signed:'بانتظار الدفع',amendment_pending:'طلب التعديل قيد المراجعة',rejected_by_client:'مرفوض من العميل',expired:'انتهت صلاحية العرض',issued:'صدرت وثيقة تجريبية',rejected:'لم تتم الموافقة'})[s]||'قيد المراجعة'}const pages=['home','asset','hazard','risk-details','review','packages','offer','policy','indicator','claim','requests','data','settings','notifications','about','policy-use','contact','faq','terms','privacy','renewal'];const titles={home:'الرئيسية',asset:'أصولي',hazard:'طلب التغطية','risk-details':'تفاصيل التغطية',review:'مراجعة الطلب',packages:'اختيار الباقة',offer:'مراجعة العرض والدفع',policy:'إصدار الوثيقة',indicator:'المؤشرات',claim:'طلب تعويض',requests:'طلباتي ووثائقي',data:'بيانات النموذج',settings:'الإعدادات',notifications:'الإشعارات',about:'عن مرصد رسكورا','policy-use':'سياسة الاستخدام',contact:'تواصل معنا',faq:'الأسئلة الشائعة',terms:'شروط وأحكام الاستخدام',privacy:'سياسة الخصوصية',renewal:'مكافأة التجديد'};function go(id){if(id==='asset'){
/* كل دخول إلى نموذج الأصل من التنقل يبدأ طلبًا جديدًا فارغًا؛ لا نمسح الطلبات المحفوظة في السجل. */
workflow.currentId=null;requestSent=false;accepted=false;paid=false;assetName='';region='الرياض';selectedType='منزل';selectedPackage='المتوازنة';
const nameField=$('#assetName'),addressField=$('#address'),regionField=$('#region');if(nameField)nameField.value='';if(addressField)addressField.value='';if(regionField)regionField.value='الرياض';
$$('.type').forEach(x=>x.classList.toggle('selected',x.dataset.type==='منزل'));document.querySelectorAll('.haz-option input').forEach(x=>x.checked=x.closest('.haz-option')?.dataset.risk==='rain');
if($('#hazNotes'))$('#hazNotes').value='';if($('#otherHazardText'))$('#otherHazardText').value='';if($('#otherHazardField'))$('#otherHazardField').hidden=true;
}if((id==='packages'||id==='offer'||id==='policy'||id==='indicator'||id==='claim')&&!accepted){toast('تظهر هذه المرحلة بعد قبول الأصل في رحلة الطلب.');if(requestSent)showPage('review');else showPage('asset');return}showPage(id)}function showPage(id){if(id==='packages'){const r=currentReq();if(r&&['pending','accepted'].includes(r.status)){r.status='accepted';accepted=true;r.updatedAt=new Date().toISOString();saveWorkflow();syncRequests()}}if(id==='home'||id==='settings')applyDemoName(getSavedDemoName());$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id||(id==='hazard'&&b.dataset.page==='hazard')||(['review','packages','offer'].includes(id)&&b.dataset.page==='hazard')));window.scrollTo({top:0,behavior:'smooth'});if(id==='hazard')syncAsset();if(id==='risk-details')renderRiskDetails();if(id==='offer')syncOffer();if(id==='policy')syncPolicy();if(id==='indicator')syncIndicator();if(id==='requests')syncRequests();if(id==='data')renderWeatherData();if(id==='settings')syncSettings()}function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}document.addEventListener('click',e=>{const goBtn=e.target.closest('[data-go]');if(goBtn)go(goBtn.dataset.go);const nav=e.target.closest('[data-page]');if(nav)go(nav.dataset.page)});$$('.type').forEach(b=>b.addEventListener('click',()=>{$$('.type').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedType=b.dataset.type}));function syncAsset(){assetName=$('#assetName').value.trim()||`أصل ${selectedType} في ${$('#region').value}`;region=$('#region').value;$('#summaryAsset').textContent=assetName;$('#summaryRegion').textContent=region}$('#saveAsset').addEventListener('click',()=>{syncAsset();if(!$('#address').value.trim()){toast('أضيفي وصف الموقع أو العنوان قبل المتابعة.');$('#address').focus();return}let draft=currentReq(); if(!draft || draft.status!=='draft'){draft={id:'REQ-2026-'+String(Date.now()).slice(-6),assetName,assetType:selectedType,region,address:$('#address').value.trim(),status:'draft',createdAt:new Date().toISOString(),risks:[]};workflow.requests.push(draft);workflow.currentId=draft.id;saveWorkflow()}else{draft.assetName=assetName;draft.assetType=selectedType;draft.region=region;draft.address=$('#address').value.trim();saveWorkflow()} toast('تم حفظ بيانات الأصل. أكملي تحديد الأخطار لإرسال الطلب.');go('hazard')});$('#submitRequest').addEventListener('click',()=>{syncAsset();if(document.querySelector('.haz-option[data-risk="other"] input').checked && !$('#otherHazardText').value.trim()){toast('اكتبي الخطر الطبيعي الذي ترغبين في تغطيته.');$('#otherHazardText').focus();return}showPage('risk-details')});function submitCoverageRequest(){syncAsset();requestSent=true;let req=currentReq();if(!req){req={id:'REQ-2026-'+String(Date.now()).slice(-6),createdAt:new Date().toISOString()};workflow.requests.push(req);workflow.currentId=req.id}req.assetName=assetName;req.assetType=selectedType;req.region=region;req.address=$('#address').value.trim();req.risks=[...document.querySelectorAll('.haz-option input:checked')].map(x=>({key:x.closest('.haz-option').dataset.risk,label:x.closest('.haz-option').querySelector('b').textContent}));req.otherRisk=$('#otherHazardText').value.trim();req.notes=$('#hazNotes').value.trim();req.status='pending';req.updatedAt=new Date().toISOString();accepted=false;paid=false;saveWorkflow();$('#requestId').textContent=req.id;syncRequests();showPage('review');toast('تم إنشاء الطلب وحفظه في طلباتي.')}$('#continueRiskDetails').addEventListener('click',submitCoverageRequest);$('#approveDemo').addEventListener('click',()=>{accepted=true;const req=currentReq();if(req){req.status='accepted';req.updatedAt=new Date().toISOString();saveWorkflow()}syncRequests();toast('تمت محاكاة قبول الأصل. الباقات أصبحت متاحة.');showPage('packages')});$$('.selectPackage').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.package');selectedPackage=card.dataset.package;$$('.package').forEach(p=>{p.classList.toggle('selected',p===card);p.classList.toggle('featured',p===card)});$$('.selectPackage').forEach(btn=>{btn.textContent=btn.closest('.package')===card?'✓ تم اختيار الباقة':'اختيار الباقة';btn.classList.toggle('outline',btn.closest('.package')!==card)});const req=currentReq();if(req){req.package=selectedPackage;req.status='offer';saveWorkflow()}toast('تم اختيار '+selectedPackage)}));const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590},benefits={'الأساسية':'2,500','المتوازنة':'5,000','الأعمال':'10,000'};$('#continueOffer').addEventListener('click',()=>{syncOffer();go('offer')});
function money(n){const en=document.documentElement.lang==='en';return new Intl.NumberFormat(en?'en-US':'ar-SA',{maximumFractionDigits:2}).format(n)+(en?' SAR':' ريال')}
function syncOffer(){
 const req=currentReq()||{}; syncAsset();
 const pkg=req.package||selectedPackage; selectedPackage=pkg;
 const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590}, benefits={'الأساسية':2500,'المتوازنة':5000,'الأعمال':10000};
 const price=prices[pkg]||prices['المتوازنة'], vat=Math.round(price*.15*100)/100, total=price+vat;
 const today=new Date(); if(!req.offerCreatedAt){req.offerCreatedAt=today.toISOString();req.offerExpiresAt=new Date(today.getTime()+14*24*60*60*1000).toISOString();saveWorkflow()} const issuedAt=new Date(req.offerCreatedAt), expiry=new Date(req.offerExpiresAt||issuedAt.getTime()+14*24*60*60*1000);
 const fmt=d=>d.toLocaleDateString(document.documentElement.lang==='en'?'en-GB':'ar-SA',{year:'numeric',month:'long',day:'numeric'});
 const put=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v||'غير متوفر'};
 put('offerNumber',req.id||'سيُحدد عند إنشاء الطلب');put('offerDate',fmt(issuedAt));put('offerExpiryDate',(document.documentElement.lang==='en'?'Expires on ':'ينتهي في ')+fmt(expiry));put('offerCustomer',getSavedDemoName()||'العميل');put('offerAsset',req.assetName||assetName);put('offerRegion',req.region||region);put('offerAddress',req.address||'غير مضاف');put('offerAssetType',req.assetType||selectedType);put('offerPackage',pkg);put('offerBenefit',money(benefits[pkg]||benefits['المتوازنة']));put('offerPrice',money(price));put('offerVat',money(vat)+' (15% توضيحية)');put('offerTotal',money(total));put('paySummaryPrice',money(price));put('paySummaryVat',money(vat));put('paySummaryTotal',money(total));
 const expiryEl=document.getElementById('offerExpiryDate'); if(expiryEl)expiryEl.dataset.expires=expiry.toISOString();
 const riskBox=document.getElementById('quoteRiskTables'); if(riskBox){const risks=Array.isArray(req.risks)?req.risks:[];const en=document.documentElement.lang==='en';
 const labels=en?{rain:'Heavy Rainfall & Flooding',wind:'Severe Winds',heat:'Heatwaves',storm:'Thunderstorms',dust:'Dust Storms',hail:'Hail',frost:'Frost',other:req.otherRisk||'Other Risk'}:{rain:'الأمطار الغزيرة والسيول',wind:'الرياح الشديدة',heat:'موجات الحرارة',storm:'العواصف الرعدية',dust:'العواصف الترابية',hail:'البَرَد',frost:'الصقيع',other:req.otherRisk||'خطر آخر'};
 riskBox.innerHTML=risks.length?risks.map(r=>{const key=r.key||'other';const cfg=(typeof riskConfig!=='undefined'&&riskConfig[key])?riskConfig[key]:null;const trigger=cfg?`${cfg.threshold} ${cfg.unit}`:(en?'To be confirmed after risk review':'يُحدد بعد مراجعة الخطر');const measure=cfg?(en?({'مؤشر هطول الأمطار':'Rainfall Index','مؤشر سرعة الرياح':'Wind Speed Index','مؤشر درجة الحرارة':'Temperature Index'}[cfg.label]||cfg.label):cfg.label):(en?'Risk Index':'مؤشر الخطر');return `<article class="quote-risk-card"><h4>${labels[key]||r.label||(en?'Selected Risk':'خطر مختار')}</h4><table class="quote-table"><thead><tr><th>${en?'Index':'المؤشر'}</th><th>${en?'Demo Trigger Threshold':'حد التفعيل التجريبي'}</th><th>${en?'Package Benefit Limit':'حد المنفعة للباقة'}</th><th>${en?'Notes':'ملاحظات'}</th></tr></thead><tbody><tr><td>${measure}</td><td>${trigger}</td><td>${money(benefits[pkg]||5000)}</td><td>${en?'Illustrative package limit, not an approved payout for each event':'حد توضيحي للباقة وليس مبلغ تعويض معتمدًا لكل حادث'}</td></tr></tbody></table><p class="quote-note">${en?'The index source is simulated in this prototype. Compensation limits and measurement rules require final approval before real-world use.':'مصدر المؤشر الحالي تجريبي داخل النموذج. يحتاج حد التعويض وقواعد القياس إلى اعتماد نهائي قبل أي استخدام فعلي.'}</p></article>`}).join(''):`<div class="quote-risk-card"><p>${en?'No risks are saved in this request. Return to risk details and complete your selection.':'لا توجد أخطار محفوظة في الطلب الحالي. ارجعي إلى تفاصيل الخطر وأكملي الاختيار.'}</p></div>`;
 }
 const reqStatus=req.status||'offer';const badge=document.getElementById('quoteStatusBadge');if(badge)badge.textContent=({offer:'عرض مبدئي',amendment_pending:'طلب تعديل قيد المراجعة',rejected_by_client:'مرفوض من العميل',expired:'منتهي الصلاحية',signed:'موقّع — بانتظار الدفع',issued:'صدرت وثيقة تجريبية'})[reqStatus]||'عرض مبدئي';const amendPanel=document.getElementById('quoteAmendPanel'),amendConfirmation=document.getElementById('quoteAmendConfirmation'),pendingNotice=document.getElementById('quoteAmendPendingNotice');if(reqStatus==='amendment_pending'){if(amendPanel)amendPanel.hidden=true;if(amendConfirmation)amendConfirmation.hidden=false;if(pendingNotice)pendingNotice.hidden=false}else{if(amendConfirmation)amendConfirmation.hidden=true;if(pendingNotice)pendingNotice.hidden=true}
 const expired=Date.now()>expiry.getTime(); if(expired && req.status!=='issued' && req.status!=='rejected_by_client'){req.status='expired';saveWorkflow()} const accept=document.getElementById('quoteAccept'),amend=document.getElementById('quoteAmend'),reject=document.getElementById('quoteReject');if(accept)accept.disabled=expired||['rejected_by_client','amendment_pending','issued'].includes(reqStatus);if(amend)amend.disabled=['rejected_by_client','issued'].includes(reqStatus);if(reject)reject.disabled=['rejected_by_client','issued'].includes(reqStatus);
}
$('#quotePdf').addEventListener('click',()=>window.print());
$('#quoteAccept').addEventListener('click',()=>{const req=currentReq();if(!req){toast('لا يوجد طلب حالي لعرض السعر.');return}if(!$('#terms').checked){toast('يرجى تأكيد مراجعة تفاصيل العرض أولًا.');return}if(req.status==='rejected_by_client'||req.status==='amendment_pending'){toast('لا يمكن قبول العرض في حالته الحالية.');return}const exp=document.getElementById('offerExpiryDate')?.dataset.expires;if(exp&&Date.now()>new Date(exp).getTime()){req.status='expired';saveWorkflow();syncOffer();toast('انتهت صلاحية العرض. اطلبي تجديده.');return}document.getElementById('quoteSignaturePanel').hidden=false;document.getElementById('quoteSignaturePanel').scrollIntoView({behavior:'smooth',block:'center'});});
$('#quoteSignContinue').addEventListener('click',()=>{const req=currentReq();const name=$('#quoteSignerName').value.trim();if(!name){toast('اكتبي الاسم قبل تأكيد التوقيع.');$('#quoteSignerName').focus();return}req.signerName=name;req.signedAt=new Date().toISOString();req.status='signed';req.price=({'الأساسية':180,'المتوازنة':320,'الأعمال':590}[req.package||selectedPackage]||320);req.vat=Math.round(req.price*.15*100)/100;req.total=req.price+req.vat;saveWorkflow();syncRequests();document.getElementById('quotePaymentPanel').hidden=false;document.getElementById('quotePaymentPanel').scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('quoteStatusBadge').textContent='موقّع — بانتظار الدفع';toast('تم حفظ التوقيع التجريبي. يمكنك الانتقال للدفع التجريبي.');});
$('#quoteAmend').addEventListener('click',()=>{const req=currentReq();if(!req){toast('لا يوجد طلب حالي.');return}if(['amendment_pending','rejected_by_client','issued','expired'].includes(req.status)){toast('لا يمكن طلب تعديل في حالة العرض الحالية.');return}const panel=document.getElementById('quoteAmendPanel');panel.hidden=false;document.getElementById('quoteAmendConfirmation').hidden=true;panel.scrollIntoView({behavior:'smooth',block:'center'});});
function cancelQuoteAmend(){const panel=document.getElementById('quoteAmendPanel');if(panel)panel.hidden=true;document.querySelectorAll('input[name="quoteAmendType"]').forEach(x=>x.checked=false);const note=document.getElementById('quoteAmendNote');if(note)note.value='';document.getElementById('quotationPrintable').scrollIntoView({behavior:'smooth',block:'start'});}
document.getElementById('quoteAmendCancel').addEventListener('click',cancelQuoteAmend);
document.getElementById('quoteAmendBack').addEventListener('click',()=>document.getElementById('quotationPrintable').scrollIntoView({behavior:'smooth',block:'start'}));
$('#quoteAmendSubmit').addEventListener('click',()=>{const req=currentReq();if(!req)return;const note=$('#quoteAmendNote').value.trim();const types=[...document.querySelectorAll('input[name="quoteAmendType"]:checked')].map(x=>x.value);if(!types.length){toast('حددي بندًا واحدًا على الأقل للتعديل.');return}if(!note){toast('اكتبي تفاصيل التعديل المطلوب.');$('#quoteAmendNote').focus();return}req.status='amendment_pending';req.amendment={types,note,createdAt:new Date().toISOString()};req.updatedAt=new Date().toISOString();saveWorkflow();syncRequests();syncOffer();document.getElementById('quoteAmendPanel').hidden=true;document.getElementById('quoteAmendConfirmation').hidden=false;document.getElementById('quoteAmendPendingNotice').hidden=false;document.getElementById('quoteAmendConfirmation').scrollIntoView({behavior:'smooth',block:'center'});toast('تم إرسال طلب التعديل وحفظه في طلباتي.');});
$('#quoteReject').addEventListener('click',()=>{const req=currentReq();if(!req)return;if(req.status==='rejected_by_client'){go('requests');return}if(!confirm('هل تريدين رفض عرض السعر؟ سيُحفظ العرض كمرفوض ولن يمكن الدفع عليه.'))return;req.status='rejected_by_client';req.rejectedAt=new Date().toISOString();req.updatedAt=req.rejectedAt;saveWorkflow();syncRequests();toast('تم رفض العرض وحفظه في طلباتي.');go('requests');});
$('#payDemo').addEventListener('click',()=>{const req=currentReq();if(!req||req.status!=='signed'){toast('اقبلي العرض ووقّعيه أولًا قبل الدفع.');return}if(!$('#terms').checked){toast('يرجى تأكيد مراجعة الشروط أولًا.');return}paid=true;req.status='issued';req.package=selectedPackage;req.price=({'الأساسية':180,'المتوازنة':320,'الأعمال':590}[selectedPackage]||320);req.vat=Math.round(req.price*.15*100)/100;req.total=req.price+req.vat;req.policyId='POL-DEMO-'+req.id.slice(-6);req.issuedAt=new Date().toISOString();workflow.documents=workflow.documents.filter(d=>d.requestId!==req.id);workflow.documents.push({requestId:req.id,id:req.policyId,assetName:req.assetName,assetType:req.assetType,region:req.region,package:selectedPackage,price:req.price,total:req.total,risks:req.risks||[],status:'demo',issuedAt:req.issuedAt});saveWorkflow();toast('تم إصدار الوثيقة التجريبية تلقائيًا بعد الدفع التجريبي. لا توجد عملية مالية فعلية.');syncRequests();syncPolicy();showPage('policy');const title=$('#policyStatusTitle'),desc=$('#policyStatusDescription');if(title)title.textContent='تم إنشاء وثيقة تجريبية';if(desc)desc.textContent='هذه ليست وثيقة تأمين حقيقية ولا تمنح تغطية فعلية.';});
function issuePolicyDemo(){const req=currentReq();if(!req||!['offer_review','issued'].includes(req.status)){toast('أكملي مراجعة العرض أولًا.');return}if(req.status==='issued'){toast('الوثيقة التجريبية صادرة بالفعل.');return}paid=true;req.status='issued';req.policyId='POL-DEMO-'+req.id.slice(-6);req.issuedAt=new Date().toISOString();workflow.documents=workflow.documents.filter(d=>d.requestId!==req.id);workflow.documents.push({requestId:req.id,id:req.policyId,assetName:req.assetName,assetType:req.assetType,region:req.region,package:req.package||selectedPackage,price:req.price||prices[selectedPackage],risks:req.risks||[],status:'demo',issuedAt:req.issuedAt});saveWorkflow();toast('تم إصدار الوثيقة التجريبية وحفظها في وثائقي.');syncRequests();syncPolicy();const title=$('#policyStatusTitle'),desc=$('#policyStatusDescription');if(title)title.textContent='تم إنشاء وثيقة تجريبية';if(desc)desc.textContent='هذه ليست وثيقة تأمين حقيقية ولا تمنح تغطية فعلية.';document.getElementById('issuePolicyDemo')?.remove();}document.getElementById('issuePolicyDemo')?.addEventListener('click',issuePolicyDemo);function syncPolicy(){const req=currentReq();if(req){assetName=req.assetName||assetName;region=req.region||region;selectedPackage=req.package||selectedPackage}$('#policyAsset').textContent=assetName;$('#policyPackage').textContent=selectedPackage;$('#policyPrice').textContent=(prices[selectedPackage]||0)+' ريال'}
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

const riskDetailContent = {
 rain:{title:'الأمطار الغزيرة والسيول',glyph:'☂',className:'rain',description:'تفاصيل مقترحة للتغطية المرتبطة بالأمطار الغزيرة والسيول في موقع الأصل المحدد.',coverage:['أضرار السيول وتجمّع مياه الأمطار ضمن نطاق التغطية.','تلف المباني والممتلكات المشمولة بحسب الباقة.','أضرار المركبات أو المعدات إذا نصّت الباقة على شمولها.'],conditions:['بلوغ مؤشر الهطول المطري حد التفعيل المحدد في العرض.','تحقق المؤشر في الموقع والفترة المحددين للتغطية.','تطبيق حدود المنفعة والاستثناءات الموضحة في شروط المنتج.'],rights:['المنافع: يُدرس التعويض وفق مؤشر التفعيل وشروط التغطية المعروضة.','مسؤوليتك: إدخال بيانات الأصل والموقع بصورة صحيحة واستكمال المتطلبات المطلوبة.','حدود التغطية: لا يشمل التعويض ما لا ينطبق عليه المؤشر أو الشروط؛ وقد يختلف المؤشر عن الضرر الفعلي.']},
 wind:{title:'الرياح الشديدة',glyph:'〰',className:'wind',description:'تفاصيل مقترحة للتغطية المرتبطة بسرعة الرياح وتأثيرها على الأصل.',coverage:['أضرار الرياح بالمباني والأسقف والأجزاء الخارجية المشمولة.','تلف المعدات أو المنشآت إذا نصّت الباقة على شمولها.','الأضرار المرتبطة بالأجسام المتطايرة ضمن حدود التغطية المعتمدة.'],conditions:['بلوغ سرعة الرياح حد التفعيل المحدد في العرض.','تحقق المؤشر في الموقع والفترة المحددين.','مراعاة الاستثناءات وحد المنفعة الأقصى.'],rights:['المنافع: تُقيّم التغطية وفق مؤشر سرعة الرياح وحد المنفعة المعروضين.','مسؤوليتك: تحديد موقع الأصل وبياناته بدقة واستكمال المتطلبات.','حدود التغطية: لا يستحق التعويض تلقائيًا لمجرد حدوث رياح قوية؛ يجب تحقق شروط المؤشر.']},
 heat:{title:'موجات الحرارة',glyph:'☀',className:'heat',description:'تفاصيل مقترحة للتغطية المرتبطة بارتفاع درجات الحرارة وفق المؤشر المحدد.',coverage:['خسائر محددة مرتبطة بالحرارة إذا نصّت الباقة عليها.','الأضرار التي ينطبق عليها مؤشر الحرارة المتفق عليه.','الأصول أو الأنشطة المشمولة فقط ضمن حدود العرض.'],conditions:['بلوغ درجة الحرارة حد التفعيل المحدد.','تحقق المؤشر في الموقع والفترة المحددين.','أن يكون نوع الخسارة مشمولًا في شروط المنتج.'],rights:['المنافع: تُدرس الخسائر المشمولة وفق مؤشر الحرارة وحد المنفعة الموضحين.','مسؤوليتك: إدخال بيانات الأصل والموقع بدقة واستكمال المتطلبات.','حدود التغطية: لا تشمل التغطية جميع الأضرار المرتبطة بالحرارة تلقائيًا.']},
 storm:{title:'العواصف الرعدية',glyph:'ϟ',className:'storm',description:'تفاصيل مقترحة لتغطية الأخطار المرتبطة بالعواصف الرعدية وفق المؤشر المعتمد.',coverage:['الأضرار المشمولة الناتجة عن العواصف الرعدية.','أضرار البرق أو الصواعق إذا نُص عليها في الباقة.','أضرار الرياح المصاحبة إذا كانت ضمن نطاق التغطية.'],conditions:['تحديد مؤشر قابل للقياس ومعتمد لهذا الخطر.','بلوغ حد التفعيل في الموقع والفترة المحددين.','مراعاة الاستثناءات وحدود المنفعة.'],rights:['المنافع: تُحدد وفق مؤشر العواصف وحدود التغطية الموضحة في العرض.','مسؤوليتك: مراجعة الأخطار المشمولة تحديدًا وتقديم بيانات دقيقة.','حدود التغطية: وجود عاصفة لا يعني وحده تحقق مؤشر التعويض.']},
 dust:{title:'العواصف الترابية',glyph:'≋',className:'dust',description:'تفاصيل مقترحة للتغطية المرتبطة بالعواصف الترابية والغبار الكثيف.',coverage:['الأضرار المشمولة الناتجة عن العواصف الترابية.','أضرار المعدات أو المنشآت إذا نصّت الباقة عليها.','خسائر محددة مرتبطة بمؤشر العاصفة المتفق عليه.'],conditions:['تحديد مؤشر مناسب مثل شدة الغبار أو مستوى الرؤية بحسب تصميم المنتج.','بلوغ حد التفعيل خلال فترة التغطية.','تحقق شروط المنتج والاستثناءات المحددة.'],rights:['المنافع: تُحدد وفق مؤشر العواصف الترابية وحدود التغطية الموضحة.','مسؤوليتك: إدخال بيانات الأصل والموقع بدقة واستكمال المتطلبات.','حدود التغطية: وجود الغبار وحده لا يكفي لاستحقاق التعويض.']},
 other:{title:'أخطار طبيعية أخرى',glyph:'＋',className:'other',description:'تفاصيل أولية للخطر الذي أدخلته، وتحتاج التغطية إلى مراجعة قبل تحديد المؤشر.',coverage:['تُدرس التغطية وفق وصف الخطر الذي أدخلته.','تُحدد الأضرار الممكن شمولها بعد مراجعة طبيعة الخطر.','لا تُعرض تغطية نهائية قبل اعتماد تفاصيل الخطر.'],conditions:['مراجعة إمكانية قياس الخطر بمؤشر واضح.','تحديد مصدر البيانات وحد التفعيل المناسبين.','تحديد الاستثناءات وحد المنفعة قبل عرض الباقة.'],rights:['المنافع: تُحدد بعد مراجعة الخطر وإمكانية قياسه بمؤشر واضح.','مسؤوليتك: وصف الخطر والموقع بدقة وتقديم المعلومات المطلوبة.','حدود التغطية: هذه التفاصيل ليست موافقة على التغطية ولا وعدًا بالتعويض.']}
};
let activeRiskDetailTab='coverage';
function renderRiskDetails(){
 const risk=getSelectedRisk(),data=riskDetailContent[risk]||riskDetailContent.other;
 const customName=($('#otherHazardText')?.value||'').trim();
 $('#riskDetailTitle').textContent=(risk==='other'&&customName)?customName:data.title;
 $('#riskDetailDescription').textContent=data.description;
 const tabs=document.querySelectorAll('#risk-details [data-risk-tab]');
 tabs.forEach(btn=>{
   const active=btn.dataset.riskTab===activeRiskDetailTab;
   btn.classList.toggle('active',active);
   btn.setAttribute('aria-selected',String(active));
 });
 const items=data[activeRiskDetailTab]||data.coverage;
 const heading=activeRiskDetailTab==='coverage'?'ما الذي قد تشمل التغطية؟':activeRiskDetailTab==='conditions'?'الشروط اللازمة لاستحقاق التعويض':'المنافع والمسؤوليات';
 const icon=activeRiskDetailTab==='coverage'?'✓':activeRiskDetailTab==='conditions'?'✓':'ⓘ';
 const target=$('#riskDetailContent');
 target.innerHTML='';
 const h=document.createElement('h3'); h.textContent=heading; target.appendChild(h);
 const ul=document.createElement('ul'); ul.className='risk-detail-list';
 items.forEach(item=>{
   const li=document.createElement('li');
   const mark=document.createElement('span'); mark.className='risk-detail-list-icon'; mark.textContent=icon;
   const text=document.createElement('span'); text.textContent=item;
   li.append(mark,text); ul.appendChild(li);
 });
 target.appendChild(ul);
}
document.querySelectorAll('#risk-details [data-risk-tab]').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();activeRiskDetailTab=btn.dataset.riskTab;renderRiskDetails();}));
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
 $('#pendingCount').textContent=reqs.filter(r=>['draft','pending','more','offer','offer_review'].includes(r.status)).length;
 $('#completeCount').textContent=reqs.filter(r=>r.status==='issued').length;
 const list=$('#dynamicRequests');
 if(list){list.innerHTML=reqs.length?reqs.slice().reverse().map(r=>`<article class="request-row redesigned-request"><span class="row-icon"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></span><div class="row-content"><b>${r.status==='amendment_pending'?'طلب تعديل عرض السعر — ': 'طلب تغطية — '}${escapeText(r.assetName||'أصل جديد')}</b><small>${escapeText(r.id)} · ${new Date(r.createdAt||Date.now()).toLocaleDateString('ar-SA')}</small><div class="request-meta"><span class="status ${['rejected_by_client','rejected'].includes(r.status)?'rejected-status':(['issued','accepted'].includes(r.status)?'':'pending')}">${statusLabel(r.status)}</span><span class="next-step">${r.status==='rejected_by_client'?'تم رفض العرض وإغلاقه':r.status==='amendment_pending'?'طلب التعديل الذي أرسلته قيد المراجعة':r.status==='pending'?'بانتظار المراجعة':r.status==='accepted'?'يمكنك اختيار الباقة':r.status==='issued'?'الوثيقة التجريبية متاحة في وثائقي':r.status==='offer_review'?'راجعي العرض قبل إصدار الوثيقة':r.status==='draft'?'أكملي اختيار الأخطار':'تابعي تفاصيل الطلب'}</span></div></div>${['rejected_by_client','rejected'].includes(r.status)?'':`<button class="btn outline request-detail" data-open-request="${escapeText(r.id)}">عرض التفاصيل ←</button>`}</article>`).join(''):'<div class="empty-docs-note">ما عندك طلبات حتى الآن. ابدئي بإضافة أصل جديد.</div>';
 list?.querySelectorAll('[data-open-request]').forEach(btn=>btn.addEventListener('click',()=>{workflow.currentId=btn.dataset.openRequest;saveWorkflow();const r=currentReq();if(!r)return;if(r.status==='rejected_by_client'){syncRequests();return}assetName=r.assetName||assetName;region=r.region||region;selectedType=r.assetType||selectedType;requestSent=true;accepted=['accepted','offer','issued'].includes(r.status);paid=r.status==='issued';$('#requestId').textContent=r.id;$('#assetName').value=r.assetName||'';$('#region').value=r.region||'الرياض';$('#address').value=r.address||'';if(r.status==='accepted'||r.status==='offer'){showPage('packages')}else if(r.status==='offer_review'){showPage('policy')}else if(r.status==='issued'){showPage('requests');$$('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab==='mydocs'));$('#myrequests').hidden=true;$('#mydocs').hidden=false}else{showPage('review')}}));
 }
 $('#docCount').textContent=docs.length;$('#docActiveCount').textContent=0;$('#docExpiredCount').textContent=0;$('#docSuspendedCount').textContent=0;
 const docsEl=$('#dynamicDocs'); if(docsEl){docsEl.innerHTML=docs.map(d=>`<article class="document-card"><div class="document-top"><span class="row-icon"><svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7zM15 3v5h4M10 12h6M10 16h4"/></svg></span><div class="document-title"><b>وثيقة مرصد رسكورا التجريبية</b><small>رقم الوثيقة: ${escapeText(d.id)}</small></div><span class="status info-status">معاينة تجريبية</span></div><div class="document-facts"><div><small>الأصل المؤمن عليه</small><b>${escapeText(d.assetName)}</b></div><div><small>الباقة</small><b>${escapeText(d.package)}</b></div><div><small>قيمة التغطية</small><b>${escapeText(d.price)} ريال — تجريبي</b></div><div><small>الأخطار المحددة</small><b>${escapeText((d.risks||[]).map(x=>x.label).join('، ')||'حسب الطلب')}</b></div></div><div class="hint document-notice">وثيقة نموذج تجريبي فقط؛ لا تمثل وثيقة تأمين فعلية أو تغطية سارية.</div><button class="btn outline document-detail" data-open-doc="${escapeText(d.requestId)}">عرض التفاصيل ←</button></article>`).join('');docsEl.querySelectorAll('[data-open-doc]').forEach(btn=>btn.addEventListener('click',()=>{const d=workflow.documents.find(x=>x.requestId===btn.dataset.openDoc);if(!d)return;workflow.currentId=d.requestId;saveWorkflow();syncPolicy();showPage('policy')}));}
 $('#demoDocumentCard').hidden=true;$('#emptyDocsNote').hidden=docs.length>0;
 const r=currentReq();if(r){$('#requestId').textContent=r.id;assetName=r.assetName||assetName;region=r.region||region;$('#docAsset').textContent=assetName;$('#docPackage').textContent=r.package||selectedPackage;}
}
function escapeText(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#claimDemo').addEventListener('click',()=>{window.claimSent=true;syncRequests();toast('تم إرسال طلب التعويض التجريبي للمراجعة.');go('requests')});$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#myrequests').hidden=b.dataset.tab!=='myrequests';$('#mydocs').hidden=b.dataset.tab!=='mydocs'}));

function getSavedDemoName(){
 try { return (sessionStorage.getItem('riskora_demo_signed_in')==='1' ? (sessionStorage.getItem('riskora_demo_name') || sessionStorage.getItem('riskora_user_name') || '') : '').trim(); }
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
 try { sessionStorage.setItem('riskora_demo_name',name); sessionStorage.setItem('riskora_user_name',name); } catch(e) {}
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


// Local demo account flow: username + password, no email or server authentication.
(function setupDemoLogin(){
  const screen=document.getElementById('loginScreen'), form=document.getElementById('loginForm');
  if(!screen||!form)return;
  const nameField=document.getElementById('loginName'), passwordField=document.getElementById('loginPassword');
  const confirmWrap=document.getElementById('confirmPasswordWrap'), confirmField=document.getElementById('confirmPassword');
  const error=document.getElementById('loginError'), modeToggle=document.getElementById('authModeToggle'), submit=document.getElementById('loginSubmit');
  const toggle=document.getElementById('togglePassword'); let mode='login';
  const ACCOUNTS_KEY='riskora_demo_accounts_v1';
  function accounts(){try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'{}')}catch(e){return {}}}
  function setError(message){error.textContent=message;error.hidden=!message;}
  function setMode(next){mode=next;setError('');form.reset();confirmWrap.hidden=mode!=='register';confirmField.required=mode==='register';submit.textContent=mode==='register'?'إنشاء الحساب':'تسجيل الدخول';document.querySelector('#loginScreen h1').textContent=mode==='register'?'إنشاء حساب جديد':'أهلًا بك من جديد';document.querySelector('.login-description').textContent=mode==='register'?'أنشئ حسابًا تجريبيًا باسم مستخدم وكلمة مرور فقط.':'سجّل دخولك لمتابعة أصولك وتغطياتك التأمينية.';modeToggle.textContent=mode==='register'?'عندك حساب؟ تسجيل الدخول':'ما عندك حساب؟ إنشاء حساب جديد';passwordField.autocomplete=mode==='register'?'new-password':'current-password';}
  async function digest(value){if(window.crypto&&crypto.subtle){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}return 'demo:'+value;}
  function logout(){sessionStorage.removeItem('riskora_demo_signed_in');sessionStorage.removeItem('riskora_demo_name');sessionStorage.removeItem('riskora_user_name');screen.hidden=false;setMode('login');passwordField.value='';confirmField.value='';setError('');const drawer=document.getElementById('sideDrawer'),backdrop=document.getElementById('drawerBackdrop');if(drawer){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true')}if(backdrop)backdrop.hidden=true;document.body.classList.remove('drawer-open');window.scrollTo({top:0,behavior:'smooth'});}
  window.riskoraDemoLogout=logout;
  const storedName=getSavedDemoName();
  if(sessionStorage.getItem('riskora_demo_signed_in')==='1'&&storedName){screen.hidden=true;window.riskoraLoadUserWorkflow?.();}
  if(storedName)applyDemoName(storedName);
  if(toggle)toggle.addEventListener('click',()=>{const reveal=passwordField.type==='password';passwordField.type=reveal?'text':'password';toggle.textContent=reveal?'إخفاء':'إظهار';toggle.setAttribute('aria-label',reveal?'إخفاء كلمة المرور':'إظهار كلمة المرور')});
  modeToggle.addEventListener('click',()=>setMode(mode==='login'?'register':'login'));
  form.addEventListener('submit',async event=>{
    event.preventDefault();setError('');let username=nameField.value.trim();const password=passwordField.value;
    if(!username||!password){setError('اكتب الاسم وكلمة المرور للمتابعة.');return}
    if(username.length<2){setError('الاسم لازم يكون حرفين على الأقل.');return}
    if(password.length<6){setError('كلمة المرور لازم تكون 6 أحرف أو أكثر.');return}
    const all=accounts(),key=username.toLocaleLowerCase('ar');
    if(mode==='register'){
      if(password!==confirmField.value){setError('كلمتا المرور غير متطابقتين.');return}
      if(all[key]){setError('هذا الاسم مسجل من قبل. اختَر اسمًا آخر أو سجّل الدخول.');return}
      all[key]={name:username,passwordHash:await digest(password)};
      try{localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(all))}catch(e){setError('تعذر حفظ الحساب على هذا الجهاز.');return}
    }else{
      if(!all[key]){setError('ما لقينا حساب بهذا الاسم. أنشئ حسابًا جديدًا أولًا.');return}
      if(all[key].passwordHash!==await digest(password)){setError('كلمة المرور غير صحيحة.');return}
      username=all[key].name;
    }
    sessionStorage.setItem('riskora_demo_signed_in','1');sessionStorage.setItem('riskora_demo_name',username);sessionStorage.setItem('riskora_user_name',username);
    screen.hidden=true;applyDemoName(username);setMode('login');window.riskoraLoadUserWorkflow?.();
  });
  document.getElementById('settingsLogout')?.addEventListener('click',()=>{if(confirm('هل تريد تسجيل الخروج؟'))logout()});
  document.getElementById('drawerLogout')?.addEventListener('click',()=>{if(confirm('هل تريد تسجيل الخروج؟'))logout()});
  document.addEventListener('click',event=>{
    const protectedTarget=event.target.closest('[data-page], [data-go]');
    if(!protectedTarget||screen.hidden)return;
    if(protectedTarget.id==='drawerLogout'||protectedTarget.id==='settingsLogout')return;
    event.preventDefault();event.stopImmediatePropagation();setError('سجّل الدخول أولًا للمتابعة.');
  },true);
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
    'صور الأصل الحالية':'Current Asset Photos','إرسال الملاحظة':'Send Feedback',
    "أهلًا بك من جديد": "Welcome back",
    "سجّل دخولك لمتابعة أصولك وتغطياتك التأمينية.": "Sign in to manage your insured assets and coverage.",
    "إظهار": "Show",
    "تأكيد كلمة المرور": "Confirm password",
    "ما عندك حساب؟ إنشاء حساب جديد": "Don't have an account? Create one",
    "حساب تجريبي محفوظ على هذا الجهاز فقط، وليس حسابًا موثقًا أو آمنًا للاستخدام الحقيقي.": "This is a demo account stored on this device only. It is not a verified account and must not be used for real transactions.",
    "مرصد رسكورا · التأمين البارامتري": "Mirsad Riskora · Parametric Insurance",
    "نسخة تجريبية": "Demo Version",
    "القائمة والخدمات": "Menu & Services",
    "المساعد الذكي": "AI Assistant",
    "اسأل عن التأمين واستخدام المنصة": "Ask about insurance or how to use the platform",
    "الأسئلة الشائعة": "Frequently Asked Questions",
    "إجابات عن الطلبات والمؤشرات": "Answers about requests and indicators",
    "شروط وأحكام الاستخدام": "Terms of Use",
    "قواعد استخدام النموذج": "Guidelines for using the prototype",
    "سياسة الخصوصية": "Privacy Policy",
    "البيانات والمرفقات": "Data & Attachments",
    "التعرّف على التطبيق ومميزاته": "Explore the app and its features",
    "ملاحظات ومقترحات لتطوير التطبيق": "Feedback and Suggestions",
    "مكافأة التجديد": "Renewal Reward",
    "خصم مقترح عند تجديد التغطية": "Proposed discount when renewing coverage",
    "تسجيل الخروج": "Sign Out",
    "مرصد رسكورا · نموذج تجريبي": "Mirsad Riskora · Prototype",
    "مرحبًا،": "Hello,",
    "زائرنا": "Guest",
    "منصة التأمين البارامتري": "Parametric Insurance Platform",
    "حماية أوضح تبدأ من بياناتك": "Clearer protection starts with your data",
    "سجّل الأصل أولًا، ثم اختر الخطر. بعد مراجعة الطلب وقبوله، ستظهر لك الباقات وعرض التغطية قبل الدفع التجريبي.": "Register your asset, then select the risk. Once your request has been reviewed and provisionally approved, available packages and a coverage quotation will appear before demo payment.",
    "ابدأ طلب التغطية ←": "Start a Coverage Request →",
    "ابدأ من هنا": "Get Started",
    "رحلتك في 4 خطوات واضحة": "Your Journey in 4 Simple Steps",
    "بدون دفع في البداية": "No Upfront Payment",
    "سجّل الأصل": "Register Your Asset",
    "نوع الأصل وموقعه": "Asset type and location",
    "اختر الخطر": "Select a Risk",
    "مثل الأمطار والسيول": "For example, heavy rain and floods",
    "انتظر المراجعة": "Await Review",
    "تظهر الباقات بعد القبول": "Packages appear after approval",
    "راجع العرض": "Review the Quotation",
    "ثم الدفع التجريبي": "Then proceed to demo payment",
    "إضافة أصل": "Add an Asset",
    "سجّل المنزل أو المنشأة": "Register a property or business",
    "متابعة الطلبات": "Track Requests",
    "اعرف حالة طلبك الحالي": "Check the status of your request",
    "متابعة المؤشرات": "Monitor Indicators",
    "راقب المؤشر وحد التفعيل": "Track the index and trigger threshold",
    "طلب تعويض": "Submit a Claim",
    "عند وقوع الخطر المشمول": "When a covered event occurs",
    "المخاطر الجوية": "Weather-Related Risks",
    "أمثلة على الأخطار التي يمكن أن يشملها المنتج حسب شروط التغطية.": "Examples of risks that may be covered, subject to the applicable coverage terms.",
    "عرض الخيارات ←": "View Options →",
    "الأمطار والسيول": "Rainfall & Flooding",
    "هطول شديد / فيضانات": "Heavy rainfall / flooding",
    "الرياح الشديدة": "Severe Winds",
    "سرعة الرياح": "Wind speed",
    "موجات الحرارة": "Heatwaves",
    "درجات الحرارة القصوى": "Extreme temperatures",
    "العواصف الرعدية": "Thunderstorms",
    "عواصف شديدة حسب المؤشر": "Severe storms, as defined by the index",
    "إضافة الأصل": "Add Asset",
    "اختيار نوع الأصل وإضافة موقعه وصوره": "Choose the asset type and add its location and photos",
    "الأصل": "Asset",
    "الخطر": "Risk",
    "المراجعة": "Review",
    "الباقة": "Package",
    "أضف الأصل المراد تأمينه": "Add the Asset You Want to Insure",
    "أدخل بيانات الأصل الذي ترغب في حمايته. الصور توثّق حالته الحالية قبل بدء التغطية.": "Enter the details of the asset you want to protect. Photos document its current condition before coverage begins.",
    "منزل": "Home",
    "متجر": "Shop",
    "مزرعة": "Farm",
    "منشأة صناعية": "Industrial Facility",
    "مبنى تجاري": "Commercial Building",
    "أخرى": "Other",
    "اسم الأصل": "Asset Name",
    "المنطقة": "Region",
    "الرياض": "Riyadh",
    "مكة المكرمة": "Makkah",
    "المدينة المنورة": "Madinah",
    "القصيم": "Al-Qassim",
    "المنطقة الشرقية": "Eastern Province",
    "عسير": "Asir",
    "تبوك": "Tabuk",
    "حائل": "Hail",
    "الحدود الشمالية": "Northern Borders",
    "جازان": "Jazan",
    "نجران": "Najran",
    "الباحة": "Al-Baha",
    "الجوف": "Al-Jouf",
    "العنوان أو وصف الموقع": "Address or Location Description",
    "صور الأصل الحالية": "Current Asset Photos",
    "(اختياري حسب متطلبات المراجعة)": "(Optional, depending on review requirements)",
    "ⓘ قد تُطلب معاينة إضافية أو مستندات حسب نوع الأصل والخطر.": "ⓘ Additional inspection or documents may be required depending on the asset and risk type.",
    "إلغاء": "Cancel",
    "حفظ الأصل والمتابعة ←": "Save Asset & Continue →",
    "تقديم طلب التغطية": "Submit a Coverage Request",
    "حدد الأخطار التي ترغب في تغطيتها وأرسل الطلب للمراجعة": "Select the risks you want covered and submit your request for review",
    "الأصل المحدد": "Selected Asset",
    "منزلي في الرياض": "My home in Riyadh",
    "تعديل": "Edit",
    "اختر الأخطار التي ترغب في تغطيتها": "Select the risks you want covered",
    "الأمطار الغزيرة والسيول": "Heavy Rainfall & Flooding",
    "البَرَد، والسيول، وتجمّع مياه الأمطار والأضرار الناتجة عنها.": "Hail, flooding, rainwater accumulation, and related damage.",
    "تطاير الأسقف، وسقوط الأجسام والأضرار الناتجة عن الرياح القوية.": "Roof displacement, falling objects, and damage caused by strong winds.",
    "الحرارة الشديدة والحرائق المرتبطة بها.": "Extreme heat and related fires.",
    "الصواعق والبرق والأضرار المرتبطة بالعواصف الرعدية.": "Lightning strikes and related thunderstorm damage.",
    "العواصف الترابية": "Dust Storms",
    "العواصف الرملية والغبار الكثيف وانخفاض مستوى الرؤية.": "Sandstorms, dense dust, and reduced visibility.",
    "أخطار طبيعية أخرى": "Other Natural Hazards",
    "اكتب الخطر الطبيعي الذي ترغب في تغطيته": "Describe the natural hazard you want covered",
    "ملاحظات إضافية (اختياري)": "Additional Notes (Optional)",
    "اختيار الخطر لا يعني بدء التغطية. سيُراجع الطلب أولًا، ثم تظهر الباقات عند قبول الأصل.": "Selecting a risk does not activate coverage. Your request will be reviewed first; packages will appear if the asset is approved.",
    "السابق": "Previous",
    "عرض تفاصيل الخطر ←": "View Risk Details →",
    "تفاصيل الخطر": "Risk Details",
    "راجع التغطيات والشروط والمنافع والمسؤوليات الخاصة بالخطر الذي اخترته": "Review the coverage, terms, benefits, and responsibilities for your selected risk",
    "تفاصيل التغطية المقترحة لهذا الخطر.": "Proposed coverage details for this risk.",
    "التغطيات": "Coverage",
    "الشروط والأحكام": "Terms & Conditions",
    "المنافع والمسؤوليات": "Benefits & Responsibilities",
    "تنبيه: هذه معلومات توضيحية للنموذج التجريبي. تُحدد التغطية الفعلية والمؤشر والاستثناءات في وثيقة معتمدة، ولا تعني هذه الصفحة صدور وثيقة أو ضمان التعويض.": "Notice: This information is illustrative and for the prototype only. Actual coverage, indices, and exclusions are defined in an approved policy. This page does not issue a policy or guarantee compensation.",
    "العودة لاختيار الخطر": "Back to Risk Selection",
    "متابعة ←": "Continue →",
    "مراجعة الطلب": "Request Review",
    "تم استلام طلبك وسيتم مراجعته من الفريق المختص": "Your request has been received and will be reviewed by the relevant team",
    "تم إرسال طلبك بنجاح": "Your request was submitted successfully",
    "سيتم التحقق من بيانات الأصل والموقع والمعلومات المقدمة قبل إتاحة الباقات.": "The asset details, location, and submitted information will be verified before packages become available.",
    "رقم الطلب": "Request Number",
    "تم استلام الطلب": "Request Received",
    "تم حفظ بيانات الأصل والمخاطر المحددة": "Asset details and selected risks have been saved",
    "مكتمل": "Complete",
    "قيد المراجعة": "Under Review",
    "التحقق من بيانات الأصل والأهلية": "Verifying asset details and eligibility",
    "جاري": "In Progress",
    "قرار المراجعة": "Review Decision",
    "قبول الطلب أو طلب معلومات إضافية أو رفضه": "Approve the request, ask for more information, or decline it",
    "اختيار الباقة": "Package Selection",
    "هذه معاينة تفاعلية: اضغطي على زر «محاكاة القبول» لمشاهدة المرحلة التالية.": "Interactive preview: select “Simulate Approval” to see the next step.",
    "عرض طلباتي": "View My Requests",
    "محاكاة قبول الأصل ←": "Simulate Asset Approval →",
    "تظهر الباقات بعد قبول الأصل ومراجعة الطلب": "Packages appear after the asset is approved and the request is reviewed",
    "تم قبول الأصل مبدئيًا": "Asset Provisionally Approved",
    "تم اجتياز مراجعة الأصل التجريبية، ويمكنك الآن مقارنة عروض التغطية.": "The asset has passed the prototype review. You can now compare coverage packages.",
    "الباقة الأساسية": "Basic Package",
    "للحماية الأساسية": "Essential protection",
    "ريال / نموذج تجريبي": "SAR / demo only",
    "حد منفعة توضيحي 2,500 ريال": "Illustrative benefit limit: SAR 2,500",
    "مؤشر أساسي": "Core index",
    "تغطية حسب الشروط": "Coverage subject to terms",
    "الأكثر توازنًا": "Best Balance",
    "الباقة المتوازنة": "Balanced Package",
    "توازن بين السعر والمنفعة": "A balance of price and benefits",
    "حد منفعة توضيحي 5,000 ريال": "Illustrative benefit limit: SAR 5,000",
    "مؤشرات متعددة": "Multiple indices",
    "مرونة في التغطية": "Flexible coverage options",
    "باقة الأعمال": "Business Package",
    "للأصول والأنشطة التجارية": "For commercial assets and activities",
    "حد منفعة توضيحي 10,000 ريال": "Illustrative benefit limit: SAR 10,000",
    "مؤشرات موسعة": "Extended indices",
    "خيارات تغطية أوسع": "Broader coverage options",
    "متابعة العرض ←": "View Quotation →",
    "عرض السعر التأميني": "Insurance Quotation",
    "راجع تفاصيل العرض قبل القبول أو طلب التعديل أو الرفض": "Review the quotation before accepting, requesting changes, or declining",
    "صلاحية العرض": "Quotation Validity",
    "14 يومًا": "14 days",
    "تاريخ الانتهاء يُحسب تلقائيًا": "Expiry date is calculated automatically",
    "عرض سعر تجريبي — غير ملزم ولا يمثل وثيقة تأمين فعلية": "Demo quotation — non-binding and not an actual insurance policy",
    "عرض مبدئي": "Preliminary Quotation",
    "بيانات العرض والعميل": "Quotation & Customer Details",
    "رقم الطلب / العرض": "Request / Quotation Number",
    "تاريخ إصدار العرض": "Quotation Issue Date",
    "اسم العميل": "Customer Name",
    "يُحدّث حسب بيانات الحساب": "Updated from account details",
    "الأصل المؤمن عليه": "Insured Asset",
    "وصف الموقع": "Location Description",
    "نوع الأصل": "Asset Type",
    "مدة التغطية المقترحة": "Proposed Coverage Period",
    "12 شهرًا — نموذج تجريبي": "12 months — demo only",
    "تفاصيل الأخطار المختارة والتغطية": "Selected Risks & Coverage Details",
    "يعرض الجدول الأخطار التي اختارها العميل فقط. حدود التفعيل مأخوذة من إعدادات المؤشر التجريبي، أما مبلغ التعويض الفعلي فيتطلب اعتماد قواعد تسعير وتغطية نهائية.": "The table lists only the risks selected by the customer. Trigger thresholds are based on prototype index settings; actual compensation amounts require approved pricing and coverage rules.",
    "ستظهر الأخطار المختارة تلقائيًا هنا.": "Your selected risks will appear here automatically.",
    "تفاصيل الباقة": "Package Details",
    "الباقة المختارة": "Selected Package",
    "حد المنفعة التوضيحي للباقة": "Illustrative Package Benefit Limit",
    "السعر قبل الضريبة": "Price Before Tax",
    "ضريبة القيمة المضافة": "Value Added Tax (VAT)",
    "تُحدد عند اعتماد التسعير": "To be determined when pricing is approved",
    "الإجمالي": "Total",
    "صلاحية العرض وحالته": "Quotation Validity & Status",
    "صلاحية هذا العرض 14 يومًا من تاريخ إصداره. بعد انتهاء الصلاحية يتوقف القبول والدفع، ويمكن طلب تجديد العرض.": "This quotation is valid for 14 days from its issue date. Once it expires, acceptance and payment are disabled. You may request a renewal.",
    "أي تعديل على السعر أو التغطية يحتاج إلى مراجعة، ثم يصدر إصدار محدث للمراجعة والقبول من جديد.": "Any change to price or coverage must be reviewed. A revised quotation will then be issued for review and acceptance.",
    "الشروط العامة": "General Terms",
    "هذا عرض توضيحي ضمن النموذج التجريبي، وليس عرضًا تأمينيًا ملزمًا.": "This is an illustrative quotation within a prototype and is not a binding insurance offer.",
    "تخضع التغطية لحد التفعيل ومصدر البيانات وآلية القياس المحددة في الوثيقة النهائية.": "Coverage is subject to the trigger threshold, data source, and measurement method specified in the final policy.",
    "لا يُفترض تحقق التعويض بمجرد وجود ضرر؛ يجب تحقق المؤشر المشمول وفق الشروط المعتمدة.": "Damage alone does not automatically qualify for compensation. The covered index must meet the approved conditions.",
    "يُحدد مبلغ التعويض النهائي لكل خطر في قواعد التغطية المعتمدة، ولا يُستنتج من السعر وحده.": "The final compensation amount for each risk is defined by the approved coverage rules and cannot be inferred from price alone.",
    "لا يبدأ أي غطاء تأميني فعلي إلا بعد اعتماد الوثيقة من جهة مرخصة واستكمال المتطلبات النظامية.": "Actual insurance coverage begins only after a licensed provider issues the policy and all regulatory requirements are met.",
    "الاستثناءات العامة": "General Exclusions",
    "الأخطار غير المحددة ضمن الاختيارات أو الوثيقة المعتمدة.": "Risks not listed among the selections or in the approved policy.",
    "الأحداث التي لا تحقق حد التفعيل المحدد، حتى لو وُجد ضرر فعلي.": "Events that do not meet the specified trigger threshold, even if damage occurs.",
    "البيانات غير الصحيحة أو تعذر التحقق من الموقع أو مصدر المؤشر.": "Inaccurate information or inability to verify the location or index source.",
    "أي استثناءات إضافية يجب أن تُذكر في الشروط النهائية المعتمدة قبل إصدار وثيقة فعلية.": "Any additional exclusions must be stated in the approved final terms before an actual policy is issued.",
    "أقر بأنني راجعت تفاصيل العرض وأفهم أن هذه محاكاة تجريبية وليست تأمينًا فعليًا.": "I confirm that I have reviewed the quotation and understand that this is a demo, not actual insurance.",
    "تأكيد القبول والتوقيع التجريبي": "Confirm Acceptance & Demo Signature",
    "اكتب الاسم للموافقة على العرض قبل الانتقال إلى الدفع التجريبي.": "Enter your name to accept the quotation before proceeding to demo payment.",
    "الاسم الكامل": "Full Name",
    "تأكيد القبول والتوقيع ←": "Confirm Acceptance & Sign →",
    "طلب تعديل عرض السعر": "Request a Quotation Amendment",
    "حددي كل البنود التي ترغبين بتعديلها، ثم اشرحي طلبك قبل الإرسال.": "Select each item you would like to change, then describe your request before submitting.",
    "السعر أو القسط التأميني": "Price or Premium",
    "التغطية أو مبلغ التعويض": "Coverage or Compensation Amount",
    "حد تفعيل الخطر": "Risk Trigger Threshold",
    "الأخطار المشمولة": "Covered Risks",
    "مدة التغطية أو الشروط": "Coverage Period or Terms",
    "طلب آخر": "Other Request",
    "تفاصيل الطلب": "Request Details",
    "إلغاء والعودة للعرض": "Cancel and Return to Quotation",
    "إرسال طلب التعديل": "Submit Amendment Request",
    "تم إرسال طلب التعديل": "Amendment Request Submitted",
    "استلمنا طلبك بنجاح. سيظهر الطلب في «طلباتي» وتظهر نتيجة المراجعة عند اتخاذ القرار.": "Your request has been received. It will appear under “My Requests,” and the review outcome will be shown once a decision is made.",
    "العودة إلى عرض السعر": "Return to Quotation",
    "طلب التعديل قيد المراجعة. لا يمكن قبول العرض أو الدفع حتى صدور نتيجة المراجعة.": "Your amendment request is under review. You cannot accept the quotation or pay until a decision has been made.",
    "الدفع وإصدار الوثيقة في هذا الإصدار محاكاة فقط. لا تدخلي بيانات بطاقة حقيقية.": "Payment and policy issuance are simulated in this version. Do not enter real payment card details.",
    "رفض العرض": "Decline Quotation",
    "طلب تعديل العرض": "Request Changes",
    "قبول العرض والانتقال للتوقيع": "Accept Quotation & Continue to Signature",
    "تنزيل / طباعة PDF": "Download / Print PDF",
    "الدفع التجريبي": "Demo Payment",
    "بطاقة بنكية تجريبية": "Demo Bank Card",
    "محاكاة فقط": "Simulation Only",
    "مدى": "Mada",
    "ملخص المبلغ": "Payment Summary",
    "قيمة الباقة": "Package Price",
    "الضريبة": "Tax",
    "غير محتسبة في النموذج": "Not calculated in this prototype",
    "الإجمالي التوضيحي": "Illustrative Total",
    "تأكيد الدفع التجريبي وإصدار الوثيقة ←": "Confirm Demo Payment & Issue Demo Policy →",
    "إصدار الوثيقة": "Policy Issuance",
    "ملخص وثيقة التغطية في النموذج التجريبي": "Coverage Policy Summary — Prototype",
    "تم إنشاء وثيقة تجريبية": "Demo Policy Created",
    "هذه ليست وثيقة تأمين حقيقية ولا تمنح تغطية فعلية.": "This is not a real insurance policy and does not provide actual coverage.",
    "وثيقة مرصد رسكورا": "Mirsad Riskora Policy",
    "نموذج عرض توضيحي": "Illustrative Demo",
    "تجريبية": "Demo",
    "رقم الوثيقة": "Policy Number",
    "المتوازنة": "Balanced",
    "السعر التوضيحي": "Illustrative Price",
    "320 ريال": "SAR 320",
    "مدة التغطية": "Coverage Period",
    "تحدد عند الإصدار الفعلي": "To be determined upon actual issuance",
    "حالة الوثيقة": "Policy Status",
    "معاينة تجريبية فقط": "Demo Preview Only",
    "عرض وثائقي وطلباتي": "View My Policies & Requests",
    "متابعة المؤشرات ←": "Monitor Indicators →",
    "متابعة المؤشرات المناخية": "Monitor Climate Indicators",
    "قارن القراءة التوضيحية بحد التفعيل المحدد في العرض": "Compare the illustrative reading with the trigger threshold in your quotation",
    "بيانات محاكاة": "Simulated Data",
    "قيمة المؤشر الحالية": "Current Index Value",
    "ملم": "mm",
    "قيمة المؤشر": "Index Value",
    "حد التفعيل التوضيحي": "Illustrative Trigger Threshold",
    "لم يتحقق حد التفعيل — مثال فقط": "Trigger threshold not reached — example only",
    "نوع المؤشر": "Index Type",
    "كمية الهطول المطري": "Rainfall Amount",
    "مصدر البيانات": "Data Source",
    "ملف Excel تجريبي": "Demo Excel File",
    "المنطقة المختارة": "Selected Region",
    "آلية الاستحقاق": "Eligibility Mechanism",
    "حسب شروط الوثيقة": "Subject to policy terms",
    "القيم المعروضة مشتقة من عينة Excel التجريبية مع اختلاف توضيحي حسب المنطقة المختارة، وليست قياسات حية أو سجلات رسمية للمنطقة. لا تستخدم لاتخاذ قرار تأمين أو تعويض فعلي.": "The displayed values come from a sample demo Excel file and vary illustratively by selected region. They are not live measurements or official regional records and must not be used for actual insurance or compensation decisions.",
    "عرض بيانات Excel التجريبية ↓": "View Demo Excel Data ↓",
    "الوثيقة": "Policy",
    "انتقل إلى طلب التعويض ←": "Proceed to Claim Request →",
    "طلب تعويض عند وقوع الخطر": "Submit a Claim After an Event",
    "أرفق صور الضرر والمعلومات المتاحة لبدء المراجعة": "Attach damage photos and available information to begin the review",
    "ⓘ أرسل طلب التعويض بعد وقوع الضرر فقط. الصور للتوثيق والمراجعة، ولا تستبدل شروط المؤشر البارامتري.": "ⓘ Submit a claim only after damage has occurred. Photos support documentation and review; they do not replace the parametric index conditions.",
    "الوثيقة المرتبطة": "Linked Policy",
    "POL-DEMO-0001 — وثيقة تجريبية": "POL-DEMO-0001 — Demo Policy",
    "تاريخ وقوع الضرر": "Date of Damage",
    "وصف مختصر للضرر": "Brief Description of Damage",
    "صور الضرر بعد الحدث": "Photos of Damage After the Event",
    "مستندات داعمة (اختياري)": "Supporting Documents (Optional)",
    "يتم التحقق من حالة المؤشر وشروط الوثيقة، وقد تُطلب معلومات إضافية حسب المنتج.": "The index status and policy terms will be checked. Additional information may be requested depending on the product.",
    "إرسال طلب التعويض التجريبي ←": "Submit Demo Claim →",
    "وثائقي وطلباتي": "My Policies & Requests",
    "تابع طلباتك ووثائقك من مكان واحد": "Track your requests and policies in one place",
    "وثائقي": "My Policies",
    "إجمالي الطلبات": "Total Requests",
    "جميع طلباتك": "All your requests",
    "بانتظار المعالجة": "Awaiting Processing",
    "طلبات مكتملة": "Completed Requests",
    "تم قبولها": "Approved",
    "إجمالي الوثائق": "Total Policies",
    "وثيقة معاينة": "Preview Policy",
    "وثائق سارية": "Active Policies",
    "لا توجد وثائق فعلية": "No actual policies",
    "وثائق منتهية": "Expired Policies",
    "حسب السجل الحالي": "Based on current records",
    "وثائق موقوفة": "Suspended Policies",
    "وثيقة مرصد رسكورا التجريبية": "Mirsad Riskora Demo Policy",
    "رقم الوثيقة: POL-DEMO-0001": "Policy Number: POL-DEMO-0001",
    "معاينة تجريبية": "Demo Preview",
    "قيمة التغطية": "Coverage Amount",
    "توضيحية فقط": "Illustrative only",
    "هذه معاينة توضيحية فقط؛ لا توجد وثيقة تأمين فعلية أو تغطية سارية في النموذج الحالي.": "This is for demonstration only. The current prototype does not provide an actual insurance policy or active coverage.",
    "عرض تفاصيل الوثيقة ←": "View Policy Details →",
    "ستظهر هنا الوثائق بعد إكمال خطوات الطلب التجريبي وإصدارها. لا توجد وثيقة تأمين فعلية في هذا النموذج.": "Policies will appear here after the demo request flow is completed and a demo policy is issued. This prototype does not provide actual insurance policies.",
    "＋ إضافة أصل جديد": "+ Add New Asset",
    "بيانات تجريبية لاختبار تحليل الخطر وحدود التعويض": "Demo data for testing risk analysis and compensation thresholds",
    "تنبيه:": "Notice:",
    "هذه القيم محاكاة تعليمية وليست سجلات أرصاد رسمية، ولا تمثل منطقة محددة في المملكة.": "These values are educational simulations, not official weather records, and do not represent a specific area in Saudi Arabia.",
    "سنوات البيانات": "Data Years",
    "سنوات سُجل فيها ضرر": "Years with Recorded Damage",
    "ضمن العينة التجريبية": "Within the demo sample",
    "متوسط الأمطار": "Average Rainfall",
    "ملم في السنة": "mm per year",
    "قيمة الأصل المفترضة": "Assumed Asset Value",
    "ريال": "SAR",
    "السجل السنوي": "Annual Records",
    "يمكنك مقارنة المطر والرياح والحرارة مع حدوث الضرر وقيمته.": "Compare rainfall, wind, and temperature with damage occurrence and value.",
    "فلترة السنوات": "Filter by Year",
    "كل السنوات": "All Years",
    "السنة": "Year",
    "الأمطار (ملم)": "Rainfall (mm)",
    "العظمى (°م)": "Maximum (°C)",
    "حدوث ضرر": "Damage Occurred",
    "قيمة الضرر (ريال)": "Damage Value (SAR)",
    "قيمة الأصل (ريال)": "Asset Value (SAR)",
    "تحميل ملف البيانات Excel ↓": "Download Excel Data File ↓",
    "تابع تحديثات طلباتك والتنبيهات داخل النموذج": "Track request updates and alerts within the prototype",
    "تنبيهات حالة الطلب": "Request Status Alerts",
    "إشعار عند تغير حالة طلب التغطية.": "An alert when your coverage request status changes.",
    "تنبيهات المؤشرات": "Index Alerts",
    "تنبيه تجريبي عند الاقتراب من حد المؤشر.": "A demo alert when the index approaches its threshold.",
    "رسائل المنصة": "Platform Messages",
    "رسائل التوعية والتحديثات العامة.": "Awareness messages and general updates.",
    "هذه التفضيلات محفوظة في واجهة هذا المتصفح فقط، ولا ترسل إشعارات خارجية في النسخة الحالية.": "These preferences are saved only in this browser interface. This version does not send external notifications.",
    "منصة رقمية تجريبية للتأمين البارامتري، تساعد على استعراض الأخطار الطبيعية وفهم المؤشرات المناخية وحدود التفعيل والتعويض.": "A digital parametric insurance prototype for exploring natural hazards and understanding climate indices, trigger thresholds, and compensation.",
    "تحليل البيانات": "Data Analysis",
    "رياضيات التأمين": "Insurance Mathematics",
    "إدارة المخاطر": "Risk Management",
    "أهداف التطبيق": "Platform Objectives",
    "دعم مستهدفات رؤية السعودية 2030 في الابتكار والتحول الرقمي بقطاع التأمين.": "Support Saudi Vision 2030 goals for innovation and digital transformation in the insurance sector.",
    "توضيح آلية التأمين البارامتري من خلال تجربة رقمية سهلة الاستخدام.": "Explain parametric insurance through an easy-to-use digital experience.",
    "استعراض المؤشرات المناخية وحدود التفعيل التوضيحية للأخطار المختارة.": "Present climate indices and illustrative trigger thresholds for selected risks.",
    "مساعدة المستخدم على فهم العلاقة بين الخطر وحد التفعيل والمنفعة التأمينية التوضيحية.": "Help users understand the relationship between a risk, its trigger threshold, and the illustrative insurance benefit.",
    "تقديم تجربة رقمية واضحة تدعم الوعي بالخدمات التأمينية وإدارة المخاطر.": "Provide a clear digital experience that builds awareness of insurance services and risk management.",
    "المنصة نموذج أولي تعليمي، وليست شركة تأمين مرخصة ولا تصدر وثائق فعلية.": "This is an educational prototype, not a licensed insurance company, and it does not issue actual policies.",
    "معلومات مهمة قبل تجربة المنصة": "Important Information Before Using the Prototype",
    "طبيعة الخدمة": "Nature of the Service",
    "مرصد رسكورا نموذج أولي لأغراض العرض والتجربة التعليمية، وليس خدمة تأمين تجارية أو عرضًا ملزمًا.": "Mirsad Riskora is a prototype for demonstration and educational testing. It is not a commercial insurance service or a binding offer.",
    "البيانات والنتائج": "Data & Results",
    "بيانات الطقس والأضرار المعروضة تجريبية، وقد لا تمثل ظروف أي منطقة فعلية. النتائج الحسابية للتوضيح فقط ولا ينبغي الاعتماد عليها لاتخاذ قرار مالي أو تأميني حقيقي.": "Weather and damage data are simulated and may not reflect actual conditions in any region. Calculations are illustrative only and must not be relied on for real financial or insurance decisions.",
    "الدفع والوثائق": "Payments & Policies",
    "لا يتم تحصيل مبالغ مالية، ولا تصدر وثائق تأمين فعلية. أي مبالغ أو حالة دفع أو وثيقة تظهر في النموذج هي محاكاة.": "No money is collected and no actual insurance policies are issued. Any amounts, payment statuses, or policies shown are simulated.",
    "الملفات والخصوصية": "Files & Privacy",
    "النسخة الحالية لا تتصل بخادم أو قاعدة بيانات. تجنّب إدخال معلومات حساسة أو بيانات دفع حقيقية. الملفات التي تختارها تبقى ضمن تجربة الواجهة ولا تُرسل إلى جهة تأمين.": "This version is not connected to a server or database. Do not enter sensitive information or real payment details. Selected files remain within the interface demo and are not sent to an insurer.",
    "مكافحة الاحتيال": "Fraud Prevention",
    "أي مراجعة أو قبول أو تحقق ظاهر في الواجهة هو توضيحي فقط ولا يمثل إجراءً تنظيميًا أو اعتمادًا فعليًا.": "Any review, approval, or verification shown in the interface is illustrative only and does not represent regulatory action or actual authorization.",
    "آخر تحديث: أكتوبر 2026 · مسودة توضيحية للمشروع الطلابي.": "Last updated: October 2026 · Illustrative draft for a student project.",
    "أرسل ملاحظاتك ومقترحاتك لتطوير تطبيق مرصد رسكورا": "Share your feedback and suggestions to improve Mirsad Riskora",
    "الاسم (اختياري)": "Name (Optional)",
    "موضوع الرسالة": "Message Topic",
    "اقتراح تطوير": "Feature Suggestion",
    "ملاحظة على الواجهة": "Interface Feedback",
    "استفسار عن التطبيق": "Question About the App",
    "مشكلة تقنية": "Technical Issue",
    "اكتب موضوعك": "Enter a subject",
    "رسالتك": "Your Message",
    "إرسال الرسالة": "Send Message",
    "استقبال الملاحظات": "Feedback",
    "أرسل ملاحظاتك ومقترحاتك لتطوير تطبيق مرصد رسكورا. هذه القناة مخصصة لاستقبال الرسائل ولا تتضمن وعدًا بالرد على المرسل.": "Send feedback and suggestions to improve Mirsad Riskora. This channel collects messages but does not guarantee a response.",
    "إجابات مختصرة عن استخدام مرصد رسكورا": "Quick Answers About Mirsad Riskora",
    "ما هو مرصد رسكورا؟": "What is Mirsad Riskora?",
    "نموذج تجريبي يوضح كيف يمكن استخدام المؤشرات والبيانات المناخية لدعم فكرة التأمين البارامتري.": "A prototype demonstrating how indices and climate data can support the concept of parametric insurance.",
    "متى تظهر الباقات؟": "When do packages appear?",
    "في رحلة النموذج، تظهر الباقات بعد مراجعة الأصل ومحاكاة قبول الطلب.": "In this prototype, packages appear after the asset review and simulated approval.",
    "هل الدفع حقيقي؟": "Is the payment real?",
    "لا. الدفع والوثائق والحالات في هذه النسخة تجريبية ولا تنفذ معاملة مالية حقيقية.": "No. Payments, policies, and statuses in this version are simulated and do not process real transactions.",
    "هل المؤشرات بيانات طقس مباشرة؟": "Are the indices based on live weather data?",
    "لا، البيانات المعروضة في النموذج تجريبية ما لم يُذكر خلاف ذلك بوضوح.": "No. The data shown in the prototype is simulated unless explicitly stated otherwise.",
    "إذا تضرر الأصل ولم يصل المؤشر إلى الحد، ماذا أفعل؟": "What if the asset is damaged but the index does not reach the threshold?",
    "في منتج تأميني فعلي، يعتمد الأمر على شروط الوثيقة. يمكن أن توجد تغطية إضافية لمراجعة الضرر الفعلي، لكنها ليست مفعّلة أو مضمونة في هذا النموذج.": "For an actual insurance product, the policy terms would apply. Additional coverage for assessing actual damage may be available, but it is not enabled or guaranteed in this prototype.",
    "كيف أتواصل مع فريق رسكورا؟": "How can I contact the Riskora team?",
    "افتح «تواصل معنا» من القائمة الجانبية لإرسال ملاحظاتك ومقترحاتك. إرسال الرسائل إلى البريد يحتاج تفعيل خدمة استقبال الرسائل.": "Open “Contact Us” from the side menu to send feedback and suggestions. Email delivery requires a configured message-receiving service.",
    "أحكام عامة لاستخدام النموذج التجريبي": "General Terms for Using the Prototype",
    "الاستخدام المسؤول": "Responsible Use",
    "يستخدم الزائر النموذج لأغراض التجربة والتقييم فقط، ولا يعتمد على الأسعار أو المؤشرات أو النتائج لاتخاذ قرار مالي أو تأميني حقيقي.": "Visitors may use the prototype for testing and evaluation only. Prices, indices, and results must not be used for real financial or insurance decisions.",
    "الطلبات والوثائق": "Requests & Policies",
    "حالات المراجعة والقبول والدفع وإصدار الوثيقة محاكاة داخل الواجهة، ولا تمثل موافقة أو وثيقة تأمين فعلية.": "Review, approval, payment, and policy-issuance statuses are simulated in the interface and do not represent actual approval or insurance coverage.",
    "التحديثات": "Updates",
    "قد تتغير مكونات النموذج أثناء التطوير. أي خدمة فعلية مستقبلية ستحتاج إلى شروط معتمدة وإجراءات تشغيل مناسبة.": "Prototype features may change during development. Any future live service will require approved terms and appropriate operating procedures.",
    "مسودة توضيحية للمشروع، وليست بديلًا عن مراجعة قانونية.": "Illustrative project draft; not a substitute for legal review.",
    "كيف يتعامل النموذج الحالي مع بياناتك": "How This Prototype Handles Your Data",
    "البيانات المدخلة": "Information You Enter",
    "هذه النسخة التجريبية تعمل داخل المتصفح ولا تتصل حاليًا بقاعدة بيانات خلفية. قد يُحفظ الاسم محليًا على الجهاز لتحسين تجربة العرض.": "This prototype runs in your browser and is not currently connected to a backend database. Your name may be stored locally on this device to improve the demo experience.",
    "الصور والمرفقات": "Photos & Attachments",
    "اختيار الملفات في النموذج الحالي للمعاينة فقط؛ لا تُرفع إلى خادم عبر هذه النسخة.": "Files selected in this prototype are for preview only and are not uploaded to a server.",
    "رسائل التواصل": "Contact Messages",
    "لن تُرسل الرسائل إلى البريد حتى يتم ربط خدمة استقبال موثوقة والتحقق من إعداداتها. لا تدخل معلومات سرية أو بيانات مالية.": "Messages will not be emailed until a reliable message-receiving service is connected and configured. Do not enter confidential or financial information.",
    "حماية البيانات": "Data Protection",
    "لا تستخدم النموذج لتخزين كلمات مرور أو أرقام هوية أو بيانات دفع حقيقية. إذا أضيفت خدمات خارجية لاحقًا، يجب تحديث هذه السياسة لتوضح مزودي الخدمة والغرض من المعالجة.": "Do not use this prototype to store passwords, identity numbers, or real payment details. If external services are added, this policy must be updated to identify providers and explain how data is processed.",
    "تحكم في مظهر التطبيق وتفضيلاتك": "Manage the App Appearance and Preferences",
    "الملف الشخصي": "Profile",
    "اسمك في مرصد رسكورا": "Your Name in Mirsad Riskora",
    "مظهر التطبيق": "App Appearance",
    "الوضع الفاتح والداكن": "Light and Dark Mode",
    "اللغة": "Language",
    "لغة واجهة التطبيق": "App Interface Language",
    "التنبيهات داخل التطبيق": "In-App Alerts",
    "الخصوصية والأمان": "Privacy & Security",
    "بياناتك في النموذج التجريبي": "Your Data in the Prototype",
    "عدّل الاسم الذي يظهر لك في الترحيب داخل مرصد رسكورا.": "Change the name shown in the Mirsad Riskora welcome message.",
    "الاسم المعروض": "Display Name",
    "سيظهر الاسم في الصفحة الرئيسية ويُحفظ على هذا الجهاز في النموذج التجريبي.": "Your name will appear on the home page and be saved on this device in the prototype.",
    "حفظ الاسم": "Save Name",
    "الحساب تجريبي ومحفوظ على هذا الجهاز فقط، ولا يرتبط بخادم أو قاعدة بيانات.": "This is a demo account stored on this device only. It is not connected to a server or database.",
    "اختر الشكل المريح لك.": "Choose your preferred appearance.",
    "فاتح": "Light",
    "خلفية بيضاء وزرقاء": "White and blue background",
    "داكن": "Dark",
    "مناسب للإضاءة المنخفضة": "Suitable for low-light environments",
    "اللغة المتاحة حاليًا في النموذج.": "Languages currently available in the prototype.",
    "العربية": "Arabic",
    "اختاري لغة العرض.": "Choose the display language.",
    "اختر أنواع التنبيهات التي تظهر داخل النموذج.": "Choose which alerts appear in the prototype.",
    "حالة الطلب": "Request Status",
    "تحديثات المراجعة والقبول": "Review and approval updates",
    "المؤشرات المناخية": "Climate Indices",
    "تنبيهات تجريبية حول حد المؤشر": "Demo alerts about index thresholds",
    "تحديثات التطبيق": "App Updates",
    "رسائل عامة داخل المنصة": "General platform messages",
    "لا توجد إشعارات Push أو رسائل SMS فعلية في هذه النسخة.": "This version does not send push notifications or SMS messages.",
    "قاعدة البيانات": "Database",
    "غير متصلة": "Not Connected",
    "بيانات الطقس": "Weather Data",
    "بوابة الدفع": "Payment Gateway",
    "قراءة سياسة الاستخدام": "Read the Terms of Use",
    "تحتاج مساعدة؟": "Need Help?",
    "افتح مساعد رسكورا من الزر أسفل الشاشة.": "Open the Riskora Assistant using the button at the bottom of the screen.",
    "مكافأة مقترحة للعملاء المستوفين لشروط التجديد": "Proposed reward for customers who meet renewal criteria",
    "مكافأة تقديرًا لثقتك": "A Reward for Your Trust",
    "جدّد تغطيتك واستفد من الخصم المقترح": "Renew your coverage and benefit from a proposed discount",
    "قد يستحق العميل خصمًا عند تجديد الوثيقة إذا انتهت فترة التغطية دون مطالبات مستوفية للشروط. تطبّق المكافأة عند التجديد وبعد التحقق من الأهلية.": "Customers may qualify for a discount when renewing a policy if the coverage period ends without eligible claims. The reward applies at renewal after eligibility is verified.",
    "نسبة خصم مقترحة": "Proposed Discount Rate",
    "مثال توضيحي حسب الباقة": "Illustrative example by package",
    "الحساب مبني على أسعار الباقات المعروضة حاليًا في التطبيق.": "The calculation is based on the package prices currently shown in the app.",
    "قسط الباقة المعروض": "Displayed Package Premium",
    "خصم 10% (مقترح)": "10% Discount (Proposed)",
    "القسط بعد الخصم": "Premium After Discount",
    "خصم 3% (مقترح)": "3% Discount (Proposed)",
    "خصم 2% (مقترح)": "2% Discount (Proposed)",
    "الشروط والتنبيه": "Conditions & Notice",
    "يشترط انتهاء فترة التغطية دون مطالبات مستوفية للشروط.": "The coverage period must end without any eligible claims.",
    "تُتحقق أهلية العميل عند موعد التجديد، ولا يُعد هذا المثال وعدًا بخصم مستحق.": "Customer eligibility is checked at renewal. This example does not guarantee a discount.",
    "النسب المعروضة مقترحة وتجريبية، وتحتاج إلى اعتماد المنتج والشروط التنظيمية قبل تطبيقها فعليًا.": "The displayed rates are proposed and illustrative. Product approval and regulatory terms are required before real-world use.",
    "مساعد رسكورا": "Riskora Assistant",
    "مساعد تجريبي داخل الموقع": "Demo Assistant on the Website",
    "أهلًا! أقدر أشرح لك خطوات الطلب، المؤشر البارامتري، الباقات، والبيانات التجريبية. اختاري سؤالًا:": "Hello! I can explain the request process, parametric indices, packages, and demo data. Choose a question:",
    "ما هو التأمين البارامتري؟": "What is parametric insurance?",
    "كيف أطلب التغطية؟": "How do I request coverage?",
    "تغطية": "Coverage",
    "مرصد رسكورا | التأمين البارامتري": "Mirsad Riskora | Parametric Insurance",
    "الاسم": "Name",
    "كلمة المرور": "Password",
    "تسجيل الدخول": "Sign In",
    "بيانات النموذج": "Model Data",
    "الإشعارات": "Notifications",
    "سياسة الاستخدام": "Terms of Use",
    "تواصل معنا": "Contact Us",
    "عن مرصد رسكورا": "About Mirsad Riskora",
    "اختر المنطقة": "Select Region",
    "إرسال الطلب للمراجعة ←": "Submit for Review →",
    "طلباتي ووثائقي": "My Requests & Policies",
    "الأصل المؤمن عليه": "Insured Asset",
    "وصف الموقع": "Location Description",
    "نوع الأصل": "Asset Type",
    "مدة التغطية المقترحة": "Proposed Coverage Period",
    "12 شهرًا — نموذج تجريبي": "12 months — demo only",
    "تفاصيل الأخطار المختارة والتغطية": "Selected Risks & Coverage Details",
    "العواصف الرعدية": "Thunderstorms",
    "المؤشر": "Index",
    "حد التفعيل التجريبي": "Demo Trigger Threshold",
    "حد المنفعة للباقة": "Package Benefit Limit",
    "ملاحظات": "Notes",
    "حد توضيحي للباقة وليس مبلغ تعويض معتمدًا لكل حادث": "Illustrative package limit, not an approved payout for each event",
    "مصدر المؤشر الحالي تجريبي داخل النموذج. يحتاج حد التعويض وقواعد القياس إلى اعتماد نهائي قبل أي استخدام فعلي.": "The index source is simulated in this prototype. Compensation limits and measurement rules require final approval before real-world use.",
    "لا توجد أخطار محفوظة في الطلب الحالي. ارجعي إلى تفاصيل الخطر وأكملي الاختيار.": "No risks are saved in this request. Return to risk details and complete your selection.",
    "عرض مبدئي": "Preliminary Quotation",
    "ينتهي في": "Expires on",
    "غير مضاف": "Not provided",
    "الأساسية": "Basic",
    "المتوازنة": "Balanced",
    "الأعمال": "Business",
    "جاري": "In Progress",
    "مكتمل": "Complete",
    "قيد المراجعة": "Under Review",
    "مرفوض من العميل": "Declined by Customer",
    "تم رفض العرض وإغلاقه": "Quotation declined and closed",
    "بانتظار إكمال العرض": "Awaiting Quotation Completion",
    "صدرت وثيقة تجريبية": "Demo Policy Issued",
    "طلب تعديل قيد المراجعة": "Amendment Request Under Review",
    "موقّع — بانتظار الدفع": "Signed — Awaiting Payment",
    "المنطقة": "Region",
    "جدة": "Jeddah",
    "جازان": "Jazan",
    "الرياض": "Riyadh",
    "القصيم": "Al-Qassim",
    "مكة المكرمة": "Makkah",
    "المدينة المنورة": "Madinah",
    "المنطقة الشرقية": "Eastern Province",
    "تبوك": "Tabuk",
    "حائل": "Hail",
    "الجوف": "Al-Jouf",
    "عسير": "Asir",
    "نجران": "Najran",
    "الباحة": "Al-Baha",
    "منزل": "Home",
    "متجر": "Shop",
    "مزرعة": "Farm",
    "منشأة صناعية": "Industrial Facility",
    "مبنى تجاري": "Commercial Building",
    "ريال": "SAR",
    "يُحدد بعد مراجعة الخطر": "To be confirmed after risk review",
    "مؤشر الخطر": "Risk Index",
    "المطر": "Rainfall",
    "سرعة الرياح": "Wind Speed",
    "درجة الحرارة": "Temperature",
    "البَرَد": "Hail",
    "الصقيع": "Frost",
    "خطر آخر": "Other Risk",
    "خطر مختار": "Selected Risk",
    "تاريخ إصدار العرض": "Quotation Issue Date",
    "اسم العميل": "Customer Name",
    "اسم الأصل": "Asset Name",
    "رقم الطلب / العرض": "Request / Quotation Number",
    "حد المنفعة التوضيحي للباقة": "Illustrative Package Benefit Limit",
    "السعر قبل الضريبة": "Price Before Tax",
    "ضريبة القيمة المضافة": "Value Added Tax (VAT)",
    "الإجمالي": "Total",
    "الإجمالي التوضيحي": "Illustrative Total",
    "عرض السعر التأميني": "Insurance Quotation",
    "بيانات العرض والعميل": "Quotation & Customer Details",
    "صلاحية العرض وحالته": "Quotation Validity & Status",
    "الشروط العامة": "General Terms",
    "الاستثناءات العامة": "General Exclusions",
    "طلب تعديل عرض السعر": "Request a Quotation Amendment",
    "تفاصيل الطلب": "Request Details",
    "إرسال طلب التعديل": "Submit Amendment Request",
    "رفض العرض": "Decline Quotation",
    "قبول العرض والانتقال للتوقيع": "Accept Quotation & Continue to Signature",
    "تنزيل / طباعة PDF": "Download / Print PDF",
    "تأكيد القبول والتوقيع التجريبي": "Confirm Acceptance & Demo Signature",
    "الاسم الكامل": "Full Name",
    "طلباتي": "My Requests",
    "وثائقي": "My Policies",
    "عرض التفاصيل ←": "View Details →",
    "عرض التفاصيل": "View Details",
    "عرض طلباتي": "View My Requests",
    "محاكاة قبول الأصل ←": "Simulate Asset Approval →",
    "طلب تغطية": "Coverage Request",
    "تم استلام الطلب": "Request Received",
    "التحقق من بيانات الأصل والأهلية": "Verifying asset details and eligibility",
    "قبول الطلب أو طلب معلومات إضافية أو رفضه": "Approve the request, request more information, or decline it",
    "تظهر الباقات بعد قبول الأصل": "Packages appear after asset approval",
    "يُحدّث حسب بيانات الحساب": "Updated from account details",
    "العميل": "Customer",
    "البيانات والمرفقات": "Data & Attachments",
    "اختر نوع الأصل": "Select Asset Type",
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
  function translateAdded(root){
    if(document.documentElement.lang!=='en') return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(!node.nodeValue.trim() || node.parentElement.closest('script,style,select,option,input,textarea,.no-translate')) continue;
      if(!originals.has(node)) originals.set(node,node.nodeValue);
      const original=originals.get(node), trimmed=original.trim();
      const key=Object.keys(translations).sort((a,b)=>b.length-a.length).find(k=>trimmed===k);
      if(key) node.nodeValue=original.replace(trimmed,translations[key]);
    }
  }
  const languageObserver=new MutationObserver(records=>{
    for(const record of records) for(const added of record.addedNodes){
      if(added.nodeType===Node.TEXT_NODE){
        if(!originals.has(added)) originals.set(added,added.nodeValue);
        if(document.documentElement.lang==='en'){
          const trimmed=originals.get(added).trim();
          const key=Object.keys(translations).sort((a,b)=>b.length-a.length).find(k=>trimmed===k);
          if(key) added.nodeValue=originals.get(added).replace(trimmed,translations[key]);
        }
      } else if(added.nodeType===Node.ELEMENT_NODE) translateAdded(added);
    }
  });
  languageObserver.observe(document.body,{childList:true,subtree:true});
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
