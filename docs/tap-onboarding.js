/**
 * Tap Zone Onboarding Guide - COMPLETELY DISABLED
 */

(function() {
    // Force set ALL localStorage flags to prevent onboarding
    localStorage.setItem('tapOnboardingShown', 'true');
    localStorage.setItem('onboardingShown', 'true');
    localStorage.setItem('controlsOnboardingShown', 'true');
    localStorage.setItem('tutorialComplete', 'true');
    localStorage.setItem('hasSeenInstructions', 'true');
    localStorage.setItem('hintsDisabled', 'true');
    localStorage.setItem('welcomeShown', 'true');
    
    console.log("TAP ONBOARDING: Completely disabled");
    
    // Override the showOnboardingHints function to do nothing
    window.showOnboardingHints = function() {
        console.log("TAP ONBOARDING: Attempted to show onboarding, but it's disabled");
        return false;
    };
    
    // Override to make sure onboarding never shows
    window.showTapOnboarding = function() {
        return false;
    };
    
    // Clean up any existing onboarding elements
    function removeExistingOnboarding() {
        const elementsToRemove = [
            'tapOnboardingOverlay',
            'onboardingOverlay',
            'onboardingHint',
            'tapHint'
        ];
        
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        document.querySelectorAll('.onboarding, .hint, .tap-hint, .onboarding-overlay').forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }
    
    // Run cleanup immediately
    removeExistingOnboarding();
    
    // Also run after DOM loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeExistingOnboarding);
    }
    
    // And after page fully loaded
    window.addEventListener('load', () => {
        setTimeout(removeExistingOnboarding, 100);
        setTimeout(removeExistingOnboarding, 1000);
    });
})();
