const D=window.__CHAT_API_BASE__||"http://localhost:3001",j={role:"assistant",content:`Hello! I'm **TDEE Bot**, your AI health & fitness assistant.

I can help you with:
- **TDEE, BMR, BMI** calculations & explanations
- **Nutrition & macros** advice
- **Weight loss / muscle gain** guidance
- **General health & fitness** questions
- **Math, finance, age** calculations too!

You can also **upload images, PDFs, or text files** for me to analyze.

*How can I help you today?*`};let r=[],B=!1;function R(){O(),_(),Z(),q()}function O(){const t="ai-widget-styles";if(document.getElementById(t))return;const e=document.createElement("style");e.id=t,e.textContent=ee(),document.head.appendChild(e)}function _(){const t=document.createElement("div");t.id="ai-widget",t.innerHTML=`
    <button id="aiw-toggle" class="aiw-toggle" aria-label="Open AI chat">
      <svg class="aiw-toggle-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="aiw-toggle-icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <div id="aiw-panel" class="aiw-panel">
      <!-- Header -->
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
            <div class="aiw-header-title">TDEE Bot</div>
            <div class="aiw-header-status">Online &middot; Gemini 3.5 Flash</div>
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

      <!-- Messages -->
      <div id="aiw-messages" class="aiw-messages"></div>

      <!-- Suggested prompts -->
      <div id="aiw-suggestions" class="aiw-suggestions" style="display:none"></div>

      <!-- File preview strip -->
      <div id="aiw-file-strip" class="aiw-file-strip" style="display:none"></div>

      <!-- Input area -->
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

      <!-- Footer -->
      <div id="aiw-footer" class="aiw-footer">
        <span id="aiw-token-count">0 chars</span>
        <span class="aiw-footer-sep">&middot;</span>
        <span>Powered by Gemini 3.5 Flash</span>
      </div>
    </div>
  `,document.body.appendChild(t)}function q(){const t=document.getElementById("aiw-toggle"),e=document.getElementById("aiw-panel"),a=document.getElementById("aiw-input"),i=document.getElementById("aiw-send"),o=document.getElementById("aiw-attach"),n=document.getElementById("aiw-file-input"),l=document.getElementById("aiw-header-clear"),f=document.getElementById("aiw-header-export"),w=document.getElementById("aiw-messages");document.getElementById("aiw-token-count");const x=document.getElementById("aiw-suggestions"),y=t.querySelector(".aiw-toggle-icon-open"),s=t.querySelector(".aiw-toggle-icon-close");let c=!1;function E(){c=!0,e.classList.add("open"),y.style.display="none",s.style.display="block",t.setAttribute("aria-label","Close AI chat"),w.children.length===0&&$(),setTimeout(()=>a.focus(),300)}function A(){c=!1,e.classList.remove("open"),y.style.display="block",s.style.display="none",t.setAttribute("aria-label","Open AI chat")}t.addEventListener("click",()=>c?A():E()),a.addEventListener("input",()=>{a.style.height="auto",a.style.height=Math.min(a.scrollHeight,120)+"px",C()}),a.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),I())}),i.addEventListener("click",I),o.addEventListener("click",()=>n.click()),n.addEventListener("change",X),l.addEventListener("click",()=>{confirm("Clear the entire conversation?")&&(r=[],z(),w.innerHTML="",x.style.display="none",$())}),f.addEventListener("click",N),w.addEventListener("click",u=>{const d=u.target;if(d.closest(".aiw-code-copy")){const h=d.closest(".aiw-code-copy"),m=h.dataset.blockId,p=document.getElementById(m||"");p&&navigator.clipboard.writeText(p.textContent||"").then(()=>{h.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied',setTimeout(()=>{h.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy'},2e3)});return}if(d.closest(".aiw-copy-msg")){const m=d.closest(".aiw-msg")?.dataset.content||"";navigator.clipboard.writeText(m).then(()=>{const p=d.closest(".aiw-copy-msg");p.classList.add("copied"),p.title="Copied!",setTimeout(()=>{p.classList.remove("copied"),p.title="Copy message"},2e3)});return}if(d.closest(".aiw-suggestion-btn")){const m=d.closest(".aiw-suggestion-btn").dataset.prompt||"";a.value=m,a.style.height="auto",a.style.height=Math.min(a.scrollHeight,120)+"px",C(),x.style.display="none",I()}})}function C(){const t=document.getElementById("aiw-input"),e=document.getElementById("aiw-token-count");if(e&&t){const a=t.value.length;e.textContent=`${a} char${a!==1?"s":""}`}}function W(t){const e=document.getElementById("aiw-suggestions"),a=t.toLowerCase();let i=[];a.includes("tdee")||a.includes("calorie")?i=["Calculate my TDEE","What macros should I eat?","How accurate is TDEE?"]:a.includes("bmr")||a.includes("basal")?i=["How do I increase my BMR?","BMR vs TDEE — explain the difference","What affects BMR the most?"]:a.includes("protein")||a.includes("macro")?i=["How much protein for muscle gain?","Best protein sources for vegetarians","How to track macros easily?"]:a.includes("weight")||a.includes("loss")||a.includes("fat")?i=["Safe rate of weight loss?","How to break a weight loss plateau?","Calorie deficit without losing muscle?"]:a.includes("bmi")?i=["Is BMI accurate for athletes?","How to lower my BMI?","BMI categories explained"]:i=["Calculate my TDEE","What are macros?","How to lose weight safely?"],e.innerHTML='<div class="aiw-suggestions-label">Suggested</div>'+i.map(o=>`<button class="aiw-suggestion-btn" data-prompt="${Q(o)}">${k(o)}</button>`).join(""),e.style.display="flex"}function Y(){const t=document.getElementById("aiw-suggestions");t.style.display="none"}function N(){if(r.length===0){alert("No messages to export.");return}let t=`# TDEE Bot Chat Export

`;t+=`Exported: ${new Date().toLocaleString()}

---

`;for(const o of r){const n=o.role==="user"?"**You**":"**TDEE Bot**";t+=`### ${n}

${o.content}

---

`}const e=new Blob([t],{type:"text/markdown"}),a=URL.createObjectURL(e),i=document.createElement("a");i.href=a,i.download=`tdee-bot-chat-${new Date().toISOString().slice(0,10)}.md`,i.click(),URL.revokeObjectURL(a)}function $(){v(j)}function v(t){const e=document.getElementById("aiw-messages"),a=document.createElement("div");a.className=`aiw-msg aiw-msg-${t.role}`,a.dataset.content=t.content;let i="";if(t.files&&t.files.length>0){i='<div class="aiw-msg-files">';for(const n of t.files)n.preview&&n.type.startsWith("image/")?i+=`<div class="aiw-file-preview"><img src="${n.preview}" alt="${n.name}"><span class="aiw-file-name">${k(n.name)}</span></div>`:i+=`<div class="aiw-file-preview aiw-file-doc"><span class="aiw-file-icon">${S(n.type)}</span><span class="aiw-file-name">${k(n.name)}</span></div>`;i+="</div>"}const o=t.role==="assistant"?'<button class="aiw-msg-actions"><span class="aiw-copy-msg" title="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button>':"";a.innerHTML=i+`<div class="aiw-msg-bubble">${M(t.content)}</div>`+o,e.appendChild(a),b()}function P(){const t=document.getElementById("aiw-messages"),e=document.createElement("div");return e.className="aiw-msg aiw-msg-assistant",e.innerHTML='<div class="aiw-msg-bubble aiw-streaming"></div><button class="aiw-msg-actions"><span class="aiw-copy-msg" title="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button>',t.appendChild(e),b(),e.querySelector(".aiw-msg-bubble")}function U(t,e){t.innerHTML=M(e),b()}function V(t,e){t.classList.remove("aiw-streaming"),t.innerHTML=M(e);const a=t.closest(".aiw-msg");a&&(a.dataset.content=e),b(),e.length>20&&W(e)}function G(){const t=document.getElementById("aiw-messages"),e=document.createElement("div");e.id="aiw-typing",e.className="aiw-msg aiw-msg-assistant",e.innerHTML='<div class="aiw-msg-bubble"><div class="aiw-thinking"><span class="aiw-thinking-label">Thinking</span><div class="aiw-typing-dots"><span></span><span></span><span></span></div></div></div>',t.appendChild(e),b()}function L(){const t=document.getElementById("aiw-typing");t&&t.remove()}function b(){const t=document.getElementById("aiw-messages");requestAnimationFrame(()=>{t.scrollTop=t.scrollHeight})}let J=0;function M(t){let e=t;return e=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),e=e.replace(/```(\w*)\n([\s\S]*?)```/g,(a,i,o)=>{const n=`aiw-code-${J++}`;return`<div class="aiw-code-block">${i?`<span class="aiw-code-lang">${i}</span>`:""}<button class="aiw-code-copy" data-block-id="${n}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button><pre id="${n}"><code>${o.trim()}</code></pre></div>`}),e=e.replace(/`([^`]+)`/g,'<code class="aiw-code">$1</code>'),e=e.replace(/^### (.+)$/gm,'<div class="aiw-h3">$1</div>'),e=e.replace(/^## (.+)$/gm,'<div class="aiw-h2">$1</div>'),e=e.replace(/^# (.+)$/gm,'<div class="aiw-h1">$1</div>'),e=e.replace(/^&gt; (.+)$/gm,'<div class="aiw-blockquote">$1</div>'),e=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,"<em>$1</em>"),e=e.replace(/~~(.*?)~~/g,"<del>$1</del>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a class="aiw-link" href="$2" target="_blank" rel="noopener">$1</a>'),e=e.replace(/^(-{3,}|\*{3,})$/gm,'<hr class="aiw-hr">'),e=K(e),e=e.replace(/^[•\-] (.+)$/gm,'<div class="aiw-list-item"><span class="aiw-bullet">&bull;</span> $1</div>'),e=e.replace(/^(\d+)\. (.+)$/gm,'<div class="aiw-list-item"><span class="aiw-num">$1.</span> $2</div>'),e=e.replace(/\n/g,"<br>"),e=e.replace(/(<\/div>)<br>/g,"$1"),e=e.replace(/(<hr[^>]*>)<br>/g,"$1"),e}function K(t){const e=t.split("<br>");let a=!1,i=[],o=[];for(const n of e){const l=n.trim();l.startsWith("|")&&l.endsWith("|")?(a=!0,i.push(l)):(a&&(o.push(H(i)),i=[],a=!1),o.push(n))}return a&&i.length>0&&o.push(H(i)),o.join("<br>")}function H(t){const e=t.map(i=>i.split("|").slice(1,-1).map(o=>o.trim())).filter(i=>i.length>0&&!i.every(o=>/^[-:]+$/.test(o)));if(e.length===0)return"";let a='<div class="aiw-table-wrap"><table class="aiw-table">';a+="<thead><tr>";for(const i of e[0])a+=`<th>${i}</th>`;if(a+="</tr></thead>",e.length>1){a+="<tbody>";for(let i=1;i<e.length;i++){a+="<tr>";for(const o of e[i])a+=`<td>${o}</td>`;a+="</tr>"}a+="</tbody>"}return a+="</table></div>",a}function k(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Q(t){return t.replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function S(t){return t.startsWith("image/")?"🖼":t==="application/pdf"?"📄":"📎"}let g=[];function X(){const t=this.files;if(!(!t||t.length===0)){for(const e of Array.from(t)){const a={name:e.name,size:e.size,type:e.type},i=new FileReader;i.onload=o=>{const n=o.target?.result;e.type.startsWith("image/")&&(a.preview=n),a.data=n,g.push(a),T()},i.readAsDataURL(e)}this.value=""}}function T(){const t=document.getElementById("aiw-file-strip");if(g.length===0){t.style.display="none";return}t.style.display="flex",t.innerHTML=g.map((e,a)=>`
    <div class="aiw-file-chip">
      ${e.preview?`<img src="${e.preview}" class="aiw-chip-preview">`:`<span class="aiw-chip-icon">${S(e.type)}</span>`}
      <span class="aiw-chip-name">${k(e.name)}</span>
      <button class="aiw-chip-remove" data-index="${a}">&times;</button>
    </div>`).join(""),t.querySelectorAll(".aiw-chip-remove").forEach(e=>{e.addEventListener("click",()=>{const a=parseInt(e.dataset.index||"0");g.splice(a,1),T()})})}async function I(){if(B)return;const t=document.getElementById("aiw-input"),e=t.value.trim();if(!e&&g.length===0)return;const a={role:"user",content:e,files:[...g]};r.push(a),v(a),t.value="",t.style.height="auto",Y(),g=[],T(),C(),G(),B=!0;try{const i=[];if(e&&i.push({text:e}),a.files&&a.files.length>0){for(const s of a.files)if(s.data){const c=s.data.split(",")[1];i.push({inlineData:{mimeType:s.type,data:c}})}}const o=[...r.slice(0,-1).map(s=>({role:s.role,parts:[{text:s.content}]})),{role:"user",parts:i}],n=await fetch(`${D}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:o})});if(!n.ok){const s=await n.json().catch(()=>({error:"Request failed"}));throw new Error(s.error||`HTTP ${n.status}`)}L();const l=P();let f="";const w=n.body.getReader(),x=new TextDecoder;for(;;){const{done:s,value:c}=await w.read();if(s)break;const E=x.decode(c,{stream:!0});f+=E,U(l,f)}V(l,f);const y={role:"assistant",content:f};r.push(y),z()}catch(i){L();const o={role:"assistant",content:`**Sorry, something went wrong.**

${i.message||"Please try again or check your connection."}

If the issue persists, the server may be offline.`};v(o),r.push(o)}finally{B=!1}}const F="tdee_lab_chat_history";function z(){try{const t=r.map(e=>({role:e.role,content:e.content,files:e.files?e.files.map(a=>({name:a.name,size:a.size,type:a.type})):void 0}));sessionStorage.setItem(F,JSON.stringify(t))}catch{}}function Z(){try{const t=sessionStorage.getItem(F);if(t){const e=JSON.parse(t);if(Array.isArray(e)&&e.length>0){r=e;for(const a of r)v(a);return}}}catch{}$()}function ee(){return`
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
`}document.addEventListener("DOMContentLoaded",R);
