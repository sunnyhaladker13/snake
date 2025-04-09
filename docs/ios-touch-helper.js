/**
 * iOS-specific touch handling helper with neo-brutalist styling
 */

(function() {
    // Check if this is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (!isIOS) {
        console.log("iOS HELPER: Not an iOS device, skipping");
        return;
    }
    
    console.log("iOS HELPER: iOS device detected, setting up neo-brutalist helpers");
    
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
    
    // Create a special reload button for iOS users with neo-brutalist style
    function addReloadButton() {
        const button = document.createElement('button');
        button.id = 'iosReloadButton';
        button.textContent = 'RELOAD CONTROLS';
        
        // Apply neo-brutalist styling to match the game
        button.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: #FF5F1F;
            color: white;
            border: 3px solid black;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 999999;
            box-shadow: 2px 2px 0px black;
            transform: rotate(-1deg);
            transition: all 0.15s ease-out;
            display: none;
        `;
        
        // Add neo-brutalist interaction
        button.addEventListener('mousedown', function() {
            this.style.transform = 'rotate(-1deg) translate(2px, 2px)';
            this.style.boxShadow = '0px 0px 0px black';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'rotate(-1deg)';
            this.style.boxShadow = '2px 2px 0px black';
        });
        
        button.addEventListener('click', function() {
            if (typeof window.recreateMobileTouchControls === 'function') {
                window.recreateMobileTouchControls();
                
                // Show feedback with neo-brutalist style
                const feedback = document.createElement('div');
                feedback.textContent = 'Controls reloaded!';
                feedback.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-2deg);
                    background: #00DFFC;
                    color: black;
                    padding: 12px 20px;
                    border: 3px solid black;
                    box-shadow: 4px 4px 0 black;
                    font-weight: bold;
                    font-size: 16px;
                    z-index: 9999999;
                `;
                document.body.appendChild(feedback);
                
                // Remove the feedback after a moment
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    feedback.style.transition = 'opacity 0.5s ease-out';
                    setTimeout(() => document.body.removeChild(feedback), 500);
                }, 1500);
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
    
    console.log("iOS HELPER: Initialization complete with neo-brutalist styling");
})();
