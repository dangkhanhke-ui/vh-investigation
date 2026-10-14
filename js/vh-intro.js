(()=>{'use strict';
const root=document.querySelector('#vh-intro'),load=root.querySelector('.vh-intro-loading-view'),form=root.querySelector('.vh-intro-name'),input=root.querySelector('#vh-player-name'),access=root.querySelector('.vh-intro-access'),scene=root.querySelector('.vh-intro-scene'),stream=root.querySelector('.vh-access-stream'),messages=root.querySelector('.vh-intro-messages'),actions=root.querySelector('.vh-intro-actions'),next=root.querySelector('.vh-intro-next');
const gate=root.querySelector('.vh-intro-gate'),pin=root.querySelector('#vh-access-pin'),gateError=root.querySelector('.vh-gate-error');
const KEY='vh.player.name.v1',DONE='vh.intro.finished.v1',AUTH='vh.access.authorized.v1',get=k=>{try{return localStorage.getItem(k)||''}catch{return''}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}},sleep=t=>new Promise(r=>setTimeout(r,t));
window.VHPlayer={get name(){return get(KEY)},getName(){return get(KEY)}};
let seq=0;let gateAuthorized=false;
function unlockAudio(){window.VHSound?.prepare()}
function screen(mode){gate.hidden=mode!=='gate';load.hidden=mode!=='load';form.hidden=mode!=='name';access.hidden=mode!=='access';scene.hidden=mode!=='scene';root.classList.toggle('vh-is-black',mode==='scene')}
function show(){root.hidden=false;root.removeAttribute('aria-hidden');document.body.classList.add('vh-onboarding')}
function finish(){cancelTypingWait();currentTyping=null;window.VHSound?.stop('loading');window.VHKeyboardAudio?.stop();seq++;root.hidden=true;root.setAttribute('aria-hidden','true');document.body.classList.remove('vh-onboarding');document.dispatchEvent(new Event('vh:intro-finished'))}
async function code(id,final=false){screen('access');window.VHSound?.start('loading');stream.replaceChildren();for(const t of final?['ĐANG TRUY CẬP HỒ SƠ','Đang mở tài liệu...','Đang đối chiếu dữ liệu...','Hoàn tất.']:['ĐANG TRUY CẬP HỒ SƠ','Đang xác thực...','Đang giải mã...','Đang kiểm tra quyền truy cập...','Đang kết nối...','Đang truy xuất hồ sơ...','Đang đồng bộ tài liệu...','Đang kiểm tra tính toàn vẹn...','Truy cập thành công.']){if(id!==seq)return;const d=document.createElement('div');d.textContent=t;stream.appendChild(d);if(stream.children.length>6)stream.firstChild.remove();await sleep(final?900:540)}await sleep(final?400:650);window.VHSound?.stop('loading');if(id!==seq)return;if(final)finish();else dialogue(id)}
const PAGES=[
['Đến rồi à?','Anh là Neymarinho, điều tra viên của vụ này','Anh đang có một vụ khá hóc chuẩn bị giao cho mày đây','Xem qua giúp anh nhé'],
['Nạn nhân tên Cauã Henrique Valença de Oliveira, 25 tuổi','Thi thể được phát hiện vào khoảng giữa trưa ngày 24/8/2015','Tại A Casa, khu Santa Teresa, Rio de Janeiro',{image:'assets/caua-opening.jpg'},'Cũng sáng sủa nhỉ :))','Không biết sau cái mặt làm bao em say đắm này là bí mật gì đây'],
['Ban đầu anh cứ nghĩ đây chỉ là một vụ án mạng thông thường','Nhưng càng moi sâu thì anh thấy càng không ổn','Cauã là người đứng đầu một hội kín tên là Vínculo Humano','Mày nghe đến cái hội này bao giờ chưa?'],
['Nó được thành lập từ năm 2009 bởi một nhóm thanh niên ở Rio','Lúc đầu anh tưởng cũng chỉ là cái nhóm giao lưu, tụ tập hoạt động xã hội vớ vẩn thôi...','Anh có điều tra được vài điều lạ lắm','Anh cũng chưa nắm hết được','Anh với bên cảnh sát đang nghi đội này có dính líu tới hai vụ mất tích trước đây','Nhưng cũng chưa có nhiều thông tin lắm','Thế nên cái chết của Cauã lúc này làm anh khá lấn cấn'],
['Quay lại vụ án nhé','Đêm 23/8, Vínculo Humano có tổ chức một sự kiện ngay tại căn nhà đó','Tầm 38 thành viên tham dự','Nghe bảo đây là buổi tụ tập định kỳ hai tuần một lần','Buổi hôm đó tàn vào khoảng 11 giờ đêm','Phần lớn mọi người đi về, còn 6 đứa khác ở lại ngủ qua đêm'],
['Đến khoảng 12 giờ 15 trưa hôm sau, thi thể Cauã được phát hiện ở phòng ngủ tầng hai','Vấn đề là đến giờ bọn anh vẫn chưa dựng lại được chính xác chuyện gì đã xảy ra trong đêm','Và ai là kẻ đã ra tay?'],
['Anh đã chuẩn bị sẵn cho mày một tập hồ sơ rồi đấy','Trong đó có ảnh hiện trường, lời khai với một số thông tin liên quan','À, anh có gửi mày cả bản copy dữ liệu từ điện thoại của Cauã nữa','Anh xem qua rồi, thấy cũng chưa có gì đáng giá lắm','Nhưng ít nhất thì cũng nhờ nó mà hiểu thêm về Cauã với cái hội này','Mày cứ xem thử, biết đâu lại tìm được thứ gì anh bỏ sót :))'],
['Có điều là hiện tại vẫn còn nhiều tài liệu quan trọng bị khóa','Trong quá trình điều tra, khi nào mở khóa được thêm phần nào thì anh sẽ gửi cho mày','Nên trước mắt cứ xem những gì đang có đã nhé'],
['Mày đọc kỹ hồ sơ rồi thử dựng lại diễn biến đêm đó xem sao','Soi kỹ mốc thời gian và lời khai từng đứa nhé','Thấy chỗ nào chọi nhau thì ghi chú lại ngay','Trong lúc điều tra nếu bí quá thì nhắn anh','Anh sẽ gợi ý cho một chút, nhưng đừng có vội xin đáp án đấy nhé :))'],
['Trước mắt mình cứ tập trung lôi kẻ sát hại Cauã ra ánh sáng đã','Những bí ẩn còn lại, mình sẽ dần giải mã sau','Giờ mày mở tập hồ sơ ra xem đi','Có gì mới thì nhắn anh','Anh tin mày']
];
let activePage=0,visibleCount=0,renderToken=0,renderComplete=false,currentTyping=null;
let typingWait=null;
function cancelTypingWait(){if(typingWait){clearTimeout(typingWait.timer);const done=typingWait.done;typingWait=null;done()}}
function typingDelay(ms){return new Promise(done=>{typingWait={timer:setTimeout(()=>{typingWait=null;done()},ms),done}})}
function finishCurrentBubble(){
 const t=currentTyping;
 if(!t||t.token!==renderToken||renderComplete)return false;
 t.bubble.textContent=t.text;
 currentTyping=null;renderToken++;cancelTypingWait();
 window.VHKeyboardAudio?.stop();
 messages.scrollTop=messages.scrollHeight;
 visibleCount++;renderComplete=true;updateNav();
 return true;
}
const previous=document.createElement('button');
previous.type='button';previous.className='vh-intro-prev';previous.setAttribute('aria-label','Đọc lại tin nhắn trước');
previous.innerHTML='<svg viewBox="0 0 32 32" width="34" height="34" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M28 16H4m9-9-9 9 9 9"/></svg>';
const nav=document.createElement('div');nav.className='vh-intro-navigation';next.parentNode.insertBefore(nav,next);nav.append(previous,next);
function addRow(){
 const row=document.createElement('div');row.className='vh-intro-message-row';
 const avatar=document.createElement('img');avatar.className='vh-intro-avatar';avatar.src='assets/investigator-avatar.png';avatar.alt='';
 const bubble=document.createElement('div');bubble.className='vh-intro-bubble';
 row.append(avatar,bubble);messages.appendChild(row);return bubble;
}
const cauaPreload=new Image();
cauaPreload.src='assets/caua-opening.jpg';
function addPhoto(){
 const bubble=addRow();bubble.classList.add('vh-intro-photo');
 const row=bubble.parentNode;
 const image=document.createElement('img');image.src=cauaPreload.src;image.alt='Ảnh Cauã';
 const placeholder=document.createElement('div');placeholder.className='vh-intro-photo-placeholder';placeholder.textContent='ẢNH CAUÃ — CHƯA TẢI LÊN';
 row.style.visibility='hidden';
 const ready=()=>{placeholder.hidden=true;row.style.visibility='visible';messages.scrollTop=messages.scrollHeight};
 const failed=()=>{image.hidden=true;row.style.visibility='visible'};
 image.addEventListener('load',ready,{once:true});
 image.addEventListener('error',failed,{once:true});
 bubble.append(image,placeholder);
 if(cauaPreload.complete){if(cauaPreload.naturalWidth)ready();else failed()}
}
function appendInstant(item){
 if(typeof item==='object'){addPhoto();return}
 addRow().textContent=item;
}
function updateNav(){
 previous.hidden=false;
 previous.disabled=!renderComplete||(activePage===0&&visibleCount<=1);
 next.hidden=false;
 next.disabled=!renderComplete;
 next.setAttribute('aria-label',activePage===PAGES.length-1&&visibleCount===PAGES[activePage].length?'Bắt đầu điều tra':'Tin nhắn tiếp theo');
}
async function showNextMessage(id){
 cancelTypingWait();
 const token=++renderToken;currentTyping=null;renderComplete=false;updateNav();
 const item=PAGES[activePage][visibleCount];if(!item)return;
 if(typeof item==='object'){
  addPhoto();visibleCount++;messages.scrollTop=messages.scrollHeight;renderComplete=true;updateNav();return;
 }
 const bubble=addRow();
 if(id!==seq||token!==renderToken)return;
 currentTyping={token,bubble,text:item};
 window.VHKeyboardAudio?.start();
 for(let i=0;i<item.length;i++){
  if(id!==seq||token!==renderToken)return;
  const ch=item[i];bubble.textContent+=ch;
  if(i%4===0)messages.scrollTop=messages.scrollHeight;
  let delay=25+Math.random()*23;
  if(ch===','||ch===';')delay+=180;
  if(ch==='.'||ch==='?'||ch==='!')delay+=280;
  if(ch===' ')delay+=12;
  await typingDelay(delay);
 }
 window.VHKeyboardAudio?.stop();messages.scrollTop=messages.scrollHeight;
 if(id!==seq||token!==renderToken)return;
 currentTyping=null;visibleCount++;renderComplete=true;updateNav();
}
function showHistory(page,count){
 renderToken++;currentTyping=null;cancelTypingWait();window.VHKeyboardAudio?.stop();activePage=page;visibleCount=count;
 messages.replaceChildren();for(let i=0;i<count;i++)appendInstant(PAGES[page][i]);
 messages.scrollTop=messages.scrollHeight;renderComplete=true;updateNav();
}
async function dialogue(id){
 screen('scene');messages.replaceChildren();actions.replaceChildren();next.hidden=true;previous.hidden=true;previous.disabled=true;next.disabled=true;
 await firstMessageAlert(id);if(id!==seq)return;
 PAGES[0][0]=get(KEY)+', đến rồi à?';
 activePage=0;visibleCount=0;renderComplete=false;updateNav();await showNextMessage(id);
}
// Safari: intentional tap completes only this bubble, without swallowing scrolling.
let tapStart=null,suppressClickUntil=0;
scene.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;
 tapStart={id:e.pointerId,x:e.clientX,y:e.clientY};
},{passive:true});
scene.addEventListener('pointercancel',()=>{tapStart=null},{passive:true});
scene.addEventListener('pointerup',e=>{
 const start=tapStart;tapStart=null;
 if(!start||start.id!==e.pointerId||!currentTyping)return;
 if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>12)return;
 if(e.target.closest('button,.vh-intro-navigation,input,textarea,a'))return;
 if(finishCurrentBubble())suppressClickUntil=performance.now()+500;
},{passive:true});
scene.addEventListener('click',e=>{
 if(performance.now()<suppressClickUntil)return;
 if(e.target.closest('button,.vh-intro-navigation,input,textarea,a'))return;
 finishCurrentBubble();
});
previous.onclick=()=>{
 if(!renderComplete)return;unlockAudio();
 if(visibleCount>1)showHistory(activePage,visibleCount-1);
 else if(activePage>0)showHistory(activePage-1,PAGES[activePage-1].length);
};
next.onclick=()=>{
 if(!renderComplete)return;unlockAudio();
 if(visibleCount<PAGES[activePage].length){showNextMessage(seq);return}
 if(activePage<PAGES.length-1){activePage++;visibleCount=0;messages.replaceChildren();showNextMessage(seq);return}
 renderToken++;cancelTypingWait();next.hidden=true;previous.hidden=true;put(DONE,'yes');code(seq,true);
};
function option(t){const b=document.createElement('button');b.type='button';b.className='vh-intro-choice';b.textContent=t;b.addEventListener('click',()=>{b.classList.add('vh-choice-pressed');setTimeout(()=>b.classList.remove('vh-choice-pressed'),230)},true);actions.appendChild(b);return b}
async function firstMessageAlert(id){
const banner=document.createElement('button');banner.type='button';
banner.className='vh-intro-notification';
banner.setAttribute('role','status');
const header=document.createElement('div');header.className='vh-intro-notification-head';header.innerHTML='<span>BẠN CÓ TIN NHẮN MỚI</span><span>BÂY GIỜ</span>';
const body=document.createElement('div');body.className='vh-intro-notification-body';
const sender=document.createElement('strong');sender.textContent='Neymarinho';
const preview=document.createElement('span');preview.textContent='CHẠM ĐỂ XEM TIN NHẮN';
body.append(sender,preview);banner.append(header,body);root.appendChild(banner);
await sleep(80);if(id!==seq){banner.remove();return}
banner.classList.add('show');window.VHSound?.play('notification');
await new Promise(resolve=>{banner.addEventListener('click',resolve,{once:true})});banner.classList.remove('show');await sleep(350);banner.remove();
}
// Load the next screen's actual images during the loading transition, rather
// than keeping an arbitrary five-second timer. Decode is cached by the browser.
const CRITICAL_IMAGES=[
 'assets/xray-background.png','assets/red-folder.webp','assets/torn-paper.webp',
 'assets/investigator-avatar.png','assets/caua-opening.jpg'
];
let preloadPromise=null;
function preloadCritical(){
 if(preloadPromise)return preloadPromise;
 preloadPromise=Promise.allSettled(CRITICAL_IMAGES.map(src=>new Promise(resolve=>{
   const image=new Image();
   image.decoding='async';image.src=src;
   if(image.complete){resolve();return}
   image.onload=image.onerror=resolve;
 })));
 return preloadPromise;
}
async function begin(){
 if(!gateAuthorized)return;
 const id=++seq;
 show();screen('load');
 window.VHSound?.start('loading');
 const started=performance.now();
 // Start warming the iframe only after the critical page assets have been queued.
 // The phone still loads in the background during the intro.
 document.dispatchEvent(new Event('vh:preload-phone'));
 await Promise.race([preloadCritical(),sleep(1800)]);
 const remaining=Math.max(0,550-(performance.now()-started));
 if(remaining)await sleep(remaining);
 if(id!==seq)return;
 window.VHSound?.stop('loading');
 if(get(DONE))finish();
 else if(get(KEY))code(id);
 else{screen('name');input.focus({preventScroll:true})}
}
form.addEventListener('submit',e=>{e.preventDefault();unlockAudio();const n=input.value.replace(/\s+/g,' ').trim().slice(0,36);if(!n)return;put(KEY,n);code(++seq)});
window.addEventListener('vh:show-intro',()=>{window.VHSound?.stop('loading');window.VHKeyboardAudio?.stop();seq++;show();screen('name');input.value=get(KEY);input.focus({preventScroll:true})});
gate.addEventListener('submit',e=>{e.preventDefault();if(pin.value!=='1111'){gateError.textContent='MÃ TRUY CẬP KHÔNG HỢP LỆ';pin.value='';pin.focus();return}gateError.textContent='';gateAuthorized=true;put(AUTH,'yes');window.VHSound?.prepare();begin()});
if(get(AUTH)==='yes'||get(DONE)==='yes'||get(KEY)){
 gateAuthorized=true;put(AUTH,'yes');
 // Mobile Safari requires a fresh tap in this browsing session to unlock audio.
 // A returning player does NOT need to enter the access code again.
 screen('load');show();
 const resumeButton=document.createElement('button');
 resumeButton.type='button';resumeButton.className='vh-resume-audio';
 resumeButton.textContent='CHẠM ĐỂ TIẾP TỤC';
 load.appendChild(resumeButton);
 resumeButton.addEventListener('click',()=>{
   resumeButton.remove();
   unlockAudio();
   begin();
 },{once:true});
}else{screen('gate');show()}
})();