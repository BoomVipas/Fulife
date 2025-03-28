// Game constants
window.GAME_WIDTH = 800;
window.GAME_HEIGHT = 600;
window.PLAYER_SIZE = 64;
window.PLAYER_SPEED = 1;
window.INVENTORY_SLOTS = 9;
window.INTERACTION_DISTANCE = 60;

// Game state
window.gameState = "gameplay"; // gameplay, working, minigame
// Use the global interactingWith declared in init.js
// let interactingWith = null;
// Use global canvas and ctx variables declared in init.js
// let canvas, ctx;
// Use global lastTime variable
// let lastTime = 0;
// Use global variables declared in init.js
// let gameInitialized = false;
// let inDialogMode = false;
// let animationFrameId = null;
// let furnitureImages = {};
// let workMinigame = null;
// let logicGateMinigame = null;

// Input state
// Use the global keys object instead of declaring a new one
// const keys = {
//     w: false,
//     a: false,
//     s: false,
//     d: false,
//     ArrowUp: false, 
//     ArrowDown: false, 
//     ArrowLeft: false, 
//     ArrowRight: false,
//     e: false,
//     i: false
// };

// Image objects
// Using global window.imageObjects from init.js instead of declaring locally
// const imageObjects = {};

// Job building object
// Use global window.jobBuilding instead of const declaration
window.jobBuilding = {
    x: 600,
    y: 300,
    width: 150,
    height: 100,
    color: "#4CAF50",
    name: "Tech Company",
    img: null, // Will be set properly during initialization
    
    draw: function() {
        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            // Fallback: draw a colored rectangle
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw a simple building shape
            ctx.fillStyle = "#333";
            ctx.fillRect(this.x + 20, this.y + 40, 30, 60); // Door
            ctx.fillRect(this.x + 70, this.y + 20, 30, 30); // Window
            ctx.fillRect(this.x + 110, this.y + 20, 30, 30); // Window
            
            // Log the missing image
            if (!this._logged) {
                console.warn("No job building image, using fallback drawing");
                this._logged = true;
            }
        }
        
        // Draw name above building
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + this.width/2, this.y - 10);
        ctx.textAlign = "left";
    }
};

// Draw job building
function drawJobBuilding() {
    try {
        // Ensure we have a building image
        const buildingImg = createBuildingImage();
        
        // Draw each building
        for (const building of buildings) {
            if (buildingImg && buildingImg.complete) {
                ctx.drawImage(buildingImg, building.x, building.y, building.width, building.height);
            } else {
                // Fallback to rectangle if image not loaded
                ctx.fillStyle = '#555555';
                ctx.fillRect(building.x, building.y, building.width, building.height);
                
                // Add basic door
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(building.x + building.width/2 - 15, building.y + building.height - 30, 30, 30);
            }
            
            // Add building name
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(building.name, building.x + building.width/2, building.y - 10);
        }
    } catch (e) {
        console.error("Error drawing job building:", e);
        // Fallback to basic rectangles
        for (const building of buildings) {
            ctx.fillStyle = '#555555';
            ctx.fillRect(building.x, building.y, building.width, building.height);
        }
    }
}

// Player stats - use global window.playerStats instead of local declaration
// let playerStats = {
//     education: 10,
//     career: 5,
//     happiness: 50,
//     health: 100,
//     money: 1000,
//     inventory: []
// };

// Player - use global window.player instead of creating a new one
window.player = {
    x: 0, // This will be set properly in initGame
    y: 0, // This will be set properly in initGame
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    facing: 'down',
    isMoving: false,
    hasBeenPositioned: false,
    inventory: [],
    spriteImg: window.imageObjects.playerSprite, // Use the preloaded image
    
    // Update movement
    update: function(deltaTime) {
        let moved = false;
        
        // Update player position based on active keys and touch controls
        if (window.keys.ArrowUp || window.keys.w || window.touchControls.up) {
            this.y -= this.speed * deltaTime;
            this.facing = 'up';
            moved = true;
        }
        if (window.keys.ArrowDown || window.keys.s || window.touchControls.down) {
            this.y += this.speed * deltaTime;
            this.facing = 'down';
            moved = true;
        }
        if (window.keys.ArrowLeft || window.keys.a || window.touchControls.left) {
            this.x -= this.speed * deltaTime;
            this.facing = 'left';
            moved = true;
        }
        if (window.keys.ArrowRight || window.keys.d || window.touchControls.right) {
            this.x += this.speed * deltaTime;
            this.facing = 'right';
            moved = true;
        }
        
        // Update movement state for animation
        this.isMoving = moved;
        
        // Keep player within game boundaries
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        
        // Check collisions with obstacles
        for (let i = 0; i < obstacles.length; i++) {
            if (checkCollision(this, obstacles[i])) {
                // Move player back if collision
                if (this.facing === 'up') this.y += this.speed * deltaTime;
                if (this.facing === 'down') this.y -= this.speed * deltaTime;
                if (this.facing === 'left') this.x += this.speed * deltaTime;
                if (this.facing === 'right') this.x -= this.speed * deltaTime;
            }
        }
        
        // Check for NPC interactions
        if (window.interactingWith === null) {
            for (let i = 0; i < npcs.length; i++) {
                if (checkCollision(this, npcs[i])) {
                    // Start interaction if E is pressed
                    if (window.keys.e) {
                        startDialog(npcs[i]);
                        window.keys.e = false; // Reset E key to prevent multiple triggers
                    }
                }
            }
        }
        
        // Check for item pickups
        for (let i = items.length - 1; i >= 0; i--) {
            if (checkCollision(this, items[i])) {
                // Add to inventory and remove from world
                if (this.inventory.length < INVENTORY_SLOTS) {
                    this.inventory.push(items[i]);
                    items.splice(i, 1);
                    
                    // Show pickup notification
                    displayMessage("Item added to inventory!");
                }
            }
        }
        
        // Check job building interaction
        if (checkCollision(this, jobBuilding)) {
            if (window.keys.e) {
                startWork();
                window.keys.e = false; // Reset E key to prevent multiple triggers
            }
        }
    },
    
    // Draw method defined separately
    
    // Reset player position
    resetPosition: function() {
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height / 2 - this.height / 2;
        this.hasBeenPositioned = true;
    },

    // Player draw method
    draw: function() {
        try {
            // Check if sprite is available and loaded correctly
            const hasValidSprite = this.spriteImg && this.spriteImg.complete && this.spriteImg.naturalWidth !== 0;
            
            if (hasValidSprite) {
                // Define sprite frame dimensions (each character takes 1/3 of the image width and 1/4 of the image height)
                const frameWidth = this.spriteImg.naturalWidth / 3; // 3 frames per row
                const frameHeight = this.spriteImg.naturalHeight / 4; // 4 rows (directions)
                
                // Determine direction for sprite selection
                // First row (index 0): walking down (toward screen)
                // Second row (index 1): walking up (into screen)
                // Third row (index 2): walking right
                // Fourth row (index 3): walking left
                let directionIndex = 0; // Default facing down
                if (this.facing === 'up') directionIndex = 1;
                else if (this.facing === 'right') directionIndex = 2;
                else if (this.facing === 'left') directionIndex = 3;
                
                // Determine animation frame based on movement
                let frameIndex = 1; // Default to middle frame (standing)
                
                // For the first row (down), the leftmost sprite is the standing position
                if (directionIndex === 0 && !this.isMoving) {
                    frameIndex = 0;
                }
                // For other rows, the middle sprite is the standing position
                else if (!this.isMoving) {
                    frameIndex = 1;
                }
                // If moving, animate between the frames
                else {
                    // Calculate animation frame based on time
                    const walkSpeed = 150; // ms per frame
                    const frameCount = 3; // 3 frames per animation
                    frameIndex = Math.floor((Date.now() % (walkSpeed * frameCount)) / walkSpeed);
                }
                
                // Calculate source rectangle in sprite sheet
                const sx = frameIndex * frameWidth;
                const sy = directionIndex * frameHeight;
                
                // Draw the player sprite
                ctx.drawImage(
                    this.spriteImg,
                    sx, sy, frameWidth, frameHeight,  // Source rectangle
                    this.x, this.y, this.width, this.height  // Destination rectangle
                );
                
                // Draw player debug info if debug mode is on
                if (window.location.hash === '#debug') {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.fillText(`X: ${Math.round(this.x)}, Y: ${Math.round(this.y)}`, this.x, this.y - 5);
                    ctx.fillText(`Frame: ${frameIndex}, Dir: ${directionIndex}`, this.x, this.y - 15);
                    ctx.fillText(`Sprite: ${hasValidSprite}`, this.x, this.y - 25);
                }
            } else {
                // No valid sprite, draw fallback character and show error message
                console.error("Sprite not valid. Complete: " + this.spriteImg?.complete + 
                             ", Width: " + this.spriteImg?.naturalWidth);
                this.drawFallbackCharacter();
            }
        } catch (error) {
            console.error('Error in player.draw:', error);
            // Ultimate fallback: draw a red rectangle with an X
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.moveTo(this.x + this.width, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        }
    },
    
    // Helper method to draw fallback character
    drawFallbackCharacter: function() {
        // Draw eyes to indicate facing direction
        ctx.fillStyle = 'white';
        const eyeSize = 10;
        const eyeOffset = 5;
        
        if (this.facing === 'down') {
            ctx.fillRect(this.x + this.width / 3 - eyeSize / 2, this.y + this.height / 4, eyeSize, eyeSize);
            ctx.fillRect(this.x + 2 * this.width / 3 - eyeSize / 2, this.y + this.height / 4, eyeSize, eyeSize);
            // Draw a mouth
            ctx.fillRect(this.x + this.width / 4, this.y + this.height / 2, this.width / 2, eyeSize / 2);
        } else if (this.facing === 'up') {
            ctx.fillRect(this.x + this.width / 3 - eyeSize / 2, this.y + this.height / 5, eyeSize, eyeSize);
            ctx.fillRect(this.x + 2 * this.width / 3 - eyeSize / 2, this.y + this.height / 5, eyeSize, eyeSize);
        } else if (this.facing === 'right') {
            ctx.fillRect(this.x + 2 * this.width / 3, this.y + this.height / 4, eyeSize, eyeSize);
            // Draw a small line for a side profile
            ctx.fillRect(this.x + this.width - eyeOffset, this.y + this.height / 3, eyeSize / 2, this.height / 3);
        } else if (this.facing === 'left') {
            ctx.fillRect(this.x + this.width / 3 - eyeSize, this.y + this.height / 4, eyeSize, eyeSize);
            // Draw a small line for a side profile
            ctx.fillRect(this.x, this.y + this.height / 3, eyeSize / 2, this.height / 3);
        }
    }
};

// NPCs
// Use global window.npcs instead of const declaration
window.npcs = [
    {
        x: 600,
        y: 200,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        name: "Tech CEO",
        color: "#9C27B0",
        facing: "down",
        spriteImg: null,
        dialogues: [
            "Welcome to FuLife, future developer!",
            "I'm the Tech CEO. I can offer you a job in my company.",
            "Complete tasks for me to increase your skills."
        ],
        quest: {
            title: "Debug the code",
            description: "Help fix bugs in our software",
            reward: 100,
            complete: false
        },
        update: function(deltaTime) {
            // NPC AI logic can go here in the future
            // For now, just a placeholder to prevent errors
        }
    },
    {
        x: 200,
        y: 400,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        name: "Career Advisor",
        color: "#00BCD4",
        facing: "right",
        spriteImg: null,
        dialogues: [
            "Hello! I'm your Career Advisor.",
            "I can help you improve your skill set and find better job opportunities.",
            "Come back to me when you need career advice!"
        ],
        update: function(deltaTime) {
            // NPC AI logic can go here in the future
            // For now, just a placeholder to prevent errors
        }
    }
];

// Items that can be picked up
// Use global window.items instead of const declaration
window.items = [
    {
        id: "book",
        name: "Textbook",
        x: 350,
        y: 400,
        width: 30,
        height: 30,
        color: "brown",
        visible: true,
        
        effect: function() {
            window.playerStats.education += 3;
            updateStatsDisplay();
            return "You read the textbook and learned new concepts. Education +3";
        },
        
        draw: function() {
            if (!this.visible) return;
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw name above item
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x + this.width/2, this.y - 5);
        }
    },
    {
        id: "laptop",
        name: "Laptop",
        x: 500,
        y: 150,
        width: 40,
        height: 30,
        color: "gray",
        visible: true,
        
        effect: function() {
            window.playerStats.career += 2;
            window.playerStats.education += 2;
            updateStatsDisplay();
            return "You used the laptop to practice coding and apply for jobs. Career +2, Education +2";
        },
        
        draw: function() {
            if (!this.visible) return;
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw name above item
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x + this.width/2, this.y - 5);
        }
    }
];

