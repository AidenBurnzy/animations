const heroOrbit = document.getElementById('heroOrbit');
const toggleBtn = document.getElementById('nextBtn');
const textElements = Array.from(document.querySelectorAll('.text'));
const infoCards = {
    websites: document.getElementById('websites-desc'),
    ai: document.getElementById('ai-desc'),
    auctus: document.getElementById('auctus-desc')
};

// Three-state cycle: auctus -> websites -> ai -> auctus
const states = ['auctus', 'websites', 'ai'];
let currentStateIndex = 0;
let activeFocus = states[currentStateIndex];

function applyFocusState(target) {
    console.log('Applying focus state:', target); // Debug log
    
    if (heroOrbit) {
        heroOrbit.classList.remove('show-ai', 'show-auctus', 'show-websites');
        if (target === 'ai') {
            heroOrbit.classList.add('show-ai');
        } else if (target === 'auctus') {
            heroOrbit.classList.add('show-auctus');
        } else if (target === 'websites') {
            heroOrbit.classList.add('show-websites');
        }
        console.log('Hero orbit classes:', heroOrbit.className); // Debug log
    }

    if (toggleBtn) {
        toggleBtn.classList.toggle('is-active', target !== 'auctus');
    }

    Object.entries(infoCards).forEach(([key, card]) => {
        if (card) {
            card.classList.toggle('active', key === target);
        }
    });
}

function toggleFocus() {
    currentStateIndex = (currentStateIndex + 1) % states.length;
    activeFocus = states[currentStateIndex];
    applyFocusState(activeFocus);
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleFocus);
}

textElements.forEach((textEl) => {
         textEl.addEventListener('click', function() {
             const target = this.getAttribute('data-target');
             if (target) {
                 // If clicking on already active text, navigate to its page
                 if (activeFocus === target) {
                     const pageMap = {
                         'websites': 'websites.html',
                         'ai': 'ai.html',
                         'auctus': 'auctus.html'
                     };
                     window.location.href = pageMap[target];
                 } else {
                     // Otherwise, center it
                     activeFocus = target;
                     currentStateIndex = states.indexOf(target);
                     applyFocusState(target);
                 }
             }
         });
     });

// Apply initial state
applyFocusState(activeFocus);