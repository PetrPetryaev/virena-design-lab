import React from 'react';
import {FilterChips} from './ds/FilterControls.jsx';
import './catalog-toolbar.css';
import ExpandingSearch from './ExpandingSearch.jsx';
import {SegmentedTabs} from './AuthPrimitives.jsx';

export default function CatalogToolbar({Shared,db,items,value,onChange,label,idPrefix,panelId,query,onQueryChange,searchLabel,searchTriggerLabel,actions,sort,leading,trailing,chips=[],onReset}){
  return <div className="catalog-toolbar-block">
    <div className="store-toolbar shared-catalog-toolbar">
      {leading}
      {items&&<SegmentedTabs className="store-category-tabs" {...{items,value,onChange,label,idPrefix,panelId}}/>}
      <div className="catalog-toolbar-actions">
        {actions&&<div className="catalog-toolbar-filters">{actions}</div>}
        {sort}
        {searchLabel&&<ExpandingSearch {...{Shared,db}} value={query} onChange={onQueryChange} label={searchLabel} triggerLabel={searchTriggerLabel}/>}
        {trailing}
      </div>
    </div>
    <FilterChips {...{Shared,db,chips,onReset}}/>
  </div>;
}
