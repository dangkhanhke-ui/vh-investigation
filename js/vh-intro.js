(()=>{'use strict';
const root=document.querySelector('#vh-intro'),load=root.querySelector('.vh-intro-loading-view'),form=root.querySelector('.vh-intro-name'),input=root.querySelector('#vh-player-name'),access=root.querySelector('.vh-intro-access'),scene=root.querySelector('.vh-intro-scene'),stream=root.querySelector('.vh-access-stream'),messages=root.querySelector('.vh-intro-messages'),actions=root.querySelector('.vh-intro-actions'),next=root.querySelector('.vh-intro-next');
const gate=root.querySelector('.vh-intro-gate'),pin=root.querySelector('#vh-access-pin'),gateError=root.querySelector('.vh-gate-error');
const KEY='vh.player.name.v1',DONE='vh.intro.finished.v1',get=k=>{try{return localStorage.getItem(k)||''}catch{return''}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}},sleep=t=>new Promise(r=>setTimeout(r,t));
window.VHPlayer={get name(){return get(KEY)},getName(){return get(KEY)}};
let seq=0;let gateAuthorized=false;
function unlockAudio(){window.VHSound?.prepare()}
function screen(mode){gate.hidden=mode!=='gate';load.hidden=mode!=='load';form.hidden=mode!=='name';access.hidden=mode!=='access';scene.hidden=mode!=='scene';root.classList.toggle('vh-is-black',mode==='scene')}
function show(){root.hidden=false;root.removeAttribute('aria-hidden');document.body.classList.add('vh-onboarding')}
function finish(){window.VHSound?.stop('loading');window.VHKeyboardAudio?.stop();seq++;root.hidden=true;root.setAttribute('aria-hidden','true');document.body.classList.remove('vh-onboarding');document.dispatchEvent(new Event('vh:intro-finished'))}
async function code(id,final=false){screen('access');window.VHSound?.start('loading');stream.replaceChildren();for(const t of final?['ĐANG TRUY CẬP HỒ SƠ','Đang mở tài liệu...','Đang đối chiếu dữ liệu...','Hoàn tất.']:['ĐANG TRUY CẬP HỒ SƠ','Đang xác thực...','Đang giải mã...','Đang kiểm tra quyền truy cập...','Đang kết nối...','Đang truy xuất hồ sơ...','Đang đồng bộ tài liệu...','Đang kiểm tra tính toàn vẹn...','Truy cập thành công.']){if(id!==seq)return;const d=document.createElement('div');d.textContent=t;stream.appendChild(d);if(stream.children.length>6)stream.firstChild.remove();await sleep(final?220:540)}await sleep(final?420:650);window.VHSound?.stop('loading');if(id!==seq)return;if(final)finish();else dialogue(id)}
const PAGES=[
['Đến rồi à?','Anh là Neymarinho, điều tra viên của vụ này','Anh đang có một vụ khá hóc chuẩn bị giao cho mày đây','Xem qua giúp anh nhé'],
['Nạn nhân tên Cauã Henrique Valença de Oliveira, 25 tuổi','Thi thể được phát hiện vào khoảng giữa trưa ngày 24/8/2015','Tại A Casa, khu Santa Teresa, Rio de Janeiro',{image:'assets/caua-opening.jpg'},'Cũng sáng sủa nhỉ :))','Không biết sau cái mặt làm bao em say đắm này là bí mật gì đây'],
['Ban đầu anh cứ nghĩ đây chỉ là một vụ án mạng thông thường','Nhưng càng moi sâu thì anh thấy càng không ổn','Cauã là người đứng đầu một hội kín tên là Vínculo Humano','Mày nghe đến cái hội này bao giờ chưa?'],
['Nó được thành lập từ năm 2009 bởi một nhóm thanh niên ở Rio','Lúc đầu tưởng chỉ là cái nhóm giao lưu, tụ tập hoạt động xã hội vớ vẩn thôi...','Nhưng xung quanh cái hội này có nhiều chuyện dị lắm','Anh cũng chưa nắm hết được','Anh với bên cảnh sát đang nghi cái hội này dính tới hai vụ mất tích dạo trước','Nhưng cũng chưa có nhiều thông tin lắm','Thế nên cái chết của Cauã lúc này làm anh khá lấn cấn'],
['Quay lại vụ án nhé','Đêm 23/8, cái hội Vínculo Humano này có tổ chức một sự kiện ngay tại căn nhà đó','Tầm 38 thành viên tham dự','Nghe bảo đây là buổi tụ tập định kỳ hai tuần một lần','Buổi hôm đó tàn vào khoảng 11 giờ đêm','Phần lớn mọi người đi về, nhưng vẫn có vài đứa ở lại ngủ qua đêm'],
['Đến khoảng 12 giờ 15 trưa hôm sau, thi thể Cauã được phát hiện trong một căn phòng','Vấn đề là đến giờ bọn anh vẫn chưa dựng lại được chính xác chuyện gì đã xảy ra trong đêm','Và ai là kẻ đã ra tay?'],
['Anh đã chuẩn bị sẵn cho mày một tập hồ sơ rồi đấy','Trong đó có ảnh hiện trường, lời khai với một số thông tin liên quan','À, anh có gửi mày cả bản copy dữ liệu từ điện thoại của Cauã nữa','Anh xem qua rồi, thấy cũng chưa có gì đáng giá lắm','Nhưng ít nhất thì cũng nhờ nó mà hiểu thêm về Cauã với cái hội này','Mày cứ xem thử, biết đâu lại tìm được thứ gì anh bỏ sót :))'],
['Có điều là hiện tại vẫn còn nhiều tài liệu quan trọng bị khóa','Trong quá trình điều tra, khi nào mở khóa được thêm phần nào thì anh sẽ gửi cho mày','Nên trước mắt cứ xem những gì đang có đã nhé'],
['Mày đọc kỹ hồ sơ rồi thử dựng lại diễn biến đêm đó xem sao','Soi kỹ mốc thời gian và lời khai từng đứa nhé','Thấy chỗ nào chọi nhau thì ghi chú lại ngay','Trong lúc điều tra nếu bí quá thì nhắn anh','Anh sẽ gợi ý cho một chút, nhưng đừng có vội xin đáp án đấy nhé :))'],
['Trước mắt mình cứ tập trung lôi kẻ sát hại Cauã ra ánh sáng đã','Mấy cái phốt của hội Vínculo Humano với hai vụ mất tích kia tính sau','Giờ mày mở tập hồ sơ ra xem đi','Có gì mới thì nhắn anh','Anh tin mày']
];
let activePage=0,renderToken=0,renderComplete=false;
const previous=document.createElement('button');
previous.type='button';previous.className='vh-intro-prev';previous.setAttribute('aria-label','Đọc lại đoạn trước');
previous.innerHTML='<svg viewBox="0 0 32 32" width="34" height="34" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M28 16H4m9-9-9 9 9 9"/></svg>';
const nav=document.createElement('div');nav.className='vh-intro-navigation';next.parentNode.insertBefore(nav,next);nav.append(previous,next);
function addRow(){
 const row=document.createElement('div');row.className='vh-intro-message-row';
 const avatar=document.createElement('img');avatar.className='vh-intro-avatar';avatar.src='assets/investigator-avatar.png';avatar.alt='';
 const bubble=document.createElement('div');bubble.className='vh-intro-bubble';
 row.append(avatar,bubble);messages.appendChild(row);return bubble;
}
function addPhoto(){
 const bubble=addRow();bubble.classList.add('vh-intro-photo');
 const image=document.createElement('img');image.src='assets/caua-opening.jpg';image.alt='Ảnh Cauã';
 const placeholder=document.createElement('div');placeholder.className='vh-intro-photo-placeholder';placeholder.textContent='ẢNH CAUÃ — CHƯA TẢI LÊN';
 image.addEventListener('load',()=>{placeholder.hidden=true});
 image.addEventListener('error',()=>{image.hidden=true});
 bubble.append(image,placeholder);
}
function updateNav(){
 previous.hidden=activePage===0;
 next.hidden=!renderComplete;
 next.setAttribute('aria-label',activePage===PAGES.length-1?'Bắt đầu điều tra':'Đoạn tiếp theo');
}
async function renderPage(id,instant=false){
 const token=++renderToken;renderComplete=false;messages.replaceChildren();messages.scrollTop=0;updateNav();
 for(const item of PAGES[activePage]){
  if(id!==seq||token!==renderToken)return;
  if(typeof item==='object'){addPhoto();continue}
  const bubble=addRow();
  if(instant){bubble.textContent=item;continue}
  bubble.classList.add('vh-typing');bubble.textContent='•••';
  await sleep(Math.min(430,170+item.length*3));
  if(id!==seq||token!==renderToken)return;
  bubble.classList.remove('vh-typing');bubble.textContent='';
  window.VHKeyboardAudio?.start();
  for(let i=0;i<item.length;i++){
   if(id!==seq||token!==renderToken){window.VHKeyboardAudio?.stop();return}
   bubble.textContent+=item[i];
   if(i%6===0)messages.scrollTop=messages.scrollHeight;
   await sleep(item[i]===','?34:12);
  }
  window.VHKeyboardAudio?.stop();messages.scrollTop=messages.scrollHeight;
  await sleep(145);
 }
 if(id!==seq||token!==renderToken)return;
 renderComplete=true;updateNav();
}
async function dialogue(id){
 screen('scene');messages.replaceChildren();actions.replaceChildren();next.hidden=true;previous.hidden=true;
 await firstMessageAlert(id);if(id!==seq)return;
 activePage=0;await renderPage(id);
}
previous.onclick=()=>{if(activePage===0)return;unlockAudio();activePage--;renderPage(seq,true)};
next.onclick=()=>{if(!renderComplete)return;unlockAudio();if(activePage<PAGES.length-1){activePage++;renderPage(seq)}else{renderToken++;next.hidden=true;previous.hidden=true;put(DONE,'yes');code(seq,true)}};
function option(t){const b=document.createElement('button');b.type='button';b.className='vh-intro-choice';b.textContent=t;b.addEventListener('click',()=>{b.classList.add('vh-choice-pressed');setTimeout(()=>b.classList.remove('vh-choice-pressed'),230)},true);actions.appendChild(b);return b}
async function firstMessageAlert(id){
const banner=document.createElement('button');banner.type='button';
banner.className='vh-intro-notification';
banner.setAttribute('role','status');
const header=document.createElement('div');header.className='vh-intro-notification-head';header.innerHTML='<span>BẠN CÓ TIN NHẮN</span><span>BÂY GIỜ</span>';
const body=document.createElement('div');body.className='vh-intro-notification-body';
const sender=document.createElement('strong');sender.textContent='Neymarinho';
const preview=document.createElement('span');preview.textContent='CHẠM ĐỂ XEM TIN NHẮN';
body.append(sender,preview);banner.append(header,body);root.appendChild(banner);
await sleep(80);if(id!==seq){banner.remove();return}
banner.classList.add('show');window.VHSound?.play('notification');
await new Promise(resolve=>{banner.addEventListener('click',resolve,{once:true})});banner.classList.remove('show');await sleep(350);banner.remove();
}
async function begin(){if(!gateAuthorized)return;const id=++seq;show();screen('load');window.VHSound?.start('loading');await sleep(get(DONE)?2100:5000);if(id!==seq)return;window.VHSound?.stop('loading');if(get(DONE))finish();else if(get(KEY))code(id);else{screen('name');input.focus({preventScroll:true})}}
form.addEventListener('submit',e=>{e.preventDefault();unlockAudio();const n=input.value.replace(/\s+/g,' ').trim().slice(0,36);if(!n)return;put(KEY,n);code(++seq)});
window.addEventListener('vh:show-intro',()=>{window.VHSound?.stop('loading');window.VHKeyboardAudio?.stop();seq++;show();screen('name');input.value=get(KEY);input.focus({preventScroll:true})});
gate.addEventListener('submit',e=>{e.preventDefault();if(pin.value!=='1111'){gateError.textContent='MÃ TRUY CẬP KHÔNG HỢP LỆ';pin.value='';pin.focus();return}gateError.textContent='';gateAuthorized=true;window.VHSound?.prepare();begin()});
screen('gate');show();
})();