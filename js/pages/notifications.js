function initNotificationsPage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        window.location.href = 'auth.html';
        return;
    }
    function loadNotifications() {
        NotificationService.getUserNotifications(user.id).then(notifs => {
            const list = document.getElementById('notifications-list');
            if (!list) return;
            list.innerHTML = '';
            if (!notifs.length) {
                list.innerHTML = '<div style="color:#888;text-align:center;">لا توجد إشعارات حالياً.</div>';
                return;
            }
            notifs.forEach(n => {
                list.innerHTML += `
                    <div class="notification-item${n.is_read ? '' : ' unread'}">
                        <i class="fas fa-info-circle"></i>
                        <p>${n.message}</p>
                        <span class="notification-date">${formatDate(n.created_at)}</span>
                        <button class="btn secondary-btn" onclick="deleteNotification(${n.id})">حذف</button>
                    </div>
                `;
            });
        });
    }
    loadNotifications();
    setInterval(loadNotifications, 60000);

    document.getElementById('mark-all-read-btn').onclick = async function() {
        await NotificationService.markAllRead(user.id);
        loadNotifications();
    };
    window.deleteNotification = async function(id) {
        await API.post(`notifications/${id}`, { _method: 'DELETE' });
        loadNotifications();
    };
}
document.addEventListener('DOMContentLoaded', initNotificationsPage);
