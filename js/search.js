// Search functionality
class SearchManager {
    constructor() {
        this.searchForm = null;
        this.searchResults = [];
        this.isSearching = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initAutocomplete();
    }

    bindEvents() {
        // Handle search form submission
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.search-form') || e.target.closest('.search-form')) {
                e.preventDefault();
                this.handleSearch();
            }
        });

        // Handle search button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-search]') || e.target.closest('[data-search]')) {
                e.preventDefault();
                this.handleSearch();
            }
        });

        // Handle input changes for live search
        document.addEventListener('input', (e) => {
            if (e.target.matches('.search-input')) {
                this.debounce(() => this.handleLiveSearch(e.target.value), 300)();
            }
        });
    }

    async handleSearch() {
        if (this.isSearching) return;

        const searchData = this.getSearchData();
        if (!this.validateSearchData(searchData)) {
            this.showValidationError();
            return;
        }

        this.isSearching = true;
        this.showSearchLoader();

        try {
            const results = await this.performSearch(searchData);
            this.displaySearchResults(results);
            this.trackSearchEvent(searchData);
        } catch (error) {
            console.error('Search failed:', error);
            this.showSearchError();
        } finally {
            this.isSearching = false;
            this.hideSearchLoader();
        }
    }

    getSearchData() {
        const locationInput = document.querySelector('input[placeholder*="Location"]');
        const propertyTypeSelect = document.querySelector('select');
        const priceRangeSelect = document.querySelectorAll('select')[1];

        return {
            location: locationInput?.value.trim() || '',
            propertyType: propertyTypeSelect?.value || '',
            priceRange: priceRangeSelect?.value || '',
            bedrooms: this.getSelectedBedrooms(),
            bathrooms: this.getSelectedBathrooms()
        };
    }

    getSelectedBedrooms() {
        const bedroomSelect = document.querySelector('select[name="bedrooms"]');
        return bedroomSelect?.value || '';
    }

    getSelectedBathrooms() {
        const bathroomSelect = document.querySelector('select[name="bathrooms"]');
        return bathroomSelect?.value || '';
    }

    validateSearchData(data) {
        // At least one search criteria should be provided
        return Object.values(data).some(value => value !== '');
    }

    async performSearch(searchData) {
        // Simulate API call - replace with actual search endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResults = this.generateMockResults(searchData);
                resolve(mockResults);
            }, 1500);
        });
    }

    generateMockResults(searchData) {
        // Mock search results based on search criteria
        const allProperties = [
            {
                id: 1,
                title: "Modern Downtown Apartment",
                price: 1500,
                location: "Downtown, NY",
                bedrooms: 2,
                bathrooms: 2,
                sqft: 1200,
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.9
            },
            {
                id: 2,
                title: "Cozy Family House",
                price: 2200,
                location: "Suburbs, CA",
                bedrooms: 3,
                bathrooms: 2,
                sqft: 1800,
                image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.7
            },
            {
                id: 3,
                title: "Luxury Villa with Pool",
                price: 3800,
                location: "Beverly Hills, CA",
                bedrooms: 4,
                bathrooms: 3,
                sqft: 2500,
                image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 5.0
            }
        ];

        // Filter based on search criteria
        let results = allProperties;

        if (searchData.location) {
            results = results.filter(property => 
                property.location.toLowerCase().includes(searchData.location.toLowerCase())
            );
        }

        if (searchData.priceRange) {
            const [min, max] = this.parsePriceRange(searchData.priceRange);
            results = results.filter(property => 
                property.price >= min && property.price <= max
            );
        }

        return {
            properties: results,
            total: results.length,
            searchTime: Math.random() * 0.5 + 0.1 // Mock search time
        };
    }

    parsePriceRange(range) {
        const ranges = {
            '$500 - $1000': [500, 1000],
            '$1000 - $2000': [1000, 2000],
            '$2000 - $3000': [2000, 3000],
            '$3000+': [3000, Infinity]
        };
        return ranges[range] || [0, Infinity];
    }

    displaySearchResults(results) {
        // Update properties container with search results
        const propertiesSection = document.querySelector('#properties');
        if (propertiesSection) {
            this.updateResultsCount(results.total, results.searchTime);
            
            // If PropertyManager exists, use it to render results
            if (window.propertyManager) {
                window.propertyManager.renderProperties(results.properties);
            } else {
                this.renderBasicResults(results.properties);
            }

            // Scroll to results
            propertiesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateResultsCount(count, searchTime) {
        const resultsHeader = document.querySelector('#properties .text-center');
        if (resultsHeader) {
            const subtitle = resultsHeader.querySelector('p');
            if (subtitle) {
                subtitle.textContent = `Found ${count} properties in ${searchTime.toFixed(2)} seconds`;
            }
        }
    }

    renderBasicResults(properties) {
        const container = document.querySelector('.properties-grid') || 
                         document.querySelector('#properties .grid');
        
        if (!container) return;

        container.innerHTML = '';
        
        properties.forEach(property => {
            const card = this.createPropertyCard(property);
            container.appendChild(card);
        });
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-2';
        
        card.innerHTML = `
            <div class="relative">
                <img src="${property.image}" alt="${property.title}" class="w-full h-48 object-cover">
                <div class="absolute top-4 right-4 bg-white text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition duration-300 cursor-pointer">
                    <i class="far fa-heart"></i>
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-gray-900">${property.title}</h3>
                    <div class="text-2xl font-bold text-primary">$${property.price.toLocaleString()}<span class="text-sm font-normal text-gray-600">/mo</span></div>
                </div>
                
                <div class="flex items-center justify-between mb-4 text-gray-600">
                    <div class="flex items-center">
                        <i class="fas fa-bed mr-2 text-primary"></i>
                        <span>${property.bedrooms} Beds</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-bath mr-2 text-primary"></i>
                        <span>${property.bathrooms} Baths</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-ruler-combined mr-2 text-primary"></i>
                        <span>${property.sqft.toLocaleString()} sq ft</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-map-marker-alt mr-2 text-primary"></i>
                        <span>${property.location}</span>
                    </div>
                    <div class="flex text-yellow-400">
                        ${this.generateStars(property.rating)}
                        <span class="text-gray-600 ml-2">(${property.rating})</span>
                    </div>
                </div>
                
                <button class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                    <i class="fas fa-key mr-2"></i>Rent Now
                </button>
            </div>
        `;

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return starsHTML;
    }

    handleLiveSearch(query) {
        if (query.length < 3) return;

        // Implement live search suggestions
        this.showSuggestions(query);
    }

    showSuggestions(query) {
        // Mock suggestions - replace with actual API call
        const suggestions = [
            'Downtown, NY',
            'Suburbs, CA',
            'Beverly Hills, CA',
            'Manhattan, NY',
            'Brooklyn, NY'
        ].filter(location => 
            location.toLowerCase().includes(query.toLowerCase())
        );

        this.renderSuggestions(suggestions);
    }

    renderSuggestions(suggestions) {
        // Implementation for showing search suggestions
        let dropdown = document.querySelector('.search-suggestions');
        
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-suggestions absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto';
            
            const searchContainer = document.querySelector('.search-input')?.parentElement;
            if (searchContainer) {
                searchContainer.style.position = 'relative';
                searchContainer.appendChild(dropdown);
            }
        }

        dropdown.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item px-4 py-2 hover:bg-gray-100 cursor-pointer">${suggestion}</div>`
        ).join('');

        // Handle suggestion clicks
        dropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.value = item.textContent;
                }
                dropdown.remove();
            });
        });
    }

    initAutocomplete() {
        // Initialize location autocomplete if Google Places API is available
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            const locationInput = document.querySelector('input[placeholder*="Location"]');
            if (locationInput) {
                const autocomplete = new google.maps.places.Autocomplete(locationInput);
                autocomplete.setFields(['address_component', 'geometry', 'name']);
            }
        }
    }

    showSearchLoader() {
        const searchBtn = document.querySelector('[data-search]');
        if (searchBtn) {
            searchBtn.innerHTML = '<span class="loading-spinner"></span> Searching...';
            searchBtn.disabled = true;
        }
    }

    hideSearchLoader() {
        const searchBtn = document.querySelector('[data-search]');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Search';
            searchBtn.disabled = false;
        }
    }

    showValidationError() {
        this.showNotification('Please enter at least one search criteria', 'error');
    }

    showSearchError() {
        this.showNotification('Search failed. Please try again.', 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    trackSearchEvent(searchData) {
        // Track search events for analytics
        console.log('Search performed:', searchData);
        
        // Example: Send to analytics service
        // analytics.track('property_search', searchData);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize search manager
document.addEventListener('DOMContentLoaded', () => {
    new SearchManager();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}
