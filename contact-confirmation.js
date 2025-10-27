'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const gateKey = 'auctus-contact-confirmed';
    const shell = document.querySelector('main[data-gated]');

    const flag = sessionStorage.getItem(gateKey);

    if (!flag) {
        window.location.replace('contact.html');
        return;
    }

    sessionStorage.removeItem(gateKey);

    if (shell) {
        shell.classList.add('is-visible');
    }
});
