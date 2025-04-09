// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = gridSize;
let dy = 0;
let score = 0;
let gameInterval;
let gameSpeed = 100;
let gameRunning = false;
let gamePaused = false;
let directionQueue = [];

// Define different fruit types with their properties
const fruitTypes = [
    { type: 'regular', color: 'red', points: 10, probability: 0.7, duration: Infinity },
    { type: 'bonus', color: 'gold', points: 30, probability: 0.15, duration: 10000 },
    { type: 'super', color: 'purple', points: 50, probability: 0.1, duration: 7000 },
    { type: 'mega', color: 'cyan', points: 100, probability: 0.05, duration: 5000 }
];

// Special multiplier fruit (5x points)
let multiplierFruit = null;
let multiplierFruitTimer = null;
const multiplierDuration = 3000; // The 5x fruit stays for only 3 seconds
const multiplierChance = 0.01; // 1% chance to spawn per game loop
const multiplierValue = 5; // 5x points multiplier

// Add interpolation variables
let interpolationFactor = 0;
const INTERPOLATION_SPEED = 0.2; // Controls how fast the snake moves visually

// Function to start the game
function startGame() {
    if (gameRunning && !gamePaused) return; // Prevent starting multiple game loops
    
    if (gamePaused) {
        // If game was paused, just resume it
        gamePaused = false;
        requestAnimationFrame(gameLoop);
        updateStartButton('pause');
        updatePauseDisplay();
        return;
    }
    
    // Starting a new game
    gameRunning = true;
    gamePaused = false;
    score = 0;
    
    // Initialize snake with two segments for smooth animation from the start
    snake = [
        { x: gridSize * 5, y: gridSize * 5 },          // Head
        { x: gridSize * 4, y: gridSize * 5 }           // Initial tail segment
    ];
    
    dx = gridSize;
    dy = 0;
    directionQueue = [];
    spawnFood();
    updateScore();
    gameSpeed = 120; // Start with a slower initial speed (was 100)
    
    // Use requestAnimationFrame with properly initialized timing variables
    if (gameInterval) clearInterval(gameInterval);
    lastFrameTime = 0;
    lastMoveTime = 0;
    interpolationFactor = 0;
    requestAnimationFrame(gameLoop);
    
    updateStartButton('pause');
}

// Function to stop the game
function stopGame() {
    if (!gameRunning) return;
    
    gameRunning = false;
    
    // Clear any existing timers
    if (multiplierFruitTimer) {
        clearTimeout(multiplierFruitTimer);
        multiplierFruit = null;
    }
    
    updateStartButton('restart');
}

// Function to toggle pause
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    
    if (gamePaused) {
        // We're using requestAnimationFrame now, no need for clearInterval
        updateStartButton('resume');
    } else {
        // Just resume the animation loop
        requestAnimationFrame(gameLoop);
        updateStartButton('pause');
    }
    
    updatePauseDisplay();
}

// Function to update the start button text
function updateStartButton(state) {
    switch (state) {
        case 'start':
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            break;
        case 'restart':
            startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart';
            break;
        case 'pause':
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            break;
        case 'resume':
            startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            break;
    }
}

// Event listener for the start/pause button
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        // Start a new game
        startGame();
    } else if (gamePaused) {
        // Resume the game
        gamePaused = false;
        requestAnimationFrame(gameLoop);
        updateStartButton('pause');
        updatePauseDisplay();
    } else {
        // Pause the game
        togglePause();
    }
});

