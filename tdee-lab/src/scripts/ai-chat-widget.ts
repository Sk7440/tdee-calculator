// TDEE Lab AI Chat Widget — Powered by Gemini
// Secure backend proxy at {API_BASE}/api/chat

const API_BASE = (window as any).__CHAT_API_BASE__ || 'http://localhost:3001';

import { generateOfflineResponse } from './chatbot-core';


interface ChatPart {
    text?: string;
    inlineData?: { mimeType: string; data: string };
}

interface FileInfo {
    name: string;
    size: number;
    type: string;
    data?: string;
    preview?: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    parts?: ChatPart[];
    files?: FileInfo[];
}

const WELCOME_MSG: ChatMessage = {
    role: 'assistant',
    content:
        '**TDEE Lab** — your all-in-one health & fitness toolkit.\n\n' +
        "I can use every calculator on the site. Here's what I can do:\n\n" +
        '* **TDEE / BMR / BMI** — full health calculator at /tdee-calculator/\n' +
        '* **Calorie goals & macros** — for cut, maintain, or bulk\n' +
        '* **Financial tools** — loans, mortgages, investments at /financial-calculator/\n' +
        '* **Math tools** — basic, fractions, percentages at /math-calculator/\n' +
        '* **Age / date / conversions** at /other-calculator/\n' +
        '* **Educational guides** at /what-is-tdee/ and /bmr-vs-tdee/\n\n' +
        'Drop your stats or ask a question — I\'ll handle the rest.',
};

let messages: ChatMessage[] = [];
let isStreaming = false;

// ─── Page context detection ───────────────────────────────────────
function getPageContext(): string {
    const path = window.location.pathname;
    if (path.includes('/tdee-calculator')) return 'The user is on the **TDEE Calculator** page (/tdee-calculator/) — they can calculate BMR, TDEE, BMI, calorie goals, and macros.';
    if (path.includes('/what-is-tdee')) return 'The user is on the **What is TDEE?** educational page (/what-is-tdee/) — learn what TDEE is, how it\'s calculated, and why it matters.';
    if (path.includes('/bmr-vs-tdee')) return 'The user is on the **BMR vs TDEE** comparison page (/bmr-vs-tdee/) — understand the difference between Basal Metabolic Rate and Total Daily Energy Expenditure.';
    if (path.includes('/math-calculator')) return 'The user is on the **Math Calculator** page (/math-calculator/) — basic math, fractions, percentages, and scientific calculations.';
    if (path.includes('/financial-calculator')) return 'The user is on the **Financial Calculator** page (/financial-calculator/) — loan, mortgage, and investment calculators.';
    if (path.includes('/other-calculator')) return 'The user is on the **Other Calculators** page (/other-calculator/) — age calculator, date calculator, and conversion tools.';
    return '';
}

export function initAIWidget() {
    injectStyles();
    buildWidget();
    loadHistory();
    bindUI();
}

function injectStyles() {
    const id = 'ai-widget-styles';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = getCSS();
    document.head.appendChild(style);
}

function buildWidget() {
    const container = document.createElement('div');
    container.id = 'ai-widget';
    container.innerHTML = `
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
  `;
    document.body.appendChild(container);
}

