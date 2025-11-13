// Loading Screen JavaScript
// This script monitors ALL website resources and keeps the loading screen visible until everything is loaded

(function() {
    'use strict';
    
    // Check if loading screen has already been shown in this session
    if (sessionStorage.getItem('loadingScreenShown') === 'true') {
        // Remove loading screen immediately if already shown
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.remove();
        }
        return; // Exit the script
    }
    
    // Add loading class to body to prevent scrolling
    document.body.classList.add('loading');
    
    let resourcesLoaded = false;
    let domReady = false;
    let imagesLoaded = false;
    let minimumTimeElapsed = false;
    const startTime = Date.now();
    const MINIMUM_DISPLAY_TIME = 5000; // 5 seconds minimum
    
    // Function to hide loading screen
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
            loadingScreen.classList.add('fade-out');
            document.body.classList.remove('loading');
            
            // Mark that loading screen has been shown
            sessionStorage.setItem('loadingScreenShown', 'true');
            
            // Remove from DOM after fade out animation completes
            setTimeout(function() {
                if (loadingScreen && loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 500);
        }
    }
    
    // Check if all conditions are met
    function checkAllLoaded() {
        if (resourcesLoaded && domReady && imagesLoaded && minimumTimeElapsed) {
            // Add small delay for smooth transition
            setTimeout(hideLoadingScreen, 500);
        }
    }
    
    // Ensure minimum display time of 5 seconds
    setTimeout(function() {
        minimumTimeElapsed = true;
        checkAllLoaded();
    }, MINIMUM_DISPLAY_TIME);
    
    // Monitor DOM ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            domReady = true;
            checkAllLoaded();
        });
    } else {
        domReady = true;
    }
    
    // Monitor all images, stylesheets, and scripts
    function checkAllResources() {
        const images = Array.from(document.images);
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        
        const allResources = [...images, ...stylesheets, ...scripts];
        
        if (allResources.length === 0) {
            imagesLoaded = true;
            return;
        }
        
        let loadedCount = 0;
        const totalCount = allResources.length;
        
        function resourceLoaded() {
            loadedCount++;
            if (loadedCount >= totalCount) {
                imagesLoaded = true;
                checkAllLoaded();
            }
        }
        
        // Check each resource
        allResources.forEach(function(resource) {
            if (resource.tagName === 'IMG') {
                if (resource.complete && resource.naturalHeight !== 0) {
                    resourceLoaded();
                } else {
                    resource.addEventListener('load', resourceLoaded);
                    resource.addEventListener('error', resourceLoaded); // Continue even if image fails
                }
            } else if (resource.tagName === 'LINK') {
                // Stylesheets - check if loaded
                if (resource.sheet) {
                    resourceLoaded();
                } else {
                    resource.addEventListener('load', resourceLoaded);
                    resource.addEventListener('error', resourceLoaded);
                }
            } else if (resource.tagName === 'SCRIPT') {
                // Scripts - if they're in DOM, they're likely loaded
                resourceLoaded();
            }
        });
    }
    
    // Wait for window.load event (all resources including CSS, JS, images)
    window.addEventListener('load', function() {
        resourcesLoaded = true;
        
        // Double-check all images are loaded
        checkAllResources();
        
        // If no additional resources found, proceed
        if (imagesLoaded) {
            checkAllLoaded();
        }
    });
    
    // Fallback timeout - force hide after 10 seconds to prevent infinite loading
    setTimeout(function() {
        console.log('Loading screen: Fallback timeout reached (10s)');
        resourcesLoaded = true;
        domReady = true;
        imagesLoaded = true;
        checkAllLoaded();
    }, 10000);
    
    // Also check resources periodically until loaded
    const resourceCheckInterval = setInterval(function() {
        if (resourcesLoaded && domReady && imagesLoaded) {
            clearInterval(resourceCheckInterval);
        } else if (document.readyState === 'complete') {
            checkAllResources();
        }
    }, 100);
    
})();
