import React,{useState} from 'react';
import navigation from './assets/navigation/sources.json';
import directory from './assets/directory-icons/sources.json';
import tree from './assets/tree-icons/sources.json';
const assets=import.meta.glob('./assets/{navigation,directory-icons,tree-icons}/*.svg',{eager:true,query:'?raw',import:'default'});
const byName=new Map();
const metadata=new Map([...navigation.icons,...Object.entries(directory.icons).map(([name,id])=>({name,id})),...tree.icons].map(i=>[(i.asset||i.name+'.svg').replace('.svg',''),i]));
for(const [path,svg] of Object.entries(assets)){
 const assetName=path.split('/').at(-1).replace('.svg',''),meta=metadata.get(assetName);
 const name=meta?.name||assetName;
 // Keep a visible entry even when provenance still needs to be completed.
 byName.set(name,{name,id:meta?.id,svg,fileKey:navigation.fileKey});
}
export const currentIcons=[...byName.values()].sort((a,b)=>a.name.localeCompare(b.name));
export default function IconCatalog(){
 const [query,setQuery]=useState('');const filtered=currentIcons.filter(i=>i.name.includes(query.trim().toLowerCase()));
 return <><h1>Иконки Solar</h1><p>Экспорты из пака Virena – DS. Одинаковые имена объединены. Название открывает исходный узел Figma.</p><input className="catalog-icon-search" aria-label="Найти иконку" placeholder="Например, cart или wallet" value={query} onChange={e=>setQuery(e.target.value)}/><div className="grid icon-grid current-icon-grid">{filtered.map(i=><section key={i.name}><a href={i.id?`https://www.figma.com/design/${i.fileKey}?node-id=${i.id.replace(':','-')}`:undefined} target={i.id?"_blank":undefined} rel="noreferrer" title={i.id?undefined:"Локальный экспорт: источник уточняется"}>{i.name}</a><div className="sample"><span className="demo-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:i.svg.replaceAll('"black"','"currentColor"')}}/></div><small>24 × 24</small></section>)}</div>{!filtered.length&&<p role="status">Иконки не найдены</p>}</>;
}
