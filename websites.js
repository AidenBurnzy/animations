document.addEventListener('DOMContentLoaded', () => {
    // Scroll-based Navbar and Quick Links Animation
    const navbar = document.getElementById('navbar-placeholder');
    const quickLinksBar = document.querySelector('.quick-links-bar');
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > scrollThreshold) {
            if (navbar) navbar.classList.add('hidden');
            if (quickLinksBar) quickLinksBar.classList.add('scrolled');
        } else {
            if (navbar) navbar.classList.remove('hidden');
            if (quickLinksBar) quickLinksBar.classList.remove('scrolled');
        }
    });

    // Particle Animation
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const startX = Math.random() * window.innerWidth;
        const drift = (Math.random() - 0.5) * 200;
        const duration = 15 + Math.random() * 15;
        const delay = Math.random() * 5;
        const size = 2 + Math.random() * 2;
        
        particle.style.left = `${startX}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--drift', `${drift}px`);
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, (duration + delay) * 1000);
    }

    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    // Showcase Slider Functionality
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const arrowPrev = document.querySelector('.arrow-prev');
    const arrowNext = document.querySelector('.arrow-next');
    let currentSlide = 0;
    const totalSlides = slides.length;

    function goToSlide(index, direction = 'next') {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Add exit animation
        if (direction === 'next') {
            slides[currentSlide].classList.add('exit-left');
        } else {
            slides[currentSlide].classList.add('exit-right');
        }
        
        // Remove exit animation after transition
        setTimeout(() => {
            slides[currentSlide].classList.remove('exit-left', 'exit-right');
        }, 800);
        
        // Update current slide
        currentSlide = index;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        goToSlide(nextIndex, 'next');
    }

    function prevSlide() {
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(prevIndex, 'prev');
    }

    // Arrow navigation
    if (arrowNext) {
        arrowNext.addEventListener('click', nextSlide);
    }
    
    if (arrowPrev) {
        arrowPrev.addEventListener('click', prevSlide);
    }

    // Indicator navigation
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (index !== currentSlide) {
                const direction = index > currentSlide ? 'next' : 'prev';
                goToSlide(index, direction);
            }
        });
    });

    // Keyboard navigation for slider
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });

    // Auto-advance slider (optional - uncomment to enable)
    // setInterval(nextSlide, 5000);

    // Theme Toggle
    const themeButtons = document.querySelectorAll('.theme-btn');
    const themeMockups = document.querySelectorAll('.theme-mockup');

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTheme = button.getAttribute('data-theme');
            
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            themeMockups.forEach(mockup => {
                if (mockup.getAttribute('data-theme') === targetTheme) {
                    mockup.classList.add('active');
                } else {
                    mockup.classList.remove('active');
                }
            });
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.service-card, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Smooth scroll for anchor links
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

    // Add hover effect to mockup elements
    const mockupCards = document.querySelectorAll('.mock-card, .tech-block, .minimal-block');
    mockupCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Keyboard navigation for theme buttons
    themeButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextButton = themeButtons[(index + 1) % themeButtons.length];
                nextButton.focus();
                nextButton.click();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevButton = themeButtons[(index - 1 + themeButtons.length) % themeButtons.length];
                prevButton.focus();
                prevButton.click();
            }
        });
    });

    // Add parallax effect to floating visual
    const floatingVisual = document.querySelector('.floating-visual');
    if (floatingVisual && window.innerWidth > 1024) {
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            floatingVisual.style.transform = `translateY(-50%) translate(${moveX}px, ${moveY}px)`;
        });
    }

    // Testimonial card animation on scroll
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Add typing animation to code window
    const codeLines = document.querySelectorAll('.code-line');
    const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                codeLines.forEach((line, index) => {
                    setTimeout(() => {
                        line.style.opacity = '1';
                    }, index * 300);
                });
                codeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const codeWindow = document.querySelector('.code-window');
    if (codeWindow) {
        codeObserver.observe(codeWindow);
    }
});