const LocationTrackingService = {
    watchId: null,
    socket: null,

    startTracking(professionalId, orderId) {
        if (!('geolocation' in navigator)) {
            alert('عذراً، متصفحك لا يدعم تحديد الموقع');
            return;
        }

        this.socket = io('wss://your-websocket-server.com');
        this.watchId = navigator.geolocation.watchPosition(
            position => this.updateLocation(position, professionalId, orderId),
            error => console.error('Error tracking location:', error),
            { enableHighAccuracy: true, maximumAge: 30000 }
        );
    },

    async updateLocation(position, professionalId, orderId) {
        const { latitude, longitude } = position.coords;
        
        // تحديث موقع الصنايعي في قاعدة البيانات
        await API.post('professional-locations', {
            professional_id: professionalId,
            latitude,
            longitude,
            status: 'busy',
            order_id: orderId
        });

        // إرسال الموقع للعميل عبر WebSocket
        if (this.socket) {
            this.socket.emit('location_update', {
                professional_id: professionalId,
                order_id: orderId,
                location: { latitude, longitude }
            });
        }
    },

    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
};
