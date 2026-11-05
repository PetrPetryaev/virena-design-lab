import React,{useState} from 'react';
import TableCatalog from '../../ds/TableCatalog.jsx';
import {OverviewCards} from './Overview.jsx';
export const cardFamilies=['Virena / Data table','Virena / Media card','Virena / Banner card','Virena / Profile card','Virena / Sponsor card'];
const assets=import.meta.glob('../../assets/navigation/*.svg',{eager:true,query:'?url',import:'default'});
export default function CardCatalog({name,Shared,db}){
 const options=name.includes('Media')?[['product','Продукты'],['partner','Партнёрство']]:name.includes('Banner')?[['package','Пакет'],['notice','Срок активности']]:[[name.includes('Profile')?'profile':'sponsor',name.includes('Profile')?'Профиль':'Спонсор']];
 const [variant,setVariant]=useState(options[0][0]),[surface,setSurface]=useState('white'),[state,setState]=useState('ready'),[message,setMessage]=useState('');
 const identity=['profile','sponsor'].includes(variant);
 const icon=name=>{const url=assets['../../assets/navigation/'+name+'-linear.svg'];return url?<span className="cab-solar-icon" aria-hidden="true" style={{maskImage:`url("${url}")`,WebkitMaskImage:`url("${url}")`}}/>:<Shared.Icon name={name}/>;};
 if(name==='Virena / Data table')return <TableCatalog Shared={Shared} db={db}/>;
 return <><h1>{name}</h1><div className="playground"><div className="preview"><div className="card-demo-stage overview overview-comparison"><OverviewCards {...{Shared,db,icon,surface}} loading={state==='loading'} only={variant} profile={state} sponsor={state} retry={()=>setState('ready')} navigate={(page,intent)=>setMessage(`Демо-переход: ${page}${intent?' · '+intent:''}`)}/></div><p className="card-demo-status" role="status">{message||'Общий компонент с экрана «Обзор». Наведите на карточку или нажмите кнопку.'}</p></div><div className="controls"><strong>Настройки</strong><label>Содержимое<select aria-label="Содержимое" value={variant} onChange={e=>{setVariant(e.target.value);setMessage('');}}>{options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Фон<select aria-label="Фон" value={surface} onChange={e=>setSurface(e.target.value)}><option value="white">Белый / основной</option><option value="soft">Серый / мягкий</option></select></label><label>Состояние<select aria-label="Состояние" value={state} onChange={e=>setState(e.target.value)}><option value="ready">Готово</option><option value="loading">Загрузка</option>{identity&&<option value="error">Ошибка</option>}</select></label><small>Цвета адаптируются к теме. Данные демонстрационные.</small></div></div></>;
}
