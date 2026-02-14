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

(function () {
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
            this.navActions = document.querySelector('.nav-actions');
            this.sidebar = document.getElementById('sidebar');
            this.sidebarOverlay = document.getElementById('sidebar-overlay');

            this.setupHomeDropdown();
            this.alignLoginButton();
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
                const isLoginDropdown = dropdown.hasAttribute('data-login-dropdown');
                const loginToggleBtn = dropdown.querySelector('.login-mobile-toggle');

                if (toggle && menu) {
                    const setOpenState = (isOpen) => {
                        menu.classList.toggle('show', isOpen);
                        dropdown.classList.toggle('open', isOpen);
                        toggle.setAttribute('aria-expanded', String(isOpen));
                        loginToggleBtn?.setAttribute('aria-expanded', String(isOpen));
                    };

                    const closeOtherDropdowns = () => {
                        dropdowns.forEach(other => {
                            if (other !== dropdown && other.classList.contains('nav-dropdown')) {
                                other.classList.remove('open');
                                const otherToggle = other.querySelector('.nav-link');
                                const otherBtn = other.querySelector('.login-mobile-toggle');
                                otherToggle?.setAttribute('aria-expanded', 'false');
                                otherBtn?.setAttribute('aria-expanded', 'false');
                                other.querySelector('.dropdown-menu')?.classList.remove('show');
                            }
                        });
                    };

                    // Click handler for mobile and desktop
                    toggle.addEventListener('click', (e) => {
                        const isMobile = window.innerWidth <= 1024;

                        if (isMobile) {
                            // Login dropdown: first tap opens, second tap navigates to login page.
                            if (isLoginDropdown) {
                                const isOpen = menu.classList.contains('show');
                                if (!isOpen) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    closeOtherDropdowns();
                                    setOpenState(true);
                                } else {
                                    setOpenState(false);
                                }
                                return;
                            }

                            e.preventDefault();
                            e.stopPropagation();
                            const isOpen = !menu.classList.contains('show');
                            closeOtherDropdowns();
                            setOpenState(isOpen);
                        }
                    });

                    // Dedicated arrow toggle for mobile login dropdown.
                    if (isLoginDropdown && loginToggleBtn) {
                        loginToggleBtn.addEventListener('click', (e) => {
                            if (window.innerWidth > 1024) return;
                            e.preventDefault();
                            e.stopPropagation();
                            const isOpen = !menu.classList.contains('show');
                            closeOtherDropdowns();
                            setOpenState(isOpen);
                        });
                    }

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
        },

        setupHomeDropdown() {
            if (!this.navMenu || this.navMenu.querySelector('[data-home-dropdown="true"]')) return;

            const homeLink = this.navMenu.querySelector('a.nav-link[href$="index.html"]');
            const homeItem = homeLink?.closest('li');
            if (!homeLink || !homeItem || homeItem.classList.contains('nav-dropdown')) return;

            const standaloneHome2Links = this.navMenu.querySelectorAll('a[href$="home-2.html"], a[href$="pages/home-2.html"]');
            standaloneHome2Links.forEach(link => {
                const item = link.closest('li');
                if (item && item !== homeItem) {
                    item.remove();
                }
            });

            const currentPath = window.location.pathname.toLowerCase();
            const isHome2Active = currentPath.endsWith('/home-2.html') || currentPath.endsWith('home-2.html');
            const isPagesContext = currentPath.includes('/pages/');
            const home1Href = 'index.html';
            const home2Href = isPagesContext ? 'home-2.html' : 'pages/home-2.html';

            const dropdownItem = document.createElement('li');
            dropdownItem.className = 'nav-item nav-dropdown';
            dropdownItem.setAttribute('data-home-dropdown', 'true');

            const dropdownToggle = document.createElement('a');
            dropdownToggle.href = home1Href;
            dropdownToggle.className = 'nav-link dropdown-toggle';
            dropdownToggle.textContent = 'Home';
            dropdownToggle.setAttribute('aria-haspopup', 'true');
            dropdownToggle.setAttribute('aria-expanded', 'false');
            if (!isHome2Active) {
                dropdownToggle.classList.add('active');
            }

            const dropdownMenu = document.createElement('ul');
            dropdownMenu.className = 'dropdown-menu';

            const home1Option = document.createElement('li');
            home1Option.innerHTML = `<a href="${home1Href}" class="dropdown-item${isHome2Active ? '' : ' active'}">Home 1</a>`;

            const home2Option = document.createElement('li');
            home2Option.innerHTML = `<a href="${home2Href}" class="dropdown-item${isHome2Active ? ' active' : ''}">Home 2</a>`;

            dropdownMenu.appendChild(home1Option);
            dropdownMenu.appendChild(home2Option);

            dropdownItem.appendChild(dropdownToggle);
            dropdownItem.appendChild(dropdownMenu);

            homeItem.replaceWith(dropdownItem);
        },

        alignLoginButton() {
            if (!this.navMenu || !this.navActions) return;

            const currentPath = window.location.pathname.toLowerCase();
            const isPagesContext = currentPath.includes('/pages/');
            const clientDashboardHref = isPagesContext ? '../dashboards/client/index.html' : 'dashboards/client/index.html';
            const adminDashboardHref = isPagesContext ? '../dashboards/admin/index.html' : 'dashboards/admin/index.html';

            const menuLoginLink = this.navMenu.querySelector('a[href*="login.html"]');
            const actionLoginLink = this.navActions.querySelector('a[href*="login.html"]');
            const loginHref = menuLoginLink?.getAttribute('href') || actionLoginLink?.getAttribute('href');

            if (!loginHref) return;

            // Remove any previously injected login variants to avoid duplicates.
            this.navMenu.querySelectorAll('a[href*="login.html"]').forEach(link => link.closest('li')?.remove());
            this.navActions.querySelectorAll('.login-dropdown').forEach(el => el.remove());
            this.navActions.querySelectorAll('a[href*="login.html"]').forEach(el => el.remove());

            // Mobile/Tablet menu: Login dropdown with arrow toggle.
            const mobileLoginItem = document.createElement('li');
            mobileLoginItem.className = 'nav-item nav-dropdown d-lg-none';
            mobileLoginItem.setAttribute('data-login-dropdown', 'true');
            mobileLoginItem.innerHTML = `
                <div class="login-mobile-row">
                    <a href="${loginHref}" class="nav-link dropdown-toggle login-mobile-link" aria-haspopup="true" aria-expanded="false">Login</a>
                    <button type="button" class="login-mobile-toggle" aria-label="Toggle login portals" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                <ul class="dropdown-menu">
                    <li><a href="${clientDashboardHref}" class="dropdown-item">Client Dashboard</a></li>
                    <li><a href="${adminDashboardHref}" class="dropdown-item">Admin Dashboard</a></li>
                </ul>
            `;
            this.navMenu.appendChild(mobileLoginItem);

            // Desktop: Login button + hover dropdown.
            const desktopLoginDropdown = document.createElement('div');
            desktopLoginDropdown.className = 'login-dropdown nav-dropdown d-none d-lg-inline-flex';
            desktopLoginDropdown.innerHTML = `
                <a href="${loginHref}" class="btn btn-primary header-login-btn login-main-link" data-login-main-link="true">
                    Login
                    <span class="login-caret" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="${clientDashboardHref}" class="dropdown-item">Client Dashboard</a></li>
                    <li><a href="${adminDashboardHref}" class="dropdown-item">Admin Dashboard</a></li>
                </ul>
            `;

            if (this.menuToggle && this.menuToggle.parentElement === this.navActions) {
                this.navActions.insertBefore(desktopLoginDropdown, this.menuToggle);
            } else {
                this.navActions.appendChild(desktopLoginDropdown);
            }

            const desktopMainLink = desktopLoginDropdown.querySelector('[data-login-main-link="true"]');
            const desktopMenu = desktopLoginDropdown.querySelector('.dropdown-menu');
            const setDesktopDropdown = (isOpen) => {
                desktopLoginDropdown.classList.toggle('open', isOpen);
                desktopMenu?.classList.toggle('show', isOpen);
                desktopMainLink?.setAttribute('aria-expanded', String(isOpen));
            };

            desktopMainLink?.addEventListener('click', () => {
                setDesktopDropdown(false);
            });

            desktopLoginDropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 1024) {
                    setDesktopDropdown(true);
                }
            });

            desktopLoginDropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 1024) {
                    setDesktopDropdown(false);
                }
            });

            document.addEventListener('click', (e) => {
                if (!desktopLoginDropdown.contains(e.target)) {
                    setDesktopDropdown(false);
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
            this.prepareRevealTargets();

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion || !('IntersectionObserver' in window)) {
                this.revealAll();
                return;
            }

            this.initScrollObserver();
        },

        prepareRevealTargets() {
            const selectors = [
                'main .section-header',
                'main [class*="-card"]',
                '.dashboard-main [class*="-card"]',
                '.dashboard-main .card'
            ];

            const targets = document.querySelectorAll(selectors.join(','));
            targets.forEach((el, index) => {
                if (el.closest('.hero') || el.classList.contains('no-reveal')) return;
                if (!el.classList.contains('animate-on-scroll') && !el.classList.contains('fade-in') && !el.classList.contains('slide-up')) {
                    el.classList.add('animate-on-scroll');
                }

                // Light stagger to avoid all cards revealing at the same time.
                el.style.transitionDelay = `${Math.min((index % 6) * 60, 300)}ms`;
            });
        },

        revealAll() {
            document.querySelectorAll('.animate-on-scroll, .fade-in, .slide-up').forEach(el => {
                el.classList.add('animate-visible');
            });
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
                threshold: 0.12,
                rootMargin: '0px 0px -10% 0px'
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
     * Blog Filter & Search
     * Handles filtering of blog posts by category and search queries
     */
    const BlogFilter = {
        init() {
            this.buttons = document.querySelectorAll('.filter-btn');
            this.articles = document.querySelectorAll('.blog-card, .card'); // Select both grid cards and featured card
            this.blogGrid = document.getElementById('blog-grid');
            this.articles = Array.from(this.articles).filter(el =>
                el.classList.contains('blog-card') ||
                (el.classList.contains('card') && el.parentElement.classList.contains('mb-12'))
            );

            if (this.buttons.length > 0 || this.articles.length > 0) {
                this.bindEvents();
                this.checkUrlParams();
                this.rebalanceGrid();
            }
        },

        bindEvents() {
            this.buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter');
                    this.filterPosts(filter);
                    this.updateActiveButton(btn);

                    // Clear search param when clicking a filter
                    const url = new URL(window.location);
                    url.searchParams.delete('q');
                    window.history.pushState({}, '', url);
                });
            });

            window.addEventListener('resize', () => this.rebalanceGrid());
        },

        checkUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');

            if (query) {
                // Decode and sanitize
                const decodedQuery = decodeURIComponent(query).trim();
                if (decodedQuery) {
                    this.searchPosts(decodedQuery);

                    // Update search input value if present
                    const searchInput = document.querySelector('input[type="search"]');
                    if (searchInput) {
                        searchInput.value = decodedQuery;
                    }
                }
            }
        },

        searchPosts(query) {
            const lowerQuery = query.toLowerCase();

            this.articles.forEach(article => {
                const title = article.querySelector('h2, h3, .blog-title')?.textContent || '';
                const excerpt = article.querySelector('p, .blog-excerpt')?.textContent || '';
                const category = article.getAttribute('data-category') || '';

                const content = `${title} ${excerpt} ${category}`.toLowerCase();

                if (content.includes(lowerQuery)) {
                    this.showArticle(article);
                } else {
                    this.hideArticle(article);
                }
            });

            this.rebalanceGrid();

            // Reset active filter buttons
            this.buttons.forEach(btn => {
                if (btn.getAttribute('data-filter') === 'all') {
                    // Optionally highlight 'All' or none
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline');
                }
            });
        },

        filterPosts(category) {
            this.articles.forEach(article => {
                const articleCategory = article.getAttribute('data-category');

                if (category === 'all' || category === articleCategory) {
                    this.showArticle(article);
                } else {
                    this.hideArticle(article);
                }
            });

            this.rebalanceGrid();
        },

        showArticle(article) {
            article.style.display = '';
        },

        hideArticle(article) {
            article.style.display = 'none';
        },

        updateActiveButton(activeBtn) {
            this.buttons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            });
            activeBtn.classList.remove('btn-outline');
            activeBtn.classList.add('btn-primary');
        },

        rebalanceGrid() {
            if (!this.blogGrid) return;

            const cards = Array.from(this.blogGrid.querySelectorAll('.blog-card'));
            cards.forEach(card => card.classList.remove('blog-card--wide'));

            if (window.innerWidth < 768) return;

            const visibleCards = cards.filter(card => card.style.display !== 'none');
            if (visibleCards.length % 2 === 1) {
                visibleCards[visibleCards.length - 1].classList.add('blog-card--wide');
            }
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
     * Events Handler
     * Handles Events link clicks to show coming soon message
     */
    const EventsHandler = {
        init() {
            this.eventsLink = document.getElementById('events-link');
            if (this.eventsLink) {
                this.bindEvents();
            }
        },

        bindEvents() {
            this.eventsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoon();
            });
        },

        showComingSoon() {
            // Create a styled modal/alert for coming soon
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: var(--bg-primary, #fff);
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            `;

            content.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary, #000);">Coming Soon!</h3>
                <p style="color: var(--text-secondary, #666); margin-bottom: 1.5rem;">Events feature is currently under development. Stay tuned for exciting updates!</p>
                <button id="close-modal" style="
                    background: linear-gradient(135deg, var(--color-primary, #3b82f6), var(--color-secondary, #10b981));
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Got it!
                </button>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            // Close modal on button click or backdrop click
            const closeBtn = content.querySelector('#close-modal');
            closeBtn.addEventListener('click', () => {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => modal.remove(), 300);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => modal.remove(), 300);
                }
            });

            // Add animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            if (!document.querySelector('#events-animations')) {
                style.id = 'events-animations';
                document.head.appendChild(style);
            }
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
        BlogFilter.init();
        EventsHandler.init();
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
