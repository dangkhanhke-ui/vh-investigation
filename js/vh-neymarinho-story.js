/* VH narrative data only. No DOM manipulation, phone styling or network calls. */
(()=>{
  'use strict';
  const KEY='vh.neymarinho.intro-replied.v1';
  const lines=Object.freeze([
    'Hey.',
    'Anh mới có số mày',
    'Từ giờ anh sẽ liên lạc với mày qua đây nhé',
    'Có thêm thông tin gì thì anh sẽ gửi'
  ]);
  function acknowledged(){
    try{return localStorage.getItem(KEY)==='yes'}catch(_){return false}
  }
  function acknowledge(){
    try{localStorage.setItem(KEY,'yes')}catch(_){}
  }
  const READ_KEY='vh.neymarinho.thread-read.v1';
  function isRead(){try{return localStorage.getItem(READ_KEY)==='yes'}catch(_){return false}}
  function markRead(){try{localStorage.setItem(READ_KEY,'yes')}catch(_){}}
  function snapshot(){
    const at=Date.now();
    const history=lines.map((text,i)=>({who:'partner',text,at:at-(lines.length-i)*90000}));
    if(acknowledged())history.push({who:'me',text:'Ok anh',at});
    return {history,phase:acknowledged()?'done':'await',unread:!isRead()};
  }
  window.VHNeymarinhoStory=Object.freeze({snapshot,acknowledged,acknowledge,isRead,markRead,notification:lines[lines.length-1]});
})();
