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

// Sound effects
const sounds = {
    eat: new Audio('sounds/eat.mp3'),
    bonus: new Audio('sounds/bonus.mp3'),
    multiplier: new Audio('sounds/multiplier.mp3'),
    gameOver: new Audio('sounds/game-over.mp3')
};

// Sound control variables
let isMuted = false;
const muteBtn = document.getElementById('muteBtn');

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

// Play sound helper
function playSound(sound) {
    if (sounds[sound] && !isMuted) {
        // Stop the sound if it's already playing
        sounds[sound].currentTime = 0;
        sounds[sound].play();
    }
}

// Toggle mute function
function toggleMute() {
    isMuted = !isMuted;
    muteBtn.innerHTML = isMuted ? 
        '<i class="fas fa-volume-mute"></i>' : 
        '<i class="fas fa-volume-up"></i>';
}

// Add mute button event listener
muteBtn.addEventListener('click', toggleMute);

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

// Function to draw the snake with neo-brutalist design
function drawSnake() {
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
        ctx.lineWidth = design.borderWidth || 2;
        ctx.stroke();
        
        // Add inner pattern for more brutalist aesthetic
        if (i % 2 === 0) { // Alternate pattern
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.rect(drawX + 5, drawY + 5, gridSize - 10, gridSize - 10);
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
    ctx.shadowBlur = design.glowStrength || 12; // Stronger glow
    
    // Head style from design
    ctx.fillStyle = design.head || '#FF5F1F';
    
    // Draw the head as a rectangle for brutalist aesthetic
    ctx.beginPath();
    ctx.rect(drawX, drawY, gridSize, gridSize);
    ctx.fill();
    
    // Add black border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = design.borderWidth + 1 || 3; // Thicker border for head
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw inner pattern for the head
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.rect(drawX + 3, drawY + 3, gridSize - 6, gridSize - 6);
    ctx.fill();
    
    // Determine eye position based on direction
    const eyeSize = 3.5;
    const eyeOffset = 4.5;
    
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
    ctx.arc(leftEyeX, leftEyeY, eyeSize + 1, 0, Math.PI * 2);
    ctx.arc(rightEyeX, rightEyeY, eyeSize + 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes - white circles
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils with a brutalist harsh glow
    ctx.shadowColor = design.pupilGlow || '#FFFC31';
    ctx.shadowBlur = 8; // Dramatic glow
    ctx.fillStyle = 'black';
    
    // Calculate pupil position - makes the snake look in the direction it's moving
    const pupilShift = 1;
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
        ctx.shadowBlur = 10;
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
    ctx.lineWidth = 2;
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
        ctx.shadowBlur = 12;
        
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
        ctx.lineWidth = 2;
        ctx.stroke();
        
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
                availablePositions.push({ x: posX, posY });
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
    
    if (keyPressed === 37) handleDirection('left');      // Left arrow
    else if (keyPressed === 38) handleDirection('up');   // Up arrow
    else if (keyPressed === 39) handleDirection('right'); // Right arrow
    else if (keyPressed === 40) handleDirection('down'); // Down arrow
    else if (keyPressed === 80) togglePause();           // P key
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
        playSound('multiplier');
        // Multiply the points of the next food
        food.points *= multiplierValue;
        
        // Clear the multiplier fruit
        multiplierFruit = null;
        clearTimeout(multiplierFruitTimer);
        
        console.log("Multiplier taken! Next fruit worth x5 points");
    }

    // Check if the snake eats the regular food with improved detection
    if (Math.abs(head.x - food.x) < gridSize/2 && Math.abs(head.y - food.y) < gridSize/2) {
        playSound(food.type === 'bonus' ? 'bonus' : 'eat');
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
            playSound('gameOver');
            return true;
        }
    }

    return false; // No collision
}

// Enhanced function for updating the score with animation
function updateScore() {
    scoreElement.textContent = score;
    scoreElement.classList.add('score-update');
    setTimeout(() => scoreElement.classList.remove('score-update'), 300);
}

