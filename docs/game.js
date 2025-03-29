// Game constants
window.GAME_WIDTH = 800;
window.GAME_HEIGHT = 600;
window.PLAYER_SIZE = 80;
window.PLAYER_SPEED = 5;
window.INTERACTION_DISTANCE = 100;

// Initialize global variables to prevent reference errors
window.gameState = "gameplay";
window.interactingWith = window.interactingWith || null;
window.lastTime = window.lastTime || 0;
window.gameInitialized = window.gameInitialized || false;
window.inDialogMode = window.inDialogMode || false;
window.animationFrameId = window.animationFrameId || null;
window.notifications = window.notifications || [];
window.npcs = window.npcs || [];
window.obstacles = [];
window.items = [];
    
// Ensure keys object exists
window.keys = window.keys || {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false, 
    ArrowDown: false, 
    ArrowLeft: false, 
    ArrowRight: false,
    e: false,
    i: false
};

// Ensure imageObjects exists
window.imageObjects = window.imageObjects || {};
    
// Ensure IMAGES object exists
window.IMAGES = window.IMAGES || {
    playerSprite: 'images/player_sprite.png'
};

console.log("Global variables initialized");

// Player - use global window.player
window.player = {
    x: 400, // Center of screen
    y: 300, // Center of screen
    width: 80, // Size
    height: 80, // Size
    speed: 2, // Movement speed from provided code
    facing: 'down',
    isMoving: false,
    frameIndex: 1, // Current animation frame
    frameDelay: 0, // Counter for animation timing
    spriteImg: null, // Will be loaded with player sprite
    
    // Update movement using the approach from provided code
    update: function(deltaTime) {
        // Store old position
        const oldX = this.x;
        const oldY = this.y;
        
        // Reset movement flag
        this.isMoving = false;
        
        // Get keyboard state
        const keysPressed = {};
        if (typeof window.keys === 'object') {
            keysPressed.up = window.keys.ArrowUp || window.keys.w;
            keysPressed.down = window.keys.ArrowDown || window.keys.s;
            keysPressed.left = window.keys.ArrowLeft || window.keys.a;
            keysPressed.right = window.keys.ArrowRight || window.keys.d;
        }
        
        // Handle movement based on key state
        let proposedX = this.x;
        let proposedY = this.y;
        
        if (keysPressed.up) {
            proposedY -= this.speed;
            this.facing = 'up';
            this.isMoving = true;
        }
        if (keysPressed.down) {
            proposedY += this.speed;
            this.facing = 'down';
            this.isMoving = true;
        }
        if (keysPressed.left) {
            proposedX -= this.speed;
            this.facing = 'left';
            this.isMoving = true;
        }
        if (keysPressed.right) {
            proposedX += this.speed;
            this.facing = 'right';
            this.isMoving = true;
        }
        
        // Update position
        this.x = proposedX;
        this.y = proposedY;
        
        // Keep player within screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        
        // Update animation using the frameDelay counter approach from provided code
        if (this.isMoving) {
            this.frameDelay++;
            if (this.frameDelay > 8) { // Change frame every 8 game cycles
                this.frameIndex = (this.frameIndex + 1) % 3;
                this.frameDelay = 0;
            }
        } else {
            // When standing still, use frame 1 (middle frame)
            this.frameIndex = 1;
        }
        
        // Log position for debugging
        if (oldX !== this.x || oldY !== this.y) {
            console.log(`Player moved to: ${Math.floor(this.x)},${Math.floor(this.y)}, Frame: ${this.frameIndex}`);
        }
    },
    
    // Draw the player using sprite sheet
    draw: function() {
        if (this.spriteImg && this.spriteImg.complete && this.spriteImg.naturalWidth > 0) {
            // Calculate sprite frame based on direction and animation
            let directionIndex = 0; // Default: facing down
            
            // Map direction to row index as in the provided code:
            // down=0, up=1, right=2, left=3
            if (this.facing === 'down') directionIndex = 0;
            else if (this.facing === 'up') directionIndex = 1;
                else if (this.facing === 'right') directionIndex = 2;
                else if (this.facing === 'left') directionIndex = 3;
                
            // Each frame is 1/3 of sprite width, each direction is 1/4 of sprite height
            const frameWidth = this.spriteImg.naturalWidth / 3;
            const frameHeight = this.spriteImg.naturalHeight / 4;
            
            // Draw the correct sprite frame
                    ctx.drawImage(
                        this.spriteImg,
                this.frameIndex * frameWidth, directionIndex * frameHeight, // Source x,y
                frameWidth, frameHeight, // Source dimensions
                this.x, this.y, this.width, this.height // Destination
                    );
                
            // Debug: Draw frame indicator
                if (window.location.hash === '#debug') {
                    ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(`Frame: ${this.frameIndex} Dir: ${this.facing}`, this.x, this.y - 5);
                }
            } else {
            // Fallback if sprite not loaded
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
};

// NPCs - only keep the CEO
window.npcs = [
    {
        x: 600,
        y: 200,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        name: "CEO",
        color: "#9C27B0",
        facing: "down",
        dialogues: [
            "Welcome to FuLife!",
            "I'm the CEO. I run this place.",
            "Feel free to explore the map!"
        ],
        currentDialogIndex: 0,
        
        draw: function() {
            // Draw a simple representation of the NPC
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add a border
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Draw name above NPC
            ctx.fillStyle = "white";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x + this.width/2, this.y - 10);
            ctx.textAlign = "left";
        }
    }
];

// Check collision between two objects
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Check if two objects are within interaction distance
function canInteract(obj1, obj2) {
    const centerX1 = obj1.x + obj1.width / 2;
    const centerY1 = obj1.y + obj1.height / 2;
    const centerX2 = obj2.x + obj2.width / 2;
    const centerY2 = obj2.y + obj2.height / 2;
    
    const distance = Math.sqrt(
        Math.pow(centerX2 - centerX1, 2) + 
        Math.pow(centerY2 - centerY1, 2)
    );
    
    return distance < INTERACTION_DISTANCE;
}

// Find the closest NPC within interaction distance
function getInteractableNPC() {
    for (let npc of npcs) {
        if (canInteract(player, npc)) {
            return npc;
        }
    }
    return null;
}

// Start dialog with an NPC
function startDialog(npc) {
    console.log("Starting dialog with:", npc.name);
    window.interactingWith = npc;
    inDialogMode = true;
    
    // Create dialog container if it doesn't exist
    let dialogContainer = document.getElementById('dialogContainer');
    if (!dialogContainer) {
        dialogContainer = document.createElement('div');
        dialogContainer.id = 'dialogContainer';
        dialogContainer.style.position = 'absolute';
        dialogContainer.style.bottom = '20px';
        dialogContainer.style.left = '50%';
        dialogContainer.style.transform = 'translateX(-50%)';
        dialogContainer.style.width = '80%';
        dialogContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        dialogContainer.style.color = 'white';
        dialogContainer.style.padding = '20px';
        dialogContainer.style.borderRadius = '10px';
        dialogContainer.style.zIndex = '100';
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
    gameContainer.appendChild(dialogContainer);
        } else {
            document.body.appendChild(dialogContainer);
        }
    }
    
    // Set dialog content
    dialogContainer.innerHTML = `
        <h3>${npc.name}</h3>
        <p>${npc.dialogues[npc.currentDialogIndex]}</p>
        <div style="font-size:12px; color:#aaa;">Press SPACE to continue, ESC to close</div>
    `;
    
    dialogContainer.style.display = 'block';
    
    // Add event listener for keys
    document.addEventListener('keydown', handleDialogKeyPress);
}

