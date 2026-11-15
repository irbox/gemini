// Module 2682
export default function(e,t,i) {
i.d(t,{F:()=>a,e:()=>n});const s=["position_maximum","word_count","days_since_published","position"],n=(e,t)=>{const i=e.getAttribute(t);try{return JSON.parse(i)}catch(e){return console.error(i,e.message),null}},a=e=>Object.keys(e).reduce((t,i)=>{const n=e[i];if(!s.includes(i))return{...t,[i]:n};const a=null!=n?parseInt(n,10):NaN;return{...t,[i]:Number.isNaN(a)?void 0:a}},{})
}
