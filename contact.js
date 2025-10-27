'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const animatedSections = document.querySelectorAll('.fade-up');

    if (animatedSections.length) {
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

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            sessionStorage.setItem('auctus-contact-confirmed', Date.now().toString());
            contactForm.reset();
            window.location.href = 'contact-confirmation.html';
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
