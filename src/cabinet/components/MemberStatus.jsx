import React from 'react';
export const memberStates={partner:'Активен',grace:'Льготное окно',frozen:'Заморожен',client:'Клиент',deactivated:'Деактивирован'};
export default function MemberStatus({state,Shared}){
 return <Shared.Status tone={state==='partner'?'Success':state==='grace'?'Info':'Neutral'} label={memberStates[state]||'Неизвестно'}/>;
}
