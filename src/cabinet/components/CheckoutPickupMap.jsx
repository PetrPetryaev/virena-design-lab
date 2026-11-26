import React,{useEffect,useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const center=[55.781674,37.634944];

export default function PickupMap({options,selected,onSelect}){
 const container=useRef(null),map=useRef(null),choose=useRef(onSelect),focused=useRef(null);
 choose.current=onSelect;
 useEffect(()=>{
  const instance=L.map(container.current,{scrollWheelZoom:false,attributionControl:true}).setView(center,14);
  map.current=instance;
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
   maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(instance);
  const resize=new ResizeObserver(()=>instance.invalidateSize({pan:false}));
  resize.observe(container.current);
  return()=>{resize.disconnect();instance.remove();map.current=null;};
 },[]);
 useEffect(()=>{
  const markers=L.layerGroup().addTo(map.current),elements=new Map();
  for(const item of options){
   if(!item.point)continue;
   const enabled=item.value===selected;
   const icon=L.divIcon({className:'checkout-map-marker'+(enabled?' is-selected':''),iconSize:[32,32],iconAnchor:[16,16]});
   const marker=L.marker(item.point,{icon,title:item.label,autoPanOnFocus:false}).addTo(markers);
   const element=marker.getElement();
   L.DomEvent.disableClickPropagation(element);
   element?.setAttribute('aria-label',item.label+' — ориентир');
   element?.setAttribute('aria-pressed',String(enabled));
   const activate=event=>{
    event.stopPropagation();
    event.preventDefault();
    choose.current(item.value);
   };
   element?.addEventListener('click',activate);
   element?.addEventListener('keydown',event=>{
    if(event.key===' '||event.key==='Enter')activate(event);
   });
   if(focused.current===item.value)element?.focus({preventScroll:true});
   elements.set(element,item.value);
  }
  return()=>{focused.current=elements.get(document.activeElement);markers.remove();};
 },[options,selected]);
 return <div className="checkout-pickup-map">
  <div className="checkout-map-surface checkout-pickup-map-canvas" role="region" aria-label="Карта шоу-румов" ref={container}/>
  {options.some(item=>item.point)&&<p className="checkout-options-empty">Отметка показывает ориентир. Точное расположение шоу-рума уточняется.</p>}
 </div>;
}
