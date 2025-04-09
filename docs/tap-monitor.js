/**
 * Tap Zone Alignment Monitor
 * This script continuously checks if the tap zones are aligned with the canvas
 * and fixes them if they're not
 */

(function() {
    console.log("Tap zone monitor starting");
    
    // Create a function to check and fix alignment
    function checkTapAlignment() {
        const canvas = document.getElementById('gameCanvas');
        const tapControls = document.querySelector('.tap-controls');
        
        if (!canvas || !tapControls) {
            console.log("Canvas or tap controls not found, waiting...");
            return false;
        }
        
        const canvasRect = canvas.getBoundingClientRect();
        const tapRect = tapControls.getBoundingClientRect();
        
        // Check if the tap controls are properly aligned with the canvas
        const topDiff = Math.abs(canvasRect.top - tapRect.top);
        const leftDiff = Math.abs(canvasRect.left - tapRect.left);
        const widthDiff = Math.abs(canvasRect.width - tapRect.width);
        const heightDiff = Math.abs(canvasRect.height - tapRect.height);
        
        // If any difference is more than 2 pixels, realign
        if (topDiff > 2 || leftDiff > 2 || widthDiff > 2 || heightDiff > 2) {
            console.log("Tap zones misaligned, fixing...", {
                topDiff,
                leftDiff,
                widthDiff,
                heightDiff
            });
            
            // Position the tap controls exactly over the canvas
            const gameArea = document.querySelector('.game-area');
            const gameAreaRect = gameArea.getBoundingClientRect();
            
            // Calculate position relative to game area
            const topOffset = canvasRect.top - gameAreaRect.top;
            const leftOffset = canvasRect.left - gameAreaRect.left;
            
            // Set position
            tapControls.style.position = 'absolute';
            tapControls.style.top = topOffset + 'px';
            tapControls.style.left = leftOffset + 'px';
            tapControls.style.width = canvasRect.width + 'px';
            tapControls.style.height = canvasRect.height + 'px';
            
            return true;
        }
        
        return false;
    }
    
    // Check alignment every second
    let checkInterval = setInterval(function() {
        checkTapAlignment();
    }, 1000);
    
    // Also check on scroll, resize, and orientation change
    window.addEventListener('resize', checkTapAlignment);
    window.addEventListener('scroll', checkTapAlignment);
    window.addEventListener('orientationchange', function() {
        // Check multiple times after orientation change
        setTimeout(checkTapAlignment, 100);
        setTimeout(checkTapAlignment, 500);
        setTimeout(checkTapAlignment, 1000);
    });
    
    // Make the function available globally for manual checks
    window.checkTapAlignment = checkTapAlignment;
    
    // Also add an activation function users can call if they notice an issue
    window.fixMyTapZones = function() {
        const result = checkTapAlignment();
        if (window.emergencyTapFix) {
            window.emergencyTapFix();
            return "Emergency tap fix and alignment check completed";
        }
        return result ? "Tap zones realigned" : "Tap zones already aligned correctly";
    };
})();
