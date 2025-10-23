document.addEventListener('DOMContentLoaded', () => {
    // Scroll-based Navbar and Quick Links Animation
    const navbar = document.getElementById('navbar-placeholder');
    const quickLinksBar = document.querySelector('.quick-links-bar');
    let lastScrollTop = 0;
    const scrollThreshold = 50; // Start animation after 50px of scroll
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > scrollThreshold) {
            // Scrolling down - hide navbar and move quick links to top
            if (navbar) navbar.classList.add('hidden');
            if (quickLinksBar) quickLinksBar.classList.add('scrolled');
        } else {
            // At top of page - show navbar and return quick links to original position
            if (navbar) navbar.classList.remove('hidden');
            if (quickLinksBar) quickLinksBar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Network Canvas Animation
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    
    // Network nodes
    const nodes = [];
    const nodeCount = 60;
    const connectionDistance = 180;
    
    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2.5 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(184, 124, 255, 0.7)';
            ctx.fill();
        }
    }
    
    function initNodes() {
        nodes.length = 0;
        for (let i = 0; i < nodeCount; i++) {
            nodes.push(new Node());
        }
    }
    
    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    const opacity = (1 - distance / connectionDistance) * 0.4;
                    ctx.strokeStyle = `rgba(155, 89, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        drawConnections();
        
        nodes.forEach(node => {
            node.update();
            node.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    initNodes();
    animate();
    
    // Energy Nexus Mouse Interaction - Runs from Cursor
    const energyNexus = document.querySelector('.floating-energy-nexus');
    if (energyNexus && window.innerWidth > 1024) {
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        
        const smoothFactor = 0.15;
        const maxDistance = 200;
        const repelStrength = 1.5;
        
        document.addEventListener('mousemove', (e) => {
            const rect = energyNexus.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const force = (1 - distance / maxDistance) * repelStrength;
                const angle = Math.atan2(dy, dx);
                
                targetX = -Math.cos(angle) * maxDistance * force;
                targetY = -Math.sin(angle) * maxDistance * force;
            } else {
                targetX = 0;
                targetY = 0;
            }
        });
        
        function updateNexusPosition() {
            currentX += (targetX - currentX) * smoothFactor;
            currentY += (targetY - currentY) * smoothFactor;
            
            energyNexus.style.transform = `translateY(-50%) translate(${currentX}px, ${currentY}px)`;
            
            requestAnimationFrame(updateNexusPosition);
        }
        
        updateNexusPosition();
    }
    
    // Animated Stats Counter
    const statCards = document.querySelectorAll('.stat-card');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const targetCount = parseInt(entry.target.getAttribute('data-count'));
                const numberElement = entry.target.querySelector('.stat-number');
                const originalText = numberElement.textContent;
                
                animateCount(numberElement, targetCount, originalText);
            }
        });
    }, observerOptions);
    
    statCards.forEach(card => {
        statsObserver.observe(card);
    });
    
    function animateCount(element, target, template) {
        let current = 0;
        const increment = target / 60;
        const duration = 2000;
        const stepTime = duration / 60;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = template.replace('0', Math.floor(current));
        }, stepTime);
    }
    
    // Timeline Scroll Animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });
    
    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
    
    // Pricing Toggle
    const pricingButtons = document.querySelectorAll('.toggle-btn');
    const websitesPricing = document.getElementById('websitesPricing');
    const aiPricing = document.getElementById('aiPricing');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPricing = button.getAttribute('data-pricing');
            
            pricingButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            if (targetPricing === 'websites') {
                websitesPricing.classList.remove('hidden');
                aiPricing.classList.add('hidden');
            } else {
                websitesPricing.classList.add('hidden');
                aiPricing.classList.remove('hidden');
            }
        });
    });
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const service = formData.get('service');
            const message = formData.get('message');
            
            const subject = `Project Inquiry - ${service}`;
            const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0AService: ${service}%0D%0A%0D%0AMessage:%0D%0A${message}`;
            const mailtoLink = `mailto:hello@auctusventures.com?subject=${encodeURIComponent(subject)}&body=${body}`;
            
            window.location.href = mailtoLink;
            contactForm.reset();
        });
    }
    
    // Parallax Effect on Scroll
    let scrollPosition = 0;
    window.addEventListener('scroll', () => {
        scrollPosition = window.pageYOffset;
        
        if (energyNexus && window.innerWidth > 1024) {
            const parallaxOffset = scrollPosition * 0.05;
            const currentTransform = energyNexus.style.transform || 'translateY(-50%)';
            if (!currentTransform.includes('translate(')) {
                energyNexus.style.transform = `translateY(calc(-50% + ${parallaxOffset}px))`;
            }
        }
    });
    
    // Service Card Interactive Glow
    const serviceCards = document.querySelectorAll('.service-card-large');
    
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.left = `${x - 125}px`;
                glow.style.top = `${y - 125}px`;
            }
        });
    });
    
    // Intersection Observer for General Animations
    const animatedElements = document.querySelectorAll('.value-card, .pricing-card, .mission-visual');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        fadeObserver.observe(el);
    });
    
    // Smooth Scroll for Anchor Links
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
    
    // Add Hover Effects to Pricing Cards
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-12px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
    
    // Timeline Marker Animation on Hover
    const timelineMarkers = document.querySelectorAll('.timeline-marker');
    
    timelineMarkers.forEach(marker => {
        marker.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
        });
    });
    
    // Value Cards Stagger Animation
    const valueCards = document.querySelectorAll('.value-card');
    
    const valueObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                valueObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    valueCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        valueObserver.observe(card);
    });
    
    // Form Input Focus Effects
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Add Keyboard Navigation Support for FAQ
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextItem = faqItems[index + 1];
                if (nextItem) {
                    nextItem.querySelector('.faq-question').focus();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevItem = faqItems[index - 1];
                if (prevItem) {
                    prevItem.querySelector('.faq-question').focus();
                }
            }
        });
    });
    
    // Mission Visual 3D Interaction
    const visualGrid = document.querySelector('.visual-grid');
    const missionVisual = document.querySelector('.mission-visual');
    
    if (missionVisual && visualGrid && window.innerWidth > 768) {
        missionVisual.addEventListener('mousemove', (e) => {
            const rect = missionVisual.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const rotateY = ((mouseX - centerX) / centerX) * 15;
            const rotateX = -((mouseY - centerY) / centerY) * 15;
            
            visualGrid.style.transform = `rotateX(${25 + rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        missionVisual.addEventListener('mouseleave', () => {
            visualGrid.style.transform = 'rotateX(25deg) rotateY(0deg)';
        });
    }
    
    // Add Ripple Effect to Buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    const buttons = document.querySelectorAll('.pricing-cta, .submit-btn, .cta-primary, .cta-secondary, .card-link');
    
    buttons.forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        
        button.addEventListener('click', createRipple);
    });
    
    // Add ripple styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Console Easter Egg
    console.log('%c🚀 Auctus Ventures', 'color: #b87cff; font-size: 24px; font-weight: bold;');
    console.log('%cBuilding tomorrow\'s digital landscape', 'color: #59c3ff; font-size: 16px;');
    console.log('%cInterested in working with us? Contact: hello@auctusventures.com', 'color: #b87cff; font-size: 14px;');
    
    // Add Loading Animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});