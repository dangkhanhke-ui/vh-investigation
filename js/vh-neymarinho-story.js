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
  const Q1_KEY='vh.q1.r6.story-phase.v1';
  const q1Lines=Object.freeze([
    'Vậy chốt được một chuyện. Cauã không chết ở nơi lượng máu đầu tiên xuất hiện. Hắn còn sống, tự di chuyển về phía cửa rồi mới gục xuống.',
    'Điều đó làm vị trí thi thể bớt quan trọng hơn tao tưởng. Bây giờ tao muốn biết thứ gì thực sự giết hắn.'
  ]);
  function q1Phase(){try{return Math.max(0,Math.min(3,Number(localStorage.getItem(Q1_KEY))||0))}catch(_){return 0}}
  function setQ1Phase(n){try{localStorage.setItem(Q1_KEY,String(n))}catch(_){}}
  function q1Solved(){if(q1Phase()===0)setQ1Phase(1)}
  function q1Started(){if(q1Phase()===1)setQ1Phase(2)}
  function q1Finished(){if(q1Phase()===2)setQ1Phase(3)}
  function snapshot(){
    const at=Date.now();
    const history=lines.map((text,i)=>({who:'partner',text,at:at-(lines.length-i)*90000}));
    if(acknowledged())history.push({who:'me',text:'Ok anh',at});
    const q1=q1Phase();
    if(q1>=2)history.push({who:'partner',text:q1Lines[0],at:at-3000});
    if(q1>=3)history.push({who:'partner',text:q1Lines[1],at:at-1000});
    return {history,phase:acknowledged()?'done':'await',unread:!isRead()||(q1===1)};
  }
  window.VHNeymarinhoStory=Object.freeze({snapshot,acknowledged,acknowledge,isRead,markRead,notification:lines[lines.length-1],q1Phase,q1Solved,q1Started,q1Finished,q1Lines});
})();
