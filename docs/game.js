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
    { type: 'regular', color: '#FF303F', points: 10, probability: 0.7, duration: Infinity },
    { type: 'bonus', color: '#FFFC31', points: 30, probability: 0.15, duration: 10000 },
    { type: 'super', color: '#AA00FF', points: 50, probability: 0.1, duration: 7000 },
    { type: 'mega', color: '#00DFFC', points: 100, probability: 0.05, duration: 5000 }
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

// Touch control buttons
const upBtn = document.getElementById('upBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');

// Add restart button reference
const restartBtn = document.getElementById('restartBtn');

// Add event listener for restart button
restartBtn.addEventListener('click', () => {
    // First stop the current game if running
    stopGame();
    
    // Then start a new game
    startGame();
});

// First, let's add a debug utility function to help diagnose the issue
function debugSnake(label) {
    console.log(`%c[${label}] Snake length: ${snake?.length || 0}`, "color: blue; font-weight: bold");
    if (snake && Array.isArray(snake) && snake.length > 0) {
        console.log("Head:", snake[0], "Last segment:", snake[snake.length-1]);
    }
}

// Add this utility function to force reset the snake state
function forceResetSnake() {
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    const startX = Math.floor(gridCellsX / 3) * gridSize;
    const startY = Math.floor(gridCellsY / 2) * gridSize;
    
    // Create a completely fresh snake with exactly 2 segments
    return [
        { x: startX, y: startY },             // Head
        { x: startX - gridSize, y: startY }   // Tail
    ];
}

// Replace the startGame function completely
function startGame() {
    // Always stop any existing game first
    stopGame();
    
    // Reset game state
    gameRunning = true;
    gamePaused = false;
    score = 0;
    
    // Force reset the snake to exactly 2 segments
    snake = forceResetSnake();
    
    // Reset direction - always start moving right
    dx = gridSize;
    dy = 0;
    directionQueue = [];
    
    // Clear any food or multiplier
    food = null;
    multiplierFruit = null;
    if (multiplierFruitTimer) {
        clearTimeout(multiplierFruitTimer);
        multiplierFruitTimer = null;
    }
    
    // Generate new food
    spawnFood();
    updateScore();
    gameSpeed = 120;
    
    // Reset timing variables
    lastFrameTime = 0;
    lastMoveTime = 0;
    interpolationFactor = 0;
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
    updateStartButton('pause');
    
    // Hide game over message if it was visible
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) gameOverElement.style.display = 'none';
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

