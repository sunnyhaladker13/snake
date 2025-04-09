/**
 * Mobile Size Fix
 * This script ensures the game maintains proper size on mobile devices
 */

(function() {
    console.log("MOBILE SIZE FIX: Initializing");
    
    // Only run on mobile
    const isMobile = /iPhone|iPad|iPod|Android|Mobi/i.test(navigator.userAgent);
    if (!isMobile) {
        console.log("MOBILE SIZE FIX: Not on mobile, skipping");
        return;
    }
    
    function fixCanvasSize() {
        console.log("MOBILE SIZE FIX: Checking canvas size");
        
        // Get the canvas and game area
        const canvas = document.getElementById('gameCanvas');
        const gameArea = document.querySelector('.game-area');
        
        if (!canvas || !gameArea) {
            console.log("MOBILE SIZE FIX: Canvas or game area not found");
            return;
        }
        
        // Log current dimensions
        console.log("MOBILE SIZE FIX: Current dimensions", {
            canvas: {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                style: {
                    width: canvas.style.width,
                    height: canvas.style.height
                }
            },
            gameArea: {
                clientWidth: gameArea.clientWidth,
                clientHeight: gameArea.clientHeight
            }
        });
        
        // Calculate the ideal size for the canvas
        // Using the smaller dimension to maintain aspect ratio
        const idealSize = Math.min(
            gameArea.clientWidth * 0.95,  // 95% of game area width
            gameArea.clientHeight * 0.95  // 95% of game area height
        );
        
        // Apply the size directly to the canvas
        if (idealSize > 0) {
            // First set display size (CSS)
            canvas.style.width = idealSize + 'px';
            canvas.style.height = idealSize + 'px';
            
            // Try to maintain aspect ratio and internal dimensions
            // if gridSize is maintained at 20px
            const gridSize = 20;
            const gridCount = Math.floor(idealSize / gridSize);
            
            // Adjust internal dimensions to match grid size
            if (typeof window.resizeGameCanvas === 'function') {
                // Use game's resize function if available
                setTimeout(window.resizeGameCanvas, 10);
            }
            
            console.log("MOBILE SIZE FIX: Resized canvas to", {
                width: canvas.style.width,
                height: canvas.style.height
            });
        }
        
        // Make sure the game area height is sufficient
        const minGameAreaHeight = Math.max(idealSize + 20, window.innerHeight * 0.6);
        if (gameArea.clientHeight < minGameAreaHeight) {
            gameArea.style.height = minGameAreaHeight + 'px';
            console.log("MOBILE SIZE FIX: Adjusted game area height to", gameArea.style.height);
        }
    }
    
    // Run on load and after a delay
    window.addEventListener('load', () => {
        setTimeout(fixCanvasSize, 300);
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
    });
    
    // Expose function to window for manual calls
    window.fixCanvasSize = fixCanvasSize;
    
    console.log("MOBILE SIZE FIX: Event listeners set up");
})();
