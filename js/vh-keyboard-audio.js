/* Real keyboard recording from the uploaded Pixabay MP3. */
(()=>{'use strict';
const URL='assetssoundskeyboard-typing.mp3';
let audio=null,shouldPlay=false;
function prepare(){if(!audio){audio=new Audio(URL);audio.preload='auto';audio.loop=true;audio.volume=.85;audio.load()}}
function unlock(){prepare();if(audio&&audio.paused){const p=audio.play();if(p&&p.then)p.then(()=>{if(!shouldPlay)audio.pause()}).catch(()=>{})}}
function start(){shouldPlay=true;prepare();if(audio){audio.currentTime=0;audio.play().catch(()=>{})}}
function stop(){shouldPlay=false;if(audio){audio.pause();audio.currentTime=0}}
document.addEventListener('pointerdown',()=>{prepare();if(shouldPlay)unlock()},{passive:true,capture:true});
document.addEventListener('keydown',()=>{prepare();if(shouldPlay)unlock()},true);
window.VHKeyboardAudio={prepare,start,stop};
})();
