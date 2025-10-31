// DOM Elements
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Cache DOM elements
const elements = {
    header: $('.header'),
    mobileMenuBtn: $('.mobile-menu-btn'),
    navMenu: $('.nav-menu'),
    backToTopBtn: $('.back-to-top'),
    courseCards: $$('.course-card'),
    filterBtns: $$('.filter-btn'),
    loginModal: $('#loginModal'),
    modalClose: $('.modal-close'),
    loginBtn: $('.login-btn'),
    themeToggle: $('.theme-toggle'),
    loginForm: $('#loginForm'),
    pageLoading: $('.page-loading'),
    skipLink: $('#skip-link')
};

// State management
const state = {
    isMenuOpen: false,
    isModalOpen: false,
    currentTheme: localStorage.getItem('theme') || 'light',
    isLoading: false
};

// Initialize the application
function init() {
    // Set initial theme
    setTheme(state.currentTheme);
    
    // Initialize event listeners
    setupEventListeners();
    
    // Hide loading screen after everything is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            elements.pageLoading.classList.add('hidden');
        }, 500);
    });
    
    // Initial animations
    animateOnScroll();
}

// Set up all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
    
    // Back to top button
    window.addEventListener('scroll', handleScroll);
    elements.backToTopBtn?.addEventListener('click', scrollToTop);
    
    // Course filtering
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => filterCourses(btn));
    });
    
    // Modal functionality
    elements.loginBtn?.addEventListener('click', openModal);
    elements.modalClose?.addEventListener('click', closeModal);
    window.addEventListener('click', handleOutsideClick);
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Form submission
    elements.loginForm?.addEventListener('submit', handleLogin);
    
    // Skip link
    elements.skipLink?.addEventListener('click', handleSkipLink);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
}

// Toggle mobile menu
function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.navMenu.classList.toggle('active', state.isMenuOpen);
    elements.mobileMenuBtn.setAttribute('aria-expanded', state.isMenuOpen);
    
    // Lock body scroll when menu is open
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    
    // Add animation class
    if (state.isMenuOpen) {
        elements.navMenu.style.animation = 'slideInRight 0.3s ease-out forwards';
    } else {
        elements.navMenu.style.animation = 'slideOutRight 0.3s ease-out forwards';
    }
}

// Handle scroll events
function handleScroll() {
    // Sticky header
    elements.header.classList.toggle('scrolled', window.scrollY > 50);
    
    // Show/hide back to top button
    if (elements.backToTopBtn) {
        const isScrolled = window.scrollY > 300;
        elements.backToTopBtn.classList.toggle('show', isScrolled);
        elements.backToTopBtn.setAttribute('aria-hidden', !isScrolled);
    }
    
    // Animate elements on scroll
    animateOnScroll();
}

// Scroll to top function
function scrollToTop(e) {
    if (e) e.preventDefault();
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Focus on the first focusable element in the header
    const firstFocusable = elements.header.querySelector('a, button, [tabindex]');
    if (firstFocusable) {
        firstFocusable.focus();
    }
}

// Filter courses by category
function filterCourses(activeBtn) {
    // Update active state of filter buttons
    elements.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn === activeBtn);
        btn.setAttribute('aria-pressed', btn === activeBtn);
    });
    
    const filter = activeBtn.getAttribute('data-filter');
    
    // Filter and animate course cards
    elements.courseCards.forEach(card => {
        const shouldShow = filter === 'all' || card.classList.contains(filter);
        
        // Add animation class
        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.add('animate');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.classList.remove('animate');
            
            // Hide after animation completes
            setTimeout(() => {
                if (!card.classList.contains('animate')) {
                    card.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // Announce filter change for screen readers
    const filterText = filter === 'all' ? 'All courses' : `${filter} courses`;
    announceToScreenReader(`Showing ${filterText}`);
}

// Handle modal functionality
function openModal(e) {
    if (e) e.preventDefault();
    
    state.isModalOpen = true;
    elements.loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set focus to the first focusable element in the modal
    const firstFocusable = elements.loginModal.querySelector('input, button, [tabindex]');
    if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // Trap focus inside the modal
    trapFocus(elements.loginModal);
}

function closeModal() {
    state.isModalOpen = false;
    elements.loginModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Return focus to the login button
    elements.loginBtn.focus();
}

function handleOutsideClick(e) {
    if (e.target === elements.loginModal) {
        closeModal();
    }
}

// Theme functionality
function toggleTheme() {
    const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Announce theme change for screen readers
    announceToScreenReader(`Switched to ${newTheme} mode`);
}

function setTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update button label
    if (elements.themeToggle) {
        elements.themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    }
}

// Form handling
async function handleLogin(e) {
    e.preventDefault();
    
    if (state.isLoading) return;
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    state.isLoading = true;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showToast('Login successful! Redirecting...', 'success');
        
        // Reset form and close modal
        form.reset();
        setTimeout(closeModal, 1000);
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        // Reset loading state
        state.isLoading = false;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Helper functions
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('animate');
        }
    });
}

function trapFocus(element) {
    const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        
        if (!isTabPressed) return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Add show class
    toast.classList.add('show');
    
    // Remove toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    
    // Add slight delay to ensure the screen reader picks up the change
    setTimeout(() => {
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Remove the announcement after it's been read
        setTimeout(() => {
            announcement.remove();
        }, 100);
    }, 100);
}

function handleSkipLink(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
        
        // Remove tabindex after blur
        targetElement.addEventListener('blur', function onBlur() {
            targetElement.removeAttribute('tabindex');
            targetElement.removeEventListener('blur', onBlur);
        }, { once: true });
    }
}

function handleKeyDown(e) {
    // Close modal on Escape key
    if (e.key === 'Escape' && state.isModalOpen) {
        closeModal();
    }
    
    // Handle keyboard navigation for dropdowns/menus if needed
    // This is a placeholder for additional keyboard navigation logic
}

// Initialize the application when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// The main application code is now organized into functions above
// This makes the code more maintainable and easier to understand

// Mobile menu toggle
mobileMenuBtn?.addEventListener('click', () => {
    navMenu.classList.toggle('active');    
    mobileMenuBtn.setAttribute('aria-expanded', 
        mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
});

// Sticky header
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    
    // Show/hide back to top button
    if (backToTopBtn) {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
    }
});

// Back to top button
backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Course filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        courseCards.forEach(card => {
            if (filter === 'all' || card.classList.contains(filter)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Modal functionality
loginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
});

modalClose?.addEventListener('click', () => {
    loginModal?.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal?.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your login logic here
        alert('Login functionality will be implemented here!');
    });
}

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('animated');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);

// Initialize animations
window.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    
    // Add animation delay to course cards
    document.querySelectorAll('.course-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 100}ms`;
    });
});
