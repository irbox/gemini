// Module 8376
export default function(e,t,i) {
i.d(t,{Z:()=>s});const s=new class{constructor(){this.subscribers={},this.state={}}dispatch(e="",t={}){const i={type:e,data:t};Object.keys(this.subscribers).forEach(e=>{this.subscribers[e](i)})}subscribe(e,t){this.subscribers[e]=t}unsubscribe(e){delete this.subscribers[e]}setState(e,t){this.state[e]=t}getState(e){return this.state[e]}}
}