// Close the dialog
function closeDialog() {
    inDialogMode = false;
    window.interactingWith = null;
    
    // Remove event listener
    document.removeEventListener('keydown', handleDialogKeyPress);
    
    // Hide dialog container
    const dialogContainer = document.getElementById('dialogContainer');
    if (dialogContainer) {
        dialogContainer.style.display = 'none';
    }
}

// Handle key presses in dialog
function handleDialogKeyPress(e) {
    if (inDialogMode && window.interactingWith) {
        if (e.key === ' ' || e.code === 'Space') {
            advanceDialog(window.interactingWith);
            e.preventDefault();
        } else if (e.key === 'Escape') {
            closeDialog();
            e.preventDefault();
        }
    }
}

// Advance to next dialog line
function advanceDialog(npc) {
    if (!npc || !Array.isArray(npc.dialogues)) return;
    
    npc.currentDialogIndex = (npc.currentDialogIndex + 1) % npc.dialogues.length;
    
    // Update dialog text
    const dialogContainer = document.getElementById('dialogContainer');
    if (dialogContainer) {
        dialogContainer.innerHTML = `
            <h3>${npc.name}</h3>
            <p>${npc.dialogues[npc.currentDialogIndex]}</p>
            <div style="font-size:12px; color:#aaa;">Press SPACE to continue, ESC to close</div>
        `;
    }
}

// Handle keyboard events
function handleKeyDown(e) {
    console.log(`Key pressed: ${e.key}`);
    
    // Only process keyboard events if not in dialog mode
    if (!inDialogMode) {
        // Movement keys
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            window.keys.w = window.keys.ArrowUp = true;
            console.log("UP key pressed, keys state:", window.keys);
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            window.keys.s = window.keys.ArrowDown = true;
            console.log("DOWN key pressed, keys state:", window.keys);
        }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            window.keys.a = window.keys.ArrowLeft = true;
            console.log("LEFT key pressed, keys state:", window.keys);
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            window.keys.d = window.keys.ArrowRight = true;
            console.log("RIGHT key pressed, keys state:", window.keys);
        }
        
        // Action key
        if (e.key === 'e' || e.key === 'E') {
            window.keys.e = true;
            
            // Check for NPC interaction
            const npc = getInteractableNPC();
            if (npc) {
        startDialog(npc);
            }
        }
    }
}

