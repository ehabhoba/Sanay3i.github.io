// Utility module for common UI functions
const UI = {
    showSpinner: (spinnerId) => {
        const spinner = document.getElementById(spinnerId);
        if (spinner) spinner.style.display = 'block';
    },
    hideSpinner: (spinnerId) => {
        const spinner = document.getElementById(spinnerId);
        if (spinner) spinner.style.display = 'none';
    },
    showAlert: (message, type = 'error') => {
        alert(message); // Replace with a custom alert UI if needed
    }
};

// API module for backend communication
const API = {
    baseUrl: '/api/index.php?route=', // تأكد من أن هذا هو المسار الصحيح للباك اند لديك

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Add new database-specific methods
const DB = {
    async getProfessionals() {
        try {
            const response = await API.get('professionals');
            // ترتيب المدفوعين أولاً ثم المجانيين، ثم حسب التقييم
            return response.sort((a, b) => {
                if (a.membership_type === b.membership_type) {
                    return (b.rating || 0) - (a.rating || 0);
                }
                return a.membership_type === 'paid' ? -1 : 1;
            });
        } catch (error) {
            console.error('Error fetching professionals:', error);
            return [];
        }
    },
    
    async getServices() {
        try {
            const response = await API.get('services');
            return response;
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    },
    
    async createOrder(orderData) {
        try {
            const response = await API.post('orders', orderData);
            return response;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getProfessionalLocations() {
        try {
            const response = await API.get('professional-locations');
            return response;
        } catch (error) {
            console.error('Error fetching professional locations:', error);
            return [];
        }
    },

    async getAllUsers() {
        try {
            return await API.get('users');
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },
    async updateUser(id, data) {
        try {
            const response = await fetch(`${API.baseUrl}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },
    async updateProfessional(id, data) {
        try {
            const response = await fetch(`${API.baseUrl}/professionals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating professional:', error);
            throw error;
        }
    },

    async findUser({id, email, phone}) {
        const users = await DB.getAllUsers();
        return users.find(u =>
            (id && u.id == id) ||
            (email && u.email === email) ||
            (phone && u.phone === phone)
        );
    },
    async findProfessional({id, email, phone}) {
        const pros = await DB.getProfessionals();
        return pros.find(p =>
            (id && p.id == id) ||
            (email && p.email === email) ||
            (phone && p.phone === phone)
        );
    },

    async getUserOrders(userId) {
        try {
            return await API.get(`orders?client_id=${userId}`);
        } catch (e) { return []; }
    },
    async getUserPayments(userId) {
        try {
            return await API.get(`payments?user_id=${userId}`);
        } catch (e) { return []; }
    }
};

// إشعارات المستخدم
const NotificationService = {
    async getUserNotifications(userId) {
        try {
            return await API.get(`notifications?user_id=${userId}`);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },
    async markAllRead(userId) {
        try {
            return await API.post('notifications/mark-all-read', { user_id: userId });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }
};

// التقييمات الديناميكية
const ReviewService = {
    async getProfessionalReviews(professionalId) {
        try {
            return await API.get(`reviews?professional_id=${professionalId}`);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },
    async addReview(orderId, rating, comment) {
        try {
            return await API.post('reviews', { order_id: orderId, rating, comment });
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }
};

// دعم تعدد اللغات (عربي/إنجليزي)
function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    location.reload();
}
function getLanguage() {
    return localStorage.getItem('lang') || 'ar';
}

// حماية المدير
function requireAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.type !== 'admin') {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// التحقق من تسجيل الدخول
function isAuthenticated() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return !!user && !!user.id;
}

function requireAuthForFeatures() {
    // استدعِ هذه الدالة في أي صفحة أو ميزة تتطلب تسجيل دخول
    if (!isAuthenticated()) {
        alert('يجب تسجيل الدخول لاستخدام هذه الميزة.');
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// تقييد استخدام الذكاء الاصطناعي للعميل (3 مرات يومياً مجاناً إذا لم يكن مدفوع/مفعل)
async function canUseAi(user) {
    if (!user) return false;
    if (user.ai_enabled === false || user.ai_enabled === 0) return false;
    if (user.membership_type === 'paid' && (!user.membership_expiry || new Date(user.membership_expiry) >= new Date())) return true;
    // مجاني: 3 مرات يومياً
    const today = new Date().toISOString().slice(0,10);
    let usage = JSON.parse(localStorage.getItem('ai_usage') || '{}');
    if (!usage[user.id] || usage[user.id].date !== today) {
        usage[user.id] = { count: 0, date: today };
        localStorage.setItem('ai_usage', JSON.stringify(usage));
    }
    return usage[user.id].count < 3;
}
function incrementAiUsage(user) {
    if (!user) return;
    if (user.membership_type === 'paid' && (!user.membership_expiry || new Date(user.membership_expiry) >= new Date())) return;
    const today = new Date().toISOString().slice(0,10);
    let usage = JSON.parse(localStorage.getItem('ai_usage') || '{}');
    if (!usage[user.id] || usage[user.id].date !== today) {
        usage[user.id] = { count: 0, date: today };
    }
    usage[user.id].count++;
    localStorage.setItem('ai_usage', JSON.stringify(usage));
}

// منطق تنبيه المدير بقرب انتهاء العضوية لأي مستخدم أو صنايعي
async function notifyAdminAboutExpiries() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.type !== 'admin') return;
    const users = await DB.getAllUsers();
    const professionals = await DB.getProfessionals();
    const soon = [];
    const now = new Date();
    users.forEach(u => {
        if (u.membership_expiry) {
            const expiry = new Date(u.membership_expiry);
            const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            if (diff <= 7 && diff >= 0) soon.push(`عضوية العميل ${u.name} (${u.email}) ستنتهي خلال ${diff} يوم`);
        }
    });
    professionals.forEach(p => {
        if (p.membership_expiry) {
            const expiry = new Date(p.membership_expiry);
            const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            if (diff <= 7 && diff >= 0) soon.push(`عضوية الصنايعي ${p.name} ستنتهي خلال ${diff} يوم`);
        }
    });
    if (soon.length > 0) {
        UI.showAlert('تنبيهات العضوية:\n' + soon.join('\n'), 'info');
    }
}

// تسجيل الدخول عبر جوجل (واجهة فقط، التكامل الفعلي يتطلب باك اند OAuth)
window.initGoogleLogin = function() {
    const btn = document.getElementById('google-login-btn');
    if (btn) {
        btn.onclick = function() {
            alert('سيتم تفعيل تسجيل الدخول عبر جوجل قريباً. (تحتاج إعداد Google OAuth في الباك اند)');
        };
    }
};

// لوحة الصنايعي: عرض الطلبات القريبة مع إمكانية قبول/رفض/تواصل
function initProfessionalDashboard() {
    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.type !== 'professional') {
        window.location.href = 'index.html';
        return;
    }
    // جلب الطلبات القريبة من موقع الصنايعي أو تخصصه
    DB.getProfessionalOrders = async function(proId, location, serviceType) {
        const allOrders = await API.get('orders');
        // فقط الطلبات المفتوحة أو قيد الانتظار
        return allOrders.filter(o =>
            (!location || (o.address && o.address.includes(location))) &&
            (!serviceType || (o.description && o.description.includes(serviceType))) &&
            (!o.professional_id || o.professional_id == proId) &&
            (o.status === 'pending' || o.status === 'accepted' || o.status === 'on-the-way')
        );
    };
    // عرض الطلبات في الصفحة
    DB.getProfessionalOrders(user.id, user.location, user.service_type).then(orders => {
        const container = document.getElementById('professional-orders-list');
        if (container) {
            container.innerHTML = '';
            if (!orders.length) {
                container.innerHTML = '<div style="color:#888;text-align:center;">لا توجد طلبات قريبة حالياً.</div>';
                return;
            }
            orders.forEach(order => {
                container.innerHTML += `
                    <div class="order-card" data-order-id="${order.id}">
                        <h4>مشكلة: ${order.description}</h4>
                        <p>العميل: ${order.name} - ${order.phone}</p>
                        <p>العنوان: ${order.address}</p>
                        <p>الحالة الحالية: <span class="status">${order.status_ar || order.status}</span></p>
                        <button class="btn secondary-btn" onclick="window.open('https://wa.me/${order.phone}','_blank')">تواصل واتساب</button>
                        <button class="btn primary-btn" onclick="window.open('tel:${order.phone}')">اتصال مباشر</button>
                        ${order.status === 'pending' ? `<button class="btn primary-btn" onclick="acceptOrder(${order.id})">قبول الطلب</button>` : ''}
                        ${order.status === 'accepted' ? `<button class="btn secondary-btn" onclick="markOnTheWay(${order.id})">في الطريق</button>` : ''}
                        ${order.status === 'on-the-way' ? `<button class="btn success-btn" onclick="markCompleted(${order.id})">تم الإنجاز</button>` : ''}
                    </div>
                `;
            });
        }
    });
}

// تحديث حالة الطلب من الصنايعي
window.acceptOrder = async function(orderId) {
    const order = await API.post(`orders/${orderId}/status`, { status: 'accepted' });
    await notifyClientOnOrderStatus(order, 'accepted');
    alert('تم قبول الطلب. يمكنك التواصل مع العميل الآن.');
    location.reload();
};
window.markOnTheWay = async function(orderId) {
    const order = await API.post(`orders/${orderId}/status`, { status: 'on-the-way' });
    await notifyClientOnOrderStatus(order, 'on-the-way');
    alert('تم تحديث الحالة إلى "في الطريق".');
    location.reload();
};
window.markCompleted = async function(orderId) {
    const order = await API.post(`orders/${orderId}/status`, { status: 'completed' });
    await notifyClientOnOrderStatus(order, 'completed');
    alert('تم إنهاء الطلب بنجاح.');
    location.reload();
};

// إشعار الصنايعي عند وصول طلب جديد
async function notifyProfessionalOnNewOrder(order) {
    if (order.professional_id) {
        await API.post('notifications', {
            user_id: order.professional_id,
            message: `طلب جديد من العميل ${order.name || ''} بخصوص: ${order.description || ''}`,
            type: 'order'
        });
    }
}

// إشعار العميل عند تغيير حالة الطلب
async function notifyClientOnOrderStatus(order, newStatus) {
    if (order.client_id) {
        await API.post('notifications', {
            user_id: order.client_id,
            message: `تم تحديث حالة طلبك إلى: ${newStatus}`,
            type: 'order'
        });
    }
}

// رفع صورة مع تحقق الأمان
async function uploadImage(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
        UI.showAlert('نوع أو حجم الملف غير مسموح (الحد الأقصى 2 ميجا).');
        return null;
    }
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload.php', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.status === 'success') return data.path;
    UI.showAlert(data.error || 'فشل رفع الصورة');
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    // Common UI functionality
    initCommonUI();
    
    // Initialize page-specific functionality
    const path = window.location.pathname;
    if (path.includes("index.html") || path === '/') {
        initHomePage();
    } else if (path.includes("ai-diagnosis.html")) {
        initAiDiagnosisPage();
    } else if (path.includes("request-service.html")) {
        initRequestServicePage();
    } else if (path.includes("professional-profile.html")) {
        initProfessionalProfilePage();
    } else if (path.includes("auth.html")) {
        initAuthPage();
    } else if (path.includes("user-dashboard.html")) {
        initUserDashboard();
    } else if (path.includes("professional-dashboard.html")) {
        initProfessionalDashboard();
    }

    notifyAdminAboutExpiries();
    window.initGoogleLogin && window.initGoogleLogin();
});

function initCommonUI() {
    // Hamburger menu functionality
    const menuToggle = document.querySelector('.menu-toggle, #mobile-menu');
    const nav = document.querySelector('header nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    // تعطيل الروابط الفارغة
    document.querySelectorAll('a[href="#"]').forEach(a => {
        a.addEventListener('click', function(e){ e.preventDefault(); });
    });
}

function initHomePage() {
    // =========================================================
    // وظائف الصفحة الرئيسية (index.html)
    // =========================================================

    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const searchButton = document.querySelector('.search-bar button');
    const searchResultsSection = document.querySelector('.search-results-section');
    const searchQueryDisplay = document.getElementById('search-query-display');
    const searchResultsContainer = document.getElementById('search-results-container');
    const noResultsMessage = document.getElementById('no-results-message');

    // البحث عبر API وليس بيانات ثابتة
    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            UI.showAlert('يرجى إدخال كلمة بحث!');
            return;
        }
        UI.showSpinner('search-spinner');
        try {
            // جلب جميع الصنايعية من API ثم تصفية النتائج في الواجهة
            const professionals = await DB.getProfessionals();
            const filtered = professionals.filter(p =>
                (p.service_type || '').toLowerCase().includes(query.toLowerCase()) ||
                (p.name || '').toLowerCase().includes(query.toLowerCase())
            );
            searchResultsContainer.innerHTML = '';
            noResultsMessage.style.display = 'none';
            searchResultsSection.style.display = 'block';
            searchQueryDisplay.textContent = query;

            if (filtered.length === 0) {
                noResultsMessage.style.display = 'block';
                return;
            }
            filtered.forEach(result => {
                const card = document.createElement('div');
                card.classList.add('result-card');
                card.innerHTML = `
                    <div class="card-header">
                        <img src="${result.profile_image || 'images/profile-placeholder.jpg'}" alt="${result.name}" class="profile-img">
                        <div class="info">
                            <h4>${result.name}</h4>
                            <p class="service-type">${result.service_type}</p>
                        </div>
                    </div>
                    <p class="description">${result.description || ''}</p>
                    <div class="rating-location">
                        <div class="rating">
                            <i class="fas fa-star"></i> <span>${result.rating || '-'}</span>
                        </div>
                        <div class="location">
                            <i class="fas fa-map-marker-alt"></i> ${result.location || ''}
                        </div>
                    </div>
                    <a href="professional-profile.html?name=${encodeURIComponent(result.name)}" class="btn secondary-btn">اطلب الخدمة</a>
                `;
                searchResultsContainer.appendChild(card);
            });
        } catch (error) {
            UI.showAlert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
        } finally {
            UI.hideSpinner('search-spinner');
        }
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                performSearch();
            }
        });
    }

    document.querySelectorAll('.popular-services .service-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const serviceName = this.querySelector('p').textContent.trim();
            searchInput.value = serviceName;
            performSearch();
        });
    });
}