// Obstacles (walls, furniture)
// Use global window.obstacles instead of const declaration
window.obstacles = [
    // Outer walls
    { x: 0, y: 0, width: GAME_WIDTH, height: 20, type: "wall" },
    { x: 0, y: 0, width: 20, height: GAME_HEIGHT, type: "wall" },
    { x: 0, y: GAME_HEIGHT - 20, width: GAME_WIDTH, height: 20, type: "wall" },
    { x: GAME_WIDTH - 20, y: 0, width: 20, height: GAME_HEIGHT, type: "wall" },
    
    // Room dividers
    { x: 300, y: 0, width: 20, height: 250, type: "wall" },
    { x: 300, y: 350, width: 20, height: 250, type: "wall" },
    { x: 300, y: 250, width: 20, height: 20, type: "door" }, // Door gap
    
    // Furniture
    { x: 100, y: 100, width: 120, height: 60, type: "desk" },
    { x: 50, y: 100, width: 40, height: 40, type: "chair" },
    { x: 500, y: 400, width: 80, height: 140, type: "bed" },
    { x: 650, y: 100, width: 100, height: 40, type: "table" },
    { x: 700, y: 400, width: 60, height: 120, type: "bookshelf" }
];

// Notification system
// Use global window.notifications instead of const declaration
// const notifications = [];

// Display a message notification
function displayMessage(message, duration = 3000) {
    window.notifications.push({
        message: message,
        duration: duration,
        timestamp: Date.now()
    });
}

