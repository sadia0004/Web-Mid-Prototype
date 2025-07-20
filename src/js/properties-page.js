class PropertiesPage {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentPage = 1;
        this.propertiesPerPage = 9;
        this.currentView = 'grid';
        
        this.init();
    }

    async init() {
        await this.loadProperties();
        this.setupEventListeners();
        this.renderProperties();
        this.updateResultsCount();
    }

    async loadProperties() {
        try {
            const response = await fetch('../public/dummy.json');
            const data = await response.json();
            
            // Flatten all properties from all landlords
            this.properties = [];
            data.landlords.forEach(landlord => {
                landlord.properties.forEach(property => {
                    this.properties.push({
                        ...property,
                        landlord: {
                            name: landlord.name,
                            phone: landlord.phone,
                            email: landlord.email,
                            rating: landlord.rating,
                            isVerified: landlord.isVerified
                        }
                    });
                });
            });
            
            this.filteredProperties = [...this.properties];
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Error loading properties:', error);
            document.getElementById('loading').innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Error Loading Properties</h3>
                    <p class="text-gray-600">Please try again later.</p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn?.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        const searchLocation = document.getElementById('search-location');
        const propertyType = document.getElementById('property-type');
        const priceRange = document.getElementById('price-range');

        searchBtn?.addEventListener('click', () => this.handleSearch());
        searchLocation?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Filters
        document.getElementById('bedrooms-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('furnished-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('availability-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('sort-options')?.addEventListener('change', () => this.handleSort());

        // Clear filters
        document.getElementById('clear-filters')?.addEventListener('click', () => this.clearFilters());

        // View toggle
        document.getElementById('grid-view')?.addEventListener('click', () => this.toggleView('grid'));
        document.getElementById('list-view')?.addEventListener('click', () => this.toggleView('list'));
    }

    handleSearch() {
        const location = document.getElementById('search-location').value.toLowerCase();
        const type = document.getElementById('property-type').value;
        const priceRange = document.getElementById('price-range').value;

        this.filteredProperties = this.properties.filter(property => {
            const matchesLocation = !location || 
                property.location.area.toLowerCase().includes(location) ||
                property.location.subArea.toLowerCase().includes(location) ||
                property.location.city.toLowerCase().includes(location) ||
                property.location.district.toLowerCase().includes(location);

            const matchesType = !type || property.type === type;

            const matchesPrice = !priceRange || this.matchesPriceRange(property.rent.amount, priceRange);

            return matchesLocation && matchesType && matchesPrice;
        });

        this.currentPage = 1;
        this.applyFilters();
    }

    matchesPriceRange(amount, range) {
        switch (range) {
            case '0-15000':
                return amount <= 15000;
            case '15000-25000':
                return amount > 15000 && amount <= 25000;
            case '25000-35000':
                return amount > 25000 && amount <= 35000;
            case '35000-50000':
                return amount > 35000 && amount <= 50000;
            case '50000+':
                return amount > 50000;
            default:
                return true;
        }
    }

    applyFilters() {
        const bedrooms = document.getElementById('bedrooms-filter').value;
        const furnished = document.getElementById('furnished-filter').value;
        const availability = document.getElementById('availability-filter').value;

        let filtered = [...this.filteredProperties];

        if (bedrooms) {
            filtered = filtered.filter(property => {
                if (bedrooms === '4') {
                    return property.rooms.bedrooms >= 4;
                }
                return property.rooms.bedrooms == bedrooms;
            });
        }

        if (furnished) {
            filtered = filtered.filter(property => property.furnished === furnished);
        }

        if (availability) {
            filtered = filtered.filter(property => {
                if (availability === 'available') {
                    return !property.tenant.isOccupied;
                } else if (availability === 'occupied') {
                    return property.tenant.isOccupied;
                }
                return true;
            });
        }

        this.filteredProperties = filtered;
        this.currentPage = 1;
        this.renderProperties();
        this.updateResultsCount();
    }

    handleSort() {
        const sortOption = document.getElementById('sort-options').value;

        switch (sortOption) {
            case 'newest':
                this.filteredProperties.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                break;
            case 'oldest':
                this.filteredProperties.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
                break;
            case 'price-low':
                this.filteredProperties.sort((a, b) => a.rent.amount - b.rent.amount);
                break;
            case 'price-high':
                this.filteredProperties.sort((a, b) => b.rent.amount - a.rent.amount);
                break;
            case 'size-large':
                this.filteredProperties.sort((a, b) => b.size.area - a.size.area);
                break;
            case 'size-small':
                this.filteredProperties.sort((a, b) => a.size.area - b.size.area);
                break;
        }

        this.renderProperties();
    }

    clearFilters() {
        // Clear all filter inputs
        document.getElementById('search-location').value = '';
        document.getElementById('property-type').value = '';
        document.getElementById('price-range').value = '';
        document.getElementById('bedrooms-filter').value = '';
        document.getElementById('furnished-filter').value = '';
        document.getElementById('availability-filter').value = '';
        document.getElementById('sort-options').value = 'newest';

        // Reset to all properties
        this.filteredProperties = [...this.properties];
        this.currentPage = 1;
        this.renderProperties();
        this.updateResultsCount();
    }

    toggleView(view) {
        this.currentView = view;
        
        // Update button states
        const gridBtn = document.getElementById('grid-view');
        const listBtn = document.getElementById('list-view');
        
        if (view === 'grid') {
            gridBtn.classList.add('text-primary');
            gridBtn.classList.remove('text-gray-500');
            listBtn.classList.add('text-gray-500');
            listBtn.classList.remove('text-primary');
        } else {
            listBtn.classList.add('text-primary');
            listBtn.classList.remove('text-gray-500');
            gridBtn.classList.add('text-gray-500');
            gridBtn.classList.remove('text-primary');
        }

        this.renderProperties();
    }

    renderProperties() {
        const container = document.getElementById('properties-grid');
        const noResults = document.getElementById('no-results');

        if (this.filteredProperties.length === 0) {
            container.style.display = 'none';
            noResults.classList.remove('hidden');
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        container.style.display = 'grid';
        noResults.classList.add('hidden');

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.propertiesPerPage;
        const endIndex = startIndex + this.propertiesPerPage;
        const paginatedProperties = this.filteredProperties.slice(startIndex, endIndex);

        // Update grid class based on view
        if (this.currentView === 'list') {
            container.className = 'space-y-6';
        } else {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
        }

        // Render property cards
        container.innerHTML = paginatedProperties.map(property => 
            this.createPropertyCard(property)
        ).join('');

        this.renderPagination();
    }

    createPropertyCard(property) {
        const isAvailable = !property.tenant.isOccupied;
        const availabilityBadge = isAvailable ? 
            '<span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">Available</span>' :
            '<span class="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">Occupied</span>';

        if (this.currentView === 'list') {
            return `
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 relative">
                            <img src="${property.images[0]}" alt="${property.title}" 
                                 class="w-full h-64 md:h-full object-cover">
                            <div class="absolute top-4 left-4">
                                ${availabilityBadge}
                            </div>
                            <div class="absolute top-4 right-4">
                                <button class="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                                    <i class="far fa-heart text-gray-600"></i>
                                </button>
                            </div>
                        </div>
                        <div class="md:w-2/3 p-6">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-900 mb-2">${property.title}</h3>
                                    <p class="text-gray-600 flex items-center">
                                        <i class="fas fa-map-marker-alt mr-2"></i>
                                        ${property.location.subArea}, ${property.location.area}, ${property.location.city}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold text-primary">৳${property.rent.amount.toLocaleString()}</p>
                                    <p class="text-gray-500 text-sm">per month</p>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div class="text-center">
                                    <i class="fas fa-bed text-primary text-lg mb-1"></i>
                                    <p class="text-sm text-gray-600">${property.rooms.bedrooms} Beds</p>
                                </div>
                                <div class="text-center">
                                    <i class="fas fa-bath text-primary text-lg mb-1"></i>
                                    <p class="text-sm text-gray-600">${property.rooms.bathrooms} Baths</p>
                                </div>
                                <div class="text-center">
                                    <i class="fas fa-ruler-combined text-primary text-lg mb-1"></i>
                                    <p class="text-sm text-gray-600">${property.size.area} sqft</p>
                                </div>
                                <div class="text-center">
                                    <i class="fas fa-couch text-primary text-lg mb-1"></i>
                                    <p class="text-sm text-gray-600">${property.furnished}</p>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 mb-4">
                                ${property.amenities.slice(0, 3).map(amenity => 
                                    `<span class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">${amenity}</span>`
                                ).join('')}
                                ${property.amenities.length > 3 ? 
                                    `<span class="text-gray-500 text-xs">+${property.amenities.length - 3} more</span>` : ''}
                            </div>

                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">${property.landlord.name}</p>
                                        <div class="flex items-center">
                                            <div class="flex text-yellow-400 text-xs">
                                                ${'★'.repeat(Math.floor(property.landlord.rating))}
                                            </div>
                                            <span class="text-xs text-gray-500 ml-1">(${property.landlord.rating})</span>
                                            ${property.landlord.isVerified ? '<i class="fas fa-check-circle text-green-500 text-xs ml-1"></i>' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <a href="property-details.html?id=${property.id}" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm text-center block">
                                        View Details
                                    </a>
                                    ${isAvailable ? 
                                        '<button class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm">Rent Now</button>' :
                                        '<button class="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed text-sm" disabled>Not Available</button>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                    <div class="relative">
                        <img src="${property.images[0]}" alt="${property.title}" 
                             class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute top-4 left-4">
                            ${availabilityBadge}
                        </div>
                        <div class="absolute top-4 right-4">
                            <button class="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                                <i class="far fa-heart text-gray-600"></i>
                            </button>
                        </div>
                        <div class="absolute bottom-4 right-4">
                            <span class="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                ${property.images.length} Photos
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="text-lg font-bold text-gray-900 line-clamp-2">${property.title}</h3>
                            <div class="text-right ml-2">
                                <p class="text-xl font-bold text-primary">৳${property.rent.amount.toLocaleString()}</p>
                                <p class="text-gray-500 text-sm">per month</p>
                            </div>
                        </div>
                        
                        <p class="text-gray-600 text-sm mb-4 flex items-center">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            ${property.location.subArea}, ${property.location.area}
                        </p>
                        
                        <div class="grid grid-cols-3 gap-3 mb-4">
                            <div class="text-center">
                                <i class="fas fa-bed text-primary text-lg mb-1"></i>
                                <p class="text-sm text-gray-600">${property.rooms.bedrooms} Beds</p>
                            </div>
                            <div class="text-center">
                                <i class="fas fa-bath text-primary text-lg mb-1"></i>
                                <p class="text-sm text-gray-600">${property.rooms.bathrooms} Baths</p>
                            </div>
                            <div class="text-center">
                                <i class="fas fa-ruler-combined text-primary text-lg mb-1"></i>
                                <p class="text-sm text-gray-600">${property.size.area} sqft</p>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-1 mb-4">
                            ${property.amenities.slice(0, 2).map(amenity => 
                                `<span class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">${amenity}</span>`
                            ).join('')}
                            ${property.amenities.length > 2 ? 
                                `<span class="text-gray-500 text-xs py-1">+${property.amenities.length - 2}</span>` : ''}
                        </div>

                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-2">
                                <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-xs"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">${property.landlord.name}</p>
                                    <div class="flex items-center">
                                        <div class="flex text-yellow-400 text-xs">
                                            ${'★'.repeat(Math.floor(property.landlord.rating))}
                                        </div>
                                        <span class="text-xs text-gray-500 ml-1">(${property.landlord.rating})</span>
                                    </div>
                                </div>
                            </div>
                            ${property.landlord.isVerified ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}
                        </div>
                        
                        <div class="space-y-2">
                            <a href="property-details.html?id=${property.id}" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-center block">
                                View Details
                            </a>
                            ${isAvailable ? 
                                '<button class="w-full bg-accent text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium">Rent Now</button>' :
                                '<button class="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed text-sm font-medium" disabled>Not Available</button>'
                            }
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderPagination() {
        const container = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredProperties.length / this.propertiesPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button onclick="propertiesPage.changePage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''} 
                    class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 ${this.currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button onclick="propertiesPage.changePage(${i})" 
                            class="px-3 py-2 text-sm font-medium ${i === this.currentPage ? 'text-primary bg-blue-50 border-primary' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `
                    <span class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">...</span>
                `;
            }
        }

        // Next button
        paginationHTML += `
            <button onclick="propertiesPage.changePage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} 
                    class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 ${this.currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}">
                Next
            </button>
        `;

        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredProperties.length / this.propertiesPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderProperties();
            
            // Scroll to top of properties section
            document.getElementById('properties-grid').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateResultsCount() {
        const total = this.filteredProperties.length;
        const startIndex = (this.currentPage - 1) * this.propertiesPerPage + 1;
        const endIndex = Math.min(startIndex + this.propertiesPerPage - 1, total);
        
        const countElement = document.getElementById('results-count');
        if (total === 0) {
            countElement.textContent = 'No properties found';
        } else if (total <= this.propertiesPerPage) {
            countElement.textContent = `Showing ${total} properties`;
        } else {
            countElement.textContent = `Showing ${startIndex}-${endIndex} of ${total} properties`;
        }
    }
}

// Initialize the properties page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.propertiesPage = new PropertiesPage();
});
