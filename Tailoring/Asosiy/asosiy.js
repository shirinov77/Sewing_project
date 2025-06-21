class AnimationManager {
    static animate(element, styles, duration = 200) {
        Object.assign(element.style, styles);
        requestAnimationFrame(() => {
            setTimeout(() => {
                Object.assign(element.style, { transform: 'scale(1)' });
            }, duration);
        });
    }

    static scale(element) {
        this.animate(element, { transform: 'scale(1.1)' });
    }

    static lift(element) {
        this.animate(element, {
            transform: 'translateY(-10px)',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)'
        });
    }

    static resetCard(element) {
        this.animate(element, {
            transform: 'translateY(0)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
        });
    }
}

class ScrollManager {
    constructor(elements) {
        this.elements = elements;
        this.currentSection = '';
        this.debounceScroll = this.debounceScroll.bind(this);
    }

    debounceScroll() {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                requestAnimationFrame(() => this.highlightNav());
            }, 100);
        };
    }

    highlightNav() {
        this.elements.sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 50) {
                this.currentSection = section.id;
            }
        });

        this.elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${this.currentSection}`);
            link.setAttribute('aria-current', link.getAttribute('href') === `#${this.currentSection}` ? 'true' : 'false');
        });
    }

    setup() {
        window.addEventListener('scroll', this.debounceScroll());
        this.highlightNav();
    }
}