// Draw active notifications
function drawNotifications() {
    const currentTime = Date.now();
    
    // Remove expired notifications
    for (let i = window.notifications.length - 1; i >= 0; i--) {
        if (currentTime - window.notifications[i].timestamp > window.notifications[i].duration) {
            window.notifications.splice(i, 1);
        }
    }
    
    // Draw active notifications
    ctx.textAlign = "right";
    for (let i = 0; i < window.notifications.length; i++) {
        const notification = window.notifications[i];
        const age = currentTime - notification.timestamp;
        const opacity = Math.min(1, Math.min(age / 500, (notification.duration - age) / 500));
        
        // Background with fade
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.7})`;
        ctx.fillRect(canvas.width - 310, 50 + i * 40, 300, 30);
        
        // Border
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.strokeRect(canvas.width - 310, 50 + i * 40, 300, 30);
        
        // Text with fade
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = "14px Arial";
        ctx.fillText(notification.message, canvas.width - 20, 70 + i * 40);
    }
    
    // Reset text alignment
    ctx.textAlign = "left";
}

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

// Find the closest item within interaction distance
function getInteractableItem() {
    for (let item of items) {
        if (item.visible && canInteract(player, item)) {
            return item;
        }
    }
    return null;
}

// Start dialog with an NPC
function startDialog(npc) {
    console.log("Starting dialog with:", npc.name);
    window.interactingWith = npc;
    inDialogMode = true;
    
    // First ensure a game container exists
    let gameContainer = document.getElementById('game-container');
    // If game-container doesn't exist, try to find the canvas parent or use body
    if (!gameContainer) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas && canvas.parentNode) {
            gameContainer = canvas.parentNode;
            console.log("Using canvas parent as game container");
        } else {
            gameContainer = document.body;
            console.log("No game container found, using document body");
        }
    }
    
    // Remove any existing dialog container to avoid duplicates
    const existingDialog = document.getElementById('dialogContainer');
    if (existingDialog) {
        existingDialog.remove();
        console.log("Removed existing dialog container");
    }
    
    // Create a new dialog container
    const dialogContainer = document.createElement('div');
    dialogContainer.id = 'dialogContainer';
    dialogContainer.style.position = 'absolute';
    dialogContainer.style.bottom = '20px';
    dialogContainer.style.left = '50%';
    dialogContainer.style.transform = 'translateX(-50%)';
    dialogContainer.style.width = '80%';
    dialogContainer.style.maxWidth = '600px';
    dialogContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    dialogContainer.style.color = 'white';
    dialogContainer.style.padding = '20px';
    dialogContainer.style.borderRadius = '10px';
    dialogContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    dialogContainer.style.zIndex = '100';
    
    // Content for dialog
    const dialogContent = document.createElement('div');
    dialogContent.id = 'dialogContent';
    
    // NPC name
    const npcName = document.createElement('div');
    npcName.id = 'dialogNpcName';
    npcName.style.fontWeight = 'bold';
    npcName.style.fontSize = '20px';
    npcName.style.marginBottom = '10px';
    
    // Dialog text
    const dialogText = document.createElement('div');
    dialogText.id = 'dialogText';
    dialogText.style.marginBottom = '15px';
    dialogText.style.lineHeight = '1.4';
    
    // Hint text for spacebar
    const dialogHint = document.createElement('div');
    dialogHint.id = 'dialogHint';
    dialogHint.style.fontSize = '12px';
    dialogHint.style.marginBottom = '10px';
    dialogHint.style.color = '#aaa';
    dialogHint.textContent = 'Press SPACE to continue, ESC to close';
    
    // Add all elements to dialog
    dialogContent.appendChild(npcName);
    dialogContent.appendChild(dialogText);
    dialogContent.appendChild(dialogHint);
    dialogContainer.appendChild(dialogContent);
    
    // Add dialog to game container or body
    gameContainer.appendChild(dialogContainer);
    console.log("Dialog container created and attached to DOM");
    
    // Safely set NPC name with null check
    try {
        if (npc && npc.name) {
            npcName.textContent = npc.name;
        } else {
            npcName.textContent = "Unknown";
        }
    } catch (err) {
        console.error('Error setting NPC name:', err);
    }
    
    // Initialize the dialog state
    if (!npc.currentDialogIndex) {
        npc.currentDialogIndex = 0;
    }
    
    // Handle different dialog formats
    try {
        if (npc && Array.isArray(npc.dialogues) && npc.dialogues.length > 0) {
            // Simple array of dialog lines
            dialogText.textContent = npc.dialogues[npc.currentDialogIndex] || "...";
        } else if (npc && npc.dialogues && typeof npc.dialogues === 'object') {
            // Complex dialog with options
            const currentDialog = npc.dialogues[npc.currentDialogueId || 0];
            if (currentDialog && currentDialog.text) {
                dialogText.textContent = currentDialog.text;
            } else {
                dialogText.textContent = "...";
            }
            
            // Add dialog options if available
            if (currentDialog && currentDialog.options && currentDialog.options.length > 0) {
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'dialog-options';
                optionsContainer.style.marginBottom = '15px';
                
                currentDialog.options.forEach((option, index) => {
                    if (!option) return;
                    
                    const optionButton = document.createElement('button');
                    optionButton.className = 'dialog-option';
                    optionButton.textContent = option.text || "...";
                    optionButton.style.backgroundColor = '#2196F3';
                    optionButton.style.color = 'white';
                    optionButton.style.border = 'none';
                    optionButton.style.padding = '5px 10px';
                    optionButton.style.margin = '5px';
                    optionButton.style.borderRadius = '4px';
                    optionButton.style.cursor = 'pointer';
                    optionButton.style.display = 'block';
                    optionButton.style.width = '100%';
                    optionButton.style.textAlign = 'left';
                    
                    // Check if option has a condition
                    if (option.condition && !option.condition()) {
                        optionButton.disabled = true;
                        optionButton.style.backgroundColor = '#ccc';
                        optionButton.style.cursor = 'not-allowed';
                        optionButton.title = option.conditionFail || 'Not available';
                    }
                    
                    optionButton.addEventListener('click', () => {
                        selectDialogOption(npc, index);
                    });
                    
                    optionsContainer.appendChild(optionButton);
                });
                
                dialogContent.insertBefore(optionsContainer, dialogHint);
            }
        } else {
            // Fallback for missing dialogues
            dialogText.textContent = "...";
        }
    } catch (err) {
        console.error('Error setting dialog text:', err);
        // Set a fallback message if there's an error
        dialogText.textContent = "...";
    }
    
    // Show the dialog container
    dialogContainer.style.display = 'block';
    
    // Add an event listener for spacebar key to advance dialog
    document.addEventListener('keydown', handleDialogKeyPress);
}

// Close the dialog
function closeDialog() {
    inDialogMode = false;
    window.interactingWith = null;
    
    // Remove the keydown event listener
    document.removeEventListener('keydown', handleDialogKeyPress);
    
    // Find and remove the dialog container
    const dialogContainer = document.getElementById('dialogContainer');
    if (dialogContainer) {
        dialogContainer.remove();
        console.log("Dialog container removed");
    }
}

// Handle key presses during dialog
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

// Advance dialog to next line
function advanceDialog(npc) {
    if (!npc || !Array.isArray(npc.dialogues)) return;
    
    npc.currentDialogIndex = (npc.currentDialogIndex || 0) + 1;
    
    // If we've reached the end of the dialog, close it
    if (npc.currentDialogIndex >= npc.dialogues.length) {
        closeDialog();
        return;
    }
    
    // Otherwise, update the dialog text
    const dialogText = document.getElementById('dialogText');
    if (dialogText) {
        dialogText.textContent = npc.dialogues[npc.currentDialogIndex] || "...";
    }
}

// Handle dialog option selection
function selectDialogOption(npc, optionIndex) {
    const currentDialog = npc.dialogues[npc.currentDialogueId || 0];
    const selectedOption = currentDialog.options[optionIndex];
    
    // Check if option has condition and it's not met
    if (selectedOption.condition && !selectedOption.condition()) {
        return; // Cannot select this option
    }
    
    // Execute option effect if any
    if (selectedOption.effect) {
        selectedOption.effect();
    }
    
    // Move to next dialogue if specified
    if (selectedOption.nextId !== undefined) {
        npc.currentDialogueId = selectedOption.nextId;
        startDialog(npc);
    } else {
        closeDialog();
    }
}

// Show inventory screen
function toggleInventory() {
    const inventoryContainer = document.getElementById("inventoryContainer");
    if (inventoryContainer.style.display === "flex") {
        // Hide inventory
        inventoryContainer.style.display = "none";
        gameState = "playing";
    } else {
        // Show inventory
        updateInventoryDisplay();
        inventoryContainer.style.display = "flex";
        gameState = "inventory";
    }
}

// Update inventory display
function updateInventoryDisplay() {
    const slotsContainer = document.getElementById("inventorySlots");
    slotsContainer.innerHTML = "";
    
    // Add items from inventory
    for (let i = 0; i < INVENTORY_SLOTS; i++) {
        const slot = document.createElement("div");
        slot.className = "inventory-slot";
        
        if (i < playerStats.inventory.length) {
            const item = playerStats.inventory[i];
            
            const icon = document.createElement("div");
            icon.className = "item-icon";
            icon.textContent = "📦"; // Simple box icon
            
            const name = document.createElement("div");
            name.className = "item-name";
            name.textContent = item.name;
            
            slot.appendChild(icon);
            slot.appendChild(name);
            
            // Add event listener to use item
            slot.addEventListener("click", function() {
                const message = item.effect();
                alert(message);
                
                // Remove item after use
                playerStats.inventory.splice(i, 1);
                updateInventoryDisplay();
            });
        }
        
        slotsContainer.appendChild(slot);
    }
    
    // Update stats display
    updateStatsDisplay();
}

// Update stats display
function updateStatsDisplay() {
    document.getElementById("stat-education").textContent = playerStats.education;
    document.getElementById("stat-career").textContent = playerStats.career;
    document.getElementById("stat-happiness").textContent = playerStats.happiness;
    document.getElementById("stat-health").textContent = playerStats.health;
    document.getElementById("stat-money").textContent = "$" + playerStats.money;
}

// Pick up an item
function pickUpItem(item) {
    if (playerStats.inventory.length < INVENTORY_SLOTS) {
        playerStats.inventory.push(item);
        item.visible = false;
        
        // Show notification
        alert(`Picked up ${item.name}`);
    } else {
        alert("Inventory is full!");
    }
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;
    
    // Update game state based on current state
    if (gameState === "gameplay") {
        // Update game state
        if (!inDialogMode) {
            // Only update positions when not in dialog
            player.update(deltaTime);
            
            // Update NPCs
            for (const npc of npcs) {
                if (npc.update) {
                    npc.update(deltaTime);
                }
            }
        }
        
        // Draw the game scene using our unified draw function
        draw();
        
        // Draw dialog if in dialog mode
        if (inDialogMode) {
            drawDialog();
        }
    } else if (gameState === "working") {
        // Draw work minigame
        drawWorkMinigame();
        updateWorkMinigame(deltaTime);
    } else if (gameState === "minigame") {
        // Draw logic gates minigame
        drawLogicGateMinigame();
        updateLogicGateMinigame(deltaTime);
    }
    
    // Draw some debug info if debugging is enabled
    if (window.location.hash === '#debug') {
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`FPS: ${Math.round(1 / (deltaTime || 0.016))}`, 10, 20);
        ctx.fillText(`Player: ${Math.round(player.x)},${Math.round(player.y)}`, 10, 35);
        ctx.fillText(`Game State: ${gameState}`, 10, 50);
        
        // Show nearby building info if any
        const nearbyBuilding = checkBuildingEntrances();
        if (nearbyBuilding) {
            ctx.fillText(`Near: ${nearbyBuilding.name}`, 10, 65);
        }
    }
    
    // Draw notifications if there are any
    drawNotifications();
    
    // Request the next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Load images
function loadImages() {
    console.log('Loading images...');
    return new Promise((resolve) => {
        let loadedCount = 0;
        const requiredCount = 2; // At minimum we need the player sprite and job building
        let loadingTimeout;

        // Check if we already have preloaded images in window.imageObjects
        if (window.imageObjects && window.imageObjects.playerSprite && window.imageObjects.playerSprite.complete) {
            console.log('Using preloaded sprite from window.imageObjects');
            // Set player sprite reference to the preloaded one
            player.spriteImg = window.imageObjects.playerSprite;
            player.spriteSheet = window.IMAGES.playerSprite;
            loadedCount++;
            
            // Set job building image if available
            if (window.imageObjects.jobBuilding && window.imageObjects.jobBuilding.complete) {
                console.log('Using preloaded job building image from window.imageObjects');
                jobBuilding.img = window.imageObjects.jobBuilding;
                loadedCount++;
            } else {
                console.log('No preloaded job building image, will use fallback');
                jobBuilding.img = null;
                loadedCount++;
            }
            
            // Resolve immediately since we have our images
            console.log('All required images loaded from preloaded sources.');
            resolve();
            return;
        }

        // Set a global timeout as safety mechanism
        loadingTimeout = setTimeout(() => {
            console.warn('Image loading timed out globally, using fallbacks');
            // Force fallback sprite creation
            if (!player.spriteSheet) {
                player.spriteSheet = createFallbackPlayerSprite();
                player.spriteImg = new Image();
                player.spriteImg.src = player.spriteSheet;
                player.spriteImg.complete = true;
            }
            loadedCount = requiredCount; // Force completion
            console.log('All required images loaded (with fallbacks after timeout).');
            resolve();
        }, 5000);

        // This will be called when the player sprite is loaded
        function onPlayerSpriteLoaded() {
            console.log('Player sprite loaded successfully');
            loadedCount++;
            checkIfComplete();
        }

        function checkIfComplete() {
            if (loadedCount >= requiredCount) {
                console.log('All required images loaded.');
                clearTimeout(loadingTimeout);
                resolve();
            }
        }

        // Create a fallback player sprite 
        function createSimpleSpriteImage() {
            console.log("Creating simple sprite fallback");
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 256; // 4 rows for directions
            const ctx = canvas.getContext('2d');
            
            // Draw simple character
            ['down', 'left', 'right', 'up'].forEach((direction, index) => {
                const y = index * 64;
                
                // Body
                ctx.fillStyle = 'blue';
                ctx.fillRect(16, y + 16, 32, 32);
                
                // Head
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(32, y + 16, 16, 0, Math.PI * 2);
                ctx.fill();
                
                // Eyes
                ctx.fillStyle = 'black';
                
                if (direction === 'down' || direction === 'up') {
                    ctx.fillRect(24, y + (direction === 'down' ? 12 : 20), 6, 6);
                    ctx.fillRect(40, y + (direction === 'down' ? 12 : 20), 6, 6);
                } else if (direction === 'left') {
                    ctx.fillRect(22, y + 16, 6, 6);
                } else { // right
                    ctx.fillRect(42, y + 16, 6, 6);
                }
            });
            
            return canvas.toDataURL();
        }

        // Try to load player sprite
        if (typeof IMAGES !== 'undefined' && IMAGES.playerSprite) {
            console.log('Attempting to load player sprite from IMAGES object');
            player.spriteImg = new Image();
            player.spriteImg.onload = function() {
                console.log('Player sprite image loaded from IMAGES object');
                player.spriteSheet = IMAGES.playerSprite;
                onPlayerSpriteLoaded();
            };
            player.spriteImg.onerror = function() {
                console.warn('Failed to load player sprite from IMAGES object, creating fallback');
                player.spriteSheet = createSimpleSpriteImage();
                player.spriteImg = new Image();
                player.spriteImg.src = player.spriteSheet;
                player.spriteImg.onload = onPlayerSpriteLoaded;
            };
            player.spriteImg.src = IMAGES.playerSprite;
            
            // Add a timeout in case the image takes too long to load
            setTimeout(() => {
                if (!player.spriteImg.complete) {
                    console.warn('Player sprite load timeout, creating fallback');
                    player.spriteSheet = createSimpleSpriteImage();
                    player.spriteImg = new Image();
                    player.spriteImg.src = player.spriteSheet;
                    player.spriteImg.onload = onPlayerSpriteLoaded;
                }
            }, 3000);
        } else {
            console.log('No player sprite in IMAGES object, creating dynamic sprite sheet');
            player.spriteSheet = createSimpleSpriteImage();
            player.spriteImg = new Image();
            player.spriteImg.src = player.spriteSheet;
            player.spriteImg.onload = onPlayerSpriteLoaded;
        }

        // Load building image or use fallback
        console.log('Handling job building image');
        if (typeof IMAGES !== 'undefined') {
            // Try both 'building' and 'jobBuilding' properties
            const buildingPath = IMAGES.building || IMAGES.jobBuilding;
            if (buildingPath) {
                console.log('Loading job building image from path:', buildingPath);
                jobBuilding.img = new Image();
                jobBuilding.img.onload = function() {
                    console.log('Job building image loaded successfully from:', buildingPath);
                    loadedCount++;
                    checkIfComplete();
                };
                jobBuilding.img.onerror = function() {
                    console.warn('Failed to load job building image from primary path:', buildingPath);
                    
                    // Try alternate paths
                    const alternativePaths = [
                        '/images/building.png',
                        'images/building.png',
                        '../images/building.png',
                        'docs/images/building.png',
                        '/docs/images/building.png',
                        window.location.origin + '/images/building.png'
                    ];
                    
                    let attempted = 0;
                    function tryNextPath() {
                        if (attempted >= alternativePaths.length) {
                            console.warn('All building image paths failed, using fallback');
                            
                            // Create a fallback building image using canvas
                            if (typeof createSimpleBuildingImage === 'function') {
                                const fallbackSrc = createSimpleBuildingImage();
                                jobBuilding.img = new Image();
                                jobBuilding.img.src = fallbackSrc;
                                console.log('Created fallback building image using canvas');
                            } else {
                                jobBuilding.img = null;
                            }
                            
                            loadedCount++;
                            checkIfComplete();
                            return;
                        }
                        
                        const path = alternativePaths[attempted++];
                        console.log('Trying alternate building path:', path);
                        
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            console.log('Building image loaded from alternate path:', path);
                            jobBuilding.img = tempImg;
                            loadedCount++;
                            checkIfComplete();
                        };
                        tempImg.onerror = function() {
                            console.warn('Failed to load from alternate path:', path);
                            tryNextPath();
                        };
                        tempImg.src = path;
                    }
                    
                    tryNextPath();
                };
                jobBuilding.img.src = buildingPath;
                
                // Add a timeout for building image
                setTimeout(() => {
                    if (jobBuilding.img && !jobBuilding.img.complete) {
                        console.warn('Job building image load timeout, using fallback');
                        // Try to create a fallback image
                        if (typeof createSimpleBuildingImage === 'function') {
                            const fallbackSrc = createSimpleBuildingImage();
                            jobBuilding.img = new Image();
                            jobBuilding.img.src = fallbackSrc;
                            console.log('Created fallback building image after timeout');
                        } else {
                            jobBuilding.img = null;
                        }
                        loadedCount++;
                        checkIfComplete();
                    }
                }, 3000);
            } else {
                console.log('No job building image path found in IMAGES object, will use fallback');
                // Try to create a fallback image
                if (typeof createSimpleBuildingImage === 'function') {
                    const fallbackSrc = createSimpleBuildingImage();
                    jobBuilding.img = new Image();
                    jobBuilding.img.src = fallbackSrc;
                    console.log('Created fallback building image');
                } else {
                    jobBuilding.img = null;
                }
                loadedCount++;
                checkIfComplete();
            }
        } else {
            console.log('IMAGES object not defined, using fallback for building');
            // Try to create a fallback image
            if (typeof createSimpleBuildingImage === 'function') {
                const fallbackSrc = createSimpleBuildingImage();
                jobBuilding.img = new Image();
                jobBuilding.img.src = fallbackSrc;
                console.log('Created fallback building image');
            } else {
                jobBuilding.img = null;
            }
            loadedCount++;
            checkIfComplete();
        }

        // Load furniture images if available, but don't block on them
        if (typeof IMAGES !== 'undefined' && IMAGES.furniture) {
            console.log('Loading furniture images');
            for (const key in IMAGES.furniture) {
                const furnitureImg = new Image();
                furnitureImg.src = IMAGES.furniture[key];
                furnitureImages[key] = furnitureImg;
                console.log(`Added furniture image: ${key}`);
            }
        }
    });
}

// Create a fallback player sprite if all else fails
function createFallbackPlayerSprite() {
    console.log("Creating basic fallback player sprite");
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple blue square with a face
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 50, 50);
    
    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(10, 15, 8, 8);
    ctx.fillRect(32, 15, 8, 8);
    
    // Draw mouth
    ctx.fillRect(15, 35, 20, 5);
    
    const sprite = new Image();
    sprite.src = canvas.toDataURL();
    return sprite;
}

// Draw NPCs
function drawNPCs() {
    for (const npc of npcs) {
        try {
            if (player.spriteImg && player.spriteImg.complete) {
                // Use the same sprite sheet as player for drawing
                // Each frame is 108x144 pixels in our sprite sheet
                const frameWidth = 108;
                const frameHeight = 144;
                
                // Determine direction for sprite selection (0=down, 1=up, 2=right, 3=left)
                let directionIndex = 0; // Default facing down
                if (npc.facing === 'up') directionIndex = 1;
                else if (npc.facing === 'right') directionIndex = 2;
                else if (npc.facing === 'left') directionIndex = 3;
                
                // Use middle frame for standing NPCs
                const frameIndex = 1;
                
                // Calculate source rectangle in sprite sheet
                const sx = frameIndex * frameWidth;
                const sy = directionIndex * frameHeight;
                
                // Save context to apply filters
                ctx.save();
                
                // Apply a hue rotation filter to differentiate NPCs from player
                ctx.filter = 'hue-rotate(' + (npc.name.charCodeAt(0) * 20) % 360 + 'deg)';
                
                // Draw the NPC sprite
                ctx.drawImage(
                    player.spriteImg,
                    sx, sy, frameWidth, frameHeight,  // Source rectangle
                    npc.x, npc.y, npc.width, npc.height  // Destination rectangle
                );
                
                // Restore context
                ctx.restore();
            } else {
                // Fallback: draw a colored rectangle
                ctx.fillStyle = npc.color;
                ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
            }
            
            // Draw name above NPC
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(npc.name, npc.x + npc.width/2, npc.y - 10);
            
            // Reset text alignment for other text
            ctx.textAlign = "left";
        } catch (error) {
            console.error('Error drawing NPC:', error);
            // Ultimate fallback: just draw a colored rectangle
            ctx.fillStyle = npc.color;
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
            
            // Still try to draw the name
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(npc.name, npc.x + npc.width/2, npc.y - 10);
            ctx.textAlign = "left";
        }
    }
}

// Draw background
function drawBackground() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw obstacles
function drawObstacles() {
    for (let obstacle of obstacles) {
        switch(obstacle.type) {
            case "wall":
                ctx.fillStyle = "#555";
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                break;
            case "door":
                if (imageObjects.door) {
                    ctx.drawImage(imageObjects.door, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = "brown";
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                break;
            case "desk":
                if (imageObjects.desk) {
                    ctx.drawImage(imageObjects.desk, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = "#854";
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                break;
            case "chair":
                if (imageObjects.chair) {
                    ctx.drawImage(imageObjects.chair, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = "#753";
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                break;
            case "bed":
                if (imageObjects.bed) {
                    ctx.drawImage(imageObjects.bed, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = "#449";
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                break;
            case "table":
                if (imageObjects.table) {
                    ctx.drawImage(imageObjects.table, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = "#963";
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                break;
            case "bookshelf":
                if (imageObjects.bookshelf) {
                    ctx.drawImage(imageObjects.bookshelf, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = "#742";
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                break;
            default:
                ctx.fillStyle = "#555";
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
}

// Draw items
function drawItems() {
    for (let item of items) {
        item.draw();
    }
}

// Draw UI
function drawUI() {
    // Draw interaction indicators
    const interactableNPC = getInteractableNPC();
    if (interactableNPC) {
        drawInteractionIndicator(interactableNPC, "Talk (E)");
    }
    
    const interactableItem = getInteractableItem();
    if (interactableItem) {
        drawInteractionIndicator(interactableItem, "Pick Up (E)");
    }
    
    // Draw instruction text
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Move: WASD or Arrow Keys | Interact: E | Inventory: I", 20, 30);
}

// Draw interaction indicator above an object
function drawInteractionIndicator(obj, text) {
    const x = obj.x + obj.width / 2;
    const y = obj.y - 15;
    
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    
    // Draw indicator (small triangle pointing down)
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y - 5);
    ctx.closePath();
    ctx.fill();
}

// Initialize the game
function initGame() {
    console.log("Initializing game...");
    
    try {
        // Get the canvas and context
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("Canvas element not found! Creating it...");
            // Create canvas if it doesn't exist
            canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            canvas.width = GAME_WIDTH;
            canvas.height = GAME_HEIGHT;
            
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.appendChild(canvas);
            } else {
                console.error("Game container not found, appending to body");
                document.body.appendChild(canvas);
            }
        }
        
        ctx = canvas.getContext('2d');
        
        // Display loading message
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading game...', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        
        // Ensure canvas is visible and has proper dimensions
        canvas.style.display = "block";
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        
        // Make sure the game container is visible
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = "block";
            gameContainer.style.position = "absolute";
            gameContainer.style.top = "50%";
            gameContainer.style.left = "50%";
            gameContainer.style.transform = "translate(-50%, -50%)";
            gameContainer.style.margin = "0 auto";
        }
        
        // If game is already initialized, just resume it
        if (gameInitialized) {
            console.log("Game already initialized, resuming");
            
            // Reset player position to center if coming from cutscene
            if (gameState === "gameplay" && !player.hasBeenPositioned) {
                console.log("Resetting player position to center");
                player.x = (GAME_WIDTH - player.width) / 2;
                player.y = (GAME_HEIGHT - player.height) / 2;
                player.hasBeenPositioned = true;
            }
            
            // Ensure game loop is running
            if (!animationFrameId) {
                console.log("Restarting game loop");
                animationFrameId = requestAnimationFrame(gameLoop);
            }
            
            // Return without reinitializing
            return;
        }
        
        // Force clear the canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Position player in the center of the screen
        player.x = (GAME_WIDTH - player.width) / 2;
        player.y = (GAME_HEIGHT - player.height) / 2;
        player.hasBeenPositioned = true;
        console.log(`Positioned player at ${player.x},${player.y}`);
        
        // Add event listeners for keyboard input
        document.addEventListener('keydown', function(e) {
            handleKeyDown(e);
        });
        document.addEventListener('keyup', function(e) {
            handleKeyUp(e);
        });
        
        // Add click event listener for interaction
        canvas.addEventListener('click', handleCanvasClick);
        
        // Initialize touch controls if on mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            initTouchControls();
        }
        
        // Initialize obstacles
        initObstacles();
        
        // Load images with timeout protection
        const imageLoadingPromise = new Promise((resolve, reject) => {
            // Add timeout protection
            const timeout = setTimeout(() => {
                console.warn("Image loading timed out globally!");
                resolve(); // Resolve anyway to continue with fallbacks
            }, 8000);
            
            // Try to load images normally
            loadImages()
                .then(() => {
                    clearTimeout(timeout);
                    resolve();
                })
                .catch(error => {
                    clearTimeout(timeout);
                    console.error("Error during image loading:", error);
                    resolve(); // Continue anyway
                });
        });
        
        // Continue with game initialization after image loading (success or failure)
        imageLoadingPromise.then(() => {
            // Initialize inventory
            initInventory();
            
            // Create or update stats display
            updateStatsDisplay();
            
            // Set initial timestamp to avoid large first frame delta
            lastTime = performance.now();
            
            // Show ready message on canvas
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Ready!', GAME_WIDTH / 2, GAME_HEIGHT / 2);
            
            // Start the game loop after a short delay to show the ready message
            setTimeout(() => {
                gameInitialized = true;
                console.log("Game initialized successfully, starting game loop");
                animationFrameId = requestAnimationFrame(gameLoop);
            }, 500);
        });
    } catch (error) {
        console.error("Critical error during game initialization:", error);
        
        // Create an error message on screen if possible
        if (canvas && ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game initialization error!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
            ctx.fillText(error.message, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
            ctx.fillText('Please refresh the page to try again.', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
        }
        
        // Try to show an alert as a last resort
        try {
            alert("Game initialization error: " + error.message);
        } catch (alertError) {
            // Nothing more we can do
        }
    }
}

// Handle key down events
function handleKeyDown(e) {
    // Store key state directly in keys object
    window.keys[e.key] = true;
    
    // Handle special cases
    switch(e.key) {
        case "e":
        case "E":
            if (gameState === "gameplay" && !inDialogMode) {
                handleAction();
            }
            break;
        case "i":
        case "I":
            toggleInventory();
            break;
        case "Escape":
            if (gameState === "working") {
                endWork(false);
            } else if (gameState === "minigame") {
                gameState = "gameplay";
            } else if (inDialogMode) {
                closeDialog();
            }
            break;
    }
}

// Handle key up events
function handleKeyUp(e) {
    // Reset key state
    window.keys[e.key] = false;
}

// Handle action button (E key)
function handleAction() {
    if (gameState !== "gameplay") return;
    
    // Check for NPC interaction
    const npc = getInteractableNPC();
    if (npc) {
        startDialog(npc);
        return;
    }
    
    // Check for item pickup
    const item = getInteractableItem();
    if (item) {
        pickUpItem(item);
        return;
    }
    
    // Check for building entrance interaction
    const building = checkBuildingEntrances();
    if (building) {
        enterBuilding(building);
        return;
    }
    
    // Check for job building interaction
    if (checkCollision(player, jobBuilding)) {
        startWork();
    }
}

// Handle canvas click event
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check if clicking on an NPC
    for (const npc of npcs) {
        if (clickX >= npc.x && clickX <= npc.x + npc.width &&
            clickY >= npc.y && clickY <= npc.y + npc.height) {
            startDialog(npc);
            return;
        }
    }
    
    // Check if clicking on an item
    for (const item of items) {
        if (item.visible && 
            clickX >= item.x && clickX <= item.x + item.width &&
            clickY >= item.y && clickY <= item.y + item.height) {
            pickUpItem(item);
            return;
        }
    }
    
    // Check if clicking on job building
    if (clickX >= jobBuilding.x && clickX <= jobBuilding.x + jobBuilding.width &&
        clickY >= jobBuilding.y && clickY <= jobBuilding.y + jobBuilding.height) {
        startWork();
        return;
    }
}

// Handle touch control initialization
function initTouchControls() {
    // Create touch control elements if they don't exist
    if (!document.getElementById('touchControls')) {
        const touchControlsDiv = document.createElement('div');
        touchControlsDiv.id = 'touchControls';
        touchControlsDiv.style.position = 'absolute';
        touchControlsDiv.style.bottom = '10px';
        touchControlsDiv.style.left = '10px';
        touchControlsDiv.style.right = '10px';
        touchControlsDiv.style.display = 'flex';
        touchControlsDiv.style.justifyContent = 'space-between';
        
        // D-pad for movement
        const dPad = document.createElement('div');
        dPad.style.display = 'grid';
        dPad.style.gridTemplateColumns = 'repeat(3, 50px)';
        dPad.style.gridTemplateRows = 'repeat(3, 50px)';
        dPad.style.gap = '5px';
        
        // Up button
        const upBtn = document.createElement('button');
        upBtn.id = 'upBtn';
        upBtn.innerHTML = '&#9650;'; // Up arrow
        upBtn.style.gridColumn = '2';
        upBtn.style.gridRow = '1';
        upBtn.className = 'touch-button';
        upBtn.addEventListener('touchstart', () => { window.touchControls.up = true; });
        upBtn.addEventListener('touchend', () => { window.touchControls.up = false; });
        upBtn.addEventListener('mousedown', () => { window.touchControls.up = true; });
        upBtn.addEventListener('mouseup', () => { window.touchControls.up = false; });
        dPad.appendChild(upBtn);
        
        // Left button
        const leftBtn = document.createElement('button');
        leftBtn.id = 'leftBtn';
        leftBtn.innerHTML = '&#9668;'; // Left arrow
        leftBtn.style.gridColumn = '1';
        leftBtn.style.gridRow = '2';
        leftBtn.className = 'touch-button';
        leftBtn.addEventListener('touchstart', () => { window.touchControls.left = true; });
        leftBtn.addEventListener('touchend', () => { window.touchControls.left = false; });
        leftBtn.addEventListener('mousedown', () => { window.touchControls.left = true; });
        leftBtn.addEventListener('mouseup', () => { window.touchControls.left = false; });
        dPad.appendChild(leftBtn);
        
        // Right button
        const rightBtn = document.createElement('button');
        rightBtn.id = 'rightBtn';
        rightBtn.innerHTML = '&#9658;'; // Right arrow
        rightBtn.style.gridColumn = '3';
        rightBtn.style.gridRow = '2';
        rightBtn.className = 'touch-button';
        rightBtn.addEventListener('touchstart', () => { window.touchControls.right = true; });
        rightBtn.addEventListener('touchend', () => { window.touchControls.right = false; });
        rightBtn.addEventListener('mousedown', () => { window.touchControls.right = true; });
        rightBtn.addEventListener('mouseup', () => { window.touchControls.right = false; });
        dPad.appendChild(rightBtn);
        
        // Down button
        const downBtn = document.createElement('button');
        downBtn.id = 'downBtn';
        downBtn.innerHTML = '&#9660;'; // Down arrow
        downBtn.style.gridColumn = '2';
        downBtn.style.gridRow = '3';
        downBtn.className = 'touch-button';
        downBtn.addEventListener('touchstart', () => { window.touchControls.down = true; });
        downBtn.addEventListener('touchend', () => { window.touchControls.down = false; });
        downBtn.addEventListener('mousedown', () => { window.touchControls.down = true; });
        downBtn.addEventListener('mouseup', () => { window.touchControls.down = false; });
        dPad.appendChild(downBtn);
        
        touchControlsDiv.appendChild(dPad);
        
        // Action buttons
        const actionButtons = document.createElement('div');
        actionButtons.style.display = 'flex';
        actionButtons.style.gap = '10px';
        
        // Action button
        const actionBtn = document.createElement('button');
        actionBtn.id = 'actionBtn';
        actionBtn.textContent = 'E';
        actionBtn.className = 'touch-button action-button';
        actionBtn.addEventListener('touchstart', handleAction);
        actionBtn.addEventListener('mousedown', handleAction);
        actionButtons.appendChild(actionBtn);
        
        // Inventory button
        const inventoryBtn = document.createElement('button');
        inventoryBtn.id = 'inventoryBtn';
        inventoryBtn.textContent = 'I';
        inventoryBtn.className = 'touch-button action-button';
        inventoryBtn.addEventListener('touchstart', toggleInventory);
        inventoryBtn.addEventListener('mousedown', toggleInventory);
        actionButtons.appendChild(inventoryBtn);
        
        touchControlsDiv.appendChild(actionButtons);
        
        // Add touch controls to the game container
        document.getElementById('game-container').appendChild(touchControlsDiv);
        
        // Add CSS for touch buttons
        const style = document.createElement('style');
        style.textContent = `
            .touch-button {
                background-color: rgba(255, 255, 255, 0.3);
                border: 2px solid white;
                border-radius: 50%;
                color: white;
                font-size: 20px;
                font-weight: bold;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                outline: none;
            }
            .action-button {
                width: 60px;
                height: 60px;
                background-color: rgba(255, 100, 100, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
}

// Handle obstacle initialization
function initObstacles() {
    // Reset obstacles array
    obstacles = [];
    
    // Walls
    obstacles.push({ type: "wall", x: 0, y: 0, width: 800, height: 20 });
    obstacles.push({ type: "wall", x: 0, y: 580, width: 800, height: 20 });
    obstacles.push({ type: "wall", x: 0, y: 0, width: 20, height: 600 });
    obstacles.push({ type: "wall", x: 780, y: 0, width: 20, height: 600 });
    
    // Office furniture
    obstacles.push({ type: "desk", x: 100, y: 100, width: 200, height: 50 });
    obstacles.push({ type: "chair", x: 150, y: 150, width: 40, height: 40 });
    obstacles.push({ type: "bookshelf", x: 50, y: 200, width: 30, height: 100 });
    
    // House furniture
    obstacles.push({ type: "table", x: 500, y: 400, width: 80, height: 60 });
    obstacles.push({ type: "chair", x: 520, y: 460, width: 40, height: 40 });
    obstacles.push({ type: "bed", x: 650, y: 100, width: 100, height: 60 });
}

// Handle inventory initialization
function initInventory() {
    // Initialize player inventory
    playerStats.inventory = [];
    
    // Create inventory UI if it doesn't exist
    if (!document.getElementById('inventoryPanel')) {
        const inventoryPanel = document.createElement('div');
        inventoryPanel.id = 'inventoryPanel';
        inventoryPanel.className = 'inventory-panel';
        inventoryPanel.style.display = 'none';
        
        const inventoryTitle = document.createElement('h3');
        inventoryTitle.textContent = 'Inventory';
        inventoryPanel.appendChild(inventoryTitle);
        
        const inventorySlots = document.createElement('div');
        inventorySlots.className = 'inventory-slots';
        
        for (let i = 0; i < INVENTORY_SLOTS; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            inventorySlots.appendChild(slot);
        }
        
        inventoryPanel.appendChild(inventorySlots);
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.className = 'inventory-close-btn';
        closeButton.addEventListener('click', toggleInventory);
        inventoryPanel.appendChild(closeButton);
        
        document.getElementById('game-container').appendChild(inventoryPanel);
        
        // Add CSS for inventory
        const style = document.createElement('style');
        style.textContent = `
            .inventory-panel {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.85);
                border: 3px solid #444;
                border-radius: 10px;
                padding: 20px;
                color: white;
                text-align: center;
                width: 300px;
            }
            .inventory-slots {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin: 15px 0;
            }
            .inventory-slot {
                background-color: rgba(255, 255, 255, 0.1);
                border: 2px solid #555;
                border-radius: 5px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .inventory-slot img {
                max-width: 80%;
                max-height: 80%;
            }
            .inventory-slot-name {
                position: absolute;
                bottom: 5px;
                font-size: 10px;
                width: 100%;
                text-align: center;
            }
            .inventory-close-btn {
                background-color: #333;
                color: white;
                border: 1px solid #555;
                padding: 5px 15px;
                border-radius: 5px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
}

// Update inventory display
function updateInventoryDisplay() {
    const slots = document.querySelectorAll('.inventory-slot');
    
    // Clear all slots
    slots.forEach(slot => {
        slot.innerHTML = '';
    });
    
    // Fill slots with inventory items
    playerStats.inventory.forEach((item, index) => {
        if (index < slots.length) {
            const slot = slots[index];
            
            if (imageObjects[item.id]) {
                const img = document.createElement('img');
                img.src = imageObjects[item.id].src;
                slot.appendChild(img);
            } else {
                // Fallback to colored div if no image
                const itemDiv = document.createElement('div');
                itemDiv.style.width = '40px';
                itemDiv.style.height = '40px';
                itemDiv.style.backgroundColor = item.color || '#999';
                itemDiv.style.borderRadius = '5px';
                slot.appendChild(itemDiv);
            }
            
            const itemName = document.createElement('div');
            itemName.className = 'inventory-slot-name';
            itemName.textContent = item.name;
            slot.appendChild(itemName);
        }
    });
}

// Toggle inventory panel
function toggleInventory() {
    const inventoryPanel = document.getElementById('inventoryPanel');
    
    if (inventoryPanel) {
        const isVisible = inventoryPanel.style.display === 'block';
        inventoryPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // Update inventory display when opening
            updateInventoryDisplay();
            gameState = "inventory";
        } else {
            gameState = "playing";
        }
    }
}

// Update stats display
function updateStatsDisplay() {
    const statsPanel = document.getElementById('statsPanel');
    
    if (!statsPanel) {
        // Create stats panel if it doesn't exist
        const newStatsPanel = document.createElement('div');
        newStatsPanel.id = 'statsPanel';
        newStatsPanel.className = 'stats-panel';
        
        const statsContent = document.createElement('div');
        statsContent.className = 'stats-content';
        statsContent.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Education:</span>
                <span class="stat-value" id="educationValue">${playerStats.education}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Career:</span>
                <span class="stat-value" id="careerValue">${playerStats.career}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Happiness:</span>
                <span class="stat-value" id="happinessValue">${playerStats.happiness}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Health:</span>
                <span class="stat-value" id="healthValue">${playerStats.health}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Money:</span>
                <span class="stat-value" id="moneyValue">$${playerStats.money}</span>
            </div>
        `;
        
        newStatsPanel.appendChild(statsContent);
        document.getElementById('game-container').appendChild(newStatsPanel);
        
        // Add CSS for stats panel
        const style = document.createElement('style');
        style.textContent = `
            .stats-panel {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                border: 1px solid #444;
                border-radius: 5px;
                padding: 10px;
                color: white;
                font-size: 12px;
                min-width: 150px;
            }
            .stats-content {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .stat-item {
                display: flex;
                justify-content: space-between;
            }
            .stat-label {
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    } else {
        // Update existing panel
        document.getElementById('educationValue').textContent = playerStats.education;
        document.getElementById('careerValue').textContent = playerStats.career;
        document.getElementById('happinessValue').textContent = playerStats.happiness;
        document.getElementById('healthValue').textContent = playerStats.health;
        document.getElementById('moneyValue').textContent = '$' + playerStats.money;
    }
}

// Create a dynamic player sprite sheet for animation
function createPlayerSpriteSheet() {
    // Create a canvas element to draw the sprite sheet
    const canvas = document.createElement('canvas');
    canvas.width = 324;  // 3 frames x 108 pixels
    canvas.height = 576; // 4 directions x 144 pixels
    const ctx = canvas.getContext('2d');
    
    // Colors for different parts
    const skinColor = '#FFE0B2';
    const hairColor = '#5D4037';
    const shirtColor = '#2196F3';
    const pantsColor = '#424242';
    
    // Draw frames for each direction (down, up, right, left)
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const frameX = col * 108;
            const frameY = row * 144;
            
            // Draw the base body
            ctx.fillStyle = skinColor;
            
            // Direction-specific body
            switch(row) {
                case 0: // Down - facing front
                    // Head
                    ctx.fillRect(frameX + 44, frameY + 20, 20, 20);
                    
                    // Arms position varies based on frame (walking animation)
                    if (col === 0) {
                        // Left arm forward
                        ctx.fillRect(frameX + 30, frameY + 50, 10, 30);
                        ctx.fillRect(frameX + 68, frameY + 50, 10, 25);
                    } else if (col === 2) {
                        // Right arm forward
                        ctx.fillRect(frameX + 30, frameY + 50, 10, 25);
                        ctx.fillRect(frameX + 68, frameY + 50, 10, 30);
                    } else {
                        // Both arms at sides (middle frame)
                        ctx.fillRect(frameX + 30, frameY + 50, 10, 28);
                        ctx.fillRect(frameX + 68, frameY + 50, 10, 28);
                    }
                    break;
                    
                case 1: // Up - facing back
                    // Head
                    ctx.fillRect(frameX + 44, frameY + 20, 20, 20);
                    
                    // Arms with same walking animation
                    if (col === 0) {
                        ctx.fillRect(frameX + 30, frameY + 50, 10, 30);
                        ctx.fillRect(frameX + 68, frameY + 50, 10, 25);
                    } else if (col === 2) {
                        ctx.fillRect(frameX + 30, frameY + 50, 10, 25);
                        ctx.fillRect(frameX + 68, frameY + 50, 10, 30);
                    } else {
                        ctx.fillRect(frameX + 30, frameY + 50, 10, 28);
                        ctx.fillRect(frameX + 68, frameY + 50, 10, 28);
                    }
                    break;
                    
                case 2: // Right - facing right
                    // Head
                    ctx.fillRect(frameX + 44, frameY + 20, 20, 20);
                    
                    // One arm visible
                    if (col === 0) {
                        ctx.fillRect(frameX + 48, frameY + 50, 10, 30);
                    } else if (col === 2) {
                        ctx.fillRect(frameX + 48, frameY + 50, 10, 30);
                    } else {
                        ctx.fillRect(frameX + 48, frameY + 50, 10, 28);
                    }
                    break;
                    
                case 3: // Left - facing left
                    // Head
                    ctx.fillRect(frameX + 44, frameY + 20, 20, 20);
                    
                    // One arm visible
                    if (col === 0) {
                        ctx.fillRect(frameX + 50, frameY + 50, 10, 30);
                    } else if (col === 2) {
                        ctx.fillRect(frameX + 50, frameY + 50, 10, 30);
                    } else {
                        ctx.fillRect(frameX + 50, frameY + 50, 10, 28);
                    }
                    break;
            }
            
            // Draw shirt - same for all directions
            ctx.fillStyle = shirtColor;
            ctx.fillRect(frameX + 34, frameY + 40, 40, 40);
            
            // Draw pants - same for all directions
            ctx.fillStyle = pantsColor;
            
            // Legs with walking animation
            if (col === 0) {
                // Left step
                ctx.fillRect(frameX + 34, frameY + 80, 15, 40);
                ctx.fillRect(frameX + 59, frameY + 80, 15, 35);
            } else if (col === 2) {
                // Right step
                ctx.fillRect(frameX + 34, frameY + 80, 15, 35);
                ctx.fillRect(frameX + 59, frameY + 80, 15, 40);
            } else {
                // Standing
                ctx.fillRect(frameX + 34, frameY + 80, 15, 37);
                ctx.fillRect(frameX + 59, frameY + 80, 15, 37);
            }
            
            // Hair/head detail - different based on direction
            ctx.fillStyle = hairColor;
            if (row === 0) { // Down
                ctx.fillRect(frameX + 44, frameY + 14, 20, 10);
            } else if (row === 1) { // Up
                ctx.fillRect(frameX + 44, frameY + 14, 20, 10);
            } else if (row === 2) { // Right
                ctx.fillRect(frameX + 44, frameY + 14, 20, 10);
                ctx.fillRect(frameX + 58, frameY + 20, 10, 5);
            } else { // Left
                ctx.fillRect(frameX + 44, frameY + 14, 20, 10);
                ctx.fillRect(frameX + 40, frameY + 20, 10, 5);
            }
        }
    }
    
    // Return the sprite sheet as a data URL
    return canvas.toDataURL();
}

// Initialize the game when the window loads
window.addEventListener("load", initGame);

// Check for nearby interactable NPCs
function checkNearbyNPCs() {
    // Get the closest NPC
    let closestNPC = null;
    let closestDistance = Infinity;
    
    for (const npc of npcs) {
        const dx = npc.x - player.x;
        const dy = npc.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < INTERACTION_DISTANCE && distance < closestDistance) {
            closestNPC = npc;
            closestDistance = distance;
        }
    }
    
    // If an NPC is nearby, show interaction indicator
    if (closestNPC) {
        drawInteractionIndicator(closestNPC, "Press E to Talk");
        
        // Check for E key to start dialog
        if (window.keys.e) {
            startDialog(closestNPC);
            window.keys.e = false; // Reset to prevent multiple triggers
        }
    }
    
    return closestNPC;
}

// Function for player to start working 
function startWork() {
    // Change gameState to working
    window.gameState = "working";
    
    // Initialize the work minigame
    workMinigame = new WorkMinigame();
}

// Function to end work
function endWork(completed) {
    // Return to normal gameplay
    window.gameState = "gameplay";
    
    // Apply rewards if completed
    if (completed) {
        playerStats.money += 100;
        playerStats.career += 1;
        
        // Update display
        updateStatsDisplay();
        
        // Show message
        displayMessage("You earned $100 and gained 1 career point!");
    }
}

// Function to open Logic Gates minigame
function openLogicGatesMinigame() {
    window.gameState = "minigame";
    logicGateMinigame = new LogicGateMinigame('gameCanvas');
}

// Function to exit Logic Gates minigame
function exitLogicGatesMinigame(success) {
    window.gameState = "gameplay";
    
    if (success) {
        playerStats.education += 5;
        displayMessage("Great job! You gained 5 education points.");
    } else {
        displayMessage("You can try the logic gates challenge again later.");
    }
    
    updateStatsDisplay();
}

// Initialize the game when the window loads
// function initGame() {
//     // Only set default position if player hasn't been positioned yet
//     if (window.gameState === "gameplay" && !player.hasBeenPositioned) {
//         // Set initial player position
//         player.x = Math.floor(GAME_WIDTH / 2 - player.width / 2);
//         player.y = Math.floor(GAME_HEIGHT / 2 - player.height / 2);
//         player.hasBeenPositioned = true;
//     }
//
//     // ... rest of code ...
// }
// Note: Second initGame function removed to prevent infinite recursion with the one defined at line 1223

// Function to handle key presses
function handleKeyPress(e) {
    // Gameplay controls
    if (window.gameState === "gameplay" && !inDialogMode) {
        if (e.key === 'e' || e.key === 'E') {
            handleInteraction();
        }
    }
    
    // Exit work minigame with escape
    if (window.gameState === "working") {
        if (e.key === 'Escape') {
            endWork(false);
        }
    } else if (window.gameState === "minigame") {
        window.gameState = "gameplay";
    }
}

// Toggle inventory display
function toggleInventory() {
    const inventoryContainer = document.getElementById('inventoryContainer');
    
    if (inventoryContainer.style.display === 'none') {
        inventoryContainer.style.display = 'flex';
        window.gameState = "inventory";
    } else {
        inventoryContainer.style.display = 'none';
        window.gameState = "playing";
    }
}

// Draw work minigame
function drawWorkMinigame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = "#263238";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw computer screen
    ctx.fillStyle = "#37474F";
    ctx.fillRect(100, 100, 600, 400);
    
    // Draw desk
    ctx.fillStyle = "#795548";
    ctx.fillRect(50, 500, 700, 80);
    
    // Draw current task
    const currentTask = workMinigame.tasks[workMinigame.currentTask];
    
    // Task title
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Task: ${currentTask.name}`, canvas.width / 2, 150);
    
    // Task progress bar
    const progressBarWidth = 500;
    const progressBarHeight = 30;
    const progressBarX = (canvas.width - progressBarWidth) / 2;
    const progressBarY = 200;
    
    // Background
    ctx.fillStyle = "#455A64";
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
    // Progress
    const progress = currentTask.progress / currentTask.maxProgress;
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
    
    // Progress text
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`${Math.round(progress * 100)}%`, canvas.width / 2, progressBarY + progressBarHeight / 2 + 5);
    
    // Draw time left
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Time Left: ${Math.ceil(workMinigame.timeLeft)}s`, canvas.width / 2, 300);
    
    // Draw task list
    ctx.textAlign = "left";
    ctx.font = "18px Arial";
    ctx.fillText("Tasks:", 150, 350);
    
    for (let i = 0; i < workMinigame.tasks.length; i++) {
        const task = workMinigame.tasks[i];
        const status = task.completed ? "✓" : i === workMinigame.currentTask ? "→" : "○";
        ctx.fillText(`${status} ${task.name}`, 180, 380 + i * 30);
    }
    
    // Draw instructions
    ctx.textAlign = "center";
    ctx.font = "16px Arial";
    ctx.fillText("Press SPACE repeatedly to work on the task", canvas.width / 2, 500);
    ctx.fillText("Press ESC to quit", canvas.width / 2, 530);
}

// Update work minigame
function updateWorkMinigame(deltaTime) {
    // Update work progress
    if (gameState === "working" && workMinigame) {
        // Space to advance progress
        if (window.keys[" "]) {
            workMinigame.progress += 10;
            window.keys[" "] = false; // Reset space key
        }
        
        // Escape to exit
        if (window.keys.Escape) {
            endWork(false);
            window.keys.Escape = false; // Reset escape key
        }
        
        // When work is completed
        if (workMinigame.progress >= 100) {
            // Award money
            playerStats.money += 100;
            
            // End work
            endWork(true);
        }
    }
}

// Initialize and start Logic Gates Minigame
function startLogicGateMinigame() {
    console.log("Starting logic gates minigame");
    gameState = "minigame";
    
    // Initialize minigame state
    logicGateMinigame = {
        level: 1,
        score: 0,
        gates: [],
        connections: [],
        time: 120, // 2 minutes
        inputValues: [0, 1],
        outputValue: 0,
        targetValue: 1
    };
    
    // Generate puzzle based on level
    generateLogicGatePuzzle(logicGateMinigame.level);
}

// Generate a logic gate puzzle
function generateLogicGatePuzzle(level) {
    // In a full implementation, this would generate different puzzles
    // based on the level number
    console.log("Generating logic gate puzzle for level:", level);
    
    // For now, just create a simple puzzle
    logicGateMinigame.gates = [
        { type: "AND", x: 300, y: 200, inputs: [null, null], output: null },
        { type: "OR", x: 500, y: 300, inputs: [null, null], output: null },
        { type: "NOT", x: 400, y: 400, inputs: [null], output: null }
    ];
    
    logicGateMinigame.connections = [];
}

// Draw the Logic Gates Minigame
function drawLogicGateMinigame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = "#001C38";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Logic Gates Puzzle", canvas.width / 2, 40);
    
    // Draw level and score
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Level: ${logicGateMinigame.level}`, 20, 30);
    ctx.fillText(`Score: ${logicGateMinigame.score}`, 20, 60);
    ctx.fillText(`Time: ${Math.ceil(logicGateMinigame.time)}s`, 20, 90);
    
    // Draw inputs
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(100, 150, 50, 50);
    ctx.fillRect(100, 250, 50, 50);
    
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(logicGateMinigame.inputValues[0].toString(), 125, 180);
    ctx.fillText(logicGateMinigame.inputValues[1].toString(), 125, 280);
    
    // Draw target output
    ctx.fillStyle = "#F44336";
    ctx.fillRect(650, 200, 50, 50);
    
    ctx.fillStyle = "white";
    ctx.fillText(logicGateMinigame.targetValue.toString(), 675, 230);
    
    // Draw gates
    for (const gate of logicGateMinigame.gates) {
        // Draw gate box
        ctx.fillStyle = "#2196F3";
        ctx.fillRect(gate.x, gate.y, 80, 60);
        
        // Draw gate type
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(gate.type, gate.x + 40, gate.y + 35);
    }
    
    // Draw connections
    ctx.strokeStyle = "#FFEB3B";
    ctx.lineWidth = 3;
    for (const connection of logicGateMinigame.connections) {
        ctx.beginPath();
        ctx.moveTo(connection.startX, connection.startY);
        ctx.lineTo(connection.endX, connection.endY);
        ctx.stroke();
    }
    
    // Draw instructions
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Connect the logic gates to produce the target output", canvas.width / 2, 500);
    ctx.fillText("Drag from outputs to inputs to create connections", canvas.width / 2, 530);
    ctx.fillText("Press ESC to return to the game", canvas.width / 2, 560);
}

