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

    // Network Canvas Animation
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNodes();
    });
    
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
    
    // DECLARE TIMELINE ELEMENTS FIRST (before Three.js code that references them)
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const carouselArrowLeft = document.querySelector('.carousel-arrow-left');
    const carouselArrowRight = document.querySelector('.carousel-arrow-right');
    const carouselHint = document.querySelector('.carousel-hint');

    // Three.js Globe Rendering
    const globeCanvas = document.getElementById('globe-canvas');

    if (globeCanvas && window.innerWidth > 1024 && typeof THREE !== 'undefined') {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.z = 4.5;
        camera.position.y = 0;

        const renderer = new THREE.WebGLRenderer({
            canvas: globeCanvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(800, 800);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Create globe sphere
        const geometry = new THREE.SphereGeometry(1.5, 64, 64);
        
        // Main globe material with gradient and lighting
        const material = new THREE.MeshPhongMaterial({
            color: 0x3d2864,
            emissive: 0x1a0f2e,
            specular: 0x9b59ff,
            shininess: 100,
            transparent: true,
            opacity: 0.75
        });
        
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Wireframe overlay
        const wireframeGeo = new THREE.SphereGeometry(1.52, 32, 32);
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x9b59ff,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        const wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
        scene.add(wireframe);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xb87cff, 2, 100);
        pointLight.position.set(2, 2, 2);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0x59c3ff, 1.5, 100);
        pointLight2.position.set(-2, -1, 2);
        scene.add(pointLight2);

        // Animation - globe surface rotates based on interaction ONLY
        let isCarouselActive = false;
        
        function animateGlobe() {
            requestAnimationFrame(animateGlobe);
            
            // No auto-rotation - globe only moves when user drags!
            // Rotations are set by the drag handler
            
            renderer.render(scene, camera);
        }
        
        animateGlobe();

        // Store reference for carousel interaction
        if (timelineContainer) {
            window.globeRotation = { 
                globe, 
                wireframe,
                setActive: (active) => { 
                    isCarouselActive = active;
                }
            };
        }

        // Responsive resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                renderer.setSize(800, 800);
            }
        });
    }
    
    // 3D Carousel Timeline with Interactive Globe Rotation
    if (timelineContainer && timelineItems.length && window.innerWidth > 1024) {
        let rotationX = 0;
        let rotationY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startRotationX = 0;
        let startRotationY = 0;
        let velocityX = 0;
        let velocityY = 0;
        let lastX = 0;
        let lastY = 0;
        let lastTime = Date.now();
        let hasInteracted = false;
        
        const angleStep = 360 / timelineItems.length;
        
        // Set initial angles
        timelineContainer.style.setProperty('--items', timelineItems.length);
        timelineItems.forEach((item, index) => {
            const angle = angleStep * index;
            item.style.setProperty('--item-angle', `${angle}deg`);
        });
        
        // Apply initial transform to center first card
        const initialTransform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        timelineContainer.style.transform = initialTransform;
        
        // Apply initial counter-rotation to globe canvas
        if (globeCanvas) {
            const counterTransform = `translate(-50%, -50%) rotateY(${-rotationY}deg) rotateX(${-rotationX}deg)`;
            globeCanvas.style.transform = counterTransform;
        }
        
        // Hide hint after first interaction
        function hideHint() {
            if (!hasInteracted && carouselHint) {
                hasInteracted = true;
                carouselHint.classList.add('hidden');
            }
        }
        
        // Navigation arrow handlers
        if (carouselArrowLeft) {
            carouselArrowLeft.addEventListener('click', () => {
                targetRotationY += angleStep;
                hideHint();
            });
        }
        
        if (carouselArrowRight) {
            carouselArrowRight.addEventListener('click', () => {
                targetRotationY -= angleStep;
                hideHint();
            });
        }
        
        // Mouse/Touch drag handlers
        function handleDragStart(e) {
            if (window.innerWidth <= 1024) {
                timelineContainer.style.cursor = 'auto';
                return;
            }
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            lastX = startX;
            lastY = startY;
            startRotationX = rotationX;
            startRotationY = rotationY;
            velocityX = 0;
            velocityY = 0;
            lastTime = Date.now();
            timelineContainer.style.cursor = 'grabbing';
            hideHint();
            
            // Prevent text selection during drag
            e.preventDefault();
            document.body.style.userSelect = 'none';
        }
        
        function handleDragMove(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            
            // Calculate rotation (much slower now - reduced sensitivity)
            targetRotationY = startRotationY + (deltaX * 0.15);
            targetRotationX = startRotationX - (deltaY * 0.1);
            
            // Clamp X rotation to prevent flipping
            targetRotationX = Math.max(-60, Math.min(60, targetRotationX));
            
            // Calculate velocity for momentum (reduced)
            if (deltaTime > 0) {
                velocityX = -(currentY - lastY) / deltaTime * 15;
                velocityY = (currentX - lastX) / deltaTime * 20;
            }
            
            lastX = currentX;
            lastY = currentY;
            lastTime = currentTime;
        }
        
        function handleDragEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            timelineContainer.style.cursor = 'grab';
            
            // Restore text selection
            document.body.style.userSelect = '';
            
            // Apply momentum (reduced for slower spin)
            targetRotationX += velocityX * 0.15;
            targetRotationY += velocityY * 0.15;
            
            // Clamp X rotation
            targetRotationX = Math.max(-60, Math.min(60, targetRotationX));
        }
        
        // Mouse events on timeline container
        timelineContainer.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        
        // Mouse events on globe canvas (makes center always draggable)
        if (globeCanvas) {
            globeCanvas.addEventListener('mousedown', handleDragStart);
            globeCanvas.addEventListener('touchstart', handleDragStart, { passive: false });
            globeCanvas.style.pointerEvents = 'auto';
            globeCanvas.style.cursor = 'grab';
        }
        
        // Prevent text selection on drag
        timelineContainer.addEventListener('dragstart', (e) => e.preventDefault());
        timelineContainer.addEventListener('selectstart', (e) => {
            if (isDragging) e.preventDefault();
        });
        
        // Touch events
        timelineContainer.addEventListener('touchstart', handleDragStart, { passive: false });
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
        
        // Smooth rotation animation
        function animateRotation() {
            // Smooth interpolation
            rotationX += (targetRotationX - rotationX) * 0.1;
            rotationY += (targetRotationY - rotationY) * 0.1;
            
            // Apply friction to velocity
            velocityX *= 0.95;
            velocityY *= 0.95;
            
            // Check if carousel is being actively manipulated
            const isActive = isDragging || Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5;
            
            // Apply rotation to container (cards rotate around globe)
            const transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            timelineContainer.style.transform = transform;
            
            // COUNTER-ROTATE THE CANVAS to keep it flat and circular!
            // This undoes the parent container's rotation
            if (globeCanvas) {
                const counterTransform = `translate(-50%, -50%) rotateY(${-rotationY}deg) rotateX(${-rotationX}deg)`;
                globeCanvas.style.transform = counterTransform;
            }
            
            // Rotate the globe's SURFACE (not its position) based on rotation
            if (window.globeRotation) {
                const { globe, wireframe, setActive } = window.globeRotation;
                
                // Tell globe animation system if we're actively dragging
                if (setActive) setActive(isActive);
                
                // Update globe surface rotation whenever carousel rotates
                // Convert carousel rotation to radians
                const radiansY = (rotationY * Math.PI) / 180;
                const radiansX = (rotationX * Math.PI) / 180;
                
                // Rotate globe surface to match carousel rotation
                // Position stays fixed, only surface rotates
                globe.rotation.y = radiansY;
                globe.rotation.x = radiansX;
                
                wireframe.rotation.y = radiansY * 0.95;
                wireframe.rotation.x = radiansX * 0.95;
            }
            
            requestAnimationFrame(animateRotation);
        }
        
        animateRotation();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                targetRotationY -= angleStep;
                hideHint();
            } else if (e.key === 'ArrowRight') {
                targetRotationY += angleStep;
                hideHint();
            } else if (e.key === 'ArrowUp') {
                targetRotationX = Math.min(60, targetRotationX + 15);
                hideHint();
            } else if (e.key === 'ArrowDown') {
                targetRotationX = Math.max(-60, targetRotationX - 15);
                hideHint();
            }
        });
        
        // Set cursor style
        timelineContainer.style.cursor = 'grab';
    } else if (timelineContainer) {
        timelineContainer.style.removeProperty('transform');
        timelineContainer.style.cursor = 'auto';
    }
    
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
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
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
            
            // Create mailto link
            const subject = `Project Inquiry - ${service}`;
            const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0AService: ${service}%0D%0A%0D%0AMessage:%0D%0A${message}`;
            const mailtoLink = `mailto:hello@auctusventures.com?subject=${encodeURIComponent(subject)}&body=${body}`;
            
            window.location.href = mailtoLink;
            
            // Optional: Reset form after submission
            contactForm.reset();
        });
    }
    
    // Parallax Effect on Scroll
    let scrollPosition = 0;
    window.addEventListener('scroll', () => {
        scrollPosition = window.pageYOffset;
        
        const floatingNexus = document.querySelector('.floating-energy-nexus');
        if (floatingNexus && window.innerWidth > 1024) {
            floatingNexus.style.transform = `translateY(calc(-50% + ${scrollPosition * 0.1}px))`;
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