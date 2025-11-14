'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const animatedSections = document.querySelectorAll('.fade-up');

    if (animatedSections.length) {
        // Check if mobile device
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, show all sections immediately
            animatedSections.forEach((section) => {
                section.classList.add('is-visible');
            });
        } else {
            // On desktop, use intersection observer for scroll animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -80px 0px'
            });

            animatedSections.forEach((section) => observer.observe(section));
        }
    }

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                timeline: document.getElementById('timeline').value,
                message: document.getElementById('message').value
            };

            // Get submit button and disable it
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending...</span>';

            try {
                // Send to API endpoint
                const response = await fetch('/api/submit-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Success - store confirmation and redirect
                    sessionStorage.setItem('auctus-contact-confirmed', Date.now().toString());
                    contactForm.reset();
                    window.location.href = 'contact-confirmation.html';
                } else {
                    // Error from API
                    throw new Error(result.error || 'Failed to submit form');
                }

            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message to user
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                alert('Sorry, there was an error submitting your form. Please try again or email us directly at founder.auctusventures@gmail.com');
            }
        });
    }

    const heroCard = document.querySelector('.hero-card');

    if (heroCard) {
        heroCard.addEventListener('mousemove', (event) => {
            const rect = heroCard.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            heroCard.style.setProperty('--pointer-x', `${x}px`);
            heroCard.style.setProperty('--pointer-y', `${y}px`);
        });

        heroCard.addEventListener('mouseleave', () => {
            heroCard.style.setProperty('--pointer-x', '50%');
            heroCard.style.setProperty('--pointer-y', '50%');
        });
    }
});
