import {defineConfig,loadEnv} from 'vite';

const dadataEndpoint='https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

function localAddressSuggestions(token){
 return {
  name:'local-checkout-address-suggestions',
  configureServer(server){
   // shortcut: loopback-only preview endpoint, use the commerce backend on deployed sites.
   server.middlewares.use('/api/checkout/address',async(req,res)=>{
    const reply=(status,body)=>{
     if(res.destroyed)return;
     res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});
     res.end(JSON.stringify(body));
    };
    if(req.method!=='POST')return reply(405,{});
    if(!token)return reply(503,{});
    if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,{});
    let query,city,country;
    try{
     let raw='';
     for await(const chunk of req){
      raw+=chunk;
      if(raw.length>4096)return reply(413,{});
     }
     ({query,city,country}=JSON.parse(raw));
     if(![query,city,country].every((value,index)=>typeof value==='string'&&value.trim()&&value.length<=(index===0?300:100))){
      return reply(400,{});
     }
    }catch{
     return reply(400,{});
    }
    const controller=new AbortController();
    res.once('close',()=>controller.abort());
    try{
     const upstream=await fetch(dadataEndpoint,{
      method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Authorization:'Token '+token},
      body:JSON.stringify({query,count:8,locations:[{country,city},{country,region:city}],to_bound:{value:'house'}}),
      signal:AbortSignal.any([controller.signal,AbortSignal.timeout(4500)]),
     });
     if(!upstream.ok)return reply(502,{});
     const {suggestions}=await upstream.json();
     if(!Array.isArray(suggestions))return reply(502,{});
     return reply(200,{suggestions});
    }catch{
     return reply(502,{});
    }
   });
  },
 };
}

export default defineConfig(({mode,command})=>({
 base:process.env.DEPLOY_BASE||'/',
 build:{target:'esnext'},
 plugins:command==='serve'?[localAddressSuggestions(loadEnv(mode,process.cwd(),'DADATA_API_TOKEN').DADATA_API_TOKEN?.trim())]:[],
}));
