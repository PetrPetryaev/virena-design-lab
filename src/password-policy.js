export const passwordRules=[{id:'length',label:'8+ символов',test:v=>Array.from(v).length>=8},{id:'letter',label:'1 буква',test:v=>/\p{L}/u.test(v)},{id:'digit',label:'1 цифра',test:v=>/\d/.test(v)}];
export const passwordOK=v=>passwordRules.every(r=>r.test(v||''));
