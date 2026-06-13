function R(a,e,t,i){return a==="male"?10*e+6.25*t-5*i+5:10*e+6.25*t-5*i-161}function j(a,e){const t=e/100,i=a/(t*t);let n="";return i<18.5?n="Underweight":i<25?n="Normal":i<30?n="Overweight":n="Obese",{value:Math.round(i*10)/10,category:n}}function O(a,e,t,i){const n=e/100,o=a*Math.pow(1+n/t,t*i);return{total:Math.round(o*100)/100,interest:Math.round((o-a)*100)/100}}function _(a,e,t){const i=e/100/12,n=t*12;if(i===0){const s=a/n;return{monthly:Math.round(s*100)/100,total:a,interest:0}}const o=a*(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1),r=o*n;return{monthly:Math.round(o*100)/100,total:Math.round(r*100)/100,interest:Math.round((r-a)*100)/100}}function W(a){const e=new Date(a),t=new Date;let i=t.getFullYear()-e.getFullYear(),n=t.getMonth()-e.getMonth(),o=t.getDate()-e.getDate();o<0&&(n--,o+=new Date(t.getFullYear(),t.getMonth(),0).getDate()),n<0&&(i--,n+=12);const r=Math.floor((t.getTime()-e.getTime())/(1e3*60*60*24));return{years:i,months:n,days:o,totalDays:r}}function q(a){return a*.453592}function Y(a){return a/.453592}function K(a,e){return(a*12+e)*2.54}function N(a){const e=a/2.54;let t=Math.floor(e/12),i=Math.round(e%12);return i===12&&(t+=1,i=0),{ft:t,inches:i}}function U(a){const e=a.toLowerCase();return e.match(/(tdee|total daily energy)/)?{category:"health",intent:"tdee"}:e.match(/(bmr|basal metabolic)/)?{category:"health",intent:"bmr"}:e.match(/\bbmi\b|body mass index/)?{category:"health",intent:"bmi"}:e.match(/(calorie|kcal|calories)/)?{category:"health",intent:"calorie"}:e.match(/(protein|macro|carb|fat)/)?{category:"health",intent:"macro"}:e.match(/(compound interest|compound)/)?{category:"finance",intent:"compound_interest"}:e.match(/(loan|mortgage|payment|emi)/)?{category:"finance",intent:"loan"}:e.match(/(fraction|divide|division)/)?{category:"math",intent:"fraction"}:e.match(/(percent|percentage|%)/)?{category:"math",intent:"percentage"}:e.match(/(average|mean|median|mode)/)?{category:"math",intent:"average"}:e.match(/(age|birthday|born|how old)/)?{category:"general",intent:"age"}:e.match(/^(hi|hello|hey|howdy)/)?{category:"general",intent:"greeting"}:e.match(/(thank|thanks|thx)/)?{category:"general",intent:"thanks"}:e.match(/(help|what can you do|features)/)?{category:"general",intent:"help"}:{category:"general",intent:"unknown"}}function P(a){const e=a.toLowerCase(),t={};e.match(/\b(male|man|boy|he|him)\b/)&&(t.gender="male"),e.match(/\b(female|woman|girl|she|her)\b/)&&(t.gender="female");const i=e.match(/(\d+)\s*(years?\s*old|yrs?|age)/);if(i&&(t.age=parseInt(i[1])),!t.age){const l=e.match(/age\s*(\d+)/);l&&(t.age=parseInt(l[1]))}const n=e.match(/(\d+\.?\d*)\s*kg/);n&&(t.weightKg=parseFloat(n[1]));const o=e.match(/(\d+\.?\d*)\s*(lbs?|pounds?)/);o&&!t.weightKg&&(t.weightKg=q(parseFloat(o[1])));const r=e.match(/(\d+\.?\d*)\s*cm/);r&&(t.heightCm=parseFloat(r[1]));const s=e.match(/(\d+)\s*(?:feet|foot|ft|')\s*(\d+)?\s*(?:inches|inch|in|\")?/);if(s&&!t.heightCm){const l=s[2]?parseInt(s[2]):0;t.heightCm=K(parseInt(s[1]),l)}return e.match(/(sedentary|desk|no exercise|little exercise)/)&&(t.activity="sedentary"),e.match(/(lightly active|light exercise|1-3 times)/)&&(t.activity="light"),e.match(/(moderately active|moderate|3-5 times)/)&&(t.activity="moderate"),e.match(/(very active|intense|6-7 times)/)&&(t.activity="active"),e.match(/(extremely active|athlete|heavy)/)&&(t.activity="very_active"),e.match(/(very active|athlete)/)&&!t.activity&&(t.activity="very_active"),t}function V(a){const e=a.toLowerCase(),t={},i=e.match(/\$?([\d,]+\.?\d*)/);i&&(t.amount=parseFloat(i[1].replace(/,/g,"")));const n=e.match(/(\d+\.?\d*)\s*%/);n&&(t.rate=parseFloat(n[1]));const o=e.match(/(\d+)\s*(?:years?|yrs?)/);o&&(t.years=parseInt(o[1]));const r=e.match(/(\d+)\s*months?/);return r&&(t.months=parseInt(r[1])),t}function G(a,e){if(e.gender&&e.age&&e.weightKg&&e.heightCm&&e.activity){const t=R(e.gender,e.weightKg,e.heightCm,e.age),i=N(e.heightCm),n=Math.round(Y(e.weightKg)),o=j(e.weightKg,e.heightCm),r=[{key:"sedentary",label:"Sedentary",mult:1.2,desc:"Desk job, little exercise"},{key:"light",label:"Lightly Active",mult:1.375,desc:"Exercise 1-3 days/week"},{key:"moderate",label:"Moderately Active",mult:1.55,desc:"Exercise 3-5 days/week"},{key:"active",label:"Very Active",mult:1.725,desc:"Exercise 6-7 days/week"},{key:"very_active",label:"Extremely Active",mult:1.9,desc:"Athlete / heavy labor"}],s=r.find(p=>p.key===e.activity)||r[2],l=Math.round(t*s.mult);return`**TDEE breakdown (offline)**

**Profile**
* ${e.gender==="male"?"Male":"Female"}
* Age: ${e.age}y
* Weight: ${Math.round(e.weightKg)}kg (${n} lbs)
* Height: ${Math.round(e.heightCm)}cm (${i.ft}'${i.inches}")

**BMR**
* ${Math.round(t)} kcal/day

**TDEE (${s.label})**
* **${l.toLocaleString()} kcal/day**

**BMI**
* **${o.value}** (${o.category})

Want calorie goals? Tell me: **cut / maintain / bulk**.`}if(a==="tdee"||a==="bmr"||a==="bmi"){const t=[];if(e.gender||t.push("Gender (male/female)"),e.age||t.push("Age"),e.weightKg||t.push("Weight (kg or lbs)"),e.heightCm||t.push("Height (cm or ft/in)"),e.activity||t.push("Activity (sedentary/light/moderate/active/very active)"),t.length>0)return`**To calculate your TDEE, I need 4-5 quick details**

`+t.slice(0,5).map(i=>`* ${i}`).join(`
`)+`

**Example:** "28 male, 85kg, 180cm, very active"`}return`**Ask me for your TDEE/BMR/BMI**

Give me: gender, age, weight, height, and activity.`}function J(a,e){if(a==="compound_interest"){if(e.amount&&e.rate&&(e.years||e.months)){const t=e.years||(e.months?e.months/12:1),i=O(e.amount,e.rate,12,t);return`**Compound interest (offline)**

* Principal: $${e.amount.toLocaleString()}
* Rate: ${e.rate}%
* Time: ${e.years||`${e.months} months`}

**Result:**
* Final: **$${i.total.toLocaleString()}**
* Interest: **$${i.interest.toLocaleString()}**`}return`**Compound interest**

Tell me: principal, interest rate(%), and time(years or months).`}if(a==="loan"){if(e.amount&&e.rate&&(e.years||e.months)){const t=e.years||(e.months?e.months/12:1),i=_(e.amount,e.rate,t);return`**Loan payment (offline)**

* Monthly: **$${i.monthly.toLocaleString()}**
* Total: **$${i.total.toLocaleString()}**
* Interest: **$${i.interest.toLocaleString()}**`}return`**Loan calculator**

Tell me: loan amount, interest rate(%), and term(years or months).`}return`**Finance help**

Try: "compound interest on $10000 at 7% for 10 years"`}function Q(a,e,t){const n=t.toLowerCase().match(/\d+\.?\d*/g)?.map(Number)||[];if(a==="percentage"&&n.length>=2){const o=n[0],r=n[1],s=o/100*r;return`**${o}% of ${r} = ${s}**`}if(a==="fraction"&&n.length>=2){const o=n[0],r=n[1],s=o/r;return`**${o}/${r} = ${s.toFixed(4)}**`}return a==="average"&&n.length>0?`**Average = ${(n.reduce((s,l)=>s+l,0)/n.length).toFixed(2)}**`:`**Math helper (offline)**

Ask me: percentages, fractions, or averages.`}function X(a,e,t){const i=t.toLowerCase();if(a==="greeting")return"Hey — I’m **TDEE Bot**. Hit me with your stats and I’ll do the math. ⚡";if(a==="help")return`I can calculate:
• **TDEE / BMR / BMI**
• **Calorie goals**
• **Compound interest / loan payments**

Try: "Calculate my TDEE".`;if(a==="thanks")return"Anytime. 💪 Want calorie goals next?";if(a==="age"){const n=i.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);if(n){const o=`${n[1]}-${n[2].padStart(2,"0")}-${n[3].padStart(2,"0")}`,r=W(o);return`**Age** 🎂

Born: ${o}
You are **${r.years} years** (+${r.months} months).`}return`**Age calculator** 🎂

Send your birthday (e.g., 1990-05-15).`}return`**TDEE Lab AI (offline)** ⚡

Try: "Calculate my TDEE" or "What is my BMI?"`}function Z(a){const{category:e,intent:t}=U(a);let i={};return e==="health"?(i=P(a),Object.keys(i).length>0,G(t,i)):e==="finance"?(i=V(a),Object.keys(i).length>0,J(t,i)):e==="math"?Q(t,i,a):X(t,i,a)}const ee=window.__CHAT_API_BASE__||"http://localhost:3001",te={role:"assistant",content:`**TDEE Lab** — your AI health & fitness co-pilot.

Drop your stats and I'll calculate your **TDEE / BMR / BMI** in seconds.

I can also help with:
* **Nutrition & macros** advice
* **Weight loss / muscle gain** guidance
* **Math & finance** calculations

*How can I help?*`};let d=[],I=!1;function ae(){ie(),ne(),fe(),oe()}function ie(){const a="ai-widget-styles";if(document.getElementById(a))return;const e=document.createElement("style");e.id=a,e.textContent=we(),document.head.appendChild(e)}function ne(){const a=document.createElement("div");a.id="ai-widget",a.innerHTML=`
    <button id="aiw-toggle" class="aiw-toggle" aria-label="Open AI chat">
      <svg class="aiw-toggle-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="aiw-toggle-icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <div id="aiw-panel" class="aiw-panel">
      <div class="aiw-header">
        <div class="aiw-header-left">
          <div class="aiw-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h.01M12 12h.01M16 12h.01"/>
              <path d="M12 6v1m0 10v1m-5-6H6m12 0h-1"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <div class="aiw-header-title">TDEE Lab AI</div>
            <div class="aiw-header-status">Smart mode — Gemini + Offline</div>
          </div>
        </div>
        <div class="aiw-header-actions">
          <button id="aiw-header-export" class="aiw-header-btn" title="Export chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button id="aiw-header-clear" class="aiw-header-btn" title="Clear chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div id="aiw-messages" class="aiw-messages"></div>
      <div id="aiw-suggestions" class="aiw-suggestions" style="display:none"></div>
      <div id="aiw-file-strip" class="aiw-file-strip" style="display:none"></div>

      <div class="aiw-input-area">
        <button id="aiw-attach" class="aiw-input-btn" title="Attach file">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <input id="aiw-file-input" type="file" accept="image/*,application/pdf,text/plain" multiple style="display:none">
        <textarea id="aiw-input" class="aiw-input" rows="1" placeholder="Ask TDEE Bot anything..."></textarea>
        <button id="aiw-send" class="aiw-input-btn aiw-send-btn" title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <div id="aiw-footer" class="aiw-footer">
        <span id="aiw-token-count">0 chars</span>
        <span class="aiw-footer-sep">&middot;</span>
        <span>Powered by Gemini 3.5 Flash</span>
      </div>
    </div>
  `,document.body.appendChild(a)}function oe(){const a=document.getElementById("aiw-toggle"),e=document.getElementById("aiw-panel"),t=document.getElementById("aiw-input"),i=document.getElementById("aiw-send"),n=document.getElementById("aiw-attach"),o=document.getElementById("aiw-file-input"),r=document.getElementById("aiw-header-clear"),s=document.getElementById("aiw-header-export"),l=document.getElementById("aiw-messages"),p=document.getElementById("aiw-token-count"),x=document.getElementById("aiw-suggestions"),v=a.querySelector(".aiw-toggle-icon-open"),k=a.querySelector(".aiw-toggle-icon-close");let c=!1;function f(){c=!0,e.classList.add("open"),v.style.display="none",k.style.display="block",a.setAttribute("aria-label","Close AI chat"),l.children.length===0&&C(),setTimeout(()=>t.focus(),300)}function M(){c=!1,e.classList.remove("open"),v.style.display="block",k.style.display="none",a.setAttribute("aria-label","Open AI chat")}a.addEventListener("click",()=>c?M():f()),t.addEventListener("input",()=>{t.style.height="auto",t.style.height=Math.min(t.scrollHeight,120)+"px",F(p,t.value)}),t.addEventListener("keydown",m=>{m.key==="Enter"&&!m.shiftKey&&(m.preventDefault(),T())}),i.addEventListener("click",()=>void T()),n.addEventListener("click",()=>o.click()),o.addEventListener("change",ce),r.addEventListener("click",()=>{confirm("Clear the entire conversation?")&&(d=[],B(),l.innerHTML="",x.style.display="none",C())}),s.addEventListener("click",me),l.addEventListener("click",m=>{const g=m.target;if(g.closest(".aiw-code-copy")){const w=g.closest(".aiw-code-copy"),b=w.dataset.blockId,h=document.getElementById(b||"");h&&navigator.clipboard.writeText(h.textContent||"").then(()=>{w.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied',setTimeout(()=>{w.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy'},2e3)});return}if(g.closest(".aiw-copy-msg")){const b=g.closest(".aiw-msg")?.dataset.content||"";navigator.clipboard.writeText(b).then(()=>{const h=g.closest(".aiw-copy-msg");h.classList.add("copied"),h.title="Copied!",setTimeout(()=>{h.classList.remove("copied"),h.title="Copy message"},2e3)});return}if(g.closest(".aiw-suggestion-btn")){const b=g.closest(".aiw-suggestion-btn").dataset.prompt||"";t.value=b,t.style.height="auto",t.style.height=Math.min(t.scrollHeight,120)+"px",F(p,t.value),x.style.display="none",T()}})}function F(a,e){const t=e.length;a.textContent=`${t} char${t!==1?"s":""}`}function C(){$(te)}let re=0;function L(a){let e=a;return e=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(t,i,n)=>{const o=`aiw-code-${re++}`;return`<div class="aiw-code-block">${i?`<span class="aiw-code-lang">${i}</span>`:""}<button class="aiw-code-copy" data-block-id="${o}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button><pre id="${o}"><code>${n.trim()}</code></pre></div>`}),e=e.replace(/`([^`]+)`/g,'<code class="aiw-code">$1</code>'),e=e.replace(/^### (.+)$/gm,'<div class="aiw-h3">$1</div>'),e=e.replace(/^## (.+)$/gm,'<div class="aiw-h2">$1</div>'),e=e.replace(/^# (.+)$/gm,'<div class="aiw-h1">$1</div>'),e=e.replace(/^> (.+)$/gm,'<div class="aiw-blockquote">$1</div>'),e=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,"<em>$1</em>"),e=e.replace(/~~(.*?)~~/g,"<del>$1</del>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a class="aiw-link" href="$2" target="_blank" rel="noopener">$1</a>'),e=e.replace(/^(-{3,}|\*{3,})$/gm,'<hr class="aiw-hr">'),e=se(e),e=e.replace(/^[•\-] (.+)$/gm,'<div class="aiw-list-item"><span class="aiw-bullet">&bull;</span> $1</div>'),e=e.replace(/^(\d+)\. (.+)$/gm,'<div class="aiw-list-item"><span class="aiw-num">$1.</span> $2</div>'),e=e.replace(/\n/g,"<br>"),e=e.replace(/(<\/div>)<br>/g,"$1"),e=e.replace(/(<hr[^>]*>)<br>/g,"$1"),e}function se(a){const e=a.split("<br>");let t=!1,i=[],n=[];for(const o of e){const r=o.trim();r.startsWith("|")&&r.endsWith("|")?(t=!0,i.push(r)):(t&&(n.push(A(i)),i=[],t=!1),n.push(o))}return t&&i.length>0&&n.push(A(i)),n.join("<br>")}function A(a){const e=a.map(i=>i.split("|").slice(1,-1).map(n=>n.trim())).filter(i=>i.length>0&&!i.every(n=>/^[-:]+$/.test(n)));if(e.length===0)return"";let t='<div class="aiw-table-wrap"><table class="aiw-table">';t+="<thead><tr>";for(const i of e[0])t+=`<th>${i}</th>`;if(t+="</tr></thead>",e.length>1){t+="<tbody>";for(let i=1;i<e.length;i++){t+="<tr>";for(const n of e[i])t+=`<td>${n}</td>`;t+="</tr>"}t+="</tbody>"}return t+="</table></div>",t}function E(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function le(a){return a.replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function D(a){return a.startsWith("image/")?"🖼":a==="application/pdf"?"📄":"📎"}let u=[];function ce(){const a=this.files;if(!(!a||a.length===0)){for(const e of Array.from(a)){const t={name:e.name,size:e.size,type:e.type},i=new FileReader;i.onload=n=>{const o=n.target?.result;e.type.startsWith("image/")&&(t.preview=o),t.data=o,u.push(t),S()},i.readAsDataURL(e)}this.value=""}}function S(){const a=document.getElementById("aiw-file-strip");if(u.length===0){a.style.display="none";return}a.style.display="flex",a.innerHTML=u.map((e,t)=>`
    <div class="aiw-file-chip">
      ${e.preview?`<img src="${e.preview}" class="aiw-chip-preview">`:`<span class="aiw-chip-icon">${D(e.type)}</span>`}
      <span class="aiw-chip-name">${E(e.name)}</span>
      <button class="aiw-chip-remove" data-index="${t}">&times;</button>
    </div>`).join(""),a.querySelectorAll(".aiw-chip-remove").forEach(e=>{e.addEventListener("click",()=>{const t=parseInt(e.dataset.index||"0");u.splice(t,1),S()})})}async function T(){if(I)return;const a=document.getElementById("aiw-input"),e=document.getElementById("aiw-token-count"),t=document.getElementById("aiw-suggestions"),i=a.value.trim();if(!i&&u.length===0)return;const n={role:"user",content:i,files:[...u]};d.push(n),$(n),a.value="",a.style.height="auto",t.style.display="none",u=[],S(),e.textContent="0 chars",de(),I=!0;try{const o=[];if(i&&o.push({text:i}),n.files&&n.files.length>0){for(const c of n.files)if(c.data){const f=c.data.split(",")[1];o.push({inlineData:{mimeType:c.type,data:f}})}}const r=[...d.slice(0,-1).map(c=>({role:c.role,parts:[{text:c.content}]})),{role:"user",parts:o}];r[r.length-1]={role:"user",parts:[{text:"You are the AI assistant for TDEE Lab — a sleek, modern health & fitness utility. Be direct, concise, and subtly witty. Use markdown: **bold** for key metrics, bullet points for lists, `inline code` for numbers. Never hallucinate data. If user asks for a calculation, show the math. Stay on-topic. After answering, offer a logical next step."},...r[r.length-1].parts||[]]};const s=await fetch(`${ee}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:r})});if(!s.ok){const c=await s.json().catch(()=>({error:"Request failed"}));throw new Error(c.error||`HTTP ${s.status}`)}H();const l=pe();let p="";const x=s.body.getReader(),v=new TextDecoder;for(;;){const{done:c,value:f}=await x.read();if(c)break;const M=v.decode(f,{stream:!0});p+=M,ge(l,p)}he(l,p);const k={role:"assistant",content:p};d.push(k),B()}catch(o){H();const s={role:"assistant",content:`**Offline mode** — backend unavailable, using local calculations.

${Z(i)}`};$(s),d.push(s),B(),console.warn("AI widget backend failed, using offline fallback:",o?.message||o)}finally{I=!1}}function de(){const a=document.getElementById("aiw-messages"),e=document.createElement("div");e.id="aiw-typing",e.className="aiw-msg aiw-msg-assistant",e.innerHTML='<div class="aiw-msg-bubble"><div class="aiw-thinking"><span class="aiw-thinking-label">Thinking</span><div class="aiw-typing-dots"><span></span><span></span><span></span></div></div></div>',a.appendChild(e),y()}function H(){const a=document.getElementById("aiw-typing");a&&a.remove()}function pe(){const a=document.getElementById("aiw-messages"),e=document.createElement("div");return e.className="aiw-msg aiw-msg-assistant",e.innerHTML='<div class="aiw-msg-bubble aiw-streaming"></div><button class="aiw-msg-actions"><span class="aiw-copy-msg" title="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button>',a.appendChild(e),y(),e.querySelector(".aiw-msg-bubble")}function ge(a,e){a.innerHTML=L(e),y()}function he(a,e){a.classList.remove("aiw-streaming"),a.innerHTML=L(e);const t=a.closest(".aiw-msg");t&&(t.dataset.content=e),y(),e.length>20&&ue(e)}function y(){const a=document.getElementById("aiw-messages");requestAnimationFrame(()=>{a.scrollTop=a.scrollHeight})}function $(a){const e=document.getElementById("aiw-messages"),t=document.createElement("div");t.className=`aiw-msg aiw-msg-${a.role}`,t.dataset.content=a.content;let i="";if(a.files&&a.files.length>0){i='<div class="aiw-msg-files">';for(const o of a.files)o.preview&&o.type.startsWith("image/")?i+=`<div class="aiw-file-preview"><img src="${o.preview}" alt="${o.name}"><span class="aiw-file-name">${E(o.name)}</span></div>`:i+=`<div class="aiw-file-preview aiw-file-doc"><span class="aiw-file-icon">${D(o.type)}</span><span class="aiw-file-name">${E(o.name)}</span></div>`;i+="</div>"}const n=a.role==="assistant"?'<button class="aiw-msg-actions"><span class="aiw-copy-msg" title="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button>':"";t.innerHTML=i+`<div class="aiw-msg-bubble">${L(a.content)}</div>`+n,e.appendChild(t),y()}function ue(a){const e=document.getElementById("aiw-suggestions"),t=a.toLowerCase();let i=[];t.includes("tdee")||t.includes("calorie")?i=["Calculate my TDEE","What macros should I eat?","How accurate is TDEE?"]:t.includes("bmr")||t.includes("basal")?i=["How do I increase my BMR?","BMR vs TDEE — explain the difference","What affects BMR the most?"]:t.includes("protein")||t.includes("macro")?i=["How much protein for muscle gain?","Best protein sources for vegetarians","How to track macros?"]:t.includes("weight")||t.includes("loss")||t.includes("fat")?i=["Safe rate of weight loss?","How to break a plateau?","Calorie deficit without losing muscle?"]:t.includes("bmi")?i=["Is BMI accurate for athletes?","How to lower my BMI?","BMI categories explained"]:i=["Calculate my TDEE","What are macros?","How to lose weight safely?"],e.innerHTML='<div class="aiw-suggestions-label">Suggested</div>'+i.map(n=>`<button class="aiw-suggestion-btn" data-prompt="${le(n)}">${E(n)}</button>`).join(""),e.style.display="flex"}const z="tdee_lab_chat_history";function B(){try{const a=d.map(e=>({role:e.role,content:e.content,files:e.files?e.files.map(t=>({name:t.name,size:t.size,type:t.type})):void 0}));sessionStorage.setItem(z,JSON.stringify(a))}catch{}}function fe(){try{const a=sessionStorage.getItem(z);if(a){const e=JSON.parse(a);if(Array.isArray(e)&&e.length>0){d=e;for(const t of d)$(t);return}}}catch{}C()}function me(){if(d.length===0){alert("No messages to export.");return}let a=`# TDEE Lab AI Chat Export

`;a+=`Exported: ${new Date().toLocaleString()}

---

`;for(const n of d){const o=n.role==="user"?"**You**":"**TDEE Lab AI**";a+=`### ${o}

${n.content}

---

`}const e=new Blob([a],{type:"text/markdown"}),t=URL.createObjectURL(e),i=document.createElement("a");i.href=t,i.download=`tdee-lab-chat-${new Date().toISOString().slice(0,10)}.md`,i.click(),URL.revokeObjectURL(t)}function we(){return`
#ai-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Toggle Button ── */
.aiw-toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.aiw-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(79, 70, 229, 0.5);
}
.aiw-toggle:active {
  transform: scale(0.95);
}

/* ── Panel ── */
.aiw-panel {
  position: absolute;
  bottom: 68px;
  right: 0;
  width: 400px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  opacity: 0;
  transform: translateY(16px) scale(0.96);
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.aiw-panel.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

html.dark .aiw-panel {
  background: #1a1a2e;
  border-color: #2d2d4a;
}

/* ── Header ── */
.aiw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: #fff;
  flex-shrink: 0;
}
.aiw-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.aiw-avatar {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.aiw-header-title {
  font-weight: 600;
  font-size: 15px;
}
.aiw-header-status {
  font-size: 11px;
  opacity: 0.85;
}
.aiw-header-actions {
  display: flex;
  gap: 4px;
}
.aiw-header-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.aiw-header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ── Messages ── */
.aiw-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f9fafb;
}

html.dark .aiw-messages {
  background: #111122;
}

.aiw-msg {
  display: flex;
  flex-direction: column;
  max-width: 88%;
  animation: aiwFadeIn 0.3s ease;
  position: relative;
}
.aiw-msg-user {
  align-self: flex-end;
}
.aiw-msg-assistant {
  align-self: flex-start;
}

/* ── Message actions ── */
.aiw-msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.aiw-msg:hover .aiw-msg-actions {
  opacity: 1;
}
.aiw-copy-msg {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  transition: all 0.2s;
}
.aiw-copy-msg:hover {
  background: #f3f4f6;
  color: #4F46E5;
  border-color: #4F46E5;
}
.aiw-copy-msg.copied {
  color: #10b981;
  border-color: #10b981;
}
html.dark .aiw-copy-msg {
  border-color: #2d2d4a;
  color: #9ca3af;
}
html.dark .aiw-copy-msg:hover {
  background: #2d2d4a;
  color: #818cf8;
  border-color: #818cf8;
}

.aiw-msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.65;
  word-wrap: break-word;
  white-space: pre-wrap;
}
.aiw-msg-user .aiw-msg-bubble {
  background: #4F46E5;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.aiw-msg-assistant .aiw-msg-bubble {
  background: #fff;
  color: #1f2937;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

html.dark .aiw-msg-assistant .aiw-msg-bubble {
  background: #1e1e3a;
  color: #e5e5e5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.aiw-msg-bubble strong {
  font-weight: 600;
}

/* ── Inline code ── */
.aiw-code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
html.dark .aiw-code {
  background: rgba(255, 255, 255, 0.1);
}

/* ── Code blocks ── */
.aiw-code-block {
  position: relative;
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e2e;
}
.aiw-code-block pre {
  padding: 14px 16px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #e5e5e5;
}
.aiw-code-block code {
  color: inherit;
  background: none;
  padding: 0;
}
.aiw-code-lang {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  font-family: 'Inter', sans-serif;
  pointer-events: none;
}
.aiw-code-copy {
  position: absolute;
  top: 6px;
  right: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #9ca3af;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.aiw-code-copy:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
html.dark .aiw-code-block {
  background: #0d0d1a;
}
html.dark .aiw-code-copy {
  background: rgba(255, 255, 255, 0.08);
  color: #9ca3af;
}
html.dark .aiw-code-copy:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ── Headers ── */
.aiw-h1, .aiw-h2, .aiw-h3 {
  font-weight: 700;
  margin: 10px 0 6px;
}
.aiw-h1 { font-size: 18px; }
.aiw-h2 { font-size: 16px; }
.aiw-h3 { font-size: 14px; }

/* ── Blockquotes ── */
.aiw-blockquote {
  border-left: 3px solid #4F46E5;
  padding: 8px 14px;
  margin: 8px 0;
  background: rgba(79, 70, 229, 0.06);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #4b5563;
}
html.dark .aiw-blockquote {
  background: rgba(129, 140, 248, 0.1);
  color: #c4b5fd;
}

/* ── Lists ── */
.aiw-list-item {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}
.aiw-bullet, .aiw-num {
  color: #4F46E5;
  font-weight: 600;
  flex-shrink: 0;
}
html.dark .aiw-bullet,
html.dark .aiw-num {
  color: #818cf8;
}

/* ── Links ── */
.aiw-link {
  color: #4F46E5;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.aiw-link:hover {
  color: #4338ca;
}
html.dark .aiw-link {
  color: #818cf8;
}
html.dark .aiw-link:hover {
  color: #a5b4fc;
}

/* ── Horizontal rule ── */
.aiw-hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 12px 0;
}
html.dark .aiw-hr {
  border-top-color: #2d2d4a;
}

/* ── Tables ── */
.aiw-table-wrap {
  overflow-x: auto;
  margin: 8px 0;
}
.aiw-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}
.aiw-table th,
.aiw-table td {
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  text-align: left;
}
.aiw-table th {
  background: #f3f4f6;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
html.dark .aiw-table th,
html.dark .aiw-table td {
  border-color: #2d2d4a;
}
html.dark .aiw-table th {
  background: #1a1a3a;
}

/* Streaming cursor */
.aiw-streaming::after {
  content: '\\258C';
  animation: aiwBlink 1s step-end infinite;
  color: #4F46E5;
}

/* ── Thinking indicator ── */
.aiw-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
}
.aiw-thinking-label {
  font-size: 13px;
  color: #6b7280;
}
html.dark .aiw-thinking-label {
  color: #9ca3af;
}

/* ── Typing indicator ── */
.aiw-typing-dots {
  display: flex;
  gap: 5px;
  padding: 4px 0;
}
.aiw-typing-dots span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: aiwTyping 1.4s infinite;
}
.aiw-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.aiw-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
html.dark .aiw-typing-dots span {
  background: #6b7280;
}

/* ── Suggested prompts ── */
.aiw-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px 4px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
html.dark .aiw-suggestions {
  background: #111122;
  border-top-color: #2d2d4a;
}
.aiw-suggestions-label {
  width: 100%;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.aiw-suggestion-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #fff;
  color: #4F46E5;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.aiw-suggestion-btn:hover {
  background: #4F46E5;
  color: #fff;
  border-color: #4F46E5;
}
html.dark .aiw-suggestion-btn {
  background: #1e1e3a;
  border-color: #2d2d4a;
  color: #818cf8;
}
html.dark .aiw-suggestion-btn:hover {
  background: #818cf8;
  color: #fff;
}

/* ── File preview in messages ── */
.aiw-msg-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}
.aiw-file-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.15);
}
.aiw-msg-user .aiw-file-preview {
  background: rgba(255, 255, 255, 0.15);
}
.aiw-msg-assistant .aiw-file-preview {
  background: #f0f0f0;
}
html.dark .aiw-msg-assistant .aiw-file-preview {
  background: #2a2a4a;
}
.aiw-file-preview img {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
}
.aiw-file-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.aiw-file-icon {
  font-size: 18px;
}

/* ── File input strip ── */
.aiw-file-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
html.dark .aiw-file-strip {
  background: #111122;
  border-top-color: #2d2d4a;
}
.aiw-file-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
}
html.dark .aiw-file-chip {
  background: #2d2d4a;
  color: #e5e5e5;
}
.aiw-chip-preview {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  object-fit: cover;
}
.aiw-chip-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.aiw-chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  color: #666;
  padding: 0 2px;
}
html.dark .aiw-chip-remove {
  color: #aaa;
}
.aiw-chip-remove:hover {
  color: #ef4444;
}

/* ── Input area ── */
.aiw-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 16px 10px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}
html.dark .aiw-input-area {
  background: #1a1a2e;
  border-top-color: #2d2d4a;
}
.aiw-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  resize: none;
  max-height: 120px;
  line-height: 1.4;
  background: #f9fafb;
  color: #1f2937;
  transition: border-color 0.2s;
}
html.dark .aiw-input {
  background: #111122;
  border-color: #2d2d4a;
  color: #e5e5e5;
}
.aiw-input:focus {
  border-color: #4F46E5;
}
.aiw-input::placeholder {
  color: #9ca3af;
}
.aiw-input-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #6b7280;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
html.dark .aiw-input-btn {
  color: #9ca3af;
}
.aiw-input-btn:hover {
  background: #f3f4f6;
  color: #4F46E5;
}
html.dark .aiw-input-btn:hover {
  background: #2d2d4a;
}
.aiw-send-btn {
  background: #4F46E5;
  color: #fff !important;
}
.aiw-send-btn:hover {
  background: #4338CA !important;
}

/* ── Footer ── */
.aiw-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 11px;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}
html.dark .aiw-footer {
  background: #1a1a2e;
  border-top-color: #2d2d4a;
}
.aiw-footer-sep {
  opacity: 0.4;
}

/* ── Animations ── */
@keyframes aiwFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes aiwBlink {
  50% { opacity: 0; }
}
@keyframes aiwTyping {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .aiw-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
  }
  #ai-widget {
    bottom: 16px;
    right: 16px;
  }
}
`}document.addEventListener("DOMContentLoaded",ae);