// Function to draw the snake with neo-brutalist design
function drawSnake() {
    // Safety check
    if (!snake || !Array.isArray(snake) || snake.length === 0) {
        console.error("Cannot draw snake: invalid snake data", snake);
        return;
    }
    
    // Extra safety - trim if too long
    if (snake.length > 100) {
        console.warn("Snake too long in drawing function, trimming");
        snake = snake.slice(0, 100);
    }
    
    // Get the current design
    const design = window.getSnakeTheme ? window.getSnakeTheme() : {
        head: '#FF5F1F',
        headGlow: '#FF303F',
        eyeSocket: '#000000',
        pupilGlow: '#FFFC31'
    };
    
    // Calculate pulse for animation
    const pulseAmount = Math.sin(Date.now() / 300) * 30; // More dramatic pulse
    
    // First draw the snake body
    for (let i = snake.length - 1; i > 0; i--) {
        // Calculate interpolated position for smooth movement
        let drawX = snake[i].x;
        let drawY = snake[i].y;
        
        // Get color from design
        let fillColor;
        if (design.bodyGradient) {
            fillColor = design.bodyGradient(i, snake.length, pulseAmount);
        } else {
            // Default fallback
            fillColor = '#FF5F1F';
        }
        
        // Fill style for body segments with border for neo-brutalist look
        ctx.fillStyle = fillColor;
        
        // Draw rectangle for body segments (neo-brutalist uses more angular shapes)
        ctx.beginPath();
        ctx.rect(drawX, drawY, gridSize, gridSize);
        ctx.fill();
        
        // Add black border for contrast
        ctx.strokeStyle = 'black';
        ctx.lineWidth = (design.borderWidth || 2) * scaleFactor;
        ctx.stroke();
        
        // Add inner pattern for more brutalist aesthetic
        if (i % 2 === 0) { // Alternate pattern
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.rect(drawX + gridSize * 0.25, drawY + gridSize * 0.25, gridSize * 0.5, gridSize * 0.5);
            ctx.fill();
        }
    }
    
    // Then draw the head on top
    const head = snake[0];
    let drawX = head.x;
    let drawY = head.y;
    
    // Apply interpolation to the head for smoother movement
    if (interpolationFactor < 1) {
        // Get previous segment for interpolation reference
        const prevSegment = snake.length > 1 ? snake[1] : { 
            x: head.x - dx, 
            y: head.y - dy 
        };
        
        // Handle edge wrapping for smooth animation
        let diffX = head.x - prevSegment.x;
        let diffY = head.y - prevSegment.y;
        
        // Check for edge wrapping in X direction
        if (Math.abs(diffX) > canvas.width / 2) {
            // Snake wrapped around horizontally
            if (diffX > 0) diffX = diffX - canvas.width;
            else diffX = diffX + canvas.width;
        }
        
        // Check for edge wrapping in Y direction
        if (Math.abs(diffY) > canvas.height / 2) {
            // Snake wrapped around vertically
            if (diffY > 0) diffY = diffY - canvas.height;
            else diffY = diffY + canvas.height;
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
    
    // Draw a glow effect for the head - neo-brutalist style has bold shadows
    ctx.shadowColor = design.headGlow || '#FF303F';
    ctx.shadowBlur = (design.glowStrength || 12) * scaleFactor; // Stronger glow
    
    // Head style from design
    ctx.fillStyle = design.head || '#FF5F1F';
    
    // Draw the head as a rectangle for brutalist aesthetic
    ctx.beginPath();
    ctx.rect(drawX, drawY, gridSize, gridSize);
    ctx.fill();
    
    // Add black border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = ((design.borderWidth || 2) + 1) * scaleFactor; // Thicker border for head
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw inner pattern for the head
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.rect(drawX + gridSize * 0.15, drawY + gridSize * 0.15, gridSize * 0.7, gridSize * 0.7);
    ctx.fill();
    
    // Determine eye position based on direction
    const eyeSize = 3.5 * scaleFactor;
    const eyeOffset = 4.5 * scaleFactor;
    
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
    
    // Draw eye sockets - dark circles
    ctx.fillStyle = design.eyeSocket || '#000000';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize + scaleFactor, 0, Math.PI * 2);
    ctx.arc(rightEyeX, rightEyeY, eyeSize + scaleFactor, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes - white circles
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils with a brutalist harsh glow
    ctx.shadowColor = design.pupilGlow || '#FFFC31';
    ctx.shadowBlur = 8 * scaleFactor; // Dramatic glow
    ctx.fillStyle = 'black';
    
    // Calculate pupil position - makes the snake look in the direction it's moving
    const pupilShift = 1 * scaleFactor;
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;
    
    if (dx > 0) pupilOffsetX = pupilShift;
    else if (dx < 0) pupilOffsetX = -pupilShift;
    else if (dy > 0) pupilOffsetY = pupilShift;
    else pupilOffsetY = -pupilShift;
    
    ctx.beginPath();
    ctx.arc(leftEyeX + pupilOffsetX, leftEyeY + pupilOffsetY, eyeSize/2, 0, Math.PI * 2);
    ctx.arc(rightEyeX + pupilOffsetX, rightEyeY + pupilOffsetY, eyeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Function to draw the food with neo-brutalist style
function drawFood() {
    // Safety check to make sure food has valid coordinates
    if (!food || typeof food.x === 'undefined' || typeof food.y === 'undefined') {
        // If food is invalid for some reason, respawn it
        spawnFood();
        return;
    }
    
    // Get the design
    const design = window.getSnakeTheme ? window.getSnakeTheme() : {
        foodColors: {
            regular: '#FF303F',
            bonus: '#FFFC31',
            super: '#AA00FF',
            mega: '#00DFFC',
            multiplier: '#FF00FF'
        },
        foodGlow: true
    };
    
    // Ensure food coordinates are aligned to grid
    food.x = Math.floor(food.x / gridSize) * gridSize;
    food.y = Math.floor(food.y / gridSize) * gridSize;
    
    // Get the appropriate color from the design
    const foodColor = design.foodColors && design.foodColors[food.type] ? 
                     design.foodColors[food.type] : food.color;
                     
    // Add glow for neo-brutalist dramatic effect if enabled in design
    if (design.foodGlow) {
        ctx.shadowColor = foodColor;
        ctx.shadowBlur = 10 * scaleFactor;
    }
    
    // Neo-brutalist food - angular shapes instead of circles
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    
    // Draw a square with rotation for visual interest
    ctx.save();
    ctx.translate(food.x + gridSize/2, food.y + gridSize/2);
    ctx.rotate(Math.PI / 4); // 45 degree rotation
    ctx.rect(-gridSize/3, -gridSize/3, gridSize/1.5, gridSize/1.5);
    ctx.fill();
    
    // Add border for neo-brutalist look
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 * scaleFactor;
    ctx.stroke();
    ctx.restore();
    
    // Reset glow
    ctx.shadowBlur = 0;
    
    // Draw multiplier fruit if present
    if (multiplierFruit) {
        // Ensure multiplier coordinates are aligned to grid
        multiplierFruit.x = Math.floor(multiplierFruit.x / gridSize) * gridSize;
        multiplierFruit.y = Math.floor(multiplierFruit.y / gridSize) * gridSize;
        
        // Draw a star shape with neo-brutalist style
        const centerX = multiplierFruit.x + gridSize/2;
        const centerY = multiplierFruit.y + gridSize/2;
        const spikes = 5;
        const outerRadius = gridSize/2;
        const innerRadius = gridSize/4;
        
        // Add glow
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 12 * scaleFactor;
        
        ctx.beginPath();
        ctx.fillStyle = '#FF00FF';
        
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
        
        // Add black border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 * scaleFactor;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
}

// Helper function to check if a position is occupied by the snake
function isPositionOnSnake(x, y) {
    // Safety check
    if (!snake || !Array.isArray(snake)) {
        console.error("Snake is not an array in isPositionOnSnake check");
        return false;
    }
    
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) {
            return true;
        }
    }
    return false;
}

// Replace spawnFood function with this fixed version
function spawnFood() {
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    // Find all positions that aren't occupied by snake or multiplier
    const availablePositions = [];
    
    for (let x = 0; x < gridCellsX; x++) {
        for (let y = 0; y < gridCellsY; y++) {
            const posX = x * gridSize;
            const posY = y * gridSize;
            
            // Skip positions occupied by snake
            let occupied = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === posX && snake[i].y === posY) {
                    occupied = true;
                    break;
                }
            }
            
            // Skip positions occupied by multiplier
            if (!occupied && multiplierFruit && 
                multiplierFruit.x === posX && 
                multiplierFruit.y === posY) {
                occupied = true;
            }
            
            // Add available positions
            if (!occupied) {
                availablePositions.push({ x: posX, y: posY });
            }
        }
    }
    
    // Handle case where no positions are available
    if (availablePositions.length === 0) {
        console.log("No positions available for food - game won!");
        stopGame();
        return;
    }
    
    // Select random position and fruit type
    const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    let selectedFruit = fruitTypes[0]; // Default to regular
    
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const fruit of fruitTypes) {
        cumulativeProbability += fruit.probability;
        if (random < cumulativeProbability) {
            selectedFruit = fruit;
            break;
        }
    }
    
    // Create food object with EXACT grid-aligned coordinates
    food = {
        x: randomPos.x,
        y: randomPos.y,
        color: selectedFruit.color,
        points: selectedFruit.points,
        type: selectedFruit.type
    };
    
    console.log(`New food spawned at (${food.x},${food.y}), type: ${food.type}`);
}

