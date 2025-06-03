function getParamFromUrl(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

// التحقق من صحة رقم الهاتف المصري
function isValidEgyptianPhone(phone) {
  const regex = /^(01)[0-2|5]{1}[0-9]{8}$/;
  return regex.test(phone);
}

// تنسيق التاريخ بالعربية
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

// التحقق من حالة تسجيل الدخول (موحد)
function isAuthenticated() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return !!user && !!user.id;
}

// توجيه المستخدم غير المسجل (موحد)
function requireAuth(redirectUrl = 'auth.html') {
  if (!isAuthenticated()) {
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}