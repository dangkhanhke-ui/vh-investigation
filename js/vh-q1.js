/* VH Q1: two-part deterministic evidence + chronology prototype. */
(()=>{'use strict';
const KEY='vh.q1.r6.completed.v1';
const evidence=[
 ['report','Biên bản hiện trường R6','Ghi nhận phân bố máu và các dấu vết tại hiện trường'],
 ['map','Sơ đồ hiện trường R6','Vị trí khu A, cửa và khu B'],
 ['a','Ảnh khu A','Vùng máu tập trung'],
 ['door','Ảnh khung cửa','Dấu vết nằm trên tuyến A đến B'],
 ['autopsy','Báo cáo khám nghiệm tử thi','Tài liệu liên quan, không bắt buộc ở Q1'],
 ['sensor','Log sensor','Chưa phải nguồn quyết định về hướng di chuyển']
];
const events=[
 ['alive','Cauã còn sống sau sự kiện tại khu A.'],
 ['drag','Thi thể bị kéo từ khu A tới khu B.'],
 ['collapse','Cauã gục tại khu B.'],
 ['died','Cauã chết tại khu A.'],
 ['walk','Cauã tự di chuyển về phía cửa.'],
 ['reposition','Thi thể được di chuyển sau khi tử vong.']
];
const validPairs=[['report','map'],['report','a'],['report','door']];
const correct=['alive','walk','collapse'];
const container=document.querySelector('.paper-inside');
if(!container)return;
const q=document.createElement('section');q.id='vh-q1';q.hidden=true;
q.innerHTML=`<div class="vq-eyebrow">GIAI ĐOẠN 01 / CÂU HỎI 01</div>
<h2>Hiện trường R6 cho phép xác định điều gì đã xảy ra giữa khu A và vị trí thi thể?</h2>
<div class="vq-step"><strong>PHẦN 1 — GHIM HAI NGUỒN</strong><small>Chọn 2 bằng chứng từ thư viện để hỗ trợ suy luận.</small>
<div class="vq-slots"><button type="button" class="vq-slot" data-slot="0">+ CHỨNG CỨ 1</button><button type="button" class="vq-slot" data-slot="1">+ CHỨNG CỨ 2</button></div>
</div>
<div class="vq-step"><strong>PHẦN 2 — GHÉP CHUỖI SUY LUẬN</strong><small>Chọn 3 trong 6 sự kiện rồi đặt chúng theo thứ tự đã diễn ra.</small>
<div class="vq-sequence"></div><div class="vq-events"></div></div>
<div class="vq-foot"><button class="vq-check" type="button">KIỂM TRA SUY LUẬN →</button></div>
<p class="vq-feedback" role="status" aria-live="polite"></p><section class="vq-verification" hidden role="status" aria-live="polite"><small>VH / INFERENCE SYSTEM</small><strong>SUY LUẬN ĐÃ ĐƯỢC XÁC NHẬN</strong><span>KẾT LUẬN 01 / ĐÃ GHI NHẬN</span></section>
<div class="vq-modal" hidden><div class="vq-modal-panel"><header>THƯ VIỆN CHỨNG CỨ <button type="button" class="vq-modal-close" aria-label="Đóng">×</button></header>
<p>Chọn một nguồn để ghim. Danh mục R6 hiện là prototype; tài liệu gốc sẽ được liên kết sau.</p><div class="vq-library"></div></div></div>
`;
container.appendChild(q);
let slots=[null,null],seq=[],editing=0;
const slotButtons=[...q.querySelectorAll('.vq-slot')],modal=q.querySelector('.vq-modal');
function render(){
 slotButtons.forEach((b,i)=>{const e=evidence.find(x=>x[0]===slots[i]);b.textContent=e?'✓ '+e[1]:'+ CHỨNG CỨ '+(i+1);b.classList.toggle('filled',!!e)});
 q.querySelector('.vq-sequence').innerHTML=Array.from({length:3},(_,i)=>`<div class="vq-position"><span>${i+1<3?['01','02','03'][i]:'03'}</span><span>${seq[i]?events.find(x=>x[0]===seq[i])[1]:'Chọn một sự kiện bên dưới'}</span>${seq[i]?'<button type="button" data-remove="'+i+'" aria-label="Bỏ sự kiện">×</button>':''}</div>`).join('');
 q.querySelector('.vq-events').innerHTML=events.map(([id,text])=>`<button type="button" data-event="${id}" ${seq.includes(id)||seq.length===3?'disabled':''}>${text}</button>`).join('');
}
slotButtons.forEach((b,i)=>b.onclick=()=>{editing=i;modal.hidden=false;renderLibrary()});
function renderLibrary(){
 q.querySelector('.vq-library').innerHTML=evidence.map(([id,name,description])=>`<button type="button" data-evidence="${id}" ${slots.includes(id)&&slots[editing]!==id?'disabled':''}><strong>${name}</strong><small>${description}</small></button>`).join('');
}
q.querySelector('.vq-library').addEventListener('click',e=>{const b=e.target.closest('[data-evidence]');if(!b)return;slots[editing]=b.dataset.evidence;modal.hidden=true;render()});
q.querySelector('.vq-modal-close').onclick=()=>modal.hidden=true;
modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
q.querySelector('.vq-events').addEventListener('click',e=>{const b=e.target.closest('[data-event]');if(!b||seq.length>=3||seq.includes(b.dataset.event))return;seq.push(b.dataset.event);render()});
q.querySelector('.vq-sequence').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;seq.splice(Number(b.dataset.remove),1);render()});
let verifying=false;
const check=q.querySelector('.vq-check'),verification=q.querySelector('.vq-verification');
function verified(replay=false){
 q.dataset.completed='yes';check.disabled=true;check.textContent='ĐÃ XÁC NHẬN';
 q.querySelector('.vq-feedback').textContent='';
 verification.hidden=false;
 if(!replay){verification.classList.remove('is-visible');requestAnimationFrame(()=>verification.classList.add('is-visible'))}
 else verification.classList.add('is-visible');
}
function rejected(message){
 const f=q.querySelector('.vq-feedback');f.textContent=message;f.classList.remove('vq-correct');
 check.textContent='KIỂM TRA SUY LUẬN →';check.disabled=false;verifying=false;
}
check.onclick=()=>{
 if(verifying||q.dataset.completed)return;
 verifying=true;check.disabled=true;check.textContent='ĐANG ĐỐI CHIẾU...';
 q.querySelector('.vq-feedback').textContent='';
 // Start the cue slightly before showing its text. Both cues have been
 // decoded during onboarding, and leading silence is trimmed by sound.js.
 setTimeout(()=>{
  const incomplete=slots.some(x=>!x)||seq.length!==3;
  const pair=!incomplete&&validPairs.some(p=>p.every(id=>slots.includes(id)));
  const order=!incomplete&&correct.every((id,i)=>seq[i]===id);
  const success=!incomplete&&pair&&order;
  window.VHSound?.play(success?'correct':'wrong');
  setTimeout(()=>{
   if(!success){
    rejected(incomplete?'Hãy ghim đủ 2 bằng chứng và chọn đủ 3 sự kiện.':!pair?'Chưa đủ hỗ trợ. Hãy chọn các nguồn mô tả dấu vết và hướng di chuyển tại R6.':'Chưa đủ hỗ trợ. Một số sự kiện hoặc thứ tự chưa được bằng chứng xác nhận.');
    return;
   }
   try{localStorage.setItem(KEY,'yes')}catch(_){}
   verified();
   window.dispatchEvent(new CustomEvent('vh:q1-solved'));
  },90);
 },510);
};
if(window.VHNeymarinhoStory?.q1Phase?.()>0){
 verified(true);
}
function activate(){if(document.body.classList.contains('vh-onboarding'))return;document.body.classList.add('vh-q1-workspace');q.hidden=false;document.getElementById('question').hidden=true;document.getElementById('answers').hidden=true;document.querySelector('.submit-line').hidden=true;render()}
function maybeActivate(){if(document.body.classList.contains('vh-onboarding'))return;const stage=document.querySelector('.folder-tabs .tab.is-current, .folder-tabs .tab[aria-current="step"]');if(stage&&stage.dataset.stage!=='1')return;activate()}
document.addEventListener('vh:intro-finished',()=>setTimeout(maybeActivate,200));
document.addEventListener('vh:stage-archive-shown',()=>{});
document.querySelector('.folder-tabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b){document.body.classList.toggle('vh-q1-workspace',b.dataset.stage==='1');q.hidden=b.dataset.stage!=='1';if(b.dataset.stage==='1')maybeActivate();else {document.getElementById('question').hidden=false;document.getElementById('answers').hidden=false;document.querySelector('.submit-line').hidden=false}}});
const observer=new MutationObserver(()=>{if(!q.hidden)return;if(document.body.classList.contains('vh-stage-open')||document.body.classList.contains('vh-onboarding') )return;maybeActivate()});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
render();
})();