// Update Logic Gates Minigame
function updateLogicGateMinigame(deltaTime) {
    // Update logic gate minigame
    if (gameState === "minigame" && logicGateMinigame) {
        // Update timer
        logicGateMinigame.timeRemaining -= deltaTime;
        
        // Check for timeout
        if (logicGateMinigame.timeRemaining <= 0) {
            exitLogicGatesMinigame(false);
        }
        
        // Check for escape key to exit
        if (window.keys.Escape) {
            exitLogicGatesMinigame(false);
            window.keys.Escape = false;
        }
    }
}

// Game update loop
function update(deltaTime) {
    if (window.gameState === "gameplay") {
        // Update player position
        player.update(deltaTime);
        
        // Update NPCs
        for (let i = 0; i < npcs.length; i++) {
            npcs[i].update(deltaTime);
        }
        
        // Update furniture
        if (typeof updateFurniture === 'function') {
            updateFurniture(deltaTime);
        }
    } else if (window.gameState === "working") {
        // Update work minigame
        if (workMinigame) {
            workMinigame.update(deltaTime);
        }
    } else if (window.gameState === "minigame") {
        // Update logic gates minigame
        if (logicGateMinigame) {
            logicGateMinigame.update(deltaTime);
        }
    }
}

// Building entrance system
const buildings = [
    {
        id: 'tech',
        name: 'Tech Company',
        x: 600,
        y: 300,
        width: 150,
        height: 100,
        redirectUrl: 'building-interior.html?building=tech',
        entranceX: 600,
        entranceY: 350,
        entranceRange: 50
    },
    {
        id: 'university',
        name: 'University',
        x: 200,
        y: 150,
        width: 200,
        height: 120,
        redirectUrl: 'building-interior.html?building=university',
        entranceX: 250,
        entranceY: 210,
        entranceRange: 50
    }
];

