/* VH temporary per-question hint UI. Replace placeholder lines when canonical questions are ready. */
(()=>{
 'use strict';
 const paper=document.querySelector('.paper-inside');
 if(!paper)return;
 const trigger=document.createElement('button');
 trigger.id='vh-hint-trigger';trigger.type='button';
 trigger.setAttribute('aria-label','Xem gợi ý cho câu hỏi này');
 trigger.setAttribute('aria-expanded','false');
 trigger.setAttribute('aria-controls','vh-hint-popover');
 trigger.innerHTML='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="28.5" stroke="currentColor" stroke-width="1.7"/><path d="M24 24a8.6 8.6 0 1 1 15 5.7c-3.1 3.3-7.1 4.8-7.1 9.3" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="47" r="2" fill="currentColor"/></svg>';
 const pop=document.createElement('section');
 pop.id='vh-hint-popover';pop.hidden=true;
 pop.setAttribute('role','group');pop.setAttribute('aria-label','Gợi ý theo từng bước');
 pop.innerHTML='<header class="vh-hint-head"><span>HỒ SƠ / GỢI Ý</span><button type="button" class="vh-hint-close" aria-label="Đóng gợi ý">×</button></header><div class="vh-hint-meta"><span>HỖ TRỢ SUY LUẬN</span><small id="vh-hint-progress">00 / 03</small></div><p id="vh-hint-content" class="vh-hint-content">Bạn muốn xem gợi ý cho câu hỏi này?</p><button type="button" id="vh-hint-more" class="vh-hint-more"><span>Xem gợi ý 1</span><span aria-hidden="true">↗</span></button>';
 document.body.append(trigger,pop);
 const progress=pop.querySelector('#vh-hint-progress');
 const content=pop.querySelector('#vh-hint-content');
 const more=pop.querySelector('#vh-hint-more');
 const key=()=>{
   const stage=document.querySelector('.folder-tabs .tab.is-current, .folder-tabs .tab[aria-current="step"]')?.dataset.stage||'1';
   const objective=document.getElementById('objectiveNumber')?.textContent?.trim()||'01';
   return 'vh.question.hint.demo.v1.'+stage+'.'+objective;
 };
 let activeKey='',level=0;
 function read(k){try{return Math.max(0,Math.min(3,Number(localStorage.getItem(k))||0))}catch{return 0}}
 function save(){try{localStorage.setItem(activeKey,String(level))}catch(_){}}
 function paint(){
   progress.textContent=String(level).padStart(2,'0')+' / 03';
   content.textContent=level?'Lời giải '+level:'Bạn muốn xem gợi ý cho câu hỏi này?';
   more.disabled=level>=3;
   more.querySelector('span').textContent=level===0?'Xem gợi ý 1':level===3?'Đã xem hết':'Gợi ý tiếp';
 }
 function close(){pop.hidden=true;trigger.setAttribute('aria-expanded','false')}
 function open(){activeKey=key();level=read(activeKey);paint();pop.hidden=false;trigger.setAttribute('aria-expanded','true')}
 trigger.addEventListener('click',()=>pop.hidden?open():close());
 pop.querySelector('.vh-hint-close').addEventListener('click',close);
 more.addEventListener('click',()=>{if(level>=3)return;level++;save();paint()});
 document.addEventListener('pointerdown',e=>{if(!pop.hidden&&!pop.contains(e.target)&&e.target!==trigger)close()},{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){close();trigger.focus({preventScroll:true})}});
 document.querySelectorAll('.folder-tabs .tab').forEach(b=>b.addEventListener('click',close));
 document.addEventListener('click',e=>{if(e.target.closest('.vh-stage-card,.vh-menu-panel,[data-act]'))close()});
 document.getElementById('vhOpenPhone')?.addEventListener('click',close);
})();
