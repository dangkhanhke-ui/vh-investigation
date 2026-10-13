(()=>{'use strict';
const root=document.querySelector('#vh-intro'),load=root.querySelector('.vh-intro-loading-view'),form=root.querySelector('.vh-intro-name'),input=root.querySelector('#vh-player-name'),access=root.querySelector('.vh-intro-access'),scene=root.querySelector('.vh-intro-scene'),stream=root.querySelector('.vh-access-stream'),messages=root.querySelector('.vh-intro-messages'),actions=root.querySelector('.vh-intro-actions'),next=root.querySelector('.vh-intro-next');
const KEY='vh.player.name.v1',DONE='vh.intro.finished.v1',get=k=>{try{return localStorage.getItem(k)||''}catch{return''}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}},sleep=t=>new Promise(r=>setTimeout(r,t));
window.VHPlayer={get name(){return get(KEY)},getName(){return get(KEY)}};
let seq=0;
function unlockAudio(){window.VHSound?.prepare()}
function screen(mode){load.hidden=mode!=='load';form.hidden=mode!=='name';access.hidden=mode!=='access';scene.hidden=mode!=='scene';root.classList.toggle('vh-is-black',mode==='scene')}
function show(){root.hidden=false;root.removeAttribute('aria-hidden');document.body.classList.add('vh-onboarding')}
function finish(){window.VHSound?.stop('loading');window.VHKeyboardAudio?.stop();seq++;root.hidden=true;root.setAttribute('aria-hidden','true');document.body.classList.remove('vh-onboarding')}
async function code(id,final=false){screen('access');window.VHSound?.start('loading');stream.replaceChildren();for(const t of final?['ĐANG TRUY CẬP HỒ SƠ','Đang mở tài liệu...','Đang đối chiếu dữ liệu...','Hoàn tất.']:['ĐANG TRUY CẬP HỒ SƠ','Đang xác thực...','Đang giải mã...','Đang kiểm tra quyền truy cập...','Đang kết nối...','Đang truy xuất hồ sơ...','Đang đồng bộ tài liệu...','Đang kiểm tra tính toàn vẹn...','Truy cập thành công.']){if(id!==seq)return;const d=document.createElement('div');d.textContent=t;stream.appendChild(d);if(stream.children.length>6)stream.firstChild.remove();await sleep(220)}await sleep(420);window.VHSound?.stop('loading');if(id!==seq)return;if(final)finish();else dialogue(id)}
async function say(t,id){
if(id!==seq)return;
const row=document.createElement('div');row.className='vh-intro-message-row';
const img=document.createElement('img');img.className='vh-intro-avatar';img.src='assets/investigator-avatar.png';img.alt='';
const bubble=document.createElement('div');bubble.className='vh-intro-bubble vh-typing';bubble.textContent='•••';
row.append(img,bubble);messages.replaceChildren(row);messages.scrollTop=messages.scrollHeight;
await sleep(Math.min(1850,750+t.length*12));if(id!==seq)return;
bubble.classList.remove('vh-typing');bubble.textContent='';window.VHKeyboardAudio?.start();
for(let i=0;i<t.length;i++){
if(id!==seq)return;
const ch=t[i];bubble.textContent+=ch;
if(i%4===0)messages.scrollTop=messages.scrollHeight;
let delay=25+Math.random()*23;
if(ch===','||ch===';')delay+=180;
if(ch==='.'||ch==='?'||ch==='!')delay+=280;
if(ch===' ')delay+=12;
await sleep(delay);
}
window.VHKeyboardAudio?.stop();messages.scrollTop=messages.scrollHeight;
await sleep(650+Math.min(500,t.length*3));
}
function arrow(){return new Promise(resolve=>{next.hidden=false;next.onclick=()=>{unlockAudio();next.hidden=true;messages.replaceChildren();resolve()}})}
function option(t){const b=document.createElement('button');b.type='button';b.className='vh-intro-choice';b.textContent=t;b.addEventListener('click',()=>{b.classList.add('vh-choice-pressed');setTimeout(()=>b.classList.remove('vh-choice-pressed'),230)},true);actions.appendChild(b);return b}
async function dialogue(id){screen('scene');messages.replaceChildren();actions.replaceChildren();next.hidden=true;const n=get(KEY);await say(n+', đã đến rồi à?',id);await arrow();if(id!==seq)return;await say('Tên anh là Neymarinho, điều tra viên của vụ án về cái chết của Cauã.',id);await arrow();if(id!==seq)return;await say('Cauã từng đứng đầu một tổ chức sinh viên.',id);await arrow();if(id!==seq)return;await say('Và có vẻ cũng kha khá người liên quan đến cậu ta đấy.',id);await arrow();if(id!==seq)return;await say('Chắc hẳn em đã nhận được vài tài liệu mà anh đã thu thập được rồi? Đúng chứ?',id);if(id!==seq)return;const answer=await new Promise(resolve=>{option('Đã nhận').onclick=()=>resolve('yes');option('Chưa nhận').onclick=()=>resolve('no')});actions.replaceChildren();if(answer==='no'){await say('Gì vậy má? Em kiểm tra kỹ chưa thế? Anh gửi cả đống tài liệu rồi mà!',id);await new Promise(resolve=>{option('Đã nhận').onclick=resolve});actions.replaceChildren()}if(id!==seq)return;await say('Dù sao thì',id);if(id!==seq)return;await say('Vụ án này có vẻ phức tạp hơn anh nghĩ, nên anh mới cần thêm một người trợ giúp.',id);await arrow();if(id!==seq)return;await say('Giúp anh nhé, '+n+'.',id);await arrow();if(id!==seq)return;await say('Anh tin mày.',id);await arrow();if(id!==seq)return;put(DONE,'yes');await code(id,true)}
async function begin(){const id=++seq;show();screen('load');window.VHSound?.start('loading');await sleep(get(DONE)?2100:2600);if(id!==seq)return;window.VHSound?.stop('loading');if(get(DONE))finish();else if(get(KEY))code(id);else{screen('name');input.focus({preventScroll:true})}}
form.addEventListener('submit',e=>{e.preventDefault();unlockAudio();const n=input.value.replace(/\s+/g,' ').trim().slice(0,36);if(!n)return;put(KEY,n);code(++seq)});
window.addEventListener('vh:show-intro',()=>{window.VHSound?.stop('loading');window.VHKeyboardAudio?.stop();seq++;show();screen('name');input.value=get(KEY);input.focus({preventScroll:true})});
begin();
})();