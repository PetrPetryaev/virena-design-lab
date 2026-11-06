import React from 'react';
/** One reset action for directory, finance, orders and catalog toolbars. */
export default function ToolbarReset({Shared,db,active,onClick}){
 return active?<Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'AccentSoft',Size:'48'}} label="Сбросить" ariaLabel="Сбросить фильтры" onClick={onClick}/>:null;
}