// Event listener for key presses
document.addEventListener('keydown', changeDirection);

// Initialize the game
const canvasSize = 380;  // Increased from 320 to 380

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
    
    // Set up touch controls
    setupTouchControls();
    
    // Test device type and set up mobile controls
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Enable tap controls for mobile
        const tapControls = document.querySelector('.tap-controls');
        if (tapControls) tapControls.style.display = 'block';
    }

    // Set viewport height to ensure no scrolling
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    // For extremely small screens, hide guides completely
    const viewportHeight = window.innerHeight;
    if (viewportHeight < 650) {
        const guideToggle = document.querySelector('.guide-toggle');
        if (guideToggle) guideToggle.style.display = 'none';
    }
};

// Add the following code to show game status messages
function showGameOver() {
    const gameOverElement = document.getElementById('gameOver');
    gameOverElement.style.display = 'block';
    playSound('gameOver');
    
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

// Improved mobile touch controls
function setupTouchControls() {
    // Get reference to canvas and other elements
    const touchArea = document.getElementById('gameCanvas');
    const swipeIndicator = document.getElementById('swipeIndicator');
    
    // Swipe gesture controls
    let startX, startY;
    const MIN_SWIPE = 30; // Minimum swipe distance

    touchArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        // Show the swipe indicator briefly on first touch
        if (gameRunning && !localStorage.getItem('swipeInstructionShown')) {
            if (swipeIndicator) {
                swipeIndicator.classList.add('visible');
                setTimeout(() => {
                    swipeIndicator.classList.remove('visible');
                    localStorage.setItem('swipeInstructionShown', 'true');
                }, 2000);
            }
        }
    });

    touchArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });

    touchArea.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        
        // Only register as swipe if movement is significant
        if (Math.abs(dx) > MIN_SWIPE || Math.abs(dy) > MIN_SWIPE) {
            // Provide haptic feedback
            vibrateIfPossible();
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 0) handleDirection('right');
                else handleDirection('left');
            } else {
                // Vertical swipe
                if (dy > 0) handleDirection('down');
                else handleDirection('up');
            }
        }
        
        startX = null;
        startY = null;
    });
    
    // Set up tap zone controls as alternative to swipes
    const tapUp = document.getElementById('tapUp');
    const tapDown = document.getElementById('tapDown');
    const tapLeft = document.getElementById('tapLeft');
    const tapRight = document.getElementById('tapRight');
    
    // Add event listeners for tap zones if they exist
    if (tapUp) {
        tapUp.addEventListener('touchstart', (e) => {
            e.preventDefault();
            vibrateIfPossible();
            handleDirection('up');
        });
    }
    
    if (tapDown) {
        tapDown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            vibrateIfPossible();
            handleDirection('down');
        });
    }
    
    if (tapLeft) {
        tapLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            vibrateIfPossible();
            handleDirection('left');
        });
    }
    
    if (tapRight) {
        tapRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            vibrateIfPossible();
            handleDirection('right');
        });
    }
    
    // Add haptic feedback
    function vibrateIfPossible() {
        if ('vibrate' in navigator) {
            navigator.vibrate(30); // Short vibration for 30ms
        }
    }
}

// Helper function to handle direction changes
function handleDirection(dir) {
    if (!gameRunning || gamePaused) return;
    
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;
    
    switch(dir) {
        case 'up':
            if (!goingDown) directionQueue.push({ dx: 0, dy: -gridSize });
            break;
        case 'down':
            if (!goingUp) directionQueue.push({ dx: 0, dy: gridSize });
            break;
        case 'left':
            if (!goingRight) directionQueue.push({ dx: -gridSize, dy: 0 });
            break;
        case 'right':
            if (!goingLeft) directionQueue.push({ dx: gridSize, dy: 0 });
            break;
    }
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
    ctx.lineWidth = 2;
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