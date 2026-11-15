// Module 9557
export default function(e,t,i) {
i.d(t,{Z:()=>n});const s=function(e,t){return[...e.querySelectorAll(t)]};function n(e,t){const i=window.G00G={};s(t,"[data-component]").forEach(t=>{const s=t.getAttribute("data-component"),n=e[s]||null;if(!n||t.getAttribute("data-component-initialized"))return;const a=new n(t);i[a.id]=a,a.init(),t.setAttribute("data-component-initialized",!0)}),Object.keys(i).forEach(e=>i[e].afterInit())}
}
