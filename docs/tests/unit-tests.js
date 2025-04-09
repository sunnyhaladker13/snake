/**
 * Unit Tests for Snake Game
 * 
 * This file contains unit tests for core game functionality.
 * To run these tests, you would need to use a testing framework like Jest or Mocha.
 */

// Mock canvas and context for testing
const mockCanvas = {
  width: 320,
  height: 320,
  getContext: () => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    rect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    arc: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn()
  })
};

// Mock DOM elements
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'gameCanvas') return mockCanvas;
  if (id === 'score') return { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } };
  if (id === 'startBtn') return { innerHTML: '', addEventListener: jest.fn() };
  if (id === 'restartBtn') return { classList: { add: jest.fn(), remove: jest.fn() }, addEventListener: jest.fn() };
  if (id === 'gameOver') return { style: { display: 'none' } };
  if (id === 'gamePaused') return { style: { display: 'none' } };
  return { addEventListener: jest.fn(), style: {} };
});

// Import game logic (mock for testing)
const {
  moveSnake,
  checkCollision,
  handleDirection,
  spawnFood,
  processDirectionQueue
} = require('../docs/game.js');

describe('Snake Game Core Functions', () => {
  let snake, food, gridSize, dx, dy, directionQueue, canvas;
  
  beforeEach(() => {
    // Setup testing environment
    gridSize = 20;
    snake = [
      { x: 60, y: 100 }, // Head
      { x: 40, y: 100 }  // Tail
    ];
    food = { x: 200, y: 200, points: 10, type: 'regular' };
    dx = gridSize;
    dy = 0;
    directionQueue = [];
    canvas = {
      width: 320,
      height: 320
    };
  });

  test('Snake movement should add new head in correct position', () => {
    const originalHead = { ...snake[0] };
    moveSnake();
    
    // New head should be one grid unit to the right (dx = gridSize)
    expect(snake[0].x).toBe(originalHead.x + gridSize);
    expect(snake[0].y).toBe(originalHead.y);
    
    // Snake length should stay the same when not eating
    expect(snake.length).toBe(2);
  });

  test('Snake should grow when eating food', () => {
    // Place food directly in front of snake head
    food.x = snake[0].x + gridSize;
    food.y = snake[0].y;
    
    const originalLength = snake.length;
    moveSnake();
    
    // Snake should grow by 1 segment
    expect(snake.length).toBe(originalLength + 1);
  });

  test('Self-collision detection should work', () => {
    // Create a snake that collides with itself
    snake = [
      { x: 60, y: 100 },
      { x: 80, y: 100 },
      { x: 80, y: 80 },
      { x: 60, y: 80 },
      { x: 60, y: 100 } // Last segment is at same position as head
    ];
    
    const collision = checkCollision();
    expect(collision).toBe(true);
  });

  test('Direction queue should prevent reversing into self', () => {
    dx = gridSize; // Moving right
    dy = 0;
    
    handleDirection('left'); // Try to reverse direction (should be ignored)
    processDirectionQueue();
    
    // Direction should not change - can't reverse into yourself
    expect(dx).toBe(gridSize);
    expect(dy).toBe(0);
  });

  test('Food should not spawn on snake', () => {
    // Run spawn food multiple times and verify it never appears on snake
    for (let i = 0; i < 50; i++) {
      spawnFood();
      
      let onSnake = false;
      for (const segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
          onSnake = true;
          break;
        }
      }
      
      expect(onSnake).toBe(false);
    }
  });

  test('Snake should wrap around edges of the canvas', () => {
    // Position snake at right edge
    snake = [
      { x: canvas.width - gridSize, y: 100 },
      { x: canvas.width - (2 * gridSize), y: 100 }
    ];
    
    dx = gridSize; // Moving right
    dy = 0;
    
    moveSnake();
    
    // Head should wrap to the left side
    expect(snake[0].x).toBe(0);
    expect(snake[0].y).toBe(100);
  });
});
