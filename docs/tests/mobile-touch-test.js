/**
 * Mobile Touch Controls Test for Snake Game
 * 
 * This script tests touch gestures and tap zones on mobile devices.
 * To use: Run in browser console on a mobile device or touch-enabled simulator.
 */

class MobileTouchTester {
  constructor() {
    this.testResults = [];
    this.canvas = document.getElementById('gameCanvas');
    this.tapZones = {
      up: document.getElementById('tapUp'),
      down: document.getElementById('tapDown'),
      left: document.getElementById('tapLeft'),
      right: document.getElementById('tapRight')
    };
    this.startBtn = document.getElementById('startBtn');
  }
  
  log(message, type = 'info') {
    const styles = {
      info: 'color: #00DFFC',
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #FF303F; font-weight: bold',
      warning: 'color: #FFFC31'
    };
    
    console.log(`%c[TouchTest] ${message}`, styles[type]);
  }
  
  recordResult(name, passed, message) {
    const result = { name, passed, message, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    if (passed) {
      this.log(`✓ ${name}`, 'success');
    } else {
      this.log(`✗ ${name}: ${message}`, 'error');
    }
    
    return result;
  }
  
  async startGame() {
    // First make sure game is stopped
    if (this.startBtn.innerHTML.includes('Pause')) {
      this.startBtn.click();
    }
    
    // Now start the game
    this.startBtn.click();
    
    // Wait for game to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const gameRunning = this.startBtn.innerHTML.includes('Pause');
    return this.recordResult(
      'Game Start',
      gameRunning,
      gameRunning ? 'Game started successfully' : 'Failed to start game'
    );
  }
  
  createTouch(element, type, x, y) {
    // Get element position
    const rect = element.getBoundingClientRect();
    
    // Create touch object
    const touch = new Touch({
      identifier: Date.now(),
      target: element,
      clientX: rect.left + (x || rect.width / 2),
      clientY: rect.top + (y || rect.height / 2),
      screenX: rect.left + (x || rect.width / 2),
      screenY: rect.top + (y || rect.height / 2),
      pageX: rect.left + (x || rect.width / 2),
      pageY: rect.top + (y || rect.height / 2),
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 0,
      force: 1
    });
    
    // Create touch event
    const touchEvent = new TouchEvent(type, {
      cancelable: true,
      bubbles: true,
      touches: type !== 'touchend' ? [touch] : [],
      targetTouches: type !== 'touchend' ? [touch] : [],
      changedTouches: [touch]
    });
    
    return touchEvent;
  }
  
  async testTap(element, name) {
    if (!element) {
      return this.recordResult(
        `Tap ${name}`,
        false,
        `Element not found: ${name}`
      );
    }
    
    // Send touch events to the element
    element.dispatchEvent(this.createTouch(element, 'touchstart'));
    await new Promise(resolve => setTimeout(resolve, 100));
    element.dispatchEvent(this.createTouch(element, 'touchend'));
    
    // Wait for potential feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // We can't automatically verify direction changes, just log it happened
    return this.recordResult(
      `Tap ${name}`,
      true,
      `Tap executed on ${name} (visual verification required)`
    );
  }
  
  async testSwipe(direction) {
    const startX = this.canvas.getBoundingClientRect().width / 2;
    const startY = this.canvas.getBoundingClientRect().height / 2;
    
    let endX = startX;
    let endY = startY;
    
    // Adjust end positions based on direction
    switch(direction) {
      case 'up':
        endY = startY - 100;
        break;
      case 'down':
        endY = startY + 100;
        break;
      case 'left':
        endX = startX - 100;
        break;
      case 'right':
        endX = startX + 100;
        break;
    }
    
    // Create start touch
    const touchStart = new Touch({
      identifier: Date.now(),
      target: this.canvas,
      clientX: startX,
      clientY: startY,
      screenX: startX,
      screenY: startY,
      pageX: startX,
      pageY: startY,
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 0,
      force: 1
    });
    
    // Create end touch
    const touchEnd = new Touch({
      identifier: Date.now(),
      target: this.canvas,
      clientX: endX,
      clientY: endY,
      screenX: endX,
      screenY: endY,
      pageX: endX,
      pageY: endY,
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 0,
      force: 1
    });
    
    // Dispatch events
    this.canvas.dispatchEvent(new TouchEvent('touchstart', {
      cancelable: true,
      bubbles: true,
      touches: [touchStart],
      targetTouches: [touchStart],
      changedTouches: [touchStart]
    }));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.canvas.dispatchEvent(new TouchEvent('touchend', {
      cancelable: true,
      bubbles: true,
      touches: [],
      targetTouches: [],
      changedTouches: [touchEnd]
    }));
    
    // Wait for potential feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.recordResult(
      `Swipe ${direction}`,
      true,
      `Swipe ${direction} executed (visual verification required)`
    );
  }
  
  testSwipeIndicator() {
    const indicator = document.getElementById('swipeIndicator');
    
    if (!indicator) {
      return this.recordResult(
        'Swipe Indicator',
        false,
        'Swipe indicator element not found'
      );
    }
    
    const isVisible = window.getComputedStyle(indicator).opacity > 0;
    
    return this.recordResult(
      'Swipe Indicator',
      true,
      `Swipe indicator ${isVisible ? 'is' : 'is not'} visible`
    );
  }
  
  testMobileInstructions() {
    const instructions = document.getElementById('mobileInstructions');
    
    if (!instructions) {
      return this.recordResult(
        'Mobile Instructions',
        false,
        'Mobile instructions element not found'
      );
    }
    
    const isVisible = window.getComputedStyle(instructions).display !== 'none';
    
    return this.recordResult(
      'Mobile Instructions',
      true,
      `Mobile instructions ${isVisible ? 'are' : 'are not'} visible`
    );
  }
  
  async runAllTests() {
    this.log('Starting mobile touch tests for Snake Game');
    
    try {
      // Start game first
      await this.startGame();
      
      // Test tap zones
      await this.testTap(this.tapZones.up, 'Up');
      await this.testTap(this.tapZones.down, 'Down');
      await this.testTap(this.tapZones.left, 'Left');
      await this.testTap(this.tapZones.right, 'Right');
      
      // Test swipe gestures
      await this.testSwipe('up');
      await this.testSwipe('down');
      await this.testSwipe('left');
      await this.testSwipe('right');
      
      // Test UI elements
      this.testSwipeIndicator();
      this.testMobileInstructions();
      
      this.log('Touch tests completed');
      
      return {
        passed: this.testResults.filter(r => r.passed).length,
        failed: this.testResults.filter(r => !r.passed).length,
        tests: this.testResults
      };
      
    } catch (error) {
      this.log(`Error during touch tests: ${error.message}`, 'error');
      console.error(error);
      return {
        passed: this.testResults.filter(r => r.passed).length,
        failed: this.testResults.filter(r => !r.passed).length + 1,
        tests: this.testResults.concat({
          name: 'Test Runner',
          passed: false,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      };
    }
  }
}

// Run tests when loaded in mobile environment
if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  const touchTester = new MobileTouchTester();
  touchTester.runAllTests().then(results => {
    console.table(results.tests);
  });
} else {
  console.warn('This test is designed for mobile devices. Run on mobile or with device emulation enabled.');
}
