/* VH pager: finger-following edge swipe, compositor-only snap, warm phone iframe.
   Keep Safari's own horizontal navigation untouched: cross-page return via
   outside edge handle, or from the phone HOME screen's extreme left edge. */
(()=>{
 'use strict';
 const open=document.getElementById('vhOpenPhone');
 const back=document.getElementById('vhPhoneBack');
 const layer=document.getElementById('vhPhoneLayer');
 const frame=document.getElementById('vhPhoneIframe');
 const shell=document.querySelector('.shell');
 if(!open||!back||!layer||!frame||!shell)return;

 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const width=()=>Math.max(1,window.innerWidth||document.documentElement.clientWidth);
 const now=()=>performance.now();
 let progress=0;
 let page='dossier';
 let drag=null;
 let snapping=false;
 let snapTimer=0;
 let raf=0;
 let pending=0;
 let ignoreOpenClickUntil=0;
 let ignoreBackClickUntil=0;
 let phoneLoaded=false;

 // One-off warmup: doing this BEFORE the first navigation avoids loading 58
 // stylesheets and Safari assets at the exact moment the page starts sliding.
 function warmPhone(){
   if(!frame.getAttribute('src'))frame.setAttribute('src','phone/');
 }
 frame.addEventListener('load',()=>{
   phoneLoaded=true;
   installPhoneHomeEdgeSwipe();
 });
 if('requestIdleCallback' in window){
   window.requestIdleCallback(warmPhone,{timeout:650});
 }else{
   setTimeout(warmPhone,130);
 }

 function render(value){
   progress=clamp(value,0,1);
   const w=width();
   // Only two transform properties change. Never animate X-ray, dust,
   // grain, blurs, or the large avatar image.
   layer.style.transform='translate3d('+((1-progress)*w).toFixed(2)+'px,0,0)';
   shell.style.transform='translate3d('+(-progress*Math.min(w*.18,100)).toFixed(2)+'px,0,0)';
 }
 function renderSoon(value){
   pending=value;
   if(raf)return;
   raf=requestAnimationFrame(()=>{
     raf=0;
     render(pending);
   });
 }
 function flush(){
   if(raf){cancelAnimationFrame(raf);raf=0;render(pending)}
 }
 function activeDialog(){
   return document.body.classList.contains('lock') ||
     !!document.querySelector('#chatSheet.open,#modalLayer.open,.chat-sheet.open');
 }
 function begin(origin,e,source='parent'){
   if(drag||snapping)return;
   const x=source==='iframe'?e.screenX:e.clientX;
   const y=source==='iframe'?e.screenY:e.clientY;
   drag={
     origin,source,pointerId:e.pointerId,
     x0:x,y0:y,x,y,active:false,
     samples:[[x,now()]],
     onHandle:source==='parent'&&!!e.target.closest('.vh-open-phone,.vh-phone-back')
   };
 }
 function activate(){
   if(!drag||drag.active)return;
   drag.active=true;
   document.body.classList.add('vh-nav-dragging');
   document.body.classList.remove('vh-phone-active');
   layer.removeAttribute('inert');
   layer.setAttribute('aria-hidden','false');
   warmPhone();
   // Capturing the active pointer prevents losing it when the pane follows a
   // touch across the viewport. The iframe has its own capture when applicable.
   try{
     const doc=drag.source==='iframe'?frame.contentDocument:document;
     doc.documentElement.setPointerCapture(drag.pointerId);
   }catch(_){}
 }
 function move(e,source){
   if(!drag||drag.source!==source||drag.pointerId!==e.pointerId)return;
   const x=source==='iframe'?e.screenX:e.clientX;
   const y=source==='iframe'?e.screenY:e.clientY;
   const dx=x-drag.x0,dy=y-drag.y0;
   if(!drag.active){
     if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)*1.1){drag=null;return}
     const inward=drag.origin==='dossier'?-dx:dx;
     if(inward<9||Math.abs(dx)<Math.abs(dy)*1.18)return;
     activate();
   }
   drag.x=x;drag.y=y;
   const t=now();
   drag.samples.push([x,t]);
   drag.samples=drag.samples.filter(sample=>t-sample[1]<110);
   const fraction=drag.origin==='dossier'?-dx/width():1-dx/width();
   renderSoon(fraction);
   if(e.cancelable)e.preventDefault();
 }
 function finish(e,source,canceled=false){
   if(!drag||drag.source!==source||drag.pointerId!==e.pointerId)return;
   const d=drag;
   drag=null;
   if(!d.active)return;
   flush();
   document.body.classList.remove('vh-nav-dragging');
   const last=d.samples[d.samples.length-1]||[d.x,now()];
   const first=d.samples[0]||last;
   const velocity=(last[0]-first[0])/Math.max(1,last[1]-first[1]);
   const destination=canceled
     ?(d.origin==='dossier'?0:1)
     :(d.origin==='dossier'
       ?((progress>.28||velocity<-.48)?1:0)
       :((progress<.72||velocity>.48)?0:1));
   if(d.onHandle){
     if(d.origin==='dossier')ignoreOpenClickUntil=now()+400;
     else ignoreBackClickUntil=now()+400;
   }
   snap(destination,false);
   if(e.cancelable)e.preventDefault();
 }

 // No gesture listener is installed in Safari, Messages, or Notes.
 // The dossier accepts horizontal touch drags unless an interactive element
 // or open dialog owns the pointer.
 document.addEventListener('pointerdown',e=>{
   if(page!=='dossier'||snapping||activeDialog()||!e.isPrimary)return;
   const handle=!!e.target.closest('.vh-open-phone');
   if(e.pointerType!=='touch'&&!handle)return;
   if(!handle&&e.target.closest('button,input,textarea,select,a,[role="button"],[contenteditable],.dock,.chat-sheet,.modal-layer'))return;
   begin('dossier',e);
 },{passive:true});
 back.addEventListener('pointerdown',e=>{
   if(page!=='phone'||snapping||!e.isPrimary)return;
   begin('phone',e);
 },{passive:true});
 document.addEventListener('pointermove',e=>move(e,'parent'),{passive:false});
 document.addEventListener('pointerup',e=>finish(e,'parent'),{passive:false});
 document.addEventListener('pointercancel',e=>finish(e,'parent',true),{passive:false});

 // On the phone HOME screen only, allow a very narrow edge swipe to return.
 // Within apps (especially Safari), all their native gestures keep priority.
 function installPhoneHomeEdgeSwipe(){
   try{
     const doc=frame.contentDocument;
     if(!doc||doc.documentElement.dataset.vhHomeSwipe==='1')return;
     doc.documentElement.dataset.vhHomeSwipe='1';
     const home=doc.getElementById('homeScreen');
     if(home)home.style.touchAction='pan-y';
     doc.addEventListener('pointerdown',e=>{
       if(page!=='phone'||snapping||drag||e.pointerType!=='touch'||!e.isPrimary)return;
       if(e.clientX>23||e.target.closest('button,a,input,[data-app]'))return;
       if(!home||!home.classList.contains('active'))return;
       const screen=doc.getElementById('screen');
       if(screen&&/\b(?:safari-open|messages-open|notes-open)\b/.test(screen.className))return;
       if(doc.querySelector('#ios8AppSwitcher.open'))return;
       begin('phone',e,'iframe');
     },{passive:true,capture:true});
     doc.addEventListener('pointermove',e=>move(e,'iframe'),{passive:false,capture:true});
     doc.addEventListener('pointerup',e=>finish(e,'iframe'),{passive:false,capture:true});
     doc.addEventListener('pointercancel',e=>finish(e,'iframe',true),{passive:false,capture:true});
   }catch(_){
     // Cross-origin isolation would disable edge swipe, but the visible
     // back handle remains fully functional.
   }
 }

 function snap(destination,focus){
   if(snapping)return;
   if(raf)flush();
   clearTimeout(snapTimer);
   const remaining=Math.abs(destination-progress);
   const duration=reduced()?0:Math.round(165+125*remaining);
   snapping=true;
   if(destination===1)warmPhone();
   layer.removeAttribute('inert');
   layer.setAttribute('aria-hidden','false');
   document.body.classList.remove('vh-phone-active');
   document.documentElement.style.setProperty('--vh-nav-duration',duration+'ms');
   document.body.classList.add('vh-nav-snapping');
   // Force the current finger-followed transform to be the transition origin.
   void layer.offsetWidth;
   requestAnimationFrame(()=>{
     render(destination);
     snapTimer=setTimeout(()=>{
       snapping=false;
       page=destination?'phone':'dossier';
       document.body.classList.remove('vh-nav-snapping');
       document.body.classList.toggle('vh-phone-active',!!destination);
       layer.classList.toggle('is-interactive',!!destination);
       layer.setAttribute('aria-hidden',destination?'false':'true');
       if(destination)layer.removeAttribute('inert');
       else layer.setAttribute('inert','');
       open.setAttribute('aria-expanded',destination?'true':'false');
       if(focus)(destination?back:open).focus({preventScroll:true});
     },duration+24);
   });
 }
 open.addEventListener('click',e=>{
   if(now()<ignoreOpenClickUntil){e.preventDefault();return}
   if(page==='dossier'&&!snapping&&!activeDialog())snap(1,true);
 });
 back.addEventListener('click',e=>{
   if(now()<ignoreBackClickUntil){e.preventDefault();return}
   if(page==='phone'&&!snapping)snap(0,true);
 });
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&page==='phone'&&!snapping)snap(0,true);
 });

 // Refit only on viewport changes; do not reset the mounted iframe or app state.
 window.addEventListener('resize',()=>{
   if(!drag&&!snapping)render(page==='phone'?1:0);
 },{passive:true});
 layer.setAttribute('inert','');
 render(0);
})();
