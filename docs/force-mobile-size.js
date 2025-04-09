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
        
        // ENHANCED: Calculate optimal game area size - use even more space (85% of height)
        const gameAreaWidth = viewportWidth;
        const gameAreaHeight = viewportHeight * 0.85;
        
        // Modify game area to fill more space - full width
        gameArea.style.width = '100%';
        gameArea.style.height = `${gameAreaHeight}px`;
        gameArea.style.margin = '0';
        gameArea.style.padding = '0';
        gameArea.style.maxWidth = 'none';
        gameArea.style.position = 'relative';
        
        // Modify game container to use absolutely all available width
        if (gameContainer) {
            gameContainer.style.maxWidth = '100%';
            gameContainer.style.width = '100%';
            gameContainer.style.padding = '0';
            gameContainer.style.margin = '0';
            gameContainer.style.border = 'none';
        }
        
        // Calculate canvas size - make it as large as possible
        // ENHANCED: Use 100% width instead of 98% for maximum space usage
        const canvasSize = Math.min(gameAreaWidth, gameAreaHeight);
        
        console.log("FORCE MOBILE SIZE: Setting canvas display size to", canvasSize);
        
        // Apply size to canvas - CRITICAL: Set both CSS and element dimensions
        canvas.style.width = `${canvasSize}px`;
        canvas.style.height = `${canvasSize}px`;
        
        // Ensure canvas is visible and properly positioned
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.backgroundColor = '#000';
        canvas.style.boxShadow = 'none'; // Remove any shadow
        
        // Force actual canvas dimensions (not just CSS)
        canvas.width = Math.round(canvasSize);
        canvas.height = Math.round(canvasSize);
        
        // If we have access to the resizeGameCanvas function, call it
        if (typeof window.resizeGameCanvas === 'function') {
            console.log("FORCE MOBILE SIZE: Calling game resize function");
            setTimeout(window.resizeGameCanvas, 50);
        }
        
        // Make scoreboard more visible on mobile
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.style.fontSize = '2.5rem';
            scoreElement.style.fontWeight = 'bold';
        }
        
        // Make buttons bigger and more tappable
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.padding = '1rem 1.8rem';
            btn.style.fontSize = '1.4rem';
            btn.style.margin = '0.3rem';
            btn.style.minWidth = '120px';
            btn.style.borderWidth = '3px'; // Thicker borders for neo-brutalist look
        });
        
        // Make all text bigger
        document.querySelectorAll('h1, h2, h3').forEach(heading => {
            heading.style.fontSize = '1.8rem';
        });
        
        // Hide instructions on mobile - they take up valuable space
        const instructions = document.querySelector('.game-info');
        if (instructions) {
            instructions.style.display = 'none';
        }
        
        // Update tap controls sizing for the new canvas dimensions
        updateTapControls();

        return true;
    }
    
    // Helper function to update tap controls sizing
    function updateTapControls() {
        // Update any tap controls that might exist
        if (typeof window.ensureTapZoneAlignment === 'function') {
            setTimeout(window.ensureTapZoneAlignment, 100);
        }
        
        // Direct update for game's tap controls - bigger tap zones
        const tapControlsDiv = document.querySelector('.tap-controls');
        if (tapControlsDiv) {
            tapControlsDiv.style.width = '100%';
            tapControlsDiv.style.height = '100%';
            
            // Make tap zones bigger and easier to touch
            const tapZones = ['tapUp', 'tapDown', 'tapLeft', 'tapRight'];
            tapZones.forEach(id => {
                const zone = document.getElementById(id);
                if (zone) {
                    // Ensure each zone has proper touch styles
                    zone.style.touchAction = 'none';
                    zone.style.pointerEvents = 'auto';
                    zone.style.fontSize = '32px'; // Larger direction indicators
                }
            });
        }
    }
    
    // Run immediately and after delays to catch all possible initialization points
    setTimeout(forceGameSize, 100);
    setTimeout(forceGameSize, 500);
    
    // Run after DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(forceGameSize, 100);
        setTimeout(forceGameSize, 500);
    });
    
    // Run after window loaded
    window.addEventListener('load', () => {
        setTimeout(forceGameSize, 100);
        setTimeout(forceGameSize, 1000);
        setTimeout(forceGameSize, 2000); // Extra attempt for slow devices
    });
    
    // Run after orientation change with multiple attempts
    window.addEventListener('orientationchange', () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(forceGameSize, 300 + (i * 500)); // Check multiple times
        }
    });
    
    // Run on resize
    window.addEventListener('resize', () => {
        setTimeout(forceGameSize, 300);
    });
    
    // Make manually callable
    window.forceGameSize = forceGameSize;
    
    console.log("FORCE MOBILE SIZE: Size enforcement initialized");
})();
