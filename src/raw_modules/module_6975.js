// Module 6975
export default function(e,t,i) {
i.d(t,{FL:()=>c});var s=i(4202),n=i(8376);const a="SR_ACTION/SPEAK";class r{constructor(){this.id=(0,s.Z)(),n.Z.subscribe(this.id,e=>this.update(e)),this.buttonStates=new Array(7).fill(!1)}update({type:e,data:t}){if(e===a)this.speak(t.message,t.force||!1)}speak(e,t=!1){const i=document.createElement("div"),s=`speak-${Date.now()}`;i.setAttribute("id",s),i.setAttribute("aria-live",t?"assertive":"polite"),i.classList.add("sr-only"),document.body.appendChild(i),setTimeout(()=>i.innerText=e,100),setTimeout(()=>document.body.removeChild(i),1e3)}}let o=null;const c=()=>o=new r
}