function bindUI() {
    const toggle = document.getElementById('aiw-toggle')!;
    const panel = document.getElementById('aiw-panel')!;
    const input = document.getElementById('aiw-input') as HTMLTextAreaElement;
    const sendBtn = document.getElementById('aiw-send')!;
    const attachBtn = document.getElementById('aiw-attach')!;
    const fileInput = document.getElementById('aiw-file-input') as HTMLInputElement;
    const clearBtn = document.getElementById('aiw-header-clear')!;
    const exportBtn = document.getElementById('aiw-header-export')!;
    const msgContainer = document.getElementById('aiw-messages')!;
    const tokenCount = document.getElementById('aiw-token-count')!;
    const suggestionsEl = document.getElementById('aiw-suggestions')!;

    const openIcon = toggle.querySelector('.aiw-toggle-icon-open') as SVGElement;
    const closeIcon = toggle.querySelector('.aiw-toggle-icon-close') as SVGElement;

    let isOpen = false;

    function open() {
        isOpen = true;
        panel.classList.add('open');
        openIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        toggle.setAttribute('aria-label', 'Close AI chat');
        if (msgContainer.children.length === 0) renderWelcome();
        setTimeout(() => input.focus(), 300);
    }

    function close() {
        isOpen = false;
        panel.classList.remove('open');
        openIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        toggle.setAttribute('aria-label', 'Open AI chat');
    }

    toggle.addEventListener('click', () => (isOpen ? close() : open()));

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        updateTokenCount(tokenCount, input.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void sendMessage();
        }
    });

    sendBtn.addEventListener('click', () => void sendMessage());

    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear the entire conversation?')) {
            messages = [];
            saveHistory();
            msgContainer.innerHTML = '';
            suggestionsEl.style.display = 'none';
            renderWelcome();
        }
    });

    exportBtn.addEventListener('click', exportChat);

    msgContainer.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        if (target.closest('.aiw-code-copy')) {
            const btn = target.closest('.aiw-code-copy') as HTMLElement;
            const blockId = btn.dataset.blockId;
            const codeEl = document.getElementById(blockId || '');
            if (codeEl) {
                navigator.clipboard.writeText(codeEl.textContent || '').then(() => {
                    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied';
                    setTimeout(() => {
                        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
                    }, 2000);
                });
            }
            return;
        }

        if (target.closest('.aiw-copy-msg')) {
            const msgEl = target.closest('.aiw-msg') as HTMLElement;
            const content = msgEl?.dataset.content || '';
            navigator.clipboard.writeText(content).then(() => {
                const btn = target.closest('.aiw-copy-msg') as HTMLElement;
                btn.classList.add('copied');
                btn.title = 'Copied!';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.title = 'Copy message';
                }, 2000);
            });
            return;
        }

        if (target.closest('.aiw-suggestion-btn')) {
            const btn = target.closest('.aiw-suggestion-btn') as HTMLElement;
            const prompt = btn.dataset.prompt || '';
            input.value = prompt;
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            updateTokenCount(tokenCount, input.value);
            suggestionsEl.style.display = 'none';
            void sendMessage();
        }
    });
}

function updateTokenCount(tokenCountEl: HTMLElement, text: string) {
    const len = text.length;
    tokenCountEl.textContent = `${len} char${len !== 1 ? 's' : ''}`;
}

function renderWelcome() {
    addMessage(WELCOME_MSG);
}

let codeBlockCounter = 0;

