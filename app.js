
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
function getRiskContext(){
 const req=currentReq();
 const savedRisk=req?.risks?.[0]?.key;
 const key=(savedRisk&&riskConfig[savedRisk])?savedRisk:(selectedRisk||getSelectedRisk()||'rain');
 return {req,key,cfg:riskConfig[key]||riskConfig.rain};
}
function renderWeatherData(){
 const context=getRiskContext(), cfg=context.cfg, key=context.key;
 const filter=$('#dataYearFilter')?.value||'all';
 const rows=weatherDataset.filter(r=>filter==='all'||String(r.year)===filter);
 const tbody=$('#weatherRows');
 if(!tbody)return;
 const field=cfg.field, unit=cfg.unit;
 const metricHeader=$('#dataMetricHeader'); if(metricHeader) metricHeader.textContent=cfg.label+' ('+unit+')';
 const avgLabel=$('#dataAverageLabel'); if(avgLabel) avgLabel.textContent=key==='rain'?'متوسط الأمطار':key==='wind'?'متوسط سرعة الرياح':key==='heat'?'متوسط الحرارة':'متوسط '+cfg.label;
 const avgUnit=$('#dataAverageUnit'); if(avgUnit) avgUnit.textContent=unit+' — متوسط سنوي تجريبي';
 const avg=(weatherDataset.reduce((s,r)=>s+r[field],0)/weatherDataset.length).toFixed(1);
 $('#dataRainAvg').textContent=avg;
 const hazardThreshold=cfg.threshold;
 tbody.innerHTML=rows.map(r=>`<tr><td>${r.year}</td><td>${r[field]}</td><td>${unit}</td><td><span class="data-pill ${r[field]>=hazardThreshold?'yes':'no'}">${r[field]>=hazardThreshold?'بلغ الحد':'دون الحد'}</span></td><td>${r.damage?'نعم':'لا'}</td><td>${r.loss.toLocaleString('en-US')}</td><td>${r.asset.toLocaleString('en-US')}</td></tr>`).join('');
 $('#dataYears').textContent=weatherDataset.length;
 $('#dataDamageYears').textContent=weatherDataset.filter(r=>r.damage).length;
 const title=$('#dataRiskTitle'); if(title) title.textContent='بيانات الخطر: '+(context.req?.risks?.[0]?.label||({rain:'الأمطار والسيول',wind:'الرياح الشديدة',heat:'موجات الحرارة',storm:'العواصف الرعدية',dust:'العواصف الترابية'}[key]||'الخطر المحدد'));
 const sub=$('#dataRiskDescription'); if(sub) sub.textContent=`يعرض هذا الجدول مؤشر «${cfg.label}» وحد التفعيل ${cfg.threshold} ${unit} للطلب الحالي. البيانات محاكاة تعليمية وليست قياسات فعلية خاصة بالمنطقة.`;
 const selectedRegion=context.req?.region||region||'الرياض';
 const regionLabel=$('#dataSelectedRegion'); if(regionLabel) regionLabel.textContent=selectedRegion;
}
$('#dataYearFilter')?.addEventListener('change',renderWeatherData);

