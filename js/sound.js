/* VH unified sound engine: decoded buffers for reliable short effects, HTMLAudio fallback. */
(()=>{'use strict';
const SOURCES={keyboard:'assetssoundskeyboard-typing.mp3',notification:'message-notification.mp3',loading:'data-loading.mp3',click:'ui-click.mp3',pageTurn:'assets/page-turn.mp3'};
const volumes={keyboard:.8,notification:.9,loading:1,click:.55,pageTurn:.85};
const MASTER_BOOST=2; // all unified effects: double amplitude; audio element fallback is capped at 1.
let enabled=true;try{enabled=localStorage.getItem('vh_sound_enabled')!=='false'}catch(_){}
const C=window.AudioContext||window.webkitAudioContext;
let context=null;const buffers={},fetches={},loops={},fallbacks={},activeFallbackLoops={};
let lastClick=0;let gestureReady=false;const wantedLoops=new Set();
function ctx(){if(!C)return null;if(!context){try{context=new C()}catch(_){return null}}return context}
function load(name){if(fetches[name])return fetches[name];const c=ctx();if(!c)return Promise.resolve(null);return fetches[name]=fetch(SOURCES[name]).then(r=>{if(!r.ok)throw Error('Audio HTTP '+r.status);return r.arrayBuffer()}).then(a=>c.decodeAudioData(a)).then(b=>buffers[name]=b).catch(e=>{console.warn('[VH audio] decode failed',name,e);return null})}
function resume(){const c=ctx();if(c&&c.state==='suspended')return c.resume().catch(e=>console.warn('[VH audio] resume blocked',e));return Promise.resolve()}
function fallback(name,loop=false){let a=fallbacks[name];if(!a){a=new Audio(SOURCES[name]);a.preload='auto';a.volume=Math.min(1,volumes[name]*MASTER_BOOST);fallbacks[name]=a}a.loop=loop;return a}
function htmlPlay(name,loop=false){const a=fallback(name,loop);if(!loop){try{a.pause();a.currentTime=0}catch(_){}}const p=a.play();p?.catch?.(e=>console.warn('[VH audio] HTML playback blocked',name,e));return a}
function webPlay(name,loop=false){const c=ctx(),b=buffers[name];if(!c||!b||c.state!=='running')return null;try{const source=c.createBufferSource(),gain=c.createGain();source.buffer=b;source.loop=loop;gain.gain.value=(name==='loading'?2.2:volumes[name])*MASTER_BOOST;source.connect(gain);gain.connect(c.destination);let offset=0;if(name==='click'){const data=b.getChannelData(0),limit=Math.min(data.length,Math.floor(b.sampleRate*.25));let i=0;while(i<limit&&Math.abs(data[i])<.012)i++;offset=Math.max(0,i/b.sampleRate-.003)}source.start(0,offset);return source}catch(e){console.warn('[VH audio] WebAudio failed',name,e);return null}}
function play(name){if(!enabled||document.hidden||!SOURCES[name])return;if(name==='keyboard'||name==='loading'){start(name);return}if(name==='click'){const t=performance.now();if(t-lastClick<55)return;lastClick=t}resume();if(!webPlay(name))htmlPlay(name);load(name)}
function start(name){if(!enabled||!['keyboard','loading'].includes(name))return;wantedLoops.add(name);if(loops[name]||activeFallbackLoops[name])return;resume();const node=webPlay(name,true);if(node){loops[name]=node}else if(gestureReady){activeFallbackLoops[name]=htmlPlay(name,true)}load(name).then(()=>{if(wantedLoops.has(name)&&!loops[name]&&!activeFallbackLoops[name]&&ctx()?.state==='running'){loops[name]=webPlay(name,true)}})}
function stop(name){if(!['keyboard','loading'].includes(name))return;wantedLoops.delete(name);if(loops[name]){try{loops[name].stop()}catch(_){}delete loops[name]}if(activeFallbackLoops[name]){const a=activeFallbackLoops[name];a.pause();try{a.currentTime=0}catch(_){}delete activeFallbackLoops[name]}}
// Prioritize the two intro sounds; defer nonessential decoding to actual use.
function readyIntro(){return Promise.allSettled(['notification','keyboard'].map(load))}
function prepare(){resume();readyIntro()}
function setEnabled(v){enabled=!!v;try{localStorage.setItem('vh_sound_enabled',String(enabled))}catch(_){}if(!enabled){gestureReady=false;stop('keyboard');stop('loading');Object.values(fallbacks).forEach(a=>a.pause())}else prepare();document.dispatchEvent(new CustomEvent('vh:sound-setting',{detail:{enabled}}));return enabled}
window.VHSound={play,start,stop,prepare,readyIntro,isEnabled:()=>enabled,setEnabled};
window.VHKeyboardAudio={prepare,start:()=>start('keyboard'),stop:()=>stop('keyboard')};
function gesture(e){if(!enabled)return;gestureReady=true;resume().then(()=>{for(const name of wantedLoops){if(!loops[name]&&!activeFallbackLoops[name]){const node=webPlay(name,true);if(node)loops[name]=node;else activeFallbackLoops[name]=htmlPlay(name,true)}}});if(e.type==='pointerdown'||e.type==='keydown'){const t=e.target;const button=t?.closest?.('button:not(:disabled),[role="button"],a[href]');if(button&&!t?.closest?.('.vh-stage-card')&&!(e.type==='keydown'&&!['Enter',' '].includes(e.key)))play('click')}for(const name of ['keyboard','loading']){const a=activeFallbackLoops[name];if(a&&a.paused){a.play().catch(()=>{})}}}
document.addEventListener('pointerdown',gesture,true);
document.addEventListener('keydown',gesture,true);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop('keyboard');stop('loading')}else resume()});
function init(){
 document.getElementById('soundToggle')?.remove();
 // Decode the opening sounds first. Click/other effects load on first use.
 readyIntro();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();