function formatContent(text: string): string {
    let html = text;
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
        const id = `aiw-code-${codeBlockCounter++}`;
        const langLabel = lang ? `<span class="aiw-code-lang">${lang}</span>` : '';
        return `<div class="aiw-code-block">${langLabel}<button class="aiw-code-copy" data-block-id="${id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button><pre id="${id}"><code>${code.trim()}</code></pre></div>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code class="aiw-code">$1</code>');
    html = html.replace(/^### (.+)$/gm, '<div class="aiw-h3">$1</div>');
    html = html.replace(/^## (.+)$/gm, '<div class="aiw-h2">$1</div>');
    html = html.replace(/^# (.+)$/gm, '<div class="aiw-h1">$1</div>');

    html = html.replace(/^> (.+)$/gm, '<div class="aiw-blockquote">$1</div>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="aiw-link" href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/^(-{3,}|\*{3,})$/gm, '<hr class="aiw-hr">');

    html = formatTables(html);

    html = html.replace(/^[•\-] (.+)$/gm, '<div class="aiw-list-item"><span class="aiw-bullet">&bull;</span> $1</div>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<div class="aiw-list-item"><span class="aiw-num">$1.</span> $2</div>');

    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<\/div>)<br>/g, '$1');
    html = html.replace(/(<hr[^>]*>)<br>/g, '$1');
    return html;
}

function formatTables(html: string): string {
    const lines = html.split('<br>');
    let inTable = false;
    let tableLines: string[] = [];
    let result: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            inTable = true;
            tableLines.push(trimmed);
        } else {
            if (inTable) {
                result.push(buildTable(tableLines));
                tableLines = [];
                inTable = false;
            }
            result.push(line);
        }
    }

    if (inTable && tableLines.length > 0) result.push(buildTable(tableLines));
    return result.join('<br>');
}

function buildTable(lines: string[]): string {
    const rows = lines
        .map((l) =>
            l
                .split('|')
                .slice(1, -1)
                .map((c) => c.trim()),
        )
        .filter((cells) => cells.length > 0 && !cells.every((c) => /^[-:]+$/.test(c)));

    if (rows.length === 0) return '';

    let tableHTML = '<div class="aiw-table-wrap"><table class="aiw-table">';
    tableHTML += '<thead><tr>';
    for (const cell of rows[0]) tableHTML += `<th>${cell}</th>`;
    tableHTML += '</tr></thead>';

    if (rows.length > 1) {
        tableHTML += '<tbody>';
        for (let i = 1; i < rows.length; i++) {
            tableHTML += '<tr>';
            for (const cell of rows[i]) tableHTML += `<td>${cell}</td>`;
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody>';
    }

    tableHTML += '</table></div>';
    return tableHTML;
}

function escapeHTML(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getFileIcon(mime: string): string {
    if (mime.startsWith('image/')) return '🖼';
    if (mime === 'application/pdf') return '📄';
    return '📎';
}

let pendingFiles: FileInfo[] = [];

function handleFileSelect(this: HTMLInputElement) {
    const files = this.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
        const info: FileInfo = { name: file.name, size: file.size, type: file.type };
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (file.type.startsWith('image/')) info.preview = result;
            info.data = result;
            pendingFiles.push(info);
            updateFileStrip();
        };
        reader.readAsDataURL(file);
    }

    this.value = '';
}

function updateFileStrip() {
    const strip = document.getElementById('aiw-file-strip')!;
    if (pendingFiles.length === 0) {
        strip.style.display = 'none';
        return;
    }

    strip.style.display = 'flex';
    strip.innerHTML = pendingFiles
        .map(
            (f, i) => `
    <div class="aiw-file-chip">
      ${f.preview ? `<img src="${f.preview}" class="aiw-chip-preview">` : `<span class="aiw-chip-icon">${getFileIcon(f.type)}</span>`}
      <span class="aiw-chip-name">${escapeHTML(f.name)}</span>
      <button class="aiw-chip-remove" data-index="${i}">&times;</button>
    </div>`,
        )
        .join('');

    strip.querySelectorAll('.aiw-chip-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = parseInt((btn as HTMLElement).dataset.index || '0');
            pendingFiles.splice(idx, 1);
            updateFileStrip();
        });
    });
}

async function sendMessage() {
    if (isStreaming) return;

    const input = document.getElementById('aiw-input') as HTMLTextAreaElement;
    const tokenCount = document.getElementById('aiw-token-count')!;
    const suggestionsEl = document.getElementById('aiw-suggestions')!;

    const text = input.value.trim();
    if (!text && pendingFiles.length === 0) return;

    const userMsg: ChatMessage = { role: 'user', content: text, files: [...pendingFiles] };
    messages.push(userMsg);
    addMessage(userMsg);

    input.value = '';
    input.style.height = 'auto';
    suggestionsEl.style.display = 'none';

    pendingFiles = [];
    updateFileStrip();
    tokenCount.textContent = '0 chars';

    showTypingIndicator();
    isStreaming = true;

    try {
        const parts: ChatPart[] = [];
        if (text) parts.push({ text });

        if (userMsg.files && userMsg.files.length > 0) {
            for (const f of userMsg.files) {
                if (f.data) {
                    const base64 = f.data.split(',')[1];
                    parts.push({ inlineData: { mimeType: f.type, data: base64 } });
                }
            }
        }

        const apiMessages = [
            ...messages.slice(0, -1).map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
            {
                role: 'user',
                parts,
            },
        ];

        // Add persona + formatting rules (server supports systemInstruction, but this also helps offline)
        // We embed as a first text part if backend ignores systemInstruction for some reason.
        const pageCtx = getPageContext();
        const personaText = pageCtx
            ? `You are the AI assistant for TDEE Lab. Current page context: ${pageCtx}. Be concise, use markdown. Never hallucinate data. After answering, suggest the next relevant action or page on the site.`
            : 'You are the AI assistant for TDEE Lab — a sleek, modern health & fitness utility. Be direct, concise, and subtly witty. Use markdown: **bold** for key metrics, bullet points for lists, `inline code` for numbers. Never hallucinate data. If user asks for a calculation, show the math. Stay on-topic. After answering, offer a logical next step.';

        apiMessages[apiMessages.length - 1] = {
            role: 'user',
            parts: [
                { text: personaText },
                ...((apiMessages[apiMessages.length - 1] as any).parts || []),
            ],
        };

        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || `HTTP ${response.status}`);
        }

        removeTypingIndicator();
        const bubble = addStreamingMessage();
        let fullResponse = '';

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
            updateStreamingBubble(bubble, fullResponse);
        }

        finalizeStreamingBubble(bubble, fullResponse);
        const assistantMsg: ChatMessage = { role: 'assistant', content: fullResponse };
        messages.push(assistantMsg);
        saveHistory();
    } catch (err: any) {
        // Offline fallback (never fail silently)
        removeTypingIndicator();
        const offlineText = generateOfflineResponse(text);
        const assistantMsg: ChatMessage = {
            role: 'assistant',
            content:
                `**Offline mode** — backend unavailable, using local calculations.\n\n${offlineText}`,
        };

        addMessage(assistantMsg);
        messages.push(assistantMsg);
        saveHistory();

        // If the user wants, we can show error in console only
        console.warn('AI widget backend failed, using offline fallback:', err?.message || err);
    } finally {
        isStreaming = false;
    }
}

function showTypingIndicator() {
    const container = document.getElementById('aiw-messages')!;
    const div = document.createElement('div');
    div.id = 'aiw-typing';
    div.className = 'aiw-msg aiw-msg-assistant';
    div.innerHTML =
        '<div class="aiw-msg-bubble"><div class="aiw-thinking"><span class="aiw-thinking-label">Thinking</span><div class="aiw-typing-dots"><span></span><span></span><span></span></div></div></div>';
    container.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('aiw-typing');
    if (el) el.remove();
}

function addStreamingMessage(): HTMLElement {
    const container = document.getElementById('aiw-messages')!;
    const div = document.createElement('div');
    div.className = 'aiw-msg aiw-msg-assistant';
    div.innerHTML =
        '<div class="aiw-msg-bubble aiw-streaming"></div>' +
        '<button class="aiw-msg-actions"><span class="aiw-copy-msg" title="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button>';
    container.appendChild(div);
    scrollToBottom();
    return div.querySelector('.aiw-msg-bubble')!;
}

function updateStreamingBubble(el: HTMLElement, text: string) {
    el.innerHTML = formatContent(text);
    scrollToBottom();
}

function finalizeStreamingBubble(el: HTMLElement, text: string) {
    el.classList.remove('aiw-streaming');
    el.innerHTML = formatContent(text);

    const msgEl = el.closest('.aiw-msg') as HTMLElement;
    if (msgEl) msgEl.dataset.content = text;

    scrollToBottom();

    if (text.length > 20) showSuggestions(text);
}

function scrollToBottom() {
    const container = document.getElementById('aiw-messages')!;
    requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
    });
}

function addMessage(msg: ChatMessage) {
    const container = document.getElementById('aiw-messages')!;
    const div = document.createElement('div');
    div.className = `aiw-msg aiw-msg-${msg.role}`;
    div.dataset.content = msg.content;

    let fileHTML = '';
    if (msg.files && msg.files.length > 0) {
        fileHTML = '<div class="aiw-msg-files">';
        for (const f of msg.files) {
            if (f.preview && f.type.startsWith('image/')) {
                fileHTML += `<div class="aiw-file-preview"><img src="${f.preview}" alt="${f.name}"><span class="aiw-file-name">${escapeHTML(f.name)}</span></div>`;
            } else {
                fileHTML += `<div class="aiw-file-preview aiw-file-doc"><span class="aiw-file-icon">${getFileIcon(f.type)}</span><span class="aiw-file-name">${escapeHTML(f.name)}</span></div>`;
            }
        }
        fileHTML += '</div>';
    }

    const copyBtn =
        msg.role === 'assistant'
            ? `<button class="aiw-msg-actions"><span class="aiw-copy-msg" title="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button>`
            : '';

    div.innerHTML = fileHTML + `<div class="aiw-msg-bubble">${formatContent(msg.content)}</div>` + copyBtn;
    container.appendChild(div);
    scrollToBottom();
}

