// Future chapter dialogue content. No scenes are activated until explicitly wired.
window.VH_DIALOGUES = window.VH_DIALOGUES || {};
window.VH_DIALOGUES.chapter01 = {
  start: {
    id: 'start', speaker: 'investigator',
    text: 'Tôi vừa xem lại một tài liệu. Anh muốn bắt đầu từ đâu?',
    choices: [
      { id: 'money', text: 'Kiểm tra dòng tiền.', next: 'money', effects: { flags: ['asked_about_money'] } },
      { id: 'timeline', text: 'Kiểm tra mốc thời gian.', next: 'timeline' }
    ]
  },
  money: { id: 'money', speaker: 'investigator', text: 'Hãy đối chiếu các giao dịch với tin nhắn.', next: 'end' },
  timeline: { id: 'timeline', speaker: 'investigator', text: 'Hãy kiểm tra thời điểm của từng cuộc gặp.', next: 'end' },
  end: { id: 'end', speaker: 'investigator', text: 'Chúng ta sẽ tiếp tục khi có thêm chứng cứ.' }
};