// Function to draw the snake with interpolation
function drawSnake() {
    snake.forEach((segment, index) => {
        // Calculate interpolated position for smooth movement
        let drawX = segment.x;
        let drawY = segment.y;
        
        // Apply interpolation to the head for smoother movement
        if (index === 0 && interpolationFactor < 1) {
            // Get previous segment for interpolation reference
            const prevSegment = snake.length > 1 ? snake[1] : { 
                x: segment.x - dx, 
                y: segment.y - dy 
            };
            
            // Handle edge wrapping for smooth animation
            let diffX = segment.x - prevSegment.x;
            let diffY = segment.y - prevSegment.y;
            
            // Check for edge wrapping in X direction
            if (Math.abs(diffX) > canvas.width / 2) {
                // Snake wrapped around horizontally
                if (diffX > 0) {
                    // Moving from left edge to right edge
                    diffX = diffX - canvas.width;
                } else {
                    // Moving from right edge to left edge
                    diffX = diffX + canvas.width;
                }
            }
            
            // Check for edge wrapping in Y direction
            if (Math.abs(diffY) > canvas.height / 2) {
                // Snake wrapped around vertically
                if (diffY > 0) {
                    // Moving from top edge to bottom edge
                    diffY = diffY - canvas.height;
                } else {
                    // Moving from bottom edge to top edge
                    diffY = diffY + canvas.height;
                }
            }
            
            // Calculate interpolated position with wrap handling
            drawX = prevSegment.x + diffX * interpolationFactor;
            drawY = prevSegment.y + diffY * interpolationFactor;
            
            // Handle the drawing position wrapping around edges
            if (drawX < 0) drawX += canvas.width;
            if (drawX >= canvas.width) drawX -= canvas.width;
            if (drawY < 0) drawY += canvas.height;
            if (drawY >= canvas.height) drawY -= canvas.height;
        }
        
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#28a745'; // Brighter green for head
        } else {
            // Gradient effect for body
            const greenValue = 120 - (index * 2);
            ctx.fillStyle = `rgb(0, ${Math.max(greenValue, 50)}, 0)`;
        }
        
        // Rounded corners for snake segments
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, gridSize, gridSize, 5);
        ctx.fill();
        
        // Add eyes to the head
        if (index === 0) {
            // Determine eye position based on direction
            const eyeSize = 3;
            const eyeOffset = 4;
            
            ctx.fillStyle = 'white';
            
            // Left eye
            let leftEyeX, leftEyeY;
            // Right eye
            let rightEyeX, rightEyeY;
            
            if (dx > 0) { // Moving right
                leftEyeX = drawX + gridSize - eyeOffset;
                leftEyeY = drawY + eyeOffset;
                rightEyeX = drawX + gridSize - eyeOffset;
                rightEyeY = drawY + gridSize - eyeOffset;
            } else if (dx < 0) { // Moving left
                leftEyeX = drawX + eyeOffset;
                leftEyeY = drawY + eyeOffset;
                rightEyeX = drawX + eyeOffset;
                rightEyeY = drawY + gridSize - eyeOffset;
            } else if (dy > 0) { // Moving down
                leftEyeX = drawX + eyeOffset;
                leftEyeY = drawY + gridSize - eyeOffset;
                rightEyeX = drawX + gridSize - eyeOffset;
                rightEyeY = drawY + gridSize - eyeOffset;
            } else { // Moving up
                leftEyeX = drawX + eyeOffset;
                leftEyeY = drawY + eyeOffset;
                rightEyeX = drawX + gridSize - eyeOffset;
                rightEyeY = drawY + eyeOffset;
            }
            
            // Draw eyes
            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
            ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize/2, 0, Math.PI * 2);
            ctx.arc(rightEyeX, rightEyeY, eyeSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Function to draw the food
function drawFood() {
    // Safety check to make sure food has valid coordinates
    if (!food || typeof food.x === 'undefined' || typeof food.y === 'undefined') {
        // If food is invalid for some reason, respawn it
        spawnFood();
        return;
    }
    
    // Ensure food coordinates are aligned to grid
    food.x = Math.floor(food.x / gridSize) * gridSize;
    food.y = Math.floor(food.y / gridSize) * gridSize;
    
    // Draw food hitbox for better visual understanding (optional)
    // ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    // ctx.fillRect(food.x, food.y, gridSize, gridSize);
    
    // Regular food
    ctx.fillStyle = food.color || 'red';
    ctx.beginPath();
    ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to the food
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(food.x + gridSize/3, food.y + gridSize/3, gridSize/6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw multiplier fruit if present
    if (multiplierFruit) {
        // Ensure multiplier coordinates are aligned to grid
        multiplierFruit.x = Math.floor(multiplierFruit.x / gridSize) * gridSize;
        multiplierFruit.y = Math.floor(multiplierFruit.y / gridSize) * gridSize;
        
        // Draw multiplier hitbox for better visual understanding (optional)
        // ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
        // ctx.fillRect(multiplierFruit.x, multiplierFruit.y, gridSize, gridSize);
        
        // Draw a star shape
        const centerX = multiplierFruit.x + gridSize/2;
        const centerY = multiplierFruit.y + gridSize/2;
        const spikes = 5;
        const outerRadius = gridSize/2;
        const innerRadius = gridSize/4;
        
        ctx.beginPath();
        ctx.fillStyle = 'magenta';
        
        let rot = Math.PI / 2 * 3;
        let x = centerX;
        let y = centerY;
        const step = Math.PI / spikes;
        
        ctx.moveTo(centerX, centerY - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = centerX + Math.cos(rot) * outerRadius;
            y = centerY + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = centerX + Math.cos(rot) * innerRadius;
            y = centerY + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(centerX, centerY - outerRadius);
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = 'magenta';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Helper function to check if a position is occupied by the snake
function isPositionOnSnake(x, y) {
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) {
            return true;
        }
    }
    return false;
}

// Function to spawn food
function spawnFood() {
    // Calculate actual available tiles based on canvas size
    const tilesX = Math.floor(canvas.width / gridSize);
    const tilesY = Math.floor(canvas.height / gridSize);
    
    // First, create an array of all possible positions
    let availablePositions = [];
    
    for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
            const posX = x * gridSize;
            const posY = y * gridSize;
            
            // Check if this position is free (not occupied by snake or multiplier)
            if (!isPositionOnSnake(posX, posY) && 
                !(multiplierFruit && multiplierFruit.x === posX && multiplierFruit.y === posY)) {
                availablePositions.push({ x: posX, y: posY });
            }
        }
    }
    
    // If no positions available, the game is won (snake fills the entire grid)
    if (availablePositions.length === 0) {
        console.log("No available positions for food - game won!");
        stopGame();
        return;
    }
    
    // Pick a random position from available ones
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    // Pick a fruit type based on probability
    let random = Math.random();
    let cumulativeProbability = 0;
    let selectedFruit = fruitTypes[0]; // Default to regular
    
    for (const fruit of fruitTypes) {
        cumulativeProbability += fruit.probability;
        if (random < cumulativeProbability) {
            selectedFruit = fruit;
            break;
        }
    }
    
    food = { 
        x: randomPosition.x, 
        y: randomPosition.y, 
        color: selectedFruit.color,
        points: selectedFruit.points,
        type: selectedFruit.type
    };
    
    console.log(`Food spawned at: x=${food.x}, y=${food.y}, type=${food.type}`);
}

// Function to spawn multiplier fruit
function spawnMultiplierFruit() {
    if (multiplierFruit) return; // Already exists
    
    // Calculate actual available tiles based on canvas size
    const tilesX = Math.floor(canvas.width / gridSize);
    const tilesY = Math.floor(canvas.height / gridSize);
    
    // Create an array of all possible positions
    let availablePositions = [];
    
    for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
            const posX = x * gridSize;
            const posY = y * gridSize;
            
            // Check if this position is free (not occupied by snake or food)
            if (!isPositionOnSnake(posX, posY) && 
                !(food.x === posX && food.y === posY)) {
                availablePositions.push({ x: posX, y: posY });
            }
        }
    }
    
    // If there are no available positions, don't spawn a multiplier
    if (availablePositions.length === 0) {
        console.log("No available positions for multiplier fruit");
        return;
    }
    
    // Pick a random position from available ones
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    multiplierFruit = { x: randomPosition.x, y: randomPosition.y };
    console.log(`Multiplier spawned at: x=${multiplierFruit.x}, y=${multiplierFruit.y}`);
    
    // Remove multiplier fruit after its duration
    if (multiplierFruitTimer) clearTimeout(multiplierFruitTimer);
    multiplierFruitTimer = setTimeout(() => {
        multiplierFruit = null;
    }, multiplierDuration);
}

