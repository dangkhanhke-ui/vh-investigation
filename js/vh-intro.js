(()=>{'use strict';
const root=document.querySelector('#vh-intro'),load=root.querySelector('.vh-intro-loading-view'),form=root.querySelector('.vh-intro-name'),input=root.querySelector('#vh-player-name'),access=root.querySelector('.vh-intro-access'),scene=root.querySelector('.vh-intro-scene'),stream=root.querySelector('.vh-access-stream'),messages=root.querySelector('.vh-intro-messages'),actions=root.querySelector('.vh-intro-actions'),next=root.querySelector('.vh-intro-next');
const KEY='vh.player.name.v1',DONE='vh.intro.finished.v1',get=k=>{try{return localStorage.getItem(k)||''}catch{return''}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}},sleep=t=>new Promise(r=>setTimeout(r,t));
window.VHPlayer={get name(){return get(KEY)},getName(){return get(KEY)}};
let seq=0,audio;
function sound(kind='message'){
try{
if(get('vh_sound_enabled')==='false')return;
const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
audio=audio||new C();if(audio.state==='suspended')audio.resume().catch(()=>{});
const now=audio.currentTime;
const ping=(frequency,start,duration,volume,type='sine')=>{
const osc=audio.createOscillator(),gain=audio.createGain();
osc.type=type;osc.frequency.setValueAtTime(frequency,start);
osc.frequency.exponentialRampToValueAtTime(frequency*.78,start+duration);
gain.gain.setValueAtTime(.0001,start);
gain.gain.exponentialRampToValueAtTime(volume,start+.008);
gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(start+duration+.01);
};
if(kind==='message'){ping(920,now,.16,.12);ping(1240,now+.085,.23,.10)}
else{ping(1050+Math.random()*110,now,.026,.009,'triangle')}
}catch{}
}
function screen(mode){load.hidden=mode!=='load';form.hidden=mode!=='name';access.hidden=mode!=='access';scene.hidden=mode!=='scene';root.classList.toggle('vh-is-black',mode==='scene')}
function show(){root.hidden=false;root.removeAttribute('aria-hidden');document.body.classList.add('vh-onboarding')}
function finish(){seq++;root.hidden=true;root.setAttribute('aria-hidden','true');document.body.classList.remove('vh-onboarding')}
async function code(id,final=false){screen('access');stream.replaceChildren();for(const t of final?['ĐANG TRUY CẬP HỒ SƠ','Đang mở tài liệu...','Hoàn tất.']:['ĐANG TRUY CẬP HỒ SƠ','Đang xác thực...','Đang giải mã...','Đang kết nối...','Truy cập thành công.']){if(id!==seq)return;const d=document.createElement('div');d.textContent=t;stream.appendChild(d);if(stream.children.length>4)stream.firstChild.remove();await sleep(190)}await sleep(420);if(id!==seq)return;if(final)finish();else dialogue(id)}
async function say(t,id){
if(id!==seq)return;
const row=document.createElement('div');row.className='vh-intro-message-row';
const img=document.createElement('img');img.className='vh-intro-avatar';img.src='assets/investigator-avatar.png';img.alt='';
const bubble=document.createElement('div');bubble.className='vh-intro-bubble vh-typing';bubble.textContent='•••';
row.append(img,bubble);messages.appendChild(row);messages.scrollTop=messages.scrollHeight;
await sleep(Math.min(1850,750+t.length*12));if(id!==seq)return;
bubble.classList.remove('vh-typing');bubble.textContent='';sound('message');
for(let i=0;i<t.length;i++){
if(id!==seq)return;
const ch=t[i];bubble.textContent+=ch;if(ch.trim()&&i%3===0)sound('type');
if(i%4===0)messages.scrollTop=messages.scrollHeight;
let delay=25+Math.random()*23;
if(ch===','||ch===';')delay+=180;
if(ch==='.'||ch==='?'||ch==='!')delay+=280;
if(ch===' ')delay+=12;
await sleep(delay);
}
messages.scrollTop=messages.scrollHeight;
await sleep(650+Math.min(500,t.length*3));
}
function arrow(){return new Promise(resolve=>{next.hidden=false;next.onclick=()=>{next.hidden=true;resolve()}})}
function option(t){const b=document.createElement('button');b.type='button';b.className='vh-intro-choice';b.textContent=t;actions.appendChild(b);return b}
async function dialogue(id){screen('scene');messages.replaceChildren();actions.replaceChildren();next.hidden=true;const n=get(KEY);await say(n+', đã đến rồi à?',id);await arrow();if(id!==seq)return;await say('Tên anh là Neymarinho, điều tra viên của vụ án về cái chết của Cauã.',id);await arrow();if(id!==seq)return;await say('Chắc hẳn em đã nhận được vài tài liệu mà anh đã thu thập được rồi? Đúng chứ?',id);if(id!==seq)return;const answer=await new Promise(resolve=>{option('Đã nhận').onclick=()=>resolve('yes');option('Chưa nhận').onclick=()=>resolve('no')});actions.replaceChildren();if(answer==='no'){await say('Gì vậy má? Em kiểm tra kỹ chưa thế? Anh gửi cả đống tài liệu rồi mà!',id);await new Promise(resolve=>{option('Đã nhận').onclick=resolve});actions.replaceChildren()}if(id!==seq)return;await say('Dù sao thì',id);if(id!==seq)return;await say('Vụ án này có vẻ phức tạp hơn anh nghĩ, nên anh mới cần thêm một người trợ giúp.',id);await arrow();if(id!==seq)return;await say('Giúp anh nhé, '+n+'.',id);await arrow();if(id!==seq)return;await say('Anh tin mày.',id);await arrow();if(id!==seq)return;put(DONE,'yes');await code(id,true)}
async function begin(){const id=++seq;show();screen('load');await sleep(get(DONE)?2100:2600);if(id!==seq)return;if(get(DONE))finish();else if(get(KEY))code(id);else{screen('name');input.focus({preventScroll:true})}}
form.addEventListener('submit',e=>{e.preventDefault();const n=input.value.replace(/\s+/g,' ').trim().slice(0,36);if(!n)return;put(KEY,n);code(++seq)});
window.addEventListener('vh:show-intro',()=>{seq++;show();screen('name');input.value=get(KEY);input.focus({preventScroll:true})});
begin();
})();