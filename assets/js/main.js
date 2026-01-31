/**
 * Commercial Kitchen Exhaust Cleaning Template
 * Main JavaScript File
 * 
 * Contains all core functionality:
 * - Theme toggle (dark/light mode)
 * - Mobile navigation
 * - Form validation
 * - Smooth scrolling
 * - Lazy loading
 * - Animations
 */

(function() {
    'use strict';

    /**
     * Theme Management
     * Handles dark/light mode switching with system preference detection
     */
    const ThemeManager = {
        STORAGE_KEY: 'theme-preference',
        DARK_CLASS: 'dark',
        
        init() {
            this.themeToggleBtn = document.getElementById('theme-toggle');
            this.initTheme();
            this.bindEvents();
        },

        initTheme() {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
                this.setTheme(savedTheme);
            } else if (systemPrefersDark) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(this.STORAGE_KEY, theme);
            this.updateIcon(theme);
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        },

        updateIcon(theme) {
            if (!this.themeToggleBtn) return;
            
            const sunIcon = this.themeToggleBtn.querySelector('.sun-icon');
            const moonIcon = this.themeToggleBtn.querySelector('.moon-icon');
            
            if (theme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            } else {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            }
        },

        bindEvents() {
            if (this.themeToggleBtn) {
                this.themeToggleBtn.addEventListener('click', () => this.toggle());
            }

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.STORAGE_KEY)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    };

    /**
     * RTL Management
     * Handles right-to-left layout switching
     */
    const RTLManager = {
        STORAGE_KEY: 'rtl-preference',
        
        init() {
            this.rtlToggleBtn = document.getElementById('rtl-toggle');
            this.initRTL();
            this.bindEvents();
        },

        initRTL() {
            const savedRTL = localStorage.getItem(this.STORAGE_KEY);
            
            if (savedRTL === 'true') {
                this.setRTL(true);
            } else {
                this.setRTL(false);
            }
        },

        setRTL(isRTL) {
            if (isRTL) {
                document.documentElement.setAttribute('dir', 'rtl');
                document.documentElement.setAttribute('lang', 'ar');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
                document.documentElement.setAttribute('lang', 'en');
            }
            localStorage.setItem(this.STORAGE_KEY, isRTL);
            this.updateIcon(isRTL);
        },

        toggle() {
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            this.setRTL(!isRTL);
        },

        updateIcon(isRTL) {
            if (!this.rtlToggleBtn) return;
            
            const ltrLabel = this.rtlToggleBtn.querySelector('.rtl-label-ltr');
            const rtlLabel = this.rtlToggleBtn.querySelector('.rtl-label-rtl');
            
            if (isRTL) {
                if (ltrLabel) ltrLabel.style.display = 'none';
                if (rtlLabel) rtlLabel.style.display = 'inline';
            } else {
                if (ltrLabel) ltrLabel.style.display = 'inline';
                if (rtlLabel) rtlLabel.style.display = 'none';
            }
        },

        bindEvents() {
            if (this.rtlToggleBtn) {
                this.rtlToggleBtn.addEventListener('click', () => this.toggle());
            }
        }
    };

    /**
     * Navigation Management
     * Handles mobile menu toggle and dropdown interactions
     */
    const NavigationManager = {
        init() {
            this.menuToggle = document.getElementById('menu-toggle');
            this.navMenu = document.getElementById('nav-menu');
            this.sidebar = document.getElementById('sidebar');
            this.sidebarOverlay = document.getElementById('sidebar-overlay');
            
            this.bindEvents();
        },

        bindEvents() {
            // Mobile menu toggle
            if (this.menuToggle && this.navMenu) {
                this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
            }

            // Dashboard sidebar toggle
            if (this.menuToggle && this.sidebar) {
                this.menuToggle.addEventListener('click', () => this.toggleSidebar());
            }

            // Sidebar overlay click
            if (this.sidebarOverlay) {
                this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
            }

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMobileMenu();
                    this.closeSidebar();
                }
            });

            // Dropdown navigation for mobile
            this.initDropdowns();
        },

        toggleMobileMenu() {
            if (this.navMenu) {
                this.navMenu.classList.toggle('active');
                document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
            }
        },

        closeMobileMenu() {
            if (this.navMenu) {
                this.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        toggleSidebar() {
            if (this.sidebar) {
                this.sidebar.classList.toggle('active');
            }
            if (this.sidebarOverlay) {
                this.sidebarOverlay.classList.toggle('active');
            }
            document.body.style.overflow = this.sidebar?.classList.contains('active') ? 'hidden' : '';
        },

        closeSidebar() {
            if (this.sidebar) {
                this.sidebar.classList.remove('active');
            }
            if (this.sidebarOverlay) {
                this.sidebarOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        },

        initDropdowns() {
            const dropdowns = document.querySelectorAll('.nav-dropdown');
            
            dropdowns.forEach(dropdown => {
                const toggle = dropdown.querySelector('.nav-link');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                if (toggle && menu) {
                    // Click handler for mobile and desktop
                    toggle.addEventListener('click', (e) => {
                        const isMobile = window.innerWidth <= 1024;
                        
                        if (isMobile) {
                            e.preventDefault();
                            e.stopPropagation();
                            menu.classList.toggle('show');
                            
                            // Close other dropdowns
                            dropdowns.forEach(other => {
                                if (other !== dropdown && other.classList.contains('nav-dropdown')) {
                                    other.querySelector('.dropdown-menu')?.classList.remove('show');
                                }
                            });
                        }
                    });

                    // Hover effect for desktop only
                    dropdown.addEventListener('mouseenter', () => {
                        if (window.innerWidth > 1024) {
                            menu.classList.add('show');
                        }
                    });

                    dropdown.addEventListener('mouseleave', () => {
                        if (window.innerWidth > 1024) {
                            menu.classList.remove('show');
                        }
                    });
                }
            });
        }
    };

    /**
     * Form Validation
     * Provides client-side validation with user-friendly error messages
     */
    const FormValidator = {
        init() {
            this.forms = document.querySelectorAll('form[data-validate]');
            this.bindEvents();
        },

        bindEvents() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.validateForm(e, form));
                
                // Real-time validation on blur
                form.querySelectorAll('input, textarea, select').forEach(field => {
                    field.addEventListener('blur', () => this.validateField(field));
                    field.addEventListener('input', () => this.clearFieldError(field));
                });
            });
        },

        validateForm(e, form) {
            let isValid = true;
            const fields = form.querySelectorAll('input, textarea, select');
            
            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                this.scrollToFirstError(form);
            }
        },

        validateField(field) {
            const value = field.value.trim();
            const type = field.type;
            const required = field.hasAttribute('required');
            const minLength = field.getAttribute('minlength');
            const maxLength = field.getAttribute('maxlength');
            const pattern = field.getAttribute('pattern');
            
            // Clear previous errors
            this.clearFieldError(field);
            
            // Check required
            if (required && !value) {
                this.showFieldError(field, 'This field is required');
                return false;
            }
            
            // Check min length
            if (minLength && value.length < parseInt(minLength)) {
                this.showFieldError(field, `Minimum ${minLength} characters required`);
                return false;
            }
            
            // Check max length
            if (maxLength && value.length > parseInt(maxLength)) {
                this.showFieldError(field, `Maximum ${maxLength} characters allowed`);
                return false;
            }
            
            // Check email format
            if (type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
            }
            
            // Check phone format if pattern is specified
            if (type === 'tel' && value) {
                const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                if (!phoneRegex.test(value)) {
                    this.showFieldError(field, 'Please enter a valid phone number');
                    return false;
                }
            }
            
            // Check pattern
            if (pattern && value) {
                try {
                    const regex = new RegExp(pattern);
                    if (!regex.test(value)) {
                        const title = field.getAttribute('title') || 'Invalid format';
                        this.showFieldError(field, title);
                        return false;
                    }
                } catch (e) {
                    console.warn('Invalid regex pattern:', pattern);
                }
            }
            
            // Mark as valid
            field.classList.add('success');
            return true;
        },

        showFieldError(field, message) {
            field.classList.add('error');
            field.classList.remove('success');
            
            let errorEl = field.parentElement.querySelector('.error-message, .invalid-feedback');
            
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                field.parentElement.appendChild(errorEl);
            }
            
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        },

        clearFieldError(field) {
            field.classList.remove('error', 'success');
            const errorEl = field.parentElement.querySelector('.error-message, .invalid-feedback');
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        },

        scrollToFirstError(form) {
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    };

    /**
     * Smooth Scroll
     * Handles anchor link scrolling with smooth animation
     */
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
            });
        },

        handleClick(e, anchor) {
            const targetId = anchor.getAttribute('href');
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                NavigationManager.closeMobileMenu();
            }
        }
    };

    /**
     * Lazy Loading
     * Implements lazy loading for images and content
     */
    const LazyLoader = {
        init() {
            if ('IntersectionObserver' in window) {
                this.initImageObserver();
            } else {
                // Fallback for older browsers
                this.loadAllImages();
            }
        },

        initImageObserver() {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            // Lazy load sections
            document.querySelectorAll('.lazy-section').forEach(section => {
                const sectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('loaded');
                            sectionObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                
                sectionObserver.observe(section);
            });
        },

        loadImage(img) {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            }
        },

        loadAllImages() {
            document.querySelectorAll('img[data-src]').forEach(img => this.loadImage(img));
        }
    };

    /**
     * Animation Manager
     * Handles scroll-triggered animations
     */
    const AnimationManager = {
        init() {
            if ('IntersectionObserver' in window) {
                this.initScrollObserver();
            }
        },

        initScrollObserver() {
            const animateElements = document.querySelectorAll('.animate-on-scroll, .fade-in, .slide-up');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animateElements.forEach(el => observer.observe(el));
        }
    };

    /**
     * Counter Animation
     * Animates number counters on scroll
     */
    const CounterAnimation = {
        init() {
            if ('IntersectionObserver' in window) {
                this.initCounterObserver();
            }
        },

        initCounterObserver() {
            const counters = document.querySelectorAll('[data-counter]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            counters.forEach(counter => observer.observe(counter));
        },

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-counter'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = this.formatNumber(target);
                    clearInterval(timer);
                } else {
                    element.textContent = this.formatNumber(Math.floor(current));
                }
            }, 16);
        },

        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    };

    /**
     * Back to Top Button
     * Shows/hides back to top button based on scroll position
     */
    const BackToTop = {
        init() {
            this.btn = document.getElementById('back-to-top');
            if (this.btn) {
                this.bindEvents();
                this.checkScroll();
            }
        },

        bindEvents() {
            window.addEventListener('scroll', () => this.checkScroll());
            this.btn.addEventListener('click', () => this.scrollToTop());
        },

        checkScroll() {
            if (this.btn) {
                const scrollPosition = window.scrollY;
                const showAfter = 300;
                
                if (scrollPosition > showAfter) {
                    this.btn.classList.add('show');
                } else {
                    this.btn.classList.remove('show');
                }
            }
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    /**
     * Cookie Consent
     * Simple cookie consent banner
     */
    const CookieConsent = {
        init() {
            this.cookieKey = 'cookie-consent';
            this.banner = document.getElementById('cookie-banner');
            
            if (!localStorage.getItem(this.cookieKey) && this.banner) {
                this.showBanner();
                this.bindEvents();
            }
        },

        showBanner() {
            this.banner.style.display = 'block';
        },

        hideBanner() {
            this.banner.style.display = 'none';
        },

        bindEvents() {
            const acceptBtn = this.banner?.querySelector('#cookie-accept');
            const declineBtn = this.banner?.querySelector('#cookie-decline');
            
            if (acceptBtn) {
                acceptBtn.addEventListener('click', () => this.accept());
            }
            
            if (declineBtn) {
                declineBtn.addEventListener('click', () => this.decline());
            }
        },

        accept() {
            localStorage.setItem(this.cookieKey, 'accepted');
            this.hideBanner();
        },

        decline() {
            localStorage.setItem(this.cookieKey, 'declined');
            this.hideBanner();
        }
    };

    /**
     * Newsletter Form Handler
     * Handles newsletter subscription forms
     */
    const NewsletterHandler = {
        init() {
            this.forms = document.querySelectorAll('.newsletter-form');
            this.bindEvents();
        },

        bindEvents() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.handleSubmit(e, form));
            });
        },

        handleSubmit(e, form) {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            const submitBtn = form.querySelector('button[type="submit"]');
            const messageEl = form.querySelector('.newsletter-message');
            
            // Basic validation
            if (!this.validateEmail(email)) {
                this.showMessage(messageEl, 'Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate API call
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Subscribing...';
            
            setTimeout(() => {
                this.showMessage(messageEl, 'Thank you for subscribing!', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Subscribe';
            }, 1500);
        },

        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        showMessage(el, message, type) {
            if (!el) return;
            
            el.textContent = message;
            el.className = `newsletter-message ${type}`;
            el.style.display = 'block';
            
            setTimeout(() => {
                el.style.display = 'none';
            }, 5000);
        }
    };

    /**
     * Search Functionality
     * Handles search form submission and results display
     */
    const SearchHandler = {
        init() {
            this.forms = document.querySelectorAll('.search-form');
            this.bindEvents();
        },

        bindEvents() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.handleSearch(e, form));
            });
        },

        handleSearch(e, form) {
            e.preventDefault();
            
            const query = form.querySelector('input[type="search"]').value.trim();
            
            if (query.length < 2) {
                alert('Please enter at least 2 characters');
                return;
            }
            
            // Redirect to search results page or filter content
            window.location.href = `blog.html?q=${encodeURIComponent(query)}`;
        }
    };

    /**
     * Tab Navigation
     * Handles tab switching for content sections
     */
    const TabNavigation = {
        init() {
            this.containers = document.querySelectorAll('[data-tabs]');
            this.containers.forEach(container => this.bindTabs(container));
        },

        bindTabs(container) {
            const tabs = container.querySelectorAll('[data-tab]');
            const contents = container.querySelectorAll('[data-tab-content]');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = tab.getAttribute('data-tab');
                    
                    // Remove active class from all tabs and contents
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding content
                    tab.classList.add('active');
                    const targetContent = container.querySelector(`[data-tab-content="${target}"]`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        }
    };

    /**
     * Accordion
     * Handles accordion-style content sections
     */
    const Accordion = {
        init() {
            this.accordions = document.querySelectorAll('.accordion');
            this.accordions.forEach(acc => this.bindAccordion(acc));
        },

        bindAccordion(accordion) {
            const headers = accordion.querySelectorAll('.accordion-header');
            
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    const item = header.parentElement;
                    const isActive = item.classList.contains('active');
                    
                    // Close all items
                    accordion.querySelectorAll('.accordion-item').forEach(i => {
                        i.classList.remove('active');
                        i.querySelector('.accordion-content').style.maxHeight = '0';
                    });
                    
                    // Open clicked item if it wasn't active
                    if (!isActive) {
                        item.classList.add('active');
                        const content = item.querySelector('.accordion-content');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            });
        }
    };

    /**
     * Session Management
     * Handles user login/logout sessions
     */
    const SessionManager = {
        STORAGE_KEY: 'kep_session',
        
        init() {
            this.bindEvents();
            this.checkSession();
        },
        
        checkSession() {
            const session = this.getSession();
            if (session && session.isLoggedIn) {
                this.updateUIForLoggedInUser(session);
            }
        },
        
        getSession() {
            try {
                return {
                    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
                    userType: localStorage.getItem('userType'),
                    userEmail: localStorage.getItem('userEmail')
                };
            } catch (e) {
                return null;
            }
        },
        
        isLoggedIn() {
            return localStorage.getItem('isLoggedIn') === 'true';
        },
        
        getUserType() {
            return localStorage.getItem('userType');
        },
        
        login(userType, email = '') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', userType);
            localStorage.setItem('userEmail', email);
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('userLogin', { detail: { userType, email } }));
        },
        
        logout() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');
            localStorage.removeItem('userEmail');
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('userLogout'));
            
            // Redirect to logout page
            setTimeout(() => {
                window.location.href = 'logout.html';
            }, 500);
        },
        
        updateUIForLoggedInUser(session) {
            // Update any UI elements that need to show logged-in state
            const loginLinks = document.querySelectorAll('.login-link');
            loginLinks.forEach(link => {
                link.textContent = session.userType === 'admin' ? 'Dashboard' : 'My Account';
                link.href = session.userType === 'admin' ? 'dashboard.html' : '#';
            });
        },
        
        bindEvents() {
            // Handle logout buttons
            document.addEventListener('click', (e) => {
                if (e.target.closest('#logout-link')) {
                    e.preventDefault();
                    this.logout();
                }
            });
        }
    };

    /**
     * Initialize all modules when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        RTLManager.init();
        NavigationManager.init();
        FormValidator.init();
        SmoothScroll.init();
        LazyLoader.init();
        AnimationManager.init();
        CounterAnimation.init();
        BackToTop.init();
        CookieConsent.init();
        NewsletterHandler.init();
        SearchHandler.init();
        TabNavigation.init();
        Accordion.init();
        SessionManager.init();
    });

    // Expose global functions for external use
    window.KitchenExhaust = {
        ThemeManager,
        RTLManager,
        NavigationManager,
        FormValidator,
        SessionManager
    };

})();