// Function to handle direction changes
function changeDirection(event) {
    if (!gameRunning || gamePaused) return;
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === 37 && !goingRight) { // Left arrow
        directionQueue.push({ dx: -gridSize, dy: 0 });
    } else if (keyPressed === 38 && !goingDown) { // Up arrow
        directionQueue.push({ dx: 0, dy: -gridSize });
    } else if (keyPressed === 39 && !goingLeft) { // Right arrow
        directionQueue.push({ dx: gridSize, dy: 0 });
    } else if (keyPressed === 40 && !goingUp) { // Down arrow
        directionQueue.push({ dx: 0, dy: gridSize });
    } else if (keyPressed === 80) { // P key
        togglePause();
    }
}

// Function to process direction queue
function processDirectionQueue() {
    if (directionQueue.length > 0) {
        const newDirection = directionQueue.shift();
        
        // Prevent reversing into itself
        const reverseDirection = dx === -newDirection.dx && dy === -newDirection.dy;
        
        if (!reverseDirection) {
            dx = newDirection.dx;
            dy = newDirection.dy;
        }
    }
}

// Function to update game speed
function updateGameSpeed() {
    // Only increase speed every 100 points instead of 50
    if (score > 0 && score % 100 === 0) {
        // Make speed increase more gradual (reduce by 2ms instead of 5ms)
        // And set a minimum speed limit of 70ms (was 50ms)
        if (gameSpeed > 70) {
            gameSpeed -= 2;
            console.log(`Speed increased! New game speed: ${gameSpeed}ms`);
            
            // If we're using requestAnimationFrame, we don't need to reset intervals
            // But we should update any pause/resume logic to use the new speed
            if (gamePaused) {
                clearInterval(gameInterval);
            }
        }
    }
}

