/* VH sound effects: one central controller for uploaded audio assets. */
(()=>{'use strict';
const SOURCES={keyboard:'assetssoundskeyboard-typing.mp3',notification:'message-notification.mp3',loading:'data-loading.mp3',click:'ui-click.mp3'};
const pools={};let keyboard=null,loading=null,lastClick=0;const requestedLoops=new Set();
let clickContext=null,clickBuffer=null,clickOffset=0,clickLoading=null;
function primeClick(){if(clickLoading)return clickLoading;const C=window.AudioContext||window.webkitAudioContext;if(!C)return Promise.resolve();try{clickContext=new C();clickLoading=fetch(SOURCES.click).then(r=>{if(!r.ok)throw Error('click fetch');return r.arrayBuffer()}).then(b=>clickContext.decodeAudioData(b)).then(b=>{clickBuffer=b;const data=b.getChannelData(0);let i=0;const limit=Math.min(data.length,Math.floor(b.sampleRate*.25));while(i<limit&&Math.abs(data[i])<.012)i++;clickOffset=Math.max(0,i/b.sampleRate-.003);return b}).catch(()=>null)}catch(_){clickLoading=Promise.resolve()}return clickLoading}
function playClick(){if(!clickContext||!clickBuffer)return false;try{if(clickContext.state==='suspended'){clickContext.resume().catch(()=>{});return false;}const source=clickContext.createBufferSource(),gain=clickContext.createGain();source.buffer=clickBuffer;gain.gain.value=.55;source.connect(gain).connect(clickContext.destination);source.start(0,clickOffset);return true}catch(_){return false}}
let enabled=true;try{enabled=localStorage.getItem('vh_sound_enabled')!=='false'}catch(_){}
function make(name,loop=false){const a=new Audio(SOURCES[name]);a.preload='auto';a.loop=loop;a.volume=name==='keyboard'?.8:name==='loading'?.55:name==='notification'?.9:.55;return a}
function getLoop(name){if(name==='keyboard')return keyboard||(keyboard=make(name,true));return loading||(loading=make(name,true))}
function start(name){if(!enabled||!SOURCES[name])return;if(name!=='keyboard'&&name!=='loading'){play(name);return}requestedLoops.add(name);const a=getLoop(name);if(!a.paused)return;a.currentTime=0;const p=a.play();if(p?.catch)p.catch(()=>{})}
function stop(name){if(name!=='keyboard'&&name!=='loading')return;requestedLoops.delete(name);const a=name==='keyboard'?keyboard:loading;if(a){a.pause();try{a.currentTime=0}catch(_){}}}
function play(name){if(!enabled||document.hidden||!SOURCES[name])return;if(name==='keyboard'||name==='loading'){start(name);return}if(name==='click'){const now=performance.now();if(now-lastClick<65)return;lastClick=now;primeClick();if(playClick())return}
let pool=pools[name];if(!pool)pool=pools[name]=[];let a=pool.find(x=>x.paused||x.ended);if(!a){a=make(name);if(pool.length<5)pool.push(a);else{a=pool.shift();a.pause();pool.push(a)}}try{a.currentTime=0}catch(_){}const p=a.play();if(p?.catch)p.catch(()=>{})}
function setEnabled(value){enabled=!!value;try{localStorage.setItem('vh_sound_enabled',String(enabled))}catch(_){}if(!enabled){gestureUnlocked=false;stop('keyboard');stop('loading');Object.values(pools).flat().forEach(a=>{a.pause();try{a.currentTime=0}catch(_){}})}document.dispatchEvent(new CustomEvent('vh:sound-setting',{detail:{enabled}}));return enabled}
function unlock(){primeClick();if(clickContext?.state==='suspended')clickContext.resume().catch(()=>{});for(const name of ['keyboard','loading']){const a=getLoop(name);a.load()}for(const name of ['click','notification']){if(!pools[name])pools[name]=[make(name)]}}
window.VHSound={play,start,stop,prepare:unlock,isEnabled:()=>enabled,setEnabled};
window.VHKeyboardAudio={prepare:unlock,start:()=>start('keyboard'),stop:()=>stop('keyboard')};
document.addEventListener('pointerdown',e=>{unlockAudioGesture();const b=e.target.closest('button,[role="button"],a[href]');if(b&&!(b.disabled||b.id==='soundToggle'))play('click')},true);
document.addEventListener('keydown',e=>{unlockAudioGesture();if((e.key==='Enter'||e.key===' ')&&e.target.closest('button:not(:disabled),[role="button"],a[href]'))play('click')},true);
let gestureUnlocked=false;function unlockAudioGesture(){if(!enabled)return;if(clickContext?.state==='suspended')clickContext.resume().catch(()=>{});if(!gestureUnlocked){gestureUnlocked=true;unlock()}for(const name of requestedLoops){const a=getLoop(name);if(a.paused){const p=a.play();if(p?.catch)p.catch(()=>{})}}}
function init(){document.getElementById('soundToggle')?.remove();primeClick()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();