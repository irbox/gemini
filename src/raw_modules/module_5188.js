// Module 5188
export default function(e,t,i) {
i.d(t,{c:()=>s});const s=e=>class extends e{connectedCallback(){this.slotMap=Array.from(this.querySelectorAll("[slot]")).reduce((e,t)=>({...e,[t.getAttribute("slot")]:t}),{}),super.connectedCallback()}getSlot(e){const t=this.slotMap?.[e];return t&&(t.style.display="block"),t}hasSlot(e){return!!this.slotMap?.[e]}_waitForSlots(){return new Promise(e=>{this.querySelectorAll("[slot]").length>0?e():(this._mutationObserver=new MutationObserver(t=>{for(const i of t)if(i.addedNodes.length>0){this._mutationObserver.disconnect(),e();break}}),this._mutationObserver.observe(this,{childList:!0,subtree:!0}))})}}
}
