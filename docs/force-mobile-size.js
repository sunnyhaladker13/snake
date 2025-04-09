/**
 * Force Mobile Size Fix
 * Aggressively ensures the game is properly sized on mobile devices
 * This addresses the "too small on phone" issue
 */

(function() {
    // Only run on actual mobile devices or very narrow screens
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (!isMobile) {
        console.log("FORCE MOBILE SIZE: Not a mobile device, skipping");
        return;
    }
    
    console.log("FORCE MOBILE SIZE: Mobile device detected, maximizing game size");
    
    function forceGameSize() {
        // Get key elements
        const canvas = document.getElementById('gameCanvas');
        const gameArea = document.querySelector('.game-area');
        const gameContainer = document.querySelector('.game-container');
        
        if (!canvas || !gameArea) {
            console.warn("FORCE MOBILE SIZE: Key elements not found yet");
            return false;
        }
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate optimal game area size - use nearly full viewport width and 70% of height
        const gameAreaWidth = viewportWidth * 0.98;
        const gameAreaHeight = viewportHeight * 0.7;
        
        // Modify game area to fill more space
        gameArea.style.width = '98%';
        gameArea.style.height = `${gameAreaHeight}px`;
        gameArea.style.margin = '0 auto';
        gameArea.style.maxWidth = 'none'; // Remove any max-width restrictions
        
        // Modify game container to use full width
        if (gameContainer) {
            gameContainer.style.maxWidth = '100%';
            gameContainer.style.width = '100%';
            gameContainer.style.padding = '0.5rem';
            gameContainer.style.margin = '0 auto';
        }
        
        // Calculate canvas size - make it as large as possible while keeping it square
        const canvasSize = Math.min(gameAreaWidth * 0.98, gameAreaHeight * 0.98);
        
        console.log("FORCE MOBILE SIZE: Setting canvas display size to", canvasSize);
        
        // Apply size to canvas - CRITICAL: Set both CSS and element dimensions
        canvas.style.width = `${canvasSize}px`;
        canvas.style.height = `${canvasSize}px`;
        
        // Ensure canvas is visible and properly positioned
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.backgroundColor = '#000';
        
        // If we have access to the canvas dimensions directly, update those too
        if (typeof window.resizeGameCanvas === 'function') {
            console.log("FORCE MOBILE SIZE: Calling game resize function");
            window.resizeGameCanvas();
        } else {
            console.log("FORCE MOBILE SIZE: Manually setting canvas dimensions");
            // Force canvas dimensions directly - will cause redraw
            canvas.width = Math.round(canvasSize);
            canvas.height = Math.round(canvasSize);
        }
        
        // Make scoreboard more visible on mobile
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.style.fontSize = '2rem';
            scoreElement.style.fontWeight = 'bold';
        }
        
        // Make buttons bigger and more tappable
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.padding = '0.8rem 1.5rem';
            btn.style.fontSize = '1.3rem';
            btn.style.margin = '0.5rem';
            btn.style.minWidth = '120px';
        });
        
        // Update tap controls if they exist
        if (typeof window.ensureTapZoneAlignment === 'function') {
            setTimeout(window.ensureTapZoneAlignment, 100);
        }

        return true;
    }
    
    // Run immediately and after delays to catch all possible initialization points
    setTimeout(forceGameSize, 100);
    setTimeout(forceGameSize, 500);
    
    // Run after DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(forceGameSize, 100);
    });
    
    // Run after window loaded
    window.addEventListener('load', () => {
        setTimeout(forceGameSize, 100);
        setTimeout(forceGameSize, 1000);
    });
    
    // Run after orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(forceGameSize, 300);
        setTimeout(forceGameSize, 1000);
    });
    
    // Run on resize
    window.addEventListener('resize', () => {
        setTimeout(forceGameSize, 300);
    });
    
    // Make manually callable
    window.forceGameSize = forceGameSize;
    
    console.log("FORCE MOBILE SIZE: Size enforcement initialized");
})();
