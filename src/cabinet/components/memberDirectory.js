import {genealogyCells} from './genealogyData.js';
import {invitationFixtures} from './invitationsData.js';
// One demo record per login across the structure and sponsor views.
// Unpaid registrations belong only to Invitations until they receive a tree path.
const byLogin=new Map(invitationFixtures.map(c=>[c.login,c]));
export const directoryCells=[...genealogyCells.map(c=>({...c,...byLogin.get(c.login)})),...invitationFixtures.filter(c=>c.path&&!genealogyCells.some(g=>g.login===c.login))];
export const memberRecord=cell=>({...directoryCells.find(c=>c.login===cell.login),...cell});
export const registeredLabel=cell=>cell.registered?new Date(cell.registered+'T12:00:00+03:00').toLocaleDateString('ru-RU',{timeZone:'Europe/Moscow'}):'—';
export const lastLoginLabel=cell=>cell.personal?(cell.loginDays===0?'Сегодня':cell.lastLogin==='Не входил'?'Не входил':cell.loginDays!==undefined?`Вход ${cell.loginDays} дн. назад`:'Не указан'):'Доступно спонсору';
