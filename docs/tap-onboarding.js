/**
 * Tap Zone Onboarding Guide
 * Shows subtle hints for new players on how to use the tap zones
 * Uses neo-brutalist styling that matches the game
 */

(function() {
    // Only run on mobile
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
        return;
    }
    
    console.log("TAP ONBOARDING: Initializing for mobile");
    
    // Check if the user has seen the onboarding before
    const hasSeenOnboarding = localStorage.getItem('tapOnboardingShown');
    
    // Function to show onboarding hints
    function showOnboardingHints() {
        if (hasSeenOnboarding) {
            return;
        }
        
        console.log("TAP ONBOARDING: Showing directional hints");
        
        // Wait for the game canvas and controls to be set up
        setTimeout(() => {
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                return;
            }
            
            // Create an overlay for the onboarding hints
            const hintOverlay = document.createElement('div');
            hintOverlay.id = 'tapOnboardingOverlay';
            hintOverlay.style.cssText = `
                position: fixed;
                top: ${canvas.getBoundingClientRect().top}px;
                left: ${canvas.getBoundingClientRect().left}px;
                width: ${canvas.getBoundingClientRect().width}px;
                height: ${canvas.getBoundingClientRect().height}px;
                z-index: 1000000;
                pointer-events: none;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            
            // Create a neo-brutalist styled hint container
            const hintContainer = document.createElement('div');
            hintContainer.style.cssText = `
                background-color: #252525;
                color: white;
                border: 3px solid #FF5F1F;
                padding: 15px;
                max-width: 80%;
                text-align: center;
                transform: rotate(-1deg);
                box-shadow: 4px 4px 0 black;
            `;
            
            // Create the message with neo-brutalist styling
            const message = document.createElement('div');
            message.innerHTML = `
                <h3 style="margin: 0 0 10px; color:#00DFFC; text-transform:uppercase; letter-spacing:1px; font-size:14px;">How to Play</h3>
                <p style="margin: 0; font-size:12px;">Tap the <span style="color:#FFFC31; font-weight:bold;">edge zones</span> to change direction</p>
                <div style="display:flex; justify-content:space-between; margin-top:15px;">
                    <div style="text-align:center; padding:5px;">▲<br>UP</div>
                    <div style="text-align:center; padding:5px;">▼<br>DOWN</div>
                    <div style="text-align:center; padding:5px;">◀<br>LEFT</div>
                    <div style="text-align:center; padding:5px;">▶<br>RIGHT</div>
                </div>
            `;
            
            // Add a dismissal button with neo-brutalist styling
            const dismissButton = document.createElement('button');
            dismissButton.textContent = 'GOT IT!';
            dismissButton.style.cssText = `
                background-color: #FF5F1F;
                color: white;
                border: 2px solid black;
                margin-top: 15px;
                padding: 5px 15px;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
                box-shadow: 2px 2px 0 black;
                transform: rotate(1deg);
            `;
            
            // Make the button interactive despite the overlay being pointer-events: none
            dismissButton.style.pointerEvents = 'auto';
            
            // Add event listener to dismiss
            dismissButton.addEventListener('click', function() {
                hintOverlay.style.opacity = '0';
                setTimeout(() => {
                    if (hintOverlay.parentNode) {
                        hintOverlay.parentNode.removeChild(hintOverlay);
                    }
                }, 500);
                
                // Mark as seen
                localStorage.setItem('tapOnboardingShown', 'true');
            });
            
            // Assemble and append components
            hintContainer.appendChild(message);
            hintContainer.appendChild(dismissButton);
            hintOverlay.appendChild(hintContainer);
            document.body.appendChild(hintOverlay);
            
            // Fade in the overlay after a short delay
            setTimeout(() => {
                hintOverlay.style.opacity = '1';
            }, 100);
            
            // Auto-dismiss after 7 seconds if not closed manually
            setTimeout(() => {
                if (document.body.contains(hintOverlay)) {
                    hintOverlay.style.opacity = '0';
                    setTimeout(() => {
                        if (hintOverlay.parentNode) {
                            hintOverlay.parentNode.removeChild(hintOverlay);
                        }
                    }, 500);
                    
                    // Mark as seen
                    localStorage.setItem('tapOnboardingShown', 'true');
                }
            }, 7000);
        }, 1500); // Delay to ensure canvas is ready
    }
    
    // Run onboarding after the game loads
    window.addEventListener('load', function() {
        setTimeout(showOnboardingHints, 1000);
    });
    
    // Also expose to window for manual triggering
    window.showTapOnboarding = function() {
        localStorage.removeItem('tapOnboardingShown');
        showOnboardingHints();
    };
})();
