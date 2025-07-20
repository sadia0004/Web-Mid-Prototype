class PropertyDetails {
    constructor() {
        this.property = null;
        this.map = null;
        this.swiper = null;
        this.propertyId = this.getPropertyIdFromURL();
        
        this.init();
    }

    async init() {
        if (!this.propertyId) {
            this.showError();
            return;
        }

        try {
            await this.loadProperty();
            this.renderProperty();
            this.initializeMap();
            this.initializeImageGallery();
            this.setupEventListeners();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading property:', error);
            this.showError();
        }
    }

    getPropertyIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id'));
    }

    async loadProperty() {
        const response = await fetch('../public/dummy.json');
        const data = await response.json();
        
        // Find the property with matching ID
        for (const landlord of data.landlords) {
            for (const property of landlord.properties) {
                if (property.id === this.propertyId) {
                    this.property = {
                        ...property,
                        landlord: {
                            name: landlord.name,
                            phone: landlord.phone,
                            email: landlord.email,
                            rating: landlord.rating,
                            isVerified: landlord.isVerified,
                            totalProperties: landlord.totalProperties,
                            joinDate: landlord.joinDate
                        }
                    };
                    return;
                }
            }
        }
        
        throw new Error('Property not found');
    }

    renderProperty() {
        if (!this.property) return;

        // Update page title
        document.title = `${this.property.title} - Rentify`;

        // Property header
        document.getElementById('property-title').textContent = this.property.title;
        document.getElementById('property-location').innerHTML = `
            <i class="fas fa-map-marker-alt mr-2"></i>
            ${this.property.location.subArea}, ${this.property.location.area}, ${this.property.location.city}
        `;
        document.getElementById('property-price').textContent = `৳${this.property.rent.amount.toLocaleString()}`;
        document.getElementById('property-description').textContent = this.property.description;

        // Availability badge
        const availabilityBadge = document.getElementById('availability-badge');
        if (this.property.tenant.isOccupied) {
            availabilityBadge.textContent = 'Occupied';
            availabilityBadge.className = 'px-3 py-1 rounded-full text-sm font-medium text-white bg-red-500';
        } else {
            availabilityBadge.textContent = 'Available';
            availabilityBadge.className = 'px-3 py-1 rounded-full text-sm font-medium text-white bg-green-500';
        }

        // Property type badge
        document.getElementById('property-type-badge').textContent = this.property.type;

        // Rating
        this.renderRating();

        // Property features
        this.renderFeatures();

        // Room details
        this.renderRoomDetails();

        // Amenities
        this.renderAmenities();

        // Utilities
        this.renderUtilities();

        // Nearby places
        this.renderNearbyPlaces();

        // Landlord info
        this.renderLandlordInfo();

        // Rental details
        this.renderRentalDetails();

        // Tenant info (if occupied)
        this.renderTenantInfo();

        // Image gallery
        this.renderImageGallery();
    }

    renderRating() {
        const ratingContainer = document.getElementById('property-rating');
        const rating = this.property.landlord.rating;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        let starsHTML = '<div class="flex items-center space-x-1">';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star text-yellow-400"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        
        // Empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star text-yellow-400"></i>';
        }
        
        starsHTML += `<span class="text-gray-600 ml-2">(${rating})</span>`;
        starsHTML += '</div>';
        
        ratingContainer.innerHTML = starsHTML;
    }

    renderFeatures() {
        const featuresContainer = document.getElementById('property-features');
        const features = [
            { icon: 'fas fa-bed', label: 'Bedrooms', value: this.property.rooms.bedrooms || 'Studio' },
            { icon: 'fas fa-bath', label: 'Bathrooms', value: this.property.rooms.bathrooms },
            { icon: 'fas fa-ruler-combined', label: 'Area', value: `${this.property.size.area} sqft` },
            { icon: 'fas fa-building', label: 'Floor', value: this.property.floor },
            { icon: 'fas fa-compass', label: 'Facing', value: this.property.facing },
            { icon: 'fas fa-couch', label: 'Furnished', value: this.property.furnished },
            { icon: 'fas fa-check-circle', label: 'Condition', value: this.property.condition },
            { icon: 'fas fa-calendar', label: 'Available From', value: new Date(this.property.availableFrom).toLocaleDateString() }
        ];

        featuresContainer.innerHTML = features.map(feature => `
            <div class="text-center p-4 bg-gray-50 rounded-lg">
                <i class="${feature.icon} text-primary text-2xl mb-2"></i>
                <div class="font-semibold text-gray-900">${feature.value}</div>
                <div class="text-sm text-gray-600">${feature.label}</div>
            </div>
        `).join('');
    }

    renderRoomDetails() {
        const roomContainer = document.getElementById('room-details');
        const rooms = this.property.rooms;
        
        const roomDetails = [
            { label: 'Bedrooms', value: rooms.bedrooms || 0, icon: 'fas fa-bed' },
            { label: 'Bathrooms', value: rooms.bathrooms || 0, icon: 'fas fa-bath' },
            { label: 'Living Room', value: rooms.livingRoom || 0, icon: 'fas fa-couch' },
            { label: 'Kitchen', value: rooms.kitchen || 0, icon: 'fas fa-utensils' },
            { label: 'Dining Room', value: rooms.diningRoom || 0, icon: 'fas fa-utensils' },
            { label: 'Balcony', value: rooms.balcony || 0, icon: 'fas fa-door-open' }
        ];

        // Add additional rooms if they exist
        if (rooms.study) roomDetails.push({ label: 'Study Room', value: rooms.study, icon: 'fas fa-book' });
        if (rooms.servantRoom) roomDetails.push({ label: 'Servant Room', value: rooms.servantRoom, icon: 'fas fa-bed' });
        if (rooms.garage) roomDetails.push({ label: 'Garage', value: rooms.garage, icon: 'fas fa-car' });
        if (rooms.storeRoom) roomDetails.push({ label: 'Store Room', value: rooms.storeRoom, icon: 'fas fa-box' });

        roomContainer.innerHTML = roomDetails.map(room => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <i class="${room.icon} text-primary mr-3"></i>
                    <span class="text-gray-700">${room.label}</span>
                </div>
                <span class="font-semibold text-gray-900">${room.value}</span>
            </div>
        `).join('');
    }

    renderAmenities() {
        const amenitiesContainer = document.getElementById('amenities-list');
        
        amenitiesContainer.innerHTML = this.property.amenities.map(amenity => `
            <div class="flex items-center p-3 bg-green-50 rounded-lg">
                <i class="fas fa-check-circle text-green-500 mr-3"></i>
                <span class="text-gray-700">${amenity}</span>
            </div>
        `).join('');
    }

    renderUtilities() {
        const utilitiesContainer = document.getElementById('utilities-list');
        const utilities = this.property.utilities;
        
        const utilityList = [
            { label: 'Electricity', value: utilities.electricity, icon: 'fas fa-bolt' },
            { label: 'Gas', value: utilities.gas, icon: 'fas fa-fire' },
            { label: 'Water', value: utilities.water, icon: 'fas fa-tint' },
            { label: 'Internet', value: utilities.internet, icon: 'fas fa-wifi' },
            { label: 'Cable TV', value: utilities.cableTv, icon: 'fas fa-tv' }
        ];

        utilitiesContainer.innerHTML = utilityList.map(utility => `
            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div class="flex items-center">
                    <i class="${utility.icon} text-blue-500 mr-3"></i>
                    <span class="text-gray-700">${utility.label}</span>
                </div>
                <span class="font-semibold text-gray-900">${utility.value}</span>
            </div>
        `).join('');
    }

    renderNearbyPlaces() {
        const nearbyContainer = document.getElementById('nearby-places');
        
        nearbyContainer.innerHTML = this.property.location.nearbyPlaces.map(place => `
            <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                <i class="fas fa-map-marker-alt text-red-500 mr-3"></i>
                <span class="text-gray-700">${place}</span>
            </div>
        `).join('');
    }

    renderLandlordInfo() {
        const landlordContainer = document.getElementById('landlord-info');
        const landlord = this.property.landlord;
        
        landlordContainer.innerHTML = `
            <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">${landlord.name}</h4>
                    <div class="flex items-center space-x-2">
                        <div class="flex text-yellow-400 text-sm">
                            ${'★'.repeat(Math.floor(landlord.rating))}
                        </div>
                        <span class="text-sm text-gray-600">(${landlord.rating})</span>
                        ${landlord.isVerified ? '<i class="fas fa-check-circle text-green-500 text-sm"></i>' : ''}
                    </div>
                    <p class="text-sm text-gray-600">${landlord.totalProperties} properties</p>
                    <p class="text-sm text-gray-600">Joined ${new Date(landlord.joinDate).getFullYear()}</p>
                </div>
            </div>
        `;
    }

    renderRentalDetails() {
        const rentalContainer = document.getElementById('rental-details');
        const rent = this.property.rent;
        
        const rentalInfo = [
            { label: 'Monthly Rent', value: `৳${rent.amount.toLocaleString()}`, icon: 'fas fa-money-bill-wave' },
            { label: 'Security Deposit', value: `৳${rent.deposit.toLocaleString()}`, icon: 'fas fa-shield-alt' },
            { label: 'Advance Payment', value: `${rent.advanceMonths} months`, icon: 'fas fa-calendar' },
            { label: 'Currency', value: rent.currency, icon: 'fas fa-coins' }
        ];

        rentalContainer.innerHTML = rentalInfo.map(info => `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="${info.icon} text-primary mr-3"></i>
                    <span class="text-gray-700">${info.label}</span>
                </div>
                <span class="font-semibold text-gray-900">${info.value}</span>
            </div>
        `).join('');
    }

    renderTenantInfo() {
        const tenantContainer = document.getElementById('tenant-info');
        const tenant = this.property.tenant;
        
        if (tenant.isOccupied) {
            tenantContainer.classList.remove('hidden');
            document.getElementById('tenant-details').innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">Tenant Name</span>
                        <span class="font-semibold">${tenant.tenantName}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">Family Members</span>
                        <span class="font-semibold">${tenant.familyMembers}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">Occupancy Date</span>
                        <span class="font-semibold">${new Date(tenant.occupancyDate).toLocaleDateString()}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">Lease End Date</span>
                        <span class="font-semibold">${new Date(tenant.leaseEndDate).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        }
    }

    renderImageGallery() {
        const galleryContainer = document.getElementById('image-gallery');
        
        galleryContainer.innerHTML = this.property.images.map(image => `
            <div class="swiper-slide">
                <img src="${image}" alt="${this.property.title}" class="w-full h-full object-cover">
            </div>
        `).join('');
    }

    initializeImageGallery() {
        this.swiper = new Swiper('.property-gallery', {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            }
        });
    }

    initializeMap() {
        const coords = this.property.location.coordinates;
        
        // Initialize the map
        this.map = L.map('map').setView([coords.lat, coords.lng], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add marker for the property
        const marker = L.marker([coords.lat, coords.lng]).addTo(this.map);
        
        // Custom popup content
        marker.bindPopup(`
            <div class="text-center">
                <h3 class="font-semibold text-gray-900">${this.property.title}</h3>
                <p class="text-gray-600">${this.property.location.subArea}, ${this.property.location.area}</p>
                <p class="text-primary font-semibold">৳${this.property.rent.amount.toLocaleString()}/month</p>
            </div>
        `).openPopup();

        // Add nearby places as markers
        this.property.location.nearbyPlaces.forEach((place, index) => {
            // Approximate coordinates for nearby places (offset from main location)
            const offset = 0.002;
            const nearbyLat = coords.lat + (Math.random() - 0.5) * offset;
            const nearbyLng = coords.lng + (Math.random() - 0.5) * offset;
            
            const nearbyMarker = L.marker([nearbyLat, nearbyLng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<i class="fas fa-map-marker-alt text-red-500"></i>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 20]
                })
            }).addTo(this.map);
            
            nearbyMarker.bindPopup(`<div class="text-center"><p class="text-gray-700">${place}</p></div>`);
        });
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn?.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Contact buttons
        document.getElementById('call-btn').addEventListener('click', () => {
            window.location.href = `tel:${this.property.landlord.phone}`;
        });

        document.getElementById('email-btn').addEventListener('click', () => {
            const subject = `Inquiry about ${this.property.title}`;
            const body = `Hi ${this.property.landlord.name},\n\nI'm interested in your property: ${this.property.title}\nLocation: ${this.property.location.subArea}, ${this.property.location.area}\nRent: ৳${this.property.rent.amount.toLocaleString()}/month\n\nPlease let me know if it's available for viewing.\n\nThank you!`;
            window.location.href = `mailto:${this.property.landlord.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });

        document.getElementById('rent-btn').addEventListener('click', () => {
            if (this.property.tenant.isOccupied) {
                alert('This property is currently occupied.');
            } else {
                alert(`Redirecting to rental application for ${this.property.title}`);
                // In a real app, redirect to rental application form
            }
        });

        // Favorite button
        document.getElementById('favorite-btn').addEventListener('click', () => {
            const btn = document.getElementById('favorite-btn');
            const icon = btn.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.classList.add('text-red-500');
                btn.classList.add('bg-red-50');
            } else {
                icon.classList.remove('fas', 'text-red-500');
                icon.classList.add('far');
                btn.classList.remove('bg-red-50');
            }
        });
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('property-content').classList.remove('hidden');
    }

    showError() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error-state').classList.remove('hidden');
    }
}

// Global function for back navigation
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'properties.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PropertyDetails();
});