// Function to spawn multiplier fruit
function spawnMultiplierFruit() {
    if (multiplierFruit) return; // Already exists
    
    // Calculate actual available tiles based on current canvas size
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
                !(food && food.x === posX && food.y === posY)) {
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
    
    multiplierFruit = { 
        x: randomPosition.x, 
        y: randomPosition.y 
    };
    
    console.log(`Multiplier spawned at: x=${multiplierFruit.x}, y=${randomPosition.y}, grid: ${gridSize}px`);
    
    // Remove multiplier fruit after its duration
    if (multiplierFruitTimer) clearTimeout(multiplierFruitTimer);
    multiplierFruitTimer = setTimeout(() => {
        multiplierFruit = null;
    }, multiplierDuration);
}

// Function to handle direction changes - fix keyboard controls for desktop
function changeDirection(event) {
    if (!gameRunning || gamePaused) return;
    
    // Make sure we're recognizing key codes properly
    const key = event.key || event.keyCode;
    
    // Handle both key codes and key names for better compatibility
    // Add WASD controls alongside arrow keys
    if (key === 'ArrowLeft' || key === 37 || key === 'a' || key === 'A' || key === 65) handleDirection('left');      // Left arrow or A
    else if (key === 'ArrowUp' || key === 38 || key === 'w' || key === 'W' || key === 87) handleDirection('up');     // Up arrow or W
    else if (key === 'ArrowRight' || key === 39 || key === 'd' || key === 'D' || key === 68) handleDirection('right'); // Right arrow or D
    else if (key === 'ArrowDown' || key === 40 || key === 's' || key === 'S' || key === 83) handleDirection('down'); // Down arrow or S
    else if (key === 'p' || key === 'P' || key === 80) togglePause();    // P key
    else if (key === 'r' || key === 'R' || key === 82) startGame();      // R key
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

// Replace moveSnake function with this fixed version
function moveSnake() {
    // Ensure snake exists and has correct format
    if (!snake || !Array.isArray(snake) || snake.length < 1) {
        console.error("Invalid snake in moveSnake, resetting...");
        snake = forceResetSnake();
        return;
    }
    
    // Get the head position and calculate new head
    const head = snake[0];
    const newHead = { 
        x: head.x + dx, 
        y: head.y + dy 
    };
    
    // Handle edge wrapping
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    if (newHead.x < 0) newHead.x = (gridCellsX - 1) * gridSize;
    else if (newHead.x >= gridCellsX * gridSize) newHead.x = 0;
    
    if (newHead.y < 0) newHead.y = (gridCellsY - 1) * gridSize;
    else if (newHead.y >= gridCellsY * gridSize) newHead.y = 0;
    
    // Ensure new head is aligned to the grid
    newHead.x = Math.floor(newHead.x / gridSize) * gridSize;
    newHead.y = Math.floor(newHead.y / gridSize) * gridSize;
    
    // Add the new head to the snake
    snake.unshift(newHead);
    
    // Food collection logic - Debug this part carefully
    let foodEaten = false;
    
    // Check if the new head position matches the food position EXACTLY
    if (food && newHead.x === food.x && newHead.y === food.y) {
        foodEaten = true;
        
        // Award points
        score += food.points;
        updateScore();
        updateGameSpeed();
        
        // Generate new food (keep the tail since we ate food)
        spawnFood();
    } else {
        // Remove the tail if no food was eaten
        snake.pop();
    }
    
    // Check if the new head position matches the multiplier position
    if (multiplierFruit && newHead.x === multiplierFruit.x && newHead.y === multiplierFruit.y) {
        
        // Apply multiplier effect
        if (food) food.points *= multiplierValue;
        
        // Remove the multiplier
        multiplierFruit = null;
        if (multiplierFruitTimer) {
            clearTimeout(multiplierFruitTimer);
            multiplierFruitTimer = null;
        }
    }
}

// Function to check for collisions
function checkCollision() {
    // Safety check
    if (!snake || !Array.isArray(snake) || snake.length < 2) {
        return false;
    }
    
    const head = snake[0];
    
    // Check for self-collision (skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Enhanced function for updating the score with animation
function updateScore() {
    scoreElement.textContent = score;
    scoreElement.classList.add('score-update');
    setTimeout(() => scoreElement.classList.remove('score-update'), 300);
}

// Event listener for key presses
document.addEventListener('keydown', changeDirection);

// Initialize the game with dynamic canvas size
window.onload = function() {
    console.log("Game initializing...");
    
    try {
        // Detect if user is on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Show instructions for mobile users if not already seen
        if (isMobile && !localStorage.getItem('mobileInstructionsShown')) {
            document.getElementById('mobileInstructions').style.display = 'block';
        }
        
        // First call resize to initialize canvas and grid size
        resizeGameCanvas();
        
        // Set up resize event listeners
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeGameCanvas, 250);
        });
        window.addEventListener('orientationchange', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeGameCanvas, 250);
        });

        // Hide game status messages
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) gameOverElement.style.display = 'none';
        
        const pauseElement = document.getElementById('gamePaused');
        if (pauseElement) pauseElement.style.display = 'none';
        
        // Set up keyboard controls - make sure we're adding proper event listeners
        document.addEventListener('keydown', changeDirection);
        
        // Initialize the snake with exactly 2 segments
        snake = forceResetSnake();
        
        // Set up initial food
        spawnFood();
        
        // Draw the initial state
        clearCanvas();
        drawGrid();
        drawSnake();
        drawFood();
        
        // Set up touch controls
        setupTouchControls();
        updateStartButton('start');
        
        // Console log game readiness
        console.log(`Game initialized - Canvas: ${canvas.width}x${canvas.height}, Grid: ${gridSize}px`);
        
        // Debug info to verify tap zones are properly set up
        const tapZones = {
            up: document.getElementById('tapUp'),
            down: document.getElementById('tapDown'),
            left: document.getElementById('tapLeft'),
            right: document.getElementById('tapRight')
        };
        
        console.log("Tap zones found:", {
            up: !!tapZones.up,
            down: !!tapZones.down,
            left: !!tapZones.left,
            right: !!tapZones.right
        });

        // Make sure the tap zones are properly set up
        setTimeout(() => {
            // Force a refresh of tap zones
            setupTapZoneControls();
            
            // Add debug info to console
            const tapZones = {
                up: document.getElementById('tapUp'),
                down: document.getElementById('tapDown'),
                left: document.getElementById('tapLeft'),
                right: document.getElementById('tapRight')
            };
            
            // Log detailed info about tap zones
            Object.keys(tapZones).forEach(key => {
                const zone = tapZones[key];
                if (zone) {
                    console.log(`${key} zone:`, {
                        width: zone.offsetWidth,
                        height: zone.offsetHeight,
                        position: zone.getBoundingClientRect(),
                        events: zone.ontouchend ? "Attached" : "Missing"
                    });
                }
            });
        }, 500); // Longer delay for debugging info
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

