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

            const formData = new FormData(contactForm);
            const name = formData.get('name') || '';
            const email = formData.get('email') || '';
            const company = formData.get('company') || '';
            const phone = formData.get('phone') || '';
            const service = formData.get('service') || 'General Inquiry';
            const timeline = formData.get('timeline') || 'Unspecified timeline';
            const message = formData.get('message') || '';

            const subject = `New Inquiry - ${service}`;
            const bodyLines = [
                `Name: ${name}`,
                `Email: ${email}`,
                `Company: ${company}`,
                `Phone: ${phone}`,
                `Focus: ${service}`,
                `Timeline: ${timeline}`,
                '',
                'Message:',
                message.trim()
            ];

            const mailto = `mailto:hello@auctusventures.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

            sessionStorage.setItem('auctus-contact-confirmed', Date.now().toString());
            window.location.href = mailto;
            contactForm.reset();

            setTimeout(() => {
                window.location.href = 'contact-confirmation.html';
            }, 600);
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
