const Schema = {
    organization: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "منصة صنايعي",
        "url": "https://sanaiiplatform.com",
        "logo": "https://sanaiiplatform.com/images/logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+20-1012345678",
            "contactType": "customer service"
        }
    },
    service: {
        "@context": "https://schema.org",
        "@type": "Service",
        "provider": {
            "@type": "Organization",
            "name": "منصة صنايعي"
        },
        "areaServed": "مصر",
        "category": "خدمات منزلية"
    }
};

// تطبيق Schema على الصفحات
document.head.innerHTML += `
    <script type="application/ld+json">
        ${JSON.stringify(Schema.organization)}
    </script>
`;
