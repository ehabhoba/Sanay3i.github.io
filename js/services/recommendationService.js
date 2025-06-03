const RecommendationService = {
    async getPersonalizedRecommendations(userId) {
        try {
            const userHistory = await DB.getUserServiceHistory(userId);
            const userPreferences = await DB.getUserPreferences(userId);

            // منطق توصية بسيط: اقترح الخدمات الأكثر طلباً أو المفضلة
            const recommendations = this.analyzeUserBehavior(userHistory, userPreferences);
            return recommendations;
        } catch (error) {
            console.error('Error getting recommendations:', error);
            throw error;
        }
    },

    analyzeUserBehavior(history, preferences) {
        // تحليل بسيط: دمج الخدمات المفضلة مع الأكثر تكراراً في التاريخ
        const freq = {};
        (history || []).forEach(h => {
            freq[h.service] = (freq[h.service] || 0) + 1;
        });
        let sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
        let prefs = (preferences && preferences.services) ? preferences.services : [];
        // دمج بدون تكرار
        const all = [...new Set([...prefs, ...sorted])];
        return all.slice(0, 5);
    }
};
