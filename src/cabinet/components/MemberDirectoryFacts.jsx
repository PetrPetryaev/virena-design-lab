import React from 'react';
import {registeredLabel,lastLoginLabel} from './memberDirectory.js';
import {money} from './invitationsData.js';
export function MemberRegistration({cell}){return <div className="member-directory-facts"><span>{registeredLabel(cell)}</span><small>{lastLoginLabel(cell)}</small></div>;}
export function MemberTeam({cell,canSeeIncome=true}){return <div className="member-directory-facts"><span>{cell.personal&&cell.invited!==undefined?`Пригласил: ${cell.invited}`:`В команде: ${(cell.counts||[]).reduce((a,b)=>a+b,0)}`}</span><small>{canSeeIncome&&cell.personal&&cell.vzr!==undefined?`Ваш ВЗР: ${money(cell.vzr)}`:canSeeIncome?'ВЗР доступен спонсору':'ВЗР недоступен'}</small></div>;}
