/**
 * Direct Canvas Tap Fix
 * This script creates tap zones that are absolutely positioned over the canvas
 * and completely bypasses the tap-controls system to ensure reliability
 */

(function() {
    console.log("CANVAS TAP FIX: Initializing");
    
    function createDirectTapControls() {
        // Get the canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("CANVAS TAP FIX: Canvas not found!");
            return false;
        }
        
        // Get or create the container for our new tap zones
        let directTapContainer = document.getElementById('directTapContainer');
        if (!directTapContainer) {
            directTapContainer = document.createElement('div');
            directTapContainer.id = 'directTapContainer';
            canvas.parentNode.appendChild(directTapContainer);
        }
        
        // Position the container directly over the canvas
        setupContainerPosition();
        
        // Create the tap zones with direct positioning
        createTapZones();
        
        // Add window resize handler to keep them positioned correctly
        window.addEventListener('resize', function() {
            setupContainerPosition();
        });
        
        window.addEventListener('orientationchange', function() {
            setTimeout(setupContainerPosition, 500);
        });
        
        function setupContainerPosition() {
            // Get fresh canvas position
            const canvasRect = canvas.getBoundingClientRect();
            
            // Directly position container over canvas
            directTapContainer.style.cssText = `
                position: absolute;
                top: ${canvas.offsetTop}px;
                left: ${canvas.offsetLeft}px;
                width: ${canvas.offsetWidth}px;
                height: ${canvas.offsetHeight}px;
                z-index: 2000; /* Very high to ensure it's on top */
                pointer-events: none; /* Let events pass through by default */
                touch-action: none;
            `;
            
            console.log("CANVAS TAP FIX: Positioned container at:", {
                top: canvas.offsetTop + 'px',
                left: canvas.offsetLeft + 'px', 
                width: canvas.offsetWidth + 'px',
                height: canvas.offsetHeight + 'px'
            });
        }
        
        function createTapZones() {
            // Remove any existing zones
            directTapContainer.innerHTML = '';
            
            // Tap zone definitions
            const zones = [
                { id: 'directUp', dir: 'up', text: '▲', styles: 'top:0; left:25%; width:50%; height:33%' },
                { id: 'directDown', dir: 'down', text: '▼', styles: 'bottom:0; left:25%; width:50%; height:33%' },
                { id: 'directLeft', dir: 'left', text: '◀', styles: 'top:33%; left:0; width:25%; height:34%' },
                { id: 'directRight', dir: 'right', text: '▶', styles: 'top:33%; right:0; width:25%; height:34%' }
            ];
            
            // Create each zone
            zones.forEach(zone => {
                const el = document.createElement('div');
                el.id = zone.id;
                el.setAttribute('data-direction', zone.dir);
                
                el.style.cssText = `
                    position: absolute;
                    ${zone.styles};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    background-color: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 24px;
                    touch-action: none;
                    -webkit-tap-highlight-color: transparent;
                    user-select: none;
                    border: 2px dashed rgba(255, 255, 255, 0.3);
                `;
                
                el.textContent = zone.text;
                directTapContainer.appendChild(el);
                
                // Add click and touch handlers
                el.addEventListener('click', createDirectionHandler(zone.dir));
                el.addEventListener('touchstart', handleTouchStart, {passive: false});
                el.addEventListener('touchend', createTouchEndHandler(zone.dir), {passive: false});
                
                console.log(`CANVAS TAP FIX: Created ${zone.id} zone`);
            });
            
            function createDirectionHandler(dir) {
                return function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`CANVAS TAP FIX: Handling ${dir} direction`);
                    if (window.handleDirection) {
                        window.handleDirection(dir);
                    }
                };
            }
            
            function handleTouchStart(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
            }
            
            function createTouchEndHandler(dir) {
                return function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    console.log(`CANVAS TAP FIX: Handling ${dir} touch`);
                    if (window.handleDirection) {
                        window.handleDirection(dir);
                    }
                };
            }
        }
        
        console.log("CANVAS TAP FIX: Setup complete");
        return true;
    }
    
    // Run the setup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(createDirectTapControls, 500);
        });
    } else {
        setTimeout(createDirectTapControls, 100);
    }
    
    // Also run after window load
    window.addEventListener('load', function() {
        setTimeout(createDirectTapControls, 500);
    });
    
    // Make function available globally
    window.createDirectTapControls = createDirectTapControls;
    
    // Add debug helper
    window.highlightDirectTaps = function(highlight) {
        const container = document.getElementById('directTapContainer');
        if (container) {
            const zones = container.querySelectorAll('div');
            zones.forEach(zone => {
                if (highlight) {
                    zone.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                    zone.style.border = '2px solid white';
                } else {
                    zone.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    zone.style.border = '2px dashed rgba(255, 255, 255, 0.3)';
                }
            });
            return `Direct tap zones are now ${highlight ? 'highlighted' : 'normal'}`;
        }
        return "Direct tap container not found";
    };
})();
