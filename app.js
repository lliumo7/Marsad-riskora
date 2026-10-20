
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

let selectedType='منزل',selectedPackage='المتوازنة',assetName='منزلي في الرياض',region='الرياض',requestSent=false,accepted=false,paid=false;const pages=['home','asset','hazard','review','packages','offer','policy','indicator','claim','requests','data','settings','notifications','about','policy-use','contact'];const titles={home:'الرئيسية',asset:'أصولي',hazard:'طلب التغطية',review:'مراجعة الطلب',packages:'اختيار الباقة',offer:'مراجعة العرض والدفع',policy:'إصدار الوثيقة',indicator:'المؤشرات',claim:'طلب تعويض',requests:'طلباتي ووثائقي',data:'بيانات النموذج',settings:'الإعدادات',notifications:'الإشعارات',about:'عن مرصد رسكورا','policy-use':'سياسة الاستخدام',contact:'تواصل معنا'};function go(id){if((id==='packages'||id==='offer'||id==='policy'||id==='indicator'||id==='claim')&&!accepted){toast('تظهر هذه المرحلة بعد قبول الأصل في رحلة الطلب.');if(requestSent)showPage('review');else showPage('asset');return}showPage(id)}function showPage(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id||(id==='hazard'&&b.dataset.page==='hazard')||(['review','packages','offer'].includes(id)&&b.dataset.page==='hazard')));window.scrollTo({top:0,behavior:'smooth'});if(id==='hazard')syncAsset();if(id==='offer')syncOffer();if(id==='policy')syncPolicy();if(id==='indicator')syncIndicator();if(id==='requests')syncRequests();if(id==='data')renderWeatherData();if(id==='settings')syncSettings()}function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}document.addEventListener('click',e=>{const goBtn=e.target.closest('[data-go]');if(goBtn)go(goBtn.dataset.go);const nav=e.target.closest('[data-page]');if(nav)go(nav.dataset.page)});$$('.type').forEach(b=>b.addEventListener('click',()=>{$$('.type').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedType=b.dataset.type}));function syncAsset(){assetName=$('#assetName').value.trim()||`أصل ${selectedType} في ${$('#region').value}`;region=$('#region').value;$('#summaryAsset').textContent=assetName;$('#summaryRegion').textContent=region}$('#saveAsset').addEventListener('click',()=>{syncAsset();if(!$('#address').value.trim()){toast('أضيفي وصف الموقع أو العنوان قبل المتابعة.');$('#address').focus();return}toast('تم حفظ بيانات الأصل في المعاينة.');go('hazard')});$('#submitRequest').addEventListener('click',()=>{syncAsset();requestSent=true;$('#requestId').textContent='REQ-2026-'+String(Math.floor(1000+Math.random()*8999));$('#listId').textContent=$('#requestId').textContent+' · تم الإرسال';$('#listStatus').textContent='قيد المراجعة';showPage('review');toast('تم إرسال الطلب التجريبي للمراجعة.')});$('#approveDemo').addEventListener('click',()=>{accepted=true;$('#listStatus').textContent='مقبول مبدئيًا';$('#listStatus').className='status';toast('تمت محاكاة قبول الأصل. الباقات أصبحت متاحة.');showPage('packages')});$$('.selectPackage').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.package');selectedPackage=card.dataset.package;$$('.package').forEach(p=>{p.classList.toggle('selected',p===card);p.classList.toggle('featured',p===card)});$$('.selectPackage').forEach(btn=>{btn.textContent=btn.closest('.package')===card?'✓ تم اختيار الباقة':'اختيار الباقة';btn.classList.toggle('outline',btn.closest('.package')!==card)});toast('تم اختيار '+selectedPackage)}));const prices={'الأساسية':180,'المتوازنة':320,'الأعمال':590},benefits={'الأساسية':'2,500','المتوازنة':'5,000','الأعمال':'10,000'};$('#continueOffer').addEventListener('click',()=>{syncOffer();go('offer')});function syncOffer(){syncAsset();$('#offerAsset').textContent=assetName;$('#offerRegion').textContent=region;$('#offerPackage').textContent=selectedPackage;$('#offerPrice').textContent=prices[selectedPackage]+' ريال';$('#offerBenefit').textContent=benefits[selectedPackage]+' ريال';if($('#paySummaryPrice'))$('#paySummaryPrice').textContent=prices[selectedPackage]+' ريال';if($('#paySummaryTotal'))$('#paySummaryTotal').textContent=prices[selectedPackage]+' ريال'}$('#payDemo').addEventListener('click',()=>{if(!$('#terms').checked){toast('يرجى الموافقة على الشروط التوضيحية أولًا.');return}paid=true;toast('تم تسجيل الدفع التجريبي — لا توجد عملية مالية فعلية.');syncPolicy();showPage('policy')});function syncPolicy(){syncAsset();$('#policyAsset').textContent=assetName;$('#policyPackage').textContent=selectedPackage;$('#policyPrice').textContent=prices[selectedPackage]+' ريال'}
let selectedRisk = 'rain';
const riskConfig = {
 rain: {label:'كمية الهطول المطري', unit:'ملم', field:'rain', threshold:70, source:'ملف Excel تجريبي'},
 wind: {label:'سرعة الرياح', unit:'كم/ساعة', field:'wind', threshold:60, source:'ملف Excel تجريبي'},
 heat: {label:'درجة الحرارة العظمى', unit:'°م', field:'temp', threshold:45, source:'ملف Excel تجريبي'},
 storm: {label:'مؤشر العواصف الرعدية (سرعة الرياح)', unit:'كم/ساعة', field:'wind', threshold:60, source:'مؤشر تقريبي من بيانات الرياح التجريبية'},
 dust: {label:'مؤشر العواصف الترابية (سرعة الرياح)', unit:'كم/ساعة', field:'wind', threshold:50, source:'مؤشر تقريبي من بيانات الرياح التجريبية'}
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
 const cfg = riskConfig[selectedRisk] || riskConfig.rain;
 const regionName = region || $('#region')?.value || 'الرياض';
 const factor = regionFactors[regionName] || 1.0;
 // Use the latest experimental row for the selected indicator, with a transparent demo-only regional adjustment.
 const row = weatherDataset[weatherDataset.length - 1];
 const raw = row[cfg.field];
 const value = Math.round(raw * factor);
 const unit = cfg.unit;
 $('#indicatorAsset').textContent = assetName;
 $('#indicatorRegion').textContent = regionName + ' · ' + (document.querySelector('.haz-option[data-risk="'+selectedRisk+'"] b')?.textContent || 'الخطر المختار');
 $('#indicatorRegionValue').textContent = regionName;
 $('#indicatorMetricLabel').textContent = cfg.label;
 $('#indicatorValue').textContent = value;
 $('#indicatorUnit').textContent = unit;
 $('#thresholdCurrent').textContent = value;
 $('#thresholdUnit').textContent = unit;
 $('#thresholdValue').textContent = cfg.threshold;
 $('#thresholdUnit2').textContent = unit;
 $('#indicatorType').textContent = cfg.label;
 $('#indicatorSource').textContent = cfg.source;
 const pct = Math.min(100, Math.round(value / cfg.threshold * 100));
 $('#indicatorMeter').style.width = pct + '%';
 const status = $('#thresholdStatus');
 if(value >= cfg.threshold){status.textContent='تم بلوغ حد المؤشر في المحاكاة — مثال فقط';status.className='status';}
 else {status.textContent='لم يتحقق حد التفعيل في المحاكاة — مثال فقط';status.className='status pending';}
}
document.querySelectorAll('.haz-option input').forEach(input => input.addEventListener('change', () => {
  const all = [...document.querySelectorAll('.haz-option input')];
  const checked = all.filter(x=>x.checked);
  // This prototype displays one indicator at a time, so keep the most recently selected hazard as the active indicator.
  if(input.checked){
    all.forEach(x=>{ if(x!==input) x.checked=false; });
    selectedRisk = input.closest('.haz-option').dataset.risk || 'rain';
  } else if(!checked.length) {
    input.checked=true;
  }
  syncIndicator();
}));
function syncRequests(){syncAsset();$('#listAsset').textContent=assetName;$('#claimRow').hidden=!window.claimSent}$('#claimDemo').addEventListener('click',()=>{window.claimSent=true;syncRequests();toast('تم إرسال طلب التعويض التجريبي للمراجعة.');go('requests')});$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#myrequests').hidden=b.dataset.tab!=='myrequests';$('#mydocs').hidden=b.dataset.tab!=='mydocs'}));

function getSavedDemoName(){
 try { return (localStorage.getItem('riskora_demo_name') || sessionStorage.getItem('riskora_demo_name') || '').trim(); }
 catch(e){ return (sessionStorage.getItem('riskora_demo_name') || '').trim(); }
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
  const storedName = (()=>{ try{return localStorage.getItem('riskora_demo_name') || sessionStorage.getItem('riskora_demo_name') || '';}catch(e){return sessionStorage.getItem('riskora_demo_name') || '';}})();
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
    try { localStorage.setItem('riskora_demo_name', username); } catch(e) {}
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
