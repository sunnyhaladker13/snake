/**
 * Force Fix for Tap Zones
 * This script will run after all other scripts and force the tap zones
 * to be correctly positioned over the canvas element
 */

(function() {
    console.log("TAP FORCE FIX: Loading");
    
    function forceFixTapZones() {
        console.log("TAP FORCE FIX: Running force fix");
        
        // Wait for the canvas to be fully loaded and sized
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("TAP FORCE FIX: Canvas not found");
            return false;
        }
        
        // CRITICAL: Get viewport-relative position of the canvas
        const rect = canvas.getBoundingClientRect();
        console.log("TAP FORCE FIX: Canvas position:", rect);
        
        // Clean up - remove any other tap zone containers to avoid conflicts
        ['absoluteTapContainer', 'forceFixContainer'].forEach(id => {
            const old = document.getElementById(id);
            if (old) old.remove();
        });
        
        // Create a container positioned using FIXED positioning relative to the viewport
        // This ensures it stays aligned with the canvas even during scroll/resize
        const container = document.createElement('div');
        container.id = 'fixedTapContainer';
        
        // Use fixed positioning to overlay exactly on top of the canvas in viewport
        container.style.cssText = `
            position: fixed !important;
            top: ${rect.top}px !important;
            left: ${rect.left}px !important;
            width: ${rect.width}px !important;
            height: ${rect.height}px !important;
            z-index: 99999 !important;
            pointer-events: none !important;
            touch-action: none !important;
            transform: translate3d(0,0,0) !important; /* Force GPU acceleration */
            border: none; /* Remove debug border */
        `;
        
        // Attach to body to ensure no other element's positioning affects it
        document.body.appendChild(container);
        
        // Create tap zones with a single, unified approach
        const zones = [
            { dir: 'up', pos: 'top:0; left:25%; width:50%; height:33%', text: '▲' },
            { dir: 'down', pos: 'bottom:0; left:25%; width:50%; height:33%', text: '▼' },
            { dir: 'left', pos: 'top:33%; left:0; width:25%; height:34%', text: '◀' },
            { dir: 'right', pos: 'top:33%; right:0; width:25%; height:34%', text: '▶' }
        ];
        
        zones.forEach(zone => {
            const el = document.createElement('div');
            el.className = `fixed-tap-zone fixed-${zone.dir}`;
            
            // Unified styling with important flags to avoid overrides - now with more subtle borders
            el.style.cssText = `
                position: absolute !important;
                ${zone.pos} !important;
                background-color: rgba(255,255,255,0.1) !important;
                color: rgba(255,255,255,0.3) !important;
                pointer-events: auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 28px !important;
                touch-action: none !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                user-select: none !important;
                z-index: 100000 !important;
                -webkit-tap-highlight-color: transparent !important;
            `;
            
            el.textContent = zone.text;
            container.appendChild(el);
            
            // CRITICAL: Use both event handlers and direct attribute for maximum compatibility
            el.setAttribute('onclick', `window.handleDirection('${zone.dir}')`);
            
            // Modern event listeners
            el.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                window.handleDirection(zone.dir);
            }, {capture: true}); // Use capture to get events first
            
            // Touch events with visual feedback
            el.addEventListener('touchstart', function(e) {
                e.preventDefault(); e.stopPropagation();
                this.style.backgroundColor = 'rgba(255,255,255,0.2)';
                this.style.borderColor = 'rgba(255,255,255,0.2)';
            }, {passive: false, capture: true});
            
            el.addEventListener('touchend', function(e) {
                e.preventDefault(); e.stopPropagation();
                this.style.backgroundColor = 'rgba(255,255,255,0.1)';
                this.style.borderColor = 'rgba(255,255,255,0.1)';
                window.handleDirection(zone.dir);
            }, {passive: false, capture: true});
            
            console.log(`TAP FORCE FIX: Created ${zone.dir} zone`);
        });
        
        // No need to hide debug visuals since we're not showing them anymore
        
        // Add repositioning function when viewport changes
        function updatePosition() {
            const updatedRect = canvas.getBoundingClientRect();
            container.style.top = `${updatedRect.top}px`;
            container.style.left = `${updatedRect.left}px`;
            container.style.width = `${updatedRect.width}px`;
            container.style.height = `${updatedRect.height}px`;
        }
        
        // Add to window object
        window.updateFixedTapZones = updatePosition;
        
        // Add event listeners
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('orientationchange', function() {
            // Multiple checks after orientation change
            setTimeout(updatePosition, 100);
            setTimeout(updatePosition, 500);
            setTimeout(updatePosition, 1000);
        });
        
        console.log("TAP FORCE FIX: Fixed tap zones created and positioned directly over canvas");
        return true;
    }
    
    // Make function available globally
    window.forceFixTapZones = forceFixTapZones;
    
    // Run the fix with increasing delays to ensure it catches the final canvas position
    const delays = [500, 1000, 2000, 3000];
    delays.forEach(delay => {
        setTimeout(forceFixTapZones, delay);
    });
    
    // Add an emergency fix function users can call from console
    window.emergencyTapFix = function() {
        // Remove all existing containers
        document.querySelectorAll('[id$="TapContainer"], [id$="FixContainer"]').forEach(el => el.remove());
        return forceFixTapZones();
    };
    
    // Also run after load events
    window.addEventListener('load', function() {
        setTimeout(forceFixTapZones, 500);
        setTimeout(forceFixTapZones, 2000);
    });
    
    console.log("TAP FORCE FIX: Initialized with multiple timing checks");
})();
