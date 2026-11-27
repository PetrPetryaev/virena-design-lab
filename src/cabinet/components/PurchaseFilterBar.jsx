import React from 'react';
import CatalogToolbar from '../../CatalogToolbar.jsx';
import {SortMenu} from '../../ds/ActionDropdown.jsx';

const sortLabels={newest:'Сначала новые',oldest:'Сначала старые'};

export default function PurchaseFilterBar({Shared,db,chips,query,setQuery,sort,setSort,onReset,filterControl}){
  return <CatalogToolbar {...{Shared,db,chips,query,onReset}} onQueryChange={setQuery} searchLabel="Номер заказа или продукт" searchTriggerLabel="Поиск по заказам"
    actions={filterControl}
    sort={<SortMenu {...{Shared,db}} label={'Сортировка заказов: '+sortLabels[sort]} value={sortLabels[sort]} descending={sort==='newest'}
      items={Object.entries(sortLabels).map(([key,label])=>({label,onClick:()=>setSort(key)}))}/>}/>;
}