function initRequestServicePage() {
    // =========================================================
    // وظائف صفحة طلب الخدمة (request-service.html)
    // =========================================================
    const professionalNameDisplayOnRequestPage = document.getElementById('professional-name-display'); // في صفحة request-service.html
    const uploadPhotosInput = document.getElementById('upload-photos');
    const photoPreviewContainer = document.getElementById('photo-preview');
    const serviceRequestForm = document.getElementById('service-request-form');

    // جلب اسم الصنايعي من الـ URL
    const professionalName = getParamFromUrl('professional');

    // عرض اسم الصنايعي في الصفحة
    if (professionalNameDisplayOnRequestPage) {
        professionalNameDisplayOnRequestPage.textContent = professionalName || 'غير محدد';
    }

    if (uploadPhotosInput) {
        uploadPhotosInput.addEventListener('change', function () {
            photoPreviewContainer.innerHTML = ''; // مسح الصور السابقة
            Array.from(this.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'معاينة الصورة';
                        img.style.width = '100px';
                        img.style.margin = '5px';
                        photoPreviewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // منع الإرسال الافتراضي للنموذج

            const professional = professionalNameDisplayOnRequestPage ? professionalNameDisplayOnRequestPage.textContent : 'غير محدد'; // اسم الصنايعي
            const description = document.getElementById('service-description').value;
            const date = document.getElementById('preferred-date').value;
            const time = document.getElementById('preferred-time').value;
            const name = document.getElementById('customer-name').value; // اسم العميل
            const phone = document.getElementById('customer-phone').value; // رقم الهاتف
            const address = document.getElementById('customer-address').value; // العنوان

            // إنشاء كائن لتمثيل الطلب
            const serviceRequest = {
                professional: professional,
                description: description,
                date: date,
                time: time,
                name: name,
                phone: phone,
                address: address,
                orderId: Math.floor(Math.random() * 1000000) // رقم طلب عشوائي
            };

            // حفظ الطلب في localStorage
            localStorage.setItem('currentServiceRequest', JSON.stringify(serviceRequest));

            // عرض رسالة تأكيد
            alert('تم إرسال طلبك بنجاح! سيتم تحويلك إلى صفحة تتبع الطلب.');

            // إعادة التوجيه إلى صفحة تتبع الطلب
            window.location.href = 'order-tracking.html';
        });
    }
}

function initProfessionalProfilePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const professionalName = urlParams.get('name');
    async function fetchProfessionalData() {
        try {
            const professionals = await DB.getProfessionals();
            const professional = professionals.find(p => p.name === professionalName);
            if (professional) {
                document.getElementById('professional-name').textContent = professional.name || '';
                document.getElementById('professional-service').textContent = professional.service_type || professional.service || '';
                document.getElementById('professional-location').textContent = professional.location || '';
                document.getElementById('professional-rating').textContent = professional.rating || '-';
                document.getElementById('professional-description').textContent = professional.description || '';
                document.getElementById('professional-image').src = professional.profile_image || professional.imageUrl || 'images/profile-placeholder.jpg';
                document.getElementById('professional-image').alt = professional.name || '';
            } else {
                document.getElementById('professional-profile').innerHTML = '<p>لم يتم العثور على هذا الصنايعي.</p>';
            }
        } catch (error) {
            document.getElementById('professional-profile').innerHTML = '<p>حدث خطأ أثناء تحميل البيانات.</p>';
        }
    }
    fetchProfessionalData();
}

