/* VH scripted Neymarinho conversation in player phone. */
(()=>{
 'use strict';
 const iframe=document.getElementById('vhPhoneIframe');
 if(!iframe)return;
 const ORIGIN=location.origin;
 const story=window.VHNeymarinhoStory;
 if(!story)return;
 let queuedOpen=false,ready=false,notified=false,q1NotificationScheduled=false,q1DeliveryTimer=0;
 const q1Banner=document.createElement('button');
 q1Banner.type='button';q1Banner.id='vh-q1-message-notification';
 q1Banner.setAttribute('aria-label','Mở tin nhắn mới từ Neymarinho');
 q1Banner.innerHTML='<span class="vh-q1-notification-app">MESSAGES <small>BÂY GIỜ</small></span><span class="vh-q1-notification-title">Neymarinho</span><span class="vh-q1-notification-preview">Anh có chuyện muốn nói về hiện trường R6...</span>';
 document.body.appendChild(q1Banner);
 const bannerStyle=document.createElement('style');
 bannerStyle.textContent=`
 #vh-q1-message-notification{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));left:50%;transform:translate(-50%,-150%);z-index:13000;width:min(420px,calc(100% - 26px));padding:12px 16px 14px;border:0;border-radius:16px;background:rgba(225,225,230,.97);box-shadow:0 10px 35px #0008;display:flex;flex-direction:column;align-items:flex-start;gap:5px;text-align:left;color:#111;font:14px -apple-system,BlinkMacSystemFont,sans-serif;opacity:0;pointer-events:none;transition:transform .28s ease,opacity .2s ease}
 #vh-q1-message-notification.show{transform:translate(-50%,0);opacity:1;pointer-events:auto}
 #vh-q1-message-notification .vh-q1-notification-app{width:100%;font-size:10px;color:#73737a;font-weight:700}
 #vh-q1-message-notification .vh-q1-notification-app small{float:right;font-size:10px;font-weight:400}
 #vh-q1-message-notification .vh-q1-notification-title{font-weight:700}
 #vh-q1-message-notification .vh-q1-notification-preview{font-size:13px}
 `;
 document.head.appendChild(bannerStyle);
 function showQ1Banner(){if(story.q1Phase()!==1)return;q1Banner.classList.add('show');window.VHSound?.play('notification')}
 function queueQ1Banner(){
   if(q1NotificationScheduled||story.q1Phase()!==1)return;
   q1NotificationScheduled=true;setTimeout(()=>{q1NotificationScheduled=false;showQ1Banner()},3000);
 }
 q1Banner.addEventListener('click',()=>{q1Banner.classList.remove('show');openPhoneMessages()});
 function beginQ1Messages(){
   if(story.q1Phase()===1){story.q1Started();send('vh:sync')}
   if(story.q1Phase()===2&&!q1DeliveryTimer){
     q1DeliveryTimer=setTimeout(()=>{q1DeliveryTimer=0;if(story.q1Phase()!==2)return;story.q1Finished();send('vh:sync');window.dispatchEvent(new CustomEvent('vh:q1-dialogue-complete'))},2300);
   }
 }
 window.addEventListener('vh:q1-solved',()=>{story.q1Solved();send('vh:sync');queueQ1Banner()});
 if(story.q1Phase()===1)queueQ1Banner();
 const send=(type,extra={})=>{
  try{iframe.contentWindow?.postMessage({type,...story.snapshot(),...extra},ORIGIN)}catch(_){}
 };
 function notify(){
  if(notified||story.acknowledged()||!ready)return;
  notified=true;send('vh:new',{text:story.notification});
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
  if(e.data.type==='vh:action'&&e.data.action==='q1-opened'){beginQ1Messages()}
  if(e.data.type==='vh:action'&&e.data.action==='read'){
   if(!story.isRead()){story.markRead();send('vh:sync')}
  }
  if(e.data.type==='vh:action'&&e.data.action==='ack'){
   story.acknowledge();
   story.markRead();
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
