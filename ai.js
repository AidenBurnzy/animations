document.addEventListener('DOMContentLoaded', () => {
    // Neural Network Canvas Animation
    const canvas = document.getElementById('neuralNetwork');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNodes();
    });
    
    // Neural network nodes
    const nodes = [];
    const nodeCount = 80;
    const connectionDistance = 150;
    
    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
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
            ctx.fillStyle = 'rgba(0, 220, 255, 0.6)';
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
                    const opacity = (1 - distance / connectionDistance) * 0.3;
                    ctx.strokeStyle = `rgba(0, 220, 255, ${opacity})`;
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
    
    // Showcase Slider Functionality
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const arrowPrev = document.querySelector('.arrow-prev');
    const arrowNext = document.querySelector('.arrow-next');
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function goToSlide(index, direction = 'next') {
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        if (direction === 'next') {
            slides[currentSlide].classList.add('exit-left');
        } else {
            slides[currentSlide].classList.add('exit-right');
        }
        
        setTimeout(() => {
            slides[currentSlide].classList.remove('exit-left', 'exit-right');
        }, 800);
        
        currentSlide = index;
        
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
    
    if (arrowNext) {
        arrowNext.addEventListener('click', nextSlide);
    }
    
    if (arrowPrev) {
        arrowPrev.addEventListener('click', prevSlide);
    }
    
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
    
    const animatedElements = document.querySelectorAll('.capability-card, .testimonial-card, .timeline-item, .use-case-card');
    animatedElements.forEach(el => {
        if (!el.style.opacity) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        }
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
    
    // Add parallax effect to floating visual
    const floatingVisual = document.querySelector('.floating-visual');
    if (floatingVisual && window.innerWidth > 1024) {
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            floatingVisual.style.transform = `translateY(-50%) translate(${moveX}px, ${moveY}px)`;
        });
    }
    
    // Chatbot typing animation
    const typingMessages = document.querySelectorAll('.message.ai-message.typing');
    typingMessages.forEach(msg => {
        setTimeout(() => {
            msg.classList.remove('typing');
            const bubble = msg.querySelector('.message-bubble');
            const typingIndicator = bubble.querySelector('.typing-indicator');
            if (typingIndicator) {
                setTimeout(() => {
                    typingIndicator.remove();
                    bubble.textContent = 'Your order is currently in transit and will arrive tomorrow by 2 PM.';
                }, 2000);
            }
        }, 3000);
    });
    
    // Data particles animation (automation visual)
    const dataParticles = document.querySelectorAll('.data-particle');
    dataParticles.forEach((particle, index) => {
        particle.style.animationDelay = `${index * 1}s`;
    });
    
    // Phone service call duration counter
    const callDuration = document.querySelector('.call-duration');
    if (callDuration) {
        let seconds = 42;
        setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            callDuration.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // Animate CRM tags appearing
    const crmTags = document.querySelectorAll('.crm-tag');
    crmTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Enhanced hover effects for capability cards
    const capabilityCards = document.querySelectorAll('.capability-card');
    capabilityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Timeline marker pulse on scroll
    const timelineMarkers = document.querySelectorAll('.timeline-marker');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'marker-pulse 2s ease-in-out infinite';
            }
        });
    }, { threshold: 0.5 });
    
    timelineMarkers.forEach(marker => {
        timelineObserver.observe(marker);
    });
    
    // Add CSS for marker pulse
    const style = document.createElement('style');
    style.textContent = `
        @keyframes marker-pulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 20px rgba(0, 220, 255, 0.4);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(0, 220, 255, 0.6);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Use case cards interactive glow
    const useCaseCards = document.querySelectorAll('.use-case-card');
    useCaseCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    
    // Add radial gradient glow effect
    const useCaseStyle = document.createElement('style');
    useCaseStyle.textContent = `
        .use-case-card {
            position: relative;
            overflow: hidden;
        }
        .use-case-card::after {
            content: '';
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(0, 220, 255, 0.15), transparent 70%);
            top: var(--mouse-y, 50%);
            left: var(--mouse-x, 50%);
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        .use-case-card:hover::after {
            opacity: 1;
        }
    `;
    document.head.appendChild(useCaseStyle);
    
    // Testimonial cards stagger animation
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
    
    // Brain visual interactive rotation
    const aiBrain = document.querySelector('.ai-brain');
    if (aiBrain && window.innerWidth > 768) {
        let rotationX = 0;
        let rotationY = 0;
        
        document.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            rotationY = (e.clientX - centerX) / centerX * 10;
            rotationX = -(e.clientY - centerY) / centerY * 10;
            
            aiBrain.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        });
    }
    
    // Pulse effect for data streams
    const dataStreams = document.querySelectorAll('.data-stream');
    dataStreams.forEach((stream, index) => {
        stream.style.animationDelay = `${index * 0.7}s`;
    });
    
    // Add glow to active slide features
    const slideFeatures = document.querySelectorAll('.feature-item');
    slideFeatures.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 25px rgba(0, 220, 255, 0.4)';
        });
        
        feature.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    // Console easter egg
    console.log('%c🤖 AI Solutions by Auctus Ventures', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
    console.log('%cInterested in working with us? Contact: hello@auctusventures.com', 'color: #00ffc8; font-size: 14px;');
});