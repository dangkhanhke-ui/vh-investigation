/* VH: bridge the real dossier chat with the player's iOS8 Messages. */
(()=>{
 'use strict';
 const iframe=document.getElementById('vhPhoneIframe');
 const layer=document.getElementById('vhPhoneLayer');
 const ORIGIN=location.origin;
 if(!iframe||!layer)return;
 let queuedOpen=false,timer=0;
 const GREET_SHOWN='vh.neymarinho.welcome.announced.v1';
 const GREET_ACK='vh.neymarinho.welcome.acked.v1';
 let welcomeBanner=false;
 const flag=k=>{try{return localStorage.getItem(k)==='yes'}catch(_){return false}};
 const saveFlag=k=>{try{localStorage.setItem(k,'yes')}catch(_){}};

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
 toast.innerHTML='<div class="vh-head"><img class="vh-icon" src="phone/messages.png.png" alt="">MESSAGES <span class="vh-more">Show More</span></div><div class="vh-body"><span></span><small>now</small></div>';
 const style=document.createElement('style');
 style.textContent=`
   #vh-new-message-banner{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:50%;width:min(92vw,360px);transform:translate(-50%,-160%);z-index:10050;padding:0;text-align:left;cursor:pointer;color:#161616;background:rgba(218,219,223,.96);border:0;border-radius:15px;overflow:hidden;box-shadow:0 8px 28px #0005;font:13px -apple-system,sans-serif;pointer-events:none;opacity:0;transition:transform .23s,opacity .2s}
   #vh-new-message-banner.show{transform:translate(-50%,0);pointer-events:auto;opacity:1}
   #vh-new-message-banner .vh-head{display:flex;align-items:center;gap:8px;padding:9px 11px;background:rgba(242,242,244,.94);color:#555;font-size:11px}
   #vh-new-message-banner .vh-icon{display:block;width:19px;height:19px;border-radius:5px;object-fit:cover;flex-shrink:0}
   #vh-new-message-banner .vh-more{margin-left:auto}
   #vh-new-message-banner .vh-body{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 13px;font-size:14px}
   #vh-new-message-banner .vh-body span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
   #vh-new-message-banner .vh-body small{color:#777;flex-shrink:0}
 `;
 document.head.appendChild(style);document.body.appendChild(toast);
 function soundAlert(){window.VHSound?.play('notification')}
 toast.addEventListener('click',()=>{
   toast.classList.remove('show');welcomeBanner=false;clearTimeout(timer);
   openPhoneMessages();
 });
 // Neymarinho's first contact arrives after the initial investigation intro.
 // Only alert once; the player can also read it later inside Messages.
 function greetWhenGameBegins(){
   if(flag(GREET_SHOWN)||flag(GREET_ACK))return;
   saveFlag(GREET_SHOWN);
   toast.querySelector('.vh-body span').textContent='Hey.';
   welcomeBanner=true;
   toast.classList.add('show');
   soundAlert();
 }
 document.addEventListener('vh:stage-archive-shown',greetWhenGameBegins);

 function onNewPartner(){
   const h=history().history;const m=[...h].reverse().find(x=>x.who==='partner');
   if(!m)return;
   const onPhone=document.body.classList.contains('vh-phone-active');
   send('vh:new',{text:m.text,notifyOnPhone:onPhone});
   if(!onPhone){
     welcomeBanner=false;
     toast.querySelector('.vh-body span').textContent=m.text;
     toast.classList.add('show');soundAlert();clearTimeout(timer);
     timer=setTimeout(()=>toast.classList.remove('show'),2300);
   }
 }
 document.addEventListener('vh:partner-message',onNewPartner);
 window.addEventListener('message',e=>{
   if(e.origin!==ORIGIN||e.source!==iframe.contentWindow||!e.data)return;
   if(e.data.type==='vh:notification-sound'){soundAlert();return;}
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
