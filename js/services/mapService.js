const MapService = {
    map: null,
    markers: [],
    initMap: function(containerId) {
        if (this.map) return;
        this.map = L.map(containerId).setView([30.0444, 31.2357], 11); // القاهرة كمثال
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    },
    addMarker: function(lat, lng, popupText) {
        if (!this.map) return;
        const marker = L.marker([lat, lng]).addTo(this.map);
        if (popupText) marker.bindPopup(popupText);
        this.markers.push(marker);
    },
    clearMarkers: function() {
        this.markers.forEach(m => m.remove());
        this.markers = [];
    },
    loadProfessionalLocations: async function() {
        this.clearMarkers();
        const locations = await DB.getProfessionalLocations();
        locations.forEach(loc => {
            this.addMarker(loc.latitude, loc.longitude, loc.address || '');
        });
    }
};

window.initMapService = function() {
    var mapDiv = document.getElementById('map-container');
    if (!mapDiv) return;
    // مركز الخريطة على القاهرة
    var map = L.map('map-container').setView([30.0444, 31.2357], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // جلب مواقع الصنايعية من الـ API
    fetch('/api/index.php?route=professional-locations')
        .then(res => res.json())
        .then(locations => {
            locations.forEach(loc => {
                if(loc.latitude && loc.longitude){
                    L.marker([loc.latitude, loc.longitude])
                        .addTo(map)
                        .bindPopup(loc.address || 'صنايعي');
                }
            });
        })
        .catch(() => {
            // في حال فشل الجلب، ضع صنايعي تجريبي
            L.marker([30.0444, 31.2357]).addTo(map).bindPopup('صنايعي تجريبي');
        });
};
