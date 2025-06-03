const AuthService = {
    async login(email, password) {
        try {
            const response = await API.post('auth/login', { email, password });
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            return await API.post('auth/register', userData);
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    isAuthenticated() {
        const user = localStorage.getItem('user');
        return !!user && !!JSON.parse(user).id;
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
