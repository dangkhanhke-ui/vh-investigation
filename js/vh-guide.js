/* VH quick guide, navigation menu and one-time phone walkthrough. */
(()=>{'use strict';
const INTRO_DONE='vh.intro.finished.v1',TOUR_DONE='vh.guide.phone.v1',FEEDBACK_QUEUE='vh.feedback.pending.v1';
// Set the Formspree endpoint here when the receiver is configured (e.g. https://formspree.io/f/your-id).
const FEEDBACK_ENDPOINT='';
const read=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const write=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const el=(tag,cls,html)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(html!==undefined)x.innerHTML=html;return x};
const nav=document.getElementById('vhOpenPhone');
const menu=el('button','vh-menu-trigger','<span></span><span></span><span></span>');menu.type='button';menu.setAttribute('aria-label','Mở menu điều tra');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-controls','vh-menu-panel');
const panel=el('aside','vh-menu-panel');panel.setAttribute('aria-label','Menu điều tra');panel.hidden=true;panel.id='vh-menu-panel';
panel.innerHTML='<div class="vh-menu-title"><span>MENU</span><button type="button" data-act="close" aria-label="Đóng menu">×</button></div><button type="button" data-act="investigate"><span>01 / ĐIỀU TRA</span><span>↗</span></button><button type="button" data-act="guide"><span>02 / HƯỚNG DẪN CHƠI</span><span>↗</span></button><button type="button" data-act="settings" aria-expanded="false"><span>03 / CÀI ĐẶT</span><span>+</span></button><div class="vh-menu-settings" hidden><label>HIỆU ỨNG ÂM THANH <input id="vhSoundSwitch" type="checkbox"></label><button type="button" data-act="restart">CHƠI LẠI TỪ ĐẦU ↺</button></div><button type="button" data-act="about"><span>04 / THÔNG TIN & GÓP Ý</span><span>↗</span></button>';
const shade=el('div','vh-guide-shade');shade.hidden=true;
const dialog=el('section','vh-guide-dialog');dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
const guideSteps=[
['MỞ BỘ HỒ SƠ.','Đây là một trò chơi điều tra do một cá nhân thực hiện. Nếu gặp sai sót hoặc muốn góp ý, bạn có thể gửi qua MENU → THÔNG TIN & GÓP Ý. Hãy đọc các tài liệu và bằng chứng được cung cấp.'],
['MỞ ĐIỆN THOẠI.','Nhấn mũi tên › ở góc trên bên phải để chuyển sang điện thoại điều tra.'],
['TÌM KIẾM THÔNG TIN.','Nhắn tin với Neymarinho, dùng Safari để truy cập các địa chỉ trong tài liệu và Notes để ghi chú.'],
['ĐƯA RA KẾT LUẬN.','Quay lại hồ sơ đỏ, điền câu trả lời và xác nhận để tiếp tục cuộc điều tra.']
];
let guideIndex=0;
dialog.innerHTML='<div class="vh-guide-head"><span>HƯỚNG DẪN</span><button class="vh-guide-close" type="button" aria-label="Đóng">×</button></div><div class="vh-guide-copy"><h2></h2><p class="vh-guide-description"></p></div><div class="vh-guide-bottom"><span class="vh-guide-count"></span><button type="button" class="vh-guide-primary">TIẾP THEO →</button></div>';
function renderGuide(){const [heading,body]=guideSteps[guideIndex];dialog.querySelector('h2').textContent=heading;dialog.querySelector('.vh-guide-description').textContent=body;dialog.querySelector('.vh-guide-count').textContent=String(guideIndex+1).padStart(2,'0')+'/04';dialog.querySelector('.vh-guide-primary').textContent=guideIndex===3?'BẮT ĐẦU ĐIỀU TRA →':'TIẾP THEO →'}

// Information, disclaimer and feedback form. No recipient is configured yet.
const about=el('section','vh-about-dialog');
about.hidden=true;about.setAttribute('role','dialog');about.setAttribute('aria-modal','true');about.setAttribute('aria-label','Thông tin và góp ý');
about.innerHTML=`<div class="vh-about-head"><span>VÍNCULO HUMANO / 04</span><button type="button" class="vh-about-close" aria-label="Đóng">×</button></div>
<h2>THÔNG TIN & GÓP Ý</h2>
<h3>MỘT CHÚT VỀ TRÒ CHƠI</h3>
<p>Vínculo Humano là trò chơi điều tra hư cấu do một cá nhân xây dựng và phát triển</p>
<p>Vì dự án được thực hiện độc lập, có thể vẫn còn sai sót về nội dung, hình ảnh hoặc kỹ thuật. Nếu bạn phát hiện lỗi hoặc có đề xuất, mình rất mong nhận được góp ý để cải thiện trò chơi</p>
<h3>LƯU Ý</h3>
<p>Vụ án, tổ chức và nhân vật trong trò chơi đều là hư cấu. Những điểm trùng hợp với người hoặc sự kiện có thật đều không có chủ đích</p>
<p>Hình ảnh nhân vật được tạo bằng AI để phục vụ câu chuyện hư cấu, không phải ảnh chụp của những người có thật trong vụ án</p>
<h3>GỬI GÓP Ý</h3>
<form class="vh-feedback-form">
<label for="vhFeedbackType">LOẠI GÓP Ý</label>
<select id="vhFeedbackType" name="type"><option value="Lỗi kỹ thuật / website">Lỗi kỹ thuật / website</option><option value="Sai sót nội dung / hồ sơ">Sai sót nội dung / hồ sơ</option><option value="Trải nghiệm chơi / đề xuất">Trải nghiệm chơi / đề xuất</option><option value="Khác">Khác</option></select>
<label for="vhFeedbackText">NỘI DUNG GÓP Ý</label>
<textarea id="vhFeedbackText" name="message" rows="5" maxlength="5000" placeholder="Mô tả lỗi hoặc góp ý của bạn..." required></textarea>
<label for="vhFeedbackEmail">EMAIL LIÊN HỆ (KHÔNG BẮT BUỘC)</label>
<input id="vhFeedbackEmail" name="email" type="email" maxlength="200" placeholder="Email để mình liên hệ lại nếu cần">
<label class="vh-feedback-check"><input name="spoiler" type="checkbox"> Góp ý có chứa spoiler</label>
<button class="vh-feedback-submit" type="submit">GỬI GÓP Ý ↗</button>
<p class="vh-feedback-status" role="status" aria-live="polite"></p>
<p class="vh-feedback-note">Khi chưa cấu hình nơi nhận, góp ý chỉ được lưu trên thiết bị này và chưa gửi đến tác giả</p>
</form>`;
const feedbackForm=about.querySelector('form'),feedbackStatus=about.querySelector('.vh-feedback-status');
function hideAbout(){about.hidden=true;document.body.classList.remove('vh-about-open')}
function showAbout(){closeMenu();hideGuide();about.hidden=false;document.body.classList.add('vh-about-open');about.querySelector('.vh-about-close').focus({preventScroll:true})}
about.querySelector('.vh-about-close').onclick=hideAbout;
feedbackForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const data=new FormData(feedbackForm);
 const message=String(data.get('message')||'').trim();if(!message)return;
 const entry={type:String(data.get('type')||'Khác'),message,email:String(data.get('email')||'').trim(),spoiler:data.has('spoiler'),createdAt:new Date().toISOString(),page:location.pathname};
 const submit=feedbackForm.querySelector('.vh-feedback-submit');submit.disabled=true;feedbackStatus.textContent='';
 try{
  if(FEEDBACK_ENDPOINT){
   const response=await fetch(FEEDBACK_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(entry)});
   if(!response.ok)throw new Error('Không thể gửi góp ý');
   feedbackStatus.textContent='Đã gửi góp ý thành công, cảm ơn bạn!';
   feedbackForm.reset();
  }else{
   const stored=JSON.parse(read(FEEDBACK_QUEUE)||'[]');
   const pending=Array.isArray(stored)?stored:[];
   pending.push(entry);
   write(FEEDBACK_QUEUE,JSON.stringify(pending));
   if(read(FEEDBACK_QUEUE)!==JSON.stringify(pending))throw new Error('Không thể lưu trên thiết bị này');
   feedbackStatus.textContent='Đã lưu góp ý trên thiết bị. Chưa gửi cho tác giả vì chưa cấu hình nơi nhận';
   feedbackForm.reset();
  }
 }catch(_){feedbackStatus.textContent='Chưa gửi được góp ý. Vui lòng giữ lại nội dung và thử lại sau'}
 finally{submit.disabled=false}
});

