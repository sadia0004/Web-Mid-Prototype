// Main JavaScript file for Rentify
class RentifyApp {
    constructor() {
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initSmoothScrolling();
        this.initNavbarScrollEffect();
        this.initPropertyCards();
        this.initHeartIcons();
        this.initRentButtons();
        this.initSearch();
        this.initNewsletter();
        this.initNumberAnimation();
        this.initImageLoading();
        this.initScrollAnimations();
    }

    // Mobile menu functionality
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    }

    // Smooth scrolling for navigation links
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Navbar scroll effect
    initNavbarScrollEffect() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('nav');
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // Property card hover effects
    initPropertyCards() {
        const propertyCards = document.querySelectorAll('.property-card');
        
        propertyCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // Heart icon toggle functionality
    initHeartIcons() {
        const heartIcons = document.querySelectorAll('.heart-icon');
        heartIcons.forEach(heartContainer => {
            heartContainer.addEventListener('click', function(e) {
                e.stopPropagation();
                const heart = this.querySelector('.fa-heart');
                
                if (heart.classList.contains('fas')) {
                    heart.classList.remove('fas');
                    heart.classList.add('far');
                    this.classList.remove('bg-red-500', 'text-white');
                    this.classList.add('bg-white', 'text-red-500');
                } else {
                    heart.classList.remove('far');
                    heart.classList.add('fas');
                    this.classList.remove('bg-white', 'text-red-500');
                    this.classList.add('bg-red-500', 'text-white');
                }
            });
        });
    }

    // Rent Now button functionality
    initRentButtons() {
        document.querySelectorAll('button').forEach(button => {
            if (button.textContent.includes('Rent Now')) {
                button.addEventListener('click', function() {
                    // Show loading state
                    const originalText = this.innerHTML;
                    this.innerHTML = '<span class="loading-spinner"></span> Processing...';
                    this.disabled = true;

                    // Simulate API call
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                        alert('Redirecting to property details and rental application...');
                        // Here you would typically redirect to a detailed property page
                        // window.location.href = '/property-details/' + propertyId;
                    }, 2000);
                });
            }
        });
    }

    // Search functionality
    initSearch() {
        const searchButton = document.querySelector('button[data-search]');
        if (!searchButton) {
            // Find search button by text content if data attribute doesn't exist
            document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent.includes('Search')) {
                    btn.setAttribute('data-search', 'true');
                }
            });
        }

        const searchBtn = document.querySelector('button[data-search], button:has(i.fa-search)');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const location = document.querySelector('input[placeholder*="Location"]')?.value || '';
                const propertyType = document.querySelector('select')?.value || '';
                const priceRange = document.querySelectorAll('select')[1]?.value || '';
                
                console.log('Search parameters:', { location, propertyType, priceRange });
                
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading-spinner"></span> Searching...';
                this.disabled = true;

                // Simulate search
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    alert(`Searching for properties in ${location || 'all locations'}...`);
                    // Here you would implement the actual search functionality
                }, 1500);
            });
        }
    }

    // Newsletter subscription
    initNewsletter() {
        const subscribeButton = document.querySelector('button[data-newsletter]');
        if (!subscribeButton) {
            // Find subscribe button by text content
            document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent.includes('Subscribe')) {
                    btn.setAttribute('data-newsletter', 'true');
                }
            });
        }

        const subscribeBtn = document.querySelector('button[data-newsletter]');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', function() {
                const emailInput = this.parentElement.querySelector('input[type="email"]');
                const email = emailInput?.value || '';
                
                if (email && this.validateEmail(email)) {
                    // Show loading state
                    const originalText = this.innerHTML;
                    this.innerHTML = '<span class="loading-spinner"></span> Subscribing...';
                    this.disabled = true;

                    // Simulate API call
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                        alert('Thank you for subscribing! You will receive updates at ' + email);
                        emailInput.value = '';
                    }, 1500);
                } else {
                    alert('Please enter a valid email address.');
                }
            }.bind(this));
        }
    }

    // Email validation helper
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Animate numbers in stats section
    initNumberAnimation() {
        const animateNumbers = () => {
            const numbers = document.querySelectorAll('.stats-number');
            numbers.forEach(number => {
                const target = parseInt(number.textContent.replace(/\D/g, ''));
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    const hasPlus = number.textContent.includes('+');
                    number.textContent = Math.floor(current) + (hasPlus ? '+' : '');
                }, 30);
            });
        };

        // Trigger number animation when stats section comes into view
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    animateNumbers();
                    observer.disconnect();
                }
            });
            observer.observe(statsSection);
        }
    }

    // Image loading animation
    initImageLoading() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            // Set initial state
            img.classList.add('property-image');
            
            // If image is already loaded (cached)
            if (img.complete) {
                img.classList.add('loaded');
            }
        });
    }

    // Scroll animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add('animate-fade-in-up');
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.property-card, .service-card, .testimonial-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Utility method for API calls (future use)
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // Property filtering (future enhancement)
    filterProperties(filters) {
        const properties = document.querySelectorAll('.property-card');
        properties.forEach(property => {
            // Implementation for filtering logic
            // This would check property data against filters
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RentifyApp();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RentifyApp;
}
