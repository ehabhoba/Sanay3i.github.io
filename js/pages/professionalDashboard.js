function handleOrderActions() {
    const buttons = document.querySelectorAll('.action-buttons');
    if (!buttons.length) return;
    buttons.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            const action = e.target.dataset.action;
            const orderId = e.target.dataset.orderId;
            // إضافة تعريف professionalId من localStorage
            const professional = JSON.parse(localStorage.getItem('user') || '{}');
            const professionalId = professional.id;

            switch(action) {
                case 'arrived':
                    await API.post(`orders/${orderId}/status`, {
                        status: 'arrived',
                        arrival_time: new Date()
                    });
                    // بدء تتبع الموقع
                    LocationTrackingService.startTracking(professionalId, orderId);
                    break;
                
                case 'start-work':
                    await API.post(`orders/${orderId}/status`, {
                        status: 'in-progress',
                        work_start_time: new Date()
                    });
                    break;
                
                case 'complete':
                    await API.post(`orders/${orderId}/status`, {
                        status: 'completed',
                        work_end_time: new Date()
                    });
                    LocationTrackingService.stopTracking();
                    break;
            }
            
            updateOrderDisplay(orderId);
        });
    });
}
