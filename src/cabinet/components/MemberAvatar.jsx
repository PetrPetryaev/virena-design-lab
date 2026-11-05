import React from 'react';
export default function MemberAvatar({cell,photo,Shared,size=40}){
 const name=cell.personal?cell.name:'',initials=name?name.split(' ').map(n=>n[0]).slice(0,2).join(''):cell.login.slice(0,2).toUpperCase();
 return <Shared.Avatar initials={initials} photo={photo} size={size} identity={cell.id??cell.login}/>;
}
