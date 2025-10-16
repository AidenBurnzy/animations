const slides = Array.from(document.querySelectorAll('.slide'));
const textElements = Array.from(document.querySelectorAll('.text'));
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
let isAnimating = false;
let isDescriptionOpen = false;
let currentOpenDescription = null;

// Split text into individual characters
function splitText() {
    const textElements = document.querySelectorAll('.text');
    
    textElements.forEach((textEl) => {
        const text = textEl.textContent;
        textEl.textContent = '';
        
        text.split('').forEach((char) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            textEl.appendChild(span);
        });
    });
}

// Letter bounce effect on mouse move
function initLetterBounce() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach((slide) => {
        slide.addEventListener('mousemove', (e) => {
            const chars = slide.querySelectorAll('.char');
            
            chars.forEach((char) => {
                const rect = char.getBoundingClientRect();
                const charCenterX = rect.left + rect.width / 2;
                const charCenterY = rect.top + rect.height / 2;
                
                const distanceX = e.clientX - charCenterX;
                const distanceY = e.clientY - charCenterY;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                
                const maxDistance = 200;
                const proximity = Math.max(0, 1 - distance / maxDistance);
                
                const bounce = proximity * -40;
                const scale = 1 + proximity * 0.3;
                
                char.style.transform = `translateY(${bounce}px) scale(${scale})`;
            });
        });
        
        slide.addEventListener('mouseleave', () => {
            const chars = slide.querySelectorAll('.char');
            chars.forEach((char) => {
                char.style.transform = 'translateY(0) scale(1)';
            });
        });
    });
}

function showSlide(nextIndex) {
    if (!slides.length || nextIndex === currentSlide || isAnimating) {
        return;
    }

    const outgoing = slides[currentSlide];
    const incoming = slides[nextIndex];

    if (!incoming) {
        return;
    }

    // Close any open description before switching slides
    if (isDescriptionOpen) {
        closeDescription();
    }

    isAnimating = true;

    incoming.classList.add('enter-from-left');
    void incoming.offsetWidth;
    incoming.classList.add('active');

    const handleIncomingEnd = (event) => {
        if (event.propertyName !== 'transform') {
            return;
        }
        incoming.classList.remove('enter-from-left');
        incoming.removeEventListener('transitionend', handleIncomingEnd);
        isAnimating = false;
    };

    incoming.addEventListener('transitionend', handleIncomingEnd);

    if (outgoing) {
        outgoing.classList.remove('active');
    }

    currentSlide = nextIndex;
}

function nextSlide() {
    if (!slides.length) {
        return;
    }

    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
}

function openDescription(target) {
    if (isDescriptionOpen) {
        return;
    }

    const descriptionId = `${target}-desc`;
    const description = document.getElementById(descriptionId);
    const textElement = document.querySelector(`[data-target="${target}"]`);

    if (!description || !textElement) {
        return;
    }

    isDescriptionOpen = true;
    currentOpenDescription = description;

    // Shift text up
    textElement.classList.add('shifted-up');

    // Show description
    description.classList.add('active');

    // Change arrow to X and move down
    nextBtn.classList.add('close-mode');
}

function closeDescription() {
    if (!isDescriptionOpen || !currentOpenDescription) {
        return;
    }

    const activeSlide = slides[currentSlide];
    const textElement = activeSlide.querySelector('.text');

    // Shift text back to center
    if (textElement) {
        textElement.classList.remove('shifted-up');
    }

    // Hide description
    currentOpenDescription.classList.remove('active');

    // Change X back to arrow and move up
    nextBtn.classList.remove('close-mode');

    isDescriptionOpen = false;
    currentOpenDescription = null;
}

function handleTextClick(e) {
    const target = e.currentTarget.getAttribute('data-target');
    
    if (!target) {
        return;
    }

    if (isDescriptionOpen) {
        closeDescription();
    } else {
        openDescription(target);
    }
}

function handleArrowClick() {
    if (isDescriptionOpen) {
        closeDescription();
    } else {
        nextSlide();
    }
}

function initSlider() {
    if (slides.length) {
        slides[currentSlide].classList.add('active');
    }
}

function initTextClickHandlers() {
    textElements.forEach((text) => {
        text.addEventListener('click', handleTextClick);
    });
}

// Initialize everything
splitText();
initSlider();
initTextClickHandlers();
initLetterBounce();

if (nextBtn) {
    nextBtn.addEventListener('click', handleArrowClick);
}

document.addEventListener('keydown', (event) => {
    if (isDescriptionOpen) {
        if (event.key === 'Escape') {
            closeDescription();
        }
    } else {
        if (event.key === 'ArrowRight') {
            nextSlide();
        }
    }
});