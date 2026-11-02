export const passwordRules=[{id:'length',label:'Не меньше 8 символов',test:v=>Array.from(v).length>=8},{id:'letter',label:'Хотя бы одна буква',test:v=>/\p{L}/u.test(v)},{id:'digit',label:'Хотя бы одна цифра',test:v=>/\d/.test(v)}];
export const passwordOK=v=>passwordRules.every(r=>r.test(v||''));
