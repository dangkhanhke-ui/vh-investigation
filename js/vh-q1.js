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
const hints=[
 'So sánh nơi máu tập trung đầu tiên với vị trí thi thể.',
 'Kiểm tra các dấu giữa khu A và cửa. Chúng có giống dấu kéo một cơ thể không?',
 'Biên bản không ghi nhận dấu kéo lê hoặc di chuyển thi thể sau tử vong. Hãy cân nhắc khả năng Cauã tự tạo các dấu từ A tới B.'
];
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
<div class="vq-foot"><button class="vq-hint-btn" type="button">GỢI Ý <span class="vq-hint-count">0/3</span></button><button class="vq-check" type="button">KIỂM TRA SUY LUẬN →</button></div>
<p class="vq-feedback" role="status" aria-live="polite"></p>
<div class="vq-modal" hidden><div class="vq-modal-panel"><header>THƯ VIỆN CHỨNG CỨ <button type="button" class="vq-modal-close" aria-label="Đóng">×</button></header>
<p>Chọn một nguồn để ghim. Danh mục R6 hiện là prototype; tài liệu gốc sẽ được liên kết sau.</p><div class="vq-library"></div></div></div>
<div class="vq-success" hidden><div class="vq-success-panel"><span class="vq-label">NEYMARINHO</span>
<p>“Vậy chốt được một chuyện. Cauã không chết ở nơi lượng máu đầu tiên xuất hiện. Hắn còn sống, tự di chuyển về phía cửa rồi mới gục xuống.”</p>
<p>“Điều đó làm vị trí thi thể bớt quan trọng hơn tao tưởng. Bây giờ tao muốn biết thứ gì thực sự giết hắn.”</p>
<button class="vq-continue" type="button">TIẾP TỤC →</button></div></div>`;
container.appendChild(q);
let slots=[null,null],seq=[],editing=0,hint=0;
const slotButtons=[...q.querySelectorAll('.vq-slot')],modal=q.querySelector('.vq-modal');
function render(){
 slotButtons.forEach((b,i)=>{const e=evidence.find(x=>x[0]===slots[i]);b.textContent=e?'✓ '+e[1]:'+ CHỨNG CỨ '+(i+1);b.classList.toggle('filled',!!e)});
 q.querySelector('.vq-sequence').innerHTML=Array.from({length:3},(_,i)=>`<div class="vq-position"><span>${i+1<3?['01','02','03'][i]:'03'}</span><span>${seq[i]?events.find(x=>x[0]===seq[i])[1]:'Chọn một sự kiện bên dưới'}</span>${seq[i]?'<button type="button" data-remove="'+i+'" aria-label="Bỏ sự kiện">×</button>':''}</div>`).join('');
 q.querySelector('.vq-events').innerHTML=events.map(([id,text])=>`<button type="button" data-event="${id}" ${seq.includes(id)||seq.length===3?'disabled':''}>${text}</button>`).join('');
 q.querySelector('.vq-hint-count').textContent=hint+'/3';
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
q.querySelector('.vq-hint-btn').onclick=()=>{const f=q.querySelector('.vq-feedback');if(hint<3)hint++;f.textContent=hints[hint-1];f.className='vq-feedback';render()};
q.querySelector('.vq-check').onclick=()=>{
 const f=q.querySelector('.vq-feedback');
 if(slots.some(x=>!x)||seq.length!==3){f.textContent='Hãy ghim đủ 2 bằng chứng và chọn đủ 3 sự kiện.';return}
 const pair=validPairs.some(p=>p.every(id=>slots.includes(id)));
 const order=correct.every((id,i)=>seq[i]===id);
 if(!pair||!order){f.textContent=!pair?'Chưa đủ hỗ trợ. Hãy chọn các nguồn mô tả dấu vết và hướng di chuyển tại R6.':'Chưa đủ hỗ trợ. Một số sự kiện hoặc thứ tự chưa được bằng chứng xác nhận.';return}
 try{localStorage.setItem(KEY,'yes')}catch(_){}
 q.querySelector('.vq-success').hidden=false;
};
q.querySelector('.vq-continue').onclick=()=>{q.dataset.completed='yes';document.body.classList.remove('vh-q1-workspace');q.querySelector('.vq-success').hidden=true;q.hidden=true;window.dispatchEvent(new CustomEvent('vh:q1-complete'));const next=document.querySelector('.folder-tabs .tab[data-stage="1"]');document.getElementById('feedback').textContent='ĐÃ HOÀN THÀNH CÂU 01 — CHUẨN BỊ CÂU 02';};
function activate(){if(document.body.classList.contains('vh-onboarding')||q.dataset.completed)return;document.body.classList.add('vh-q1-workspace');q.hidden=false;document.getElementById('question').hidden=true;document.getElementById('answers').hidden=true;document.querySelector('.submit-line').hidden=true;render()}
function maybeActivate(){if(document.body.classList.contains('vh-onboarding'))return;const stage=document.querySelector('.folder-tabs .tab.is-current, .folder-tabs .tab[aria-current="step"]');if(stage&&stage.dataset.stage!=='1')return;if(!q.dataset.completed)activate()}
document.addEventListener('vh:intro-finished',()=>setTimeout(maybeActivate,200));
document.addEventListener('vh:stage-archive-shown',()=>{});
document.querySelector('.folder-tabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b){document.body.classList.toggle('vh-q1-workspace',b.dataset.stage==='1'&&!q.dataset.completed);q.hidden=b.dataset.stage!=='1';if(b.dataset.stage==='1')maybeActivate();else {document.getElementById('question').hidden=false;document.getElementById('answers').hidden=false;document.querySelector('.submit-line').hidden=false}}});
const observer=new MutationObserver(()=>{if(!q.hidden)return;if(document.body.classList.contains('vh-stage-open')||document.body.classList.contains('vh-onboarding')||q.dataset.completed)return;maybeActivate()});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
render();
})();