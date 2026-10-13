/* VH: bridge the real dossier chat with the player's iOS8 Messages. */
(()=>{
 'use strict';
 const iframe=document.getElementById('vhPhoneIframe');
 const layer=document.getElementById('vhPhoneLayer');
 const ORIGIN=location.origin;
 if(!iframe||!layer)return;
 let queuedOpen=false,timer=0;
 const history=()=>{
   try{const s=JSON.parse(localStorage.getItem('vh_v3_save')||'{}');
     return {history:Array.isArray(s.chat)?s.chat:[],phase:s.phase||'solve'};
   }catch{return {history:[],phase:'solve'}}
 };
 const send=(type,more={})=>{
   try{iframe.contentWindow?.postMessage({type,...history(),...more},ORIGIN)}catch(_){}
 };
 function openPhoneMessages(){
   queuedOpen=true;
   if(!document.body.classList.contains('vh-phone-active'))
     document.getElementById('vhOpenPhone')?.click();
   else{send('vh:open');queuedOpen=false}
 }
 iframe.addEventListener('load',()=>{
   send('vh:sync');
   if(queuedOpen){send('vh:open');queuedOpen=false}
 });
 const toast=document.createElement('button');
 toast.type='button';toast.id='vh-new-message-banner';
 toast.setAttribute('aria-label','Xem tin nhắn mới của Neymarinho');
 toast.innerHTML='<strong>Điều tra viên Neymarinho</strong><span></span>';
 const style=document.createElement('style');
 style.textContent=`
   #vh-new-message-banner{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));
    left:50%;width:min(92vw,360px);transform:translate(-50%,-160%);
    z-index:10050;padding:12px 15px;text-align:left;cursor:pointer;
    color:#eee;background:rgba(26,27,33,.96);border:1px solid rgba(255,255,255,.22);
    border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.3);
    font:13px -apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
    pointer-events:none;opacity:0;transition:transform .23s ease,opacity .2s ease}
   #vh-new-message-banner.show{transform:translate(-50%,0);pointer-events:auto;opacity:1}
   #vh-new-message-banner strong{display:block;margin-bottom:4px}
   #vh-new-message-banner span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 `;
 document.head.appendChild(style);document.body.appendChild(toast);
 toast.addEventListener('click',()=>{toast.classList.remove('show');openPhoneMessages()});
 function onNewPartner(){
   const h=history().history;const m=[...h].reverse().find(x=>x.who==='partner');
   if(!m)return;
   const onPhone=document.body.classList.contains('vh-phone-active');
   send('vh:new',{text:m.text,notifyOnPhone:onPhone});
   if(!onPhone){
     toast.querySelector('span').textContent=m.text;
     toast.classList.add('show');clearTimeout(timer);
     timer=setTimeout(()=>toast.classList.remove('show'),6500);
   }
 }
 document.addEventListener('vh:partner-message',onNewPartner);
 window.addEventListener('message',e=>{
   if(e.origin!==ORIGIN||e.source!==iframe.contentWindow||!e.data)return;
   if(e.data.type==='vh:ready')send('vh:sync');
   if(e.data.type==='vh:reply'){
     const text=String(e.data.text||'').trim();if(!text)return;
     const field=document.getElementById('chatInput');
     const form=document.getElementById('chatForm');
     if(field&&form){field.value=text;form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));send('vh:sync')}
   }else if(e.data.type==='vh:action'){
     if(e.data.action==='continue'){
       document.getElementById('continue')?.click();
       // Reports/questions live on the dossier page, so return from the
       // phone when continuing a case phase.
       if(document.body.classList.contains('vh-phone-active'))
         document.getElementById('vhPhoneBack')?.click();
     }
     if(e.data.action==='hint')document.getElementById('hint')?.click();
     send('vh:sync');
   }
 });
 // Clicking the banner before the iframe has finished loading still navigates.
 const observer=new MutationObserver(()=>{
   if(queuedOpen&&document.body.classList.contains('vh-phone-active')){
     send('vh:open');queuedOpen=false;
   }
 });
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
