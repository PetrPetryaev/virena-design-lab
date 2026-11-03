// Preview fixtures, not backend/account state. Seven variants from TES-398.
export const memberStates = {
 newcomer: {label:'Новичок',status:'Зарегистрирован'},
 client: {label:'Клиент',status:'Клиент'},
 'partner-no-package': {label:'Партнёр без пакета',status:'Партнёр',partner:true},
 partner: {label:'Партнёр с пакетом',status:'Партнёр',partner:true,package:'Стандарт'},
 grace: {label:'Льготное окно',status:'Льготное окно',partner:true,package:'Стандарт'},
 frozen: {label:'Заморозка',status:'Заморожен',partner:true,package:'Стандарт',locked:true},
 deactivated: {label:'Деактивация',status:'Клиент',deactivated:true},
};
export const normalizeMember = value => Object.hasOwn(memberStates,value) ? value : 'newcomer';
