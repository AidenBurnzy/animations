const heroOrbit = document.getElementById('heroOrbit');
const toggleBtn = document.getElementById('nextBtn');
const textElements = Array.from(document.querySelectorAll('.text'));
const infoCards = {
    websites: document.getElementById('websites-desc'),
    ai: document.getElementById('ai-desc')
};

let activeFocus = 'websites';

function applyFocusState(target) {
    if (heroOrbit) {
        heroOrbit.classList.toggle('show-ai', target === 'ai');
    }

    if (toggleBtn) {
        toggleBtn.classList.toggle('is-active', target === 'ai');
    }

    Object.entries(infoCards).forEach(([key, card]) => {
        if (card) {
            card.classList.toggle('active', key === target);
        }
    });
}

function toggleFocus() {
    activeFocus = activeFocus === 'websites' ? 'ai' : 'websites';
    applyFocusState(activeFocus);
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleFocus);
}

textElements.forEach((textEl) => {
    textEl.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        if (target) {
            activeFocus = target;
            applyFocusState(target);
        }
    });
});

applyFocusState(activeFocus);