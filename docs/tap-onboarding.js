/**
 * Tap Zone Onboarding Guide
 * Shows subtle hints for new players on how to use the tap zones
 * Uses neo-brutalist styling that matches the game
 */

(function() {
    // IMPORTANT: Skip showing onboarding completely by marking it as seen already
    localStorage.setItem('tapOnboardingShown', 'true');
    
    // Only run on mobile
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
        return;
    }
    
    console.log("TAP ONBOARDING: Initializing for mobile (disabled)");
    
    // Function to show onboarding hints - no longer used but keeping for reference
    function showOnboardingHints() {
        // Always return early - disabled completely
        return;
    }
    
    // Override to make sure onboarding never shows
    window.showTapOnboarding = function() {
        console.log("TAP ONBOARDING: Disabled by user request");
        return false;
    };
})();
