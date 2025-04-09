/**
 * Mobile Instructions Remover
 * Specifically removes mobile instructions popup
 */

(function() {
    console.log("INSTRUCTIONS REMOVER: Initialized");
    
    // Run immediately to prevent popups from appearing
    function removeInstructions() {
        // Force mark all tutorials as seen
        localStorage.setItem('mobileInstructionsShown', 'true');
        localStorage.setItem('tapOnboardingShown', 'true');
        localStorage.setItem('onboardingShown', 'true');
        localStorage.setItem('controlsOnboardingShown', 'true');
        
        // Hide the mobile instructions panel if it exists
        const mobileInstructions = document.getElementById('mobileInstructions');
        if (mobileInstructions) {
            console.log("INSTRUCTIONS REMOVER: Hiding mobile instructions panel");
            mobileInstructions.style.display = 'none';
            
            try {
                // Try to remove it completely
                if (mobileInstructions.parentNode) {
                    mobileInstructions.parentNode.removeChild(mobileInstructions);
                }
            } catch(e) {}
        }
        
        // Hide the close button if it exists
        const closeBtn = document.getElementById('closeInstructions');
        if (closeBtn) closeBtn.style.display = 'none';
        
        // Hide any onboarding overlays
        const overlays = [
            document.getElementById('tapOnboardingOverlay'),
            document.getElementById('onboardingOverlay'),
            document.querySelector('.onboarding-overlay')
        ];
        
        overlays.forEach(overlay => {
            if (overlay) {
                console.log("INSTRUCTIONS REMOVER: Hiding overlay", overlay.id || overlay.className);
                overlay.style.display = 'none';
                
                try {
                    // Try to remove it completely
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                } catch(e) {}
            }
        });
        
        return true;
    }
    
    // Run immediately
    removeInstructions();
    
    // Also run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeInstructions);
    }
    
    // And after everything is loaded
    window.addEventListener('load', () => {
        // Run multiple times to catch any delayed popups
        setTimeout(removeInstructions, 100);
        setTimeout(removeInstructions, 500);
        setTimeout(removeInstructions, 1000);
        setTimeout(removeInstructions, 2000);
    });
    
    // Make function available globally
    window.removeInstructions = removeInstructions;
})();
