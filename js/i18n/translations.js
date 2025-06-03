const translations = {
    ar: {
        common: {
            search: "بحث",
            login: "تسجيل دخول",
            register: "تسجيل جديد",
            home: "الرئيسية",
            about: "من نحن",
            contact: "تواصل معنا",
            orders: "الطلبات"
        },
        errors: {
            required: "هذا الحقل مطلوب",
            invalidEmail: "بريد إلكتروني غير صالح",
            invalidPhone: "رقم هاتف غير صالح"
        },
        success: {
            orderCreated: "تم إنشاء الطلب بنجاح",
            profileUpdated: "تم تحديث الملف الشخصي"
        }
    },
    en: {
        common: {
            search: "Search",
            login: "Login",
            register: "Register",
            home: "Home",
            about: "About",
            contact: "Contact",
            orders: "Orders"
        },
        errors: {
            required: "This field is required",
            invalidEmail: "Invalid email",
            invalidPhone: "Invalid phone number"
        },
        success: {
            orderCreated: "Order created successfully",
            profileUpdated: "Profile updated successfully"
        }
    }
};

const I18n = {
    currentLocale: localStorage.getItem('lang') || 'ar',
    t(key) {
        const keys = key.split('.');
        let value = translations[this.currentLocale];
        for (const k of keys) {
            value = value[k];
            if (!value) return key;
        }
        return value;
    },
    setLocale(locale) {
        if (translations[locale]) {
            this.currentLocale = locale;
            localStorage.setItem('lang', locale);
            document.documentElement.lang = locale;
            document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        }
    }
};
