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
        
        // Position tap controls precisely over the canvas
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
            
            // Reset all event handlers first to avoid duplication
            zone.replaceWith(zone.cloneNode(true));
            zone = document.getElementById(item.id);
            
            // Style the element - make it very visible for debugging
            zone.style.position = 'absolute';
            zone.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            zone.style.color = 'rgba(255, 255, 255, 0.8)';
            zone.style.display = 'flex';
            zone.style.alignItems = 'center';
            zone.style.justifyContent = 'center';
            zone.style.fontSize = '28px';
            zone.style.pointerEvents = 'auto';
            zone.style.cursor = 'pointer';
            zone.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            zone.style.touchAction = 'none'; // Critical for touch handling
            
            // Position the element
            Object.entries(item.pos).forEach(([key, value]) => {
                zone.style[key] = value;
            });
            
            // Set content
            zone.innerHTML = item.html;
            
            // Add MULTIPLE event handlers for maximum compatibility
            // 1. Direct inline handler
            zone.setAttribute('onclick', `if(window.handleDirection) window.handleDirection('${item.dir}'); console.log('Clicked ${item.dir} via inline')`);
            
            // 2. Standard click event
            zone.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`Clicked ${item.dir} via addEventListener`);
                if (window.handleDirection) {
                    window.handleDirection(item.dir);
                }
            }, false);
            
            // 3. Direct property assignment
            zone.onclick = function(e) {
                console.log(`Clicked ${item.dir} via onclick property`);
                if (window.handleDirection) {
                    window.handleDirection(item.dir);
                }
                return false;
            };
            
            // 4. Touch events
            zone.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                console.log(`Touch started on ${item.dir}`);
            }, {passive: false});
            
            zone.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                console.log(`Touch ended on ${item.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(item.dir);
                }
            }, {passive: false});
            
            // 5. Mouse events for good measure
            zone.addEventListener('mousedown', function(e) {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            });
            
            zone.addEventListener('mouseup', function(e) {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            });
            
            // Expose to window for direct access
            window[`tap${item.dir.charAt(0).toUpperCase() + item.dir.slice(1)}`] = function() {
                console.log(`Manual tap on ${item.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(item.dir);
                }
            };
        });
        
        // Add debug function to window
        window.checkTapZones = function() {
            const zones = {};
            directions.forEach(item => {
                const zone = document.getElementById(item.id);
                zones[item.dir] = {
                    exists: !!zone,
                    visible: zone ? window.getComputedStyle(zone).display !== 'none' : false,
                    position: zone ? zone.getBoundingClientRect() : null,
                    events: zone ? {
                        click: typeof zone.onclick === 'function',
                        touch: typeof zone.ontouchend === 'function'
                    } : null
                };
            });
            console.table(zones);
            return zones;
        };
        
        console.log("Tap zones fixed - call window.checkTapZones() to verify");
    }
    
    // Expose function to window
    window.fixTapZones = fixTapZones;
    
    // Wait a bit for DOM to stabilize then fix tap zones
    setTimeout(fixTapZones, 500);
    
    // Also run on DOM content loaded
    document.addEventListener('DOMContentLoaded', () => setTimeout(fixTapZones, 1000));
    
    // Run after window load for extra safety
    window.addEventListener('load', () => setTimeout(fixTapZones, 1500));
    
    // Add a global function for mobile debugging
    window.debugTapZones = function() {
        const tapControls = document.getElementById('tapControls');
        if (tapControls) {
            tapControls.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            
            // Make all tap zones very visible
            ['tapUp', 'tapDown', 'tapLeft', 'tapRight'].forEach(id => {
                const zone = document.getElementById(id);
                if (zone) {
                    zone.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                    zone.style.border = '3px solid white';
                    zone.style.color = 'white';
                    zone.style.fontSize = '32px';
                }
            });
            
            console.log("Tap zones highlighted for debugging");
            return true;
        }
        return false;
    };
    
    // Add global handleDirection function if it doesn't exist
    if (typeof window.handleDirection !== 'function') {
        window.handleDirection = function(direction) {
            console.log(`Direction handled: ${direction}`);
            
            // Try to queue the direction if the game has directional controls
            if (window.directionQueue && Array.isArray(window.directionQueue)) {
                let dx = 0, dy = 0;
                
                switch(direction) {
                    case 'up': dy = -20; break;
                    case 'down': dy = 20; break;
                    case 'left': dx = -20; break;
                    case 'right': dx = 20; break;
                }
                
                window.directionQueue.push({dx, dy});
                console.log(`Direction queued: ${direction} (dx=${dx}, dy=${dy})`);
            }
        };
    }
})();
