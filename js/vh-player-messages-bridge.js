/* VH scripted Neymarinho conversation in player phone. */
(()=>{
 'use strict';
 const iframe=document.getElementById('vhPhoneIframe');
 if(!iframe)return;
 const ORIGIN=location.origin;
 const story=window.VHNeymarinhoStory;
 if(!story)return;
 let queuedOpen=false,ready=false,notified=false;
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
