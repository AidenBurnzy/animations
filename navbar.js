'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const placeholder = document.getElementById('navbar-placeholder');

    if (!placeholder) {
        return;
    }

    try {
        const response = await fetch('navbar.html', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Navbar fetch failed: ${response.status}`);
        }

        const markup = await response.text();
        placeholder.innerHTML = markup;

        const nav = placeholder.querySelector('.glass-nav');

        if (!nav) {
            return;
        }

        const body = document.body;

        const overflowY = window.getComputedStyle(body).overflowY;
        if (overflowY !== 'hidden') {
            body.classList.add('has-glass-nav--offset');
        }


    const toggle = nav.querySelector('.glass-nav__link--contact-dropdown');
    const menu = nav.querySelector('[data-nav-menu]');
    const focusableMenuItem = menu ? menu.querySelector('a, button') : null;
    const contactLinks = menu ? menu.querySelectorAll('a') : [];

        const closeMenu = ({ shouldFocusToggle = false } = {}) => {
            if (!nav.classList.contains('is-open')) {
                return;
            }

            nav.classList.remove('is-open');

            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');

                if (shouldFocusToggle) {
                    toggle.focus();
                }
            }
        };

        const openMenu = () => {
            nav.classList.add('is-open');

            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
            }

            if (focusableMenuItem) {
                try {
                    focusableMenuItem.focus({ preventScroll: true });
                } catch (error) {
                    focusableMenuItem.focus();
                }
            }
        };

        const toggleMenu = () => {
            if (!toggle) {
                return;
            }

            if (nav.classList.contains('is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        };


        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', (event) => {
            if (!nav.classList.contains('is-open')) {
                return;
            }

            if (!nav.contains(event.target)) {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 720) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu({ shouldFocusToggle: true });
            }
        });

        contactLinks.forEach((link) => {
            link.addEventListener('click', () => closeMenu());
        });

        const applyScrollState = () => {
            nav.classList.toggle('is-scrolled', window.scrollY > 10);
        };

        applyScrollState();
        window.addEventListener('scroll', applyScrollState, { passive: true });
    } catch (error) {
        console.error('Failed to initialise navbar.', error);
    }
});
