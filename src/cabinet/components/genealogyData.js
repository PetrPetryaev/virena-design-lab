import demoPortraits from '../../assets/networking-avatars.png';
// Local fixtures, not API data. No real participant records or contacts.
export const dataAsOf = '04.11.2026, 10:00 МСК';
const cell = (path, login, name, state, pack, rank, steps, points, counts, personal = false) => ({path, login, name, state, pack, rank, steps, points, counts, personal});
export const genealogyCells = [
 cell('', 'alexandra92', 'Александра Петрова', 'partner', 'ВИП', 3, 12, [9332.75, 4200], [6, 5], true),
 cell('L', 'anna_m', 'Анна Морозова', 'partner', 'Профи', 2, 6, [2400, 1200], [3, 2], true),
 cell('R', 'mikhail_k', 'Михаил Ковалёв', 'partner', 'Стандарт', 1, 3, [980, 860], [2, 2], true),
 cell('LL', 'team_north', 'Дмитрий Северный', 'grace', 'ВИП', 2, 5, [600, 400], [2, 0]),
 cell('LR', 'elena_s', 'Елена Соколова', 'partner', null, 0, 0, [null, null], [1, 0], true),
 cell('RL', 'team_east', '', 'frozen', 'Начальный', 0, 1, [0, 0], [1, 0]),
 cell('RR', 'team_south', '', 'partner', 'Супер ВИП', 1, 4, [300, 0], [0, 1]),
 cell('LLL', 'andrey_v', 'Андрей Волков', 'partner', 'Стандарт', 0, 0, [0, 0], [1, 0], true),
 cell('LRL', 'client_olga', '', 'client', null, 0, 0, [null, null], [0, 0]),
 cell('RLL', 'team_west', '', 'deactivated', null, 0, 0, [null, null], [0, 0]),
 cell('RRR', 'sergey_p', 'Сергей Попов', 'partner', 'Начальный', 0, 0, [0, 0], [0, 0], true),
 cell('LLLL', 'marina_k', 'Марина Крылова', 'partner', 'Профи', 0, 0, [0, 0], [0, 0], true),
];
export const formatPoints = n => n === null ? '—' : n.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
export const activityLabel = c => ({partner: 'Активна до 02.03.2027', grace: 'Льготное окно до 12.11', frozen: 'Заморожен с 01.11.2026', client: 'Клиент', deactivated: 'Неактивна с 01.10.2026'})[c.state];
export const legLabel = path => !path ? 'Ваша ячейка' : path[0] === 'L' ? 'Левая нога' : 'Правая нога';
export function outermost(side,cells=genealogyCells) {return cells.filter(c => c.path && [...c.path].every(s => s === side)).sort((a,b) => b.path.length - a.path.length)[0]||cells[0];}

// Stage 2 fixtures. Sponsor links are explicit; a binary parent is not a sponsor.
const sponsors = {
 '': {login:'Компания Virena', isCompany:true},
 L: {login:'alexandra92', path:''}, R: {login:'alexandra92', path:''},
 LL: {login:'anna_m', path:'L'}, LR: {login:'alexandra92', path:''},
 RL: {login:'external_sponsor'}, RR: {login:'Компания Virena', isCompany:true},
 LLL: {login:'alexandra92', path:''}, LRL: {login:'anna_m', path:'L'},
 RLL: {login:'external_sponsor'}, RRR: {login:'alexandra92', path:''},
 LLLL: {login:'alexandra92', path:''},
};
// Project the permitted response before rendering. Backend must enforce this too.
export function participantDetails(cell) {
 const own=cell.path==='';
 const sponsor=cell.sponsor||sponsors[cell.path];
 const canSeeContacts=!own && cell.personal && sponsor?.path==='';
 const canSeePersonal=own || canSeeContacts;
 return {
  ...cell, name:canSeePersonal?cell.name:'', personal:canSeeContacts, own,
  sponsor, registeredAt:cell.state==='deactivated'?'14.09.2026':'14.10.2026', placedAt:cell.state==='deactivated'?'15.09.2026':'15.10.2026',
  location:canSeePersonal?'Россия, Москва':null,
  contacts:canSeeContacts?{email:`${cell.login}@example.com`,phone:null,messenger:null,language:'Русский',birthday:'02.10'}:null,
 };
}

// CSS viewports into the existing synthetic portrait sheet; no new generation.
genealogyCells.find(c=>c.path==='L').photo={src:demoPortraits,size:'711.11% 533.33%',position:'79.09% 20.51%'};
genealogyCells.find(c=>c.path==='R').photo={src:demoPortraits,size:'581.82% 436.36%',position:'57.55% 79.73%'};
