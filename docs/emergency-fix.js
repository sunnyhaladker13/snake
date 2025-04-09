/**
 * Critical Emergency Fix for Mobile Tap Zones
 * This direct, simplified approach solves tap zone positioning issues
 */

(function() {
    console.log("EMERGENCY TAP FIX: Initializing");
    
    function fixTapZones() {
        console.log("EMERGENCY TAP FIX: Running fix");
        
        // Get critical elements
        const gameArea = document.querySelector('.game-area');
        const canvas = document.getElementById('gameCanvas');
        
        if (!gameArea || !canvas) {
            console.error("EMERGENCY TAP FIX: Could not find game area or canvas");
            return false;
        }
        
        // Get or create tap controls container
        let tapControls = document.querySelector('.tap-controls');
        if (!tapControls) {
            console.log("EMERGENCY TAP FIX: Creating new tap-controls container");
            tapControls = document.createElement('div');
            tapControls.className = 'tap-controls';
            gameArea.appendChild(tapControls);
        }
        
        // Apply critical positioning to container
        tapControls.style.cssText = `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 100 !important;
            pointer-events: none !important;
            display: block !important;
        `;
        
        // Tap zone definitions
        const zones = [
            { id: 'tapUp', dir: 'up', css: 'top:0; left:25%; width:50%; height:33%;', text: '▲' },
            { id: 'tapDown', dir: 'down', css: 'top:67%; left:25%; width:50%; height:33%;', text: '▼' },
            { id: 'tapLeft', dir: 'left', css: 'top:33%; left:0; width:25%; height:34%;', text: '◀' },
            { id: 'tapRight', dir: 'right', css: 'top:33%; left:75%; width:25%; height:34%;', text: '▶' }
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
            
            // Set up event handlers
            el.onclick = function() {
                console.log(`EMERGENCY TAP FIX: Tapped ${zone.dir}`);
                if (window.handleDirection) window.handleDirection(zone.dir);
            };
            
            el.ontouchstart = function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            };
            
            el.ontouchend = function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                console.log(`EMERGENCY TAP FIX: Touch on ${zone.dir}`);
                if (window.handleDirection) window.handleDirection(zone.dir);
            };
        });
        
        console.log("EMERGENCY TAP FIX: Fix applied successfully");
        return true;
    }
    
    // Run immediately 
    fixTapZones();
    
    // And also after everything is loaded
    window.addEventListener('load', function() {
        setTimeout(fixTapZones, 500);
    });
    
    // Make available globally
    window.emergencyTapFix = fixTapZones;
})();
