/**
 * Debug utilities for Snake game
 * Add this script to your HTML to help debug touch issues
 */

(function() {
    console.log("Snake debug tools loaded");
    
    // Add a toggle for the tap zone visibility
    window.toggleTapZones = function() {
        const tapControls = document.querySelector('.tap-controls');
        if (!tapControls) {
            console.error("Tap controls element not found");
            return false;
        }
        
        tapControls.classList.toggle('debug');
        console.log("Tap zones debug mode:", tapControls.classList.contains('debug'));
        
        // Show information about tap zones
        const zones = {
            up: document.getElementById('tapUp'),
            down: document.getElementById('tapDown'),
            left: document.getElementById('tapLeft'),
            right: document.getElementById('tapRight')
        };
        
        Object.entries(zones).forEach(([name, element]) => {
            if (element) {
                const rect = element.getBoundingClientRect();
                console.log(`${name} zone:`, {
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    position: rect,
                    visible: window.getComputedStyle(element).display !== 'none'
                });
                
                // Highlight the zone temporarily
                const originalBg = element.style.backgroundColor;
                element.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                setTimeout(() => {
                    element.style.backgroundColor = originalBg;
                }, 1000);
                
                console.log(`${name} zone position:`, element.getBoundingClientRect());
            } else {
                console.error(`${name} zone element not found`);
            }
        });
        
        return tapControls.classList.contains('debug');
    };
    
    // Add a function to fix tap zones
    window.fixTapZones = function() {
        console.log("Attempting to fix tap zones...");
        
        const tapZones = {
            up: document.getElementById('tapUp'),
            down: document.getElementById('tapDown'),
            left: document.getElementById('tapLeft'),
            right: document.getElementById('tapRight')
        };
        
        // Create tap zones if they don't exist
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) {
            console.error("Game area not found");
            return false;
        }
        
        // Check if container exists
        let tapControls = document.querySelector('.tap-controls');
        if (!tapControls) {
            console.log("Creating tap controls container");
            tapControls = document.createElement('div');
            tapControls.className = 'tap-controls';
            gameArea.appendChild(tapControls);
        }
        
        // Check and create each zone
        Object.entries(tapZones).forEach(([name, element]) => {
            if (!element) {
                console.log(`Creating missing ${name} zone`);
                const newZone = document.createElement('div');
                newZone.id = `tap${name.charAt(0).toUpperCase() + name.slice(1)}`;
                newZone.className = `tap-zone tap-${name}`;
                tapControls.appendChild(newZone);
            }
        });
        
        // Add core event listeners
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(dir => {
            const element = document.getElementById(`tap${dir.charAt(0).toUpperCase() + dir.slice(1)}`);
            if (element) {
                // Clear existing listeners
                element.ontouchstart = null;
                element.ontouchend = null;
                
                // Add simple listeners
                element.ontouchstart = function(e) {
                    e.preventDefault();
                    element.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    console.log(`Touch start on ${dir}`);
                };
                
                element.ontouchend = function(e) {
                    e.preventDefault();
                    console.log(`Direction change: ${dir}`);
                    
                    // Handle the direction if game is running
                    if (window.gameRunning && !window.gamePaused) {
                        window.handleDirection(dir);
                    }
                    
                    // Visual feedback
                    setTimeout(() => {
                        element.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }, 150);
                };
                
                console.log(`Fixed event handlers for ${dir}`);
            }
        });
        
        // Apply important styles
        if (tapControls) {
            tapControls.style.cssText = `
                display: block !important;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 50;
                pointer-events: none;
            `;
        }
        
        // Apply styles to tap zones
        directions.forEach(dir => {
            const element = document.getElementById(`tap${dir.charAt(0).toUpperCase() + dir.slice(1)}`);
            if (element) {
                element.style.cssText = `
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.05);
                    pointer-events: auto;
                    touch-action: none;
                `;
                
                // Position based on direction
                switch(dir) {
                    case 'up':
                        element.style.top = '0';
                        element.style.left = '25%';
                        element.style.width = '50%';
                        element.style.height = '33%';
                        break;
                    case 'down':
                        element.style.bottom = '0';
                        element.style.left = '25%';
                        element.style.width = '50%';
                        element.style.height = '33%';
                        break;
                    case 'left':
                        element.style.top = '33%';
                        element.style.left = '0';
                        element.style.width = '25%';
                        element.style.height = '34%';
                        break;
                    case 'right':
                        element.style.top = '33%';
                        element.style.right = '0';
                        element.style.width = '25%';
                        element.style.height = '34%';
                        break;
                }
                
                // Add visual indicator
                const indicator = document.createElement('span');
                indicator.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 24px;
                    opacity: 0.3;
                `;
                
                switch(dir) {
                    case 'up': indicator.textContent = '▲'; break;
                    case 'down': indicator.textContent = '▼'; break;
                    case 'left': indicator.textContent = '◀'; break;
                    case 'right': indicator.textContent = '▶'; break;
                }
                
                element.innerHTML = '';
                element.appendChild(indicator);
            }
        });
        
        console.log("Tap zones fixed. Toggle debug mode to see them:", toggleTapZones());
        return true;
    };
    
    // Auto-run on mobile devices after a short delay
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setTimeout(() => {
            // Only auto-fix on mobile
            fixTapZones();
            console.info("Debug tools ready. Call toggleTapZones() or fixTapZones() from console if needed.");
        }, 2000);
    } else {
        console.info("Debug tools ready for desktop. Call toggleTapZones() or fixTapZones() from console to test.");
    }
})();
