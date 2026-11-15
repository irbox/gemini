// Module 9318
export default function(e,t,i) {
i.d(t,{Z:()=>r,a:()=>a});var s=i(221),n=i(8376);const a={RESIZE:"RESIZE/WINDOW",ORIENTATION:"ORIENTATION/WINDOW"};const r=class{constructor(){window.addEventListener(s.Z.RESIZE,()=>this.onResize()),window.addEventListener(s.Z.ORIENTATIONCHANGE,()=>this.onOrientation())}onResize(){n.Z.dispatch(a.RESIZE)}onOrientation(){n.Z.dispatch(a.ORIENTATION)}}
}