// Add the following code to show game status messages
function showGameOver() {
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'block';
    
    // Highlight the restart button to guide user
    restartBtn.classList.add('highlight-btn');
    
    // Remove highlight after 1.5 seconds
    setTimeout(() => {
        restartBtn.classList.remove('highlight-btn');
        gameOverElement.style.display = 'none';
    }, 2000);
}

function updatePauseDisplay() {
    const pauseElement = document.getElementById('gamePaused');
    pauseElement.style.display = gamePaused ? 'block' : 'none';
}

// Enhanced mobile touch controls
function setupTouchControls() {
    console.log("Setting up touch controls (simplified)");

    // Setup basic tap controls
    setupTapZoneControls();
    
    // Swipe on the canvas only - no complex logic
    const canvas = document.getElementById('gameCanvas');
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);

    canvas.addEventListener('touchend', function(e) {
        if (!gameRunning || gamePaused) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Simple swipe detection with minimum threshold
        if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                handleDirection(diffX > 0 ? 'right' : 'left');
            } else {
                // Vertical swipe
                handleDirection(diffY > 0 ? 'down' : 'up');
            }
        }
    }, false);

    console.log("Touch controls setup complete");
}

// Replace the setupTapZoneControls function with a drastically simplified version
function setupTapZoneControls() {
    console.log("Setting up simplified tap controls");
    
    // Get the touch zones directly
    const tapUp = document.getElementById('tapUp');
    const tapDown = document.getElementById('tapDown');
    const tapLeft = document.getElementById('tapLeft');
    const tapRight = document.getElementById('tapRight');
    
    // Exit early if elements don't exist
    if (!tapUp || !tapDown || !tapLeft || !tapRight) {
        console.error("Tap zones not found!");
        return;
    }
    
    console.log("All tap zones found, attaching handlers");
    
    // Create direct tap function for each direction
    function createDirectionHandler(direction) {
        return function(e) {
            console.log(`Tapped ${direction}`);
            if (e) e.preventDefault();
            if (gameRunning && !gamePaused) {
                handleDirection(direction);
            }
        };
    }

    // Direct assignment of click/touch events
    tapUp.onclick = createDirectionHandler('up');
    tapDown.onclick = createDirectionHandler('down');
    tapLeft.onclick = createDirectionHandler('left');
    tapRight.onclick = createDirectionHandler('right');
    
    // Ensure they have styles that make them viable for touch
    tapUp.style.cursor = 'pointer';
    tapDown.style.cursor = 'pointer';
    tapLeft.style.cursor = 'pointer';
    tapRight.style.cursor = 'pointer';

    console.log("Tap controls attached");
}

