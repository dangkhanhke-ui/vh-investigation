/* Q1 replay control on the main game, available after access/intro. */
(()=>{
 'use strict';
 const phone=document.getElementById('vhOpenPhone');
 if(!phone)return;
 const button=document.createElement('button');
 button.type='button';button.id='vh-q1-test-replay';
 button.textContent='↻ REPLAY Q1';button.title='Chạy lại Q1 và tin nhắn Neymarinho sau Q1; giữ nguyên intro / mật khẩu';
 const style=document.createElement('style');
 style.textContent=`
 #vh-q1-test-replay{position:fixed;z-index:11020;display:none;padding:10px 13px;min-height:38px;background:#111;color:#f01414;border:0;border-radius:999px;box-shadow:0 5px 18px #0007;font:700 12px Inconsolata,Consolas,monospace;letter-spacing:.06em;cursor:pointer;white-space:nowrap}
 #vh-q1-test-replay:hover{background:#292929}
 body.vh-phone-active #vh-q1-test-replay,body.vh-onboarding #vh-q1-test-replay{display:none!important}
 `;
 document.head.appendChild(style);
 phone.insertAdjacentElement('beforebegin',button);
 function position(){
   const r=phone.getBoundingClientRect();
   if(!r.width||!r.height)return;
   button.style.top=Math.max(8,Math.min(innerHeight-48,r.top+r.height/2-19))+'px';
   button.style.left=Math.max(8,Math.min(innerWidth-button.offsetWidth-8,r.left-button.offsetWidth-10))+'px';
 }
 function refresh(){
   let done=false,auth=false;
   try{done=localStorage.getItem('vh.intro.finished.v1')==='yes';auth=localStorage.getItem('vh.access.authorized.v1')==='yes'}catch(_){}
   const visible=(done||auth)&&!document.body.classList.contains('vh-onboarding')&&!document.body.classList.contains('vh-phone-active');
   button.style.display=visible?'block':'none';
   if(visible)position();
 }
 button.addEventListener('click',()=>{
   if(!confirm('Replay Q1? Chỉ xóa tiến trình câu 01 và hai tin nhắn Q1 của Neymarinho. Intro và mật khẩu sẽ được giữ nguyên.'))return;
   try{
     localStorage.removeItem('vh.q1.r6.completed.v1');
     localStorage.removeItem('vh.q1.r6.story-phase.v1');
   }catch(_){}
   location.reload();
 });
 window.addEventListener('resize',refresh,{passive:true});
 document.addEventListener('vh:intro-finished',refresh);
 new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['class']});
 refresh();
})();