// Module 1180
export default function(e,t,i) {
i.d(t,{y:()=>o,Z:()=>c});var s=i(7740),n=i(6416);var a=i(4202),r=i(8376);const o={REGISTER:"CLICK_OUTSIDE/REGISTER",PAYLOAD:"CLICK_OUTSIDE/PAYLOAD"};const c=class{constructor(){this.id=(0,a.Z)(),this.listeners={},r.Z.subscribe(this.id,this.update.bind(this))}update({type:e,data:t}){switch(e){case s.q.CLICKED:this.onBodyClicked(t);break;case o.REGISTER:this.onNewRegister(t)}}onBodyClicked(e){Object.keys(this.listeners).forEach(t=>!((e,t)=>{(0,n.HD)(t)&&(t=document.querySelector(t));let i=e.target||e.srcElement;for(;i&&i!==document.body&&i!==t;)i=i.parentElement;return i!==document.body})(e,this.listeners[t])&&r.Z.dispatch(o.PAYLOAD,t))}onNewRegister({id:e,handle:t}){this.listeners[e]=t}}
}