function showSuggestions(responseText: string) {
    const el = document.getElementById('aiw-suggestions')!;
    const lower = responseText.toLowerCase();

    let prompts: string[] = [];
    if (lower.includes('tdee') || lower.includes('calorie') || lower.includes('bmr')) {
        prompts = ['Calculate my TDEE', 'What macros should I eat?', 'BMR vs TDEE — explain the difference', 'What is a calorie deficit?'];
    } else if (lower.includes('protein') || lower.includes('macro') || lower.includes('nutrition')) {
        prompts = ['How much protein for muscle gain?', 'Best protein sources for vegetarians', 'How to track macros?'];
    } else if (lower.includes('weight') || lower.includes('loss') || lower.includes('fat') || lower.includes('gain')) {
        prompts = ['Safe rate of weight loss?', 'How to break a plateau?', 'Calorie deficit for fat loss?'];
    } else if (lower.includes('bmi')) {
        prompts = ['Is BMI accurate for athletes?', 'How to lower my BMI?', 'BMI categories explained'];
    } else if (lower.includes('loan') || lower.includes('mortgage') || lower.includes('finance') || lower.includes('interest')) {
        prompts = ['Calculate loan payment', 'How does compound interest work?', 'Mortgage calculator'];
    } else if (lower.includes('math') || lower.includes('fraction') || lower.includes('percent') || lower.includes('average')) {
        prompts = ['Calculate 15% of 200', 'What is 3/4 as a decimal?', 'Find the average of 10, 20, 30'];
    } else if (lower.includes('age') || lower.includes('birthday') || lower.includes('born') || lower.includes('date')) {
        prompts = ['How old am I if born in 1990?', 'Days between two dates?', 'Age calculator'];
    } else {
        const path = window.location.pathname;
        if (path.includes('/tdee-calculator')) {
            prompts = ['Calculate my TDEE', 'Explain my BMR', 'What macros match my goal?'];
        } else if (path.includes('/financial-calculator')) {
            prompts = ['Calculate a loan payment', 'How do mortgage rates work?', 'What is compound interest?'];
        } else if (path.includes('/math-calculator')) {
            prompts = ['15% of 200', 'What is 3/4 + 1/2?', 'Average of 5, 15, 25'];
        } else if (path.includes('/other-calculator')) {
            prompts = ['Calculate my age', 'How many days since 2020?', 'Convert 100kg to lbs'];
        } else if (path.includes('/what-is-tdee')) {
            prompts = ['What is TDEE?', 'How is TDEE calculated?', 'Why does TDEE matter?'];
        } else if (path.includes('/bmr-vs-tdee')) {
            prompts = ['BMR vs TDEE difference', 'How to increase BMR?', 'Which number should I use?'];
        } else {
            prompts = ['Calculate my TDEE', 'What are macros?', 'How to lose weight safely?', 'Calculate a loan payment', 'How old am I?'];
        }
    }

    el.innerHTML =
        '<div class="aiw-suggestions-label">Suggested</div>' +
        prompts
            .map((p) => `<button class="aiw-suggestion-btn" data-prompt="${escapeAttr(p)}">${escapeHTML(p)}</button>`)
            .join('');

    el.style.display = 'flex';
}

function hideSuggestions() {
    const el = document.getElementById('aiw-suggestions')!;
    el.style.display = 'none';
}

const HISTORY_KEY = 'tdee_lab_chat_history';

function saveHistory() {
    try {
        const clean = messages.map((m) => ({
            role: m.role,
            content: m.content,
            files: m.files ? m.files.map((f) => ({ name: f.name, size: f.size, type: f.type })) : undefined,
        }));
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(clean));
    } catch { }
}

function loadHistory() {
    try {
        const saved = sessionStorage.getItem(HISTORY_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                messages = parsed;
                for (const msg of messages) addMessage(msg);
                return;
            }
        }
    } catch { }
    renderWelcome();
}

function exportChat() {
    if (messages.length === 0) {
        alert('No messages to export.');
        return;
    }

    let md = '# TDEE Lab AI Chat Export\n\n';
    md += `Exported: ${new Date().toLocaleString()}\n\n---\n\n`;

    for (const msg of messages) {
        const role = msg.role === 'user' ? '**You**' : '**TDEE Lab AI**';
        md += `### ${role}\n\n${msg.content}\n\n---\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tdee-lab-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

function getCSS(): string {
    return `
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
`;
}

