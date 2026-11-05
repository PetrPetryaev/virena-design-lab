import React from 'react';
import ExpandingSearch from './ExpandingSearch.jsx';
import {SegmentedTabs} from './AuthPrimitives.jsx';
// One composition for catalogue and directory: same tabs, search and layout.
export default function CatalogToolbar({Shared,items,value,onChange,label,idPrefix,panelId,query,onQueryChange,searchLabel,actions,leading,db,expandSearch=false,trailing}){
 return <div className="store-toolbar shared-catalog-toolbar">{leading}{items&&<SegmentedTabs className="store-category-tabs" items={items} value={value} onChange={onChange} label={label} idPrefix={idPrefix} panelId={panelId}/>}<div className="catalog-toolbar-actions">{actions}{expandSearch?<ExpandingSearch Shared={Shared} db={db} value={query} onChange={onQueryChange} label={searchLabel}/>:<label className="store-search"><span className="store-search-symbol" aria-hidden="true"><Shared.Icon name="Serach"/></span><input type="search" aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={e=>onQueryChange(e.target.value)}/></label>}{trailing}</div></div>;
}
