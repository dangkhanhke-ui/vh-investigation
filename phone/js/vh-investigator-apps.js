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

  // Scripted investigator chat. Pre-existing as soon as the phone opens:
  // no delayed greeting, notification banner, prototype hints or freeform stage buttons.
  const ACK_KEY='vh.neymarinho.welcome.acked.v4';
  const pad=n=>String(n).padStart(2,'0');
  const initialTime=new Date();
  const stamp=pad(initialTime.getHours())+':'+pad(initialTime.getMinutes());
  const fixedDate='29/08/2018';
  const safeName=()=>{
    try{return (localStorage.getItem('vh.player.name.v1')||'').trim().slice(0,36)}catch(_){return ''}
  };
  const initialMessages=()=>[
    'Hey '+(safeName()||'mày'),
    'Neymarinho nè',
    'Anh mới có số mày',
    'Từ giờ anh sẽ nhắn qua đây nhé'
  ].map(body=>({date:fixedDate,time:stamp,direction:'incoming',body,status:null,unread:false}));
  const acked=()=>{try{return localStorage.getItem(ACK_KEY)==='yes'}catch(_){return false}};
  function saveAck(){try{localStorage.setItem(ACK_KEY,'yes')}catch(_){}}
  function populate(){
    thread.messages=initialMessages();
    if(acked())thread.messages.push({
      date:fixedDate,time:stamp,direction:'outgoing',body:'Ok anh',status:'sent',unread:false
    });
    thread.preview=thread.messages[thread.messages.length-1].body;
    thread.unread=false;
  }
  populate();

  const style=document.createElement('style');
  style.textContent=`
    #vh-investigator-actions{
      position:absolute;left:0;right:0;bottom:44px;z-index:12;
      height:48px;box-sizing:border-box;display:flex;align-items:center;
      justify-content:flex-end;padding:5px 13px;
      background:#f7f7f7;border-top:1px solid #dedee0
    }
    #vh-investigator-actions[hidden]{display:none!important}
    #vh-investigator-actions button{
      border:1px solid #cfd5e3;border-radius:9px;
      background:#fff;color:#007aff;padding:8px 15px;
      font:14px -apple-system,BlinkMacSystemFont,sans-serif;
      cursor:pointer;touch-action:manipulation
    }
    #messagesConversationView .msg-convo-scroll.vh-awaiting-reply{bottom:92px!important}
    #messagesConversationView .msg-composer.vh-investigator-no-compose{display:none!important}
    #messagesConversationView .msg-convo-scroll.vh-investigator-no-compose{bottom:44px!important}
  `;
  document.head.appendChild(style);
  const convo=document.getElementById('messagesConversationView');
  const actions=document.createElement('div');
  actions.id='vh-investigator-actions';
  actions.innerHTML='<button type="button" id="vh-message-ok">Ok anh</button>';
  convo?.querySelector('.msg-convo')?.appendChild(actions);

  function showThread(){
    const active=bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho';
    actions.hidden=!active||acked();
    bridge.composer?.classList.toggle('vh-investigator-no-compose',active);
    bridge.convoScroll?.classList.toggle('vh-investigator-no-compose',active&&acked());
    bridge.convoScroll?.classList.toggle('vh-awaiting-reply',active&&!acked());
  }
  function repaint(){
    if(bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho'){
      bridge.renderConversation(thread,false);showThread();
    }else if(bridge.state.view==='list')bridge.renderList(false);
  }
  actions.querySelector('#vh-message-ok').addEventListener('click',()=>{
    if(acked())return;
    saveAck();populate();repaint();
  });
  // Capture navigation after the native Messages handlers finish.
  document.addEventListener('click',e=>{
    if(e.target.closest('#messagesApp'))queueMicrotask(showThread);
  });
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==window.parent||!e.data)return;
    if(e.data.type==='vh:sync'||e.data.type==='vh:open'){
      // Parent carries no scripted dialogue; never replace with empty history.
      populate();
      if(e.data.type==='vh:open')window.CauaMessagesOpenThread?.('neymarinho');
      repaint();showThread();
    }
  });
  // Native phone loads asynchronously; initial conversation/list is already populated.
  setTimeout(()=>{populate();repaint();showThread()},0);

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
