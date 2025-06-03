function initAuthPage() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const tabSwitchLinks = document.querySelectorAll('[data-tab-switch]');

    function switchAuthForm(targetTabId) {
        authTabs.forEach(tab => tab.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active'));

        const targetTab = document.querySelector(`.auth-tab[data-tab="${targetTabId}"]`);
        const targetForm = document.getElementById(`${targetTabId}-form`);

        if (targetTab) targetTab.classList.add('active');
        if (targetForm) targetForm.classList.add('active');
    }

    // Event listeners
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchAuthForm(tab.dataset.tab);
        });
    });

    tabSwitchLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm(link.dataset.tabSwitch);
        });
    });

    initFormValidation();

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const passwordStrength = document.getElementById('password-strength');

    // إضافة التحقق من قوة كلمة المرور
    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        return strength;
    }

    if (signupForm) {
        const passwordInput = signupForm.querySelector('#signup-password');
        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            const messages = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
            if (passwordStrength) {
                passwordStrength.textContent = `قوة كلمة المرور: ${messages[Math.max(0, strength-1)]}`;
                passwordStrength.className = `strength-${strength}`;
            }
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                UI.showSpinner('signup-spinner');
                const formData = new FormData(signupForm);
                const data = Object.fromEntries(formData);
                // تحقق من صحة البريد وكلمة المرور
                if (!data['signup-email'] || !data['signup-password']) {
                    UI.showAlert('يرجى إدخال البريد الإلكتروني وكلمة المرور');
                    return;
                }
                const response = await AuthService.register(data);
                if (response.success) {
                    UI.showAlert('تم إنشاء حسابك بنجاح!', 'success');
                    // توجيه حسب نوع المستخدم
                    if (response.user && response.user.type === 'professional') {
                        window.location.href = 'professional-dashboard.html';
                    } else if (response.user && response.user.type === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                }
            } catch (error) {
                UI.showAlert(error.message);
            } finally {
                UI.hideSpinner('signup-spinner');
            }
        });
    }
}
