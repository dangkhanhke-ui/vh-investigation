(() => {
  const opener=document.getElementById('vhOpenPhone');
  const overlay=document.getElementById('vhPhoneOverlay');
  const closer=document.getElementById('vhClosePhone');
  const frame=document.getElementById('vhPhoneFrame');
  if(!opener||!overlay||!closer||!frame)return;
  let previousFocus=null;
  function closePhone(){
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('vh-phone-open');
    if(previousFocus&&previousFocus.focus)previousFocus.focus();
  }
  opener.addEventListener('click',()=>{
    previousFocus=document.activeElement;
    if(!frame.getAttribute('src'))frame.setAttribute('src','phone/');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('vh-phone-open');
    closer.focus();
  });
  closer.addEventListener('click',closePhone);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&overlay.classList.contains('is-open'))closePhone();
  });
})();
