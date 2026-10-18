
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

let selectedType='منزل',selectedPackage='المتوازنة',assetName='منزلي في الرياض',region='الرياض',requestSent=false,accepted=false,paid=false;const pages=['home','asset','hazard','review','packages','offer','policy','indicator','claim','requests','data','settings','notifications','about','policy-use','contact'];const titles={home:'الرئيسية',asset:'أصولي',hazard:'طلب التغطية',review:'مراجعة الطلب',packages:'اختيار الباقة',offer:'مراجعة العرض والدفع',policy:'إصدار الوثيقة',indicator:'المؤشرات',claim:'طلب تعويض',requests:'طلباتي ووثائقي',data:'بيانات النموذج',settings:'الإعدادات',notifications:'الإشعارات',about:'عن مرصد رسكورا','policy-use':'سياسة الاستخدام',contact:'تواصل معنا'};function go(id){if((id==='packages'||id==='offer'||id==='policy'||id==='indicator'||id==='claim')&&!accepted){toast('تظهر هذه المرحلة بعد قبول الأصل في رحلة الطلب.');if(requestSent)showPage('review');else showPage('asset');return}showPage(id)}function showPage(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id||(id==='hazard'&&b.dataset.page==='hazard')||(['review','packages','offer'].includes(id)&&b.dataset.page==='hazard')));window.scrollTo({top:0,behavior:'smooth'});if(id==='hazard')syncAsset();if(id==='offer')syncOffer();if(id==='policy')syncPolicy();if(id==='indicator')syncIndicator();if(id==='requests')syncRequests();if(id==='data')renderWeatherData();if(id==='settings')syncSettings()}function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}document.addEventListener('click',e=>{const goBtn=e.target.closest('[data-go]');if(goBtn)go(goBtn.dataset.go);const nav=e.target.closest('[data-page]');if(nav)go(nav.dataset.page)});$$('.type').forEach(b=>b.addEventListener('click',()=>{$$('.type').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedType=b.dataset.type}));function syncAsset(){assetName=$('#assetName').value.trim()||`أصل ${selectedType} في ${$('#region').value}`;region=$('#region').value;$('#summaryAsset').textContent=assetName;$('#summaryRegion').textContent=region}$('#saveAsset').addEventListener('click',()=>{syncAsset();if(!$('#address').value.trim()){toast('أضيفي وصف الموقع أو العنوان قبل المتابعة.');$('#address').focus();return}toast('تم حفظ بيانات الأصل في المعاينة.');go('hazard')});$('#submitRequest').addEventListener('click',()=>{syncAsset();requestSent=true;$('#requestId').textContent='REQ-2026-'+String(Math.floor(1000+Math.random()*8999));$('#listId').textContent=$('#requestId').textContent+' · تم الإرسال';$('#listStatus').textContent='قيد المراجعة';showPage('review');toast('تم إرسال الطلب التجريبي للمراجعة.')});$('#approveDemo').addEventListener('click',()=>{accepted=true;$('#listStatus').textContent='مقبول مبدئيًا';$('#listStatus').className='status';toast('تمت محاكاة قبول الأصل. الباقات أصبحت متاحة.');showPage('packages')});$$('.selectPackage').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.package');selectedPackage=card.dataset.package;$$('.package').forEach(p=>{p.classList.toggle('selected',p===card);p.classList.toggle('featured',p===card)});$$('.selectPackage').forEach(btn=>{btn.textContent=btn.closest('.package')===card?'✓ تم اختيار الباقة':'اختيار الباقة';btn.classList.toggle('outline',btn.closest('.package')!==card)});toast('تم اختيار '+selectedPackage)}));const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590},benefits={'الأساسية':'2,500','المتوازنة':'5,000','الأعمال':'10,000'};$('#continueOffer').addEventListener('click',()=>{syncOffer();go('offer')});function syncOffer(){syncAsset();$('#offerAsset').textContent=assetName;$('#offerRegion').textContent=region;$('#offerPackage').textContent=selectedPackage;$('#offerPrice').textContent=prices[selectedPackage]+' ريال';$('#offerBenefit').textContent=benefits[selectedPackage]+' ريال';if($('#paySummaryPrice'))$('#paySummaryPrice').textContent=prices[selectedPackage]+' ريال';if($('#paySummaryTotal'))$('#paySummaryTotal').textContent=prices[selectedPackage]+' ريال'}$('#payDemo').addEventListener('click',()=>{if(!$('#terms').checked){toast('يرجى الموافقة على الشروط التوضيحية أولًا.');return}paid=true;toast('تم تسجيل الدفع التجريبي — لا توجد عملية مالية فعلية.');syncPolicy();showPage('policy')});function syncPolicy(){syncAsset();$('#policyAsset').textContent=assetName;$('#policyPackage').textContent=selectedPackage;$('#policyPrice').textContent=prices[selectedPackage]+' ريال'}function syncIndicator(){syncAsset();$('#indicatorAsset').textContent=assetName;$('#indicatorRegion').textContent=region+' · الأمطار والسيول'}function syncRequests(){syncAsset();$('#listAsset').textContent=assetName;$('#claimRow').hidden=!window.claimSent}$('#claimDemo').addEventListener('click',()=>{window.claimSent=true;syncRequests();toast('تم إرسال طلب التعويض التجريبي للمراجعة.');go('requests')});$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#myrequests').hidden=b.dataset.tab!=='myrequests';$('#mydocs').hidden=b.dataset.tab!=='mydocs'}));

function syncSettings(){
 const theme=document.body.classList.contains('theme-dark')?'dark':'light';
 $$('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
}


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
$('#contactForm')?.addEventListener('submit',e=>{
 e.preventDefault();const name=$('#contactName').value.trim();const topic=$('#contactTopic').value;const msg=$('#contactMessage').value.trim();
 if(!msg){toast('اكتبي رسالتك أولًا.');return;}
 $('#contactResult').hidden=false;$('#contactResult').textContent=`تم تجهيز ملاحظتك${name?' يا '+name:''} حول «${topic}». في هذه النسخة التجريبية لا تُرسل الرسالة إلى جهة خارجية.`;e.target.reset();toast('تم تسجيل الملاحظة في المعاينة.');
});
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
  const signedIn = sessionStorage.getItem('riskora_demo_signed_in') === '1';
  if (signedIn) screen.hidden = true;
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
    screen.hidden = true;
    const welcome = document.querySelector('[data-user-name], .user-name, #userName');
    if (welcome) welcome.textContent = username;
  });
})();
