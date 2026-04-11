// ===== ELEMENT =====
const launcher = document.getElementById('chat-launcher');
const windowChat = document.getElementById('chat-window');
const closeBtn = document.getElementById('chat-close');
const sendBtn = document.getElementById('chat-send');
const input = document.getElementById('chat-input');
const body = document.getElementById('chat-body');

let isSending = false;

console.log("Chatbot init:", launcher);

// ===== OPEN / CLOSE =====
if (launcher && windowChat) {
    launcher.onclick = () => {
        windowChat.classList.toggle('d-none');

        if (!windowChat.classList.contains('d-none')) {
            input.focus();
            body.scrollTop = body.scrollHeight;
        }
    };
}

if (closeBtn && windowChat) {
    closeBtn.onclick = () => {
        windowChat.classList.add('d-none');
    };
}

// ===== SEND MESSAGE =====
async function handleSend() {
    if (isSending) return;

    const text = input.value.trim();
    if (!text) return;

    isSending = true;

    appendMessage('user', text);
    input.value = '';
    input.disabled = true;

    const loadingId = appendMessage('bot', '<span class="typing">Đang trả lời...</span>');

    try {
        const token = localStorage.getItem('accessToken');

        const response = await axios.post(
            'http://localhost:8080/api/chat',
            {
                message: text,
                sessionId: getSessionId()
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            }
        );

        removeMessage(loadingId);

        const res = response.data;

        appendMessage('bot', res.reply);

        if (res.data && Array.isArray(res.data)) {
            appendFoodList(res.data);
        }

    } catch (error) {
        console.error(error);
        removeMessage(loadingId);
        appendMessage('bot', 'Lỗi kết nối backend 😢');
    }

    input.disabled = false;
    input.focus();
    isSending = false;
}

// ===== SESSION =====
function getSessionId() {
    let sessionId = localStorage.getItem("chat_session");

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("chat_session", sessionId);
    }

    return sessionId;
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ===== MESSAGE UI =====
function appendMessage(sender, text) {
    const id = Date.now() + Math.random();

    const div = document.createElement('div');
    div.id = id;
    div.className = `msg-item ${sender} mb-3`;

    const alignmentClass = sender === 'user'
        ? 'justify-content-end'
        : 'justify-content-start';

    const bgClass = sender === 'user'
        ? 'bg-orange text-white'
        : 'bg-light text-dark';

    div.innerHTML = `
        <div class="d-flex ${alignmentClass}">
            <div class="d-flex align-items-start" style="max-width: 85%;">
                ${sender === 'bot'
                    ? '<i class="fa-solid fa-robot text-orange me-2 mt-2"></i>'
                    : ''
                }
                <div class="p-2 rounded shadow-sm ${bgClass}" style="font-size: 14px; line-height: 1.5;">
                    ${text.includes("typing") ? text : escapeHtml(text)}
                </div>
            </div>
        </div>
    `;

    body.appendChild(div);
    body.scrollTop = body.scrollHeight;

    return id;
}

// ===== REMOVE MESSAGE =====
function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ===== FOOD CARD =====
function appendFoodList(items) {
    const wrapper = document.createElement('div');
    wrapper.className = 'food-list';

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'food-card';

        div.innerHTML = `
            <img src="${item.image}" style="width:60px; height:60px; object-fit:cover; border-radius:10px;">
            <div style="flex:1;">
                <div style="font-weight:600;">${item.name}</div>
                <div style="font-size:13px; color:#777;">${item.formattedPrice}</div>
            </div>
        `;

        wrapper.appendChild(div);
    });

    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
}

// ===== EVENTS =====
if (sendBtn) {
    sendBtn.onclick = handleSend;
}

if (input) {
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // 🔥 tránh submit form
            handleSend();
        }
    });
}