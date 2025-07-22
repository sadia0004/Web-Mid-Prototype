// Property management functionality
class PropertyManager {
    constructor() {
        this.properties = [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.filters = {
            location: '',
            propertyType: '',
            priceRange: '',
            bedrooms: '',
            bathrooms: ''
        };
    }

    // Load properties from API or local data
    async loadProperties() {
        try {
            // Load properties from dummy.json file
            const response = await fetch('../public/dummy.json');
            const data = await response.json();
            
            // Flatten all properties from all landlords
            this.properties = [];
            data.landlords.forEach(landlord => {
                landlord.properties.forEach(property => {
                    // Transform the data to match our expected format
                    this.properties.push({
                        id: property.id,
                        title: property.title,
                        price: property.rent.amount, 
                        image: property.images[0],
                        location: `${property.location.subArea}, ${property.location.area}`,
                        bedrooms: property.rooms.bedrooms,
                        bathrooms: property.rooms.bathrooms,
                        sqft: property.size.area,
                        rating: landlord.rating,
                        featured: property.id % 3 === 0, 
                        popular: property.id % 5 === 0, 
                        luxury: property.rent.amount > 30000, 
                        description: property.description,
                        type: property.type,
                        furnished: property.furnished,
                        landlord: landlord.name,
                        isAvailable: !property.tenant.isOccupied,
                        currency: property.rent.currency
                    });
                });
            });
            
            this.renderProperties();
        } catch (error) {
            console.error('Failed to load properties:', error);
            this.showError('Failed to load properties. Please try again.');
        }
    }

    // Render properties to the DOM
    renderProperties(propertiesToRender = this.properties) {
        const container = document.querySelector('.properties-grid');
        if (!container) return;

        container.innerHTML = '';

        // Limit to 6 properties on homepage (index.html)
        const isHomepage = window.location.pathname.includes('index.html') || 
                          window.location.pathname === '/' || 
                          window.location.pathname.endsWith('/src/') ||
                          document.title.includes('Premium Property Rental Management');
        
        const propertiesToShow = isHomepage ? propertiesToRender.slice(0, 6) : propertiesToRender;

        propertiesToShow.forEach(property => {
            const propertyCard = this.createPropertyCard(property);
            container.appendChild(propertyCard);
        });
    }

    // Create property card HTML
    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-2';
        
        const isFavorite = this.favorites.includes(property.id);
        const badge = property.featured ? 'Featured' : property.popular ? 'Popular' : property.luxury ? 'Luxury' : 'New';
        const badgeColor = property.featured ? 'bg-accent' : property.popular ? 'bg-secondary' : property.luxury ? 'bg-red-500' : 'bg-accent';

        card.innerHTML = `
            <div class="relative">
                <img src="${property.image}" alt="${property.title}" class="property-image w-full h-48 object-cover">
                <div class="absolute top-4 left-4 ${badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${badge}
                </div>
                <div class="absolute top-4 right-4 flex flex-col space-y-2">
                    <div class="heart-icon ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-red-500'} p-2 rounded-full hover:bg-red-500 hover:text-white transition duration-300 cursor-pointer" data-property-id="${property.id}">
                        <i class="fa${isFavorite ? 's' : 'r'} fa-heart"></i>
                    </div>
                    <div class="${property.isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white px-2 py-1 rounded-full text-xs font-medium">
                        ${property.isAvailable ? 'Available' : 'Occupied'}
                    </div>
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-gray-900">${property.title}</h3>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-primary">৳${property.price.toLocaleString()}</div>
                        <div class="text-sm font-normal text-gray-600">per month</div>
                    </div>
                </div>
                <p class="text-gray-600 mb-4">${property.description}</p>
                
                <div class="flex items-center justify-between mb-4 text-gray-600">
                    <div class="flex items-center">
                        <i class="fas fa-bed mr-2 text-primary"></i>
                        <span>${property.bedrooms === 0 ? 'Studio' : property.bedrooms + ' Beds'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-bath mr-2 text-primary"></i>
                        <span>${property.bathrooms} Bath${property.bathrooms > 1 ? 's' : ''}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-ruler-combined mr-2 text-primary"></i>
                        <span>${property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center text-gray-600">
                        <i class="fas fa-map-marker-alt mr-2 text-primary"></i>
                        <span>${property.location}</span>
                    </div>
                    <div class="flex items-center">
                        <div class="flex text-yellow-400">
                            ${this.generateStars(property.rating)}
                        </div>
                        <span class="text-gray-600 ml-2">(${property.rating})</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="text-sm text-gray-600">
                        <span class="font-medium">${property.type}</span> • 
                        <span>${property.furnished}</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        by ${property.landlord}
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <a href="property-details.html?id=${property.id}" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 text-center">
                        <i class="fas fa-eye mr-2"></i>View Details
                    </a>
                    ${property.isAvailable ? 
                        `<button class="rent-btn flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300" data-property-id="${property.id}">
                            <i class="fas fa-key mr-2"></i>Rent Now
                        </button>` :
                        `<button class="flex-1 bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
                            <i class="fas fa-ban mr-2"></i>Not Available
                        </button>`
                    }
                </div>
            </div>
        `;

        return card;
    }

    // Generate star rating HTML
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

    // Toggle favorite status
    toggleFavorite(propertyId) {
        const index = this.favorites.indexOf(propertyId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(propertyId);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    // Filter properties
    filterProperties(filters) {
        let filteredProperties = this.properties;

        if (filters.location) {
            filteredProperties = filteredProperties.filter(property => 
                property.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        if (filters.priceRange) {
            const [min, max] = this.parsePriceRange(filters.priceRange);
            filteredProperties = filteredProperties.filter(property => 
                property.price >= min && property.price <= max
            );
        }

        if (filters.bedrooms) {
            filteredProperties = filteredProperties.filter(property => 
                property.bedrooms >= parseInt(filters.bedrooms)
            );
        }

        this.renderProperties(filteredProperties);
    }

    // Parse price range string
    parsePriceRange(range) {
        const ranges = {
            '৳0 - ৳15,000': [0, 15000],
            '৳15,000 - ৳25,000': [15000, 25000],
            '৳25,000 - ৳35,000': [25000, 35000],
            '৳35,000 - ৳50,000': [35000, 50000],
            '৳50,000+': [50000, Infinity],
            // Keep old USD ranges for backward compatibility
            '$500 - $1000': [500, 1000],
            '$1000 - $2000': [1000, 2000],
            '$2000 - $3000': [2000, 3000],
            '$3000+': [3000, Infinity]
        };
        return ranges[range] || [0, Infinity];
    }

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Initialize event listeners
    init() {
        document.addEventListener('click', (e) => {
            // Handle favorite toggle
            if (e.target.closest('.heart-icon')) {
                const propertyId = parseInt(e.target.closest('.heart-icon').dataset.propertyId);
                this.toggleFavorite(propertyId);
                this.renderProperties(); // Re-render to update heart state
            }

            // Handle rent button click
            if (e.target.closest('.rent-btn')) {
                const propertyId = parseInt(e.target.closest('.rent-btn').dataset.propertyId);
                this.handleRentClick(propertyId);
            }
        });

        // Load properties on initialization
        this.loadProperties();
    }

    // Handle rent button click
    handleRentClick(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (property) {
            // Simulate redirect to property details
            console.log('Redirecting to property:', property);
            alert(`Redirecting to rental application for ${property.title}`);
            // In a real app: window.location.href = `/property/${propertyId}`;
        }
    }
}

// Initialize property manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const propertyManager = new PropertyManager();
    propertyManager.init();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyManager;
}
