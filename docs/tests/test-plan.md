# Snake Game Test Plan

This document outlines the testing approach for the Snake Game to identify bugs and UX issues.

## 1. Core Functionality Tests

### Game Initialization
- [ ] Game properly initializes on page load
- [ ] Canvas is created with correct dimensions
- [ ] Snake is positioned correctly at start
- [ ] Initial food spawns correctly
- [ ] Score is set to 0

### Movement and Controls
- [ ] Snake moves in correct initial direction (right)
- [ ] Arrow keys correctly change snake direction
- [ ] WASD keys correctly change snake direction
- [ ] Snake cannot immediately reverse direction (e.g., from right to left)
- [ ] Multiple key presses in quick succession are queued and processed correctly
- [ ] Snake wraps around screen edges correctly

### Collision Detection
- [ ] Self-collision detection works correctly
- [ ] Food collision detection works correctly
- [ ] Multiplier fruit collision detection works correctly

### Food Mechanics
- [ ] Regular food spawns correctly (10 points)
- [ ] Bonus food spawns correctly (30 points)
- [ ] Super food spawns correctly (50 points)
- [ ] Mega food spawns correctly (100 points)
- [ ] Multiplier fruit (×5) spawns and functions correctly
- [ ] Food never spawns on snake body
- [ ] Multiplier never spawns on snake body or food
- [ ] Food/multiplier respawns when collected

### Game State
- [ ] Start button works correctly
- [ ] Pause functionality (P key and button) works correctly
- [ ] Game over state activates on self-collision
- [ ] Restart button works during gameplay
- [ ] Restart button works from game over state
- [ ] Score increases correctly based on food type

## 2. UX Tests

### Visual Elements
- [ ] Snake animates smoothly
- [ ] Different fruit types are visually distinct
- [ ] Score counter animates when updated
- [ ] Game over message displays clearly
- [ ] Pause message displays clearly
- [ ] Snake head visual direction matches movement direction

### Information Display
- [ ] Info panel displays correctly
- [ ] Controls guide explains all controls
- [ ] Fruit guide explains all fruit types
- [ ] Mobile instructions display properly on mobile devices

### Responsive Design
- [ ] Game is playable on desktop (various window sizes)
- [ ] Game is playable on tablets (various orientations)
- [ ] Game is playable on mobile phones (various sizes and orientations)
- [ ] Layout adapts correctly when resizing window/changing orientation
- [ ] Canvas and grid scale proportionally with screen size
- [ ] Touch controls are accessible on mobile

### Touch Controls
- [ ] Tap controls for mobile work correctly
- [ ] Swipe gestures register properly
- [ ] Visual feedback appears when touching/swiping
- [ ] Haptic feedback works (if supported)

## 3. Edge Cases and Stress Tests

### Performance
- [ ] Game maintains stable framerate with long snake (30+ segments)
- [ ] Game handles rapid direction changes
- [ ] Game handles rapidly growing snake without issues

### Boundary Conditions
- [ ] Game handles very small viewport size
- [ ] Game handles extreme aspect ratios (very wide/tall screens)
- [ ] Game handles device rotation mid-game
- [ ] Game handles browser tab switching/background

### Input Handling
- [ ] Game handles multiple simultaneous key presses
- [ ] Game handles touch input during animations
- [ ] Game handles multi-touch input correctly

## 4. Browser Compatibility

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 5. Bug Tracking Template

For each bug found, record:

1. **Bug ID**: Unique identifier
2. **Summary**: Brief description of the issue
3. **Steps to Reproduce**: Detailed steps to replicate the bug
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happens
6. **Environment**: Browser, OS, device, screen size
7. **Severity**: Critical, Major, Minor, Cosmetic
8. **Priority**: High, Medium, Low
9. **Status**: New, In Progress, Fixed, Verified
10. **Screenshots/Video**: Visual evidence if applicable
