/* VH: final canonical scripted Neymarinho Messages, loaded LAST to supersede legacy hint prototype. */
(()=>{'use strict';
const b=window.CauaMessagesBridge;
const t=b?.threads?.find(x=>x.id==='neymarinho');
if(!b||!t)return;
const KEY='vh.neymarinho.welcome.acked.v4';
const pad=n=>String(n).padStart(2,'0');
const getName=()=>{try{return (localStorage.getItem('vh.player.name.v1')||'').trim().slice(0,36)}catch{return''}};
const isAcked=()=>{try{return localStorage.getItem(KEY)==='yes'}catch{return false}};
const loadedAt=new Date();
const clock=pad(loadedAt.getHours())+':'+pad(loadedAt.getMinutes());
const date='29/08/2018';
function seed(){
 t.number='+55 (21) 99847-2631';t.listName='Neymarinho';t.displayName='Neymarinho';
 // No other case contacts or messages in the player's investigator Messages.
 for(const item of b.threads)item.localHidden=item!==t;
 const sentences=['Hey '+(getName()||'mày'),'Neymarinho nè','Anh mới có số mày','Từ giờ anh sẽ nhắn qua đây nhé'];
 t.messages=sentences.map(body=>({date,time:clock,direction:'incoming',body,status:null,unread:false}));
 if(isAcked())t.messages.push({date,time:clock,direction:'outgoing',body:'Ok anh',status:'sent',unread:false});
 t.preview=t.messages[t.messages.length-1].body;t.unread=false;
}
const style=document.createElement('style');
style.id='vh-neymar-final-style';
style.textContent=`
 #vh-investigator-notification,#vh-message-hint,#vh-message-continue{display:none!important}
 #vh-investigator-actions{display:none!important}
 #vh-neymar-reply{position:absolute;left:0;right:0;bottom:0;z-index:70;height:49px;
 box-sizing:border-box;background:#f6f6f7;border-top:1px solid #dadada;display:none;
 align-items:center;justify-content:flex-end;padding:5px 14px}
 #vh-neymar-reply button{border:1px solid #d4d8e3;border-radius:8px;background:#fff;
 color:#007aff;padding:9px 16px;font:14px -apple-system,BlinkMacSystemFont,sans-serif;
 cursor:pointer;touch-action:manipulation}
 #messagesConversationView.vh-neymar-active .msg-composer{display:none!important}
 #messagesConversationView.vh-neymar-active #messagesConvoScroll{bottom:0!important}
 #messagesConversationView.vh-neymar-active.vh-neymar-waiting #messagesConvoScroll{bottom:49px!important}
 #messagesConversationView.vh-neymar-active.vh-neymar-waiting #vh-neymar-reply{display:flex!important}
 `;
document.head.appendChild(style);
const convo=document.getElementById('messagesConversationView');
const footer=document.createElement('div');footer.id='vh-neymar-reply';
footer.innerHTML='<button id="vh-neymar-ok" type="button">Ok anh</button>';
convo?.querySelector('.msg-convo')?.appendChild(footer);
function decorate(){
 const active=b.state.view==='conversation'&&b.state.currentThread==='neymarinho';
 convo?.classList.toggle('vh-neymar-active',active);
 convo?.classList.toggle('vh-neymar-waiting',active&&!isAcked());
 // Legacy controls never apply to Neymarinho anymore.
 document.querySelector('#vh-investigator-actions')?.setAttribute('hidden','');
}
function repaint(){
 seed();
 if(b.state.view==='conversation'&&b.state.currentThread==='neymarinho')b.renderConversation(t,false);
 else if(b.state.view==='list')b.renderList(false);
 decorate();
}
footer.querySelector('button').addEventListener('click',()=>{
 if(isAcked())return;
 try{localStorage.setItem(KEY,'yes')}catch(_){}
 repaint();
});
document.addEventListener('click',e=>{
 if(e.target.closest('#messagesApp'))queueMicrotask(decorate);
});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==window.parent||!e.data)return;
 if(['vh:sync','vh:new','vh:open'].includes(e.data.type)){
   // Legacy handler ran first; restore our canonical conversation after it.
   queueMicrotask(()=>{
     repaint();
     if(e.data.type==='vh:open')window.CauaMessagesOpenThread?.('neymarinho');
     decorate();
   });
 }
});
seed();
queueMicrotask(()=>{repaint();decorate()});
})();