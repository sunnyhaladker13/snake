/**
 * Snake Theme Manager
 * Handles the different visual themes for the snake
 */

// Store the current selected theme
let currentTheme = 'blue';

// Theme settings with colors for head and body
const themes = {
    blue: {
        head: '#00CED1',
        headGlow: '#00FFFF',
        eyeSocket: '#008B8B',
        pupilGlow: '#00FFAA',
        bodyGradient: (i, total, pulse) => {
            // Blue gradient with pulse
            const segmentIdx = i / total;
            const blueValue = Math.floor(220 - segmentIdx * 100 + pulse);
            const greenValue = Math.floor(180 - segmentIdx * 60 + pulse);
            return `rgb(20, ${greenValue}, ${blueValue})`;
        }
    },
    green: {
        head: '#32CD32',
        headGlow: '#00FF00',
        eyeSocket: '#006400',
        pupilGlow: '#ADFF2F',
        bodyGradient: (i, total, pulse) => {
            // Green gradient with pulse
            const segmentIdx = i / total;
            const greenValue = Math.floor(200 - segmentIdx * 100 + pulse);
            return `rgb(0, ${greenValue}, 0)`;
        }
    },
    fire: {
        head: '#FF4500',
        headGlow: '#FF0000',
        eyeSocket: '#8B0000',
        pupilGlow: '#FFFF00',
        bodyGradient: (i, total, pulse) => {
            // Fire gradient with pulse
            const segmentIdx = i / total;
            const redValue = Math.floor(255 - segmentIdx * 50);
            const greenValue = Math.floor(140 - segmentIdx * 90 + pulse);
            return `rgb(${redValue}, ${greenValue}, 0)`;
        }
    },
    rainbow: {
        head: '#FF1493',
        headGlow: '#FF00FF',
        eyeSocket: '#8B008B',
        pupilGlow: '#FFFFFF',
        bodyGradient: (i, total, pulse) => {
            // Rainbow gradient based on position
            const hue = (i * 25 + Date.now() / 50) % 360;
            return `hsl(${hue}, 100%, 50%)`;
        }
    }
};

// Function to get current theme colors
function getSnakeTheme() {
    return themes[currentTheme];
}

// Initialize theme selectors
document.addEventListener('DOMContentLoaded', () => {
    const themeOptions = document.querySelectorAll('.snake-theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            option.classList.add('active');
            
            // Set the current theme based on which option was clicked
            if (option.id === 'blueTheme') currentTheme = 'blue';
            else if (option.id === 'greenTheme') currentTheme = 'green';
            else if (option.id === 'fireTheme') currentTheme = 'fire';
            else if (option.id === 'rainbowTheme') currentTheme = 'rainbow';
        });
    });
});

// Export the theme getter
window.getSnakeTheme = getSnakeTheme;
