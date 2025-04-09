/**
 * Direct Tap Controller
 * 
 * A simple, reliable tap controller that directly overlays the canvas
 * and works regardless of other mobile control systems
 */

(function() {
    console.log("DIRECT TAP: Initializing minimal tap controller");
    
    // Only run initialization after a short delay to let other systems initialize first
    setTimeout(function() {
        initDirectTapController();
    }, 1000);
    
    function initDirectTapController() {
        // Get canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.log("DIRECT TAP: No canvas found, waiting...");
            setTimeout(initDirectTapController, 1000);
            return;
        }
        
        // Remove any existing controller to avoid duplication
        const existingController = document.getElementById('directTapController');
        if (existingController) {
            existingController.parentNode.removeChild(existingController);
        }
        
        // Get canvas dimensions and position
        const canvasRect = canvas.getBoundingClientRect();
        
        // Create a container that's positioned directly over the canvas
        const container = document.createElement('div');
        container.id = 'directTapController';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 500;
            pointer-events: none;
        `;
        
        // Add to canvas parent
        canvas.parentNode.appendChild(container);
        
        // Create four tap zones (up, down, left, right)
        const zones = [
            { dir: 'up', symbol: '▲', style: 'top:0; left:25%; width:50%; height:33%;' },
            { dir: 'down', symbol: '▼', style: 'bottom:0; left:25%; width:50%; height:33%;' },
            { dir: 'left', symbol: '◀', style: 'top:33%; left:0; width:25%; height:34%;' },
            { dir: 'right', symbol: '▶', style: 'top:33%; right:0; width:25%; height:34%;' }
        ];
        
        // Create each zone
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
                background-color: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.3);
                font-size: 16px;
            `;
            el.textContent = zone.symbol;
            container.appendChild(el);
            
            // Add minimal click handler - just one reliable method
            el.onclick = function(e) {
                if (e) e.preventDefault();
                console.log(`DIRECT TAP: ${zone.dir}`);
                handleDirection(zone.dir);
            };
        });
        
        console.log("DIRECT TAP: Controller created");
        
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
                switch(direction) {
                    case 'up': dy = -24; break;    // Use large grid size to be safe
                    case 'down': dy = 24; break;
                    case 'left': dx = -24; break;
                    case 'right': dx = 24; break;
                }
                window.directionQueue.push({dx, dy});
                console.log(`DIRECT TAP: Queued ${direction}`);
            }
        }
    }
    
    // Expose a reinit function to window
    window.reinitDirectTapController = initDirectTapController;
    
    // Initialize after load
    window.addEventListener('load', function() {
        setTimeout(initDirectTapController, 500);
    });
})();
