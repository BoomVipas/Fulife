// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5;
const INVENTORY_SLOTS = 9;
const INTERACTION_DISTANCE = 60;

// Game state
let gameState = "playing"; // playing, dialog
let interactingWith = null;
let canvas, ctx;
let lastTimestamp = 0;
let keyboard = {
    w: false, a: false, s: false, d: false,
    up: false, down: false, left: false, right: false,
    e: false, i: false
};
let touchControls = {
    up: false, down: false, left: false, right: false,
    action: false, inventory: false
};
let playerStats = {
    education: 10,
    career: 5,
    happiness: 50,
    health: 100,
    money: 1000,
    inventory: []
};

// Image objects
const imageObjects = {};

// Player
const player = {
    x: 400,
    y: 300,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    movingUp: false,
    movingDown: false,
    movingLeft: false,
    movingRight: false,
    
    update: function() {
        // Save previous position for collision detection
        const prevX = this.x;
        const prevY = this.y;
        
        // Check keyboard input for movement
        this.movingUp = keyboard.w || keyboard.up || touchControls.up;
        this.movingDown = keyboard.s || keyboard.down || touchControls.down;
        this.movingLeft = keyboard.a || keyboard.left || touchControls.left;
        this.movingRight = keyboard.d || keyboard.right || touchControls.right;
        
        // Apply movement
        if (this.movingUp) this.y -= this.speed;
        if (this.movingDown) this.y += this.speed;
        if (this.movingLeft) this.x -= this.speed;
        if (this.movingRight) this.x += this.speed;
        
        // Check boundary collisions
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > GAME_WIDTH) this.x = GAME_WIDTH - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > GAME_HEIGHT) this.y = GAME_HEIGHT - this.height;
        
        // Check obstacle collisions
        if (checkCollision(this, obstacles)) {
            // Revert to previous position if colliding with obstacles
            this.x = prevX;
            this.y = prevY;
        }
    },
    
    draw: function() {
        if (imageObjects.player) {
            ctx.drawImage(imageObjects.player, this.x, this.y, this.width, this.height);
        } else {
            // Fallback to rectangle if image is not loaded
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};

// NPCs
const npcs = [
    {
        id: "professor",
        name: "Professor Williams",
        x: 200,
        y: 150,
        width: 50,
        height: 50,
        color: "purple",
        dialogues: [
            {
                text: "Hello, I'm Professor Williams. I teach Computer Science. Would you like to learn about programming?",
                options: [
                    { text: "Yes, I'd love to learn!", nextId: 1 },
                    { text: "No, not interested right now.", nextId: 2 }
                ]
            },
            {
                text: "Great! Programming is a valuable skill. Focus on the fundamentals first. Your education level has increased!",
                effect: () => {
                    playerStats.education += 5;
                    updateStatsDisplay();
                }
            },
            {
                text: "That's alright. Come back when you're ready to learn."
            }
        ],
        currentDialogueId: 0,
        
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw name above NPC
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x + this.width/2, this.y - 10);
        }
    },
    {
        id: "employer",
        name: "HR Manager",
        x: 600,
        y: 250,
        width: 50,
        height: 50,
        color: "orange",
        dialogues: [
            {
                text: "Hello, I'm the HR Manager. We're looking for skilled workers. Are you interested in a job?",
                options: [
                    { text: "Yes, I'd like to apply", nextId: 1 },
                    { text: "What are the requirements?", nextId: 2 },
                    { text: "No thanks, just looking around", nextId: 3 }
                ]
            },
            {
                text: "Great! Let's see your qualifications...",
                options: [
                    { 
                        text: "Show my education credentials", 
                        nextId: 4,
                        condition: () => playerStats.education >= 15,
                        conditionFail: "Not enough education (15+ required)"
                    }
                ]
            },
            {
                text: "We require at least 15 points in education. Come back when you've studied more.",
            },
            {
                text: "No problem. Come back if you change your mind."
            },
            {
                text: "Impressive credentials! You're hired. Your career level has increased, and you'll receive a salary of $500!",
                effect: () => {
                    playerStats.career += 10;
                    playerStats.money += 500;
                    updateStatsDisplay();
                }
            }
        ],
        currentDialogueId: 0,
        
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw name above NPC
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x + this.width/2, this.y - 10);
        }
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

