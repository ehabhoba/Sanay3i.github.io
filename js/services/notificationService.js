const NotificationService = {
    async getUserNotifications(userId) {
        try {
            const response = await API.get(`notifications?user_id=${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(notificationId) {
        try {
            await API.post(`notifications/${notificationId}`, { is_read: true });
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    },

    async markAllRead(userId) {
        try {
            await API.post(`notifications/mark-all-read`, { user_id: userId });
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    },

    showBrowserNotification(title, message) {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(title, { body: message });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    new Notification(title, { body: message });
                }
            });
        }
    },

    startPolling(userId) {
        this.pollInterval = setInterval(async () => {
            const notifications = await this.getUserNotifications(userId);
            const unread = notifications.filter(n => !n.is_read);
            if (unread.length > 0) {
                unread.forEach(n => {
                    this.showBrowserNotification('صنايعي', n.message);
                });
            }
        }, 30000); // كل 30 ثانية
    },

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
};
