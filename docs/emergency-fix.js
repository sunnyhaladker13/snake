/**
 * Critical Emergency Fix for Mobile Tap Zones
 * This direct, simplified approach solves tap zone positioning issues
 */

(function() {
    console.log("EMERGENCY TAP FIX: Initializing (improved version)");
    
    function fixTapZones() {
        console.log("EMERGENCY TAP FIX: Running fix");
        
        // Get critical elements
        const gameArea = document.querySelector('.game-area');
        const canvas = document.getElementById('gameCanvas');
        
        if (!gameArea || !canvas) {
            console.error("EMERGENCY TAP FIX: Could not find game area or canvas");
            return false;
        }
        
        // Get canvas position and dimensions
        const canvasRect = canvas.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        console.log("EMERGENCY TAP FIX: Canvas position:", {
            top: canvasRect.top,
            left: canvasRect.left,
            width: canvasRect.width,
            height: canvasRect.height,
            bottom: canvasRect.bottom,
            right: canvasRect.right
        });
        
        // Get or create tap controls container
        let tapControls = document.querySelector('.tap-controls');
        if (!tapControls) {
            console.log("EMERGENCY TAP FIX: Creating new tap-controls container");
            tapControls = document.createElement('div');
            tapControls.className = 'tap-controls';
            gameArea.appendChild(tapControls);
        }
        
        // Position the tap controls exactly over the canvas
        // Calculate position relative to game area
        const topOffset = canvasRect.top - gameAreaRect.top;
        const leftOffset = canvasRect.left - gameAreaRect.left;
        
        // Apply critical positioning to container - absolute position using exact pixel values
        tapControls.style.cssText = `
            position: absolute !important;
            top: ${topOffset}px !important;
            left: ${leftOffset}px !important;
            width: ${canvasRect.width}px !important;
            height: ${canvasRect.height}px !important;
            z-index: 100 !important;
            pointer-events: none !important;
            display: block !important;
        `;
        
        console.log("EMERGENCY TAP FIX: Positioned tap controls at:", {
            top: topOffset + "px",
            left: leftOffset + "px",
            width: canvasRect.width + "px",
            height: canvasRect.height + "px"
        });
        
        // Tap zone definitions
        const zones = [
            { id: 'tapUp', dir: 'up', css: 'top:0; left:25%; width:50%; height:33%;', text: '▲' },
            { id: 'tapDown', dir: 'down', css: 'bottom:0; left:25%; width:50%; height:33%;', text: '▼' },
            { id: 'tapLeft', dir: 'left', css: 'top:33%; left:0; width:25%; height:34%;', text: '◀' },
            { id: 'tapRight', dir: 'right', css: 'top:33%; right:0; width:25%; height:34%;', text: '▶' }
        ];
        
        // Process each zone
        zones.forEach(zone => {
            // Get or create the element
            let el = document.getElementById(zone.id);
            if (!el) {
                console.log(`EMERGENCY TAP FIX: Creating ${zone.id}`);
                el = document.createElement('div');
                el.id = zone.id;
                el.className = `tap-zone tap-${zone.dir}`;
                tapControls.appendChild(el);
            }
            
            // Apply core styles
            el.style.cssText = `
                position: absolute !important;
                ${zone.css}
                pointer-events: auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 24px !important;
                color: rgba(255, 255, 255, 0.7) !important;
                background-color: rgba(255, 255, 255, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                z-index: 110 !important;
            `;
            el.textContent = zone.text;
            
            // Set up event handlers - make them direct and simple
            el.onclick = function(e) {
                if (e) e.stopPropagation();
                console.log(`EMERGENCY TAP FIX: Clicked ${zone.dir}`);
                if (window.handleDirection) window.handleDirection(zone.dir);
            };
            
            // Use both touchstart/end and direct onclick for maximum compatibility
            el.ontouchstart = function(e) {
                if (e && e.preventDefault) e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            };
            
            el.ontouchend = function(e) {
                if (e && e.preventDefault) e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                console.log(`EMERGENCY TAP FIX: Touch on ${zone.dir}`);
                if (window.handleDirection) window.handleDirection(zone.dir);
            };
        });
        
        // Make sure tap zones are visible by adding debug function
        window.showTapZones = function(show) {
            const visibility = show ? '0.3' : '0.1';
            zones.forEach(zone => {
                const el = document.getElementById(zone.id);
                if (el) {
                    el.style.backgroundColor = `rgba(255, 255, 255, ${visibility})`;
                    el.style.border = show ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.3)';
                }
            });
            return "Tap zones " + (show ? "highlighted" : "normal");
        };
        
        console.log("EMERGENCY TAP FIX: Fix applied successfully (call window.showTapZones(true) to highlight)");
        return true;
    }
    
    // Run immediately 
    fixTapZones();
    
    // And also after everything is loaded
    window.addEventListener('load', function() {
        setTimeout(fixTapZones, 500);
    });
    
    // Add a resize listener to ensure tap zones stay aligned with canvas
    window.addEventListener('resize', function() {
        setTimeout(fixTapZones, 100);
    });
    
    // Also reposition after orientation changes
    window.addEventListener('orientationchange', function() {
        // Wait longer for orientation change as it takes time to complete
        setTimeout(fixTapZones, 300);
    });
    
    // Make available globally
    window.emergencyTapFix = fixTapZones;
    
    // Add a verification function that users can call from the console
    window.verifyTapZones = function() {
        const canvas = document.getElementById('gameCanvas');
        const tapControls = document.querySelector('.tap-controls');
        
        if (!canvas || !tapControls) {
            console.error("Canvas or tap controls not found");
            return false;
        }
        
        const canvasRect = canvas.getBoundingClientRect();
        const tapRect = tapControls.getBoundingClientRect();
        
        const result = {
            canvasPosition: {
                top: canvasRect.top,
                left: canvasRect.left,
                width: canvasRect.width,
                height: canvasRect.height
            },
            tapControlsPosition: {
                top: tapRect.top,
                left: tapRect.left,
                width: tapRect.width,
                height: tapRect.height
            },
            alignment: {
                topDiff: Math.abs(canvasRect.top - tapRect.top),
                leftDiff: Math.abs(canvasRect.left - tapRect.left),
                widthDiff: Math.abs(canvasRect.width - tapRect.width),
                heightDiff: Math.abs(canvasRect.height - tapRect.height)
            }
        };
        
        const isAligned = result.alignment.topDiff < 5 && 
                          result.alignment.leftDiff < 5 && 
                          result.alignment.widthDiff < 5 && 
                          result.alignment.heightDiff < 5;
                          
        console.log("Tap zones aligned with canvas:", isAligned ? "YES ✅" : "NO ❌");
        console.table(result.alignment);
        
        if (!isAligned) {
            console.log("Fixing alignment...");
            fixTapZones();
            return "Attempted to fix alignment issues";
        }
        
        return "Tap zones are properly aligned";
    };
})();
