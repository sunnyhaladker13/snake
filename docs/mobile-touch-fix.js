/**
 * Mobile Device Touch Controls Fix
 * This script creates touch controls optimized specifically for actual mobile devices,
 * not just browser emulation.
 */

(function() {
    // Only run on actual mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
        console.log("MOBILE TOUCH FIX: Not a mobile device, skipping");
        return;
    }
    
    console.log("MOBILE TOUCH FIX: Mobile device detected, initializing");
    
    // Create the mobile touch controller
    function createMobileTouchControls() {
        console.log("MOBILE TOUCH FIX: Creating touch controls overlay");
        
        // Remove any existing mobile controls to avoid conflicts
        removeExistingControls();
        
        // Get the canvas to position our controls
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("MOBILE TOUCH FIX: Canvas not found!");
            return false;
        }
        
        // Get the exact canvas position
        const canvasRect = canvas.getBoundingClientRect();
        
        // Create a container that's fixed to the viewport - this is critical for mobile
        const container = document.createElement('div');
        container.id = 'mobileTouchOverlay';
        
        // Position exactly over the canvas relative to viewport (fixed positioning)
        container.style.cssText = `
            position: fixed !important;
            top: ${canvasRect.top}px !important;
            left: ${canvasRect.left}px !important;
            width: ${canvasRect.width}px !important;
            height: ${canvasRect.height}px !important;
            z-index: 999999 !important; 
            pointer-events: none !important;
            touch-action: none !important;
            -webkit-tap-highlight-color: transparent !important;
            user-select: none !important;
        `;
        
        // Add to body so it's outside any other container hierarchy
        document.body.appendChild(container);
        
        // Define the control zones with their positions
        const zones = [
            { name: 'up', symbol: '▲', position: 'top: 0; left: 25%; width: 50%; height: 33%;' },
            { name: 'down', symbol: '▼', position: 'bottom: 0; left: 25%; width: 50%; height: 33%;' },
            { name: 'left', symbol: '◀', position: 'top: 33%; left: 0; width: 25%; height: 34%;' },
            { name: 'right', symbol: '▶', position: 'top: 33%; right: 0; width: 25%; height: 34%;' }
        ];
        
        // Create each zone
        zones.forEach(zone => {
            const touchZone = document.createElement('div');
            touchZone.id = `mobileTouch${zone.name.charAt(0).toUpperCase() + zone.name.slice(1)}`;
            touchZone.className = 'mobile-touch-zone';
            
            // Style with absolute positioning inside the container
            touchZone.style.cssText = `
                position: absolute !important;
                ${zone.position}
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                pointer-events: auto !important;
                background-color: rgba(255, 255, 255, 0.2) !important;
                color: white !important;
                font-size: 28px !important;
                border-radius: 8px !important;
                border: 2px solid rgba(255, 255, 255, 0.4) !important;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent !important;
            `;
            
            touchZone.textContent = zone.symbol;
            container.appendChild(touchZone);
            
            // Add the appropriate event handlers - optimized for mobile
            addMobileTouchHandlers(touchZone, zone.name);
        });
        
        // Create a function to update the overlay position
        function updateOverlayPosition() {
            const updatedRect = canvas.getBoundingClientRect();
            container.style.top = `${updatedRect.top}px`;
            container.style.left = `${updatedRect.left}px`;
            container.style.width = `${updatedRect.width}px`;
            container.style.height = `${updatedRect.height}px`;
        }
        
        // Listen for orientation changes and resize events
        window.addEventListener('resize', updateOverlayPosition);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateOverlayPosition, 300);
            setTimeout(updateOverlayPosition, 1000);
        });
        
        // For debugging on actual device
        window.showMobileControls = function() {
            document.querySelectorAll('.mobile-touch-zone').forEach(el => {
                el.style.backgroundColor = 'rgba(255, 0, 0, 0.3) !important';
                el.style.border = '3px solid white !important';
            });
            return "Mobile controls highlighted";
        };
        
        // Hide debug overlay after a few seconds
        setTimeout(() => {
            document.querySelectorAll('.mobile-touch-zone').forEach(el => {
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                el.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            });
        }, 2000);
        
        console.log("MOBILE TOUCH FIX: Touch overlay created successfully");
        return true;
    }
    
    // Helper function to add touch handlers
    function addMobileTouchHandlers(element, direction) {
        // Mobile-optimized event handling
        element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        }, {passive: false});
        
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            
            console.log(`MOBILE TOUCH FIX: Direction ${direction}`);
            triggerDirection(direction);
        }, {passive: false});
        
        // Also add regular click as fallback
        element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            triggerDirection(direction);
        });
        
        // Set as direct property for maximum compatibility
        element.onclick = function() {
            triggerDirection(direction);
            return false;
        };
    }
    
    // Function to send direction to the game
    function triggerDirection(direction) {
        if (typeof window.handleDirection === 'function') {
            window.handleDirection(direction);
        } else if (window.directionQueue && Array.isArray(window.directionQueue)) {
            // Fallback to directly manipulating the queue
            let dx = 0, dy = 0;
            switch(direction) {
                case 'up': dy = -20; break;
                case 'down': dy = 20; break;
                case 'left': dx = -20; break;
                case 'right': dx = 20; break;
            }
            window.directionQueue.push({dx, dy});
            console.log(`MOBILE TOUCH FIX: Direction queued: ${direction}`);
        } else {
            console.error("MOBILE TOUCH FIX: No way to send direction to game");
        }
    }
    
    // Helper to remove any existing control overlays
    function removeExistingControls() {
        const existingOverlay = document.getElementById('mobileTouchOverlay');
        if (existingOverlay) {
            existingOverlay.parentNode.removeChild(existingOverlay);
        }
        
        // Also remove any other control containers that might conflict
        const selectors = [
            '#absoluteTapContainer',
            '#forceFixContainer',
            '#fixedTapContainer',
            '#directTapContainer'
        ];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.parentNode.removeChild(element);
        });
    }
    
    // Run initialization with multiple attempts
    function initializeControls() {
        // Try to create the controls immediately
        createMobileTouchControls();
        
        // Try again after DOM is ready
        if (document.readyState !== 'complete') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(createMobileTouchControls, 500);
            });
        }
        
        // And again after everything has loaded
        window.addEventListener('load', () => {
            setTimeout(createMobileTouchControls, 1000);
            // Try once more after a delay
            setTimeout(createMobileTouchControls, 3000);
        });
    }
    
    // Expose recreation function to window
    window.recreateMobileTouchControls = createMobileTouchControls;
    
    // Run the initialization
    initializeControls();
    
    console.log("MOBILE TOUCH FIX: Initialization complete");
})();
