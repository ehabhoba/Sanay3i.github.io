function initSupportPage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        window.location.href = 'auth.html';
        return;
    }
    const form = document.getElementById('support-form');
    const ticketsList = document.getElementById('support-tickets-list');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const subject = document.getElementById('support-subject').value;
            const message = document.getElementById('support-message').value;
            await API.post('support-tickets', { user_id: user.id, subject, message });
            alert('تم إرسال تذكرتك بنجاح');
            form.reset();
            loadTickets();
        });
    }
    async function loadTickets() {
        const tickets = await API.get(`support-tickets?user_id=${user.id}`);
        if (!ticketsList) return;
        ticketsList.innerHTML = '';
        tickets.forEach(t => {
            ticketsList.innerHTML += `
                <div class="ticket-item">
                    <b>${t.subject}</b>
                    <p>${t.message}</p>
                    <span>الحالة: ${t.status}</span>
                    ${t.admin_reply ? `<div class="admin-reply">رد الإدارة: ${t.admin_reply}</div>` : ''}
                </div>
            `;
        });
    }
    loadTickets();
}
document.addEventListener('DOMContentLoaded', initSupportPage);
