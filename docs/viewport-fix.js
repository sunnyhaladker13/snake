/**
 * Viewport Meta Tag Fix
 * Ensures the viewport meta tag is set correctly for mobile devices
 */

(function() {
    console.log("VIEWPORT FIX: Checking viewport meta tag");
    
    // Run this fix immediately - it's critical for proper mobile display
    function fixViewport() {
        // Check for viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            // Create viewport meta if missing
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
            console.log("VIEWPORT FIX: Created missing viewport meta tag");
        }
        
        // Set proper viewport content for modern mobile devices - no user-scalable to prevent zoom issues
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        console.log("VIEWPORT FIX: Viewport meta tag set correctly");
        
        // Add additional meta tags for better mobile experience
        
        // Mobile web app capable
        let mobileWebApp = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (!mobileWebApp) {
            mobileWebApp = document.createElement('meta');
            mobileWebApp.name = 'apple-mobile-web-app-capable';
            mobileWebApp.content = 'yes';
            document.head.appendChild(mobileWebApp);
        }
        
        // Mobile status bar style
        let statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!statusBar) {
            statusBar = document.createElement('meta');
            statusBar.name = 'apple-mobile-web-app-status-bar-style';
            statusBar.content = 'black';
            document.head.appendChild(statusBar);
        }
        
        // Also add proper mobile touchmove handling to prevent pull-to-refresh
        document.addEventListener('touchmove', function(e) {
            // Only prevent default on the game canvas to avoid pull-to-refresh interference
            const canvas = document.getElementById('gameCanvas');
            if (canvas && e.target === canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        
        return true;
    }
    
    // Run immediately
    fixViewport();
    
    // Also run on DOMContentLoaded to ensure all elements are available
    document.addEventListener('DOMContentLoaded', fixViewport);
    
    // Expose to window for manual calls
    window.fixViewport = fixViewport;
})();
