# Snake Game UX Test Script

This document provides a structured approach to manually test the user experience of the Snake Game.

## Setup

1. Open the game in a web browser at: [https://sunnyhaladker13.github.io/snake/](https://sunnyhaladker13.github.io/snake/)
2. Have a notepad ready to record observations
3. Consider recording the screen during testing

## Test Scenarios

### Basic Gameplay Test

1. **Start the game**
   - Click the "Start" button
   - Expected: Snake should begin moving to the right
   - Note any delay or visual issues

2. **Control the snake**
   - Use arrow keys to change the snake's direction
   - Use WASD keys as alternative controls
   - Note: Is response immediate? Any missed inputs?

3. **Eat different types of food**
   - Navigate to eat at least one of each food type:
     - Regular (red)
     - Bonus (yellow)
     - Super (purple)
     - Mega (cyan)
     - Multiplier (pink star)
   - Note: Does score increment correctly? Are animations smooth?

4. **Test pause functionality**
   - Press the 'P' key while playing
   - Also test the pause button
   - Expected: Game should pause/resume correctly
   - Note: Is the pause state clearly visible?

5. **Reach game over**
   - Deliberately collide with the snake's own body
   - Expected: Game over message should appear
   - Note: Is the message clear? Is the restart option obvious?

6. **Restart the game**
   - Click the restart button
   - Expected: Game should reset to initial state
   - Note: Does everything reset properly (score, snake position, etc.)?

### Responsive Design Test

For each device type (desktop, tablet, mobile phone):

1. **Window resizing**
   - Play the game, then resize the browser window
   - Expected: Game should adjust layout appropriately
   - Note any layout problems or controls that become inaccessible

2. **Orientation change** (mobile/tablet)
   - Start the game in portrait orientation
   - Rotate device to landscape
   - Expected: Layout should adapt properly
   - Note: Can the game still be played comfortably?

### Mobile-specific Tests

1. **Touch controls**
   - Test tap zones for directional control
   - Test swipe gestures for direction changes
   - Note: Are controls responsive? Any accidental inputs?

2. **Mobile instructions**
   - Verify that mobile instructions appear on first visit
   - Dismiss and verify they don't reappear on refresh
   - Note: Are instructions clear and helpful?

3. **Game info and controls**
   - Test info button functionality
   - Test controls guide visibility
   - Note: Is information easily accessible on small screens?

### Visual Attention Test

1. **Play without focusing on UI elements**
   - Play the game naturally for 2 minutes
   - Note any visual elements that:
     - Draw too much attention away from gameplay
     - Are too subtle to notice
     - Cause visual fatigue or confusion

2. **Score visibility test**
   - Play normally and note if you're able to track your score without specifically looking at the score counter
   - Note: Is score information processed peripherally or requires focus?

## Rating System

For each test section, rate the following on a scale of 1-5 (1=Poor, 5=Excellent):

1. **Intuitiveness**: How easy was it to understand what to do?
2. **Responsiveness**: How quickly did the game respond to inputs?
3. **Visual clarity**: How clear were the visual elements?
4. **Satisfaction**: How satisfying was the interaction?
5. **Engagement**: How engaging was the experience?

## Open Feedback

Record any additional observations about:
- Frustration points
- Moments of confusion
- Enjoyable aspects
- Suggestions for improvement

## Performance Notes

- Did the game maintain a consistent frame rate?
- Were there any noticeable lags or stutters?
- Did the battery drain noticeably during testing?
- Were there any crashes or freezes?
