/**
 * Absolute Canvas Tap Fix
 * This script creates tap zones directly on top of the canvas element
 * using exact pixel positioning to ensure perfect alignment
 */

(function() {
    console.log("ABSOLUTE CANVAS TAP FIX: Initializing");
    
    function createAbsoluteTapControls() {
        // Get the canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("ABSOLUTE TAP FIX: Canvas not found!");
            return false;
        }
        
        // Remove any previous direct tap containers to avoid duplication
        const oldContainer = document.getElementById('absoluteTapContainer');
        if (oldContainer) {
            oldContainer.parentNode.removeChild(oldContainer);
            console.log("ABSOLUTE TAP FIX: Removed old container");
        }
        
        // Get the exact position of the canvas in the viewport
        const canvasRect = canvas.getBoundingClientRect();
        console.log("ABSOLUTE TAP FIX: Canvas position:", canvasRect);
        
        // Create a new container that will be positioned in the document body
        const tapContainer = document.createElement('div');
        tapContainer.id = 'absoluteTapContainer';
        
        // Style it with absolute position matching the canvas exactly
        tapContainer.style.cssText = `
            position: absolute;
            top: ${canvasRect.top + window.scrollY}px;
            left: ${canvasRect.left + window.scrollX}px;
            width: ${canvasRect.width}px;
            height: ${canvasRect.height}px;
            z-index: 9999;
            pointer-events: none;
            touch-action: none;
            border: 2px solid transparent;
        `;
        
        // Add the container to the document body so it's not affected by other layouts
        document.body.appendChild(tapContainer);
        
        console.log("ABSOLUTE TAP FIX: Created container at exact canvas position:", {
            top: tapContainer.style.top,
            left: tapContainer.style.left,
            width: tapContainer.style.width,
            height: tapContainer.style.height
        });
        
        // Define tap zones
        const zones = [
            { id: 'absUp', dir: 'up', text: '▲', position: { top: 0, left: '25%', width: '50%', height: '33%' } },
            { id: 'absDown', dir: 'down', text: '▼', position: { top: '67%', left: '25%', width: '50%', height: '33%' } },
            { id: 'absLeft', dir: 'left', text: '◀', position: { top: '33%', left: 0, width: '25%', height: '34%' } },
            { id: 'absRight', dir: 'right', text: '▶', position: { top: '33%', right: 0, width: '25%', height: '34%' } }
        ];
        
        // Create each zone
        zones.forEach(zone => {
            const zoneEl = document.createElement('div');
            zoneEl.id = zone.id;
            
            // Apply base styling
            zoneEl.style.cssText = `
                position: absolute;
                top: ${zone.position.top};
                left: ${zone.position.left || 'auto'};
                right: ${zone.position.right || 'auto'};
                width: ${zone.position.width};
                height: ${zone.position.height};
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                background-color: rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.7);
                font-size: 28px;
                touch-action: none;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                border: 2px solid rgba(255, 255, 255, 0.3);
            `;
            
            zoneEl.textContent = zone.text;
            tapContainer.appendChild(zoneEl);
            
            // Add multiple event listeners for maximum compatibility
            
            // Click event
            zoneEl.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`ABSOLUTE TAP FIX: Clicked ${zone.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(zone.dir);
                }
            });
            
            // Touch events with visual feedback
            zoneEl.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            }, {passive: false});
            
            zoneEl.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                console.log(`ABSOLUTE TAP FIX: Touch ended on ${zone.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(zone.dir);
                }
            }, {passive: false});
            
            // Also add mouse events for testing on desktop
            zoneEl.addEventListener('mousedown', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            });
            
            zoneEl.addEventListener('mouseup', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            
            console.log(`ABSOLUTE TAP FIX: Created ${zone.id} zone`);
        });
        
        console.log("ABSOLUTE TAP FIX: All zones created successfully");
        
        // Return the container for future reference
        return tapContainer;
    }
    
    // Function to update the position when the window resizes or scrolls
    function updateTapControlsPosition() {
        const canvas = document.getElementById('gameCanvas');
        const tapContainer = document.getElementById('absoluteTapContainer');
        
        if (!canvas || !tapContainer) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        
        // Update container position to match canvas
        tapContainer.style.top = (canvasRect.top + window.scrollY) + 'px';
        tapContainer.style.left = (canvasRect.left + window.scrollX) + 'px';
        tapContainer.style.width = canvasRect.width + 'px';
        tapContainer.style.height = canvasRect.height + 'px';
        
        console.log("ABSOLUTE TAP FIX: Updated position to:", {
            top: tapContainer.style.top,
            left: tapContainer.style.left
        });
    }
    
    // Create utilities for debugging
    window.toggleAbsoluteTapZones = function(visible = true) {
        const container = document.getElementById('absoluteTapContainer');
        if (!container) {
            console.error("ABSOLUTE TAP FIX: Container not found");
            return false;
        }
        
        const zones = container.querySelectorAll('div');
        zones.forEach(zone => {
            zone.style.border = visible ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.3)';
            zone.style.backgroundColor = visible ? 'rgba(255, 100, 100, 0.4)' : 'rgba(255, 255, 255, 0.2)';
            zone.style.color = visible ? 'white' : 'rgba(255, 255, 255, 0.7)';
        });
        
        container.style.border = visible ? '3px solid red' : '2px solid transparent';
        
        return visible ? "Tap zones highlighted" : "Tap zones normal";
    };
    
    // Helper function that users can call to manually recreate the controls
    window.recreateAbsoluteTapControls = function() {
        const container = createAbsoluteTapControls();
        window.toggleAbsoluteTapZones(true);
        setTimeout(() => window.toggleAbsoluteTapZones(false), 3000);
        return "Absolute tap controls recreated";
    };
    
    // Setup event listeners for position updates
    function setupEventListeners() {
        window.addEventListener('resize', function() {
            setTimeout(updateTapControlsPosition, 300);
        });
        
        window.addEventListener('scroll', function() {
            updateTapControlsPosition();
        });
        
        window.addEventListener('orientationchange', function() {
            setTimeout(updateTapControlsPosition, 500);
        });
        
        // Also ensure position is correct after any interaction
        document.addEventListener('click', function() {
            setTimeout(updateTapControlsPosition, 100);
        });
    }
    
    // Make a global backup handleDirection function if needed
    if (typeof window.handleDirection !== 'function') {
        window.handleDirection = function(dir) {
            console.log(`ABSOLUTE TAP FIX: Direction handler for ${dir}`);
            if (window.directionQueue && Array.isArray(window.directionQueue)) {
                let dx = 0, dy = 0;
                switch(dir) {
                    case 'up': dy = -20; break;
                    case 'down': dy = 20; break;
                    case 'left': dx = -20; break;
                    case 'right': dx = 20; break;
                }
                window.directionQueue.push({dx, dy});
                console.log(`ABSOLUTE TAP FIX: Queued direction ${dir}`);
            }
        };
    }
    
    // Initialize the controls
    function initAbsoluteTapControls() {
        createAbsoluteTapControls();
        setupEventListeners();
        
        // Flash the controls briefly to show they're active
        window.toggleAbsoluteTapZones(true);
        setTimeout(() => window.toggleAbsoluteTapZones(false), 1000);
        
        console.log("ABSOLUTE TAP FIX: Initialization complete");
    }
    
    // Run on multiple events to ensure it works
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initAbsoluteTapControls, 500);
        });
    } else {
        setTimeout(initAbsoluteTapControls, 100);
    }
    
    // Also run after window load
    window.addEventListener('load', function() {
        setTimeout(initAbsoluteTapControls, 500);
    });
    
    // Run it immediately too
    setTimeout(initAbsoluteTapControls, 200);
})();
