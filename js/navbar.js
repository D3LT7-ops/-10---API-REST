/**
 * WEATHER MONITOR - ENHANCED NAVBAR FUNCTIONALITY
 * ==============================================
 * Enhanced navigation bar with modern features
 * Author: Weather Monitor Team
 * Version: 2.0.0
 */

class WeatherNavbar {
    constructor() {
        // DOM Elements
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.searchToggle = document.getElementById('search-toggle');
        this.searchInput = document.getElementById('nav-search-input');
        this.themeToggle = document.getElementById('theme-toggle');
        this.notificationBtn = document.getElementById('notification-btn');
        this.notificationBadge = document.getElementById('notification-badge');
        
        // Configuration
        this.config = {
            scrollThreshold: 50,
            hideNavbarThreshold: 100,
            notificationInterval: 15000, // 15 seconds
            searchWidth: {
                desktop: '200px',
                mobile: '250px'
            }
        };
        
        // State
        this.state = {
            isMenuOpen: false,
            isSearchActive: false,
            lastScrollY: 0,
            notificationCount: 0,
            isDarkTheme: false
        };
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the navbar functionality
     */
    init() {
        this.checkElements();
        this.loadTheme();
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSearch();
        this.setupThemeToggle();
        this.setupNotifications();
        this.setupActiveLink();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        
        console.log('✅ Weather Navbar initialized successfully');
    }

    /**
     * Check if required DOM elements exist
     */
    checkElements() {
        const requiredElements = [
            'navbar', 'nav-toggle', 'nav-menu', 'search-toggle', 
            'nav-search-input', 'theme-toggle', 'notification-btn'
        ];
        
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                console.warn(`⚠️ Element with ID '${id}' not found`);
            }
        });
    }

    /**
     * Setup scroll effects
     */
    setupScrollEffect() {
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class
            if (currentScrollY > this.config.scrollThreshold) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll (optional)
            if (this.config.hideNavbarThreshold > 0) {
                if (currentScrollY > this.state.lastScrollY && currentScrollY > this.config.hideNavbarThreshold) {
                    this.navbar?.style.setProperty('transform', 'translateY(-100%)');
                } else {
                    this.navbar?.style.setProperty('transform', 'translateY(0)');
                }
            }
            
            this.state.lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        if (!this.navToggle || !this.navMenu) return;

        // Toggle mobile menu
        this.navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen && !this.navbar?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.state.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        
        this.navToggle?.classList.toggle('active');
        this.navMenu?.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
        
        // Announce to screen readers
        this.announceToScreenReader(
            this.state.isMenuOpen ? 'Menu aberto' : 'Menu fechado'
        );
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.state.isMenuOpen = false;
        this.navToggle?.classList.remove('active');
        this.navMenu?.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        if (!this.searchToggle || !this.searchInput) return;

        // Toggle search input
        this.searchToggle.addEventListener('click', () => {
            this.toggleSearch();
        });

        // Handle search input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = this.searchInput.value.trim();
                if (query) {
                    this.performSearch(query);
                }
            }
        });

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (this.state.isSearchActive && !e.target.closest('.nav-search')) {
                this.closeSearch();
            }
        });

        // Close search on escape key
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
    }

    /**
     * Toggle search input
     */
    toggleSearch() {
        this.state.isSearchActive = !this.state.isSearchActive;
        
        if (this.state.isSearchActive) {
            this.searchInput?.classList.add('active');
            setTimeout(() => {
                this.searchInput?.focus();
            }, 300);
            
            this.announceToScreenReader('Campo de busca ativado');
        } else {
            this.closeSearch();
        }
    }

    /**
     * Close search input
     */
    closeSearch() {
        this.state.isSearchActive = false;
        this.searchInput?.classList.remove('active');
        this.searchInput?.blur();
    }

    /**
     * Perform search with the given query
     * @param {string} query - Search query
     */
    performSearch(query) {
        console.log('🔍 Searching for:', query);
        
        // Integrate with existing search functionality
        this.integrateWithPageSearch(query);
        
        // Clear and close search
        this.searchInput.value = '';
        this.closeSearch();
        
        // Announce to screen readers
        this.announceToScreenReader(`Buscando por ${query}`);
        
        // Track search analytics (if needed)
        this.trackEvent('search', { query });
    }

    /**
     * Integrate search with existing page functionality
     * @param {string} query - Search query
     */
    integrateWithPageSearch(query) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch (currentPage) {
            case 'index.html':
                // Integrate with weather search
                const cityInput = document.getElementById('city-input');
                if (cityInput) {
                    cityInput.value = query;
                    if (typeof loadWeatherData === 'function') {
                        loadWeatherData(query);
                    }
                }
                break;
                
            case 'alerts.html':
                // Integrate with alerts search
                const alertCityInput = document.getElementById('alert-city-input');
                if (alertCityInput) {
                    alertCityInput.value = query;
                    if (typeof loadWeatherAlerts === 'function') {
                        loadWeatherAlerts(query);
                    }
                }
                break;
                
            case 'manage.html':
                // Integrate with favorites search
                const newCityInput = document.getElementById('new-city-input');
                if (newCityInput) {
                    newCityInput.value = query;
                }
                break;
                
            default:
                // Generic search fallback
                console.log('Generic search for:', query);
        }
    }

    /**
     * Setup theme toggle functionality
     */
    setupThemeToggle() {
        if (!this.themeToggle) return;

        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    /**
     * Load saved theme from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('weather-theme');
        if (savedTheme === 'dark') {
            this.setDarkTheme(true);
        }
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        this.state.isDarkTheme = !this.state.isDarkTheme;
        this.setDarkTheme(this.state.isDarkTheme);
        
        // Save theme preference
        localStorage.setItem('weather-theme', this.state.isDarkTheme ? 'dark' : 'light');
        
        // Announce to screen readers
        this.announceToScreenReader(
            this.state.isDarkTheme ? 'Tema escuro ativado' : 'Tema claro ativado'
        );
        
        // Track theme change
        this.trackEvent('theme_change', { theme: this.state.isDarkTheme ? 'dark' : 'light' });
    }

    /**
     * Set dark theme
     * @param {boolean} isDark - Whether to enable dark theme
     */
    setDarkTheme(isDark) {
        this.state.isDarkTheme = isDark;
        document.body.classList.toggle('dark-theme', isDark);
        
        const icon = this.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    /**
     * Setup notifications functionality
     */
    setupNotifications() {
        if (!this.notificationBtn) return;

        this.notificationBtn.addEventListener('click', () => {
            this.showNotifications();
            this.updateNotificationCount(0);
        });

        // Simulate new notifications
        if (this.config.notificationInterval > 0) {
            setInterval(() => {
                if (Math.random() < 0.3 && this.state.notificationCount < 9) {
                    this.updateNotificationCount(this.state.notificationCount + 1);
                }
            }, this.config.notificationInterval);
        }
    }

    /**
     * Update notification count
     * @param {number} count - New notification count
     */
    updateNotificationCount(count) {
        this.state.notificationCount = count;
        
        if (this.notificationBadge) {
            if (count > 0) {
                this.notificationBadge.textContent = count > 9 ? '9+' : count.toString();
                this.notificationBadge.style.display = 'block';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }
    }

    /**
     * Show notifications (can be customized based on page)
     */
    showNotifications() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        let notifications = this.getPageNotifications(currentPage);
        
        // Simple alert for now - can be replaced with custom modal
        alert(notifications);
        
        this.announceToScreenReader('Notificações exibidas');
    }

    /**
     * Get notifications based on current page
     * @param {string} page - Current page name
     * @returns {string} Formatted notifications
     */
    getPageNotifications(page) {
        const notifications = {
            'index.html': 'Notificações:\n• Dados do clima atualizados\n• Nova previsão disponível\n• Sistema funcionando normalmente',
            'alerts.html': 'Alertas Recentes:\n• Monitoramento ativo\n• Condições normais\n• Sistema operacional',
            'manage.html': 'Favoritos:\n• Lista atualizada\n• Sincronização completa\n• Sistema funcionando'
        };
        
        return notifications[page] || 'Notificações:\n• Sistema funcionando normalmente';
    }

    /**
     * Setup active link highlighting
     */
    setupActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (this.isCurrentPage(href, currentPage)) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Check if the given href matches the current page
     * @param {string} href - Link href attribute
     * @param {string} currentPage - Current page name
     * @returns {boolean} Whether the link is for the current page
     */
    isCurrentPage(href, currentPage) {
        return href === currentPage || 
               (currentPage === '' && href === 'index.html') ||
               (currentPage === 'index.html' && href === 'index.html');
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearch();
            }
            
            // Escape to close search or mobile menu
            if (e.key === 'Escape') {
                if (this.state.isSearchActive) {
                    this.closeSearch();
                } else if (this.state.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }
            
            // Alt + T for theme toggle
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Alt + N for notifications
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.showNotifications();
            }
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels if missing
        this.addAriaLabels();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup screen reader announcements
        this.setupScreenReaderSupport();
    }

    /**
     * Add ARIA labels to interactive elements
     */
    addAriaLabels() {
        const elements = [
            { id: 'nav-toggle', label: 'Toggle navigation menu' },
            { id: 'search-toggle', label: 'Toggle search' },
            { id: 'theme-toggle', label: 'Toggle theme' },
            { id: 'notification-btn', label: 'View notifications' }
        ];
        
        elements.forEach(({ id, label }) => {
            const element = document.getElementById(id);
            if (element && !element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', label);
            }
        });
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in mobile menu when open
        this.navMenu?.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.state.isMenuOpen) {
                this.handleFocusTrap(e);
            }
        });
    }

    /**
     * Handle focus trapping in mobile menu
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleFocusTrap(e) {
        const focusableElements = this.navMenu?.querySelectorAll(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements?.length) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Create a live region for announcements
        if (!document.getElementById('navbar-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'navbar-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
            document.body.appendChild(announcer);
        }
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    announceToScreenReader(message) {
        const announcer = document.getElementById('navbar-announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }

    /**
     * Track events for analytics (placeholder)
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackEvent(event, data) {
        // Placeholder for analytics tracking
        console.log('📊 Event tracked:', event, data);
        
        // Example: Send to analytics service
        // if (window.gtag) {
        //     window.gtag('event', event, data);
        // }
    }

    /**
     * Public API methods
     */

    /**
     * Update breadcrumb navigation
     * @param {Array} items - Breadcrumb items
     */
    updateBreadcrumb(items) {
        const breadcrumbContent = document.querySelector('.breadcrumb-content');
        if (!breadcrumbContent) return;
        
        let html = '<a href="index.html"><i class="fas fa-home"></i> Home</a>';
        
        items.forEach((item, index) => {
            html += '<i class="fas fa-chevron-right"></i>';
            if (index === items.length - 1) {
                html += `<span>${item}</span>`;
            } else {
                html += `<a href="${item.url}">${item.name}</a>`;
            }
        });
        
        breadcrumbContent.innerHTML = html;
    }

    /**
     * Manually trigger notification
     * @param {number} count - Notification count
     */
    addNotification(count = 1) {
        this.updateNotificationCount(this.state.notificationCount + count);
    }

    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getTheme() {
        return this.state.isDarkTheme ? 'dark' : 'light';
    }

    /**
     * Set theme programmatically
     * @param {string} theme - Theme to set ('light' or 'dark')
     */
    setTheme(theme) {
        if (theme === 'dark' && !this.state.isDarkTheme) {
            this.toggleTheme();
        } else if (theme === 'light' && this.state.isDarkTheme) {
            this.toggleTheme();
        }
    }

    /**
     * Refresh active link highlighting
     */
    refreshActiveLink() {
        this.setupActiveLink();
    }

    /**
     * Destroy the navbar instance
     */
    destroy() {
        // Remove event listeners and clean up
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Clean up state
        document.body.style.overflow = '';
        
        console.log('🗑️ Weather Navbar destroyed');
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if navbar should be initialized
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.weatherNavbar = new WeatherNavbar();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherNavbar;
}