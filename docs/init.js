// Global initialization script to fix constant redeclaration issues
// This should be loaded FIRST before any other scripts

// Define game constants globally to avoid redeclaration issues
window.GAME_WIDTH = 800;
window.GAME_HEIGHT = 600;
window.PLAYER_SIZE = 64;
window.PLAYER_SPEED = 1;
window.INVENTORY_SLOTS = 9;
window.INTERACTION_DISTANCE = 60;

// Define global game state
window.gameState = "loading"; // loading, gameplay, working, minigame, paused, error

// Create IMAGES object to store image paths
window.IMAGES = {
    playerSprite: 'images/player_sprite.png',
    building: 'images/building.png',
    jobBuilding: 'images/building.png',
    furniture: {
        bed: 'images/furniture/bed.png',
        chair: 'images/furniture/chair.png',
        desk: 'images/furniture/desk.png',
        bookshelf: 'images/furniture/bookshelf.png',
        table: 'images/furniture/table.png'
    }
};

// Create image objects for preloading
window.imageObjects = {};

// Try multiple paths to find working image URL
function tryLoadImage(imageKey, alternativePaths) {
    console.log(`Trying to load ${imageKey} image...`);
    
    return new Promise((resolve) => {
        // Create a new image for this key if it doesn't exist
        if (!window.imageObjects[imageKey]) {
            window.imageObjects[imageKey] = new Image();
        }
        
        const img = window.imageObjects[imageKey];
        const paths = [window.IMAGES[imageKey]].concat(alternativePaths);
        let currentPathIndex = 0;
        
        function tryNextPath() {
            if (currentPathIndex >= paths.length) {
                console.error(`All paths failed for ${imageKey}`);
                resolve(false);
                return;
            }
            
            const currentPath = paths[currentPathIndex];
            console.log(`Trying path for ${imageKey}: ${currentPath}`);
            
            img.onload = function() {
                console.log(`Successfully loaded ${imageKey} from: ${currentPath}`);
                window.IMAGES[imageKey] = currentPath; // Update the path to the working one
                resolve(true);
            };
            
            img.onerror = function() {
                console.warn(`Failed to load ${imageKey} from: ${currentPath}, trying next path`);
                currentPathIndex++;
                tryNextPath();
            };
            
            img.src = currentPath;
        }
        
        tryNextPath();
    });
}

// Preload critical images with robust fallbacks
async function preloadImages() {
    console.log("Preloading critical images...");
    
    // Alternative paths to try for player sprite
    const playerSpritePaths = [
        '/images/player_sprite.png',
        'images/player_sprite.png',
        '../images/player_sprite.png',
        'docs/images/player_sprite.png',
        '/docs/images/player_sprite.png',
        window.location.origin + '/images/player_sprite.png'
    ];
    
    // Alternative paths to try for job building
    const jobBuildingPaths = [
        '/images/building.png',
        'images/building.png',
        '../images/building.png',
        'docs/images/building.png',
        '/docs/images/building.png',
        window.location.origin + '/images/building.png'
    ];
    
    // Try to load player sprite with all possible paths
    const playerSpriteLoaded = await tryLoadImage('playerSprite', playerSpritePaths);
    
    if (playerSpriteLoaded) {
        console.log("Player sprite loaded successfully! Size: " + 
                   window.imageObjects.playerSprite.naturalWidth + "x" + 
                   window.imageObjects.playerSprite.naturalHeight);
    } else {
        console.error("Failed to load player sprite from any path");
    }
    
    // Try to load job building with all possible paths
    const jobBuildingLoaded = await tryLoadImage('jobBuilding', jobBuildingPaths);
    
    if (jobBuildingLoaded) {
        console.log("Job building image loaded successfully!");
    } else {
        console.error("Failed to load job building image from any path");
    }
    
    console.log("Image preloading completed.");
}

// Run preload immediately
preloadImages();

// Other shared variables
window.interactingWith = null;
window.canvas = null;
window.ctx = null;
window.lastTime = 0;
window.gameInitialized = false;
window.inDialogMode = false;
window.animationFrameId = null;
window.fps = 0;
window.player = window.player || {
    x: 400,
    y: 300,
    width: 64,
    height: 64,
    speed: 5,
    facing: 'down',
    color: 'blue',
    hasBeenPositioned: false,
    spriteImg: null,
    update: function(deltaTime) {
        // Basic update function
    },
    draw: function() {
        // Basic draw function
        if (window.ctx) {
            window.ctx.fillStyle = this.color;
            window.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};
window.workMinigame = null;
window.logicGateMinigame = null;
window.furnitureImages = {};
window.obstacles = [];
window.npcs = [];
window.items = [];
window.jobBuilding = null;
window.playerStats = {
    education: 10,
    career: 5,
    happiness: 50,
    health: 100,
    money: 1000,
    inventory: []
};
window.notifications = [];
window.touchControls = {
    up: false, 
    down: false, 
    left: false, 
    right: false,
    action: false, 
    inventory: false
};
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

// Set player sprite reference after preloading
window.addEventListener('load', function() {
    // Small delay to make sure images are processed
    setTimeout(() => {
        if (window.imageObjects.playerSprite && window.imageObjects.playerSprite.complete) {
            console.log("Assigning player sprite from preloaded image");
            window.player.spriteImg = window.imageObjects.playerSprite;
        }
        
        if (window.imageObjects.jobBuilding && window.imageObjects.jobBuilding.complete && window.jobBuilding) {
            console.log("Assigning job building image from preloaded image");
            window.jobBuilding.img = window.imageObjects.jobBuilding;
        }
    }, 100);
});

console.log("Global constants initialized successfully"); 