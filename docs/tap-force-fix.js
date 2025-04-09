/**
 * Force Fix for Tap Zones
 * This script will run after all other scripts and force the tap zones
 * to be correctly positioned over the canvas element
 */

(function() {
    console.log("TAP FORCE FIX: Loading");
    
    // Function to force the absolute tap zones to be recreated
    function forceFixTapZones() {
        console.log("TAP FORCE FIX: Running force fix");
        
        // Wait for the canvas to be fully loaded and sized
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("TAP FORCE FIX: Canvas not found");
            return false;
        }
        
        // Get canvas dimensions and position
        const rect = canvas.getBoundingClientRect();
        console.log("TAP FORCE FIX: Canvas position:", rect);
        
        // First try using the recreateAbsoluteTapControls function if available
        if (typeof window.recreateAbsoluteTapControls === 'function') {
            console.log("TAP FORCE FIX: Using absolute tap controls recreation");
            window.recreateAbsoluteTapControls();
            return true;
        }
        
        // Fallback to creating our own controls
        console.log("TAP FORCE FIX: Absolute tap controls not available, creating custom zones");
        
        // Remove any existing force fix container
        const oldContainer = document.getElementById('forceFixContainer');
        if (oldContainer) {
            oldContainer.remove();
        }
        
        // Create a container positioned directly over the canvas
        const container = document.createElement('div');
        container.id = 'forceFixContainer';
        container.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(container);
        
        // Create zones
        const zones = [
            { dir: 'up', position: 'top: 0; left: 25%; width: 50%; height: 33%', text: '▲' },
            { dir: 'down', position: 'bottom: 0; left: 25%; width: 50%; height: 33%', text: '▼' },
            { dir: 'left', position: 'top: 33%; left: 0; width: 25%; height: 34%', text: '◀' },
            { dir: 'right', position: 'top: 33%; right: 0; width: 25%; height: 34%', text: '▶' }
        ];
        
        // Create each zone element
        zones.forEach(zone => {
            const el = document.createElement('div');
            el.className = `force-fix-zone force-${zone.dir}`;
            el.style.cssText = `
                position: absolute;
                ${zone.position};
                pointer-events: auto;
                background-color: rgba(255, 100, 100, 0.3);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                border: 2px solid white;
            `;
            
            el.textContent = zone.text;
            container.appendChild(el);
            
            // Add multiple event handlers
            el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`TAP FORCE FIX: Clicked ${zone.dir}`);
                if (window.handleDirection) {
                    window.handleDirection(zone.dir);
                }
            });
            
            el.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 100, 100, 0.5)';
            }, {passive: false});
            
            el.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 100, 100, 0.3)';
                if (window.handleDirection) {
                    window.handleDirection(zone.dir);
                }
            }, {passive: false});
        });
        
        // Set a timeout to hide the debugging visuals after a few seconds
        setTimeout(function() {
            container.querySelectorAll('.force-fix-zone').forEach(zone => {
                zone.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                zone.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            });
        }, 3000);
        
        console.log("TAP FORCE FIX: Created custom tap zones");
        return true;
    }
    
    // Make the function globally available
    window.forceFixTapZones = forceFixTapZones;
    
    // Run the force fix with increasing delays to ensure it works
    const delays = [1000, 2000, 3000, 5000];
    delays.forEach(delay => {
        setTimeout(forceFixTapZones, delay);
    });
    
    // Always run it after orientation changes and resizes
    window.addEventListener('resize', function() {
        setTimeout(forceFixTapZones, 500);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(forceFixTapZones, 1000);
    });
    
    // Run on load too
    window.addEventListener('load', function() {
        setTimeout(forceFixTapZones, 1000);
        setTimeout(forceFixTapZones, 3000);
    });
    
    console.log("TAP FORCE FIX: Initialized, will run at multiple intervals");
})();
