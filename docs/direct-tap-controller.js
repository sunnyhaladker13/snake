/**
 * Direct Tap Controller
 * 
 * A simple, reliable tap controller that directly overlays the canvas
 * and works regardless of other mobile control systems.
 * This is now the ONLY tap zone implementation used in the game.
 */

(function() {
    console.log("DIRECT TAP: Initializing as primary tap controller");
    
    // Initialize immediately and also after a short delay to catch all possible initialization points
    initDirectTapController();
    setTimeout(initDirectTapController, 500);
    setTimeout(initDirectTapController, 1000); // Extra attempt for slow devices
    
    function initDirectTapController() {
        // Get canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.log("DIRECT TAP: No canvas found, waiting...");
            return;
        }
        
        // Remove any existing controller to avoid duplication
        const existingController = document.getElementById('directTapController');
        if (existingController) {
            existingController.parentNode.removeChild(existingController);
        }
        
        // Also remove any legacy tap controls that might exist
        ['tapControls', 'absoluteTapContainer', 'mobileTouchOverlay', 
         'fixedTapContainer', 'unifiedMobileControls'].forEach(id => {
            const el = document.getElementById(id) || document.querySelector(`.${id}`);
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
                console.log(`DIRECT TAP: Removed legacy control: ${id}`);
            }
        });
        
        // Create a container that's positioned directly over the canvas
        const container = document.createElement('div');
        container.id = 'directTapController';
        
        // Get canvas rect for absolute positioning
        const canvasRect = canvas.getBoundingClientRect();
        
        // Apply improved positioning - use absolute with exact coordinates
        container.style.cssText = `
            position: absolute;
            top: ${canvas.offsetTop}px;
            left: ${canvas.offsetLeft}px;
            width: ${canvas.offsetWidth}px;
            height: ${canvas.offsetHeight}px;
            z-index: 500;
            pointer-events: none;
            touch-action: none;
            border: none;
        `;
        
        // Add to canvas parent for proper positioning
        canvas.parentNode.appendChild(container);
        
        // Create four tap zones (up, down, left, right) with neo-brutalist styling
        const zones = [
            { dir: 'up', symbol: '▲', style: 'top:0; left:25%; width:50%; height:33%;' },
            { dir: 'down', symbol: '▼', style: 'bottom:0; left:25%; width:50%; height:33%;' },
            { dir: 'left', symbol: '◀', style: 'top:33%; left:0; width:25%; height:34%;' },
            { dir: 'right', symbol: '▶', style: 'top:33%; right:0; width:25%; height:34%;' }
        ];
        
        // Create each zone with improved styling and multiple handlers
        zones.forEach(zone => {
            const el = document.createElement('div');
            el.className = `direct-tap-zone direct-tap-${zone.dir}`;
            el.style.cssText = `
                position: absolute;
                ${zone.style}
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                background-color: transparent;
                border: none;
                color: rgba(255,255,255,0.15);
                font-size: 20px;
                touch-action: none;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
            `;
            el.textContent = zone.symbol;
            container.appendChild(el);
            
            // Add multiple event handlers for maximum compatibility
            
            // Click event
            el.addEventListener('click', function(e) {
                if (e) e.preventDefault();
                console.log(`DIRECT TAP: ${zone.dir} clicked`);
                handleDirection(zone.dir);
            });
            
            // Direct property assignment
            el.onclick = function(e) {
                if (e) e.preventDefault();
                handleDirection(zone.dir);
                return false;
            };
            
            // Touch events with visual feedback
            el.addEventListener('touchstart', function(e) {
                if (e) e.preventDefault();
                this.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }, {passive: false});
            
            el.addEventListener('touchend', function(e) {
                if (e) e.preventDefault();
                this.style.backgroundColor = 'transparent';
                console.log(`DIRECT TAP: ${zone.dir} touch`);
                handleDirection(zone.dir);
            }, {passive: false});
        });
        
        console.log("DIRECT TAP: Controller created as primary tap interface");
        
        // Helper function to send direction commands
        function handleDirection(direction) {
            // Try global handleDirection function first
            if (typeof window.handleDirection === 'function') {
                window.handleDirection(direction);
                return;
            }
            
            // Fall back to direction queue if available
            if (window.directionQueue && Array.isArray(window.directionQueue)) {
                let dx = 0, dy = 0;
                let gridSize = window.gridSize || 20; // Get grid size or use default
                
                switch(direction) {
                    case 'up': dy = -gridSize; break;
                    case 'down': dy = gridSize; break;
                    case 'left': dx = -gridSize; break;
                    case 'right': dx = gridSize; break;
                }
                window.directionQueue.push({dx, dy});
                console.log(`DIRECT TAP: Queued ${direction}`);
            }
        }
    }
    
    // Function to update position when canvas changes
    function updateTapPosition() {
        const canvas = document.getElementById('gameCanvas');
        const container = document.getElementById('directTapController');
        
        if (!canvas || !container) return;
        
        // Update container position to match canvas
        container.style.top = `${canvas.offsetTop}px`;
        container.style.left = `${canvas.offsetLeft}px`;
        container.style.width = `${canvas.offsetWidth}px`;
        container.style.height = `${canvas.offsetHeight}px`;
    }
    
    // Add various event listeners to keep controls aligned
    window.addEventListener('resize', updateTapPosition);
    window.addEventListener('orientationchange', () => {
        // Check multiple times after orientation change
        setTimeout(updateTapPosition, 300);
        setTimeout(updateTapPosition, 1000);
    });
    
    // Expose functions to window for external access
    window.reinitDirectTapController = initDirectTapController;
    window.updateTapPosition = updateTapPosition;
    
    // Make our handleDirection available
    window.triggerDirection = function(direction) {
        const container = document.getElementById('directTapController');
        if (container) {
            const el = container.querySelector(`.direct-tap-${direction}`);
            if (el && el.click) {
                el.click();
            }
        }
    };
    
    // Initialize after load
    window.addEventListener('load', function() {
        setTimeout(initDirectTapController, 500);
        setTimeout(updateTapPosition, 600);
    });
    
    // Also init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initDirectTapController, 100);
    });
})();