let selectedType='منزل',selectedPackage='المتوازنة',assetName='منزلي في الرياض',region='الرياض',city='الرياض',requestSent=false,accepted=false,paid=false;
const regionCities={'الرياض':['الرياض','الخرج','الدرعية','الدوادمي','المجمعة','الزلفي','شقراء','وادي الدواسر'],'مكة المكرمة':['مكة المكرمة','جدة','الطائف','رابغ','القنفذة','الليث'],'المدينة المنورة':['المدينة المنورة','ينبع','العلا','مهد الذهب'],'القصيم':['بريدة','عنيزة','الرس','البكيرية','المذنب','البدائع'],'المنطقة الشرقية':['الدمام','الخبر','الظهران','الأحساء','الجبيل','القطيف','حفر الباطن'],'عسير':['أبها','خميس مشيط','بيشة','محايل عسير','النماص'],'تبوك':['تبوك','الوجه','ضباء','أملج','تيماء'],'حائل':['حائل','بقعاء','الغزالة'],'الحدود الشمالية':['عرعر','رفحاء','طريف','العويقيلة'],'جازان':['جازان','صبيا','أبو عريش','صامطة','بيش'],'نجران':['نجران','شرورة','حبونا'],'الباحة':['الباحة','بلجرشي','المندق'],'الجوف':['سكاكا','القريات','دومة الجندل','طبرجل']};
function syncCityOptions(preferred){const sel=$('#city');const regionSel=$('#region');if(!sel||!regionSel)return;const selectedRegion=regionSel.value;const cities=regionCities[selectedRegion]||[selectedRegion];sel.replaceChildren(...cities.map(c=>{const option=document.createElement('option');option.value=c;option.textContent=c;return option;}));sel.value=(preferred&&cities.includes(preferred))?preferred:cities[0]||'';city=sel.value;}
const WORKFLOW_KEY_PREFIX='riskora_workflow_user_v1:';
function activeAccountName(){try{return (sessionStorage.getItem('riskora_demo_signed_in')==='1'?(sessionStorage.getItem('riskora_demo_name')||sessionStorage.getItem('riskora_user_name')||''):'').trim()}catch(e){return ''}}
function accountWorkflowKey(name=activeAccountName()){return WORKFLOW_KEY_PREFIX+(name?name.toLocaleLowerCase('ar'):'signed-out')}
function emptyWorkflow(){return {requests:[],documents:[],currentId:null}}
let workflow=emptyWorkflow();
let showArchivedRequests=false, showArchivedDocs=false;
function loadWorkflow(){try{workflow=JSON.parse(localStorage.getItem(accountWorkflowKey()))||emptyWorkflow()}catch(e){workflow=emptyWorkflow()}requestSent=!!currentReqSafe()?.status&&currentReqSafe().status!=='draft';accepted=['accepted','offer','signed','amendment_pending','issued'].includes(currentReqSafe()?.status);paid=currentReqSafe()?.status==='issued';}
function currentReqSafe(){return workflow.requests.find(r=>r.id===workflow.currentId)||null}
function saveWorkflow(){try{localStorage.setItem(accountWorkflowKey(),JSON.stringify(workflow))}catch(e){}}
function currentReq(){return workflow.requests.find(r=>r.id===workflow.currentId)||null;}
window.riskoraLoadUserWorkflow=function(){loadWorkflow();syncRequests();const r=currentReq();if(r){assetName=r.assetName||'منزلي في الرياض';region=r.region||'الرياض';selectedType=r.assetType||'منزل';syncCityOptions(r.city||'');selectedPackage=r.package||'المتوازنة';$('#assetName').value=r.assetName||'';$('#region').value=r.region||'الرياض';syncCityOptions(r.city||'');$('#address').value=r.address||'';}else{requestSent=false;accepted=false;paid=false;assetName='منزلي في الرياض';region='الرياض';selectedType='منزل';selectedPackage='المتوازنة';$('#assetName').value='';$('#address').value='';}showPage('home')};
loadWorkflow(); syncCityOptions('الرياض'); $('#region').addEventListener('change',()=>{syncCityOptions('');city=$('#city').value;}); $('#region').addEventListener('input',()=>{syncCityOptions('');city=$('#city').value;}); $('#city').addEventListener('change',()=>{city=$('#city').value}); function statusLabel(s){return ({pending:'قيد مراجعة الأصل',more:'بانتظار استكمال البيانات',accepted:'تم قبول الأصل',offer:'بانتظار إكمال العرض',offer_review:'العرض جاهز لمراجعة الإصدار',signed:'بانتظار الدفع',amendment_pending:'طلب التعديل قيد المراجعة',rejected_by_client:'مرفوض من العميل',expired:'انتهت صلاحية العرض',issued:'صدرت وثيقة تجريبية',rejected:'لم تتم الموافقة'})[s]||'قيد المراجعة'}const pages=['home','asset','hazard','risk-details','review','packages','offer','policy','indicator','claim','requests','data','settings','notifications','about','policy-use','contact','faq','terms','privacy','renewal'];const titles={home:'الرئيسية',asset:'أصولي',hazard:'طلب التغطية','risk-details':'تفاصيل التغطية',review:'مراجعة الطلب',packages:'اختيار الباقة',offer:'مراجعة العرض والدفع',policy:'إصدار الوثيقة',indicator:'المؤشرات',claim:'طلب تعويض',requests:'طلباتي ووثائقي',data:'بيانات النموذج',settings:'الإعدادات',notifications:'الإشعارات',about:'عن مرصد رسكورا','policy-use':'سياسة الاستخدام',contact:'تواصل معنا',faq:'الأسئلة الشائعة',terms:'شروط وأحكام الاستخدام',privacy:'سياسة الخصوصية',renewal:'مكافأة التجديد'};function go(id){if((id==='packages'||id==='offer'||id==='policy'||id==='indicator'||id==='claim')&&!accepted){toast('تظهر هذه المرحلة بعد قبول الأصل في رحلة الطلب.');if(requestSent)showPage('review');else showPage('asset');return}showPage(id)}function showPage(id){if(id==='packages'){const r=currentReq();if(r&&['pending','accepted'].includes(r.status)){r.status='accepted';accepted=true;r.updatedAt=new Date().toISOString();saveWorkflow();syncRequests()}}if(id==='home'||id==='settings')applyDemoName(getSavedDemoName());$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id||(id==='hazard'&&b.dataset.page==='hazard')||(['review','packages','offer'].includes(id)&&b.dataset.page==='hazard')));window.scrollTo({top:0,behavior:'smooth'});if(id==='hazard')syncAsset();if(id==='risk-details')renderRiskDetails();if(id==='packages')syncPackageRiskCopy();if(id==='offer')syncOffer();if(id==='policy')syncPolicy();if(id==='indicator')syncIndicator();if(id==='claim')syncClaimPage();if(id==='requests')syncRequests();if(id==='data')renderWeatherData();if(id==='settings')syncSettings()}function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}function startFreshRequest(){workflow.currentId=null;saveWorkflow();assetName='';region='الرياض';city='الرياض';selectedType='منزل';selectedPackage='المتوازنة';requestSent=false;accepted=false;paid=false;const name=$('#assetName');if(name)name.value='';const reg=$('#region');if(reg){reg.value='الرياض';syncCityOptions('الرياض');}const address=$('#address');if(address)address.value='';const photoInput=$('#assetPhotos');if(photoInput)photoInput.value='';document.querySelectorAll('.type').forEach(x=>x.classList.toggle('selected',x.dataset.type==='منزل'));document.querySelectorAll('.haz-option input').forEach(x=>x.checked=false);const other=$('#otherHazardText');if(other)other.value='';const notes=$('#hazNotes');if(notes)notes.value='';const terms=$('#terms');if(terms)terms.checked=false;document.querySelectorAll('.package').forEach(x=>x.classList.remove('selected'));document.querySelectorAll('.selectPackage').forEach(x=>{x.textContent='اختيار الباقة';x.classList.add('outline')});const rid=$('#requestId');if(rid)rid.textContent='سيظهر بعد إرسال الطلب';const otherField=$('#otherHazardField');if(otherField)otherField.hidden=true;}
document.addEventListener('click',e=>{const goBtn=e.target.closest('[data-go]');if(goBtn){if(goBtn.dataset.newRequest==='true')startFreshRequest();go(goBtn.dataset.go)}const nav=e.target.closest('[data-page]');if(nav){if(nav.dataset.page==='asset'){const active=currentReq();if(active&&['rejected_by_client','issued'].includes(active.status)){workflow.currentId=null;saveWorkflow();assetName='';region='الرياض';selectedType='منزل';selectedPackage='المتوازنة';requestSent=false;accepted=false;paid=false;const name=$('#assetName');if(name)name.value='';const reg=$('#region');if(reg){reg.value='الرياض';syncCityOptions('الرياض');}const address=$('#address');if(address)address.value='';document.querySelectorAll('.type').forEach(x=>x.classList.toggle('selected',x.dataset.type==='منزل'));document.querySelectorAll('.haz-option input').forEach(x=>x.checked=false);const other=$('#otherHazardText');if(other)other.value='';}}go(nav.dataset.page)}});$$('.type').forEach(b=>b.addEventListener('click',()=>{$$('.type').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedType=b.dataset.type}));function syncAsset(){assetName=$('#assetName').value.trim()||`أصل ${selectedType} في ${$('#region').value}`;region=$('#region').value;city=$('#city')?.value||'';$('#summaryAsset').textContent=assetName;$('#summaryRegion').textContent=city?`${region} · ${city}`:region}async function collectAssetPhotos(existing=[]){
 const input=$('#assetPhotos');const files=[...(input?.files||[])].filter(f=>f.type.startsWith('image/')).slice(0,6);
 if(!files.length)return existing||[];
 const out=[];
 for(const file of files){
  try{
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});
   let compressed=data;
   try{const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=data});const scale=Math.min(1,1000/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);compressed=canvas.toDataURL('image/jpeg',0.72)}catch(e){}
   if(typeof compressed==='string'&&compressed.length<1_200_000)out.push({name:file.name,type:'image/jpeg',data:compressed});
  }catch(e){}
 }
 return out.length?out:(existing||[]);
}
$('#saveAsset').addEventListener('click',async()=>{syncAsset();if(!$('#address').value.trim()){toast('أضيفي وصف الموقع أو العنوان قبل المتابعة.');$('#address').focus();return}let draft=currentReq(); const savedPhotos=await collectAssetPhotos(draft?.assetPhotos||[]); if(!draft || draft.status==='issued'){draft={id:'REQ-2026-'+String(Date.now()).slice(-6),assetName,assetType:selectedType,region,city,address:$('#address').value.trim(),assetPhotos:savedPhotos,status:'draft',createdAt:new Date().toISOString(),risks:[]};workflow.requests.push(draft);workflow.currentId=draft.id;saveWorkflow()}else{draft.assetName=assetName;draft.assetType=selectedType;draft.region=region;draft.city=city;draft.address=$('#address').value.trim();draft.assetPhotos=savedPhotos;saveWorkflow()} toast('تم حفظ بيانات الأصل. أكملي تحديد الأخطار لإرسال الطلب.');go('hazard')});$('#submitRequest').addEventListener('click',()=>{syncAsset();const checked=[...document.querySelectorAll('.haz-option input:checked')];if(checked.length!==1){toast('اختاري خطرًا واحدًا فقط للمتابعة.');return}if(document.querySelector('.haz-option[data-risk="other"] input').checked && !$('#otherHazardText').value.trim()){toast('اكتبي الخطر الطبيعي الذي ترغبين في تغطيته.');$('#otherHazardText').focus();return}showPage('risk-details')});function submitCoverageRequest(){syncAsset();const checked=[...document.querySelectorAll('.haz-option input:checked')];if(checked.length!==1){toast('اختاري خطرًا واحدًا فقط قبل المتابعة.');showPage('hazard');return}requestSent=true;let req=currentReq();if(!req){req={id:'REQ-2026-'+String(Date.now()).slice(-6),createdAt:new Date().toISOString()};workflow.requests.push(req);workflow.currentId=req.id}req.assetName=assetName;req.assetType=selectedType;req.region=region;req.city=city;req.address=$('#address').value.trim();req.risks=[checked[0]].map(x=>({key:x.closest('.haz-option').dataset.risk,label:x.closest('.haz-option').querySelector('b').textContent}));req.otherRisk=$('#otherHazardText').value.trim();req.notes=$('#hazNotes').value.trim();req.status='pending';req.updatedAt=new Date().toISOString();accepted=false;paid=false;saveWorkflow();$('#requestId').textContent=req.id;syncRequests();showPage('review');toast('تم إنشاء الطلب وحفظه في طلباتي.')}$('#continueRiskDetails').addEventListener('click',submitCoverageRequest);$('#approveDemo').addEventListener('click',()=>{accepted=true;const req=currentReq();if(req){req.status='accepted';req.updatedAt=new Date().toISOString();saveWorkflow()}syncRequests();toast('تمت محاكاة قبول الأصل. الباقات أصبحت متاحة.');showPage('packages')});$$('.selectPackage').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.package');selectedPackage=card.dataset.package;$$('.package').forEach(p=>{p.classList.toggle('selected',p===card);p.classList.toggle('featured',p===card)});$$('.selectPackage').forEach(btn=>{btn.textContent=btn.closest('.package')===card?'✓ تم اختيار الباقة':'اختيار الباقة';btn.classList.toggle('outline',btn.closest('.package')!==card)});const req=currentReq();if(req){req.package=selectedPackage;req.status='offer';saveWorkflow()}toast('تم اختيار '+selectedPackage)}));const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590},benefits={'الأساسية':'2,500','المتوازنة':'5,000','الأعمال':'10,000'};const packageRiskCopy={
 rain:{name:'الأمطار الغزيرة والسيول',basic:['تغطية الأمطار الغزيرة والسيول وفق شروط الوثيقة','تنبيهات عند رصد ظروف مرتبطة بالأمطار الغزيرة والسيول'],mid:['تغطية الأمطار الغزيرة والسيول وفق شروط الوثيقة','متابعة مؤشرات هطول الأمطار وتجمّع المياه والسيول','تنبيهات وقائية وإرشادات للحد من أضرار الأمطار والسيول'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد الأمطار الغزيرة والسيول','متابعة مؤشرات الأمطار والسيول في موقع المنشأة','تنبيهات وقائية مرتبطة بالأمطار الغزيرة والسيول']},
 wind:{name:'الرياح الشديدة',basic:['تغطية أضرار الرياح الشديدة وفق شروط الوثيقة','تنبيهات عند رصد ظروف مرتبطة بالرياح الشديدة'],mid:['تغطية أضرار الرياح الشديدة وفق شروط الوثيقة','متابعة مؤشرات سرعة الرياح وشدتها','تنبيهات وقائية وإرشادات للحد من أضرار الرياح الشديدة'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد الرياح الشديدة','متابعة مؤشرات سرعة الرياح في موقع المنشأة','تنبيهات وقائية مرتبطة بالرياح الشديدة']},
 heat:{name:'موجات الحرارة',basic:['تغطية موجات الحرارة وفق شروط الوثيقة','تنبيهات عند ارتفاع درجات الحرارة إلى مستويات خطرة'],mid:['تغطية موجات الحرارة وفق شروط الوثيقة','متابعة درجات الحرارة القصوى وفترات الحر الشديد','تنبيهات وقائية وإرشادات للحد من أضرار موجات الحرارة'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد موجات الحرارة','متابعة درجات الحرارة القصوى في موقع المنشأة','تنبيهات وقائية مرتبطة بموجات الحرارة']},
 storm:{name:'العواصف الرعدية',basic:['تغطية العواصف الرعدية وفق شروط الوثيقة','تنبيهات عند رصد ظروف مرتبطة بالعواصف الرعدية'],mid:['تغطية العواصف الرعدية وفق شروط الوثيقة','متابعة مؤشرات العواصف الرعدية وشدة الرياح واحتمال الصواعق','تنبيهات وقائية وإرشادات للحد من أضرار العواصف الرعدية'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد العواصف الرعدية','متابعة مؤشرات العواصف الرعدية في موقع المنشأة','تنبيهات وقائية مرتبطة بالعواصف الرعدية']},
 dust:{name:'العواصف الترابية',basic:['تغطية العواصف الترابية وفق شروط الوثيقة','تنبيهات عند رصد الغبار الكثيف وانخفاض الرؤية'],mid:['تغطية العواصف الترابية وفق شروط الوثيقة','متابعة مؤشرات الغبار الكثيف ومستوى الرؤية','تنبيهات وقائية وإرشادات للحد من أضرار العواصف الترابية'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد العواصف الترابية','متابعة مؤشرات الغبار والرؤية في موقع المنشأة','تنبيهات وقائية مرتبطة بالعواصف الترابية']},
 other:{name:'الخطر الطبيعي المحدد',basic:['تغطية الخطر الطبيعي المحدد في الطلب وفق شروط الوثيقة','تنبيهات مرتبطة بالخطر بعد تحديد مؤشره'],mid:['تغطية الخطر الطبيعي المحدد في الطلب وفق شروط الوثيقة','متابعة المؤشر المرتبط بالخطر بعد تحديده','تنبيهات وقائية وإرشادات مناسبة للخطر بعد مراجعته'],biz:['خيارات تغطية أوسع للأصول والمنشآت ضد الخطر الطبيعي المحدد','متابعة مؤشر الخطر في موقع المنشأة بعد تحديده','تنبيهات وقائية مرتبطة بالخطر بعد مراجعته']}
};
function syncPackageRiskCopy(){const req=currentReq();const key=(req&&req.risks&&req.risks[0]&&req.risks[0].key)||getSelectedRisk()||'rain';const c=packageRiskCopy[key]||packageRiskCopy.other;const custom=(key==='other'?(req?.otherRisk||$('#otherHazardText')?.value||'').trim():'');const name=custom||c.name;const put=(sel,val)=>{const el=$(sel);if(el)el.textContent=val.replace('الخطر الطبيعي المحدد',name)};put('[data-feature=basic-coverage]',c.basic[0]);put('[data-feature=basic-alert]',c.basic[1]);put('[data-feature=mid-coverage]',c.mid[0]);put('[data-feature=mid-monitor]',c.mid[1]);put('[data-feature=mid-alert]',c.mid[2]);put('[data-feature=biz-coverage]',c.biz[0]);put('[data-feature=biz-monitor]',c.biz[1]);put('[data-feature=biz-alert]',c.biz[2]);}

$('#continueOffer').addEventListener('click',()=>{syncOffer();go('offer')});
function money(n){return new Intl.NumberFormat('ar-SA',{maximumFractionDigits:2}).format(n)+' ريال'}
function syncOffer(){
 const req=currentReq()||{}; syncAsset();
 const pkg=req.package||selectedPackage; selectedPackage=pkg;
 const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590}, benefits={'الأساسية':2500,'المتوازنة':5000,'الأعمال':10000};
 const price=prices[pkg]||prices['المتوازنة'], vat=Math.round(price*.15*100)/100, total=price+vat;
 const today=new Date(); if(!req.offerCreatedAt){req.offerCreatedAt=today.toISOString();req.offerExpiresAt=new Date(today.getTime()+14*24*60*60*1000).toISOString();saveWorkflow()} const issuedAt=new Date(req.offerCreatedAt), expiry=new Date(req.offerExpiresAt||issuedAt.getTime()+14*24*60*60*1000);
 const fmt=d=>d.toLocaleDateString('ar-SA',{year:'numeric',month:'long',day:'numeric'});
 const put=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v||'غير متوفر'};
 put('offerNumber',req.id||'سيُحدد عند إنشاء الطلب');put('offerDate',fmt(issuedAt));put('offerExpiryDate','ينتهي في '+fmt(expiry));put('offerCustomer',getSavedDemoName()||'العميل');put('offerAsset',req.assetName||assetName);put('offerRegion',[req.region||region,req.city].filter(Boolean).join(' · '));put('offerAddress',req.address||'غير مضاف');put('offerAssetType',req.assetType||selectedType);put('offerPackage',pkg);put('offerBenefit',money(benefits[pkg]||benefits['المتوازنة']));put('offerPrice',money(price));put('offerVat',money(vat)+' (15% توضيحية)');put('offerTotal',money(total));put('paySummaryPrice',money(price));put('paySummaryVat',money(vat));put('paySummaryTotal',money(total));
 const expiryEl=document.getElementById('offerExpiryDate'); if(expiryEl)expiryEl.dataset.expires=expiry.toISOString();
 const riskBox=document.getElementById('quoteRiskTables'); if(riskBox){const risks=Array.isArray(req.risks)?req.risks:[];const labels={rain:'الأمطار الغزيرة والسيول',wind:'الرياح الشديدة',heat:'موجات الحرارة',storm:'العواصف الرعدية',dust:'العواصف الترابية',hail:'البَرَد',frost:'الصقيع',other:req.otherRisk||'خطر آخر'};
 const cfgs=window.riskoraRiskConfig||null;
 riskBox.innerHTML=risks.length?risks.map(r=>{const key=r.key||'other';const cfg=(typeof riskConfig!=='undefined'&&riskConfig[key])?riskConfig[key]:null;const trigger=cfg?`${cfg.threshold} ${cfg.unit}`:'يُحدد بعد مراجعة الخطر';const measure=cfg?cfg.label:'مؤشر الخطر';return `<article class="quote-risk-card"><h4>${labels[key]||r.label||'خطر مختار'}</h4><table class="quote-table"><thead><tr><th>المؤشر</th><th>حد التفعيل التجريبي</th><th>حد المنفعة للباقة</th><th>ملاحظات</th></tr></thead><tbody><tr><td>${measure}</td><td>${trigger}</td><td>${money(benefits[pkg]||5000)}</td><td>حد توضيحي للباقة وليس مبلغ تعويض معتمدًا لكل حادث</td></tr></tbody></table><p class="quote-note">مصدر المؤشر الحالي تجريبي داخل النموذج. يحتاج حد التعويض وقواعد القياس إلى اعتماد نهائي قبل أي استخدام فعلي.</p></article>`}).join(''):'<div class="quote-risk-card"><p>لا توجد أخطار محفوظة في الطلب الحالي. ارجعي إلى تفاصيل الخطر وأكملي الاختيار.</p></div>';
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
$('#quoteReject').addEventListener('click',()=>{const req=currentReq();if(!req)return;if(!confirm('هل تريدين رفض عرض السعر؟ سيُحفظ العرض كمرفوض ولن يمكن الدفع عليه.'))return;req.status='rejected_by_client';req.rejectedAt=new Date().toISOString();saveWorkflow();syncRequests();syncOffer();toast('تم حفظ العرض كمرفوض، والدفع معطل لهذا العرض.');});
$('#payDemo').addEventListener('click',()=>{const req=currentReq();if(!req||req.status!=='signed'){toast('اقبلي العرض ووقّعيه أولًا قبل الدفع.');return}if(!$('#terms').checked){toast('يرجى تأكيد مراجعة الشروط أولًا.');return}paid=true;req.status='issued';req.package=selectedPackage;req.price=({'الأساسية':180,'المتوازنة':320,'الأعمال':590}[selectedPackage]||320);req.vat=Math.round(req.price*.15*100)/100;req.total=req.price+req.vat;req.policyId='POL-DEMO-'+req.id.slice(-6);req.issuedAt=new Date().toISOString();workflow.documents=workflow.documents.filter(d=>d.requestId!==req.id);workflow.documents.push({requestId:req.id,id:req.policyId,assetName:req.assetName,assetType:req.assetType,region:req.region,package:selectedPackage,price:req.price,total:req.total,risks:req.risks||[],city:req.city||'',address:req.address||'',assetPhotos:req.assetPhotos||[],status:'demo',issuedAt:req.issuedAt});saveWorkflow();toast('تم إصدار الوثيقة التجريبية تلقائيًا بعد الدفع التجريبي. لا توجد عملية مالية فعلية.');syncRequests();syncPolicy();showPage('policy');const title=$('#policyStatusTitle'),desc=$('#policyStatusDescription');if(title)title.textContent='تم إنشاء وثيقة تجريبية';if(desc)desc.textContent='هذه ليست وثيقة تأمين حقيقية ولا تمنح تغطية فعلية.';});
function issuePolicyDemo(){const req=currentReq();if(!req||!['offer_review','issued'].includes(req.status)){toast('أكملي مراجعة العرض أولًا.');return}if(req.status==='issued'){toast('الوثيقة التجريبية صادرة بالفعل.');return}paid=true;req.status='issued';req.policyId='POL-DEMO-'+req.id.slice(-6);req.issuedAt=new Date().toISOString();workflow.documents=workflow.documents.filter(d=>d.requestId!==req.id);workflow.documents.push({requestId:req.id,id:req.policyId,assetName:req.assetName,assetType:req.assetType,region:req.region,package:req.package||selectedPackage,price:req.price||prices[selectedPackage],risks:req.risks||[],city:req.city||'',address:req.address||'',assetPhotos:req.assetPhotos||[],status:'demo',issuedAt:req.issuedAt});saveWorkflow();toast('تم إصدار الوثيقة التجريبية وحفظها في وثائقي.');syncRequests();syncPolicy();const title=$('#policyStatusTitle'),desc=$('#policyStatusDescription');if(title)title.textContent='تم إنشاء وثيقة تجريبية';if(desc)desc.textContent='هذه ليست وثيقة تأمين حقيقية ولا تمنح تغطية فعلية.';document.getElementById('issuePolicyDemo')?.remove();}document.getElementById('issuePolicyDemo')?.addEventListener('click',issuePolicyDemo);function syncPolicy(){
 const req=currentReq();const doc=req?(workflow.documents||[]).find(d=>d.requestId===req.id):null;const data=req||doc||{};
 assetName=data.assetName||assetName;region=data.region||region;selectedType=data.assetType||selectedType;selectedPackage=data.package||selectedPackage;
 $('#policyAsset').textContent=assetName;$('#policyPackage').textContent=selectedPackage;$('#policyPrice').textContent=(data.price||prices[selectedPackage]||0)+' ريال';
 const policyNumber=$('#policyNumber');if(policyNumber)policyNumber.textContent=data.policyId||doc?.id||req?.policyId||'تُحدد عند الإصدار';
 const details=$('#policyExtraDetails');if(details){const risks=(data.risks||[]).map(x=>x.label||x).join('، ')||'لم يُحدد';const photos=data.assetPhotos||[];details.innerHTML=`<h3>تفاصيل الأصل المؤمن عليه</h3><div class="policy-extra-grid"><div><small>نوع الأصل</small><b>${escapeText(data.assetType||'غير محدد')}</b></div><div><small>المنطقة</small><b>${escapeText(data.region||'غير محددة')}</b></div><div><small>المدينة</small><b>${escapeText(data.city||'غير محددة')}</b></div><div><small>العنوان أو وصف الموقع</small><b>${escapeText(data.address||'غير مضاف')}</b></div><div class="wide"><small>الأخطار المحددة</small><b>${escapeText(risks)}</b></div></div><h3 class="policy-photos-heading">صور الأصل المؤمن عليه</h3>${photos.length?`<div class="policy-photo-gallery">${photos.map((ph,i)=>`<button type="button" class="policy-photo-thumb" data-photo-index="${i}" aria-label="تكبير صورة الأصل"><img src="${ph.data}" alt="${escapeText(ph.name||'صورة الأصل')}" loading="lazy"><span>عرض الصورة</span></button>`).join('')}</div>`:'<p class="policy-no-photos">لم تُرفق صور لهذا الأصل.</p>'}`;
 details.querySelectorAll('[data-photo-index]').forEach(btn=>btn.addEventListener('click',()=>{const ph=photos[Number(btn.dataset.photoIndex)];if(!ph)return;const viewer=$('#policyPhotoViewer');const image=$('#policyPhotoViewerImage');if(viewer&&image){image.src=ph.data;viewer.hidden=false;}}));
 }
 const title=$('#policyStatusTitle');if(title)title.textContent='تم إنشاء وثيقة تجريبية';
}
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
 const savedReq=currentReq();
 if(savedReq){
  assetName=savedReq.assetName||assetName; region=savedReq.region||region; city=savedReq.city||city; selectedType=savedReq.assetType||selectedType;
  if($('#assetName')) $('#assetName').value=savedReq.assetName||'';
  if($('#region')) $('#region').value=savedReq.region||'الرياض';
  if($('#address')) $('#address').value=savedReq.address||'';
  if(Array.isArray(savedReq.risks)&&savedReq.risks.length){
   document.querySelectorAll('.haz-option input').forEach(input=>{input.checked=input.closest('.haz-option')?.dataset.risk===savedReq.risks[0].key;});
   selectedRisk=savedReq.risks[0].key||'rain';
   if($('#otherHazardText')&&savedReq.otherRisk) $('#otherHazardText').value=savedReq.otherRisk;
  }
 }
 syncAsset();
 selectedRisk = (savedReq?.risks?.[0]?.key && (riskConfig[savedReq.risks[0].key]||savedReq.risks[0].key==='other')) ? savedReq.risks[0].key : getSelectedRisk();
 const customRisk = selectedRisk === 'other';
 const customName = (savedReq?.otherRisk || $('#otherHazardText')?.value || '').trim();
 const cfg = riskConfig[selectedRisk];
 const regionName = savedReq?.region || region || $('#region')?.value || 'الرياض';
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
function claimStatusText(claim){return ({not_eligible:'غير مستحق للتعويض — لم يتحقق المؤشر',partial_demo:'تعويض جزئي تجريبي — لم يُصرف فعليًا',pending_review:'مطالبة قيد المراجعة',approved:'تمت الموافقة على المطالبة',rejected:'مطالبة مرفوضة'})[claim?.status]||'';}
function syncRequests(){
 const reqs=workflow.requests||[],docs=workflow.documents||[];
 const visibleReqs=reqs.filter(r=>!!r.archived===!!showArchivedRequests);
 const visibleDocs=docs.filter(d=>!!d.archived===!!showArchivedDocs);
 $('#requestCount').textContent=reqs.filter(r=>!r.archived).length;
 $('#pendingCount').textContent=reqs.filter(r=>!r.archived&&['draft','pending','more','offer','offer_review'].includes(r.status)).length;
 $('#completeCount').textContent=reqs.filter(r=>!r.archived&&r.status==='issued').length;
 const list=$('#dynamicRequests');
 if(list){list.innerHTML=visibleReqs.length?visibleReqs.slice().sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0)).map(r=>`<article class="request-row redesigned-request"><label class="record-select"><input type="checkbox" class="record-check" data-record-type="request" value="${escapeText(r.id)}" aria-label="تحديد الطلب"></label><span class="row-icon"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></span><div class="row-content"><b>${r.status==='amendment_pending'?'طلب تعديل عرض السعر — ':'طلب تغطية — '}${escapeText(r.assetName||'أصل جديد')}</b><small>${escapeText(r.id)} · ${new Date(r.createdAt||Date.now()).toLocaleDateString('ar-SA')}</small><div class="request-meta"><span class="status ${r.status==='rejected_by_client'?'rejected':(r.status==='issued'||r.status==='accepted'?'':'pending')}">${statusLabel(r.status)}</span>${r.claim?'<span class="status '+(r.claim.status==='not_eligible'?'rejected':r.claim.status==='pending_review'?'pending':'info-status')+'">'+escapeText(claimStatusText(r.claim))+(r.claim.amount!=null?' · '+escapeText(money(r.claim.amount)):'')+'</span>':''}<span class="next-step">${r.status==='amendment_pending'?'طلب التعديل الذي أرسلته قيد المراجعة':r.status==='pending'?'بانتظار المراجعة':r.status==='accepted'?'يمكنك اختيار الباقة':r.status==='issued'?'الوثيقة التجريبية متاحة في وثائقي':r.status==='offer_review'?'راجعي العرض قبل إصدار الوثيقة':r.status==='draft'?'أكملي اختيار الأخطار':'تابعي تفاصيل الطلب'}</span></div></div><div class="record-actions">${r.status==='rejected_by_client'?'':'<button class="btn outline request-detail" data-open-request="'+escapeText(r.id)+'">عرض التفاصيل ←</button>'}<button class="btn outline" data-archive-request="${escapeText(r.id)}">${r.archived?'إلغاء الأرشفة':'أرشفة'}</button><button class="btn outline danger-action" data-delete-request="${escapeText(r.id)}">حذف</button></div></article>`).join(''):'<div class="empty-docs-note">'+(showArchivedRequests?'ما فيه طلبات مؤرشفة.':'ما عندك طلبات ظاهرة. ابدئي بإضافة أصل جديد.')+'</div>';}
 list?.querySelectorAll('[data-open-request]').forEach(btn=>btn.addEventListener('click',()=>{workflow.currentId=btn.dataset.openRequest;saveWorkflow();const r=currentReq();if(!r)return;assetName=r.assetName||assetName;region=r.region||region;selectedType=r.assetType||selectedType;requestSent=true;accepted=['accepted','offer','issued'].includes(r.status);paid=r.status==='issued';$('#requestId').textContent=r.id;$('#assetName').value=r.assetName||'';$('#region').value=r.region||'الرياض';syncCityOptions(r.city||'');$('#address').value=r.address||'';if(r.status==='accepted'||r.status==='offer'){showPage('packages')}else if(r.status==='offer_review'){showPage('policy')}else if(r.status==='issued'){showPage('requests');$$('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab==='mydocs'));$('#myrequests').hidden=true;$('#mydocs').hidden=false}else{showPage('review')}}));
 list?.querySelectorAll('[data-archive-request]').forEach(btn=>btn.addEventListener('click',()=>{const r=reqs.find(x=>x.id===btn.dataset.archiveRequest);if(r){const nextArchived=!r.archived;r.archived=nextArchived;const linkedDoc=docs.find(d=>d.requestId===r.id);if(linkedDoc)linkedDoc.archived=nextArchived;saveWorkflow();syncRequests();toast(linkedDoc?(nextArchived?'تمت أرشفة الطلب ووثيقته المرتبطة.':'تم استرجاع الطلب ووثيقته المرتبطة.'):(nextArchived?'تمت أرشفة الطلب.':'تم استرجاع الطلب.'));}}));
 list?.querySelectorAll('[data-delete-request]').forEach(btn=>btn.addEventListener('click',()=>{if(!confirm('هل أنتِ متأكدة من حذف هذا الطلب ووثيقته المرتبطة؟ لا يمكن التراجع عن الحذف.'))return;const id=btn.dataset.deleteRequest;workflow.requests=workflow.requests.filter(x=>x.id!==id);workflow.documents=workflow.documents.filter(x=>x.requestId!==id);if(workflow.currentId===id)workflow.currentId=null;saveWorkflow();syncRequests();}));
 $('#docCount').textContent=docs.filter(d=>!d.archived).length;$('#docActiveCount').textContent=0;$('#docExpiredCount').textContent=0;$('#docSuspendedCount').textContent=0;
 const docsEl=$('#dynamicDocs'); if(docsEl){docsEl.innerHTML=visibleDocs.length?visibleDocs.slice().sort((a,b)=>new Date(b.issuedAt||b.createdAt||0)-new Date(a.issuedAt||a.createdAt||0)).map(d=>`<article class="document-card"><label class="record-select"><input type="checkbox" class="record-check" data-record-type="doc" value="${escapeText(d.requestId)}" aria-label="تحديد الوثيقة"></label><div class="document-top"><span class="row-icon"><svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7zM15 3v5h4M10 12h6M10 16h4"/></svg></span><div class="document-title"><b>وثيقة مرصد رسكورا التجريبية</b><small>رقم الوثيقة: ${escapeText(d.id)}</small></div><span class="status info-status">${d.claim?escapeText(claimStatusText(d.claim)):'معاينة تجريبية'}</span></div><div class="document-facts"><div><small>الأصل المؤمن عليه</small><b>${escapeText(d.assetName)}</b></div><div><small>الباقة</small><b>${escapeText(d.package)}</b></div><div><small>قيمة التغطية</small><b>${escapeText(d.price)} ريال — تجريبي</b></div><div><small>الأخطار المحددة</small><b>${escapeText((d.risks||[]).map(x=>x.label).join('، ')||'حسب الطلب')}</b></div></div><div class="hint document-notice">وثيقة نموذج تجريبي فقط؛ لا تمثل وثيقة تأمين فعلية أو تغطية سارية.</div>${d.claim?'<div class="hint">'+escapeText(claimStatusText(d.claim))+(d.claim.amount!=null?' — '+escapeText(money(d.claim.amount)):'')+'</div>':''}<div class="record-actions"><button class="btn outline document-detail" data-open-doc="${escapeText(d.requestId)}">عرض التفاصيل ←</button><button class="btn outline" data-archive-doc="${escapeText(d.requestId)}">${d.archived?'إلغاء الأرشفة':'أرشفة'}</button><button class="btn outline danger-action" data-delete-doc="${escapeText(d.requestId)}">حذف</button></div></article>`).join(''):'<div class="empty-docs-note">'+(showArchivedDocs?'ما فيه وثائق مؤرشفة.':'ما عندك وثائق ظاهرة.')+'</div>';}
 docsEl?.querySelectorAll('[data-open-doc]').forEach(btn=>btn.addEventListener('click',()=>{const d=workflow.documents.find(x=>x.requestId===btn.dataset.openDoc);if(!d)return;workflow.currentId=d.requestId;saveWorkflow();syncPolicy();showPage('policy')}));
 docsEl?.querySelectorAll('[data-archive-doc]').forEach(btn=>btn.addEventListener('click',()=>{const d=docs.find(x=>x.requestId===btn.dataset.archiveDoc);if(d){const nextArchived=!d.archived;d.archived=nextArchived;const linkedReq=reqs.find(r=>r.id===d.requestId);if(linkedReq)linkedReq.archived=nextArchived;saveWorkflow();syncRequests();toast(linkedReq?(nextArchived?'تمت أرشفة الوثيقة والطلب المرتبط بها.':'تم استرجاع الوثيقة والطلب المرتبط بها.'):(nextArchived?'تمت أرشفة الوثيقة.':'تم استرجاع الوثيقة.'));}}));
 docsEl?.querySelectorAll('[data-delete-doc]').forEach(btn=>btn.addEventListener('click',()=>{if(!confirm('هل أنتِ متأكدة من حذف هذه الوثيقة نهائيًا؟ لا يمكن التراجع عن الحذف.'))return;const id=btn.dataset.deleteDoc;workflow.documents=workflow.documents.filter(x=>x.requestId!==id);saveWorkflow();syncRequests();}));
 $('#demoDocumentCard').hidden=true;$('#emptyDocsNote').hidden=visibleDocs.length>0;
 const r=currentReq();if(r){$('#requestId').textContent=r.id;assetName=r.assetName||assetName;region=r.region||region;$('#docAsset').textContent=assetName;$('#docPackage').textContent=r.package||selectedPackage;}
}
function escapeText(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function claimContext(){
 const docs=(workflow.documents||[]).filter(d=>!d.archived);
 const current=currentReq();
 const doc=docs.find(d=>d.requestId===current?.id)||docs[0]||null;
 const req=doc?(workflow.requests||[]).find(r=>r.id===doc.requestId):current;
 const key=req?.risks?.[0]?.key||doc?.risks?.[0]?.key||'rain';
 const cfg=riskConfig[key]||null;
 const regionName=req?.region||doc?.region||region||'الرياض';
 const factor=regionFactors[regionName]||1;
 const row=weatherDataset[weatherDataset.length-1];
 const value=cfg?Math.round(row[cfg.field]*factor):null;
 const pkg=req?.package||doc?.package||selectedPackage||'المتوازنة';
 const benefit=({'الأساسية':2500,'المتوازنة':5000,'الأعمال':10000}[pkg]||5000);
 return {docs,doc,req,key,cfg,regionName,value,pkg,benefit};
}
function syncClaimPage(){
 const root=$('#claimDynamicContent'); if(!root)return;
 const c=claimContext();
 if(!c.doc||!c.req){root.innerHTML='<div class="empty-docs-note">لا توجد وثيقة صادرة مرتبطة بطلب. أصدري وثيقة تجريبية أولًا حتى تتمكني من تجربة محاكاة التعويض.</div>';return;}
 const options=c.docs.map(d=>`<option value="${escapeText(d.requestId)}" ${d.requestId===c.doc.requestId?'selected':''}>${escapeText(d.id||d.policyId||'وثيقة تجريبية')} — ${escapeText(d.assetName||'الأصل')} (${escapeText((d.risks||[])[0]?.label||(c.req.risks||[])[0]?.label||'الخطر')})</option>`).join('');
 const metric=c.cfg?c.cfg.label:'مؤشر غير محدد';
 const valueText=c.cfg?`${c.value} ${c.cfg.unit}`:'يُحدد بعد مراجعة الخطر';
 const thresholdText=c.cfg?`${c.cfg.threshold} ${c.cfg.unit}`:'غير محدد';
 const reached=!!c.cfg&&c.value>=c.cfg.threshold;
 const previous=c.req.claim||{};
 let result='';
 if(!c.cfg){result=`<div class="quote-risk-card"><h3>لا يمكن حساب الاستحقاق تلقائيًا</h3><p>الخطر «${escapeText(c.req.otherRisk||'خطر طبيعي آخر')}» يحتاج إلى تحديد مؤشر وحد تفعيل ومصدر بيانات قبل محاكاة التعويض. لا يُصدر الموقع قرار استحقاق تلقائيًا لهذا الخطر.</p></div>`;}
 else if(!reached){
   c.req.claim={status:'not_eligible',amount:0,reason:'لم يتحقق حد التفعيل',indicatorValue:c.value,threshold:c.cfg.threshold,updatedAt:new Date().toISOString(),simulation:true};
   const linked=(workflow.documents||[]).find(d=>d.requestId===c.req.id); if(linked)linked.claim={...c.req.claim};
   saveWorkflow();
   result=`<div class="claim-result claim-result-no"><small>نتيجة المحاكاة</small><h2>لا يستحق التعويض — لم يتحقق المؤشر</h2><strong>0 ريال</strong><p>قيمة المؤشر ${valueText} أقل من حد التفعيل ${thresholdText}. لذلك لا تعويض وفق شرط المؤشر، سواء حدث ضرر أم لا. لا حاجة لإرفاق صور في هذه الحالة.</p></div>`;
 } else {
   const selectedDamage=previous.damage==='yes'?'yes':previous.damage==='no'?'no':'';
   if(selectedDamage==='no'){
     const partial=Math.round(c.benefit*0.10);
     c.req.claim={status:'partial_demo',amount:partial,reason:'تحقق المؤشر دون تسجيل ضرر — منفعة جزئية تجريبية 10%',indicatorValue:c.value,threshold:c.cfg.threshold,damage:'no',updatedAt:new Date().toISOString(),simulation:true};
     const linked=(workflow.documents||[]).find(d=>d.requestId===c.req.id);if(linked)linked.claim={...c.req.claim};saveWorkflow();
     result=`<div class="claim-result claim-result-partial"><small>نتيجة المحاكاة</small><h2>تعويض جزئي تجريبي</h2><strong>${money(partial)}</strong><p>تحقق المؤشر (${valueText} مقابل حد ${thresholdText}) ولم يُسجّل ضرر. احتُسبت المنفعة التوضيحية بنسبة 10% من منفعة الباقة (${money(c.benefit)}). لا يمثل هذا صرفًا حقيقيًا أو شرطًا تأمينيًا معتمدًا.</p><button type="button" class="btn outline" id="changeClaimDamage">تغيير إجابة الضرر</button></div>`;
   } else if(selectedDamage==='yes'){
     const submitted=previous.status==='pending_review';
     result=`<div class="claim-result claim-result-yes"><small>نتيجة المؤشر</small><h2>تحقق حد التفعيل</h2><p>قيمة المؤشر ${valueText} بلغت حد التفعيل ${thresholdText}. أكملي وصف الضرر وإرفاق صورة واحدة على الأقل لإرسال المطالبة للمراجعة.</p></div><div class="fields"><label>تاريخ وقوع الضرر<input type="date" id="claimDamageDate" value="${escapeText(previous.damageDate||'')}"></label><label class="wide">وصف مختصر للضرر<textarea id="claimDamageDescription" placeholder="صفي الضرر الذي حدث">${escapeText(previous.description||'')}</textarea></label><label class="wide">صور الضرر بعد الحدث<input type="file" id="claimDamagePhotos" accept="image/*" multiple></label><label class="wide">مستندات داعمة (اختياري)<input type="file" id="claimSupportFiles" multiple></label><div class="hint wide">المطالبة تنتقل إلى المراجعة عند الإرسال. لا يتم اعتماد الصرف تلقائيًا.</div><div class="actions wide"><button class="btn" type="button" id="submitClaimReview" ${submitted?'disabled':''}>${submitted?'المطالبة قيد المراجعة':'إرسال المطالبة للمراجعة ←'}</button></div></div>`;
   } else {
     result=`<div class="claim-result claim-result-yes"><small>نتيجة المؤشر</small><h2>تحقق حد التفعيل</h2><strong>اختاري حالة الضرر</strong><p>قيمة المؤشر ${valueText} بلغت حد التفعيل ${thresholdText}. حددي هل حدث ضرر حتى تظهر الخطوة المناسبة.</p></div><div class="fields"><label class="wide">هل حدث ضرر؟<select id="claimDamageChoice"><option value="">اختاري الإجابة</option><option value="yes">نعم، حدث ضرر</option><option value="no">لا، لم يحدث ضرر</option></select></label></div>`;
   }
 }
 root.innerHTML=`<div class="fields"><label class="wide">الوثيقة المرتبطة<select id="claimDocumentSelect">${options}</select></label><div class="claim-fact wide"><small>الأصل المؤمن عليه</small><b>${escapeText(c.doc.assetName||c.req.assetName||'—')}</b></div><div class="claim-fact"><small>المنطقة</small><b>${escapeText(c.regionName)}</b></div><div class="claim-fact"><small>الخطر</small><b>${escapeText((c.req.risks||[])[0]?.label||c.req.otherRisk||'غير محدد')}</b></div><div class="claim-fact"><small>المؤشر الحالي في النموذج</small><b>${escapeText(valueText)}</b></div><div class="claim-fact"><small>حد التفعيل في الوثيقة</small><b>${escapeText(thresholdText)}</b></div><div class="hint wide">مصدر المؤشر: بيانات Excel تجريبية موحّدة مع صفحة متابعة المؤشرات، مع عامل توضيحي للمنطقة. ليست قراءة حية أو قياسًا رسميًا.</div></div>${result}`;
 $('#claimDocumentSelect')?.addEventListener('change',e=>{workflow.currentId=e.target.value;saveWorkflow();syncClaimPage()});
 $('#claimDamageChoice')?.addEventListener('change',e=>{c.req.claim={...(c.req.claim||{}),damage:e.target.value,status:e.target.value==='no'?'partial_demo':'eligible_damage',indicatorValue:c.value,threshold:c.cfg.threshold,updatedAt:new Date().toISOString(),simulation:true};saveWorkflow();syncClaimPage();});
 $('#changeClaimDamage')?.addEventListener('click',()=>{c.req.claim={...(c.req.claim||{}),damage:'',status:'eligible_damage',updatedAt:new Date().toISOString(),simulation:true};saveWorkflow();syncClaimPage()});
 $('#submitClaimReview')?.addEventListener('click',()=>{
   const description=$('#claimDamageDescription')?.value.trim()||'';
   const photos=$('#claimDamagePhotos')?.files;
   const date=$('#claimDamageDate')?.value||'';
   if(!description){toast('اكتبي وصف الضرر قبل إرسال المطالبة.');$('#claimDamageDescription')?.focus();return;}if(!(photos&&photos.length)){toast('أرفقي صورة واحدة على الأقل للضرر.');return;}
   c.req.claim={status:'pending_review',amount:c.benefit,reason:'تحقق المؤشر وحدث ضرر — بانتظار المراجعة',indicatorValue:c.value,threshold:c.cfg.threshold,damage:'yes',damageDate:date,description,photoNames:[...(photos||[])].map(f=>f.name),updatedAt:new Date().toISOString(),simulation:true};
   const linked=(workflow.documents||[]).find(d=>d.requestId===c.req.id);if(linked)linked.claim={...c.req.claim};
   c.req.updatedAt=new Date().toISOString();saveWorkflow();syncRequests();syncClaimPage();toast('تم حفظ المطالبة في طلباتي بحالة قيد المراجعة.');
 });
}
$('#claimDemo')?.addEventListener('click',()=>{syncClaimPage()});$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
 const tab=b.dataset.tab;
 $$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));
 const archive=tab==='myarchive', docs=tab==='mydocs';
 showArchivedRequests=archive; showArchivedDocs=archive;
 $('#myrequests').hidden=docs;
 $('#mydocs').hidden=tab==='myrequests';
 $('#archiveIntro').hidden=!archive;
 if(archive){$('#myrequests').hidden=false;$('#mydocs').hidden=false;}
 syncRequests();
}));

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
    'مرحباً':'Welcome','منصة التأمين البارامتري':'Parametric Insurance Platform',
    'حماية أوضح تبدأ من بياناتك':'Clearer Protection Starts with Your Data',
    'سجّل الأصل أولاً، ثم اختر الخطر. بعد مراجعة الطلب وقبوله، ستظهر لك الباقات وعرض التغطية قبل الدفع التجريبي.':'Register your asset first, then choose a risk. After your request is reviewed and accepted, packages and a coverage offer will appear before demo payment.',
    'ابدأ من هنا':'Get Started Here','رحلتك في 4 خطوات':'Your Journey in 4 Steps',
    'إضافة أصل':'Add Asset','متابعة الطلبات':'Track Requests','متابعة المؤشرات':'Track Indicators',
    'طلب تعويض':'Claim Compensation','طلب التعويض':'Compensation Request',
    'الأصل المحدد':'Selected Asset','اختر الأخطار التي ترغب في تغطيتها':'Choose the risks you want covered',
    'الأمطار الغزيرة والسيول':'Heavy Rain & Floods','موجات الحرارة':'Heat Waves',
    'الرياح الشديدة':'Strong Winds','العواصف الرعدية':'Thunderstorms','العواصف الترابية':'Dust Storms',
    'أخطار طبيعية أخرى':'Other Natural Hazards','ملاحظات إضافية (اختياري)':'Additional Notes (Optional)',
    'أي تفاصيل تساعد في مراجعة الطلب':'Any details that may help review your request',
    'قيمة المؤشر':'Indicator Value','حد التفعيل التوضيحي':'Illustrative Trigger Threshold',
    'مصدر البيانات':'Data Source','نوع المؤشر':'Indicator Type','المنطقة المختارة':'Selected Region',
    'آلية الاستحقاق':'Payout Method','حسب شروط الوثيقة':'According to policy terms',
    'ملف Excel تجريبي':'Demo Excel File','عرض بيانات Excel التجريبية':'View Demo Excel Data',
    'الوثيقة':'Policy Document','انتقل إلى طلب التعويض':'Go to Compensation Request',
    'تفاصيل الوثيقة':'Policy Details','تفاصيل الباقة':'Package Details','التغطيات':'Coverage',
    'الشروط والأحكام':'Terms & Conditions','المنافع والمسؤوليات':'Benefits & Responsibilities',
    'ما الذي قد تشمله التغطية؟':'What may be covered?','تنبيه':'Notice',
    'هذه بيانات محاكاة تعليمية وليست سجلات أرصاد رسمية، ولا تمثل قياسات فعلية خاصة بالمنطقة.':'These are educational simulation data, not official weather records or actual measurements for this region.',
    'الأساسية':'Basic','المتوازنة':'Balanced','الأعمال':'Business',
    'الرياض':'Riyadh','جدة':'Jeddah','مكة المكرمة':'Makkah','المدينة المنورة':'Madinah',
    'الدمام':'Dammam','الخبر':'Al Khobar','الطائف':'Taif','تبوك':'Tabuk','أبها':'Abha',
    'جازان':'Jazan','بريدة':'Buraydah','حائل':'Hail','الجوف':'Al Jouf','نجران':'Najran',
    'القصيم':'Al Qassim','مبلغ التعويض':'Compensation Amount','حالة الوثيقة':'Policy Status',
    'حالة الطلب':'Request Status','قيد المراجعة':'Under Review','مقبول':'Accepted','مرفوض':'Rejected',
    'مسودة':'Draft','صادر':'Issued','مكتمل':'Completed','غير متاح':'Unavailable',
    'تسجيل الخروج':'Sign Out','الأسئلة الشائعة':'Frequently Asked Questions',
    'سياسة الخصوصية':'Privacy Policy','مكافأة التجديد':'Renewal Reward'
  };
  const originals = new WeakMap();
  function applyLanguage(lang){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.body.classList.toggle('lang-en', lang === 'en');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      if(!n.nodeValue.trim() || n.parentElement.closest('script,style,input,textarea,.no-translate')) continue;
      if(!originals.has(n)) originals.set(n,n.nodeValue);
      const original = originals.get(n);
      if(lang === 'ar'){ n.nodeValue = original; continue; }
      let value = original;
      const trimmed = value.trim();
      const keys = Object.keys(translations).sort((a,b)=>b.length-a.length);
      for (const key of keys) {
        if (value.includes(key)) value = value.split(key).join(translations[key]);
      }
      n.nodeValue = value;
    }
    const attrOriginals = window.__riskoraLanguageAttrOriginals || (window.__riskoraLanguageAttrOriginals = new WeakMap());
    const attrKeys = ['placeholder','title','aria-label'];
    document.querySelectorAll('input,textarea,button,[title],[aria-label]').forEach(el=>{
      for (const attr of attrKeys) {
        if (!el.hasAttribute(attr)) continue;
        let saved = attrOriginals.get(el);
        if (!saved) { saved = {}; attrOriginals.set(el,saved); }
        if (!(attr in saved)) saved[attr] = el.getAttribute(attr);
        const original = saved[attr];
        let translated = original;
        if (lang === 'en') {
          for (const key of Object.keys(translations).sort((a,b)=>b.length-a.length)) {
            if (translated.includes(key)) translated = translated.split(key).join(translations[key]);
          }
        }
        el.setAttribute(attr,translated);
      }
    });
    document.querySelectorAll('option').forEach(el=>{
      if (!el.dataset.riskoraArText) el.dataset.riskoraArText = el.textContent;
      let val = el.dataset.riskoraArText;
      if (lang === 'en') {
        for (const key of Object.keys(translations).sort((a,b)=>b.length-a.length)) {
          if (val.includes(key)) val = val.split(key).join(translations[key]);
        }
      }
      el.textContent = val;
    });
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

$('#closePolicyPhotoViewer')?.addEventListener('click',()=>{const v=$('#policyPhotoViewer');if(v)v.hidden=true;const im=$('#policyPhotoViewerImage');if(im)im.removeAttribute('src')});$('#policyPhotoViewer')?.addEventListener('click',e=>{if(e.target.id==='policyPhotoViewer')$('#closePolicyPhotoViewer')?.click()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#policyPhotoViewer')&&!$('#policyPhotoViewer').hidden)$('#closePolicyPhotoViewer')?.click()});


// إدارة السجلات التجريبية
$('#toggleArchivedRequests')?.addEventListener('click',()=>{showArchivedRequests=!showArchivedRequests;$('#toggleArchivedRequests').textContent=showArchivedRequests?'عرض الطلبات النشطة':'عرض الطلبات المؤرشفة';syncRequests();});
$('#toggleArchivedDocs')?.addEventListener('click',()=>{showArchivedDocs=!showArchivedDocs;$('#toggleArchivedDocs').textContent=showArchivedDocs?'عرض الوثائق النشطة':'عرض الوثائق المؤرشفة';syncRequests();});
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{const docsTab=b.dataset.tab==='mydocs';$('#toggleArchivedRequests').hidden=docsTab;$('#toggleArchivedDocs').hidden=!docsTab;$('#selectAllRecords').textContent='تحديد الكل';}));
$('#selectAllRecords')?.addEventListener('click',()=>{const panel=$('#mydocs').hidden?$('#myrequests'):$('#mydocs');const checks=[...panel.querySelectorAll('.record-check')];const all=checks.length>0&&checks.every(c=>c.checked);checks.forEach(c=>c.checked=!all);$('#selectAllRecords').textContent=all?'تحديد الكل':'إلغاء التحديد';});
$('#bulkArchiveRecords')?.addEventListener('click',()=>{const panel=$('#mydocs').hidden?$('#myrequests'):$('#mydocs');const checks=[...panel.querySelectorAll('.record-check:checked')];if(!checks.length){toast('حددي عنصرًا واحدًا على الأقل.');return;}checks.forEach(c=>{const targetArchived=!(c.dataset.recordType==='doc'?showArchivedDocs:showArchivedRequests);if(c.dataset.recordType==='doc'){const d=workflow.documents.find(x=>x.requestId===c.value);if(d){d.archived=targetArchived;const r=workflow.requests.find(x=>x.id===d.requestId);if(r)r.archived=targetArchived;}}else{const r=workflow.requests.find(x=>x.id===c.value);if(r){r.archived=targetArchived;const d=workflow.documents.find(x=>x.requestId===r.id);if(d)d.archived=targetArchived;}}});saveWorkflow();syncRequests();toast('تم تحديث أرشفة العناصر المحددة.');});
$('#bulkDeleteRecords')?.addEventListener('click',()=>{const panel=$('#mydocs').hidden?$('#myrequests'):$('#mydocs');const checks=[...panel.querySelectorAll('.record-check:checked')];if(!checks.length){toast('حددي عنصرًا واحدًا على الأقل.');return;}if(!confirm('تأكيد حذف العناصر المحددة نهائيًا؟ لا يمكن التراجع عن الحذف.'))return;checks.forEach(c=>{if(c.dataset.recordType==='doc'){workflow.documents=workflow.documents.filter(x=>x.requestId!==c.value);}else{workflow.requests=workflow.requests.filter(x=>x.id!==c.value);workflow.documents=workflow.documents.filter(x=>x.requestId!==c.value);}});saveWorkflow();syncRequests();toast('تم حذف العناصر المحددة.');});
$('#clearDemoData')?.addEventListener('click',()=>{if(!confirm('سيتم حذف جميع الطلبات والوثائق التجريبية المحفوظة لهذا الحساب على هذا الجهاز. هل تريدين المتابعة؟'))return;workflow=emptyWorkflow();saveWorkflow();requestSent=false;accepted=false;paid=false;showArchivedRequests=false;showArchivedDocs=false;syncRequests();toast('تم مسح البيانات التجريبية لهذا الحساب.');});
