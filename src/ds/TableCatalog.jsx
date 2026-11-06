import React,{useState} from 'react';
import MemberTable from '../cabinet/components/MemberTable.jsx';
import {directoryCells} from '../cabinet/components/memberDirectory.js';
import '../cabinet/components/genealogy.css';
export default function TableCatalog({Shared,db}){
 const [sort,setSort]=useState(''),[direction,setDirection]=useState('desc'),[selected,setSelected]=useState(''),[loading,setLoading]=useState(false);
 const rows=[...directoryCells.slice(1,5)].sort((a,b)=>sort==='name'?(direction==='desc'?-1:1)*(a.personal&&a.name?a.name:a.login).localeCompare(b.personal&&b.name?b.name:b.login,'ru'):sort==='pack'?(direction==='desc'?-1:1)*String(a.pack||'').localeCompare(String(b.pack||''),'ru'):0);
 return <section className="genealogy"><h1>Virena / Data table</h1><p>Заголовок 72 px · 16 px / 700. Строка 88 px. Разделитель с отступами 24 px. Активная сортировка и подсказка при наведении.</p><div className="toolbar"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Soft',Size:'40'}} label={loading?'Показать данные':'Показать загрузку'} onClick={()=>setLoading(!loading)}/></div><MemberTable {...{Shared,rows,direction,loading}} sortKeys={{pack:'pack'}} sortKey={sort} onSort={key=>{setDirection(sort===key&&direction==='desc'?'asc':'desc');setSort(key);}} onOpen={c=>setSelected(c.login)} renderAction={c=><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'40'}} ariaLabel={'Открыть '+c.login} iconContent={<Shared.Icon name="Virena / Icon / More"/>} onClick={e=>{e.stopPropagation();setSelected(c.login);}}/>}/><p role="status">{selected?'Выбран '+selected:'Тот же компонент используется в участниках и приглашениях.'}</p></section>;
}
