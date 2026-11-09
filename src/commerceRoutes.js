// Shared product commerce lives in the marketplace; membership actions stay in the cabinet.
export const membershipIntents=['upgrade','packages','activity','renewal','restore'];
export const isMarketplacePage=(page,intent='')=>['cart','checkout','confirmation'].includes(page)||(page==='shop'&&!membershipIntents.includes(intent));
export function normalizeCommerceUrl(url){
 const tab=url.searchParams.get('tab');
 if(tab==='store'&&!['shop','cart','checkout','confirmation'].includes(url.searchParams.get('page')))url.searchParams.set('page','shop');
 const page=url.searchParams.get('page'),intent=url.searchParams.get('intent')||'';
 if(['store','cabinet'].includes(tab)){
  if(page==='shop'&&membershipIntents.includes(intent))url.searchParams.set('tab','cabinet');
  else if(isMarketplacePage(page,intent)){url.searchParams.set('tab','store');url.searchParams.delete('intent');}
 }
 return url;
}
