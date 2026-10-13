(()=>{
 const open=document.getElementById('vhOpenPhone');
 const back=document.getElementById('vhPhoneBack');
 const layer=document.getElementById('vhPhoneLayer');
 const frame=document.getElementById('vhPhoneIframe');
 if(!open||!back||!layer||!frame)return;
 let busy=false;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let finishTimer=0;
 function settle(callback){
   clearTimeout(finishTimer);
   finishTimer=setTimeout(()=>{busy=false;callback?.()},reduced()?0:640);
 }
 function openPhone(){
   if(busy||layer.classList.contains('open'))return;
   busy=true;
   if(!frame.getAttribute('src'))frame.src='phone/';
   layer.classList.add('open');
   layer.setAttribute('aria-hidden','false');
   document.body.classList.add('vh-phone-visible');
   open.setAttribute('aria-expanded','true');
   settle(()=>back.focus({preventScroll:true}));
 }
 function closePhone(){
   if(busy||!layer.classList.contains('open'))return;
   busy=true;
   layer.classList.remove('open');
   layer.setAttribute('aria-hidden','true');
   document.body.classList.remove('vh-phone-visible');
   open.setAttribute('aria-expanded','false');
   settle(()=>open.focus({preventScroll:true}));
 }
 open.addEventListener('click',openPhone);
 back.addEventListener('click',closePhone);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open'))closePhone()});
})();
