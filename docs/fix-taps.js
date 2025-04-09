/**
 * Emergency tap zone fix - standalone script
 * This script ensures the tap controls work on mobile devices by:
 * 1. Positioning them correctly over the canvas
 * 2. Attaching proper event handlers
 * 3. Making them visible
 */

(function() {
    console.log("Running emergency tap zone fix");
    
    function fixTapZones() {
        console.log("Fixing tap zones");
        
        // Get canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("Canvas not found");
            return;
        }
        
        // Get canvas position
        const gameArea = document.querySelector('.game-area');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Log canvas position
        console.log("Canvas position:", {
            top: canvasRect.top,
            left: canvasRect.left,
            width: canvasRect.width,
            height: canvasRect.height
        });
        
        // Get or create tap controls container
        let tapControls = document.getElementById('tapControls');
        if (!tapControls) {
            tapControls = document.createElement('div');
            tapControls.id = 'tapControls';
            tapControls.className = 'tap-controls';
            gameArea.appendChild(tapControls);
            console.log("Created tap controls container");
        }
        
        // Position tap controls directly over the canvas
        tapControls.style.position = 'absolute';
        tapControls.style.top = '0';
        tapControls.style.left = '0';
        tapControls.style.width = '100%';
        tapControls.style.height = '100%';
        tapControls.style.zIndex = '100';
        tapControls.style.pointerEvents = 'none';
        
        // Define the directions and their positions
        const directions = [
            { id: 'tapUp', dir: 'up', html: '▲', pos: { top: 0, left: '25%', width: '50%', height: '33%' } },
            { id: 'tapDown', dir: 'down', html: '▼', pos: { bottom: 0, left: '25%', width: '50%', height: '33%' } },
            { id: 'tapLeft', dir: 'left', html: '◀', pos: { top: '33%', left: 0, width: '25%', height: '34%' } },
            { id: 'tapRight', dir: 'right', html: '▶', pos: { top: '33%', right: 0, width: '25%', height: '34%' } }
        ];
        
        // Create or update each tap zone
        directions.forEach(item => {
            // Get or create the element
            let zone = document.getElementById(item.id);
            if (!zone) {
                zone = document.createElement('div');
                zone.id = item.id;
                zone.className = `tap-zone tap-${item.dir}`;
                tapControls.appendChild(zone);
                console.log(`Created ${item.id} element`);
            }
            
            // Style the element
            zone.style.position = 'absolute';
            zone.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            zone.style.color = 'rgba(255, 255, 255, 0.6)';
            zone.style.display = 'flex';
            zone.style.alignItems = 'center';
            zone.style.justifyContent = 'center';
            zone.style.fontSize = '24px';
            zone.style.pointerEvents = 'auto';
            zone.style.cursor = 'pointer';
            zone.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            
            // Position the element
            Object.entries(item.pos).forEach(([key, value]) => {
                zone.style[key] = value;
            });
            
            // Set content
            zone.innerHTML = item.html;
            
            // Add event handlers
            zone.onclick = function(e) {
                e.preventDefault();
                console.log(`Clicked ${item.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(item.dir);
                }
            };
            
            zone.ontouchend = function(e) {
                e.preventDefault();
                console.log(`Touched ${item.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(item.dir);
                }
            };
        });
        
        console.log("Tap zones fixed");
    }
    
    // Run on load and after a short delay
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(fixTapZones, 500));
    } else {
        setTimeout(fixTapZones, 500);
    }
    
    // Also try immediately
    fixTapZones();
    
    // Try again after 1 second for good measure
    setTimeout(fixTapZones, 1000);
    
    // Expose the function globally
    window.fixTapZones = fixTapZones;
})();
