/* VH player-facing iOS Messages & Notes. Loaded AFTER Cauã's visual engines. */
(()=>{
  'use strict';
  const bridge=window.CauaMessagesBridge;
  const ORIGIN=location.origin;
  const thread=bridge?.threads.find(t=>t.id==='neymarinho');
  if(!bridge||!thread)return;

  // Notes has one editable page. Never load old Cauã notes or show new-note controls.
  const style=document.createElement('style');
  style.textContent=`
    #notesNewBtn,#notesFloatingCompose,#notesDeleteBtn,#notesListFooter,
    #notesTopCount,#notesSearchWrap,#notesActionLayer{display:none!important}
    #vh-investigator-notification{
      position:absolute;top:25px;left:9px;right:9px;z-index:160;
      box-sizing:border-box;padding:10px 12px;border:1px solid rgba(255,255,255,.32);
      border-radius:12px;background:rgba(244,246,250,.95);
      color:#151515;font:13px -apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
      box-shadow:0 4px 20px rgba(0,0,0,.25);text-align:left;
      cursor:pointer;opacity:0;transform:translateY(-120%);
      pointer-events:none;transition:transform .22s ease,opacity .2s ease;
    }
    #vh-investigator-notification.show{opacity:1;transform:translateY(0);pointer-events:auto}
    #vh-investigator-notification strong{display:block;margin-bottom:3px;font-weight:650}
    #vh-investigator-notification span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #vh-investigator-actions{display:flex;justify-content:flex-end;gap:8px;padding:8px 12px;background:#f7f7f7}
    #vh-investigator-actions button{border:1px solid #cfd5e3;border-radius:9px;background:white;color:#007aff;padding:8px 12px;font:13px -apple-system,sans-serif}
  `;
  document.head.appendChild(style);

  const toast=document.createElement('button');
  toast.id='vh-investigator-notification';toast.type='button';
  toast.innerHTML='<strong>Điều tra viên Neymarinho</strong><span></span>';
  document.getElementById('screen')?.appendChild(toast);
  let hide=0;
  function openInvestigator(){
    toast.classList.remove('show');
    if(document.getElementById('lockScreen')?.classList.contains('active')){
      // Unlock only on a deliberate notification tap.
      document.getElementById('unlockHint')?.click();
    }
    window.CauaMessagesOpenThread?.('neymarinho');
  }
  toast.addEventListener('click',openInvestigator);

  // Preserve the original iOS8 conversation layout, with a small continuation
  // option so the user can finish investigation stages entirely from Messages.
  const actions=document.createElement('div');
  actions.id='vh-investigator-actions';
  actions.innerHTML='<button id="vh-message-hint" type="button">Gợi ý</button><button id="vh-message-continue" type="button">Tiếp tục →</button>';
  const convo=document.getElementById('messagesConversationView');
  convo?.appendChild(actions);
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
    thread.messages=sanitize(history);
    const last=thread.messages[thread.messages.length-1];
    thread.preview=last?.body||'Cuộc trò chuyện điều tra';
    thread.unread=false;
    if(bridge.state.view==='conversation'&&bridge.state.currentThread==='neymarinho')
      bridge.renderConversation(thread,false);
    else if(bridge.state.view==='list')bridge.renderList(false);
    actions.querySelector('#vh-message-hint').hidden=phase!=='solve';
    actions.querySelector('#vh-message-continue').hidden=phase!=='await';
  }
  window.addEventListener('message',e=>{
    if(e.origin!==ORIGIN||e.source!==window.parent||!e.data||typeof e.data!=='object')return;
    const p=e.data;
    if(p.type==='vh:sync'||p.type==='vh:new'){
      update(p.history,p.phase);
      if(p.type==='vh:new'&&typeof p.text==='string'){
        toast.querySelector('span').textContent=p.text;
        toast.classList.add('show');
        clearTimeout(hide);hide=setTimeout(()=>toast.classList.remove('show'),5500);
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

  // Ask the parent for existing history on the initial phone load.
  if(window.parent!==window)window.parent.postMessage({type:'vh:ready'},ORIGIN);
})();
