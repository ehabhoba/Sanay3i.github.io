const LazyLoader = {
    init() {
        const images = document.querySelectorAll('img[data-src]');
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, options);

        images.forEach(img => observer.observe(img));
    },

    // تطبيق على الصور الديناميكية
    observe(img) {
        if ('IntersectionObserver' in window) {
            img.setAttribute('data-src', img.src);
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            this.init();
        }
    }
};
