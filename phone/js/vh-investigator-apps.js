/* Player Messages: deterministic Neymarinho onboarding; no Leandro prototype engine. */
(()=>{
 'use strict';
 const bridge=window.CauaMessagesBridge,ORIGIN=location.origin;
 const thread=bridge?.threads.find(t=>t.id==='neymarinho');
 if(!bridge||!thread)return;
 thread.number='+55 (21) 99847-2631';
 thread.listName=thread.displayName='Neymarinho';
 const ANNOUNCED='vh.neymarinho.welcome.announced.v3';
 const OPENED='vh.neymarinho.welcome.opened.v3';
 const COUNT='vh.neymarinho.welcome.count.v3';
 const ACK='vh.neymarinho.welcome.acked.v3';
 const LIKE='vh.neymarinho.welcome.liked.v3';
 const read=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
 const set=(k,v='yes')=>{try{localStorage.setItem(k,v)}catch(_){}};
 const count=()=>Math.min(3,Math.max(0,Number(read(COUNT))||0));
 const lines=['Anh mới có số mày','Từ giờ anh sẽ liên lạc với mày qua đây nhé','Có thêm thông tin gì thì anh sẽ gửi'];
 let caseHistory=[],phase='solve',typingTimer=0,likeTimer=0,lastSignature='';
 const active=()=>bridge.app.classList.contains('open')&&bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho';
 const stamp=(text,direction='incoming')=>{
   const d=new Date(),z=x=>String(x).padStart(2,'0');
   return {date:z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear(),time:z(d.getHours())+':'+z(d.getMinutes()),direction,body:text,status:direction==='outgoing'?'sent':null,unread:false};
 };
 const sanitize=history=>Array.isArray(history)?history.slice(-250).filter(m=>m&&typeof m.text==='string'&&(m.who==='partner'||m.who==='me')).map(m=>{
   const d=new Date(Number(m.at)||Date.now()),z=x=>String(x).padStart(2,'0');
   return {date:z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear(),time:z(d.getHours())+':'+z(d.getMinutes()),
     direction:m.who==='me'?'outgoing':'incoming',body:m.text,status:m.who==='me'?'sent':null,unread:false};
 }):[];
 const style=document.createElement('style');
 style.textContent=`
 #vh-investigator-notification{position:absolute;top:26px;left:8px;right:8px;z-index:160;padding:0;border:0;border-radius:14px;background:#e7e7eb;color:#171717;font:13px -apple-system,sans-serif;text-align:left;box-shadow:0 5px 18px #0004;opacity:0;transform:translateY(-115%);pointer-events:none;transition:transform .18s,opacity .18s}
 #vh-investigator-notification.show{opacity:1;transform:none;pointer-events:auto}
 #vh-investigator-notification .vh-head{padding:8px 12px;font-size:11px;color:#777;border-bottom:1px solid #d1d1d6}
 #vh-investigator-notification .vh-body{padding:11px 12px;font-size:14px}
 #messagesApp.vh-neymar-scripted #messagesComposer{display:flex!important;align-items:center;justify-content:flex-end;padding:5px 10px!important;height:44px!important}
 #messagesApp.vh-neymar-scripted #messagesComposer>:not(#vh-scripted-replies){display:none!important}
 #vh-scripted-replies{width:100%;display:flex;justify-content:flex-end;align-items:center}
 #vh-scripted-replies[hidden]{display:none!important}
 #vh-scripted-replies button{border:0;border-radius:18px;background:#007aff;color:#fff;min-height:34px;padding:6px 17px;font:500 14px -apple-system,sans-serif;touch-action:manipulation}
 #messagesApp.vh-neymar-scripted.vh-acknowledged #messagesComposer{display:none!important}
 #messagesApp.vh-neymar-scripted.vh-acknowledged .msg-convo-scroll{bottom:0!important}
 #messagesApp.vh-neymar-scripted:not(.vh-acknowledged) .msg-convo-scroll{bottom:44px!important}
 #vh-investigator-typing{display:flex;align-items:center;gap:4px;width:max-content;margin:8px 0 6px 7px;padding:12px 15px;border-radius:18px;background:#e6e6eb}
 #vh-investigator-typing i{width:7px;height:7px;border-radius:50%;background:#96969c;animation:vh-dot 1s ease-in-out infinite;display:block}
 #vh-investigator-typing i:nth-child(2){animation-delay:.15s}#vh-investigator-typing i:nth-child(3){animation-delay:.3s}
 @keyframes vh-dot{0%,60%,100%{opacity:.4;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
 #messagesApp .msg-line.vh-neymar-liked .msg-bubble{position:relative!important;overflow:visible!important}
 #messagesApp .msg-line.vh-neymar-liked .msg-bubble:after{content:"👍";position:absolute;top:-14px;left:-14px;display:grid;place-items:center;width:26px;height:26px;border:2px solid #fff;border-radius:50%;background:#e8e8ed;font-size:13px;line-height:1;box-shadow:0 2px 5px #0002;z-index:2}
 #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-unread-dot{display:none!important}
 @media(prefers-reduced-motion:reduce){#vh-investigator-typing i{animation:none}}
 `;
 document.head.appendChild(style);
 const toast=document.createElement('button');
 toast.id='vh-investigator-notification';toast.type='button';
 toast.innerHTML='<div class="vh-head">MESSAGES · NEYMARINHO</div><div class="vh-body">Hey.</div>';
 document.getElementById('screen')?.appendChild(toast);
 function noTyping(){if(typingTimer){clearTimeout(typingTimer);typingTimer=0}document.getElementById('vh-investigator-typing')?.remove()}
 function reaction(){
   if(read(LIKE)!=='yes'||!active())return;
   for(const row of bridge.convoScroll.querySelectorAll('.msg-line.outgoing')){
     if(row.querySelector('.msg-bubble')?.textContent?.trim()==='Ok anh')row.classList.add('vh-neymar-liked');
   }
 }
 function messages(){
   if(read(OPENED)!=='yes')return [];
   const result=[stamp('Hey.'),...lines.slice(0,read(ACK)==='yes'?3:count()).map(t=>stamp(t))];
   if(read(ACK)==='yes')result.push(stamp('Ok anh','outgoing'));
   return result.concat(sanitize(caseHistory));
 }
 function refresh(force=false){
   const content=messages(),key=content.map(x=>x.direction+':'+x.body).join('|');
   thread.messages=content;
   thread.preview=content.length?content[content.length-1].body:(read(ANNOUNCED)==='yes'?'Hey.':'');
   thread.unread=false;
   if(active()){
     if(force||key!==lastSignature){bridge.renderConversation(thread,false);lastSignature=key}
     reaction();
   }else if(bridge.state.view==='list')bridge.renderList(false);
   controls();
 }
 const replies=document.createElement('div');
 replies.id='vh-scripted-replies';replies.innerHTML='<button type="button">Ok anh</button>';
 bridge.composer.appendChild(replies);
 function controls(){
   const on=active();
   bridge.app.classList.toggle('vh-neymar-scripted',on);
   bridge.app.classList.toggle('vh-acknowledged',read(ACK)==='yes');
   replies.hidden=!on||read(OPENED)!=='yes'||count()<3||read(ACK)==='yes';
   if(!on)noTyping();
 }
 function typing(){
   if(!active()||read(OPENED)!=='yes'||read(ACK)==='yes'||count()>=3||typingTimer)return;
   const dots=document.createElement('div');
   dots.id='vh-investigator-typing';dots.setAttribute('aria-label','Neymarinho đang gõ');
   dots.innerHTML='<i></i><i></i><i></i>';
   bridge.convoScroll.appendChild(dots);
   bridge.convoScroll.scrollTop=bridge.convoScroll.scrollHeight;
   typingTimer=setTimeout(()=>{
     typingTimer=0;dots.remove();
     if(!active())return;
     set(COUNT,String(count()+1));
     refresh(true);
     window.parent.postMessage({type:'vh:notification-sound'},ORIGIN);
     typing();
   },1250+count()*330);
 }
 function openInvestigator(){
   if(read(ANNOUNCED)!=='yes')return;
   toast.classList.remove('show');
   if(read(OPENED)!=='yes')set(OPENED);
   if(document.getElementById('lockScreen')?.classList.contains('active'))document.getElementById('unlockHint')?.click();
   window.CauaMessagesOpenThread?.('neymarinho');
   lastSignature='';
   refresh(true);typing();
 }
 toast.addEventListener('click',openInvestigator);
 replies.querySelector('button').addEventListener('click',()=>{
   if(!active()||count()<3||read(ACK)==='yes')return;
   noTyping();set(ACK);
   refresh(true);
   likeTimer=setTimeout(()=>{
     likeTimer=0;
     set(LIKE);reaction();
     window.parent.postMessage({type:'vh:notification-sound'},ORIGIN);
   },950);
 });
 bridge.app.addEventListener('click',()=>{
   queueMicrotask(()=>{
     if(active()&&read(ANNOUNCED)==='yes'){
       if(read(OPENED)!=='yes'){set(OPENED);lastSignature='';refresh(true)}
       controls();reaction();typing();
     }else controls();
   });
 });
 window.addEventListener('message',e=>{
   if(e.source!==window.parent||e.origin!==ORIGIN||!e.data)return;
   const p=e.data;
   if(p.type==='vh:sync'||p.type==='vh:new'){
     caseHistory=Array.isArray(p.history)?p.history:[];phase=p.phase||'solve';
     if(!typingTimer)refresh();
   }else if(p.type==='vh:open'){
     openInvestigator();
   }
 });
 // Keep standalone phone notification off during the scripted welcome.
 // The parent displays the one Hey banner only after phone walkthrough.
 refresh();
  // Crash-safe portrait: CSS-only; no MutationObserver or DOM rewriting.
  // A prior mutation observer created an unbounded feedback loop in Messages.
  const avatarStyle=document.createElement('style');
  avatarStyle.textContent=`
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"]{
      display:grid!important;grid-template-columns:9px 44px minmax(0,1fr) auto!important;
      column-gap:8px!important;align-items:center!important;min-width:0!important;
      max-width:100%!important;width:100%!important;box-sizing:border-box!important;
      min-height:72px!important;padding:8px 12px!important;overflow:hidden!important
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-unread-dot{
      grid-column:1!important;grid-row:1!important;align-self:center!important;margin:0!important
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"]::before{
      content:"";display:block;grid-column:2;grid-row:1;
      width:42px;height:42px;border-radius:50%;background-color:#ddd;
      background-image:url("./assets/investigator-avatar.png");
      background-size:cover;background-repeat:no-repeat;background-position:center
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-thread-main{
      grid-column:3!important;grid-row:1!important;min-width:0!important;overflow:hidden!important;padding:0!important
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-thread-meta{
      grid-column:4!important;grid-row:1!important;justify-self:end!important;
      width:auto!important;min-width:0!important;max-width:none!important;
      padding:0!important;margin:0!important;white-space:nowrap!important;
      overflow:visible!important;text-align:right!important;font-size:11px!important
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-thread-name,
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-thread-preview{
      display:block!important;min-width:0!important;max-width:100%!important;
      overflow:hidden!important;white-space:nowrap!important;text-overflow:ellipsis!important
    }
    /* Symmetric conversation navigation: title centered on the phone, not between unequal buttons. */
    #messagesApp .msg-convo .msg-nav{
      grid-template-columns:76px minmax(0,1fr) 76px!important;
    }
    #messagesApp .msg-convo .msg-convo-title{
      color:#111!important;text-align:center!important;justify-self:center!important;
      width:100%!important;min-width:0!important;max-width:100%!important;
      overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important
    }
    #messagesApp .msg-convo .msg-nav-btn:last-child{
      min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;
      white-space:nowrap!important;text-align:right!important
    }
    /* Bring the investigator portrait and thread content close to the left edge. */
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"]{
      grid-template-columns:0px 42px minmax(0,1fr) auto!important;
      column-gap:5px!important;padding-left:2px!important;padding-right:2px!important;
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-unread-dot{
      width:0!important;height:0!important;overflow:hidden!important
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"]::before{
      width:42px!important;height:42px!important
    }
    #messagesApp .msg-thread-row[data-thread-id="neymarinho"] .msg-thread-meta{
      font-size:10px!important;max-width:88px!important;overflow:hidden!important
    }
    #messagesApp .msg-detail-person .msg-detail-avatar{
      font-size:0!important;background-image:url("./assets/investigator-avatar.png")!important;
      background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important
    }
  `;
  document.head.appendChild(avatarStyle);
  // No red unread badges anywhere on the simulated phone.
  const vhBadgeOff=document.createElement('style');
  vhBadgeOff.textContent=`
    #homeScreen [class*="badge"],#homeScreen [class*="Badge"],
    #homeScreen [class*="notification-count"],#homeScreen [class*="notif-count"],
    #homeScreen .messages-launch::after,#homeScreen .messages-launch .icon::after,
    #messagesApp .msg-unread-dot{display:none!important;visibility:hidden!important}
    #messagesApp .msg-detail-action[data-detail-call] .circle{
      display:grid!important;place-items:center!important;color:#007aff!important
    }
    #messagesApp .msg-detail-action[data-detail-call] .circle svg{
      width:19px;height:19px;display:block;stroke:currentColor;fill:none;
      stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round
    }
  `;
  document.head.appendChild(vhBadgeOff);
  const phoneSvg='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.34 1.91.66 2.81a2 2 0 0 1-.45 2.11L8.03 8.9a16 16 0 0 0 6 6l1.27-1.26a2 2 0 0 1 2.11-.45c.9.32 1.85.54 2.81.66A2 2 0 0 1 22 16.92Z"/></svg>';
  // Detail content is recreated on each open; patch it at its render entry point.
  document.addEventListener('click',e=>{
    if(!e.target.closest('#messagesApp'))return;
    requestAnimationFrame(()=>{
      const circle=document.querySelector('#messagesApp [data-detail-call] .circle');
      if(circle&&circle.querySelector('svg')===null)circle.innerHTML=phoneSvg;
    });
  },true);


  // Ask the parent for existing history on the initial phone load.
  if(window.parent!==window)window.parent.postMessage({type:'vh:ready'},ORIGIN);
})();
