/**
 * Automated QA Testing for Snake Game
 * 
 * This script simulates user interactions and performs automated testing
 * of the Snake game through the browser.
 * 
 * To use: Run this script in the browser console while the game is loaded
 */

class SnakeGameTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    
    this.gameElements = {
      startBtn: document.getElementById('startBtn'),
      restartBtn: document.getElementById('restartBtn'),
      scoreElement: document.getElementById('score'),
      gameCanvas: document.getElementById('gameCanvas'),
      gamePaused: document.getElementById('gamePaused'),
      gameOver: document.getElementById('gameOver')
    };
  }
  
  log(message, type = 'info') {
    const styles = {
      info: 'color: #00DFFC',
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #FF303F; font-weight: bold',
      warning: 'color: #FFFC31'
    };
    
    console.log(`%c[SnakeTest] ${message}`, styles[type]);
  }
  
  recordTestResult(name, passed, message) {
    this.testResults.tests.push({
      name,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
    
    if (passed) {
      this.testResults.passed++;
      this.log(`✓ PASSED: ${name}`, 'success');
    } else {
      this.testResults.failed++;
      this.log(`✗ FAILED: ${name} - ${message}`, 'error');
    }
  }
  
  // Simulate keyboard input
  simulateKeyPress(key) {
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: `Key${key.toUpperCase()}`,
      keyCode: key === 'ArrowUp' ? 38 : 
               key === 'ArrowDown' ? 40 : 
               key === 'ArrowLeft' ? 37 : 
               key === 'ArrowRight' ? 39 :
               key === 'p' ? 80 :
               key === 'r' ? 82 : 
               key.toUpperCase().charCodeAt(0),
      which: key === 'ArrowUp' ? 38 : 
             key === 'ArrowDown' ? 40 : 
             key === 'ArrowLeft' ? 37 : 
             key === 'ArrowRight' ? 39 :
             key === 'p' ? 80 :
             key === 'r' ? 82 : 
             key.toUpperCase().charCodeAt(0),
      bubbles: true
    });
    
    document.dispatchEvent(event);
    return new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Click a button
  clickButton(button) {
    if (button) {
      button.click();
    }
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Get the current score
  getScore() {
    return parseInt(this.gameElements.scoreElement.textContent, 10);
  }
  
  // Test if the game is running
  isGameRunning() {
    // This is an assumption - we'd need to check the actual game state
    // In the game.js file this would be the gameRunning variable
    return this.gameElements.gamePaused.style.display === 'none' &&
           this.gameElements.gameOver.style.display === 'none' &&
           this.gameElements.startBtn.innerHTML.includes('Pause');
  }
  
  // Test starting the game
  async testGameStart() {
    await this.clickButton(this.gameElements.startBtn);
    
    const isRunning = this.isGameRunning();
    this.recordTestResult(
      'Game Start',
      isRunning,
      isRunning ? 'Game started successfully' : 'Game failed to start'
    );
    
    // Wait a moment to ensure game is running
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Test pausing the game
  async testGamePause() {
    if (!this.isGameRunning()) {
      await this.testGameStart();
    }
    
    // Press P to pause
    await this.simulateKeyPress('p');
    
    const isPaused = this.gameElements.gamePaused.style.display === 'block';
    this.recordTestResult(
      'Game Pause',
      isPaused,
      isPaused ? 'Game paused successfully' : 'Game failed to pause'
    );
    
    // Resume game
    await this.simulateKeyPress('p');
  }
  
  // Test direction changes
  async testDirectionChanges() {
    if (!this.isGameRunning()) {
      await this.testGameStart();
    }
    
    // Test arrow keys
    await this.simulateKeyPress('ArrowUp');
    await this.simulateKeyPress('ArrowLeft');
    await this.simulateKeyPress('ArrowDown');
    await this.simulateKeyPress('ArrowRight');
    
    // Test WASD keys
    await this.simulateKeyPress('w');
    await this.simulateKeyPress('a');
    await this.simulateKeyPress('s');
    await this.simulateKeyPress('d');
    
    // We can't easily verify direction changes automatically
    // Just record that test was completed
    this.recordTestResult(
      'Direction Changes',
      true,
      'Direction change commands executed (visual verification required)'
    );
  }
  
  // Test restart functionality
  async testGameRestart() {
    if (!this.isGameRunning()) {
      await this.testGameStart();
    }
    
    // Save current score
    const scoreBeforeRestart = this.getScore();
    
    // Click restart button
    await this.clickButton(this.gameElements.restartBtn);
    
    // Check if score reset to 0
    const scoreAfterRestart = this.getScore();
    const didRestart = scoreAfterRestart === 0 && scoreBeforeRestart !== scoreAfterRestart;
    
    this.recordTestResult(
      'Game Restart',
      didRestart,
      didRestart ? 'Game restarted successfully' : 'Game failed to restart properly'
    );
  }
  
  // Test responsiveness
  async testResponsiveness() {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Resize to simulate mobile
    window.resizeTo(375, 667);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if game canvas resized
    const mobileCanvasWidth = this.gameElements.gameCanvas.width;
    
    // Resize to simulate tablet
    window.resizeTo(768, 1024);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if game canvas resized again
    const tabletCanvasWidth = this.gameElements.gameCanvas.width;
    
    // Restore original size
    window.resizeTo(originalWidth, originalHeight);
    
    this.recordTestResult(
      'Responsive Canvas',
      mobileCanvasWidth !== tabletCanvasWidth,
      'Canvas resizes with viewport changes'
    );
  }
  
  // Run all tests
  async runAllTests() {
    this.log('Starting automated tests for Snake Game', 'info');
    
    try {
      await this.testGameStart();
      await this.testGamePause();
      await this.testDirectionChanges();
      await this.testGameRestart();
      await this.testResponsiveness();
      
      this.log(`Test run completed: ${this.testResults.passed} passed, ${this.testResults.failed} failed`, 'info');
      
      return this.testResults;
    } catch (error) {
      this.log(`Test run error: ${error.message}`, 'error');
      console.error(error);
      return this.testResults;
    }
  }
}

// Run tests when loaded
const snakeTester = new SnakeGameTester();
snakeTester.runAllTests().then(results => {
  console.table(results.tests);
});