function initAuthPage() {
    // وظائف صفحة تسجيل الدخول (auth.html)
    // =========================================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            UI.showSpinner('login-spinner');
            try {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                if (!email || !password) {
                    UI.showAlert('يرجى إدخال البريد الإلكتروني وكلمة المرور');
                    UI.hideSpinner('login-spinner');
                    return;
                }
                const response = await API.post('auth', { email, password });
                if (response.success) {
                    // حفظ بيانات المستخدم في localStorage
                    localStorage.setItem('user', JSON.stringify(response.user));
                    window.location.href = response.user.type === 'professional' ? 'professional-dashboard.html' : (response.user.type === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html');
                } else {
                    UI.showAlert('بيانات الدخول غير صحيحة');
                }
            } catch (error) {
                UI.showAlert('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
            } finally {
                UI.hideSpinner('login-spinner');
            }
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            UI.showSpinner('signup-spinner');
            try {
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                const type = document.getElementById('user-type').value;
                if (password !== confirmPassword) {
                    UI.showAlert('كلمتا المرور غير متطابقتين');
                    UI.hideSpinner('signup-spinner');
                    return;
                }
                // يمكنك إضافة رقم الهاتف إذا كان مطلوباً
                const response = await API.post('register', { name, email, password, type });
                if (response.status === 'success') {
                    UI.showAlert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.', 'success');
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                } else {
                    UI.showAlert('فشل إنشاء الحساب. البريد الإلكتروني مستخدم بالفعل.');
                }
            } catch (error) {
                UI.showAlert('فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
            } finally {
                UI.hideSpinner('signup-spinner');
            }
        });
    }
}

