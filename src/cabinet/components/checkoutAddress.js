import {useEffect,useState} from 'react';

const endpoint=import.meta.env.VITE_CHECKOUT_ADDRESS_ENDPOINT||(import.meta.env.DEV?'/api/checkout/address':'');
const normalize=value=>value?.trim().toLocaleLowerCase('ru-RU').replaceAll('ё','е');

function buildingSuggestions(results,city,country){
 const buildings=new Map();
 for(const suggestion of results){
  const address=suggestion?.data;
  if(!address?.house||normalize(address.country)!==normalize(country))continue;
  if(![address.city,address.settlement,address.city||address.settlement?'':address.region].some(value=>normalize(value)===normalize(city)))continue;
  const street=address.street_with_type||address.street||address.settlement_with_type||address.city_with_type;
  if(!street)continue;
  const building=[
   street,
   [address.house_type,address.house].filter(Boolean).join(' '),
   [address.block_type,address.block].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ');
  buildings.set(building,{value:building,address:building,city,country,postal:address.postal_code||''});
 }
 return [...buildings.values()];
}

export function useAddressSuggestions(value,city,country,open){
 const query=value.trim();
 const enabled=open&&city&&country&&query.length>=3;
 const key=JSON.stringify([query,city,country]);
 const [result,setResult]=useState(null);
 useEffect(()=>{
  if(!enabled||!endpoint)return;
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   try{
    const response=await fetch(endpoint,{
     method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,
     body:JSON.stringify({query:query.slice(0,300),city,country}),
    });
    if(!response.ok)throw new Error('Address suggestions unavailable');
    const {suggestions}=await response.json();
    if(!Array.isArray(suggestions))throw new Error('Invalid address suggestions');
    const buildings=buildingSuggestions(suggestions,city,country);
    if(!controller.signal.aborted)setResult({key,suggestions:buildings,status:buildings.length?'':'empty'});
   }catch{
    if(!controller.signal.aborted)setResult({key,suggestions:[],status:'unavailable'});
   }
  },300);
  return ()=>{clearTimeout(timer);controller.abort();};
 },[enabled,key,query,city,country]);
 if(!enabled)return {suggestions:[],status:''};
 if(!endpoint)return {suggestions:[],status:'unavailable'};
 return result?.key===key?result:{suggestions:[],status:'loading'};
}
