/* VH: bridge the real dossier chat with the player's iOS8 Messages. */
(()=>{
 'use strict';
 const iframe=document.getElementById('vhPhoneIframe');
 const layer=document.getElementById('vhPhoneLayer');
 const ORIGIN=location.origin;
 if(!iframe||!layer)return;
 let queuedOpen=false,timer=0;
 const history=()=>({history:[],phase:'solve'});
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
 window.addEventListener('message',e=>{
   if(e.origin!==ORIGIN||e.source!==iframe.contentWindow||!e.data)return;
   if(e.data.type==='vh:ready')send('vh:sync');
   // Leandro prototype chat, hints and free-form replies are disabled.

 });
 // Clicking the banner before the iframe has finished loading still navigates.
 const observer=new MutationObserver(()=>{
   if(queuedOpen&&document.body.classList.contains('vh-phone-active')){
     send('vh:open');queuedOpen=false;
   }
 });
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
