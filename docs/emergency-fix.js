/**
 * Critical Emergency Fix for Mobile Tap Zones
 * This direct, simplified approach solves tap zone positioning issues
 */

(function() {
    console.log("EMERGENCY TAP FIX: Initializing (improved direct-overlay version)");
    
    function fixTapZones() {
        console.log("EMERGENCY TAP FIX: Running direct-overlay fix");
        
        // Get the critical elements
        const canvas = document.getElementById('gameCanvas');
        const gameArea = document.querySelector('.game-area');
        
        if (!canvas || !gameArea) {
            console.error("EMERGENCY TAP FIX: Critical elements not found");
            return false;
        }
        
        // Get dimensions
        const canvasRect = canvas.getBoundingClientRect();
        
        // CRITICAL CHANGE: Create a completely new tap controls container
        // Remove any existing tap controls first
        const oldControls = document.querySelector('.tap-controls');
        if (oldControls) {
            oldControls.parentNode.removeChild(oldControls);
            console.log("EMERGENCY TAP FIX: Removed old tap controls");
        }
        
        // Create fresh tap controls directly on the canvas
        const tapControls = document.createElement('div');
        tapControls.className = 'tap-controls';
        tapControls.id = 'tapControls';
        
        // Style it to exactly match the canvas
        tapControls.style.cssText = `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1000 !important;
            pointer-events: none !important;
            display: block !important;
            touch-action: none !important;
        `;
        
        // Insert it directly inside the canvas's parent
        canvas.parentNode.appendChild(tapControls);
        
        // Position it to overlay the canvas perfectly
        positionTapControlsOverCanvas(tapControls, canvas);
        
        console.log("EMERGENCY TAP FIX: New tap controls created and positioned");
        
        // Define tap zones
        const zones = [
            { id: 'tapUp', dir: 'up', text: '▲', pos: {top: '0%', left: '25%', width: '50%', height: '33%'} },
            { id: 'tapDown', dir: 'down', text: '▼', pos: {top: '67%', left: '25%', width: '50%', height: '33%'} },
            { id: 'tapLeft', dir: 'left', text: '◀', pos: {top: '33%', left: '0%', width: '25%', height: '34%'} },
            { id: 'tapRight', dir: 'right', text: '▶', pos: {top: '33%', left: '75%', width: '25%', height: '34%'} }
        ];
        
        // Create each tap zone
        zones.forEach(zone => {
            const el = document.createElement('div');
            el.id = zone.id;
            el.className = `tap-zone tap-${zone.dir}`;
            
            // Position and style the tap zone
            el.style.cssText = `
                position: absolute !important;
                top: ${zone.pos.top} !important;
                left: ${zone.pos.left} !important;
                width: ${zone.pos.width} !important;
                height: ${zone.pos.height} !important;
                pointer-events: auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 24px !important;
                color: rgba(255, 255, 255, 0.7) !important;
                background-color: rgba(255, 255, 255, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                z-index: 1010 !important;
                user-select: none !important;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent !important;
            `;
            
            el.textContent = zone.text;
            tapControls.appendChild(el);
            
            // Add multiple event handlers for maximum compatibility
            el.setAttribute('onclick', `window.handleDirection('${zone.dir}'); event.preventDefault(); return false;`);
            
            el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`EMERGENCY TAP FIX: Clicked ${zone.dir}`);
                if (window.handleDirection) window.handleDirection(zone.dir);
            }, false);
            
            el.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }, {passive: false});
            
            el.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                console.log(`EMERGENCY TAP FIX: Touch on ${zone.dir}`);
                if (window.handleDirection) window.handleDirection(zone.dir);
            }, {passive: false});
            
            console.log(`EMERGENCY TAP FIX: Created ${zone.id}`);
        });
        
        console.log("EMERGENCY TAP FIX: All zones created and positioned");
        
        return true;
    }
    
    // Helper function to position tap controls precisely over canvas
    function positionTapControlsOverCanvas(tapControls, canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        
        // Position using the canvas position and size
        const overlayStyle = {
            position: 'absolute',
            top: canvas.offsetTop + 'px',
            left: canvas.offsetLeft + 'px',
            width: canvas.offsetWidth + 'px',
            height: canvas.offsetHeight + 'px',
            zIndex: 1000
        };
        
        // Apply styles
        Object.assign(tapControls.style, overlayStyle);
        
        console.log("EMERGENCY TAP FIX: Positioned tap controls at:", {
            top: overlayStyle.top,
            left: overlayStyle.left,
            width: overlayStyle.width,
            height: overlayStyle.height
        });
    }
    
    // Execute fix
    fixTapZones();
    
    // Re-run when everything is fully loaded
    window.addEventListener('load', function() {
        setTimeout(fixTapZones, 500);
    });
    
    // Re-run on resize and orientation change
    window.addEventListener('resize', function() {
        setTimeout(fixTapZones, 200);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(fixTapZones, 500);
    });
    
    // Make functions available globally
    window.emergencyTapFix = fixTapZones;
    
    // Add utility to toggle visibility for debugging
    window.toggleTapZonesVisibility = function(visible) {
        const opacity = visible ? '0.3' : '0.1';
        const borderWidth = visible ? '3px' : '1px';
        
        document.querySelectorAll('.tap-zone').forEach(zone => {
            zone.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
            zone.style.border = `${borderWidth} solid rgba(255, 255, 255, ${visible ? '0.8' : '0.3'})`;
        });
        
        return `Tap zones ${visible ? 'highlighted' : 'normal'}`;
    };
    
    // Add a backup handleDirection function if it doesn't exist
    if (typeof window.handleDirection !== 'function') {
        window.handleDirection = function(dir) {
            console.log(`EMERGENCY direction handler: ${dir}`);
            if (window.directionQueue) {
                let dx = 0, dy = 0;
                switch(dir) {
                    case 'up': dy = -20; break;
                    case 'down': dy = 20; break;
                    case 'left': dx = -20; break;
                    case 'right': dx = 20; break;
                }
                window.directionQueue.push({dx, dy});
                console.log("Direction queued:", dir);
            }
        };
    }
})();
