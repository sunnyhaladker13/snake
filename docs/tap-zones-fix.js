/**
 * Tap Zones Fix
 * This script ensures the game has working tap zones regardless of
 * whether the unified controls or original controls are active
 */

(function() {
    console.log("TAP ZONES FIX: Initializing");
    
    // Function to create missing tap zones if needed
    function ensureTapZonesExist() {
        // Reduced log noise - only log when there's an issue to fix
        let tapControls = document.querySelector('.tap-controls');
        let needsCreation = false;
        
        if (!tapControls) {
            const gameArea = document.querySelector('.game-area');
            if (!gameArea) {
                console.error("TAP ZONES FIX: Game area not found!");
                return false;
            }
            
            // Create the tap controls container
            tapControls = document.createElement('div');
            tapControls.className = 'tap-controls';
            tapControls.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
                pointer-events: none;
            `;
            gameArea.appendChild(tapControls);
            console.log("TAP ZONES FIX: Created tap-controls container");
            needsCreation = true;
        }
        
        // Define all needed tap zones
        const zones = [
            { id: 'tapUp', dir: 'up', symbol: '▲', position: 'top:0; left:25%; width:50%; height:33%' },
            { id: 'tapDown', dir: 'down', symbol: '▼', position: 'bottom:0; left:25%; width:50%; height:33%' },
            { id: 'tapLeft', dir: 'left', symbol: '◀', position: 'top:33%; left:0; width:25%; height:34%' },
            { id: 'tapRight', dir: 'right', symbol: '▶', position: 'top:33%; right:0; width:25%; height:34%' }
        ];
        
        // Create each tap zone if it doesn't exist
        let createdCount = 0;
        zones.forEach(zone => {
            let tapZone = document.getElementById(zone.id);
            
            if (!tapZone) {
                tapZone = document.createElement('div');
                tapZone.id = zone.id;
                tapZone.className = `tap-zone tap-${zone.dir}`;
                tapControls.appendChild(tapZone);
                createdCount++;
                needsCreation = true;
                
                // Apply styling
                tapZone.style.cssText = `
                    position: absolute;
                    ${zone.position};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    font-size: 24px;
                    color: rgba(255, 255, 255, 0.5);
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                `;
                
                // Add the symbol content
                tapZone.textContent = zone.symbol;
            }
            
            // Make sure handlers are assigned
            assignHandlers(tapZone, zone.dir);
        });
        
        if (needsCreation && createdCount > 0) {
            console.log(`TAP ZONES FIX: Created ${createdCount} missing tap zones`);
        }
        
        return true;
    }
    
    // Function to ensure handlers are assigned
    function assignHandlers(element, direction) {
        // Create handler function
        function directionHandler(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log(`TAP ZONES FIX: ${direction} tapped`);
            triggerDirection(direction);
        }
        
        // Clear existing handlers
        element.onclick = null;
        element.ontouchend = null;
        
        // Add multiple handlers for maximum compatibility
        element.addEventListener('click', directionHandler);
        element.addEventListener('touchend', directionHandler);
        
        // Also assign direct properties
        element.onclick = directionHandler;
        element.ontouchend = directionHandler;
        
        // Add inline handler
        element.setAttribute('onclick', `triggerDirection('${direction}'); return false;`);
    }
    
    // Function to trigger direction changes
    function triggerDirection(direction) {
        // Try game's handleDirection function first
        if (typeof window.handleDirection === 'function') {
            window.handleDirection(direction);
            return;
        }
        
        // Fallback to directionQueue
        if (window.directionQueue && Array.isArray(window.directionQueue)) {
            let dx = 0, dy = 0;
            
            switch(direction) {
                case 'up': dy = -window.gridSize || -20; break;
                case 'down': dy = window.gridSize || 20; break;
                case 'left': dx = -window.gridSize || -20; break;
                case 'right': dx = window.gridSize || 20; break;
            }
            
            window.directionQueue.push({dx, dy});
            console.log(`TAP ZONES FIX: Direction queued: ${direction}`);
        } else {
            console.error("TAP ZONES FIX: No way to handle direction!");
        }
    }
    
    // Expose triggerDirection globally
    window.triggerDirection = triggerDirection;
    
    // Run on load events
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(ensureTapZonesExist, 300);
        });
    } else {
        setTimeout(ensureTapZonesExist, 100);
    }
    
    // Also run after full load
    window.addEventListener('load', function() {
        setTimeout(ensureTapZonesExist, 500);
        setTimeout(ensureTapZonesExist, 1500);
    });
    
    // Run immediately
    ensureTapZonesExist();
    
    // Add debug utility
    window.debugTapZones = function() {
        ensureTapZonesExist();
        
        // Highlight the zones
        document.querySelectorAll('.tap-zone').forEach(zone => {
            zone.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            zone.style.border = '2px solid white';
            zone.style.color = 'white';
            zone.style.fontSize = '28px';
        });
        
        return "Tap zones highlighted for debugging";
    };
    
    console.log("TAP ZONES FIX: Initialization complete");
})();
