console.log('🔧 Auctus fixes loading...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFixes);
} else {
    initFixes();
}

function initFixes() {
    console.log('🔧 Running fixes...');
    
    // PRICING TOGGLE FIX
    var websiteBtn = document.querySelector('[data-pricing="websites"]');
    var aiBtn = document.querySelector('[data-pricing="ai"]');
    var websiteGrid = document.getElementById('websitesPricing');
    var aiGrid = document.getElementById('aiPricing');
    
    console.log('Pricing elements found:', {
        websiteBtn: !!websiteBtn,
        aiBtn: !!aiBtn,
        websiteGrid: !!websiteGrid,
        aiGrid: !!aiGrid
    });
    
    if (websiteBtn && aiBtn && websiteGrid && aiGrid) {
        websiteBtn.onclick = function(e) {
            e.preventDefault();
            console.log('✓ Website button clicked');
            websiteBtn.classList.add('active');
            aiBtn.classList.remove('active');
            websiteGrid.classList.remove('hidden');
            aiGrid.classList.add('hidden');
        };
        
        aiBtn.onclick = function(e) {
            e.preventDefault();
            console.log('✓ AI button clicked');
            aiBtn.classList.add('active');
            websiteBtn.classList.remove('active');
            aiGrid.classList.remove('hidden');
            websiteGrid.classList.add('hidden');
        };
        console.log('✅ Pricing toggle ready');
    } else {
        console.error('❌ Pricing elements missing');
    }
    
    // STATS COUNTER FIX
    var statCards = document.querySelectorAll('.stat-card');
    console.log('Stat cards found:', statCards.length);
    
    if (statCards.length > 0) {
        statCards.forEach(function(card, index) {
            var numEl = card.querySelector('.stat-number');
            var target = parseInt(card.getAttribute('data-count'));
            var template = numEl.textContent;
            
            console.log('Animating stat #' + index + ':', target, template);
            
            var current = 0;
            var step = target / 50;
            
            var timer = setInterval(function() {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                var val = Math.floor(current);
                if (template.indexOf('%') > -1) {
                    numEl.textContent = val + '%';
                } else if (template.indexOf('/') > -1) {
                    numEl.textContent = val + '/7';
                } else {
                    numEl.textContent = val + '+';
                }
            }, 30);
        });
        console.log('✅ Stats counter started');
    } else {
        console.error('❌ Stat cards missing');
    }
}
