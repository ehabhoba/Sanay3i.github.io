const AnalyticsService = {
    logEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            user: JSON.parse(localStorage.getItem('user') || '{}').id,
            data: data
        };
        
        // إرسال البيانات للتحليل
        fetch('/api/analytics/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });

        // تسجيل في Google Analytics أيضاً
        if (window.ga) {
            ga('send', 'event', eventName, data.category || 'general', data.label);
        }
    },

    trackSearch(query, results) {
        this.logEvent('search', { query, resultCount: results.length });
    },

    trackOrderCreation(orderId, serviceType) {
        this.logEvent('order_created', { orderId, serviceType });
    },

    trackUserEngagement(action) {
        this.logEvent('user_engagement', { action });
    }
};
