/* VH scripted Neymarinho conversation in player phone. */
(()=>{
 'use strict';
 const iframe=document.getElementById('vhPhoneIframe');
 if(!iframe)return;
 const ORIGIN=location.origin;
 const KEY='vh.neymarinho.intro-replied.v1';
 const SCRIPT=['Hey.','Anh mới có số mày','Từ giờ anh sẽ liên lạc với mày qua đây nhé','Có thêm thông tin gì thì anh sẽ gửi'];
 let queuedOpen=false,ready=false,notified=false;
 const done=()=>{try{return localStorage.getItem(KEY)==='yes'}catch(_){return false}};
 const history=()=>[...SCRIPT.map((text,i)=>({who:'partner',text,at:Date.now()-(SCRIPT.length-i)*90000})),...(done()?[{who:'me',text:'Ok anh',at:Date.now()}]:[])];
 const send=(type,extra={})=>{
  try{iframe.contentWindow?.postMessage({type,history:history(),phase:done()?'done':'await',...extra},ORIGIN)}catch(_){}
 };
 function notify(){
  if(notified||done()||!ready)return;
  notified=true;send('vh:new',{text:SCRIPT[SCRIPT.length-1]});
 }
 function openPhoneMessages(){
  queuedOpen=true;
  if(!document.body.classList.contains('vh-phone-active'))
   document.getElementById('vhOpenPhone')?.click();
  else if(ready){send('vh:open');queuedOpen=false}
 }
 iframe.addEventListener('load',()=>{ready=true;send('vh:sync');if(queuedOpen){send('vh:open');queuedOpen=false}else if(document.body.classList.contains('vh-phone-active'))notify()});
 window.addEventListener('message',e=>{
  if(e.origin!==ORIGIN||e.source!==iframe.contentWindow||!e.data)return;
  if(e.data.type==='vh:ready'){ready=true;send('vh:sync');if(queuedOpen){send('vh:open');queuedOpen=false}else if(document.body.classList.contains('vh-phone-active'))notify()}
  if(e.data.type==='vh:action'&&e.data.action==='ack'){
   try{localStorage.setItem(KEY,'yes')}catch(_){}
   send('vh:sync');
  }
 });
 document.addEventListener('vh:intro-finished',()=>{if(ready)notify()});
 new MutationObserver(()=>{
  if(queuedOpen&&ready&&document.body.classList.contains('vh-phone-active')){send('vh:open');queuedOpen=false}
  else if(ready&&document.body.classList.contains('vh-phone-active'))notify();
 }).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.VHOpenNeymarinhoMessages=openPhoneMessages;
})();