class WebsiteInteractions {
    constructor() {
        this.elements = this.initElements();
        this.testimonialIndex = 0;
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            rootMargin: '0px',
            threshold: 0.1
        });
        this.bindEvents();
    }

    initElements() {
        return {
            navLinks: document.querySelectorAll('nav a, .btn[href^="#"]'),
            mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
            navMenu: document.querySelector('.nav-menu'),
            courseCards: document.querySelectorAll('.course-card'),
            faqQuestions: document.querySelectorAll('.faq-question'),
            pricingCards: document.querySelectorAll('.pricing-card'),
            testimonials: document.querySelectorAll('.testimonial-card'),
            forms: document.querySelectorAll('form'),
            fabButtons: document.querySelectorAll('.fab-btn'),
            sections: document.querySelectorAll('section[id]'),
            categoryBtns: document.querySelectorAll('.category-btn'),
            authButtons: document.querySelectorAll('.auth-buttons .btn')
        };
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                this.observer.unobserve(entry.target);
            }
        });
    }

    bindEvents() {
        try {
            this.setupSmoothScrolling();
            this.setupMobileMenu();
            this.setupCourseCards();
            this.setupFAQAccordion();
            this.setupPricingCards();
            this.setupTestimonialSlider();
            this.setupFormHandling();
            this.setupFloatingButtons();
            new ScrollManager(this.elements).setup();
            this.setupCourseFiltering();
            this.setupAuthButtons();
            this.setupLazyLoading();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    setupSmoothScrolling() {
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (window.innerWidth <= 768) {
                        this.toggleMobileMenu(false);
                    }
                    link.dispatchEvent(new CustomEvent('section:viewed', { detail: { section: targetId } }));
                }
            });
        });
    }

    setupMobileMenu() {
        const { mobileMenuBtn, navMenu } = this.elements;
        if (!mobileMenuBtn || !navMenu) return;

        mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        mobileMenuBtn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });
    }

    setupCourseCards() {
        this.elements.courseCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('mouseenter', () => AnimationManager.lift(card));
            card.addEventListener('mouseleave', () => AnimationManager.resetCard(card));
            card.addEventListener('focus', () => AnimationManager.lift(card));
            card.addEventListener('blur', () => AnimationManager.resetCard(card));
        });
    }

    setupFAQAccordion() {
        this.elements.faqQuestions.forEach(question => {
            question.setAttribute('tabindex', '0');
            question.addEventListener('click', () => this.toggleFAQ(question));
            question.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(question);
                }
            });
        });
    }

    toggleFAQ(question) {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('i');
        const isOpen = answer.style.maxHeight;

        this.elements.faqQuestions.forEach(q => {
            if (q !== question) {
                q.nextElementSibling.style.maxHeight = '';
                q.querySelector('i')?.classList.replace('fa-chevron-up', 'fa-chevron-down');
                q.setAttribute('aria-expanded', 'false');
            }
        });

        if (isOpen) {
            answer.style.maxHeight = '';
            icon?.classList.replace('fa-chevron-up', 'fa-chevron-down');
            question.setAttribute('aria-expanded', 'false');
        } else {
            answer.style.maxHeight = `${answer.scrollHeight}px`;
            icon?.classList.replace('fa-chevron-down', 'fa-chevron-up');
            question.setAttribute('aria-expanded', 'true');
        }
    }

    setupPricingCards() {
        this.elements.pricingCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('recommended')) {
                    card.style.transform = 'scale(1.03)';
                }
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
            });
            card.addEventListener('focus', () => {
                if (!card.classList.contains('recommended')) {
                    card.style.transform = 'scale(1.03)';
                }
            });
            card.addEventListener('blur', () => {
                card.style.transform = 'scale(1)';
            });
        });
    }

    setupTestimonialSlider() {
        const { testimonials } = this.elements;
        if (!testimonials.length) return;

        const showTestimonial = index => {
            testimonials.forEach((testimonial, i) => {
                Object.assign(testimonial.style, {
                    display: i === index ? 'block' : 'none',
                    opacity: i === index ? '1' : '0',
                    transition: 'opacity 0.5s ease'
                });
                testimonial.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
            });
        };

        setInterval(() => {
            this.testimonialIndex = (this.testimonialIndex + 1) % testimonials.length;
            showTestimonial(this.testimonialIndex);
        }, 5000);

        showTestimonial(0);
    }

    async setupFormHandling() {
        this.elements.forms.forEach(form => {
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                try {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Yuborilmoqda...';
                    submitBtn.disabled = true;
                    submitBtn.setAttribute('aria-disabled', 'true');

                    await new Promise(resolve => setTimeout(resolve, 1500));

                    submitBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Yuborildi!';
                    const successMsg = document.createElement('div');
                    successMsg.className = 'form-success';
                    successMsg.setAttribute('role', 'alert');
                    successMsg.innerHTML = 'Rahmat! Sizning arizangiz qabul qilindi. Tez orada siz bilan bog\'lanamiz.';
                    form.appendChild(successMsg);

                    setTimeout(() => {
                        form.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.setAttribute('aria-disabled', 'false');
                        successMsg.remove();
                    }, 3000);
                } catch (error) {
                    console.error('Form submission error:', error);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.setAttribute('aria-disabled', 'false');
                }
            });
        });
    }

    setupFloatingButtons() {
        this.elements.fabButtons.forEach(btn => {
            btn.setAttribute('tabindex', '0');
            btn.addEventListener('click', e => {
                e.preventDefault();
                AnimationManager.scale(btn);

                if (btn.classList.contains('fab-primary')) {
                    document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' });
                } else if (btn.classList.contains('fab-telegram')) {
                    window.open('https://t.me/tikuvchi_uz_support', '_blank');
                }
            });

            btn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    setupCourseFiltering() {
        this.elements.categoryBtns.forEach(btn => {
            btn.setAttribute('tabindex', '0');
            btn.addEventListener('click', () => {
                this.elements.categoryBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                AnimationManager.scale(btn);
                btn.dispatchEvent(new CustomEvent('category:filtered', { detail: { category: btn.textContent } }));
            });

            btn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    setupAuthButtons() {
        this.elements.authButtons.forEach(btn => {
            btn.setAttribute('tabindex', '0');
            btn.addEventListener('click', e => {
                e.preventDefault();
                AnimationManager.scale(btn);
                alert(`"${btn.textContent}" sahifasi tez orada ishga tushadi!`);
            });

            btn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    setupLazyLoading() {
        this.elements.courseCards.forEach(card => this.observer.observe(card));
        this.elements.testimonials.forEach(testimonial => this.observer.observe(testimonial));
    }

    toggleMobileMenu(state = null) {
        const { navMenu, mobileMenuBtn } = this.elements;
        if (!navMenu || !mobileMenuBtn) return;

        const isActive = state ?? !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isActive);
        mobileMenuBtn.innerHTML = isActive ?
            '<i class="fas fa-times" aria-label="Close menu"></i>' :
            '<i class="fas fa-bars" aria-label="Open menu"></i>';
        mobileMenuBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        AnimationManager.scale(mobileMenuBtn);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        new WebsiteInteractions();
    } catch (error) {
        console.error('Application initialization failed:', error);
    }
});