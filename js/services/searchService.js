const SearchService = {
    async findNearestProfessionals(location, service) {
        const professionals = await DB.getProfessionals();
        // إذا توفرت إحداثيات العميل، احسب المسافة
        let pros = professionals.filter(p => p.is_available && p.service_type.includes(service));
        if (location && location.lat && location.lng) {
            pros.forEach(p => {
                if (p.latitude && p.longitude) {
                    const toRad = x => x * Math.PI / 180;
                    const R = 6371;
                    const dLat = toRad(p.latitude - location.lat);
                    const dLon = toRad(p.longitude - location.lng);
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(toRad(location.lat)) * Math.cos(toRad(p.latitude)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    p.distance = R * c;
                } else {
                    p.distance = 9999;
                }
            });
            pros.sort((a, b) => a.distance - b.distance);
        } else {
            pros.sort((a, b) => {
                if (a.membership_type !== b.membership_type) {
                    return a.membership_type === 'paid' ? -1 : 1;
                }
                return (b.rating || 0) - (a.rating || 0);
            });
        }
        return pros.slice(0, 5);
    }
};
