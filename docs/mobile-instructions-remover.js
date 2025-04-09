/**
 * Mobile Instructions Remover
 * Aggressively removes all mobile instructions, onboarding, and popups
 */

(function() {
    console.log("INSTRUCTIONS REMOVER: Initialized - removing ALL instructions and onboarding");
    
    // List of all instruction elements to remove by ID and class
    const elementsToRemove = [
        // IDs
        'mobileInstructions',
        'closeInstructions',
        'tapOnboardingOverlay',
        'onboardingOverlay',
        'mobileTutorial',
        'controlsGuide',
        'instructionsPopup',
        'tutorialOverlay',
        'howToPlay',
        'gameInstructions',
        'welcomeMessage',
        'iosReloadButton',
        
        // Classes (will be queried separately)
        '.onboarding-overlay',
        '.instructions',
        '.guide-toggle',
        '.tutorial',
        '.popup',
        '.hint',
        '.game-info',
        '.mobile-instructions',
        '.info-box',
        '.help-text',
        '.swipe-hint',
        '.tap-hint'
    ];
    
    function removeInstructions() {
        console.log("INSTRUCTIONS REMOVER: Running aggressive removal");
        
        // Force mark ALL possible localStorage flags to prevent instructions
        const flagsToSet = [
            'mobileInstructionsShown',
            'tapOnboardingShown',
            'onboardingShown',
            'controlsOnboardingShown',
            'tutorialComplete',
            'hasSeenInstructions',
            'welcomeShown',
            'hintsDisabled',
            'guidesHidden',
            'tipsSeen'
        ];
        
        // Set all flags
        flagsToSet.forEach(flag => localStorage.setItem(flag, 'true'));
        
        // Remove elements by ID
        elementsToRemove.forEach(selector => {
            if (selector.startsWith('.')) {
                // Class selector - get all matching elements
                document.querySelectorAll(selector).forEach(el => {
                    if (el) {
                        el.style.display = 'none';
                        try {
                            if (el.parentNode) {
                                el.parentNode.removeChild(el);
                                console.log(`INSTRUCTIONS REMOVER: Removed ${selector} element`);
                            }
                        } catch(e) {}
                    }
                });
            } else {
                // ID selector
                const el = document.getElementById(selector);
                if (el) {
                    el.style.display = 'none';
                    try {
                        if (el.parentNode) {
                            el.parentNode.removeChild(el);
                            console.log(`INSTRUCTIONS REMOVER: Removed #${selector} element`);
                        }
                    } catch(e) {}
                }
            }
        });
        
        // Check if any internal instruction functions exist and disable them
        const functionsToDisable = [
            'showOnboarding',
            'showTutorial',
            'showInstructions',
            'displayHowToPlay',
            'showWelcome',
            'showControlsGuide'
        ];
        
        functionsToDisable.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                window[funcName] = function() { 
                    console.log(`INSTRUCTIONS REMOVER: Blocked ${funcName} from running`);
                    return false; 
                };
            }
        });
        
        // Override any show functions that might be created later
        window.showInstructions = function() { return false; };
        window.showOnboarding = function() { return false; };
        window.showTutorial = function() { return false; };
        
        return true;
    }
    
    // Observer to detect and remove dynamically added instruction elements
    function setupMutationObserver() {
        // Create an observer to watch for new elements
        const observer = new MutationObserver(mutations => {
            let needsCheck = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    needsCheck = true;
                }
            });
            
            if (needsCheck) {
                console.log("INSTRUCTIONS REMOVER: New elements detected, checking for instructions");
                removeInstructions();
            }
        });
        
        // Start observing document body for added nodes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log("INSTRUCTIONS REMOVER: Monitoring for new instruction elements");
    }
    
    // Run immediately
    removeInstructions();
    
    // Also run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            removeInstructions();
            setupMutationObserver();
        });
    } else {
        // DOM already loaded
        setupMutationObserver();
    }
    
    // And after everything is loaded
    window.addEventListener('load', () => {
        // Run multiple times to catch any delayed popups
        setTimeout(removeInstructions, 100);
        setTimeout(removeInstructions, 500);
        setTimeout(removeInstructions, 1000);
        setTimeout(removeInstructions, 2000);
    });
    
    // Set up interval to check periodically
    setInterval(removeInstructions, 2000);
    
    // Make function available globally
    window.removeAllInstructions = removeInstructions;
})();