// Handle key release
function handleKeyUp(e) {
    console.log(`Key released: ${e.key}`);
    
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        window.keys.w = window.keys.ArrowUp = false;
        console.log("UP key released, keys state:", window.keys);
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        window.keys.s = window.keys.ArrowDown = false;
        console.log("DOWN key released, keys state:", window.keys);
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        window.keys.a = window.keys.ArrowLeft = false;
        console.log("LEFT key released, keys state:", window.keys);
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        window.keys.d = window.keys.ArrowRight = false;
        console.log("RIGHT key released, keys state:", window.keys);
    }
    if (e.key === 'e' || e.key === 'E') {
        window.keys.e = false;
    }
}

// Handle canvas clicks
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on an NPC
    for (let npc of npcs) {
        if (x >= npc.x && x <= npc.x + npc.width && 
            y >= npc.y && y <= npc.y + npc.height) {
            if (canInteract(player, npc)) {
                startDialog(npc);
            }
        }
    }
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;
    
    // Make sure the canvas has focus for keyboard events
    const canvas = document.getElementById('gameCanvas');
    if (canvas && document.activeElement !== canvas) {
        console.log("Forcing focus on canvas");
        canvas.focus();
    }
    
    // Update player
    player.update(deltaTime);
    
    // Draw everything
    draw();
    
    // Draw dialog if in dialog mode
    if (inDialogMode) {
        // Dialog is handled by the DOM
    }
    
    // Update debug info 
    updateDebugInfo(deltaTime);
    
    // Request next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Update debug information
function updateDebugInfo(deltaTime) {
    // Update FPS counter
    const debugFps = document.getElementById('debugFps');
    if (debugFps) {
        debugFps.textContent = Math.round(1 / (deltaTime || 0.016));
    }
    
    // Update position display
    const debugPos = document.getElementById('debugPos');
    if (debugPos && player) {
        debugPos.textContent = `${Math.round(player.x)},${Math.round(player.y)}`;
    }
    
    // Update game state display
    const debugState = document.getElementById('debugState');
    if (debugState) {
        debugState.textContent = gameState;
    }
    
    // Update keys state display
    const debugKeys = document.getElementById('debugKeys');
    if (debugKeys) {
        debugKeys.textContent = JSON.stringify(window.keys);
    }
    
    // Draw additional debug info if enabled
    if (window.location.hash === '#debug') {
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`FPS: ${Math.round(1 / (deltaTime || 0.016))}`, 10, 20);
        ctx.fillText(`Player: ${Math.round(player.x)},${Math.round(player.y)}`, 10, 40);
        ctx.fillText(`Game State: ${gameState}`, 10, 60);
        ctx.fillText(`Keys: ${JSON.stringify(window.keys)}`, 10, 80); // Debug key states
    }
}

// Load player sprite
function loadImages() {
    console.log('Loading player sprite...');
    
    return new Promise((resolve) => {
        // Create image object for player sprite
            player.spriteImg = new Image();
        
        // Set up load handlers
            player.spriteImg.onload = function() {
            console.log('Player sprite loaded successfully');
            resolve(true);
            };
        
            player.spriteImg.onerror = function() {
            console.error('Failed to load player sprite');
            resolve(false);
        };
        
        // Set source to load the image
        player.spriteImg.src = 'images/player_sprite.png';
        
        // Set a timeout in case image loading takes too long
            setTimeout(() => {
                if (!player.spriteImg.complete) {
                console.warn('Player sprite load timeout');
                resolve(false);
            }
        }, 5000);
    });
}

// Draw everything in the game
function draw() {
    // Clear the canvas with full transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
        // Draw player
        player.draw();

// Draw NPCs
    for (const npc of npcs) {
            npc.draw();
        }
        
        // Draw interaction indicators
        const nearbyNPC = getInteractableNPC();
        if (nearbyNPC) {
            drawInteractionIndicator(nearbyNPC);
        }
        
        // Draw controls hint
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(10, 10, 380, 30);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
        ctx.fillText("Move: WASD or Arrow Keys | Interact: E", 20, 30);
        
        // Force rerender on next frame
        if (window.gameState !== "gameplay") {
            window.gameState = "gameplay";
            console.log("Forced game state to gameplay in draw function");
        }
    } catch (e) {
        console.error("Error in draw function:", e);
    }
}