// Add visual effects to the game
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'; // Slightly more visible grid
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
    
    // Add neo-brutalist corner elements - but smaller now
    const cornerSize = gridSize * 0.75; // Reduced corner size
    
    ctx.fillStyle = '#FF5F1F';
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillRect(canvas.width - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillRect(0, canvas.height - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(canvas.width - cornerSize, canvas.height - cornerSize, cornerSize, cornerSize);
    
    // Add black borders to corner elements
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 * scaleFactor;
    ctx.strokeRect(0, 0, cornerSize, cornerSize);
    ctx.strokeRect(canvas.width - cornerSize, 0, cornerSize, cornerSize);
    ctx.strokeRect(0, canvas.height - cornerSize, cornerSize, cornerSize);
    ctx.strokeRect(canvas.width - cornerSize, canvas.height - cornerSize, cornerSize, cornerSize);
    
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

// Add a variable to track the base grid size and dynamic scale factor
let baseGridSize = 20; // Original grid size
let scaleFactor = 1; // Will be updated when canvas is resized

// Fix the resizeGameCanvas function
function resizeGameCanvas() {
    const gameArea = document.querySelector('.game-area');
    const tapControls = document.querySelector('.tap-controls');

    // Check if gameArea exists before proceeding
    if (!gameArea) {
        console.warn("Game area not found. Canvas may not resize correctly.");
        return;
    }

    const availableWidth = gameArea.clientWidth;
    const availableHeight = gameArea.clientHeight;

    // Set canvas dimensions to use all available space
    canvas.width = availableWidth * 0.95; // Use 95% of available width for some margin
    canvas.height = availableHeight * 0.95; // Use 95% of available height for some margin

    // Calculate grid size based on the smaller dimension
    // This ensures grid cells remain square even if canvas is rectangular
    const smallerDimension = Math.min(canvas.width, canvas.height);
    const referenceSize = 320;
    
    // Calculate a scale factor based on the smaller dimension
    scaleFactor = smallerDimension / referenceSize;
    
    // Calculate grid size - must be an integer to avoid rendering artifacts
    gridSize = Math.max(Math.round(baseGridSize * scaleFactor), 8);
    
    // Ensure tap controls match the size of the canvas
    if (tapControls && gameArea) {
        const gameAreaRect = gameArea.getBoundingClientRect();
        tapControls.style.width = canvas.width + 'px';
        tapControls.style.height = canvas.height + 'px';
        tapControls.style.top = (canvas.offsetTop - gameAreaRect.top) + 'px';
        tapControls.style.left = (canvas.offsetLeft - gameAreaRect.left) + 'px';
    }
    
    // Recalculate game area dimensions in grid cells
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);

    console.log(`Canvas resized to: ${canvas.width}x${canvas.height}, Grid: ${gridSize}px, Cells: ${gridCellsX}x${gridCellsY}`);
    
    // Realign existing game elements to the new grid size and canvas dimensions
    realignGameElements(gridCellsX, gridCellsY);
    
    // Redraw the game with updated dimensions
    if (gameRunning) {
        clearCanvas();
        drawGrid();
        drawFood();
        drawSnake();
    } else {
        // Just initialize the visuals
        clearCanvas();
        drawGrid();
        
        // CRITICAL FIX: Force snake to be recreated from scratch
        snake = null;
        
        // Initialize snake position based on grid size with exactly 2 segments
        const centerX = Math.floor(gridCellsX / 3);
        const centerY = Math.floor(gridCellsY / 2);
        
        // Replace snake with a fresh 2-segment snake with explicit coordinates
        snake = [
            { x: centerX * gridSize, y: centerY * gridSize },
            { x: (centerX - 1) * gridSize, y: centerY * gridSize }
        ];
        
        debugSnake("AFTER RESIZE");
        
        // Reset position and ensure food is within bounds
        if (!food || typeof food.x === 'undefined') {
            food = { 
                x: (centerX + 5) * gridSize, 
                y: centerY * gridSize,
                color: fruitTypes[0].color,
                points: fruitTypes[0].points,
                type: fruitTypes[0].type
            };
        } else {
            // Ensure existing food is within boundaries
            food.x = Math.min(Math.max(0, food.x), (gridCellsX - 1) * gridSize);
            food.y = Math.min(Math.max(0, food.y), (gridCellsY - 1) * gridSize);
        }
        
        drawSnake();
        drawFood();
    }

    // Add this block to position tap zones directly on the canvas
    setTimeout(function() {
        const tapControls = document.getElementById('tapControls');
        if (tapControls && canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            
            // Position tap controls directly over the canvas
            tapControls.style.position = 'absolute';
            tapControls.style.top = '0';
            tapControls.style.left = '0';
            tapControls.style.width = '100%';
            tapControls.style.height = '100%';
            
            // Apply styles directly to tap zones
            const zones = {
                up: document.getElementById('tapUp'),
                down: document.getElementById('tapDown'),
                left: document.getElementById('tapLeft'),
                right: document.getElementById('tapRight')
            };
            
            Object.entries(zones).forEach(([dir, zone]) => {
                if (zone) {
                    zone.style.position = 'absolute';
                    zone.style.display = 'flex';
                    zone.style.alignItems = 'center';
                    zone.style.justifyContent = 'center';
                    zone.style.pointerEvents = 'auto';
                    zone.style.fontSize = '24px';
                    
                    switch(dir) {
                        case 'up':
                            zone.style.top = '0';
                            zone.style.left = '25%';
                            zone.style.width = '50%';
                            zone.style.height = '33%';
                            break;
                        case 'down':
                            zone.style.bottom = '0';
                            zone.style.left = '25%';
                            zone.style.width = '50%';
                            zone.style.height = '33%';
                            break;
                        case 'left':
                            zone.style.top = '33%';
                            zone.style.left = '0';
                            zone.style.width = '25%';
                            zone.style.height = '34%';
                            break;
                        case 'right':
                            zone.style.top = '33%';
                            zone.style.right = '0';
                            zone.style.width = '25%';
                            zone.style.height = '34%';
                            break;
                    }
                }
            });
            
            console.log("Tap zones positioned after canvas resize");
        }
    }, 50);

    // Add this at the end of the function - CRITICAL FIX
    setTimeout(function() {
        // Call setupTapZoneControls to refresh tap controls
        setupTapZoneControls();
        
        // Double-check that window.handleDirection is accessible
        if (typeof window.handleDirection !== 'function') {
            console.error("window.handleDirection is not a function - fixing now");
            window.handleDirection = handleDirection;
        }
        
        console.log("Tap controls refreshed after canvas resize");
    }, 100);
}

// Helper function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Fix the realignGameElements function
function realignGameElements(gridCellsX, gridCellsY) {
    // If snake doesn't exist or isn't an array, create it
    if (!snake || !Array.isArray(snake)) {
        snake = forceResetSnake();
        return;
    }
    
    // Ensure snake segments are within bounds
    for (let i = 0; i < snake.length; i++) {
        // Align to grid
        snake[i].x = Math.floor(snake[i].x / gridSize) * gridSize;
        snake[i].y = Math.floor(snake[i].y / gridSize) * gridSize;
        
        // Ensure within canvas boundaries
        snake[i].x = Math.min(Math.max(0, snake[i].x), (gridCellsX - 1) * gridSize);
        snake[i].y = Math.min(Math.max(0, snake[i].y), (gridCellsY - 1) * gridSize);
    }
    
    // Realign food
    if (food) {
        food.x = Math.floor(food.x / gridSize) * gridSize;
        food.y = Math.floor(food.y / gridSize) * gridSize;
        food.x = Math.min(Math.max(0, food.x), (gridCellsX - 1) * gridSize);
        food.y = Math.min(Math.max(0, food.y), (gridCellsY - 1) * gridSize);
    }
    
    // Realign multiplier
    if (multiplierFruit) {
        multiplierFruit.x = Math.floor(multiplierFruit.x / gridSize) * gridSize;
        multiplierFruit.y = Math.floor(multiplierFruit.y / gridSize) * gridSize;
        multiplierFruit.x = Math.min(Math.max(0, multiplierFruit.x), (gridCellsX - 1) * gridSize);
        multiplierFruit.y = Math.min(Math.max(0, multiplierFruit.y), (gridCellsY - 1) * gridSize);
    }
    
    // Update movement vectors
    if (dx !== 0) dx = gridSize * Math.sign(dx);
    if (dy !== 0) dy = gridSize * Math.sign(dy);
}

// Updated spawn food function to work with dynamic canvas dimensions
function spawnFood() {
    // Calculate grid dimensions based on current canvas size
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    // First, create an array of all possible positions
    let availablePositions = [];
    
    for (let x = 0; x < gridCellsX; x++) {
        for (let y = 0; y < gridCellsY; y++) {
            const posX = x * gridSize;
            const posY = y * gridSize;
            
            // Check if this position is free (not occupied by snake or multiplier)
            if (!isPositionOnSnake(posX, posY) && 
                !(multiplierFruit && multiplierFruit.x === posX && multiplierFruit.y === posY)) {
                availablePositions.push({ x: posX, y: posY });
            }
        }
    }
    
    // If no positions available, the game is won
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
    
    console.log(`Food spawned at: x=${food.x}, y=${food.y}, type=${food.type}, grid: ${gridSize}px`);
}

// Updated spawn multiplier fruit to work with dynamic canvas dimensions
function spawnMultiplierFruit() {
    if (multiplierFruit) return; // Already exists
    
    // Calculate grid dimensions based on current canvas size
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    // Create an array of all possible positions
    let availablePositions = [];
    
    for (let x = 0; x < gridCellsX; x++) {
        for (let y = 0; y < gridCellsY; y++) {
            const posX = x * gridSize;
            const posY = y * gridSize;
            
            // Check if this position is free (not occupied by snake or food)
            if (!isPositionOnSnake(posX, posY) && 
                !(food && food.x === posX && food.y === posY)) {
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
    
    multiplierFruit = { 
        x: randomPosition.x, 
        y: randomPosition.y 
    };
    
    console.log(`Multiplier spawned at: x=${multiplierFruit.x}, y=${randomPosition.y}, grid: ${gridSize}px`);
    
    // Remove multiplier fruit after its duration
    if (multiplierFruitTimer) clearTimeout(multiplierFruitTimer);
    multiplierFruitTimer = setTimeout(() => {
        multiplierFruit = null;
    }, multiplierDuration);
}

// Update move function to handle the boundaries based on current canvas dimensions
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Wrap around the edges based on current canvas dimensions
    if (head.x < 0) head.x = Math.floor(canvas.width / gridSize) * gridSize - gridSize;
    else if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = Math.floor(canvas.height / gridSize) * gridSize - gridSize;
    else if (head.y >= canvas.height) head.y = 0;
    
    // Ensure head coordinates are aligned to grid
    head.x = Math.floor(head.x / gridSize) * gridSize;
    head.y = Math.floor(head.y / gridSize) * gridSize;
    
    snake.unshift(head); // Add new head to the snake
    
    // ...existing collision detection code...
}

// Update window.onload to use the updated grid size and coordinate properly
window.onload = function() {
    console.log("Game initializing...");
    
    try {
        // Clear any existing snake
        snake = null;

        // First call resize to initialize canvas and grid size
        resizeGameCanvas();
        // ...existing code...
        
        // Create a new snake with exactly two segments for display
        const gridCellsX = Math.floor(canvas.width / gridSize);
        const gridCellsY = Math.floor(canvas.height / gridSize);
        const startX = Math.floor(gridCellsX / 3) * gridSize;
        const startY = Math.floor(gridCellsY / 2) * gridSize;
        
        snake = [
            { x: startX, y: startY },              // Head
            { x: startX - gridSize, y: startY }    // Tail - exactly one segment
        ];
        
        debugSnake("INITIALIZATION");
        
        // ...existing code...
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

// Fix moveSnake function - completely rewrite this critical function
function moveSnake() {
    // Validate snake
    if (!snake || !Array.isArray(snake) || snake.length === 0) {
        console.error("Invalid snake in moveSnake");
        snake = forceResetSnake();
        return;
    }
    
    // Get current head position
    const head = snake[0];
    
    // Calculate new head position 
    const newHeadX = head.x + dx;
    const newHeadY = head.y + dy;
    
    // Handle edge wrapping
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    let wrappedX = newHeadX;
    let wrappedY = newHeadY;
    
    // Handle horizontal wrapping
    if (wrappedX < 0) {
        wrappedX = (gridCellsX - 1) * gridSize;
    } else if (wrappedX >= gridCellsX * gridSize) {
        wrappedX = 0;
    }
    
    // Handle vertical wrapping
    if (wrappedY < 0) {
        wrappedY = (gridCellsY - 1) * gridSize;
    } else if (wrappedY >= gridCellsY * gridSize) {
        wrappedY = 0;
    }
    
    // Create the new head object with exact grid alignment
    const newHead = {
        x: Math.floor(wrappedX / gridSize) * gridSize,
        y: Math.floor(wrappedY / gridSize) * gridSize
    };
    
    // Add the new head to the snake
    snake.unshift(newHead);
    
    // Check for food collision with STRICT equality comparison
    let foodEaten = false;
    
    if (food && newHead.x === food.x && newHead.y === food.y) {
        foodEaten = true;
        
        // Add score
        score += food.points;
        updateScore();
        
        // Spawn new food
        spawnFood();
        
        // Don't remove tail - snake grows
    } else {
        // No food eaten, remove the tail
        snake.pop();
    }
    
    // Check for multiplier collision with STRICT equality comparison
    if (multiplierFruit && 
        newHead.x === multiplierFruit.x && 
        newHead.y === multiplierFruit.y) {
        
        // Apply multiplier to food
        if (food) {
            food.points *= multiplierValue;
        }
        
        // Remove multiplier
        multiplierFruit = null;
        
        // Clear timer
        if (multiplierFruitTimer) {
            clearTimeout(multiplierFruitTimer);
            multiplierFruitTimer = null;
        }
    }
}

// Completely replace the spawnFood function
function spawnFood() {
    // Safety checks
    if (!snake || !Array.isArray(snake)) {
        console.error("Cannot spawn food without snake");
        snake = forceResetSnake();
    }
    
    // Calculate grid dimensions
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    // First, collect all valid positions (not occupied by snake or multiplier)
    const validPositions = [];
    
    // Loop through every cell in the grid
    for (let x = 0; x < gridCellsX; x++) {
        for (let y = 0; y < gridCellsY; y++) {
            // Calculate exact grid-aligned position
            const posX = x * gridSize;
            const posY = y * gridSize;
            
            // Check if this position is occupied by the snake
            let occupied = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === posX && snake[i].y === posY) {
                    occupied = true;
                    break;
                }
            }
            
            // Check if position is occupied by multiplier
            if (!occupied && multiplierFruit && 
                multiplierFruit.x === posX && multiplierFruit.y === posY) {
                occupied = true;
            }
            
            // If not occupied, add to valid positions
            if (!occupied) {
                validPositions.push({x: posX, y: posY});
            }
        }
    }
    
    // If no valid positions, game is won
    if (validPositions.length === 0) {
        console.log("No valid positions for food - game won!");
        stopGame();
        return;
    }
    
    // Randomly select a position
    const randomPosition = validPositions[Math.floor(Math.random() * validPositions.length)];
    
    // Randomly select a fruit type based on probability
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
    
    // Create new food object with EXACT grid-aligned coordinates
    food = {
        x: randomPosition.x,
        y: randomPosition.y,
        color: selectedFruit.color,
        points: selectedFruit.points,
        type: selectedFruit.type
    };
    
    console.log(`New food spawned at (${food.x}, ${food.y}), type: ${food.type}`);
}

// Add key game loop with debugging for every frame
function gameLoop(timestamp) {
    if (gamePaused) {
        if (gameRunning) requestAnimationFrame(gameLoop);
        return;
    }
    
    // Request next frame
    requestAnimationFrame(gameLoop);
    
    // Update interpolation for smooth movement
    interpolationFactor = Math.min(1, interpolationFactor + INTERPOLATION_SPEED);
    
    // Process game logic at fixed intervals
    if (timestamp - lastMoveTime >= gameSpeed) {
        // Process direction queue
        processDirectionQueue();
        
        // Move snake (this is where the critical logic happens)
        moveSnake();
        
        // Check for self-collision
        if (checkCollision()) {
            stopGame();
            showGameOver();
            return;
        }
        
        // Reset interpolation
        interpolationFactor = 0;
        lastMoveTime = timestamp;
        
        // Chance to spawn multiplier
        if (Math.random() < multiplierChance && !multiplierFruit) {
            spawnMultiplierFruit();
        }
    }
    
    // Clear and draw
    clearCanvas();
    drawGrid();
    drawSnake();
    drawFood();
    
    // Update frame time
    lastFrameTime = timestamp;
}

// Override the startGame function for completely clean initialization
function startGame() {
    // Stop any existing game activity
    stopGame();
    
    // Reset game state
    gameRunning = true;
    gamePaused = false;
    score = 0;
    
    // Calculate grid dimensions
    const gridCellsX = Math.floor(canvas.width / gridSize);
    const gridCellsY = Math.floor(canvas.height / gridSize);
    
    // Create a completely fresh snake with exact coordinates
    const startX = Math.floor(gridCellsX / 3) * gridSize;
    const startY = Math.floor(gridCellsY / 2) * gridSize;
    
    snake = [
        {x: startX, y: startY},             // Head
        {x: startX - gridSize, y: startY}   // Body (single segment)
    ];
    
    // Set direction
    dx = gridSize;
    dy = 0;
    
    // Reset direction queue
    directionQueue = [];
    
    // Clear any existing food or multiplier
    food = null;
    multiplierFruit = null;
    
    if (multiplierFruitTimer) {
        clearTimeout(multiplierFruitTimer);
        multiplierFruitTimer = null;
    }
    
    // Generate new food
    spawnFood();
    
    // Reset UI
    updateScore();
    
    // Set game speed
    gameSpeed = 120;
    
    // Reset timing variables
    lastFrameTime = 0;
    lastMoveTime = 0;
    interpolationFactor = 0;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Update UI
    updateStartButton('pause');
}

// Helper function to handle direction changes - make sure it's working properly
function handleDirection(dir) {
    if (!gameRunning || gamePaused) return;
    
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;
    
    console.log(`Direction requested: ${dir}, Current direction: dx=${dx}, dy=${dy}`);
    
    switch(dir) {
        case 'up':
            if (!goingDown) {
                directionQueue.push({ dx: 0, dy: -gridSize });
                console.log("Queued UP direction");
            }
            break;
        case 'down':
            if (!goingUp) {
                directionQueue.push({ dx: 0, dy: gridSize });
                console.log("Queued DOWN direction");
            }
            break;
        case 'left':
            if (!goingRight) {
                directionQueue.push({ dx: -gridSize, dy: 0 });
                console.log("Queued LEFT direction");
            }
            break;
        case 'right':
            if (!goingLeft) {
                directionQueue.push({ dx: gridSize, dy: 0 });
                console.log("Queued RIGHT direction");
            }
            break;
    }
}

// Make sure the process direction queue function is working correctly
function processDirectionQueue() {
    if (directionQueue.length > 0) {
        const newDirection = directionQueue.shift();
        
        // Prevent reversing into itself
        const reverseDirection = dx === -newDirection.dx && dy === -newDirection.dy;
        
        if (!reverseDirection) {
            // Update direction
            dx = newDirection.dx;
            dy = newDirection.dy;
            console.log(`Direction changed to: dx=${dx}, dy=${dy}`);
        }
    }
}

// Replace the setupTapZoneControls function with this simplified version
function setupTapZoneControls() {
    console.log("Setting up simplified tap controls");
    
    // Get tap zones
    const tapUp = document.getElementById('tapUp');
    const tapDown = document.getElementById('tapDown');
    const tapLeft = document.getElementById('tapLeft');
    const tapRight = document.getElementById('tapRight');
    
    // Log what we found
    console.log("Looking for tap zones:", {
        up: !!tapUp,
        down: !!tapDown,
        left: !!tapLeft,
        right: !!tapRight
    });
    
    // Exit if not found
    if (!tapUp || !tapDown || !tapLeft || !tapRight) {
        console.error("Some tap zones are missing!");
        return;
    }
    
    // Create simple event handler
    function createHandler(direction) {
        return function(e) {
            if (e) e.preventDefault();
            console.log("Tap direction:", direction);
            if (gameRunning && !gamePaused) {
                handleDirection(direction);
            }
        };
    }
    
    // Attach handlers directly (simpler is better)
    tapUp.onclick = createHandler('up');
    tapDown.onclick = createHandler('down');
    tapLeft.onclick = createHandler('left');
    tapRight.onclick = createHandler('right');
    
    // Also attach touch events for mobile
    tapUp.ontouchend = createHandler('up');
    tapDown.ontouchend = createHandler('down');
    tapLeft.ontouchend = createHandler('left');
    tapRight.ontouchend = createHandler('right');
    
    // Style them for visibility
    [tapUp, tapDown, tapLeft, tapRight].forEach(zone => {
        if (zone) {
            // Fix the tap zone appearance
            zone.style.display = "flex";
            zone.style.alignItems = "center";
            zone.style.justifyContent = "center";
            zone.style.fontSize = "24px";
            zone.style.color = "rgba(255, 255, 255, 0.5)";
            zone.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            zone.style.border = "1px solid rgba(255, 255, 255, 0.2)";
            zone.style.cursor = "pointer";
        }
    });
    
    console.log("Tap zone controls set up successfully");
}

// CRITICAL FIX: Export handleDirection to window object so it can be called from other scripts
window.handleDirection = function(dir) {
    if (!gameRunning || gamePaused) return;
    
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;
    
    console.log(`Direction requested: ${dir}, Current direction: dx=${dx}, dy=${dy}`);
    
    switch(dir) {
        case 'up':
            if (!goingDown) {
                directionQueue.push({ dx: 0, dy: -gridSize });
                console.log("Queued UP direction");
            }
            break;
        case 'down':
            if (!goingUp) {
                directionQueue.push({ dx: 0, dy: gridSize });
                console.log("Queued DOWN direction");
            }
            break;
        case 'left':
            if (!goingRight) {
                directionQueue.push({ dx: -gridSize, dy: 0 });
                console.log("Queued LEFT direction");
            }
            break;
        case 'right':
            if (!goingLeft) {
                directionQueue.push({ dx: gridSize, dy: 0 });
                console.log("Queued RIGHT direction");
            }
            break;
    }
};

// Export directionQueue to window for emergency access
window.directionQueue = directionQueue;

// Fix setupTapZoneControls to ensure it really works
function setupTapZoneControls() {
    console.log("Setting up simplified tap controls");
    
    // Get tap zones
    const tapUp = document.getElementById('tapUp');
    const tapDown = document.getElementById('tapDown');
    const tapLeft = document.getElementById('tapLeft');
    const tapRight = document.getElementById('tapRight');
    
    // Log what we found
    console.log("Looking for tap zones:", {
        up: !!tapUp,
        down: !!tapDown,
        left: !!tapLeft,
        right: !!tapRight
    });
    
    // Exit if not found
    if (!tapUp || !tapDown || !tapLeft || !tapRight) {
        console.error("Some tap zones are missing!");
        return;
    }
    
    // Create simple event handler with fail-safe debug logging
    function createHandler(direction) {
        return function(e) {
            if (e) e.preventDefault(); // Prevent default to avoid double actions
            console.log("Tap direction:", direction);
            
            // Call global handleDirection function
            window.handleDirection(direction);
        };
    }
    
    // First, reset all existing event handlers
    [tapUp, tapDown, tapLeft, tapRight].forEach(zone => {
        if (!zone) return;
        
        // Clone and replace to remove all event handlers
        const clone = zone.cloneNode(true);
        zone.parentNode.replaceChild(clone, zone);
    });
    
    // Get fresh references after replacing
    const freshTapUp = document.getElementById('tapUp');
    const freshTapDown = document.getElementById('tapDown');
    const freshTapLeft = document.getElementById('tapLeft');
    const freshTapRight = document.getElementById('tapRight');
    
    // Attach handlers directly using inline attributes too
    freshTapUp.setAttribute('onclick', "window.handleDirection('up')");
    freshTapDown.setAttribute('onclick', "window.handleDirection('down')");
    freshTapLeft.setAttribute('onclick', "window.handleDirection('left')");
    freshTapRight.setAttribute('onclick', "window.handleDirection('right')");
    
    // Also attach modern event listeners
    freshTapUp.addEventListener('click', createHandler('up'), false);
    freshTapDown.addEventListener('click', createHandler('down'), false);
    freshTapLeft.addEventListener('click', createHandler('left'), false);
    freshTapRight.addEventListener('click', createHandler('right'), false);
    
    // Also add touch events specifically
    freshTapUp.addEventListener('touchend', createHandler('up'), false);
    freshTapDown.addEventListener('touchend', createHandler('down'), false);
    freshTapLeft.addEventListener('touchend', createHandler('left'), false);
    freshTapRight.addEventListener('touchend', createHandler('right'), false);
    
    // Style them for better visibility 
    [freshTapUp, freshTapDown, freshTapLeft, freshTapRight].forEach(zone => {
        if (zone) {
            // Fix the tap zone appearance
            zone.style.display = "flex";
            zone.style.alignItems = "center";
            zone.style.justifyContent = "center";
            zone.style.fontSize = "24px";
            zone.style.color = "rgba(255, 255, 255, 0.7)";
            zone.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            zone.style.border = "1px solid rgba(255, 255, 255, 0.3)";
            zone.style.cursor = "pointer";
            zone.style.touchAction = "none"; // Critical for iOS touch handling
        }
    });
    
    console.log("Tap zone controls set up successfully");
}