// Game loop with added FPS monitoring and interpolation
let lastFrameTime = 0;
let lastMoveTime = 0;
function gameLoop(timestamp) {
    if (gamePaused) {
        if (gameRunning) requestAnimationFrame(gameLoop);
        return;
    }
    
    // We'll render every frame for smooth animation
    requestAnimationFrame(gameLoop);
    
    // Update the interpolation factor for smooth movement
    interpolationFactor = Math.min(1, interpolationFactor + INTERPOLATION_SPEED);
    
    // Handle game logic updates at fixed intervals
    if (timestamp - lastMoveTime >= gameSpeed) {
        // Process direction queue
        processDirectionQueue();
        
        // Move the snake (logical position update)
        moveSnake();
        
        // Check for collisions
        if (checkCollision()) {
            stopGame();
            showGameOver();
            return;
        }
        
        // Reset interpolation for the next movement
        interpolationFactor = 0;
        lastMoveTime = timestamp;
        
        // Randomly spawn multiplier fruit
        if (Math.random() < multiplierChance && !multiplierFruit) {
            spawnMultiplierFruit();
        }
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();

    // Draw everything with interpolation
    drawSnake();
    drawFood();
    
    // Update frame time for future calculations
    lastFrameTime = timestamp;
}

// Function to move the snake
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Wrap around the edges
    if (head.x < 0) head.x = canvas.width - gridSize;
    else if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - gridSize;
    else if (head.y >= canvas.height) head.y = 0;
    
    // Ensure head coordinates are aligned to grid
    head.x = Math.floor(head.x / gridSize) * gridSize;
    head.y = Math.floor(head.y / gridSize) * gridSize;
    
    snake.unshift(head); // Add new head to the snake

    // Check if the snake eats the multiplier fruit with improved detection
    if (multiplierFruit && 
        Math.abs(head.x - multiplierFruit.x) < gridSize/2 && 
        Math.abs(head.y - multiplierFruit.y) < gridSize/2) {
        // Multiply the points of the next food
        food.points *= multiplierValue;
        
        // Clear the multiplier fruit
        multiplierFruit = null;
        clearTimeout(multiplierFruitTimer);
        
        console.log("Multiplier taken! Next fruit worth x5 points");
    }

    // Check if the snake eats the regular food with improved detection
    if (Math.abs(head.x - food.x) < gridSize/2 && Math.abs(head.y - food.y) < gridSize/2) {
        // Add points
        score += food.points;
        updateScore();
        updateGameSpeed();
        
        // Reset food points if it was multiplied
        spawnFood();
        
        // For debugging
        console.log("Food eaten! New score: " + score);
    } else {
        snake.pop(); // Remove the tail if no food is eaten
    }
}