// Draw interaction indicator
function drawInteractionIndicator(npc) {
    const x = npc.x + npc.width / 2;
    const y = npc.y - 15;
    
    // Draw "E" indicator
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
    ctx.arc(x, y - 15, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("E", x, y - 10);
    
    // Draw "Talk" text
    ctx.font = "12px Arial";
    ctx.fillText("Talk", x, y + 10);
    
    // Reset alignment
    ctx.textAlign = "left";
}

// Initialize the game
function initGame() {
    console.log("Initializing game...");
    
    try {
    // Get the canvas and context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
            console.error("Canvas element not found!");
            return;
    }
    
    ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
        // Ensure proper transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Position player
            player.x = (GAME_WIDTH - player.width) / 2;
            player.y = (GAME_HEIGHT - player.height) / 2;
        
        // Force game state to gameplay
        window.gameState = "gameplay";
        console.log("Game state set to gameplay in initGame");
        
        // Ensure keys object is reset
        window.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            ArrowUp: false, 
            ArrowDown: false, 
            ArrowLeft: false, 
            ArrowRight: false,
            e: false,
            i: false
        };
        
        console.log("Adding event listeners for keyboard controls...");
        
        // Remove any existing event listeners to prevent duplicates
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        
        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleCanvasClick);
    
        // Add direct window event listeners as backup
        window.addEventListener('keydown', function(e) {
            console.log("Window keydown:", e.key);
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') window.keys.w = window.keys.ArrowUp = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') window.keys.s = window.keys.ArrowDown = true;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') window.keys.a = window.keys.ArrowLeft = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') window.keys.d = window.keys.ArrowRight = true;
        });
        
        window.addEventListener('keyup', function(e) {
            console.log("Window keyup:", e.key);
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') window.keys.w = window.keys.ArrowUp = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') window.keys.s = window.keys.ArrowDown = false;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') window.keys.a = window.keys.ArrowLeft = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') window.keys.d = window.keys.ArrowRight = false;
        });
        
        // Add keyboard debugging message
        console.log("%c KEYBOARD CONTROLS: Use WASD or Arrow Keys to move", "background: #333; color: lime; padding: 5px; font-size: 16px;");
        
        // Load images
        loadImages().then((success) => {
            console.log("Sprite loading complete, success:", success);
            
            // Start game loop
        gameInitialized = true;
            lastTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
                
            console.log("Game initialized successfully");
            console.log("Movement controls: WASD or Arrow Keys");
        });
        
    } catch (error) {
        console.error("Error initializing game:", error);
    }
}

// Start the game when page loads
window.addEventListener('load', function() {
    initGame();
    
    // Force gameState to gameplay and simulate key presses after a delay
    setTimeout(function() {
    window.gameState = "gameplay";
        console.log("Game state forced to gameplay");
        
        // Define simulation function
        window.simulateKeyPress = function(key) {
            console.log(`SIMULATING KEY PRESS: ${key}`);
            
            // Update key state based on key pressed
            if (key === 'ArrowUp' || key === 'w' || key === 'W') window.keys.w = window.keys.ArrowUp = true;
            if (key === 'ArrowDown' || key === 's' || key === 'S') window.keys.s = window.keys.ArrowDown = true;
            if (key === 'ArrowLeft' || key === 'a' || key === 'A') window.keys.a = window.keys.ArrowLeft = true;
            if (key === 'ArrowRight' || key === 'd' || key === 'D') window.keys.d = window.keys.ArrowRight = true;
            
            // Force update player position
            if (window.player && typeof window.player.update === 'function') {
                window.player.update(0.016); // Simulate a 60fps frame
            }
            
            // Update debug display
            const debugKeys = document.getElementById('debugKeys');
            if (debugKeys) {
                debugKeys.textContent = JSON.stringify(window.keys);
            }
            
            // Release key after a short delay
            setTimeout(function() {
                if (key === 'ArrowUp' || key === 'w' || key === 'W') window.keys.w = window.keys.ArrowUp = false;
                if (key === 'ArrowDown' || key === 's' || key === 'S') window.keys.s = window.keys.ArrowDown = false;
                if (key === 'ArrowLeft' || key === 'a' || key === 'A') window.keys.a = window.keys.ArrowLeft = false;
                if (key === 'ArrowRight' || key === 'd' || key === 'D') window.keys.d = window.keys.ArrowRight = false;
            }, 100);
        };
        
        // Test each direction with a slight delay between them
        setTimeout(function() { window.simulateKeyPress('ArrowRight'); }, 500);
        setTimeout(function() { window.simulateKeyPress('ArrowDown'); }, 700);
        setTimeout(function() { window.simulateKeyPress('ArrowLeft'); }, 900);
        setTimeout(function() { window.simulateKeyPress('ArrowUp'); }, 1100);
        }, 1000);
});

// Force draw player periodically to ensure visibility
setInterval(function() {
    if (window.ctx && window.player && !window.animationFrameId) {
        player.draw();
    }
}, 1000); 