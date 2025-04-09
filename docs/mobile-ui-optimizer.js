/**
 * Mobile UI Optimizer
 * Optimizes the game UI specifically for mobile devices
 * - Hides instructions
 * - Increases touch target sizes
 * - Maximizes canvas space
 */

(function() {
    // Only run on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (!isMobile) {
        console.log("MOBILE UI: Not a mobile device, skipping optimization");
        return;
    }

    console.log("MOBILE UI: Optimizing UI for mobile");
    
    function optimizeMobileUI() {
        // ENHANCED: Aggressively hide all instructions and popups
        document.querySelectorAll('.game-info, .instructions, #mobileInstructions, .onboarding-overlay, #tapOnboardingOverlay').forEach(el => {
            if (el) {
                el.style.display = 'none';
                // Force remove from DOM if possible
                if (el.parentNode) {
                    try {
                        el.parentNode.removeChild(el);
                        console.log("MOBILE UI: Removed instruction element", el.id || el.className);
                    } catch(e) {}
                }
            }
        });
        
        // Also immediately hide any mobile instructions panel if it exists
        const mobileInstructions = document.getElementById('mobileInstructions');
        if (mobileInstructions) {
            mobileInstructions.style.display = 'none';
            
            // Close button should also be hidden
            const closeBtn = document.getElementById('closeInstructions');
            if (closeBtn) closeBtn.style.display = 'none';
            
            // Mark as seen in localStorage
            localStorage.setItem('mobileInstructionsShown', 'true');
        }
        
        // Force mark all tutorials as seen
        localStorage.setItem('mobileInstructionsShown', 'true');
        localStorage.setItem('tapOnboardingShown', 'true');
        localStorage.setItem('onboardingShown', 'true');
        localStorage.setItem('controlsOnboardingShown', 'true');

        // Set game container to full width
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.maxWidth = '100%';
            gameContainer.style.width = '100%';
            gameContainer.style.padding = '0';
            gameContainer.style.margin = '0';
        }
        
        // Make header smaller
        const title = document.querySelector('h1');
        if (title) {
            title.style.fontSize = '1.8rem';
            title.style.margin = '0.5rem 0';
        }
        
        // Enlarge the score display for better visibility
        const score = document.getElementById('score');
        if (score) {
            score.style.fontSize = '2.5rem';
            score.style.fontWeight = 'bold';
        }
        
        // Optimize the controls area
        const controlsWrapper = document.querySelector('.controls-wrapper');
        if (controlsWrapper) {
            controlsWrapper.style.margin = '0.5rem auto';
            controlsWrapper.style.padding = '0';
        }
        
        // Make buttons more tappable
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.minHeight = '50px'; // Minimum height for better tapping
            button.style.minWidth = '120px';
            button.style.fontSize = '1.3rem';
            button.style.padding = '0.8rem 1rem';
            button.style.margin = '0.3rem';
        });
        
        // Ensure high contrast colors for tap zones
        const tapZones = document.querySelectorAll('.tap-zone');
        tapZones.forEach(zone => {
            // Make tap zones more visible but not distracting
            zone.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            zone.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            
            // Increase the size of the direction symbol
            if (zone.textContent.trim().length === 1) {
                zone.style.fontSize = '32px';
            }
        });
        
        // Update meta viewport settings for optimal mobile view
        updateViewport();
        
        console.log("MOBILE UI: Optimization complete - all instructions removed");
        return true;
    }
    
    // Update the viewport meta tag for optimal mobile experience
    function updateViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // Set aggressive viewport settings
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }
    
    // Optimize UI after DOM content loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(optimizeMobileUI, 100);
        });
    } else {
        // DOM is already loaded
        setTimeout(optimizeMobileUI, 100);
    }
    
    // Also optimize after window load
    window.addEventListener('load', () => {
        setTimeout(optimizeMobileUI, 500);
    });
    
    // ENHANCED: Run multiple times to ensure popups are removed
    window.addEventListener('load', () => {
        // Run multiple times to catch any delayed popups
        for (let i = 0; i < 5; i++) {
            setTimeout(optimizeMobileUI, 500 * i);
        }
    });
    
    // Make function available globally
    window.optimizeMobileUI = optimizeMobileUI;
    
    // Run immediately for faster effect
    setTimeout(optimizeMobileUI, 10);
    
    // ENHANCED: Monitor for new elements and remove them
    // This helps catch any dynamically added instruction popups
    function monitorAndRemoveInstructions() {
        const selectors = [
            '#mobileInstructions', 
            '.onboarding-overlay',
            '#tapOnboardingOverlay',
            '#onboardingOverlay'
        ];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
                console.log(`MOBILE UI: Detected and hiding ${selector}`);
            }
        });
    }
    
    // Run monitor periodically
    setInterval(monitorAndRemoveInstructions, 1000);
})();
