export const profileTabs=[
 {id:'personal',label:'Личные данные'},
 {id:'contacts',label:'Контакты',attention:true},
 {id:'security',label:'Безопасность'},
 {id:'requisites',label:'Реквизиты'},
 {id:'successor',label:'Преемник',attention:true},
 {id:'settings',label:'Настройки'},
];

export const profileInitialData={
 personal:{partnerId:'VR-100024',firstName:'Александра',lastName:'Соколова',birthDate:'14.05.1992',login:'alexandra92',country:'Россия',city:'Москва',region:'Московская область',address:'ул. Тверская, 12, кв. 8',postalCode:'125009'},
 contacts:{email:'alexandra@example.com',emailVerified:true,phone:'+7 999 123-45-67',phoneVerified:false,messenger:'Telegram',messengerContact:'@alexandra_demo',samePhone:false,companyTelegram:'',website:'',telegramChannel:'',instagram:'',facebook:'',youtube:'',tiktok:'',vkontakte:''},
 security:{financialPasswordSet:false},
 requisites:{items:[]},
 successor:{person:null},
 settings:{language:'Русский',timezone:'Москва, UTC+3',theme:'Как в системе',hideRewards:false,hideContacts:false,emailNews:true,emailOffers:false,emailPartners:true},
};

// Local-only demo fixtures. Account information is masked; these are not payment details.
export const profileDemoRequisites={items:[{
 recipient:'Александра Соколова',recipientType:'Физлицо',bank:'Демо Банк',masked:'•••• 4821',primary:true,activating:false,
}]};
export const profileDemoSuccessor={person:{
 name:'Александр Соколов',relationship:'Брат / сестра',otherRelationship:'',birthDate:'',phone:'+7 900 000-00-00',email:'successor.demo@example.com',added:'04.11.2026',
}};

export const profileCountries=['Россия','Казахстан','Германия','США','Армения','Грузия'];
export const relationshipOptions=['Супруг(а)','Сын / дочь','Отец / мать','Брат / сестра','Другое'];
