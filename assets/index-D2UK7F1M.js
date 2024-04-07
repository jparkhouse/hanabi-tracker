var Ct=Object.defineProperty;var It=(e,t,n)=>t in e?Ct(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var ye=(e,t,n)=>(It(e,typeof t!="symbol"?t+"":t,n),n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const u of r)if(u.type==="childList")for(const s of u.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(r){const u={};return r.integrity&&(u.integrity=r.integrity),r.referrerPolicy&&(u.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?u.credentials="include":r.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function o(r){if(r.ep)return;r.ep=!0;const u=n(r);fetch(r.href,u)}})();function W(){}function dt(e){return e()}function Ue(){return Object.create(null)}function K(e){e.forEach(dt)}function mt(e){return typeof e=="function"}function x(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}let Ce;function Ke(e,t){return e===t?!0:(Ce||(Ce=document.createElement("a")),Ce.href=t,e===Ce.href)}function wt(e){return Object.keys(e).length===0}function vt(e,...t){if(e==null){for(const o of t)o(void 0);return W}const n=e.subscribe(...t);return n.unsubscribe?()=>n.unsubscribe():n}function Y(e,t,n){e.$$.on_destroy.push(vt(t,n))}function d(e,t){e.appendChild(t)}function D(e,t,n){e.insertBefore(t,n||null)}function T(e){e.parentNode&&e.parentNode.removeChild(e)}function Pe(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function w(e){return document.createElement(e)}function J(e){return document.createTextNode(e)}function R(){return J(" ")}function Ee(){return J("")}function B(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function S(e,t,n){n==null?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function Ot(e){return Array.from(e.childNodes)}function Re(e,t){t=""+t,e.data!==t&&(e.data=t)}function se(e,t){e.value=t??""}function Xe(e,t,n,o){n==null?e.style.removeProperty(t):e.style.setProperty(t,n,o?"important":"")}function Ie(e,t,n){for(let o=0;o<e.options.length;o+=1){const r=e.options[o];if(r.__value===t){r.selected=!0;return}}(!n||t!==void 0)&&(e.selectedIndex=-1)}function Qe(e){const t=e.querySelector(":checked");return t&&t.__value}let qe;function he(e){qe=e}const fe=[],_e=[];let de=[];const Le=[],St=Promise.resolve();let Ve=!1;function Mt(){Ve||(Ve=!0,St.then(pt))}function ge(e){de.push(e)}function Ae(e){Le.push(e)}const ze=new Set;let ue=0;function pt(){if(ue!==0)return;const e=qe;do{try{for(;ue<fe.length;){const t=fe[ue];ue++,he(t),Et(t.$$)}}catch(t){throw fe.length=0,ue=0,t}for(he(null),fe.length=0,ue=0;_e.length;)_e.pop()();for(let t=0;t<de.length;t+=1){const n=de[t];ze.has(n)||(ze.add(n),n())}de.length=0}while(fe.length);for(;Le.length;)Le.pop()();Ve=!1,ze.clear(),he(e)}function Et(e){if(e.fragment!==null){e.update(),K(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(ge)}}function Ht(e){const t=[],n=[];de.forEach(o=>e.indexOf(o)===-1?t.push(o):n.push(o)),n.forEach(o=>o()),de=t}const Oe=new Set;let ie;function At(){ie={r:0,c:[],p:ie}}function zt(){ie.r||K(ie.c),ie=ie.p}function X(e,t){e&&e.i&&(Oe.delete(e),e.i(t))}function Z(e,t,n,o){if(e&&e.o){if(Oe.has(e))return;Oe.add(e),ie.c.push(()=>{Oe.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}else o&&o()}function ee(e){return(e==null?void 0:e.length)!==void 0?e:Array.from(e)}function Nt(e,t){Z(e,1,1,()=>{t.delete(e.key)})}function Pt(e,t,n,o,r,u,s,i,l,c,f,g){let b=e.length,_=u.length,O=b;const C={};for(;O--;)C[e[O].key]=O;const k=[],y=new Map,v=new Map,m=[];for(O=_;O--;){const z=g(r,u,O),N=n(z);let V=s.get(N);V?o&&m.push(()=>V.p(z,t)):(V=c(N,z),V.c()),y.set(N,k[O]=V),N in C&&v.set(N,Math.abs(O-C[N]))}const M=new Set,a=new Set;function L(z){X(z,1),z.m(i,f),s.set(z.key,z),f=z.first,_--}for(;b&&_;){const z=k[_-1],N=e[b-1],V=z.key,p=N.key;z===N?(f=z.first,b--,_--):y.has(p)?!s.has(V)||M.has(V)?L(z):a.has(p)?b--:v.get(V)>v.get(p)?(a.add(V),L(z)):(M.add(p),b--):(l(N,s),b--)}for(;b--;){const z=e[b];y.has(z.key)||l(z,s)}for(;_;)L(k[_-1]);return K(m),k}function Ne(e,t,n){const o=e.$$.props[t];o!==void 0&&(e.$$.bound[o]=n,n(e.$$.ctx[o]))}function le(e){e&&e.c()}function te(e,t,n){const{fragment:o,after_update:r}=e.$$;o&&o.m(t,n),ge(()=>{const u=e.$$.on_mount.map(dt).filter(mt);e.$$.on_destroy?e.$$.on_destroy.push(...u):K(u),e.$$.on_mount=[]}),r.forEach(ge)}function ne(e,t){const n=e.$$;n.fragment!==null&&(Ht(n.after_update),K(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function Rt(e,t){e.$$.dirty[0]===-1&&(fe.push(e),Mt(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function oe(e,t,n,o,r,u,s=null,i=[-1]){const l=qe;he(e);const c=e.$$={fragment:null,ctx:[],props:u,update:W,not_equal:r,bound:Ue(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(l?l.$$.context:[])),callbacks:Ue(),dirty:i,skip_bound:!1,root:t.target||l.$$.root};s&&s(c.root);let f=!1;if(c.ctx=n?n(e,t.props||{},(g,b,..._)=>{const O=_.length?_[0]:b;return c.ctx&&r(c.ctx[g],c.ctx[g]=O)&&(!c.skip_bound&&c.bound[g]&&c.bound[g](O),f&&Rt(e,g)),b}):[],c.update(),f=!0,K(c.before_update),c.fragment=o?o(c.ctx):!1,t.target){if(t.hydrate){const g=Ot(t.target);c.fragment&&c.fragment.l(g),g.forEach(T)}else c.fragment&&c.fragment.c();t.intro&&X(e.$$.fragment),te(e,t.target,t.anchor),pt()}he(l)}class re{constructor(){ye(this,"$$");ye(this,"$$set")}$destroy(){ne(this,1),this.$destroy=W}$on(t,n){if(!mt(n))return W;const o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(n),()=>{const r=o.indexOf(n);r!==-1&&o.splice(r,1)}}$set(t){this.$$set&&!wt(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Lt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Lt);const ce=[];function ke(e,t=W){let n;const o=new Set;function r(i){if(x(e,i)&&(e=i,n)){const l=!ce.length;for(const c of o)c[1](),ce.push(c,e);if(l){for(let c=0;c<ce.length;c+=2)ce[c][0](ce[c+1]);ce.length=0}}}function u(i){r(i(e))}function s(i,l=W){const c=[i,l];return o.add(c),o.size===1&&(n=t(r,u)||W),i(e),()=>{o.delete(c),o.size===0&&n&&(n(),n=null)}}return{set:r,update:u,subscribe:s}}const Q=ke(new Set),bt=-1,He=0,Se=1,Me=2,Be=3,Fe=4,je=5,Te=6,ht=7,_t=8,Ze=typeof self=="object"?self:globalThis,Vt=(e,t)=>{const n=(r,u)=>(e.set(u,r),r),o=r=>{if(e.has(r))return e.get(r);const[u,s]=t[r];switch(u){case He:case bt:return n(s,r);case Se:{const i=n([],r);for(const l of s)i.push(o(l));return i}case Me:{const i=n({},r);for(const[l,c]of s)i[o(l)]=o(c);return i}case Be:return n(new Date(s),r);case Fe:{const{source:i,flags:l}=s;return n(new RegExp(i,l),r)}case je:{const i=n(new Map,r);for(const[l,c]of s)i.set(o(l),o(c));return i}case Te:{const i=n(new Set,r);for(const l of s)i.add(o(l));return i}case ht:{const{name:i,message:l}=s;return n(new Ze[i](l),r)}case _t:return n(BigInt(s),r);case"BigInt":return n(Object(BigInt(s)),r)}return n(new Ze[u](s),r)};return o},xe=e=>Vt(new Map,e)(0),ae="",{toString:qt}={},{keys:Bt}=Object,pe=e=>{const t=typeof e;if(t!=="object"||!e)return[He,t];const n=qt.call(e).slice(8,-1);switch(n){case"Array":return[Se,ae];case"Object":return[Me,ae];case"Date":return[Be,ae];case"RegExp":return[Fe,ae];case"Map":return[je,ae];case"Set":return[Te,ae]}return n.includes("Array")?[Se,n]:n.includes("Error")?[ht,n]:[Me,n]},we=([e,t])=>e===He&&(t==="function"||t==="symbol"),Ft=(e,t,n,o)=>{const r=(s,i)=>{const l=o.push(s)-1;return n.set(i,l),l},u=s=>{if(n.has(s))return n.get(s);let[i,l]=pe(s);switch(i){case He:{let f=s;switch(l){case"bigint":i=_t,f=s.toString();break;case"function":case"symbol":if(e)throw new TypeError("unable to serialize "+l);f=null;break;case"undefined":return r([bt],s)}return r([i,f],s)}case Se:{if(l)return r([l,[...s]],s);const f=[],g=r([i,f],s);for(const b of s)f.push(u(b));return g}case Me:{if(l)switch(l){case"BigInt":return r([l,s.toString()],s);case"Boolean":case"Number":case"String":return r([l,s.valueOf()],s)}if(t&&"toJSON"in s)return u(s.toJSON());const f=[],g=r([i,f],s);for(const b of Bt(s))(e||!we(pe(s[b])))&&f.push([u(b),u(s[b])]);return g}case Be:return r([i,s.toISOString()],s);case Fe:{const{source:f,flags:g}=s;return r([i,{source:f,flags:g}],s)}case je:{const f=[],g=r([i,f],s);for(const[b,_]of s)(e||!(we(pe(b))||we(pe(_))))&&f.push([u(b),u(_)]);return g}case Te:{const f=[],g=r([i,f],s);for(const b of s)(e||!we(pe(b)))&&f.push(u(b));return g}}const{message:c}=s;return r([i,{name:l,message:c}],s)};return u},$e=(e,{json:t,lossy:n}={})=>{const o=[];return Ft(!(t||n),!!t,new Map,o)(e),o},jt=typeof structuredClone=="function"?(e,t)=>t&&("json"in t||"lossy"in t)?xe($e(e,t)):structuredClone(e):(e,t)=>xe($e(e,t)),me=ke({numberOfCards:4,variant:"no-variant"}),gt=ke(0);function kt(){let e=0;return gt.update(t=>(e=t,t+1)),e}class Tt{constructor(t=1/0){ye(this,"storage",[]);this.capacity=t}push(t){if(this.storage.length>=this.capacity){let n=this.storage.length-this.capacity+1;this.storage.splice(0,n)}this.storage.push(t)}pop(){if(this.size()>0)return this.storage.pop();throw console.error("empty stack popped")}peek(){return this.storage[this.storage.length-1]}size(){return this.storage.length}clear(){this.storage=[]}}const $=new Tt(5),be=ke(0);function Dt(){const{subscribe:e,set:t,update:n}=ke([]),o=()=>{n(i=>($.push(jt(i)),i)),be.set($.size())},r=()=>{if($.size()>0){const i=$.pop();be.set($.size()),i&&t(i)}else console.warn("No previous state available for rollback");be.set($.size())},u=i=>{$.clear(),be.set($.size());const l=Array.from({length:i.numberOfCards},(c,f)=>({id:kt(),numberInformation:Array(5).fill(null),colourInformation:Array(i.variant==="no-variant"?5:i.variant==="rainbows"||i.variant==="blacks"?6:7).fill(null),isHinted:!1,isChopMoved:!1,isFinessed:!1,isCritical:!1}));t(l)},s=me.subscribe(i=>{gt.set(0),Q.update(l=>(l=new Set,l)),u(i)});return{subscribe:e,updateCards:i=>{n(l=>(o(),i(l)))},rollback:r,saveState:o,cleanup:()=>s()}}const U=Dt();function Wt(e){let t,n,o,r,u;return{c(){t=w("button"),n=J("Play/Discard"),t.disabled=o=e[0].size!==1},m(s,i){D(s,t,i),d(t,n),r||(u=B(t,"click",e[1]),r=!0)},p(s,[i]){i&1&&o!==(o=s[0].size!==1)&&(t.disabled=o)},i:W,o:W,d(s){s&&T(t),r=!1,u()}}}function Gt(e,t,n){let o,r,u;Y(e,Q,l=>n(0,r=l)),Y(e,me,l=>n(2,u=l));function s(){if(r.size===1){const l=r.values().next().value;U.updateCards(c=>{const f=c.filter(g=>g.id!==l);return f.push(i(kt())),f}),r.clear()}}function i(l){return{id:l,numberInformation:Array(5).fill(null),colourInformation:Array(o==="no-variant"?5:o==="rainbows"||o==="blacks"?6:7).fill(null),isHinted:!1,isChopMoved:!1,isFinessed:!1,isCritical:!1}}return e.$$.update=()=>{e.$$.dirty&4&&(o=u.variant)},[r,s,u]}class Jt extends re{constructor(t){super(),oe(this,t,Gt,Wt,x,{})}}function et(e){let t,n,o,r,u,s,i,l,c,f,g,b,_,O,C,k,y,v,m,M,a,L,z;return{c(){t=w("div"),n=w("div"),o=w("div"),r=w("label"),r.textContent="Number of Cards:",u=R(),s=w("select"),i=w("option"),i.textContent="3",l=w("option"),l.textContent="4",c=w("option"),c.textContent="5",f=R(),g=w("label"),g.textContent="Variant:",b=R(),_=w("select"),O=w("option"),O.textContent="No variant",C=w("option"),C.textContent="Rainbows",k=w("option"),k.textContent="Blacks",y=w("option"),y.textContent="Rainbows and Blacks",v=R(),m=w("button"),m.textContent="Save",M=R(),a=w("button"),a.textContent="Cancel",S(r,"for","numberOfCards"),i.__value="3",se(i,i.__value),l.__value="4",se(l,l.__value),c.__value="5",se(c,c.__value),S(s,"id","numberOfCards"),e[1].numberOfCards===void 0&&ge(()=>e[5].call(s)),S(g,"for","Variant"),O.__value="no-variant",se(O,O.__value),C.__value="rainbows",se(C,C.__value),k.__value="blacks",se(k,k.__value),y.__value="rainbows-and-blacks",se(y,y.__value),S(_,"id","Variant"),e[1].variant===void 0&&ge(()=>e[6].call(_)),S(o,"class","config-form svelte-16v23fx"),S(n,"class","config-modal svelte-16v23fx"),S(t,"class","modal-overlay svelte-16v23fx")},m(N,V){D(N,t,V),d(t,n),d(n,o),d(o,r),d(o,u),d(o,s),d(s,i),d(s,l),d(s,c),Ie(s,e[1].numberOfCards,!0),d(o,f),d(o,g),d(o,b),d(o,_),d(_,O),d(_,C),d(_,k),d(_,y),Ie(_,e[1].variant,!0),d(n,v),d(n,m),d(n,M),d(n,a),L||(z=[B(s,"change",e[5]),B(_,"change",e[6]),B(m,"click",e[3]),B(a,"click",e[2])],L=!0)},p(N,V){V&2&&Ie(s,N[1].numberOfCards),V&2&&Ie(_,N[1].variant)},d(N){N&&T(t),L=!1,K(z)}}}function Yt(e){let t,n=e[0]&&et(e);return{c(){n&&n.c(),t=Ee()},m(o,r){n&&n.m(o,r),D(o,t,r)},p(o,[r]){o[0]?n?n.p(o,r):(n=et(o),n.c(),n.m(t.parentNode,t)):n&&(n.d(1),n=null)},i:W,o:W,d(o){o&&T(t),n&&n.d(o)}}}function Ut(e,t,n){let o;Y(e,me,f=>n(4,o=f));let{isOpen:r=!1}=t,u={numberOfCards:4,variant:"no-variant"};function s(){n(0,r=!1)}function i(){me.set(u),s()}function l(){u.numberOfCards=Qe(this),n(1,u),n(0,r),n(4,o)}function c(){u.variant=Qe(this),n(1,u),n(0,r),n(4,o)}return e.$$set=f=>{"isOpen"in f&&n(0,r=f.isOpen)},e.$$.update=()=>{e.$$.dirty&17&&r&&n(1,u=o),e.$$.dirty&1&&console.log(r)},[r,u,s,i,o,l,c]}class Kt extends re{constructor(t){super(),oe(this,t,Ut,Yt,x,{isOpen:0})}}function tt(e,t,n){const o=e.slice();return o[23]=t[n],o}function nt(e,t,n){const o=e.slice();return o[26]=t[n],o}function ot(e){let t,n,o,r,u,s,i,l,c,f,g,b,_,O,C=ee(e[2]),k=[];for(let m=0;m<C.length;m+=1)k[m]=rt(nt(e,C,m));let y=ee(e[3]),v=[];for(let m=0;m<y.length;m+=1)v[m]=st(tt(e,y,m));return{c(){t=w("div"),n=w("div"),o=w("div");for(let m=0;m<k.length;m+=1)k[m].c();r=R(),u=w("div");for(let m=0;m<v.length;m+=1)v[m].c();s=R(),i=w("div"),l=w("button"),c=J("Save"),g=R(),b=w("button"),b.textContent="Cancel",S(o,"class","numbers-hints svelte-cxqqya"),S(u,"class","colours-hints svelte-cxqqya"),l.disabled=f=!e[1],S(i,"class","actions"),S(n,"class","hint-modal svelte-cxqqya"),S(t,"class","modal-overlay svelte-cxqqya")},m(m,M){D(m,t,M),d(t,n),d(n,o);for(let a=0;a<k.length;a+=1)k[a]&&k[a].m(o,null);d(n,r),d(n,u);for(let a=0;a<v.length;a+=1)v[a]&&v[a].m(u,null);d(n,s),d(n,i),d(i,l),d(l,c),d(i,g),d(i,b),_||(O=[B(l,"click",e[4]),B(b,"click",e[6])],_=!0)},p(m,M){if(M&38){C=ee(m[2]);let a;for(a=0;a<C.length;a+=1){const L=nt(m,C,a);k[a]?k[a].p(L,M):(k[a]=rt(L),k[a].c(),k[a].m(o,null))}for(;a<k.length;a+=1)k[a].d(1);k.length=C.length}if(M&42){y=ee(m[3]);let a;for(a=0;a<y.length;a+=1){const L=tt(m,y,a);v[a]?v[a].p(L,M):(v[a]=st(L),v[a].c(),v[a].m(u,null))}for(;a<v.length;a+=1)v[a].d(1);v.length=y.length}M&2&&f!==(f=!m[1])&&(l.disabled=f)},d(m){m&&T(t),Pe(k,m),Pe(v,m),_=!1,K(O)}}}function rt(e){let t,n=e[26]+"",o,r,u;function s(){return e[8](e[26])}return{c(){t=w("button"),o=J(n),S(t,"class","btn"),t.hidden=!e[5](e[26])},m(i,l){D(i,t,l),d(t,o),r||(u=B(t,"click",s),r=!0)},p(i,l){e=i},d(i){i&&T(t),r=!1,u()}}}function st(e){let t,n=e[23]+"",o,r,u;function s(){return e[9](e[23])}return{c(){t=w("button"),o=J(n),S(t,"class","btn"),t.hidden=!e[5](e[23])},m(i,l){D(i,t,l),d(t,o),r||(u=B(t,"click",s),r=!0)},p(i,l){e=i},d(i){i&&T(t),r=!1,u()}}}function Xt(e){let t,n=e[0]&&ot(e);return{c(){n&&n.c(),t=Ee()},m(o,r){n&&n.m(o,r),D(o,t,r)},p(o,[r]){o[0]?n?n.p(o,r):(n=ot(o),n.c(),n.m(t.parentNode,t)):n&&(n.d(1),n=null)},i:W,o:W,d(o){o&&T(t),n&&n.d(o)}}}function ve(e){const t=e.filter(o=>o===null).length,n=e.filter(o=>o===!1).length;if(t===1&&n===e.length-1){const o=e.findIndex(r=>r===null);e[o]=!0}}function Qt(e,t,n){let o,r,u,s;Y(e,U,p=>n(11,r=p)),Y(e,Q,p=>n(12,u=p)),Y(e,me,p=>n(7,s=p));let{isOpen:i=!1}=t;const l=[1,2,3,4,5],c=["red","yellow","blue","white","green"];let f=null;function g(){f&&(console.log("a hint!"),typeof f=="string"?b(f):typeof f=="number"&&y(f),Q.update(p=>(p=new Set,p)),z())}function b(p){switch(o){case"no-variant":_(p);break;case"rainbows":O(p);break;case"blacks":C(p);break;case"rainbows-and-blacks":k(p);break}}function _(p){const P=Array.from(u),A=c.findIndex(H=>H===p);U.updateCards(H=>H.map(h=>{const q=h.colourInformation.map((F,j)=>P.includes(h.id)?(h.isHinted=!0,j===A):j!==A?F:!1);return ve(q),{...h,colourInformation:q}}))}function O(p){const P=Array.from(u),A=c.findIndex(H=>H===p);U.updateCards(H=>{let I=H;return I.forEach((h,q)=>{P.includes(h.id)?(h.isHinted=!0,h.colourInformation[5]===null&&h.colourInformation[A]===null?h.colourInformation.forEach((F,j)=>{j!=A&&j!=5&&(h.colourInformation[j]=!1)}):h.colourInformation[5]===null&&h.colourInformation[A]===!1?h.colourInformation.forEach((F,j)=>{j==5?h.colourInformation[j]=!0:h.colourInformation[j]=!1}):h.colourInformation[5]===!1&&h.colourInformation[A]===null&&h.colourInformation.forEach((F,j)=>{j==A?h.colourInformation[j]=!0:h.colourInformation[j]=!1})):h.colourInformation[5]!==!0&&(h.colourInformation[A]=!1,h.colourInformation[5]=!1,ve(h.colourInformation))}),I})}function C(p){const P=Array.from(u),A=c.findIndex(H=>H===p);U.updateCards(H=>H.map(h=>{let q;return P.includes(h.id)?(h.isHinted=!0,q=h.colourInformation.map((F,j)=>j===A)):q=h.colourInformation.map((F,j)=>j!==A?F:!1),ve(q),{...h,colourInformation:q}}))}function k(p){const P=Array.from(u),A=c.findIndex(H=>H===p);U.updateCards(H=>H.map(I=>{let h=[...I.colourInformation];return P.includes(I.id)?(I.isHinted=!0,I.colourInformation[5]===null&&I.colourInformation[A]===null?h=h.map((q,F)=>F===A||F===5?null:!1):I.colourInformation[5]===null&&I.colourInformation[A]===!1?h=h.map((q,F)=>F===5):I.colourInformation[5]===!1&&I.colourInformation[A]===null&&(h=h.map((q,F)=>F===A))):(h[A]=!1,h[5]=!1),ve(h),{...I,colourInformation:h}}))}function y(p){const P=Array.from(u);U.updateCards(A=>A.map(I=>{const h=I.numberInformation.map((q,F)=>P.includes(I.id)?(I.isHinted=!0,F===p-1):F!==p-1?q:!1);return{...I,numberInformation:h}}))}function v(p){let P=!1;switch(o){case"no-variant":P=m(p);break;case"rainbows":P=M(p);break;case"blacks":P=a(p);break;case"rainbows-and-blacks":P=L(p);break}return P}function m(p){return Array.from(u).every(H=>{const I=r.find(h=>h.id===H);if(!I)return!1;if(typeof p=="string"){const h=c.indexOf(p);return I.colourInformation[h]===null||I.colourInformation[h]===!0}else if(typeof p=="number")return I.numberInformation[p-1]===null||I.numberInformation[p-1]===!0})}function M(p){return Array.from(u).every(H=>{const I=r.find(h=>h.id===H);if(!I)return!1;if(typeof p=="string"){if(I.colourInformation[5]===null||I.colourInformation[5]===!0)return!0;{const q=c.indexOf(p);return I.colourInformation[q]===null||I.colourInformation[q]===!0}}else if(typeof p=="number")return I.numberInformation[p-1]===null||I.numberInformation[p-1]===!0})}function a(p){return Array.from(u).every(H=>{const I=r.find(h=>h.id===H);if(!I)return!1;if(typeof p=="string"){const h=c.indexOf(p);return I.colourInformation[h]===null||I.colourInformation[h]===!0}else if(typeof p=="number")return I.numberInformation[p-1]===null||I.numberInformation[p-1]===!0})}function L(p){return Array.from(u).every(H=>{const I=r.find(h=>h.id===H);if(!I)return!1;if(typeof p=="string"){if(I.colourInformation[5]===null||I.colourInformation[5]===!0)return!0;{const q=c.indexOf(p);return I.colourInformation[q]===null||I.colourInformation[q]===!0}}else if(typeof p=="number")return I.numberInformation[p-1]===null||I.numberInformation[p-1]===!0})}function z(){n(0,i=!1),n(1,f=null)}const N=p=>n(1,f=p),V=p=>n(1,f=p);return e.$$set=p=>{"isOpen"in p&&n(0,i=p.isOpen)},e.$$.update=()=>{e.$$.dirty&128&&(o=s.variant)},[i,f,l,c,g,v,z,s,N,V]}class Zt extends re{constructor(t){super(),oe(this,t,Qt,Xt,x,{isOpen:0})}}function it(e){let t,n,o,r,u,s,i,l,c,f,g,b,_,O,C,k,y;return{c(){t=w("div"),n=w("div"),o=w("div"),r=w("button"),r.textContent="Critical",u=R(),s=w("button"),s.textContent="Chop moved",i=R(),l=w("button"),l.textContent="Finessed",c=R(),f=w("div"),g=w("button"),b=J("Save"),O=R(),C=w("button"),C.textContent="Cancel",S(r,"class","btn"),S(s,"class","btn"),S(l,"class","btn"),S(o,"class","flags"),g.disabled=_=!e[1],S(f,"class","actions"),S(n,"class","mark-modal svelte-1fkqm3b"),S(t,"class","modal-overlay svelte-1fkqm3b")},m(v,m){D(v,t,m),d(t,n),d(n,o),d(o,r),d(o,u),d(o,s),d(o,i),d(o,l),d(n,c),d(n,f),d(f,g),d(g,b),d(f,O),d(f,C),k||(y=[B(r,"click",e[5]),B(s,"click",e[6]),B(l,"click",e[7]),B(g,"click",e[3]),B(C,"click",e[2])],k=!0)},p(v,m){m&2&&_!==(_=!v[1])&&(g.disabled=_)},d(v){v&&T(t),k=!1,K(y)}}}function xt(e){let t,n=e[0]&&it(e);return{c(){n&&n.c(),t=Ee()},m(o,r){n&&n.m(o,r),D(o,t,r)},p(o,[r]){o[0]?n?n.p(o,r):(n=it(o),n.c(),n.m(t.parentNode,t)):n&&(n.d(1),n=null)},i:W,o:W,d(o){o&&T(t),n&&n.d(o)}}}function $t(e,t,n){let o,r;Y(e,Q,b=>n(9,o=b)),Y(e,U,b=>n(4,r=b));let{isOpen:u=!1}=t,s=null;function i(){n(1,s=null),n(0,u=!1)}function l(){const b=Array.from(o);U.updateCards(_=>_.map(C=>{if(b.includes(C.id))switch(s){case"critical":C.isCritical=!C.isCritical;break;case"chop-move":C.isChopMoved=!C.isChopMoved;break;case"finesse":C.isFinessed=!C.isFinessed;break}return C})),Q.update(_=>(_=new Set,_)),i()}const c=()=>n(1,s="critical"),f=()=>n(1,s="chop-move"),g=()=>n(1,s="finesse");return e.$$set=b=>{"isOpen"in b&&n(0,u=b.isOpen)},e.$$.update=()=>{e.$$.dirty&16},[u,s,i,l,r,c,f,g]}class en extends re{constructor(t){super(),oe(this,t,$t,xt,x,{isOpen:0})}}function tn(e){let t,n,o,r,u,s,i,l,c,f,g,b,_,O,C,k,y,v,m,M,a,L,z,N,V,p,P,A,H,I,h;i=new Jt({});function q(E){e[14](E)}let F={};e[1]!==void 0&&(F.isOpen=e[1]),a=new Kt({props:F}),_e.push(()=>Ne(a,"isOpen",q));function j(E){e[15](E)}let De={};e[2]!==void 0&&(De.isOpen=e[2]),N=new Zt({props:De}),_e.push(()=>Ne(N,"isOpen",j));function yt(E){e[16](E)}let We={};return e[3]!==void 0&&(We.isOpen=e[3]),P=new en({props:We}),_e.push(()=>Ne(P,"isOpen",yt)),{c(){t=w("div"),n=w("button"),n.textContent="Configure Game",o=R(),r=w("button"),u=J(e[0]),s=R(),le(i.$$.fragment),l=R(),c=w("button"),f=J("Record Hint"),b=R(),_=w("button"),O=J("Mark cards"),k=R(),y=w("button"),v=J("Undo"),M=R(),le(a.$$.fragment),z=R(),le(N.$$.fragment),p=R(),le(P.$$.fragment),S(n,"class","configure svelte-9e6wy5"),S(r,"class","wake-lock"),r.hidden=!e[6],S(c,"class","hint-panel svelte-9e6wy5"),c.disabled=g=e[5].size<1,S(_,"class","mark-panel"),_.disabled=C=e[5].size<1,S(y,"class","undo"),y.disabled=m=e[4]<1,S(t,"class","game-controls svelte-9e6wy5")},m(E,G){D(E,t,G),d(t,n),d(t,o),d(t,r),d(r,u),d(t,s),te(i,t,null),d(t,l),d(t,c),d(c,f),d(t,b),d(t,_),d(_,O),d(t,k),d(t,y),d(y,v),D(E,M,G),te(a,E,G),D(E,z,G),te(N,E,G),D(E,p,G),te(P,E,G),H=!0,I||(h=[B(n,"click",e[8]),B(r,"click",e[7]),B(c,"click",e[9]),B(_,"click",e[10]),B(y,"click",e[11])],I=!0)},p(E,[G]){(!H||G&1)&&Re(u,E[0]),(!H||G&32&&g!==(g=E[5].size<1))&&(c.disabled=g),(!H||G&32&&C!==(C=E[5].size<1))&&(_.disabled=C),(!H||G&16&&m!==(m=E[4]<1))&&(y.disabled=m);const Ge={};!L&&G&2&&(L=!0,Ge.isOpen=E[1],Ae(()=>L=!1)),a.$set(Ge);const Je={};!V&&G&4&&(V=!0,Je.isOpen=E[2],Ae(()=>V=!1)),N.$set(Je);const Ye={};!A&&G&8&&(A=!0,Ye.isOpen=E[3],Ae(()=>A=!1)),P.$set(Ye)},i(E){H||(X(i.$$.fragment,E),X(a.$$.fragment,E),X(N.$$.fragment,E),X(P.$$.fragment,E),H=!0)},o(E){Z(i.$$.fragment,E),Z(a.$$.fragment,E),Z(N.$$.fragment,E),Z(P.$$.fragment,E),H=!1},d(E){E&&(T(t),T(M),T(z),T(p)),ne(i),ne(a,E),ne(N,E),ne(P,E),I=!1,K(h)}}}function nn(e,t,n){let o,r,u;Y(e,be,M=>n(13,r=M)),Y(e,Q,M=>n(5,u=M));let s=null,i="wakeLock"in navigator,l="Wake Lock Off";async function c(){if(s)s.release(),n(12,s=null),n(0,l="Wake Lock Off");else try{n(12,s=await navigator.wakeLock.request("screen")),s.addEventListener("release",()=>{n(12,s=null),n(0,l="Wake Lock Off")}),n(0,l="Wake Lock On")}catch(M){console.error(`Could not acquire wake lock: ${M}`)}}let f=!1;function g(){n(1,f=!0)}let b=!1;function _(){n(2,b=!0)}let O=!1;function C(){n(3,O=!0)}function k(){U.rollback()}function y(M){f=M,n(1,f)}function v(M){b=M,n(2,b)}function m(M){O=M,n(3,O)}return e.$$.update=()=>{e.$$.dirty&4096&&(s?n(0,l="Wake Lock On"):n(0,l="Wake Lock Off")),e.$$.dirty&8192&&n(4,o=r),e.$$.dirty&8192&&console.log(r)},[l,f,b,O,o,u,i,c,g,_,C,k,s,r,y,v,m]}class on extends re{constructor(t){super(),oe(this,t,nn,tn,x,{})}}function lt(e,t,n){const o=e.slice();return o[19]=t[n],o}function ut(e){let t,n;return{c(){t=w("img"),Ke(t.src,n=e[19])||S(t,"src",n),S(t,"alt","colour icon"),S(t,"class","icon svelte-1m7u1up")},m(o,r){D(o,t,r)},p(o,r){r&16&&!Ke(t.src,n=o[19])&&S(t,"src",n)},d(o){o&&T(t)}}}function rn(e){let t,n,o,r=e[0]+1+"",u,s,i,l=ct(e[1])+"",c,f,g,b,_,O,C=ee(e[4]),k=[];for(let y=0;y<C.length;y+=1)k[y]=ut(lt(e,C,y));return{c(){t=w("div"),n=w("p"),o=J("Card "),u=J(r),s=R(),i=w("p"),c=J(l),f=R(),g=w("div");for(let y=0;y<k.length;y+=1)k[y].c();S(g,"class","icons svelte-1m7u1up"),S(t,"class",b="card no-"+e[6]+" "+(e[3]!=null?e[3]:"")+" svelte-1m7u1up"),S(t,"tabindex","0"),S(t,"role","button"),Xe(t,"border-color",e[5])},m(y,v){D(y,t,v),d(t,n),d(n,o),d(n,u),d(t,s),d(t,i),d(i,c),d(t,f),d(t,g);for(let m=0;m<k.length;m+=1)k[m]&&k[m].m(g,null);_||(O=[B(t,"click",e[14]),B(t,"keydown",e[15])],_=!0)},p(y,[v]){if(v&1&&r!==(r=y[0]+1+"")&&Re(u,r),v&2&&l!==(l=ct(y[1])+"")&&Re(c,l),v&16){C=ee(y[4]);let m;for(m=0;m<C.length;m+=1){const M=lt(y,C,m);k[m]?k[m].p(M,v):(k[m]=ut(M),k[m].c(),k[m].m(g,null))}for(;m<k.length;m+=1)k[m].d(1);k.length=C.length}v&72&&b!==(b="card no-"+y[6]+" "+(y[3]!=null?y[3]:"")+" svelte-1m7u1up")&&S(t,"class",b),v&32&&Xe(t,"border-color",y[5])},i:W,o:W,d(y){y&&T(t),Pe(k,y),_=!1,K(O)}}}function ct(e){return e.map((n,o)=>n===!0||n===null?(o+1).toString():"").join(" ")}function sn(e,t,n){let o,r,u,s;Y(e,me,a=>n(13,s=a));let{id:i}=t,{numberInformation:l}=t,{colourInformation:c}=t,{selected:f=!1}=t,{isHinted:g}=t,{isFinessed:b}=t,{isChopMoved:_}=t,{isCritical:O}=t,{onSelect:C}=t,k=null,y=[];function v(a){return a<5?["red","yellow","blue","white","green"][a]:o=="blacks"&&a==5?"black":o=="rainbows"&&a==5||o=="rainbows-and-blacks"&&a==5?"rainbow":o=="rainbows-and-blacks"&&a==6?"black":(console.log("Index {index} out of range for card {self.id} and variant {variant}"),"err")}const m=()=>C(i),M=a=>(a.key==="Enter"||a.key===" ")&&C(i);return e.$$set=a=>{"id"in a&&n(0,i=a.id),"numberInformation"in a&&n(1,l=a.numberInformation),"colourInformation"in a&&n(7,c=a.colourInformation),"selected"in a&&n(8,f=a.selected),"isHinted"in a&&n(9,g=a.isHinted),"isFinessed"in a&&n(10,b=a.isFinessed),"isChopMoved"in a&&n(11,_=a.isChopMoved),"isCritical"in a&&n(12,O=a.isCritical),"onSelect"in a&&n(2,C=a.onSelect)},e.$$.update=()=>{if(e.$$.dirty&8192&&(o=s.variant),e.$$.dirty&8192&&n(6,r=s.numberOfCards),e.$$.dirty&7936&&n(5,u=f?"blue":O?"red":g?"orange":b?"aqua":_?"white":"gray"),e.$$.dirty&128){const a=c.findIndex(L=>L===!0);a===-1?n(3,k=null):n(3,k=v(a))}e.$$.dirty&128&&n(4,y=c.map((a,L)=>a===!0||a===null?`src/assets/${v(L)}.svg`:null).filter(Boolean))},[i,l,C,k,y,u,r,c,f,g,b,_,O,s,m,M]}class ln extends re{constructor(t){super(),oe(this,t,sn,rn,x,{id:0,numberInformation:1,colourInformation:7,selected:8,isHinted:9,isFinessed:10,isChopMoved:11,isCritical:12,onSelect:2})}}function at(e,t,n){const o=e.slice();return o[3]=t[n],o}function ft(e,t){let n,o,r;return o=new ln({props:{id:t[3].id,numberInformation:t[3].numberInformation,colourInformation:t[3].colourInformation,selected:t[1].has(t[3].id),isHinted:t[3].isHinted,isChopMoved:t[3].isChopMoved,isFinessed:t[3].isFinessed,isCritical:t[3].isCritical,onSelect:t[2]}}),{key:e,first:null,c(){n=Ee(),le(o.$$.fragment),this.first=n},m(u,s){D(u,n,s),te(o,u,s),r=!0},p(u,s){t=u;const i={};s&1&&(i.id=t[3].id),s&1&&(i.numberInformation=t[3].numberInformation),s&1&&(i.colourInformation=t[3].colourInformation),s&3&&(i.selected=t[1].has(t[3].id)),s&1&&(i.isHinted=t[3].isHinted),s&1&&(i.isChopMoved=t[3].isChopMoved),s&1&&(i.isFinessed=t[3].isFinessed),s&1&&(i.isCritical=t[3].isCritical),o.$set(i)},i(u){r||(X(o.$$.fragment,u),r=!0)},o(u){Z(o.$$.fragment,u),r=!1},d(u){u&&T(n),ne(o,u)}}}function un(e){let t,n=[],o=new Map,r,u=ee(e[0]);const s=i=>i[3].id;for(let i=0;i<u.length;i+=1){let l=at(e,u,i),c=s(l);o.set(c,n[i]=ft(c,l))}return{c(){t=w("div");for(let i=0;i<n.length;i+=1)n[i].c();S(t,"class","hand svelte-insnbi")},m(i,l){D(i,t,l);for(let c=0;c<n.length;c+=1)n[c]&&n[c].m(t,null);r=!0},p(i,[l]){l&7&&(u=ee(i[0]),At(),n=Pt(n,l,s,1,i,u,o,t,Nt,ft,null,at),zt())},i(i){if(!r){for(let l=0;l<u.length;l+=1)X(n[l]);r=!0}},o(i){for(let l=0;l<n.length;l+=1)Z(n[l]);r=!1},d(i){i&&T(t);for(let l=0;l<n.length;l+=1)n[l].d()}}}function cn(e,t,n){let o,r;Y(e,U,s=>n(0,o=s)),Y(e,Q,s=>n(1,r=s));function u(s){r.has(s)?Q.update(i=>{const l=new Set(i);return l.delete(s),l}):Q.update(i=>{const l=new Set(i);return l.add(s),l})}return e.$$.update=()=>{e.$$.dirty&1&&console.log(o)},[o,r,u]}class an extends re{constructor(t){super(),oe(this,t,cn,un,x,{})}}function fn(e){let t,n,o,r,u,s,i;return n=new on({}),r=new an({}),{c(){t=w("main"),le(n.$$.fragment),o=R(),le(r.$$.fragment),u=R(),s=w("a"),s.textContent="Check out my code!",S(s,"href","https://github.com/jparkhouse/hanabi-tracker/"),S(s,"target","_blank")},m(l,c){D(l,t,c),te(n,t,null),d(t,o),te(r,t,null),d(t,u),d(t,s),i=!0},p:W,i(l){i||(X(n.$$.fragment,l),X(r.$$.fragment,l),i=!0)},o(l){Z(n.$$.fragment,l),Z(r.$$.fragment,l),i=!1},d(l){l&&T(t),ne(n),ne(r)}}}class dn extends re{constructor(t){super(),oe(this,t,null,fn,x,{})}}new dn({target:document.getElementById("app")});