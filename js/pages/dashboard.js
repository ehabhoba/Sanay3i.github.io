function initDashboard() {
    // ...existing code...

    // إعدادات الحساب
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const oldPass = document.getElementById('old-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;
            if (newPass !== confirmPass) {
                alert('كلمتا المرور غير متطابقتين');
                return;
            }
            // استدعاء API لتغيير كلمة المرور
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await API.post(`users/${user.id}/change-password`, { old_password: oldPass, new_password: newPass });
            if (res.success) alert('تم تغيير كلمة المرور بنجاح');
            else alert(res.error || 'حدث خطأ');
        });
    }

    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.onclick = async function() {
            if (!confirm('هل أنت متأكد من حذف حسابك؟')) return;
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await API.post(`users/${user.id}`, { _method: 'DELETE' });
            localStorage.clear();
            window.location.href = 'index.html';
        };
    }

    async function initializeAnalytics() {
        const earningsChart = new Chart(
            document.getElementById('earnings-chart'),
            {
                type: 'line',
                data: await DB.getEarningsData(),
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'تحليل الأرباح' }
                    }
                }
            }
        );

        // إضافة خريطة الحرارة للمناطق النشطة باستخدام Leaflet
        if (window.L && MapService.map) {
            const locations = await DB.getServiceLocations();
            const heatPoints = locations.map(loc => [loc.latitude, loc.longitude, loc.intensity || 1]);
            if (window.L.heatLayer) {
                window.L.heatLayer(heatPoints, {radius: 25}).addTo(MapService.map);
            }
        }
    }

    // ...existing code...
    initializeAnalytics();
}