const tip=el('div','vh-tour-tip');tip.hidden=true;tip.setAttribute('role','status');
document.body.append(menu,panel,shade,dialog,about,tip);
const settings=panel.querySelector('.vh-menu-settings'),sound=panel.querySelector('#vhSoundSwitch');
sound.checked=window.VHSound?.isEnabled()??true;
sound.addEventListener('change',()=>window.VHSound?.setEnabled(sound.checked));
document.addEventListener('vh:sound-setting',e=>sound.checked=e.detail.enabled);
let auto=false,touring=false,phase=0,phoneWatch=null;
function closeMenu(){panel.hidden=true;menu.setAttribute('aria-expanded','false')}
function hideGuide(){dialog.hidden=true;shade.hidden=true;document.body.classList.remove('vh-guide-open')}
function showGuide(first=false){closeMenu();auto=first;guideIndex=0;renderGuide();dialog.hidden=false;shade.hidden=false;document.body.classList.add('vh-guide-open');dialog.querySelector('.vh-guide-close').focus({preventScroll:true})}
function stopTour(){touring=false;phase=0;tip.hidden=true;document.body.classList.remove('vh-tour-open','vh-tour-phone');phoneWatch?.disconnect();phoneWatch=null;write(TOUR_DONE,'yes')}
function startTour(){if(!nav){write(TOUR_DONE,'yes');return}touring=true;phase=1;document.body.classList.add('vh-tour-open');tip.innerHTML='<b>Điện thoại điều tra</b><span>Nhấn nút mũi tên › ở góc trên bên phải để mở điện thoại.</span><button type="button">Bỏ qua</button>';tip.hidden=false;tip.querySelector('button').onclick=stopTour;phoneWatch=new MutationObserver(()=>{if(touring&&phase===1&&document.body.classList.contains('vh-phone-active')){phase=2;document.body.classList.add('vh-tour-phone');tip.innerHTML='<b>Đây là điện thoại của bạn.</b><span>Khám phá Messages, Safari và Notes. Nhấn ‹ để quay lại hồ sơ đỏ.</span><button type="button">ĐÃ HIỂU</button>';tip.querySelector('button').onclick=stopTour}});phoneWatch.observe(document.body,{attributes:true,attributeFilter:['class']})}
function finishGuide(){hideGuide();if(auto&&read(TOUR_DONE)!=='yes')startTour();auto=false}
dialog.querySelector('.vh-guide-primary').onclick=()=>{if(guideIndex<3){guideIndex++;renderGuide()}else finishGuide()};
dialog.querySelector('.vh-guide-close').onclick=()=>{if(auto)finishGuide();else hideGuide()};
shade.onclick=()=>{if(!auto)hideGuide()};
menu.onclick=()=>{if(document.body.classList.contains('vh-phone-active'))return;const opening=panel.hidden;panel.hidden=!opening;menu.setAttribute('aria-expanded',String(opening))};
function restart(){closeMenu();if(!confirm('Chơi lại từ đầu? Toàn bộ tiến trình điều tra và ghi chú đã lưu trên thiết bị này sẽ bị xóa.'))return;const keepSound=read('vh_sound_enabled');try{for(const k of Object.keys(localStorage))if(k.startsWith('vh')||k.startsWith('VH'))localStorage.removeItem(k);if(keepSound!==null)localStorage.setItem('vh_sound_enabled',keepSound)}catch(_){}location.reload()}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;switch(b.dataset.act){case'close':closeMenu();break;case'investigate':closeMenu();hideGuide();if(document.body.classList.contains('vh-phone-active'))document.getElementById('vhPhoneBack')?.click();break;case'guide':showGuide(false);break;case'about':showAbout();break;case'settings':settings.hidden=!settings.hidden;b.setAttribute('aria-expanded',String(!settings.hidden));b.querySelector('span:last-child').textContent=settings.hidden?'+':'−';break;case'restart':restart();break}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!about.hidden)hideAbout();else if(!dialog.hidden&&!auto)hideGuide();else closeMenu()}});
function beginIfNeeded(){if(read(TOUR_DONE)==='yes')return;showGuide(true)}
document.addEventListener('vh:intro-finished',beginIfNeeded);
const phoneMenuObserver=new MutationObserver(()=>{if(document.body.classList.contains('vh-phone-active')||document.body.classList.contains('vh-phone-transitioning'))closeMenu()});phoneMenuObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
if(read(INTRO_DONE)==='yes'&&!document.body.classList.contains('vh-onboarding'))beginIfNeeded();
})();