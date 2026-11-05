import React from 'react';
export default function MemberPackage({pack,empty='Без пакета'}){
 const tone=({'ВИП':'vip','Супер ВИП':'super','Профи':'pro','Стандарт':'standard'})[pack]||'basic';
 return <span className={'genealogy-package package-'+tone}>{pack||empty}</span>;
}