// Check if player is near a building entrance
function checkBuildingEntrances() {
    for (const building of buildings) {
        const dx = player.x - building.entranceX;
        const dy = player.y - building.entranceY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < building.entranceRange) {
            return building;
        }
    }
    return null;
}

// Show entrance indicator
function drawEntranceIndicator(building) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width/2 - 150, 50, 300, 40);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Enter ${building.name} (E)`, canvas.width/2, 75);
}

// Enter a building
function enterBuilding(building) {
    // Create a transition effect
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'black';
    overlay.style.zIndex = '1000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s';
    document.body.appendChild(overlay);
    
    // Fade to black
    setTimeout(() => {
        overlay.style.opacity = '1';
        setTimeout(() => {
            // Redirect to building interior
            window.location.href = building.redirectUrl;
        }, 1000);
    }, 50);
}

// Update draw function to show entrance indicators
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
        // Draw obstacles
        drawObstacles();
        
        // Draw items
        drawItems();
        
        // Draw buildings
        drawJobBuilding();
        
        // Draw player
        player.draw();
        
        // Draw NPCs
        drawNPCs();
        
        // Draw UI
        drawUI();
        
        // Check for nearby interactable NPCs
        if (!inDialogMode) {
            checkNearbyNPCs();
            
            // Check for nearby building entrances
            const nearbyBuilding = checkBuildingEntrances();
            if (nearbyBuilding) {
                drawEntranceIndicator(nearbyBuilding);
            }
        }
    } catch (e) {
        console.error("Error in draw function:", e);
    }
}

// Create dynamic building image if needed
function createBuildingImage() {
    if (!window.IMAGES.jobBuilding || window.IMAGES.jobBuilding.complete === false) {
        console.log("Creating dynamic building image");
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple building
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 0, 150, 100);
        
        // Add windows
        ctx.fillStyle = '#88CCFF';
        for (let y = 10; y < 80; y += 30) {
            for (let x = 10; x < 130; x += 30) {
                ctx.fillRect(x, y, 20, 20);
            }
        }
        
        // Add door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(60, 70, 30, 30);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(65, 85, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Convert to image
        const img = new Image();
        img.src = canvas.toDataURL();
        window.IMAGES.jobBuilding = img;
        
        return img;
    }
    return window.IMAGES.jobBuilding;
}