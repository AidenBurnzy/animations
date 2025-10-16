document.addEventListener('DOMContentLoaded', () => {
    const backLink = document.querySelector('.back-link');
    if (!backLink) {
        return;
    }

    backLink.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        backLink.classList.add('active');
        setTimeout(() => backLink.classList.remove('active'), 180);
    });
});
