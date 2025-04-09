/**
 * Mobile Size Fix
 * This script ensures the game maintains proper size on mobile devices
 */

(function() {
    console.log("MOBILE SIZE FIX: Initializing");
    
    // Improved mobile detection - check for narrow screens, touch capability, and mobile UA
    const isMobileDevice = /iPhone|iPad|iPod|Android|Mobi|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isNarrowScreen = window.innerWidth <= 767;
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Apply fix if any condition matches, or if forced by URL
    const shouldApplyFix = 
        isMobileDevice || 
        isNarrowScreen || 
        hasTouchSupport || 
        window.location.search.includes('forceMobile=true');
    
    if (!shouldApplyFix) {
        console.log("MOBILE SIZE FIX: Not needed for this device");
        return;
    }
    
    console.log("MOBILE SIZE FIX: Will be applied to ensure proper sizing");
    
    function fixCanvasSize() {
        console.log("MOBILE SIZE FIX: Checking canvas size");
        
        // Get the canvas and game area
        const canvas = document.getElementById('gameCanvas');
        const gameArea = document.querySelector('.game-area');
        
        if (!canvas || !gameArea) {
            console.error("MOBILE SIZE FIX: Canvas or game area not found");
            return;
        }
        
        // Ensure black background on canvas
        canvas.style.backgroundColor = '#000';
        
        // Calculate the ideal size for the canvas - optimize for mobile viewing
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Use a higher percentage of available space
        const idealSize = Math.min(
            gameArea.clientWidth * 0.98,  // 98% of game area width
            gameArea.clientHeight * 0.98, // 98% of game area height
            viewportWidth * 0.95          // Limit to 95% of viewport width
        );
        
        // Apply the size directly to the canvas
        if (idealSize > 0) {
            canvas.style.width = `${idealSize}px`;
            canvas.style.height = `${idealSize}px`;
            
            console.log("MOBILE SIZE FIX: Resized canvas to", {
                width: canvas.style.width,
                height: canvas.style.height
            });
        }
        
        // Ensure the game area height is sufficient - use a larger percentage of viewport
        const minGameAreaHeight = Math.max(idealSize + 20, viewportHeight * 0.75);
        if (gameArea.clientHeight < minGameAreaHeight) {
            gameArea.style.height = `${minGameAreaHeight}px`;
            console.log("MOBILE SIZE FIX: Adjusted game area height to", gameArea.style.height);
        }

        // Make the game container bigger to better fit the mobile screen
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.maxWidth = '95%';
            gameContainer.style.width = '100%';
        }
        
        // Make buttons larger and more tappable on mobile
        const buttons = document.querySelectorAll('.main-btn, .secondary-btn');
        buttons.forEach(btn => {
            btn.style.padding = '0.6rem 1.3rem';
            btn.style.fontSize = '1.2rem';
        });

        // Ensure tap zones are aligned after resizing
        if (typeof window.ensureTapZoneAlignment === 'function') {
            window.ensureTapZoneAlignment();
        }
        
        // Force black background on canvas - both via style and directly on the element
        canvas.style.backgroundColor = '#000';
        
        // Also try to redraw the canvas with black background
        setTimeout(() => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Save current transform
                ctx.save();
                
                // Use identity transform while clearing the canvas
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                
                // Clear to black
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Restore transform
                ctx.restore();
                
                console.log("MOBILE SIZE FIX: Applied black background to canvas context");
            }
        }, 100);
    }
    
    // Run on load and after a delay
    window.addEventListener('load', () => {
        setTimeout(fixCanvasSize, 300);
        setTimeout(fixCanvasSize, 1000); // Additional delay to ensure it works
    });
    
    // Run immediately if DOM is already loaded
    if (document.readyState !== 'loading') {
        setTimeout(fixCanvasSize, 100);
    }
    
    // Run on resize and orientation change
    window.addEventListener('resize', () => {
        setTimeout(fixCanvasSize, 300);
    });
    
    window.addEventListener('orientationchange', () => {
        // Run multiple times after orientation change
        setTimeout(fixCanvasSize, 300);
        setTimeout(fixCanvasSize, 1000);
        setTimeout(fixCanvasSize, 2000); // Additional delay for orientation changes
    });
    
    // Expose function to window for manual calls
    window.fixCanvasSize = fixCanvasSize;
    
    console.log("MOBILE SIZE FIX: Event listeners set up");
})();
