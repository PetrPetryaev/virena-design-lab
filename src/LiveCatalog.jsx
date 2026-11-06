import React from 'react';
import ApplicationCatalog from './ApplicationCatalog.jsx';
// Compatibility with captured Figma family names; renders the same React components as the cabinet.
export const liveFamilies=['Members','Boris / Member row','Boris / Product card','Boris / Catalogue'];
export function LiveCatalog({group,Shared,db}){
 const name=['Members','Boris / Member row'].includes(group.name)?'Virena / Member row':'Virena / Product card';
 return <ApplicationCatalog name={name} Shared={Shared} db={db} embedded/>;
}
