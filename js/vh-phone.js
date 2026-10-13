/* VH: minimal, dependable corner-chevron navigation.
   No swipe interception: the dossier, Safari and laptop scrolling are untouched. */
(()=>{
  'use strict';
  const open=document.getElementById('vhOpenPhone');
  const back=document.getElementById('vhPhoneBack');
  const layer=document.getElementById('vhPhoneLayer');
  const iframe=document.getElementById('vhPhoneIframe');
  if(!open||!back||!layer||!iframe)return;

  let current='dossier';
  let transitioning=false;
  let fallback=0;

  function warmPhone(){
    if(!iframe.getAttribute('src'))iframe.setAttribute('src','phone/?fresh='+Date.now());
  }
  // CRASH GUARD: never preload the heavyweight phone during dossier startup.
  // Only create the iframe after the player explicitly opens the phone.

  function duration(){
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:245;
  }
  function hasOpenDialog(){
    return document.body.classList.contains('lock')||
      !!document.querySelector('#chatSheet.open,#modalLayer.open,.chat-sheet.open,.modal-layer.open');
  }
  function go(destination){
    if(transitioning||destination===current)return;
    if(destination==='phone'&&hasOpenDialog())return;
    transitioning=true;
    if(destination==='phone')warmPhone();

    clearTimeout(fallback);
    const ms=duration();
    document.documentElement.style.setProperty('--vh-nav-duration',ms+'ms');
    document.body.classList.add('vh-phone-transitioning');
    layer.removeAttribute('inert');
    layer.setAttribute('aria-hidden','false');
    layer.classList.add('is-animating');

    let finished=false;
    function complete(){
      if(finished)return;
      finished=true;
      clearTimeout(fallback);
      layer.removeEventListener('transitionend',onEnd);
      layer.classList.remove('is-animating');
      current=destination;
      transitioning=false;
      document.body.classList.remove('vh-phone-transitioning');
      document.body.classList.toggle('vh-phone-active',current==='phone');
      layer.classList.toggle('is-interactive',current==='phone');
      layer.setAttribute('aria-hidden',current==='phone'?'false':'true');
      if(current==='dossier')layer.setAttribute('inert','');
      else layer.removeAttribute('inert');
      open.setAttribute('aria-expanded',current==='phone'?'true':'false');
      (current==='phone'?back:open).focus({preventScroll:true});
    }
    function onEnd(e){
      if(e.target===layer&&e.propertyName==='transform')complete();
    }
    layer.addEventListener('transitionend',onEnd);
    // Ensure the transition starts from the existing composited position.
    void layer.offsetWidth;
    requestAnimationFrame(()=>{
      layer.style.transform=destination==='phone'?'translate3d(0,0,0)':'translate3d(100%,0,0)';
      if(ms===0){complete();return}
      fallback=setTimeout(complete,ms+200);
    });
  }

  open.addEventListener('click',()=>go('phone'));
  back.addEventListener('click',()=>go('dossier'));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&current==='phone'&&!transitioning)go('dossier');
  });
  // Preserve the iframe and its app state across every navigation.
  layer.setAttribute('inert','');
  layer.setAttribute('aria-hidden','true');
  open.setAttribute('aria-expanded','false');
})();
