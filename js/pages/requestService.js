function initRequestServicePage() {
    // تفضيلات العميل (مثال: صنايعي مفضل)
    function getPreferredProfessionalName() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user && user.preferred_professional ? user.preferred_professional : null;
    }

    const professionalName = getPreferredProfessionalName() || getParamFromUrl('professional') || 'غير محدد';
    const professionalDisplay = document.getElementById('professional-name-display');
    if (!professionalDisplay) return;
    professionalDisplay.textContent = professionalName;

    // عناصر إضافية لاقتراح الصنايعي الأقرب
    const addressInput = document.getElementById('customer-address');
    const serviceSelect = document.getElementById('pro-service') || document.getElementById('service-type') || document.getElementById('service-description');
    if (!addressInput || !serviceSelect) return;
    const suggestionDiv = document.createElement('div');
    suggestionDiv.id = 'professional-suggestion';
    if (professionalDisplay && professionalDisplay.parentNode) {
        professionalDisplay.parentNode.appendChild(suggestionDiv);
    }

    // دالة لتحويل العنوان إلى إحداثيات (Geocoding) باستخدام Nominatim (مجاني)
    async function geocodeAddress(address) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'ar' } });
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
    }

    // دالة لحساب المسافة بين نقطتين (Haversine)
    function haversine(lat1, lon1, lat2, lon2) {
        function toRad(x) { return x * Math.PI / 180; }
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // اقتراح أكثر من صنايعي قريب (Top 3) مع منطق الترتيب الذكي
    async function suggestNearestProfessionalsList() {
        const address = addressInput ? addressInput.value.trim() : '';
        const service = serviceSelect ? (serviceSelect.value || serviceSelect.textContent || '') : '';
        if (!address || !service) {
            suggestionDiv.innerHTML = '<span style="color:#888">يرجى إدخال العنوان واختيار الخدمة لاقتراح الصنايعي الأقرب.</span>';
            return;
        }
        suggestionDiv.innerHTML = 'جاري البحث عن الصنايعية الأقرب...';
        const clientLoc = await geocodeAddress(address);
        if (!clientLoc) {
            suggestionDiv.innerHTML = '<span style="color:red">تعذر تحديد موقع العنوان.</span>';
            return;
        }
        const professionals = await DB.getProfessionals();
        const locations = await DB.getProfessionalLocations();
        // تصفية الصنايعية المتخصصين والمتاحين فقط، مع تفعيل الشارة أو العضوية السارية
        const prosWithLoc = professionals
            .filter(p =>
                (p.service_type || '').includes(service) &&
                p.is_available !== false &&
                (p.verified_enabled && p.is_verified || (p.membership_type === 'paid' && (!p.membership_expiry || new Date(p.membership_expiry) >= new Date())))
            )
            .map(p => {
                const loc = locations.find(l => l.professional_id == p.id);
                return loc ? { ...p, lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) } : null;
            }).filter(Boolean);

        if (!prosWithLoc.length) {
            suggestionDiv.innerHTML = '<span style="color:red">لا يوجد صنايعية موثوقون أو بعضويتهم سارية في هذه الخدمة بالقرب منك.</span>';
            return;
        }
        // حساب المسافة وترتيب الصنايعية حسب الأعلى تقييماً ثم الأقرب
        prosWithLoc.forEach(p => {
            p.distance = haversine(clientLoc.lat, clientLoc.lng, p.lat, p.lng);
        });
        prosWithLoc.sort((a, b) => {
            if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
            return a.distance - b.distance;
        });
        // اقتراح أول 3 صنايعية
        const topPros = prosWithLoc.slice(0, 3);
        suggestionDiv.innerHTML = `
            <b>أفضل الصنايعية القريبين:</b>
            <ol>
                ${topPros.map(p => `
                    <li>
                        <span style="color:#1e88e5">${p.name}</span>
                        (${p.service_type}) - 
                        <span style="color:#888">${p.distance.toFixed(2)} كم</span>
                        ${p.is_verified && p.verified_enabled ? '<span class="verified-badge" title="موثوق"><i class="fas fa-badge-check"></i> شارة تحقق مفعلة</span>' : ''}
                        ${p.membership_type === 'paid' && (!p.membership_expiry || new Date(p.membership_expiry) >= new Date()) ? '<span class="membership-badge paid">عضوية مدفوعة سارية</span>' : ''}
                        <span style="color:gold">★ ${p.rating || '-'}</span>
                        <button onclick="selectProfessional('${p.name}')">اختيار</button>
                    </li>
                `).join('')}
            </ol>
        `;
    }

    // اختيار صنايعي من القائمة
    window.selectProfessional = function(name) {
        if (professionalDisplay) professionalDisplay.textContent = name;
    };

    // مراقبة تغيّر العنوان أو الخدمة
    if (addressInput) {
        addressInput.addEventListener('blur', suggestNearestProfessionalsList);
    }
    if (serviceSelect) {
        serviceSelect.addEventListener('change', suggestNearestProfessionalsList);
    }

    const serviceRequestForm = document.getElementById('service-request-form');
    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const professional = professionalDisplay ? professionalDisplay.textContent : 'غير محدد';
            const description = document.getElementById('service-description').value;
            const date = document.getElementById('preferred-date').value;
            const time = document.getElementById('preferred-time').value;
            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const address = document.getElementById('customer-address').value;

            if (!localStorage.getItem('user') && (!phone || phone.length < 8)) {
                alert('يجب إدخال رقم هاتف صحيح لإتمام الطلب.');
                return;
            }

            const serviceRequest = {
                professional: professional,
                description: description,
                date: date,
                time: time,
                name: name,
                phone: phone,
                address: address,
                orderId: Math.floor(Math.random() * 1000000)
            };

            if (!localStorage.getItem('user')) {
                localStorage.setItem('guestServiceRequest', JSON.stringify(serviceRequest));
                alert('تم إرسال طلبك بنجاح! يمكنك تتبع الطلب من نفس الجهاز فقط. إذا أردت تتبع الطلبات من أي مكان أو تقييم الصنايعي، يرجى تسجيل الدخول.');
                window.location.href = 'order-tracking.html';
                return;
            }

            localStorage.setItem('currentServiceRequest', JSON.stringify(serviceRequest));
            alert('تم إرسال طلبك بنجاح! سيتم تحويلك إلى صفحة تتبع الطلب.');
            window.location.href = 'order-tracking.html';
        });
    }

    // تحسين رفع الصور: معاينة وحذف
    const uploadPhotosInput = document.getElementById('upload-diagnosis-photos');
    const photoPreviewContainer = document.getElementById('diagnosis-photo-preview');
    let uploadedFiles = [];
    if (uploadPhotosInput) {
        uploadPhotosInput.addEventListener('change', function () {
            photoPreviewContainer.innerHTML = '';
            uploadedFiles = [];
            Array.from(this.files).forEach((file, idx) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const imgDiv = document.createElement('div');
                        imgDiv.style.display = 'inline-block';
                        imgDiv.style.position = 'relative';
                        imgDiv.style.margin = '5px';
                        imgDiv.innerHTML = `
                            <img src="${e.target.result}" alt="معاينة الصورة" style="width:100px;">
                            <button type="button" style="position:absolute;top:0;right:0;background:red;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;" onclick="removePreviewImage(${idx})">&times;</button>
                        `;
                        photoPreviewContainer.appendChild(imgDiv);
                        uploadedFiles.push(file);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }
    window.removePreviewImage = function(idx) {
        uploadedFiles.splice(idx, 1);
        // إعادة العرض
        photoPreviewContainer.innerHTML = '';
        uploadedFiles.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgDiv = document.createElement('div');
                imgDiv.style.display = 'inline-block';
                imgDiv.style.position = 'relative';
                imgDiv.style.margin = '5px';
                imgDiv.innerHTML = `
                    <img src="${e.target.result}" alt="معاينة الصورة" style="width:100px;">
                    <button type="button" style="position:absolute;top:0;right:0;background:red;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;" onclick="removePreviewImage(${i})">&times;</button>
                `;
                photoPreviewContainer.appendChild(imgDiv);
            };
            reader.readAsDataURL(file);
        });
    };
}
