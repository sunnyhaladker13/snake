/**
 * Mobile-specific controls for Snake
 * This script adds enhanced touch and tap controls for mobile devices
 */

(function() {
    console.log("Mobile controls initializing");

    // Helper to detect mobile devices
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (!isMobile) {
        console.log("Not a mobile device, skipping mobile controls");
        return;
    }
    
    console.log("Mobile device detected, setting up enhanced controls");
    
    // Create backup handler function if main game doesn't expose one
    if (typeof window.handleDirection !== 'function') {
        window.handleDirection = function(direction) {
            console.log(`Mobile direction: ${direction}`);
            
            // Try to access the game's direction queue
            if (window.directionQueue && Array.isArray(window.directionQueue)) {
                let dx = 0, dy = 0;
                
                switch(direction) {
                    case 'up': dy = -20; break;
                    case 'down': dy = 20; break;
                    case 'left': dx = -20; break;
                    case 'right': dx = 20; break;
                }
                
                window.directionQueue.push({dx, dy});
                console.log(`Direction added to queue: ${direction}`);
            }
        };
    }
    
    function setupMobileTapControls() {
        // Get the tap controls container
        const tapControls = document.getElementById('tapControls');
        if (!tapControls) {
            console.error("Tap controls container not found");
            return false;
        }
        
        // Define directions with their IDs and positions
        const directions = [
            { id: 'tapUp', dir: 'up', symbol: '▲', position: { top: 0, left: '25%', width: '50%', height: '33%' } },
            { id: 'tapDown', dir: 'down', symbol: '▼', position: { bottom: 0, left: '25%', width: '50%', height: '33%' } },
            { id: 'tapLeft', dir: 'left', symbol: '◀', position: { top: '33%', left: 0, width: '25%', height: '34%' } },
            { id: 'tapRight', dir: 'right', symbol: '▶', position: { top: '33%', right: 0, width: '25%', height: '34%' } }
        ];
        
        // Process each direction
        directions.forEach(({ id, dir, symbol, position }) => {
            // Get or create the tap zone
            let tapZone = document.getElementById(id);
            
            if (!tapZone) {
                // Create the zone if it doesn't exist
                tapZone = document.createElement('div');
                tapZone.id = id;
                tapZone.className = `tap-zone tap-${dir}`;
                tapControls.appendChild(tapZone);
            } else {
                // Reset existing zone by replacing it with a clone (removes event handlers)
                const clone = tapZone.cloneNode(false);
                tapZone.parentNode.replaceChild(clone, tapZone);
                tapZone = clone;
            }
            
            // Style the tap zone
            Object.entries(position).forEach(([prop, value]) => {
                tapZone.style[prop] = value;
            });
            
            // Add core styles
            tapZone.style.position = 'absolute';
            tapZone.style.display = 'flex';
            tapZone.style.alignItems = 'center';
            tapZone.style.justifyContent = 'center';
            tapZone.style.fontSize = '24px';
            tapZone.style.color = 'rgba(255,255,255,0.7)'; 
            tapZone.style.backgroundColor = 'rgba(255,255,255,0.1)';
            tapZone.style.pointerEvents = 'auto'; // Ensure tap zones are clickable
            tapZone.style.touchAction = 'none'; // Prevent default touch behavior
            tapZone.style.border = '2px solid rgba(255,255,255,0.2)';
            tapZone.textContent = symbol;
            
            // Add direct onclick attribute
            tapZone.setAttribute('onclick', `window.handleDirection('${dir}')`);
            
            // Add click event listener
            tapZone.addEventListener('click', function(e) {
                console.log(`Clicked ${dir}`);
                e.preventDefault();
                window.handleDirection(dir);
            });
            
            // Add touch events
            tapZone.addEventListener('touchstart', function(e) {
                console.log(`Touch start on ${dir}`);
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }, {passive: false});
            
            tapZone.addEventListener('touchend', function(e) {
                console.log(`Touch end on ${dir}`);
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255,255,255,0.1)';
                window.handleDirection(dir);
            }, {passive: false});
            
            // Add tap zone to window for direct access
            window[id] = tapZone;
        });
        
        return true;
    }
    
    // Create simple swipe handler for the canvas
    function setupCanvasSwipeControl() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("Canvas not found for swipe controls");
            return false;
        }
        
        let startX, startY;
        
        canvas.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, {passive: true});
        
        canvas.addEventListener('touchend', function(e) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            // Require minimum movement
            if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                window.handleDirection(diffX > 0 ? 'right' : 'left');
            } else {
                // Vertical swipe
                window.handleDirection(diffY > 0 ? 'down' : 'up');
            }
        }, {passive: true});
        
        return true;
    }
    
    // Function to debug mobile controls
    function debugMobileControls() {
        console.log("Debugging mobile controls");
        
        // Check tap controls
        const tapControls = document.getElementById('tapControls');
        console.log("Tap controls container:", tapControls ? "Found" : "Missing");
        
        if (tapControls) {
            // Make visible for debugging
            tapControls.style.backgroundColor = 'rgba(255,0,0,0.1)';
            
            // Check each tap zone
            ['tapUp', 'tapDown', 'tapLeft', 'tapRight'].forEach(id => {
                const zone = document.getElementById(id);
                console.log(`${id}:`, zone ? "Found" : "Missing");
                
                if (zone) {
                    // Make very visible for debugging
                    zone.style.backgroundColor = 'rgba(255,255,0,0.3)';
                    zone.style.border = '3px solid white';
                    
                    // Test clicking programmatically
                    setTimeout(() => {
                        console.log(`Testing click on ${id}`);
                        zone.click();
                    }, 1000);
                }
            });
        }
        
        // Check handleDirection function
        console.log("handleDirection function:", typeof window.handleDirection === 'function' ? "Available" : "Missing");
        
        // Manually trigger all directions
        setTimeout(() => {
            ['up', 'right', 'down', 'left'].forEach((dir, i) => {
                setTimeout(() => {
                    console.log(`Testing direction: ${dir}`);
                    if (typeof window.handleDirection === 'function') {
                        window.handleDirection(dir);
                    }
                }, i * 500);
            });
        }, 2000);
    }
    
    // Setup functions to run
    function initializeMobileControls() {
        console.log("Setting up mobile controls");
        
        // Run setup in sequence with slight delays
        setTimeout(setupMobileTapControls, 100);
        setTimeout(setupCanvasSwipeControl, 200);
        
        // Add a debug toggle
        window.debugMobileControls = debugMobileControls;
        
        console.log("Mobile controls initialized - call debugMobileControls() from console to test");
    }
    
    // Run initialization after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMobileControls);
    } else {
        // DOM already loaded, initialize now
        initializeMobileControls();
    }
    
    // Also run after a delay just in case
    setTimeout(initializeMobileControls, 1000);
    
    // Run after window load
    window.addEventListener('load', function() {
        setTimeout(initializeMobileControls, 500);
    });
})();