function initUserDashboard() {
    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.querySelector('.user-info h3').textContent = `أهلاً بك، ${user.name || ''}`;
    document.querySelector('.user-info .user-email').textContent = user.email || '';

    // تذكير بانتهاء العضوية
    if (user.membership_expiry) {
        const expiry = new Date(user.membership_expiry);
        const now = new Date();
        const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        if (diff <= 7 && diff >= 0) {
            document.getElementById('user-membership-info').innerHTML += `<div style="color:orange">تنبيه: ستنتهي عضويتك خلال ${diff} يوم. يرجى التجديد.</div>`;
        } else if (diff < 0) {
            document.getElementById('user-membership-info').innerHTML += `<div style="color:red">انتهت عضويتك. يرجى التواصل مع الإدارة للتجديد.</div>`;
        }
    }

    // جلب الطلبات من الـ API
    DB.getUserOrders(user.id).then(orders => {
        const ordersList = document.querySelector('.orders-list');
        if (ordersList) {
            ordersList.innerHTML = '';
            orders.forEach(order => {
                ordersList.innerHTML += `
                    <div class="order-item">
                        <p>رقم الطلب: ${order.id}</p>
                        <p>الخدمة: ${order.service}</p>
                        <p>الحالة: ${order.status}</p>
                    </div>
                `;
            });
        }
    });

    // جلب الإشعارات من الـ API
    NotificationService.getUserNotifications(user.id).then(notifications => {
        const notifList = document.querySelector('.notifications-list');
        if (notifList) {
            notifList.innerHTML = '';
            notifications.forEach(n => {
                notifList.innerHTML += `
                    <div class="notification-item${n.is_read ? '' : ' unread'}">
                        <i class="fas fa-info-circle"></i>
                        <p>${n.message}</p>
                        <span class="notification-date">${formatDate(n.created_at)}</span>
                    </div>
                `;
            });
        }
    });

    // جلب المدفوعات من الـ API
    DB.getUserPayments(user.id).then(payments => {
        const paymentsList = document.querySelector('.payments-list');
        if (paymentsList) {
            paymentsList.innerHTML = '';
            payments.forEach(payment => {
                paymentsList.innerHTML += `
                    <div class="payment-item">
                        <p>رقم الدفع: ${payment.id}</p>
                        <p>المبلغ: ${payment.amount}</p>
                        <p>التاريخ: ${formatDate(payment.date)}</p>
                    </div>
                `;
            });
        }
    });

    // تفعيل التنقل بين أقسام لوحة التحكم
    document.querySelectorAll('.dashboard-nav li[data-section]').forEach(li => {
        li.addEventListener('click', function() {
            document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.dashboard-nav li').forEach(nav => nav.classList.remove('active'));
            li.classList.add('active');
            document.getElementById(li.dataset.section).classList.add('active');
        });
    });

    // زر تحديد الكل كمقروء
    const markAllReadBtn = document.querySelector('.mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            await NotificationService.markAllRead(user.id);
            location.reload();
        });
    }
}

function initAiDiagnosisPage() {
    if (!isAuthenticated()) {
        alert('يجب تسجيل الدخول لاستخدام الذكاء الاصطناعي.');
        window.location.href = 'auth.html';
        return;
    }
    // وظائف صفحة التشخيص بالذكاء الاصطناعي (ai-diagnosis.html)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const diagnoseBtn = document.getElementById('diagnose-btn');
    if (diagnoseBtn) {
        diagnoseBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (!(await canUseAi(user))) {
                UI.showAlert('لقد استهلكت الحد المجاني اليومي. للترقية إلى استخدام غير محدود تواصل مع المدير عبر واتساب: 0102279250');
                return;
            }
            incrementAiUsage(user);
            // ...استدعاء الذكاء الاصطناعي...
        });
    }
}

// دالة تنسيق التاريخ (إذا لم تكن معرفة)
if (typeof formatDate !== 'function') {
    function formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };
        return new Date(date).toLocaleDateString('ar-EG', options);
    }
}
