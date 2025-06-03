const TrackingService = {
    async initializeTracking(orderId) {
        const socket = io('wss://your-websocket-server.com');
        
        socket.on('professional_location_update', (data) => {
            if (data.orderId === orderId) {
                MapService.updateProfessionalLocation(data.location);
                this.updateETA(data.eta);
            }
        });
        
        return socket;
    },
    
    async startSharing(professionalId, orderId) {
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                position => this.updateLocation(position, professionalId, orderId),
                error => console.error('Error getting location:', error),
                { enableHighAccuracy: true }
            );
        }
    },

    // يجب عليك تعريف updateLocation هنا أو في مكان آخر
    // updateLocation(position, professionalId, orderId) { ... }
};
