// Minimal stats counter - IMMEDIATE TEST
var statCards = document.querySelectorAll('.stat-card');

// Try immediately without waiting for DOM
if (statCards.length > 0) {
    statCards.forEach(function(card) {
        var numberElement = card.querySelector('.stat-number');
        numberElement.textContent = 'TEST';
    });
}

// Also try with DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    var statCards2 = document.querySelectorAll('.stat-card');
    
    if (statCards2.length > 0) {
        statCards2.forEach(function(card) {
            var targetCount = parseInt(card.getAttribute('data-count'));
            var numberElement = card.querySelector('.stat-number');
            var originalText = numberElement.textContent;
            
            // Change to target immediately to test
            numberElement.textContent = targetCount + '+';
            
            // Then animate after delay
            setTimeout(function() {
                var current = 0;
                var increment = targetCount / 60;
                
                var timer = setInterval(function() {
                    current += increment;
                    if (current >= targetCount) {
                        current = targetCount;
                        clearInterval(timer);
                    }
                    
                    var val = Math.floor(current);
                    if (originalText.indexOf('%') > -1) {
                        numberElement.textContent = val + '%';
                    } else if (originalText.indexOf('/') > -1) {
                        numberElement.textContent = val + '/7';
                    } else {
                        numberElement.textContent = val + '+';
                    }
                }, 33);
            }, 1000);
        });
    }
});
