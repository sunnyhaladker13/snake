/**
 * Emergency fix for mobile tap controls
 * 
 * This script ensures tap controls work reliably on all devices
 */

(function() {
    console.log("TAP FIX: Running independent of device type");
    
    // Wait for DOM to be fully loaded
    function fixTapZones() {
        // Get all tap zones
        const tapUp = document.getElementById('tapUp');
        const tapDown = document.getElementById('tapDown');
        const tapLeft = document.getElementById('tapLeft');
        const tapRight = document.getElementById('tapRight');
        
        // Log which ones we found
        console.log("TAP FIX: Found tap zones:", {
            up: !!tapUp,
            down: !!tapDown,
            left: !!tapLeft,
            right: !!tapRight
        });
        
        // Exit if elements don't exist
        if (!tapUp || !tapDown || !tapLeft || !tapRight) {
            console.error("TAP FIX: Tap zones missing - trying to recreate them");
            createTapZones();
            return;
        }
        
        // Get reference to canvas and tap controls
        const canvas = document.getElementById('gameCanvas');
        const tapControls = document.querySelector('.tap-controls');
        
        // Make sure tap controls are visible regardless of device type for testing
        if (tapControls && canvas) {
            tapControls.style.display = 'block';
            tapControls.style.position = 'absolute';
            tapControls.style.top = '0';
            tapControls.style.left = '0';
            tapControls.style.width = '100%';
            tapControls.style.height = '100%';
            tapControls.style.zIndex = '100';
            tapControls.style.pointerEvents = 'none';
        }
        
        // Add styles to each zone
        [tapUp, tapDown, tapLeft, tapRight].forEach(zone => {
            zone.style.position = 'absolute';
            zone.style.backgroundColor = 'rgba(255,255,255,0.1)';
            zone.style.pointerEvents = 'auto';
            zone.style.cursor = 'pointer';
            zone.style.display = 'flex';
            zone.style.alignItems = 'center';
            zone.style.justifyContent = 'center';
        });
        
        // Position them correctly
        tapUp.style.top = '0';
        tapUp.style.left = '25%';
        tapUp.style.width = '50%';
        tapUp.style.height = '33%';
        
        tapDown.style.bottom = '0';
        tapDown.style.left = '25%';
        tapDown.style.width = '50%';
        tapDown.style.height = '33%';
        
        tapLeft.style.top = '33%';
        tapLeft.style.left = '0';
        tapLeft.style.width = '25%';
        tapLeft.style.height = '34%';
        
        tapRight.style.top = '33%';
        tapRight.style.right = '0';
        tapRight.style.width = '25%';
        tapRight.style.height = '34%';
        
        // Add event handlers - we use multiple approaches for redundancy
        function setupHandlers(element, direction) {
            // Remove existing handlers to avoid conflicts
            element.onclick = null;
            element.ontouchend = null;
            
            // Add multiple types of handlers
            element.addEventListener('click', function(e) {
                if (window.handleDirection) {
                    window.handleDirection(direction);
                }
            });
            
            element.addEventListener('touchend', function(e) {
                e.preventDefault();
                if (window.handleDirection) {
                    window.handleDirection(direction);
                }
            });
            
            // Direct assignment for maximum compatibility
            element.onclick = function() { if(window.handleDirection) window.handleDirection(direction); };
            element.ontouchend = function(e) {
                e.preventDefault();
                if(window.handleDirection) window.handleDirection(direction);
            };
        }
        
        // Setup handlers for each direction
        setupHandlers(tapUp, 'up');
        setupHandlers(tapDown, 'down');
        setupHandlers(tapLeft, 'left');
        setupHandlers(tapRight, 'right');
        
        console.log("TAP FIX: Tap zones fixed successfully");
    }
    
    // In case the zones don't exist, try to create them
    function createTapZones() {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) {
            console.error("Game area not found");
            return;
        }
        
        // Create container if needed
        let tapControls = document.querySelector('.tap-controls');
        if (!tapControls) {
            tapControls = document.createElement('div');
            tapControls.className = 'tap-controls';
            gameArea.appendChild(tapControls);
        }
        
        // Create zones
        const directions = ['Up', 'Down', 'Left', 'Right'];
        directions.forEach(dir => {
            const zoneId = 'tap' + dir;
            let zone = document.getElementById(zoneId);
            
            if (!zone) {
                zone = document.createElement('div');
                zone.id = zoneId;
                zone.className = 'tap-zone tap-' + dir.toLowerCase();
                tapControls.appendChild(zone);
                console.log(`Created ${zoneId} zone`);
            }
        });
        
        // Try fixing again
        setTimeout(fixTapZones, 100);
    }
    
    // Wait for page to load
    if (document.readyState === 'complete') {
        setTimeout(fixTapZones, 300);
    } else {
        window.addEventListener('load', function() {
            setTimeout(fixTapZones, 300);
        });
    }
    
    // Also try now
    setTimeout(fixTapZones, 100);
    
    // Expose toggle debug function
    window.toggleTapDebug = function() {
        const tapControls = document.querySelector('.tap-controls');
        if (tapControls) {
            tapControls.classList.toggle('debug');
            return tapControls.classList.contains('debug');
        }
        return false;
    };
})();
