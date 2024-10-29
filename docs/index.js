(()=>{"use strict";const e=864e5,t=54e6,n=["土","日","月","火","水","木","金"];function a(e){return document.getElementsByClassName(e)[0]}const s=function(n=new Date){return new Date(Math.trunc((Number(n)-t)/e)*e+t)}();function i(){const t=new Date(new Date(s).setDate(1));return new Date(Number(t)-((t.getDay()+1)%7+7)*e)}function c({date:e,events:t},n){const a=n&&1!==e.getDate()?e.getDate():e.toLocaleDateString().substring(5),i=Object.assign(document.createElement("div"),{title:a});Number(e)===Number(s)&&i.classList.add("today"),n%7<2&&i.classList.add("holiday");const c=e.getMonth()-s.getMonth();return i.classList.add(`month-${c}`),i.append(...t.map((({summary:e,eventType:t})=>Object.assign(document.createElement("div"),{title:e,className:t})))),i}function r(t){const s=t.sort(((e,t)=>e.dateNum-t.dateNum)),r=a("grid");r.innerHTML="";const o=Number(i()),{dates:l}=[...Array(105)].reduce(((t,n,a)=>{const s=new Date(o+e*a),[i,c]=function(e,t){const n=[];for(let a=0;a<e.length;a+=1)if(e[a].dateNum===t)n.push(e[a]);else if(e[a].dateNum>t)break;return[n,e.slice(n.length)]}(t.myEvents,Number(s));return{myEvents:c,dates:[...t.dates,{date:s,events:i}]}}),{myEvents:s,dates:[]});return r.append(...n.map((e=>Object.assign(document.createElement("div"),{title:e}))),...l.map(c)),t}const o=["https://apis.google.com/js/api.js","https://accounts.google.com/gsi/client"],l=["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],u=["https://www.googleapis.com/auth/calendar.readonly"],d={21:"event",12:"anniversary",15:"owner"};async function m(){const{result:e}=await gapi.client.calendar.calendarList.list();return e.items.map((({id:e,colorId:t})=>({id:e,eventType:d[t]})))}async function p([e,...t],n=[]){if(!e)return n;const a=await async function(e){return(await gapi.client.calendar.events.list({calendarId:e.id,timeMin:i().toISOString(),showDeleted:!1,singleEvents:!0,maxResults:30,orderBy:"startTime"})).result.items.map((t=>({eventType:"祝日"===t.description&&"event"===e.eventType?"holiday":e.eventType,dateNum:Number(new Date(t.start.date.replaceAll("-","/"))),summary:t.summary})))}(e);return p(t,[...n,...a])}async function g(e){return gapi.client.init({apiKey:e.apiKey,discoveryDocs:l})}function y(e,t,n){return({error:a})=>{void 0!==a&&n(a),localStorage.setItem("apiKey",e.apiKey),localStorage.setItem("clientId",e.clientId),t(e)}}async function f(){return new Promise((e=>{gapi.load("client",e)}))}async function v(e=!1){const t=await function(){const e=a("api-key")?.value,t=a("client-id")?.value;return e&&t?Promise.resolve({apiKey:e,clientId:t}):Promise.reject()}(),n=function({apiKey:e}){const t=sessionStorage.getItem(e);if(t){const e=JSON.parse(t);if(n=e,Array.isArray(n)&&"number"==typeof n[0]?.dateNum&&"string"==typeof n[0]?.summary&&"string"==typeof n[0]?.eventType)return e}var n}(t);if(!e&&n)return r(n);const s="undefined"!=typeof gapi?gapi.client?.getToken():void 0;return s&&await async function(e){return!!(await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${e}`).then((e=>e.json()))).azp}(s.access_token)?m().then(p).then(r).catch(console.error):async function(){const e=o.map((e=>new Promise((t=>{const n=document.head.appendChild(document.createElement("script"));n.src=e,n.addEventListener("load",(()=>t()))}))));return Promise.all(e)}().then(f).then(function(e){return()=>new Promise(((t,n)=>{google.accounts.oauth2.initTokenClient({scope:u.join(" "),client_id:e.clientId,callback:y(e,t,n)}).requestAccessToken({prompt:""})}))}(t)).then(g).then(m).then(p).then(r).then(function({apiKey:e}){return t=>{sessionStorage.setItem(e,JSON.stringify(t))}}(t)).catch(console.error)}const h=s.toLocaleDateString().replace("/",`年（令和${s.getFullYear()-2018}年）`).replace("/","月").concat(`日 ${n[(s.getDay()+1)%7]}曜日`);a("date").prepend(document.createTextNode(h)),a("api-key").value=localStorage.getItem("apiKey")||"",a("client-id").value=localStorage.getItem("clientId")||"",a("form-config")?.addEventListener("submit",(e=>{v(),e.preventDefault()})),a("config")?.addEventListener("click",(()=>{const e=a("main"),t=e.classList.contains("hide-config")?"remove":"add";e.classList[t]("hide-config")})),a("refresh")?.addEventListener("click",(()=>{v(!0)})),v()})();