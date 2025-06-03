function initChatPage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const otherId = getParamFromUrl('with');
    if (!user.id || !otherId) {
        alert('يجب تسجيل الدخول واختيار الطرف الآخر للدردشة');
        window.location.href = 'auth.html';
        return;
    }
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    if (!chatBox || !chatForm) return;
    async function loadMessages() {
        const msgs = await API.get(`chat?user1=${user.id}&user2=${otherId}`);
        chatBox.innerHTML = '';
        msgs.forEach(m => {
            chatBox.innerHTML += `
                <div class="chat-msg${m.sender_id == user.id ? ' me' : ''}">
                    <span>${m.message}</span>
                    <div class="chat-date">${formatDate(m.created_at)}</div>
                </div>
            `;
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const msg = document.getElementById('chat-message').value;
        if (!msg) return;
        await API.post('chat', { sender_id: user.id, receiver_id: otherId, message: msg });
        document.getElementById('chat-message').value = '';
        loadMessages();
    });
    loadMessages();
    setInterval(loadMessages, 10000);
}
document.addEventListener('DOMContentLoaded', initChatPage);
