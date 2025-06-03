const AdminService = {
    async verifyProfessional(proId) {
        return await API.post('admin/verify-professional', {
            professional_id: proId,
            is_verified: true
        });
    },

    async enableUnlimitedAI(userId) {
        return await API.post('admin/enable-ai', {
            user_id: userId,
            unlimited: true
        });
    },

    async searchUsers(query) {
        // البحث بالـ ID أو البريد أو رقم الهاتف
        const users = await DB.getAllUsers();
        return users.filter(u => 
            u.id.toString() === query ||
            u.email.includes(query) ||
            (u.phone && u.phone.includes(query))
        );
    }
};
