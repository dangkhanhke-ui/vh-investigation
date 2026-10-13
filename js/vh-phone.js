/* VH: true swipe-only dossier <-> phone navigation.
   No visible arrow, no click target, no Safari gesture hijacking. */
(()=>{
 'use strict';
 const layer=document.getElementById('vhPhoneLayer');
 const frame=document.getElementById('vhPhoneIframe');
 const edge=document.getElementById('vhPhoneSwipeEdge');
 if(!layer||!frame||!edge)return;

 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const width=()=>Math.max(1,document.documentElement.clientWidth||innerWidth);
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const time=()=>performance.now();
 let page='dossier',progress=0,drag=null,snapping=false,raf=0,pending=0;
 let fallback=0;

 // Load the same iframe once; preserve Safari, Notes and Messages state.
 const warm=()=>{if(!frame.hasAttribute('src'))frame.src='phone/'};
 if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:650});
 else setTimeout(warm,100);

 function render(p){
   progress=clamp(p,0,1);
   layer.style.transform='translate3d('+((1-progress)*width()).toFixed(2)+'px,0,0)';
 }
 function queueRender(p){
   pending=p;
   if(!raf)raf=requestAnimationFrame(()=>{raf=0;render(pending)});
 }
 function flush(){
   if(raf){cancelAnimationFrame(raf);raf=0;render(pending)}
 }
 function modalOpen(){
   return !!document.querySelector('#chatSheet.open,#modalLayer.open,.chat-sheet.open,.modal-layer.open')||
     document.body.classList.contains('lock');
 }
 function coordinate(e,source){
   // screenX is stable even when the iframe itself is moving under the finger.
   return source==='phone'?e.screenX:e.clientX;
 }
 function start(e,origin,source){
   if(drag||snapping||!e.isPrimary)return;
   drag={
     id:e.pointerId,origin,source,
     x0:coordinate(e,source),y0:e.clientY,
     active:false,lastX:coordinate(e,source),samples:[[coordinate(e,source),time()]]
   };
 }
 function engage(e){
   if(!drag||drag.active)return;
   drag.active=true;
   warm();
   document.body.classList.add('vh-nav-dragging');
   layer.removeAttribute('inert');
   layer.setAttribute('aria-hidden','false');
   try{e.target.setPointerCapture(e.pointerId)}catch(_){}
 }
 function move(e,source){
   const d=drag;
   if(!d||d.source!==source||e.pointerId!==d.id)return;
   const x=coordinate(e,source),dx=x-d.x0,dy=e.clientY-d.y0;
   if(!d.active){
     if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)*1.12){drag=null;return}
     if(Math.abs(dx)<11||Math.abs(dx)<Math.abs(dy)*1.25)return;
     if(d.origin==='dossier'&&dx>=0)return;
     if(d.origin==='phone'&&dx<=0)return;
     engage(e);
   }
   d.lastX=x;
   const t=time();
   d.samples.push([x,t]);
   while(d.samples.length>2&&t-d.samples[0][1]>105)d.samples.shift();
   queueRender(d.origin==='dossier'?-dx/width():1-dx/width());
   if(e.cancelable)e.preventDefault();
 }
 function end(e,source,canceled=false){
   const d=drag;
   if(!d||d.source!==source||e.pointerId!==d.id)return;
   drag=null;
   if(!d.active)return;
   flush();
   document.body.classList.remove('vh-nav-dragging');
   const first=d.samples[0],last=d.samples[d.samples.length-1];
   const velocity=(last[0]-first[0])/Math.max(1,last[1]-first[1]);
   const destination=canceled?(d.origin==='dossier'?0:1):
     d.origin==='dossier'?(progress>.26||velocity<-.48?1:0):
     (progress<.74||velocity>.48?0:1);
   snap(destination);
   if(e.cancelable)e.preventDefault();
 }
 function snap(target){
   if(snapping)return;
   flush();
   warm();
   snapping=true;
   const duration=reduced()?0:Math.round(150+110*Math.abs(target-progress));
   document.documentElement.style.setProperty('--vh-snap-duration',duration+'ms');
   document.body.classList.add('vh-nav-snapping');
   layer.removeAttribute('inert');
   layer.setAttribute('aria-hidden','false');
   let completed=false;
   function complete(){
     if(completed)return;
     completed=true;
     clearTimeout(fallback);
     layer.removeEventListener('transitionend',onEnd);
     snapping=false;
     page=target?'phone':'dossier';
     render(target);
     document.body.classList.remove('vh-nav-snapping');
     document.body.classList.toggle('vh-phone-active',!!target);
     layer.classList.toggle('is-interactive',!!target);
     layer.setAttribute('aria-hidden',target?'false':'true');
     if(target)layer.removeAttribute('inert');
     else layer.setAttribute('inert','');
   }
   function onEnd(e){if(e.target===layer&&e.propertyName==='transform')complete()}
   layer.addEventListener('transitionend',onEnd);
   void layer.offsetWidth;
   requestAnimationFrame(()=>{
     render(target);
     if(!duration){complete();return}
     fallback=setTimeout(complete,duration+200);
   });
 }

 // Swipe left on the dossier. Ignore taps, vertical scrolling and interactive
 // dossier elements; mouse drag works on desktop, touch drag on mobile.
 document.addEventListener('pointerdown',e=>{
   if(page!=='dossier'||snapping||modalOpen()||!e.isPrimary)return;
   if(e.pointerType==='mouse'&&e.button!==0)return;
   if(e.target.closest('button,a,input,textarea,select,[role="button"],[contenteditable],.dock,.chat-sheet,.modal-layer,[data-no-swipe]'))return;
   start(e,'dossier','parent');
 },{passive:true});
 document.addEventListener('pointermove',e=>move(e,'parent'),{passive:false});
 document.addEventListener('pointerup',e=>end(e,'parent'),{passive:false});
 document.addEventListener('pointercancel',e=>end(e,'parent',true),{passive:false});

 // The invisible 20px left-edge strip sits OUTSIDE the iframe's touch handlers.
 // This works from Safari, Notes, Messages, lock screen, and Home without
 // stealing horizontal gestures from the app's interior.
 edge.addEventListener('pointerdown',e=>{
   if(page!=='phone'||snapping||!e.isPrimary)return;
   if(e.pointerType==='mouse'&&e.button!==0)return;
   start(e,'phone','parent');
 },{passive:true});

 // On the phone HOME screen also allow swiping right from anywhere on empty
 // space, Elmwood-style. In Safari/Notes/Messages the interior remains theirs.
 function installHomeSwipe(){
   try{
     const doc=frame.contentDocument;
     if(!doc||doc.documentElement.dataset.vhPagerSwipe)return;
     doc.documentElement.dataset.vhPagerSwipe='1';
     const home=doc.getElementById('homeScreen');
     if(home)home.style.touchAction='pan-y';
     doc.addEventListener('pointerdown',e=>{
       if(page!=='phone'||snapping||drag||!e.isPrimary)return;
       if(e.pointerType==='mouse'&&e.button!==0)return;
       if(!home||!home.classList.contains('active'))return;
       if(e.target.closest('button,a,input,textarea,select,[data-app],[contenteditable]'))return;
       const screen=doc.getElementById('screen');
       if(screen&&/\b(?:safari-open|messages-open|notes-open)\b/.test(screen.className))return;
       if(doc.querySelector('#ios8AppSwitcher.open'))return;
       start(e,'phone','phone');
     },{passive:true,capture:true});
     doc.addEventListener('pointermove',e=>move(e,'phone'),{passive:false,capture:true});
     doc.addEventListener('pointerup',e=>end(e,'phone'),{passive:false,capture:true});
     doc.addEventListener('pointercancel',e=>end(e,'phone',true),{passive:false,capture:true});
     doc.addEventListener('keydown',e=>{
       if(e.key==='Escape'&&page==='phone'&&!snapping&&!drag)snap(0);
     });
   }catch(_){/* Same-origin required; invisible edge remains available. */}
 }
 frame.addEventListener('load',installHomeSwipe);
 if(frame.contentDocument?.readyState==='complete')installHomeSwipe();

 // Keyboard accessibility without a visible arrow.
 document.addEventListener('keydown',e=>{
   if(snapping||drag||modalOpen())return;
   if(e.key==='ArrowRight'&&page==='dossier'&&!e.target.closest('input,textarea,[contenteditable]'))snap(1);
   if((e.key==='ArrowLeft'||e.key==='Escape')&&page==='phone')snap(0);
 });
 window.addEventListener('resize',()=>{if(!drag&&!snapping)render(page==='phone'?1:0)},{passive:true});
 layer.setAttribute('inert','');
 render(0);
})();
