export const avatarPalette={
 Neutral:{background:'#e8e8e5',foreground:'#393b39'},
 Blue:{background:'#c5defa',foreground:'#183f71'},
 Teal:{background:'#a8e8df',foreground:'#124d49'},
 Pink:{background:'#ffc3d7',foreground:'#732340'},
 Lilac:{background:'#dfcef7',foreground:'#503174'},
 Amber:{background:'#ffe4a0',foreground:'#674316'},
};
export function avatarTone(identity){
 let hash=2166136261;
 for(const char of String(identity)){hash=Math.imul(hash^char.codePointAt(0),16777619);}
 return ['Blue','Teal','Pink','Lilac','Amber'][(hash>>>0)%5];
}
