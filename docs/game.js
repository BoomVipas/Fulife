// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 64;
const PLAYER_SPEED = 5;
const INVENTORY_SLOTS = 9;
const INTERACTION_DISTANCE = 60;

// Game state
let gameState = "gameplay"; // gameplay, working, minigame
let interactingWith = null;
let canvas, ctx;
let lastTime = 0;
let gameInitialized = false;
let inDialogMode = false;
let animationFrameId = null;
let furnitureImages = {};
let workMinigame = null;

// Logic Gates Minigame variables
let logicGateMinigame = null;

// Input state
const touchControls = {
    up: false, 
    down: false, 
    left: false, 
    right: false,
    action: false, 
    inventory: false
};

const keys = {
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

// Image objects
const imageObjects = {};

// Job building object
const jobBuilding = {
    x: 600,
    y: 300,
    width: 150,
    height: 100,
    color: "#4CAF50",
    name: "Tech Company",
    img: null,
    
    draw: function() {
        if (this.img && this.img.complete) {
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
    jobBuilding.draw();
}

// Player stats
let playerStats = {
    education: 10,
    career: 5,
    happiness: 50,
    health: 100,
    money: 1000,
    inventory: []
};

// Player
const player = {
    x: canvas.width / 2 - PLAYER_SIZE / 2,
    y: canvas.height / 2 - PLAYER_SIZE / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    facing: 'down',
    isMoving: false,
    hasBeenPositioned: false,
    inventory: [],
    spriteImg: null,
    spriteSheet: null,
    
    // Draw method defined separately
    
    // Update movement
    update: function(deltaTime) {
        let moved = false;
        
        // Update player position based on active keys
        if (keys.ArrowUp || keys.w) {
            this.y -= this.speed * deltaTime;
            this.facing = 'up';
            moved = true;
        }
        if (keys.ArrowDown || keys.s) {
            this.y += this.speed * deltaTime;
            this.facing = 'down';
            moved = true;
        }
        if (keys.ArrowLeft || keys.a) {
            this.x -= this.speed * deltaTime;
            this.facing = 'left';
            moved = true;
        }
        if (keys.ArrowRight || keys.d) {
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
        if (interactingWith === null) {
            for (let i = 0; i < npcs.length; i++) {
                if (checkCollision(this, npcs[i])) {
                    // Start interaction if E is pressed
                    if (keys.e) {
                        startDialog(npcs[i]);
                        keys.e = false; // Reset E key to prevent multiple triggers
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
            if (keys.e) {
                startWork();
                keys.e = false; // Reset E key to prevent multiple triggers
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
            if (this.spriteImg && this.spriteImg.complete) {
                // Use the sprite sheet for drawing
                // Each frame is 108x144 pixels in our sprite sheet
                const frameWidth = 108;
                const frameHeight = 144;
                
                // Determine direction for sprite selection (0=down, 1=up, 2=right, 3=left)
                let directionIndex = 0; // Default facing down
                if (this.facing === 'up') directionIndex = 1;
                else if (this.facing === 'right') directionIndex = 2;
                else if (this.facing === 'left') directionIndex = 3;
                
                // Determine animation frame based on movement
                let frameIndex = 1; // Default to middle (standing) frame
                if (this.isMoving) {
                    // Calculate animation frame based on time
                    const walkSpeed = 200; // ms per frame
                    frameIndex = Math.floor((Date.now() % (walkSpeed * 3)) / walkSpeed);
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
                }
            } else {
                // Fallback: draw a blue rectangle with eyes to indicate direction
                ctx.fillStyle = '#2196F3';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Draw eyes to indicate facing direction
                ctx.fillStyle = 'white';
                const eyeSize = 5;
                
                if (this.facing === 'down') {
                    ctx.fillRect(this.x + this.width / 3 - eyeSize / 2, this.y + this.height / 4, eyeSize, eyeSize);
                    ctx.fillRect(this.x + 2 * this.width / 3 - eyeSize / 2, this.y + this.height / 4, eyeSize, eyeSize);
                } else if (this.facing === 'up') {
                    ctx.fillRect(this.x + this.width / 3 - eyeSize / 2, this.y + this.height / 5, eyeSize, eyeSize);
                    ctx.fillRect(this.x + 2 * this.width / 3 - eyeSize / 2, this.y + this.height / 5, eyeSize, eyeSize);
                } else if (this.facing === 'right') {
                    ctx.fillRect(this.x + 2 * this.width / 3, this.y + this.height / 4, eyeSize, eyeSize);
                } else if (this.facing === 'left') {
                    ctx.fillRect(this.x + this.width / 3 - eyeSize, this.y + this.height / 4, eyeSize, eyeSize);
                }
                
                if (window.location.hash === '#debug') {
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.fillText(`X: ${Math.round(this.x)}, Y: ${Math.round(this.y)}`, this.x, this.y - 5);
                }
            }
        } catch (error) {
            console.error('Error drawing player:', error);
            // Ultimate fallback: just draw a red rectangle
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};

// NPCs
const npcs = [
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
        ]
    }
];

// Items that can be picked up
const items = [
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
            playerStats.education += 3;
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
            playerStats.career += 2;
            playerStats.education += 2;
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
const obstacles = [
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
const notifications = [];

// Display a message notification
function displayMessage(message, duration = 3000) {
    notifications.push({
        message: message,
        duration: duration,
        timestamp: Date.now()
    });
}

// Draw active notifications
function drawNotifications() {
    const currentTime = Date.now();
    
    // Remove expired notifications
    for (let i = notifications.length - 1; i >= 0; i--) {
        if (currentTime - notifications[i].timestamp > notifications[i].duration) {
            notifications.splice(i, 1);
        }
    }
    
    // Draw active notifications
    ctx.textAlign = "right";
    for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
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
    interactingWith = npc;
    inDialogMode = true;
    
    // Create dialog container if it doesn't exist
    if (!document.getElementById('dialogContainer')) {
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
        
        // Continue button
        const continueButton = document.createElement('button');
        continueButton.id = 'dialogContinue';
        continueButton.innerText = 'Continue';
        continueButton.style.backgroundColor = '#4CAF50';
        continueButton.style.color = 'white';
        continueButton.style.border = 'none';
        continueButton.style.padding = '8px 16px';
        continueButton.style.borderRadius = '4px';
        continueButton.style.cursor = 'pointer';
        continueButton.style.marginRight = '10px';
        continueButton.addEventListener('click', closeDialog);
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.id = 'dialogClose';
        closeButton.innerText = 'Close';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.padding = '8px 16px';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', closeDialog);
        
        // Add all elements to dialog
        dialogContent.appendChild(npcName);
        dialogContent.appendChild(dialogText);
        dialogContent.appendChild(continueButton);
        dialogContent.appendChild(closeButton);
        dialogContainer.appendChild(dialogContent);
        
        // Add dialog to game container
        document.getElementById('game-container').appendChild(dialogContainer);
    }
    
    // Set NPC name and dialog text
    document.getElementById('dialogNpcName').innerText = npc.name;
    
    // Handle different dialog formats
    if (Array.isArray(npc.dialogues)) {
        // Simple array of dialog lines
        document.getElementById('dialogText').innerText = npc.dialogues[0];
        npc.currentDialogIndex = 0;
    } else if (typeof npc.dialogues === 'object' && npc.dialogues.length > 0) {
        // Complex dialog with options
        const currentDialog = npc.dialogues[npc.currentDialogueId || 0];
        document.getElementById('dialogText').innerText = currentDialog.text;
        
        // Remove previous options if any
        const oldOptions = document.querySelectorAll('.dialog-option');
        oldOptions.forEach(option => option.remove());
        
        // Add dialog options if available
        if (currentDialog.options && currentDialog.options.length > 0) {
            const dialogContent = document.getElementById('dialogContent');
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'dialog-options';
            optionsContainer.style.marginBottom = '15px';
            
            currentDialog.options.forEach((option, index) => {
                const optionButton = document.createElement('button');
                optionButton.className = 'dialog-option';
                optionButton.innerText = option.text;
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
            
            dialogContent.insertBefore(optionsContainer, document.getElementById('dialogContinue'));
        }
    }
    
    // Show the dialog container
    document.getElementById('dialogContainer').style.display = 'block';
}

// Close the dialog
function closeDialog() {
    inDialogMode = false;
    interactingWith = null;
    
    // Hide the dialog container
    if (document.getElementById('dialogContainer')) {
        document.getElementById('dialogContainer').style.display = 'none';
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
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw some debug info if debugging is enabled
    if (window.location.hash === '#debug') {
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`FPS: ${Math.round(1 / (deltaTime || 0.016))}`, 10, 20);
        ctx.fillText(`Player: ${Math.round(player.x)},${Math.round(player.y)}`, 10, 35);
        ctx.fillText(`Game State: ${gameState}`, 10, 50);
    }
    
    // Update game state based on current state
    if (gameState === "gameplay") {
        // Always draw game objects in dialog mode too
        // Draw obstacles
        drawObstacles();
        
        // Draw items
        drawItems();
        
        // Draw player
        player.draw();
        
        // Draw NPCs
        drawNPCs();
        
        // Draw job building
        drawJobBuilding();
        
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
            
            // Check for nearby interactable NPCs
            checkNearbyNPCs();
        } else {
            // Handle dialog
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
    
    // Draw notifications if there are any
    drawNotifications();
    
    // Draw UI
    drawUI();
    
    // Request the next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Load images
function loadImages() {
    console.log('Loading images...');
    return new Promise((resolve) => {
        let loadedCount = 0;
        const requiredCount = 2; // At minimum we need the player sprite and job building

        // This will be called when the player sprite is loaded
        function onPlayerSpriteLoaded() {
            console.log('Player sprite loaded successfully:', player.spriteSheet);
            loadedCount++;
            if (loadedCount >= requiredCount) {
                console.log('All required images loaded.');
                resolve();
            }
        }

        // Try to load player sprite
        if (IMAGES.playerSprite) {
            console.log('Attempting to load player sprite from IMAGES object');
            player.spriteImg = new Image();
            player.spriteImg.onload = function() {
                console.log('Player sprite image loaded from IMAGES object');
                player.spriteSheet = IMAGES.playerSprite;
                onPlayerSpriteLoaded();
            };
            player.spriteImg.onerror = function() {
                console.warn('Failed to load player sprite from IMAGES object, creating fallback');
                player.spriteSheet = createPlayerSpriteSheet();
                player.spriteImg = new Image();
                player.spriteImg.src = player.spriteSheet;
                player.spriteImg.onload = onPlayerSpriteLoaded;
            };
            player.spriteImg.src = IMAGES.playerSprite;
            
            // Add a timeout in case the image takes too long to load
            setTimeout(() => {
                if (!player.spriteImg.complete) {
                    console.warn('Player sprite load timeout, creating fallback');
                    player.spriteSheet = createPlayerSpriteSheet();
                    player.spriteImg = new Image();
                    player.spriteImg.src = player.spriteSheet;
                    player.spriteImg.onload = onPlayerSpriteLoaded;
                }
            }, 3000);
        } else {
            console.log('No player sprite in IMAGES object, creating dynamic sprite sheet');
            player.spriteSheet = createPlayerSpriteSheet();
            player.spriteImg = new Image();
            player.spriteImg.src = player.spriteSheet;
            player.spriteImg.onload = onPlayerSpriteLoaded;
        }

        // Load building image
        if (IMAGES.jobBuilding) {
            console.log('Loading job building image');
            jobBuilding.img = new Image();
            jobBuilding.img.onload = function() {
                console.log('Job building image loaded');
                loadedCount++;
                if (loadedCount >= requiredCount) {
                    console.log('All required images loaded.');
                    resolve();
                }
            };
            jobBuilding.img.onerror = function() {
                console.warn('Failed to load job building image, using fallback');
                loadedCount++; // Count it anyway, we'll draw a rectangle instead
                if (loadedCount >= requiredCount) {
                    console.log('All required images loaded (with fallbacks).');
                    resolve();
                }
            };
            jobBuilding.img.src = IMAGES.jobBuilding;
        } else {
            console.log('No job building image in IMAGES object, will use fallback');
            loadedCount++; // Count it anyway, we'll draw a rectangle
            if (loadedCount >= requiredCount) {
                console.log('All required images loaded (with fallbacks).');
                resolve();
            }
        }

        // Load furniture images if available
        if (IMAGES.furniture) {
            console.log('Loading furniture images');
            for (const key in IMAGES.furniture) {
                const furnitureImg = new Image();
                furnitureImg.src = IMAGES.furniture[key];
                furnitureImages[key] = furnitureImg;
                console.log(`Loaded furniture image: ${key}`);
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
    
    // If game is already initialized, just resume it
    if (gameInitialized) {
        console.log("Game already initialized, resuming");
        
        // Make sure the game container and canvas are visible
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = "block";
        }
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = "block";
        }
        
        // Reset player position to center if coming from cutscene
        if (gameState === "gameplay" && !player.hasBeenPositioned) {
            player.x = (GAME_WIDTH - player.width) / 2;
            player.y = (GAME_HEIGHT - player.height) / 2;
            player.hasBeenPositioned = true;
        }
        
        // Return without reinitializing
        return;
    }
    
    // Get the canvas and context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Ensure canvas is visible and has proper dimensions
    canvas.style.display = "block";
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Position player in the center of the screen
    player.x = (GAME_WIDTH - player.width) / 2;
    player.y = (GAME_HEIGHT - player.height) / 2;
    player.hasBeenPositioned = true;
    
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
    
    // Load images
    loadImages().then(() => {
        // Initialize inventory
        initInventory();
        
        // Create or update stats display
        updateStatsDisplay();
        
        // Set initial timestamp to avoid large first frame delta
        lastTime = performance.now();
        
        // Start the game loop
        gameInitialized = true;
        console.log("Game initialized successfully, starting game loop");
        requestAnimationFrame(gameLoop);
    });
}

// Handle key down events
function handleKeyDown(e) {
    // Store key state directly in keys object
    keys[e.key] = true;
    
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
    keys[e.key] = false;
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
        upBtn.addEventListener('touchstart', () => { touchControls.up = true; });
        upBtn.addEventListener('touchend', () => { touchControls.up = false; });
        upBtn.addEventListener('mousedown', () => { touchControls.up = true; });
        upBtn.addEventListener('mouseup', () => { touchControls.up = false; });
        dPad.appendChild(upBtn);
        
        // Left button
        const leftBtn = document.createElement('button');
        leftBtn.id = 'leftBtn';
        leftBtn.innerHTML = '&#9668;'; // Left arrow
        leftBtn.style.gridColumn = '1';
        leftBtn.style.gridRow = '2';
        leftBtn.className = 'touch-button';
        leftBtn.addEventListener('touchstart', () => { touchControls.left = true; });
        leftBtn.addEventListener('touchend', () => { touchControls.left = false; });
        leftBtn.addEventListener('mousedown', () => { touchControls.left = true; });
        leftBtn.addEventListener('mouseup', () => { touchControls.left = false; });
        dPad.appendChild(leftBtn);
        
        // Right button
        const rightBtn = document.createElement('button');
        rightBtn.id = 'rightBtn';
        rightBtn.innerHTML = '&#9658;'; // Right arrow
        rightBtn.style.gridColumn = '3';
        rightBtn.style.gridRow = '2';
        rightBtn.className = 'touch-button';
        rightBtn.addEventListener('touchstart', () => { touchControls.right = true; });
        rightBtn.addEventListener('touchend', () => { touchControls.right = false; });
        rightBtn.addEventListener('mousedown', () => { touchControls.right = true; });
        rightBtn.addEventListener('mouseup', () => { touchControls.right = false; });
        dPad.appendChild(rightBtn);
        
        // Down button
        const downBtn = document.createElement('button');
        downBtn.id = 'downBtn';
        downBtn.innerHTML = '&#9660;'; // Down arrow
        downBtn.style.gridColumn = '2';
        downBtn.style.gridRow = '3';
        downBtn.className = 'touch-button';
        downBtn.addEventListener('touchstart', () => { touchControls.down = true; });
        downBtn.addEventListener('touchend', () => { touchControls.down = false; });
        downBtn.addEventListener('mousedown', () => { touchControls.down = true; });
        downBtn.addEventListener('mouseup', () => { touchControls.down = false; });
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
    if (interactingWith === null) {
        for (const npc of npcs) {
            // Check if player is near an NPC
            const dist = Math.sqrt(
                Math.pow(player.x + player.width/2 - (npc.x + npc.width/2), 2) +
                Math.pow(player.y + player.height/2 - (npc.y + npc.height/2), 2)
            );
            
            // If close enough, show interaction prompt
            if (dist < 100) {
                ctx.fillStyle = "white";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Press E to talk", npc.x + npc.width/2, npc.y - 25);
                
                // If E key is pressed, start dialog
                if (keys.e) {
                    startDialog(npc);
                    keys.e = false; // Reset to prevent multiple triggers
                }
            }
        }
    }
}

// Start work minigame
function startWork() {
    console.log("Starting work minigame");
    gameState = "working";
    
    // Initialize work minigame variables
    workMinigame = {
        tasks: [
            { name: "Debug code", completed: false, progress: 0, maxProgress: 100 },
            { name: "Write documentation", completed: false, progress: 0, maxProgress: 80 },
            { name: "Test application", completed: false, progress: 0, maxProgress: 120 }
        ],
        currentTask: 0,
        taskSpeed: 0.5,
        reward: 200,
        timeLeft: 60 // seconds
    };
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
    // Update time left
    workMinigame.timeLeft -= deltaTime;
    
    if (workMinigame.timeLeft <= 0) {
        // End minigame on timeout
        endWork(false);
        return;
    }
    
    // Check if current task is completed
    const currentTask = workMinigame.tasks[workMinigame.currentTask];
    if (currentTask.progress >= currentTask.maxProgress) {
        currentTask.completed = true;
        
        // Move to next task
        workMinigame.currentTask++;
        
        // Check if all tasks are completed
        if (workMinigame.currentTask >= workMinigame.tasks.length) {
            endWork(true);
            return;
        }
    }
    
    // Check for space key press to work on task
    if (keys[" "]) {
        workMinigame.tasks[workMinigame.currentTask].progress += workMinigame.taskSpeed * 10;
        keys[" "] = false; // Reset space key
    }
    
    // Check for escape key to exit
    if (keys.Escape) {
        endWork(false);
        keys.Escape = false; // Reset escape key
    }
}

// End work minigame
function endWork(success) {
    // Return to gameplay
    gameState = "gameplay";
    
    if (success) {
        // Award money and career points
        playerStats.money += workMinigame.reward;
        playerStats.career += 5;
        displayMessage(`Work completed! Earned $${workMinigame.reward} and 5 career points.`);
    } else {
        // Give partial reward based on completed tasks
        const completedTasks = workMinigame.tasks.filter(task => task.completed).length;
        const partialReward = Math.floor(workMinigame.reward * (completedTasks / workMinigame.tasks.length));
        
        if (partialReward > 0) {
            playerStats.money += partialReward;
            playerStats.career += Math.floor(5 * (completedTasks / workMinigame.tasks.length));
            displayMessage(`Work partially completed. Earned $${partialReward}.`);
        } else {
            displayMessage("Work not completed. No reward earned.");
        }
    }
    
    // Update stats display
    updateStatsDisplay();
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
    // Update time
    logicGateMinigame.time -= deltaTime;
    
    if (logicGateMinigame.time <= 0) {
        // Time's up, end the minigame
        gameState = "gameplay";
        return;
    }
    
    // Check for win condition
    if (logicGateMinigame.outputValue === logicGateMinigame.targetValue) {
        // Level complete
        logicGateMinigame.level++;
        logicGateMinigame.score += 100;
        
        // Start next level or end game if all levels complete
        if (logicGateMinigame.level > 5) {
            // Game complete
            gameState = "gameplay";
            playerStats.education += 10;
            updateStatsDisplay();
            displayMessage("Logic Gates Challenge complete! Education +10");
        } else {
            // Next level
            generateLogicGatePuzzle(logicGateMinigame.level);
        }
    }
    
    // Check for escape key to exit
    if (keys.Escape) {
        gameState = "gameplay";
        keys.Escape = false;
    }
} 