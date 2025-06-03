function initOrderTracking() {
    const orderId = getParamFromUrl('id');
    const map = initMap('tracking-map');
    let marker = null;

    // الاستماع لتحديثات الموقع
    const socket = io('wss://your-websocket-server.com');
    socket.on('location_update', data => {
        if (data.order_id === orderId) {
            updateMarkerPosition(map, marker, data.location);
            updateETA(data.location);
        }
    });

    // تحديث حالة الطلب
    socket.on('order_status_update', data => {
        if (data.order_id === orderId) {
            updateOrderStatus(data.status);
        }
    });
}

function updateMarkerPosition(map, marker, location) {
    const { latitude, longitude } = location;
    if (!marker) {
        marker = L.marker([latitude, longitude]).addTo(map);
    } else {
        marker.setLatLng([latitude, longitude]);
    }
    map.setView([latitude, longitude], 15);
}
