// Module 3463
export default function(e,t,i) {
i.d(t,{Z:()=>a,d:()=>n});const s=new class{constructor(){this.observer=null,this.callbacks=new WeakMap}initObserver(){this.observer||(this.observer=new IntersectionObserver(e=>{e.forEach(e=>{const t=this.callbacks.get(e.target);t&&t(e)})},{threshold:[0,1]}))}observe(e,t){this.initObserver(),this.callbacks.set(e,t),this.observer?.observe(e)}unobserve(e){this.callbacks.delete(e),this.observer?.unobserve(e)}},n=()=>s,a=s
}
