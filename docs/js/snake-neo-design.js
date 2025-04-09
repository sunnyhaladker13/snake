/**
 * Neo-brutalist Snake Design
 * Fixed design with bold colors and high contrast elements
 */

// Store the design constants
const snakeNeoDesign = {
    head: '#FF5F1F', // Bold orange head
    headGlow: '#FF303F', // Red glow
    eyeSocket: '#000000', // Black eye sockets
    pupilGlow: '#FFFC31', // Yellow pupil glow
    
    // Body uses a bold, high contrast pattern
    bodyGradient: (i, total, pulse) => {
        // Create a segmented pattern with neo-brutalist colors
        const segment = i % 3; // Creates a repeating pattern every 3 segments
        
        // Calculate pulse for dramatic effect
        const pulseAmount = Math.sin(Date.now() / 300) * 30; // More dramatic pulse
        
        switch(segment) {
            case 0:
                return `rgb(255, 95, 31)`; // Orange
            case 1:
                return `rgb(0, 223, 252)`; // Cyan
            case 2:
                return `rgb(255, 48, 63)`; // Red
            default:
                return `rgb(255, 252, 49)`; // Yellow (fallback)
        }
    },
    
    // For special effects
    glowStrength: 12,
    borderWidth: 2,
    
    // Food styles
    foodColors: {
        regular: '#FF303F',
        bonus: '#FFFC31',
        super: '#AA00FF',
        mega: '#00DFFC',
        multiplier: '#FF00FF'
    },
    
    // Food glow effects
    foodGlow: true
};

// Function to get the snake design - replacement for the theme-based approach
function getSnakeTheme() {
    return snakeNeoDesign;
}

// Export the design getter
window.getSnakeTheme = getSnakeTheme;
