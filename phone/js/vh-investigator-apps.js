/* VH player-facing iOS Messages & Notes. Loaded AFTER Cauã's visual engines. */
(()=>{
  'use strict';
  const bridge=window.CauaMessagesBridge;
  const ORIGIN=location.origin;
  const investigatorNumber='+55 (21) 99847-2631';
  const thread=bridge?.threads.find(t=>t.id==='neymarinho');
  if(!bridge||!thread)return;
  thread.number=investigatorNumber;
  thread.listName='Neymarinho';
  thread.displayName='Neymarinho';

  // One-time scripted onboarding. This conversation belongs to the player's
  // phone, never Cauã's phone; independent of the free-text case engine.
  const WELCOME_OPENED='vh.neymarinho.welcome.opened.v1';
  const WELCOME_ACK='vh.neymarinho.welcome.acked.v1';
  const getFlag=k=>{try{return localStorage.getItem(k)==='yes'}catch(_){return false}};
  const setFlag=k=>{try{localStorage.setItem(k,'yes')}catch(_){}};
  let caseHistory=[],casePhase='solve';
  const welcomeMessages=['Anh mới có số mày','Từ giờ anh sẽ liên lạc với mày qua đây nhé','Có thêm thông tin gì thì anh sẽ gửi'];
  function message(text,direction='incoming'){
    const now=new Date(),pad=n=>String(n).padStart(2,'0');
    return {date:pad(now.getDate())+'/'+pad(now.getMonth()+1)+'/'+now.getFullYear(),
      time:pad(now.getHours())+':'+pad(now.getMinutes()),
      direction,body:text,status:direction==='outgoing'?'sent':null,unread:false};
  }
  function mergedHistory(){
    const opened=getFlag(WELCOME_OPENED),acked=getFlag(WELCOME_ACK);
    return [...(opened?welcomeMessages.map(t=>message(t)):[]),
      ...(acked?[message('Ok anh','outgoing')]:[]),...sanitize(caseHistory)];
  }


  // Notes has one editable page. Never load old Cauã notes or show new-note controls.
  const style=document.createElement('style');
  style.textContent=`
    #vh-investigator-notification{position:absolute;top:26px;left:8px;right:8px;z-index:160;padding:0;border:0;border-radius:15px;background:rgba(218,219,223,.96);color:#171717;font:13px -apple-system,sans-serif;overflow:hidden;box-shadow:0 5px 20px #0004;text-align:left;cursor:pointer;opacity:0;transform:translateY(-130%);pointer-events:none;transition:transform .24s,opacity .2s}
    #vh-investigator-notification.show{opacity:1;transform:translateY(0);pointer-events:auto}
    #vh-investigator-notification .vh-head{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(242,242,244,.94);color:#59595d;font-size:11px}
    #vh-investigator-notification .vh-icon{display:block;width:19px;height:19px;border-radius:5px;object-fit:cover;flex-shrink:0}
    #vh-investigator-notification .vh-more{margin-left:auto}
    #vh-investigator-notification .vh-body{display:flex;gap:8px;justify-content:space-between;padding:11px 12px;font-size:14px}
    #vh-investigator-notification .vh-body span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #vh-investigator-notification .vh-body small{flex-shrink:0;color:#777}
    #messagesConversationView .msg-convo-scroll{bottom:88px!important}
    #messagesApp.vh-neymar-scripted #messagesComposer{display:flex!important;align-items:center;justify-content:flex-end;padding:5px 10px!important;height:44px!important}
    #messagesApp.vh-neymar-scripted #messagesComposer>:not(#vh-scripted-replies){display:none!important}
    #vh-scripted-replies{width:100%;display:flex;align-items:center;justify-content:flex-end}
    #vh-scripted-replies[hidden],#vh-investigator-actions[hidden]{display:none!important}
    #messagesApp.vh-neymar-scripted:not(.vh-welcome-ack) #messagesConversationView .msg-convo-scroll{bottom:44px!important}
    #vh-scripted-replies button{border:0;border-radius:16px;background:#007aff;color:#fff;min-height:32px;padding:6px 16px;font:500 13px -apple-system,BlinkMacSystemFont,sans-serif;touch-action:manipulation}
    #messagesApp.vh-neymar-scripted #messagesComposer:has(#vh-scripted-replies[hidden]){opacity:.65}

    #vh-investigator-actions{position:absolute;left:0;right:0;bottom:44px;z-index:12;height:44px;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:5px 10px;background:#f7f7f7;border-top:1px solid #d5d5d5}
    #vh-investigator-actions button{border:1px solid #cfd5e3;border-radius:9px;background:white;color:#007aff;padding:8px 12px;font:13px -apple-system,sans-serif}
  `;
  document.head.appendChild(style);

  const toast=document.createElement('button');
  toast.id='vh-investigator-notification';toast.type='button';
  toast.innerHTML='<div class="vh-head"><img class="vh-icon" src="../messages.png.png" alt="">MESSAGES <span class="vh-more">Show More</span></div><div class="vh-body"><span></span><small>now</small></div>';
  document.getElementById('screen')?.appendChild(toast);
  let hide=0;
  function openInvestigator(){
    toast.classList.remove('show');
    if(!getFlag(WELCOME_OPENED))setFlag(WELCOME_OPENED);
    update(caseHistory,casePhase);
    if(document.getElementById('lockScreen')?.classList.contains('active')){
      // Unlock only on a deliberate notification tap.
      document.getElementById('unlockHint')?.click();
    }
    window.CauaMessagesOpenThread?.('neymarinho');
    queueMicrotask(syncScriptedUI);
  }
  toast.addEventListener('click',openInvestigator);
  const scriptedReplies=document.createElement('div');
  scriptedReplies.id='vh-scripted-replies';
  scriptedReplies.innerHTML='<button type="button" id="vh-welcome-okay">Ok anh</button>';
  bridge.composer.appendChild(scriptedReplies);
  scriptedReplies.querySelector('button').addEventListener('click',()=>{
    if(getFlag(WELCOME_ACK))return;
    setFlag(WELCOME_ACK);
    update(caseHistory,casePhase);
  });
  function syncScriptedUI(){
    const current=bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho';
    bridge.app.classList.toggle('vh-neymar-scripted',current);
    bridge.app.classList.toggle('vh-welcome-ack',getFlag(WELCOME_ACK));
    scriptedReplies.hidden=!current||!getFlag(WELCOME_OPENED)||getFlag(WELCOME_ACK);
    actions.hidden=current&&!getFlag(WELCOME_ACK);
  }
  // The native Messages engine changes views synchronously after a click.
  // One delegated listener is enough; no MutationObserver/render loop.
  bridge.app.addEventListener('click',()=>{
    queueMicrotask(()=>{
      if(bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho'&&!getFlag(WELCOME_OPENED)){
        setFlag(WELCOME_OPENED);update(caseHistory,casePhase);
      }
      syncScriptedUI();
    });
  });


  // Preserve the original iOS8 conversation layout, with a small continuation
  // option so the user can finish investigation stages entirely from Messages.
  const actions=document.createElement('div');
  actions.id='vh-investigator-actions';
  actions.innerHTML='<button id="vh-message-hint" type="button">Gợi ý</button><button id="vh-message-continue" type="button">Tiếp tục →</button>';
  const convo=document.getElementById('messagesConversationView');
  convo?.querySelector('.msg-convo')?.appendChild(actions);
  actions.querySelector('#vh-message-hint').addEventListener('click',()=>window.parent.postMessage({type:'vh:action',action:'hint'},ORIGIN));
  actions.querySelector('#vh-message-continue').addEventListener('click',()=>window.parent.postMessage({type:'vh:action',action:'continue'},ORIGIN));

  function sanitize(history){
    return Array.isArray(history)?history.slice(-350).filter(m=>m&&typeof m.text==='string'&&(m.who==='partner'||m.who==='me')).map(m=>{
      const d=new Date(Number(m.at)||Date.now()),z=x=>String(x).padStart(2,'0');
      return {
        date:z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear(),
        time:z(d.getHours())+':'+z(d.getMinutes()),
        direction:m.who==='partner'?'incoming':'outgoing',
        body:m.text,status:m.who==='me'?'sent':null,
        unread:false
      };
    }):[];
  }
  function update(history,phase){
    caseHistory=Array.isArray(history)?history:[];
    casePhase=phase||'solve';
    thread.messages=mergedHistory();
    const last=thread.messages[thread.messages.length-1];
    thread.preview=last?.body||'Hey.';
    thread.unread=false;
    if(bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho')
      bridge.renderConversation(thread,false);
    else if(bridge.state.view==='list')bridge.renderList(false);
    actions.querySelector('#vh-message-hint').hidden=phase!=='solve';
    actions.querySelector('#vh-message-continue').hidden=phase!=='await';
    syncScriptedUI();
  }
  window.addEventListener('message',e=>{
    if(e.origin!==ORIGIN||e.source!==window.parent||!e.data||typeof e.data!=='object')return;
    const p=e.data;
    if(p.type==='vh:sync'||p.type==='vh:new'){
      update(p.history,p.phase);
      if(p.type==='vh:new'&&typeof p.text==='string' && !document.getElementById('messagesApp')?.classList.contains('open')){
        toast.querySelector('.vh-body span').textContent=p.text;
        toast.classList.add('show');
        window.parent.postMessage({type:'vh:notification-sound'},ORIGIN);
        clearTimeout(hide);hide=setTimeout(()=>toast.classList.remove('show'),2300);
      }
    }else if(p.type==='vh:open'){
      if(Array.isArray(p.history))update(p.history,p.phase);
      openInvestigator();
    }
  });
  // Send player replies to the actual case engine. Do not let Cauã's sandbox
  // handler label these as "unsent" or create unrelated local conversations.
  document.addEventListener('click',e=>{
    if(!e.target.closest('#messagesSendBtn'))return;
    if(bridge.state.currentThread!=='neymarinho')return;
    e.preventDefault();e.stopImmediatePropagation();
    const box=document.getElementById('messagesReplyInput');
    const text=box?.value.trim();
    if(!text)return;
    box.value='';box.dispatchEvent(new Event('input',{bubbles:true}));
    window.parent.postMessage({type:'vh:reply',text},ORIGIN);
  },true);


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


  update([], 'solve');
  // Ask the parent for existing history on the initial phone load.
  if(window.parent!==window)window.parent.postMessage({type:'vh:ready'},ORIGIN);
})();
