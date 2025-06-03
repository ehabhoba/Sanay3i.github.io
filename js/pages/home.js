function initHomePage() {
	const searchInput = document.querySelector('.search-bar input[type="text"]');
	const searchButton = document.querySelector('.search-bar button, #search-button');
	const resultsContainer = document.getElementById('search-results-container');
	const noResultsMessage = document.getElementById('no-results-message');

	async function performSearch() {
		const query = searchInput.value.trim();
		resultsContainer.innerHTML = '';
		noResultsMessage.style.display = 'none';
		if (query === '') {
			alert('يرجى إدخال كلمة بحث!');
			return;
		}
		try {
			const professionals = await DB.getProfessionals();
			const filtered = professionals.filter(p =>
				(p.service_type || p.service || '').toLowerCase().includes(query.toLowerCase()) ||
				(p.name || '').toLowerCase().includes(query.toLowerCase())
			);
			if (filtered.length === 0) {
				noResultsMessage.style.display = 'block';
				return;
			}
			filtered.sort((a, b) => {
				// ترتيب: المدفوعين أولاً، ثم الموثقين، ثم الأعلى تقييماً
				if (a.membership_type !== b.membership_type) {
					return a.membership_type === 'paid' ? -1 : 1;
				}
				if (a.is_verified !== b.is_verified) {
					return b.is_verified - a.is_verified;
				}
				return (b.rating || 0) - (a.rating || 0);
			});
			filtered.forEach(result => {
				const card = document.createElement('div');
				card.classList.add('result-card');
				const verifiedBadge = result.is_verified ? '<span class="verified-badge" title="صنايعي موثوق"><i class="fas fa-badge-check"></i></span>' : '';
				card.innerHTML = `
					<div class="card-header">
						<img src="${result.profile_image || result.imageUrl || 'images/profile-placeholder.jpg'}" alt="${result.name}" class="profile-img">
						<div class="info">
							<h4>${result.name} ${verifiedBadge}</h4>
							<p class="service-type">${result.service_type || result.service || ''}</p>
						</div>
					</div>
					<p class="description">${result.description || ''}</p>
					<div class="rating-location">
						<div class="rating">
							<i class="fas fa-star"></i> <span>${result.rating || '-'}</span>
						</div>
						<div class="location">
							<i class="fas fa-map-marker-alt"></i> ${result.location || ''}
						</div>
					</div>
					<a href="professional-profile.html?name=${encodeURIComponent(result.name)}" class="btn secondary-btn">اطلب الخدمة</a>
				`;
				resultsContainer.appendChild(card);
			});
		} catch (error) {
			noResultsMessage.style.display = 'block';
			noResultsMessage.textContent = 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.';
		}
	}

	if (searchButton && searchInput) {
		searchButton.addEventListener('click', performSearch);
		searchInput.addEventListener('keypress', event => {
			if (event.key === 'Enter') {
				event.preventDefault();
				performSearch();
			}
		});
	}

	document.querySelectorAll('.popular-services .service-icon').forEach(icon => {
		icon.addEventListener('click', function () {
			const serviceName = this.querySelector('p').textContent.trim();
			searchInput.value = serviceName;
			performSearch();
		});
	});

	const mapContainer = document.getElementById('map-container');
	if (mapContainer) {
		MapService.initMap('map-container');
		MapService.loadProfessionalLocations();
	}
}

function setHomePageLanguage() {
    const lang = getLanguage();
    if (lang === 'en') {
        document.querySelector('.hero-section h2').textContent = 'Find the best professionals and services in your area';
        document.querySelector('.hero-section p').textContent = 'A smart platform connecting you with the best craftsmen and workers in all fields.';
        // ...يمكنك تعريب باقي العناصر حسب الحاجة...
    }
}

document.addEventListener('DOMContentLoaded', initHomePage);
document.addEventListener('DOMContentLoaded', setHomePageLanguage);
console.log("Home page initialized.");
