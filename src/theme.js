// Snapshot compatibility: map neutral paints by their role, preserving artwork and on-accent white.
export function themePaint(p,role='surface'){
 if(!p?.color)return 'transparent';
 const {r,g,b}=p.color,a=p.opacity??p.color.a??1;
 const raw=`rgba(${r*255},${g*255},${b*255},${a})`;
 const neutral=Math.max(r,g,b)-Math.min(r,g,b)<.07,mean=(r+g+b)/3;
 let token;
 if(neutral){
  if(role==='ink')token=mean>.93?null:mean<.32?'ink':'muted';
  else if(role==='line')token='line';
  else token=mean>.98?'surface':mean>.90?'soft':mean>.72?'selected':mean<.32?null:'muted';
 }else if(r>.9&&g>.8&&b>.8)token='error-surface';
 if(role==='ink'&&r>.5&&r>g*1.8&&r>b*1.4)token='error';
 if(role==='ink'&&g>r*1.4&&g>b*1.15)token='success';
 if(!token)return raw;
 return `color-mix(in srgb, var(--snapshot-${token}, ${raw}) ${a*100}%, transparent)`;
}
