// UI and gameplay controller. Case content lives in js/case-data.js.
const $=id=>document.getElementById(id), defaultState=()=>({i:0,answer:null,phase:'solve',hint:{},chat:[{who:'partner',text:STAGES[0].intro,at:Date.now()}],unread:1,reports:[]});
let state;try{state=JSON.parse(localStorage.getItem('vh_v3_save'))||defaultState();if(!Number.isInteger(state.i)||state.i<0||state.i>=Q.length)state=defaultState()}catch{state=defaultState()}
let typing=false,timer=null,matchingLeft=null,shownOrder=null;const save=()=>{try{localStorage.setItem('vh_v3_save',JSON.stringify(state))}catch{}};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cur=()=>Q[state.i];const currStage=()=>cur().stage;
