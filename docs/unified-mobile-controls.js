/**
 * Unified Mobile Controls for Snake Game
 * This single script consolidates all mobile touch controls
 */

(function() {
    // Improved mobile detection that always enables controls for development/testing
    const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent);
    const isNarrowScreen = window.innerWidth <= 767;
    // Always enable on mobile devices, or on narrow screens, or if forced via URL param
    const isMobile = isMobileDevice || isNarrowScreen || window.location.search.includes('forceMobile=true');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (!isMobile) {
        console.log("MOBILE CONTROLS: Not enabling mobile controls");
        return;
    }
    
    console.log("MOBILE CONTROLS: Mobile mode active" + (isIOS ? " (iOS)" : ""));
    
    // Create unified controls
    function createUnifiedControls() {
        console.log("MOBILE CONTROLS: Creating unified controls");
        
        // Remove any existing controls to avoid duplication
        removeExistingControls();
        
        // Get the canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("MOBILE CONTROLS: Canvas not found!");
            return false;
        }
        
        // IMPORTANT: Ensure canvas is properly sized
        // This may be causing the "small on mobile" issue
        ensureProperCanvasSize(canvas);
        
        // Get the exact canvas position AFTER potential resizing
        const canvasRect = canvas.getBoundingClientRect();
        
        // Create a container positioned in FIXED coordinates relative to the viewport
        const container = document.createElement('div');
        container.id = 'unifiedMobileControls';
        
        // Style it with fixed position matching the canvas exactly
        container.style.cssText = `
            position: fixed;
            top: ${canvasRect.top}px;
            left: ${canvasRect.left}px;
            width: ${canvasRect.width}px;
            height: ${canvasRect.height}px;
            z-index: 999999;
            pointer-events: none;
            touch-action: none;
            -webkit-tap-highlight-color: transparent;
            border: 2px solid transparent;
        `;
        
        // Add to body to ensure it's not affected by other elements' positioning
        document.body.appendChild(container);
        
        console.log("MOBILE CONTROLS: Controls container created with dimensions:", {
            top: container.style.top,
            left: container.style.left,
            width: container.style.width,
            height: container.style.height
        });
        
        // Define the tap zones with neo-brutalist design
        const zones = [
            { name: 'up', symbol: '▲', position: 'top: 0; left: 25%; width: 50%; height: 33%;' },
            { name: 'down', symbol: '▼', position: 'bottom: 0; left: 25%; width: 50%; height: 33%;' },
            { name: 'left', symbol: '◀', position: 'top: 33%; left: 0; width: 25%; height: 34%;' },
            { name: 'right', symbol: '▶', position: 'top: 33%; right: 0; width: 25%; height: 34%;' }
        ];
        
        // Create each zone
        zones.forEach(zone => {
            const touchZone = document.createElement('div');
            touchZone.id = `mobileControl${zone.name.charAt(0).toUpperCase() + zone.name.slice(1)}`;
            touchZone.className = 'mobile-control-zone';
            
            // Style with absolute positioning and neo-brutalist design
            touchZone.style.cssText = `
                position: absolute;
                ${zone.position}
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                background-color: rgba(37, 37, 37, 0.1);
                color: rgba(255, 255, 255, 0.4);
                font-size: 20px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                touch-action: none;
                -webkit-tap-highlight-color: transparent;
                transition: all 0.15s ease-out;
            `;
            
            // Just use the symbol directly - simpler is more reliable for mobile
            touchZone.textContent = zone.symbol;
            container.appendChild(touchZone);
            
            // Add optimized event handlers for different device types
            addOptimizedTouchHandlers(touchZone, zone.name);
            
            console.log(`MOBILE CONTROLS: Created ${zone.name} zone`);
        });
        
        // Create a function to update the overlay position when screen changes
        function updatePosition() {
            const canvas = document.getElementById('gameCanvas');
            const container = document.getElementById('unifiedMobileControls');
            
            if (!canvas || !container) return;
            
            // Check if canvas size needs adjustment
            ensureProperCanvasSize(canvas);
            
            // Get updated canvas position
            const updatedRect = canvas.getBoundingClientRect();
            
            // Update container position
            container.style.top = `${updatedRect.top}px`;
            container.style.left = `${updatedRect.left}px`;
            container.style.width = `${updatedRect.width}px`;
            container.style.height = `${updatedRect.height}px`;
            
            console.log("MOBILE CONTROLS: Updated position to match canvas", {
                top: container.style.top,
                left: container.style.left,
                width: container.style.width,
                height: container.style.height
            });
        }
        
        // Add event listeners to maintain position
        window.addEventListener('resize', () => setTimeout(updatePosition, 100));
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('orientationchange', () => {
            setTimeout(updatePosition, 300);
            setTimeout(updatePosition, 1000);
        });
        
        // Briefly highlight controls when first created
        document.querySelectorAll('.mobile-control-zone').forEach(el => {
            el.style.backgroundColor = 'rgba(255, 95, 31, 0.2)';
            el.style.border = '2px solid rgba(255, 95, 31, 0.3)';
            el.style.color = 'rgba(255, 255, 255, 0.7)';
            
            setTimeout(() => {
                el.style.backgroundColor = 'rgba(37, 37, 37, 0.1)';
                el.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                el.style.color = 'rgba(255, 255, 255, 0.4)';
            }, 1500);
        });
        
        // For iOS devices, add a reload button
        if (isIOS) {
            addReloadButton();
        }
        
        console.log("MOBILE CONTROLS: Controls created successfully");
        return true;
    }
    
    // NEW FUNCTION: Ensure the canvas is properly sized on mobile
    function ensureProperCanvasSize(canvas) {
        // Get the game area
        const gameArea = canvas.parentElement;
        if (!gameArea) return;
        
        console.log("MOBILE CONTROLS: Checking canvas size");
        
        // Calculate optimal size
        const gameAreaWidth = gameArea.clientWidth;
        const gameAreaHeight = gameArea.clientHeight;
        
        // Log the current dimensions for debugging
        console.log("Game area dimensions:", {
            width: gameAreaWidth,
            height: gameAreaHeight
        });
        console.log("Current canvas dimensions:", {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
        });
        
        // If canvas looks too small, try to resize it
        if (canvas.clientWidth < gameAreaWidth * 0.9 || canvas.clientHeight < gameAreaHeight * 0.9) {
            console.log("MOBILE CONTROLS: Canvas appears too small, attempting resize");
            
            // Force black background
            canvas.style.backgroundColor = '#000';
            
            // Set canvas dimensions to better fill the game area
            // Preserve aspect ratio (square)
            const size = Math.min(gameAreaWidth * 0.98, gameAreaHeight * 0.98);
            
            // Set display size (CSS)
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
            
            // Call resizeGameCanvas if it exists
            if (typeof window.resizeGameCanvas === 'function') {
                console.log("MOBILE CONTROLS: Calling game's resize function");
                window.resizeGameCanvas();
            }
            
            console.log("MOBILE CONTROLS: Resized canvas to", size + 'px');
        }
        
        // Always ensure black background
        canvas.style.backgroundColor = '#000';
    }
    
    // Add optimized event handlers for all device types
    function addOptimizedTouchHandlers(element, direction) {
        // CLICK - works on most devices
        element.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`MOBILE CONTROLS: Clicked ${direction}`);
            triggerDirection(direction);
            
            // Visual feedback
            flashFeedback(this);
        }, false);
        
        // TOUCH EVENTS - better for mobile
        element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Visual feedback for touch
            this.style.backgroundColor = 'rgba(255, 95, 31, 0.25)';
            this.style.border = '2px solid rgba(255, 95, 31, 0.4)';
            this.style.transform = 'scale(0.97)';
        }, {passive: false});
        
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Reset styles
            this.style.backgroundColor = 'rgba(37, 37, 37, 0.1)';
            this.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            this.style.transform = 'scale(1)';
            
            console.log(`MOBILE CONTROLS: Touch on ${direction}`);
            triggerDirection(direction);
        }, {passive: false});
        
        // For iOS compatibility
        if (isIOS) {
            // Direct property assignments which sometimes work better on iOS
            element.onclick = function() {
                triggerDirection(direction);
                return false;
            };
        }
    }
    
    // Simple visual feedback function
    function flashFeedback(element) {
        const originalBg = element.style.backgroundColor;
        const originalBorder = element.style.border;
        
        element.style.backgroundColor = 'rgba(255, 95, 31, 0.25)';
        element.style.border = '2px solid rgba(255, 95, 31, 0.4)';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
            element.style.border = originalBorder;
        }, 150);
    }
    
    // Function to send direction to the game
    function triggerDirection(direction) {
        if (typeof window.handleDirection === 'function') {
            // Call the game's handler directly
            window.handleDirection(direction);
        } else if (window.directionQueue && Array.isArray(window.directionQueue)) {
            // Fall back to queue manipulation if available
            let dx = 0, dy = 0;
            switch(direction) {
                case 'up': dy = -20; break;
                case 'down': dy = 20; break;
                case 'left': dx = -20; break;
                case 'right': dx = 20; break;
            }
            window.directionQueue.push({dx, dy});
            console.log(`MOBILE CONTROLS: Direction queued: ${direction}`);
        } else {
            console.error("MOBILE CONTROLS: No way to send direction to game!");
        }
    }
    
    // Remove any existing controls
    function removeExistingControls() {
        const controlsToRemove = [
            '#unifiedMobileControls',
            '#absoluteTapContainer',
            '#forceFixContainer',
            '#fixedTapContainer',
            '#directTapContainer',
            '#iosReloadButton'
        ];
        
        // Don't remove the original tap-controls, just hide it
        const tapControls = document.querySelector('.tap-controls');
        if (tapControls) {
            tapControls.style.display = 'none';
            console.log("MOBILE CONTROLS: Original tap controls hidden");
        }
        
        // Remove other controls
        controlsToRemove.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.parentNode.removeChild(element);
                console.log(`MOBILE CONTROLS: Removed ${selector}`);
            }
        });
    }
    
    // Add a reload button for iOS devices
    function addReloadButton() {
        const button = document.createElement('button');
        button.id = 'iosReloadButton';
        button.textContent = 'RELOAD';
        
        // Neo-brutalist styling
        button.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: #FF5F1F;
            color: white;
            border: 3px solid black;
            padding: 6px 8px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            z-index: 999999;
            box-shadow: 2px 2px 0 black;
            display: none;
        `;
        
        // Add click handler
        button.addEventListener('click', function() {
            // Recreate controls
            createUnifiedControls();
            
            // Show confirmation
            const feedback = document.createElement('div');
            feedback.textContent = 'Controls reloaded!';
            feedback.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #00DFFC;
                color: black;
                padding: 12px 20px;
                border: 3px solid black;
                box-shadow: 4px 4px 0 black;
                font-weight: bold;
                font-size: 16px;
                z-index: 9999999;
            `;
            document.body.appendChild(feedback);
            
            // Remove after a moment
            setTimeout(() => {
                feedback.style.opacity = '0';
                feedback.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => document.body.removeChild(feedback), 500);
            }, 1500);
        });
        
        document.body.appendChild(button);
        
        // Show after a delay
        setTimeout(() => {
            button.style.display = 'block';
        }, 5000);
    }
    
    // Add touch swipe handling to the canvas
    function setupSwipeHandler() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return false;
        
        let startX, startY;
        
        canvas.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, {passive: true});
        
        canvas.addEventListener('touchend', function(e) {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            // Require minimum movement
            if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;
            
            // Determine direction based on larger delta
            if (Math.abs(diffX) > Math.abs(diffY)) {
                triggerDirection(diffX > 0 ? 'right' : 'left');
            } else {
                triggerDirection(diffY > 0 ? 'down' : 'up');
            }
        }, {passive: true});
        
        return true;
    }
    
    // Show onboarding for new users
    function showOnboarding() {
        const hasSeenOnboarding = localStorage.getItem('onboardingShown');
        if (hasSeenOnboarding) return;
        
        setTimeout(() => {
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) return;
            
            const canvasRect = canvas.getBoundingClientRect();
            
            const overlay = document.createElement('div');
            overlay.id = 'onboardingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: ${canvasRect.top}px;
                left: ${canvasRect.left}px;
                width: ${canvasRect.width}px;
                height: ${canvasRect.height}px;
                background-color: rgba(0,0,0,0.7);
                z-index: 1000001;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background-color: #252525;
                padding: 15px;
                border: 3px solid #FF5F1F;
                box-shadow: 4px 4px 0 black;
                max-width: 80%;
                text-align: center;
            `;
            
            content.innerHTML = `
                <h3 style="color:#00DFFC; margin-top:0; text-transform:uppercase;">How to Play</h3>
                <p style="margin:10px 0;">Tap the edges to control the snake:</p>
                <div style="display:flex; justify-content:space-around; margin:15px 0;">
                    <div>▲<br>UP</div>
                    <div>▼<br>DOWN</div>
                    <div>◀<br>LEFT</div>
                    <div>▶<br>RIGHT</div>
                </div>
                <button id="gotItBtn" style="background:#FF5F1F; color:white; border:2px solid black; padding:5px 15px; font-weight:bold;">GOT IT!</button>
            `;
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            document.getElementById('gotItBtn').addEventListener('click', function() {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 500);
                
                localStorage.setItem('onboardingShown', 'true');
            });
        }, 1500);
    }
    
    // Helper function that users can call to debug mobile controls
    window.debugMobileControls = function() {
        const container = document.getElementById('unifiedMobileControls');
        if (!container) {
            console.error("Mobile controls container not found");
            return false;
        }
        
        // Highlight all zones
        container.style.border = '2px solid red';
        
        document.querySelectorAll('.mobile-control-zone').forEach(zone => {
            zone.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            zone.style.border = '2px solid white';
            zone.style.color = 'white';
            
            console.log(zone.id, {
                position: zone.getBoundingClientRect(),
                visible: window.getComputedStyle(zone).display !== 'none'
            });
        });
        
        return "Mobile controls highlighted for debugging";
    };
    
    // Add debugging utility to check alignment
    function debugTapZones() {
        const container = document.getElementById('unifiedMobileControls');
        if (!container) {
            console.error("MOBILE CONTROLS: Tap zones container not found");
            return false;
        }

        console.log("MOBILE CONTROLS: Debugging tap zones");
        container.style.border = '2px solid red'; // Highlight container for debugging

        document.querySelectorAll('.mobile-control-zone').forEach(zone => {
            const rect = zone.getBoundingClientRect();
            console.log(`${zone.id} position:`, rect);
            zone.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Highlight zones
            zone.style.border = '2px solid white';
        });

        return true;
    }

    // Ensure tap zones are aligned with the canvas
    function ensureTapZoneAlignment() {
        const canvas = document.getElementById('gameCanvas');
        const container = document.getElementById('unifiedMobileControls');

        if (!canvas || !container) {
            console.error("MOBILE CONTROLS: Canvas or container not found");
            return false;
        }

        const canvasRect = canvas.getBoundingClientRect();
        container.style.top = `${canvasRect.top}px`;
        container.style.left = `${canvasRect.left}px`;
        container.style.width = `${canvasRect.width}px`;
        container.style.height = `${canvasRect.height}px`;

        console.log("MOBILE CONTROLS: Tap zones aligned with canvas");
        return true;
    }

    // Update event listeners to ensure alignment on resize/orientation change
    window.addEventListener('resize', ensureTapZoneAlignment);
    window.addEventListener('orientationchange', () => {
        setTimeout(ensureTapZoneAlignment, 300);
        setTimeout(ensureTapZoneAlignment, 1000);
    });

    // Expose debugging utilities globally
    window.debugTapZones = debugTapZones;
    window.ensureTapZoneAlignment = ensureTapZoneAlignment;

    // Make the original tap controls invisible on desktop
    function hideDesktopControls() {
        if (!isMobile) {
            const tapControls = document.querySelector('.tap-controls');
            if (tapControls) {
                tapControls.style.display = 'none';
                console.log("MOBILE CONTROLS: Hidden tap controls for desktop");
            }
        }
    }

    // Run hideDesktopControls immediately and after DOM loaded
    hideDesktopControls();
    if (document.readyState !== 'complete') {
        document.addEventListener('DOMContentLoaded', hideDesktopControls);
    }
    window.addEventListener('load', hideDesktopControls);

    // Initialize everything
    function init() {
        console.log("MOBILE CONTROLS: Initializing");
        
        // Create controls
        createUnifiedControls();
        
        // Setup additional handlers
        setupSwipeHandler();
        
        // Show onboarding
        setTimeout(showOnboarding, 1000);
        
        // Make recreation function available globally
        window.recreateMobileControls = createUnifiedControls;
        
        console.log("MOBILE CONTROLS: Initialization complete");
    }
    
    // Run on load and DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
    } else {
        setTimeout(init, 100);
    }
    
    // Also run after a delay to ensure everything is loaded
    window.addEventListener('load', () => setTimeout(init, 500));
    
    // Run init immediately too
    setTimeout(init, 200);
})();
