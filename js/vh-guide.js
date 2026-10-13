/* VH quick guide, navigation menu and one-time phone walkthrough. */
(()=>{'use strict';
const INTRO_DONE='vh.intro.finished.v1',TOUR_DONE='vh.guide.phone.v1';
const read=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const write=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const el=(tag,cls,html)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(html!==undefined)x.innerHTML=html;return x};
const nav=document.getElementById('vhOpenPhone');
const menu=el('button','vh-menu-trigger','☰');menu.type='button';menu.setAttribute('aria-label','Mở menu điều tra');menu.setAttribute('aria-expanded','false');
const panel=el('aside','vh-menu-panel');panel.setAttribute('aria-label','Menu điều tra');panel.hidden=true;
panel.innerHTML='<div class="vh-menu-title"><span>VÍNCULO HUMANO</span><button type="button" data-act="close" aria-label="Đóng menu">×</button></div><button type="button" data-act="investigate">Điều tra <span>›</span></button><button type="button" data-act="guide">Hướng dẫn chơi <span>›</span></button><button type="button" data-act="settings" aria-expanded="false">Cài đặt <span>⌄</span></button><div class="vh-menu-settings" hidden><label>Hiệu ứng âm thanh <input id="vhSoundSwitch" type="checkbox"></label><button type="button" data-act="restart">Chơi lại từ đầu ↺</button></div><small>VH / INVESTIGATION INTERFACE</small>';
const shade=el('div','vh-guide-shade');shade.hidden=true;
const dialog=el('section','vh-guide-dialog');dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
dialog.innerHTML='<button class="vh-guide-close" type="button" aria-label="Đóng">×</button><div class="vh-guide-eyebrow">VÍNCULO HUMANO / HƯỚNG DẪN</div><h2>Trước khi bắt đầu</h2><div class="vh-guide-steps"><p><b>01 — Khám phá hồ sơ vật lý.</b> Mở bộ hồ sơ và đối chiếu các tài liệu, hình ảnh, bằng chứng được cung cấp.</p><p><b>02 — Truy cập điện thoại điều tra.</b> Nhấn nút mũi tên › ở mép trên bên phải để mở điện thoại; nhấn ‹ để quay lại hồ sơ đỏ.</p><p><b>03 — Sử dụng các ứng dụng.</b> Đọc và trả lời tin nhắn của Neymarinho, dùng Safari để truy cập địa chỉ trong tài liệu, và Notes để ghi chú.</p><p><b>04 — Hoàn thành nhiệm vụ.</b> Quay về hồ sơ đỏ, điền câu trả lời và xác nhận để tiếp tục điều tra.</p></div><p class="vh-guide-footnote">Không phải mọi tài liệu đều nói thật.</p><button type="button" class="vh-guide-primary">BẮT ĐẦU ĐIỀU TRA →</button>';
const tip=el('div','vh-tour-tip');tip.hidden=true;tip.setAttribute('role','status');
document.body.append(menu,panel,shade,dialog,tip);
const settings=panel.querySelector('.vh-menu-settings'),sound=panel.querySelector('#vhSoundSwitch');
sound.checked=window.VHSound?.isEnabled()??true;
sound.addEventListener('change',()=>window.VHSound?.setEnabled(sound.checked));
document.addEventListener('vh:sound-setting',e=>sound.checked=e.detail.enabled);
let auto=false,touring=false,phase=0,phoneWatch=null;
function closeMenu(){panel.hidden=true;menu.setAttribute('aria-expanded','false')}
function hideGuide(){dialog.hidden=true;shade.hidden=true;document.body.classList.remove('vh-guide-open')}
function showGuide(first=false){closeMenu();auto=first;dialog.querySelector('.vh-guide-primary').textContent=first?'BẮT ĐẦU ĐIỀU TRA →':'QUAY LẠI ĐIỀU TRA';dialog.hidden=false;shade.hidden=false;document.body.classList.add('vh-guide-open');dialog.querySelector('.vh-guide-close').focus({preventScroll:true})}
function stopTour(){touring=false;phase=0;tip.hidden=true;document.body.classList.remove('vh-tour-open','vh-tour-phone');phoneWatch?.disconnect();phoneWatch=null;write(TOUR_DONE,'yes')}
function startTour(){if(!nav){write(TOUR_DONE,'yes');return}touring=true;phase=1;document.body.classList.add('vh-tour-open');tip.innerHTML='<b>Điện thoại điều tra</b><span>Nhấn nút mũi tên › ở góc trên bên phải để mở điện thoại.</span><button type="button">Bỏ qua</button>';tip.hidden=false;tip.querySelector('button').onclick=stopTour;phoneWatch=new MutationObserver(()=>{if(touring&&phase===1&&document.body.classList.contains('vh-phone-active')){phase=2;document.body.classList.add('vh-tour-phone');tip.innerHTML='<b>Đây là điện thoại của bạn.</b><span>Khám phá Messages, Safari và Notes. Nhấn ‹ để quay lại hồ sơ đỏ.</span><button type="button">ĐÃ HIỂU</button>';tip.querySelector('button').onclick=stopTour}});phoneWatch.observe(document.body,{attributes:true,attributeFilter:['class']})}
function finishGuide(){hideGuide();if(auto&&read(TOUR_DONE)!=='yes')startTour();auto=false}
dialog.querySelector('.vh-guide-primary').onclick=finishGuide;
dialog.querySelector('.vh-guide-close').onclick=()=>{if(auto)finishGuide();else hideGuide()};
shade.onclick=()=>{if(!auto)hideGuide()};
menu.onclick=()=>{const opening=panel.hidden;panel.hidden=!opening;menu.setAttribute('aria-expanded',String(opening))};
function restart(){closeMenu();if(!confirm('Chơi lại từ đầu? Toàn bộ tiến trình điều tra và ghi chú đã lưu trên thiết bị này sẽ bị xóa.'))return;const keepSound=read('vh_sound_enabled');try{for(const k of Object.keys(localStorage))if(k.startsWith('vh')||k.startsWith('VH'))localStorage.removeItem(k);if(keepSound!==null)localStorage.setItem('vh_sound_enabled',keepSound)}catch(_){}location.reload()}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;switch(b.dataset.act){case'close':closeMenu();break;case'investigate':closeMenu();hideGuide();if(document.body.classList.contains('vh-phone-active'))document.getElementById('vhPhoneBack')?.click();break;case'guide':showGuide(false);break;case'settings':settings.hidden=!settings.hidden;b.setAttribute('aria-expanded',String(!settings.hidden));break;case'restart':restart();break}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!dialog.hidden&&!auto)hideGuide();else closeMenu()}});
function beginIfNeeded(){if(read(TOUR_DONE)==='yes')return;showGuide(true)}
document.addEventListener('vh:intro-finished',beginIfNeeded);
if(read(INTRO_DONE)==='yes'&&!document.body.classList.contains('vh-onboarding'))beginIfNeeded();
})();