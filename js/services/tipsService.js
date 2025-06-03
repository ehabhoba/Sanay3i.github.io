const TipsService = {
    tips: {
        newUser: [
            'يمكنك تجربة البحث عن صنايعي قريب منك',
            'جرب خاصية التشخيص بالذكاء الاصطناعي',
            'يمكنك تقييم الصنايعي بعد إتمام الخدمة'
        ],
        professional: [
            'أضف صورك وشهاداتك لزيادة فرص قبول طلباتك',
            'حدث موقعك باستمرار للحصول على طلبات قريبة',
            'الرد السريع على العملاء يزيد من تقييمك'
        ]
    },

    showRandomTip(userType = 'newUser') {
        const relevantTips = this.tips[userType];
        if (!relevantTips) return;
        
        const randomTip = relevantTips[Math.floor(Math.random() * relevantTips.length)];
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-notification';
        tipElement.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${randomTip}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(tipElement);
        
        setTimeout(() => tipElement.remove(), 5000);
    }
};
