/**
 * iOS-specific touch handling helper
 * Creates additional ways for iOS devices to interact with the game
 */

(function() {
    // Check if this is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (!isIOS) {
        console.log("iOS HELPER: Not an iOS device, skipping");
        return;
    }
    
    console.log("iOS HELPER: iOS device detected, setting up helpers");
    
    // Monitor scroll events as they can break fixed positioning on iOS
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            console.log("iOS HELPER: Scroll detected, fixing controls");
            if (typeof window.recreateMobileTouchControls === 'function') {
                window.recreateMobileTouchControls();
            }
        }, 300);
    });
    
    // Add direct touch event to the game area for immediate response
    document.addEventListener('DOMContentLoaded', function() {
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            // Add direct swipe handling to the game area
            let startX, startY;
            
            gameArea.addEventListener('touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, {passive: true});
            
            gameArea.addEventListener('touchend', function(e) {
                if (!startX || !startY) return;
                
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                
                const diffX = endX - startX;
                const diffY = endY - startY;
                
                // Require minimum movement
                if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;
                
                // Determine direction based on larger delta
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    // Horizontal swipe
                    if (window.handleDirection) {
                        window.handleDirection(diffX > 0 ? 'right' : 'left');
                    }
                } else {
                    // Vertical swipe
                    if (window.handleDirection) {
                        window.handleDirection(diffY > 0 ? 'down' : 'up');
                    }
                }
            }, {passive: true});
            
            console.log("iOS HELPER: Added direct swipe handler to game area");
        }
    });
    
    // Create a special reload button for iOS users
    function addReloadButton() {
        const button = document.createElement('button');
        button.id = 'iosReloadButton';
        button.textContent = 'Reload Controls';
        button.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border: 1px solid white;
            border-radius: 5px;
            padding: 5px 10px;
            font-size: 12px;
            z-index: 999999;
            display: none;
        `;
        
        button.addEventListener('click', function() {
            if (typeof window.recreateMobileTouchControls === 'function') {
                window.recreateMobileTouchControls();
                alert('Controls reloaded!');
            }
        });
        
        document.body.appendChild(button);
        
        // Show button after a delay
        setTimeout(() => {
            button.style.display = 'block';
        }, 5000);
    }
    
    // Add the reload button after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addReloadButton);
    } else {
        addReloadButton();
    }
    
    console.log("iOS HELPER: Initialization complete");
})();
