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
        
        // Calculate the ideal size for the canvas - MAXIMIZE USAGE OF AVAILABLE SPACE
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Make game area bigger to use more space
        gameArea.style.width = '100%';
        gameArea.style.maxWidth = '100%';
        gameArea.style.height = `${viewportHeight * 0.7}px`; // Use 70% of viewport height
        
        // Calculate the new ideal size - use nearly all of the game area
        const idealSize = Math.min(
            gameArea.clientWidth * 0.98,  // 98% of game area width
            gameArea.clientHeight * 0.98  // 98% of game area height
        );
        
        // Apply the size directly to the canvas - make it as big as possible
        if (idealSize > 0) {
            canvas.style.width = `${idealSize}px`;
            canvas.style.height = `${idealSize}px`;
            
            console.log("MOBILE SIZE FIX: Resized canvas to", {
                width: canvas.style.width,
                height: canvas.style.height
            });
        }
        
        // Make the game container bigger to better fit the mobile screen
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.maxWidth = '100%';
            gameContainer.style.width = '100%';
            gameContainer.style.padding = '0';
            gameContainer.style.margin = '0 auto';
        }
        
        // Make buttons larger and more tappable on mobile
        const buttons = document.querySelectorAll('.main-btn, .secondary-btn');
        buttons.forEach(btn => {
            btn.style.padding = '0.8rem 1.5rem';
            btn.style.fontSize = '1.4rem';
            btn.style.margin = '0.5rem';
        });

        // Ensure tap zones are aligned after resizing
        if (typeof window.ensureTapZoneAlignment === 'function') {
            window.ensureTapZoneAlignment();
        }
        
        // Force black background on canvas
        canvas.style.backgroundColor = '#000';
        
        // Force canvas redraw with correct dimensions
        if (typeof window.resizeGameCanvas === 'function') {
            window.resizeGameCanvas();
        }
        
        // Try to apply actual canvas dimensions (not just CSS)
        if (idealSize > 0) {
            const pixelRatio = window.devicePixelRatio || 1;
            // Set actual canvas dimensions
            canvas.width = Math.round(idealSize * pixelRatio);
            canvas.height = Math.round(idealSize * pixelRatio);
        }
    }
    
    // Run immediately and after DOM loaded
    setTimeout(fixCanvasSize, 100);
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(fixCanvasSize, 300);
    });
    
    // Run on load and after delays
    window.addEventListener('load', () => {
        setTimeout(fixCanvasSize, 300);
        setTimeout(fixCanvasSize, 1000);
        setTimeout(fixCanvasSize, 2000);  // Try again later for slow devices
    });
    
    // Run on resize and orientation change
    window.addEventListener('resize', () => {
        setTimeout(fixCanvasSize, 300);
    });
    
    window.addEventListener('orientationchange', () => {
        // Run multiple times after orientation change
        setTimeout(fixCanvasSize, 300);
        setTimeout(fixCanvasSize, 1000);
        setTimeout(fixCanvasSize, 2000);
    });
    
    // Expose function to window for manual calls
    window.fixCanvasSize = fixCanvasSize;
    
    console.log("MOBILE SIZE FIX: Event listeners set up");
})();