// Function to check for collisions
function checkCollision() {
    const head = snake[0];

    // Check self-collision (skip head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false; // No collision
}

// Function to update the score display
function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

// Event listener for key presses
document.addEventListener('keydown', changeDirection);

// Initialize the game
const canvasSize = 350;  // Reduced from 400

window.onload = function() {
    // Resize canvas for better fit
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Recalculate tileCount based on actual canvas size
    const tileCount = Math.floor(canvasSize / gridSize);
    
    // Hide game status messages at initialization
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'none';
    
    const pauseElement = document.getElementById('gamePaused');
    pauseElement.style.display = 'none';
    
    // Set up the game restart logic
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            if (!gameRunning) {
                startGame();
            }
        }
    });
    
    // Initial rendering
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    // Initialize snake with two segments for initial demo
    snake = [
        { x: gridSize * 5, y: gridSize * 5 },          // Head
        { x: gridSize * 4, y: gridSize * 5 }           // Initial tail segment
    ];
    
    // Create initial food using our safer spawnFood function
    spawnFood();
    
    drawSnake();
    drawFood();
    
    // Debug visualization disabled in production
    // Uncomment for debugging: drawDebugInfo();
    
    // Initialize button state
    updateStartButton('start');
    
    // Log initial state for debugging
    console.log(`Canvas size: ${canvas.width}x${canvas.height}, GridSize: ${gridSize}, TileCount: ${tileCount}`);
    console.log(`Initial snake position: x=${snake[0].x}, y=${snake[0].y}`);
    console.log(`Initial food position: x=${food.x}, y=${food.y}`);
};

// Add the following code to show game status messages
function showGameOver() {
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'block';
    setTimeout(() => {
        gameOverElement.style.display = 'none';
    }, 2000);
}

function updatePauseDisplay() {
    const pauseElement = document.getElementById('gamePaused');
    pauseElement.style.display = gamePaused ? 'block' : 'none';
}

// Add visual effects to the game
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Add debugging visualizer to show hit areas (only used when explicitly called)
function drawDebugInfo() {
    // Draw hit area for food
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
    
    // Add food position text
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.fillText(`(${food.x},${food.y})`, food.x, food.y - 2);
    
    // Draw hit area for snake head
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 1;
    ctx.strokeRect(snake[0].x, snake[0].y, gridSize, gridSize);
    
    // Add head position text
    ctx.fillText(`(${snake[0].x},${snake[0].y})`, snake[0].x, snake[0].y - 2);
    
    // Highlight snake body
    for (let i = 1; i < snake.length; i++) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(snake[i].x, snake[i].y, gridSize, gridSize);
    }
    
    // Draw multiplier if present
    if (multiplierFruit) {
        ctx.strokeStyle = 'magenta';
        ctx.lineWidth = 1;
        ctx.strokeRect(multiplierFruit.x, multiplierFruit.y, gridSize, gridSize);
        ctx.fillText(`(${multiplierFruit.x},${multiplierFruit.y})`, multiplierFruit.x, multiplierFruit.y - 2);
    }
}