// Check collision between two objects
function checkCollision(obj1, objArray) {
    if (Array.isArray(objArray)) {
        // Check against an array of objects
        for (let obj2 of objArray) {
            if (
                obj1.x < obj2.x + obj2.width &&
                obj1.x + obj1.width > obj2.x &&
                obj1.y < obj2.y + obj2.height &&
                obj1.y + obj1.height > obj2.y
            ) {
                // Skip doors - they're passable
                if (obj2.type === "door") continue;
                
                return true;
            }
        }
        return false;
    } else {
        // Check against a single object
        const obj2 = objArray;
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
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

// Show dialog with an NPC
function showDialog(npc) {
    gameState = "dialog";
    interactingWith = npc;
    
    const dialogue = npc.dialogues[npc.currentDialogueId];
    
    // Set dialog UI elements
    document.getElementById("npcName").textContent = npc.name;
    document.getElementById("dialogText").textContent = dialogue.text;
    
    // Clear previous options
    const optionsContainer = document.getElementById("dialogOptions");
    optionsContainer.innerHTML = "";
    
    // Create options if they exist
    if (dialogue.options) {
        dialogue.options.forEach(option => {
            const button = document.createElement("button");
            button.className = "btn dialog-option";
            button.textContent = option.text;
            
            // Check if the option has a condition
            if (option.condition && !option.condition()) {
                button.disabled = true;
                button.textContent += ` (${option.conditionFail})`;
            } else {
                button.onclick = function() {
                    npc.currentDialogueId = option.nextId;
                    showDialog(npc);
                };
            }
            
            optionsContainer.appendChild(button);
        });
    } else {
        // If no options, show close button
        document.getElementById("closeDialog").style.display = "inline-block";
    }
    
    // Show dialog box
    document.getElementById("dialogBox").style.display = "block";
    
    // Apply effects if any
    if (dialogue.effect) {
        dialogue.effect();
    }
}

// Close dialog
function closeDialog() {
    gameState = "playing";
    interactingWith = null;
    document.getElementById("dialogBox").style.display = "none";
    document.getElementById("closeDialog").style.display = "none";
    
    // Reset dialogue ID for future interactions
    if (interactingWith) {
        interactingWith.currentDialogueId = 0;
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

// Game loop
function gameLoop(timestamp) {
    // Calculate time since last frame
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw if not in dialog
    if (gameState === "playing") {
        player.update();
        
        // Draw obstacles
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
        
        // Draw items
        for (let item of items) {
            item.draw();
        }
        
        // Draw NPCs
        for (let npc of npcs) {
            npc.draw();
        }
        
        // Draw player
        player.draw();
        
        // Draw interaction indicators
        const interactableNPC = getInteractableNPC();
        if (interactableNPC) {
            drawInteractionIndicator(interactableNPC, "Talk (E)");
        }
        
        const interactableItem = getInteractableItem();
        if (interactableItem) {
            drawInteractionIndicator(interactableItem, "Pick Up (E)");
        }
    }
    
    // Draw instruction text
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Move: WASD or Arrow Keys | Interact: E | Inventory: I", 20, 30);
    
    // Request next frame
    requestAnimationFrame(gameLoop);
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
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    // Load images
    loadImages();
    
    // Add keyboard event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    // Add touch control event listeners
    const upBtn = document.getElementById("upBtn");
    const downBtn = document.getElementById("downBtn");
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");
    const actionBtn = document.getElementById("actionBtn");
    const inventoryBtn = document.getElementById("inventoryBtn");
    
    if (upBtn) {
        upBtn.addEventListener("touchstart", () => { touchControls.up = true; });
        upBtn.addEventListener("touchend", () => { touchControls.up = false; });
        upBtn.addEventListener("mousedown", () => { touchControls.up = true; });
        upBtn.addEventListener("mouseup", () => { touchControls.up = false; });
    }
    
    if (downBtn) {
        downBtn.addEventListener("touchstart", () => { touchControls.down = true; });
        downBtn.addEventListener("touchend", () => { touchControls.down = false; });
        downBtn.addEventListener("mousedown", () => { touchControls.down = true; });
        downBtn.addEventListener("mouseup", () => { touchControls.down = false; });
    }
    
    if (leftBtn) {
        leftBtn.addEventListener("touchstart", () => { touchControls.left = true; });
        leftBtn.addEventListener("touchend", () => { touchControls.left = false; });
        leftBtn.addEventListener("mousedown", () => { touchControls.left = true; });
        leftBtn.addEventListener("mouseup", () => { touchControls.left = false; });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener("touchstart", () => { touchControls.right = true; });
        rightBtn.addEventListener("touchend", () => { touchControls.right = false; });
        rightBtn.addEventListener("mousedown", () => { touchControls.right = true; });
        rightBtn.addEventListener("mouseup", () => { touchControls.right = false; });
    }
    
    if (actionBtn) {
        actionBtn.addEventListener("touchstart", handleAction);
        actionBtn.addEventListener("mousedown", handleAction);
    }
    
    if (inventoryBtn) {
        inventoryBtn.addEventListener("touchstart", toggleInventory);
        inventoryBtn.addEventListener("mousedown", toggleInventory);
    }
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Load game images
function loadImages() {
    // Load player image
    const playerImg = new Image();
    playerImg.src = IMAGES.player;
    playerImg.onload = () => {
        imageObjects.player = playerImg;
    };
    
    // Load furniture images
    const furnitureTypes = ['building', 'chair', 'desk', 'door', 'bed', 'table', 'bookshelf'];
    
    furnitureTypes.forEach(type => {
        if (IMAGES[type]) {
            const img = new Image();
            img.src = IMAGES[type];
            img.onload = () => {
                imageObjects[type] = img;
            };
        }
    });
}

// Handle key down events
function handleKeyDown(e) {
    switch(e.key) {
        case "w":
        case "W":
            keyboard.w = true;
            break;
        case "a":
        case "A":
            keyboard.a = true;
            break;
        case "s":
        case "S":
            keyboard.s = true;
            break;
        case "d":
        case "D":
            keyboard.d = true;
            break;
        case "ArrowUp":
            keyboard.up = true;
            break;
        case "ArrowDown":
            keyboard.down = true;
            break;
        case "ArrowLeft":
            keyboard.left = true;
            break;
        case "ArrowRight":
            keyboard.right = true;
            break;
        case "e":
        case "E":
            if (gameState === "playing") {
                handleAction();
            } else if (gameState === "dialog") {
                closeDialog();
            }
            break;
        case "i":
        case "I":
            toggleInventory();
            break;
    }
}

// Handle key up events
function handleKeyUp(e) {
    switch(e.key) {
        case "w":
        case "W":
            keyboard.w = false;
            break;
        case "a":
        case "A":
            keyboard.a = false;
            break;
        case "s":
        case "S":
            keyboard.s = false;
            break;
        case "d":
        case "D":
            keyboard.d = false;
            break;
        case "ArrowUp":
            keyboard.up = false;
            break;
        case "ArrowDown":
            keyboard.down = false;
            break;
        case "ArrowLeft":
            keyboard.left = false;
            break;
        case "ArrowRight":
            keyboard.right = false;
            break;
    }
}

// Handle action button (E key)
function handleAction() {
    if (gameState !== "playing") return;
    
    // Check for NPC interaction
    const npc = getInteractableNPC();
    if (npc) {
        showDialog(npc);
        return;
    }
    
    // Check for item pickup
    const item = getInteractableItem();
    if (item) {
        pickUpItem(item);
    }
}

// Initialize the game when the window loads
window.addEventListener("load", initGame); 