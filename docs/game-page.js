// Game constants
// Use window scope to avoid redeclaration issues
window.GAME_WIDTH = window.GAME_WIDTH || 800;
window.GAME_HEIGHT = window.GAME_HEIGHT || 600;
window.PLAYER_SIZE = window.PLAYER_SIZE || 64;
window.PLAYER_SPEED = window.PLAYER_SPEED || 5;
window.INVENTORY_SLOTS = window.INVENTORY_SLOTS || 9;
window.INTERACTION_DISTANCE = window.INTERACTION_DISTANCE || 60;

// Error tracking
let initErrors = [];
let loadingStatus = {};

// Game state
let gameState = "loading"; // loading, gameplay, working, minigame, paused, error
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

// Initial setup function
function initializeGame() {
    console.log("Game page initializing...");
    updateLoadingStatus("Starting initialization");
    
    try {
        // Setup debug toggle
        setupDebugMode();
        updateLoadingStatus("Debug mode setup complete");
        
        // Get the canvas element and setup the game
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error("Canvas element not found");
        }
        
        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Could not get 2D context from canvas");
        }
        
        updateLoadingStatus("Canvas initialized");
        
        // Show loading screen with details
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) {
            loadingScreen.style.display = "flex";
            updateLoadingText("Initializing game...");
        } else {
            recordError("Loading screen element not found");
        }
        
        // Make game state loading
        gameState = "loading";
        
        // Setup event listeners
        try {
            setupEventListeners();
            updateLoadingStatus("Event listeners initialized");
        } catch (err) {
            recordError("Failed to setup event listeners: " + err.message);
        }
        
        // Check if required JS files are loaded
        checkRequiredScripts();
        
        // Load images first
        updateLoadingText("Loading game assets...");
        loadImageAssets().then(() => {
            console.log("Images loaded, initializing game...");
            updateLoadingStatus("Images loaded successfully");
            
            try {
                // Initialize the game
                initGame();
                updateLoadingStatus("Game initialized");
                
                // Check for errors before proceeding
                if (initErrors.length > 0) {
                    showErrorScreen();
                    return;
                }
                
                // Hide loading screen
                setTimeout(() => {
                    document.getElementById("loadingScreen").style.display = "none";
                    gameState = "gameplay";
                    console.log("Game started successfully");
                }, 1000);
            } catch (err) {
                recordError("Game initialization failed: " + err.message);
                showErrorScreen();
            }
        }).catch(error => {
            recordError("Image loading failed: " + error.message);
            
            // Still try to initialize with fallbacks
            try {
                initGame();
                updateLoadingStatus("Game initialized with fallback graphics");
                
                // Hide loading screen with a warning
                setTimeout(() => {
                    if (initErrors.length > 0) {
                        showErrorScreen();
                    } else {
                        document.getElementById("loadingScreen").style.display = "none";
                        gameState = "gameplay";
                        alert("Some game assets could not be loaded. The game will use fallback graphics.");
                    }
                }, 1000);
            } catch (err) {
                recordError("Failed to initialize game with fallbacks: " + err.message);
                showErrorScreen();
            }
        });
    } catch (err) {
        recordError("Critical initialization error: " + err.message);
        showErrorScreen();
    }
}

// Check if all required scripts are loaded
function checkRequiredScripts() {
    const requiredObjects = ["IMAGES"];
    const requiredFunctions = ["loadImages", "initGame"];
    
    requiredObjects.forEach(obj => {
        if (typeof window[obj] === 'undefined') {
            recordError(`Required object '${obj}' is missing. Make sure ${obj.toLowerCase()}.js is properly loaded.`);
        } else {
            updateLoadingStatus(`'${obj}' detected`);
        }
    });
    
    requiredFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
            recordError(`Required function '${func}' is missing. Make sure the script file containing this function is properly loaded.`);
        } else {
            updateLoadingStatus(`'${func}' function detected`);
        }
    });
}

// Record an error
function recordError(errorMsg) {
    console.error(errorMsg);
    initErrors.push(errorMsg);
    
    // Update error count in loading screen if it exists
    const loadingText = document.querySelector("#loadingScreen .loading-text");
    if (loadingText) {
        loadingText.innerHTML = `Loading Game...<br><small>${initErrors.length} error(s) detected</small>`;
    }
}

// Update loading status
function updateLoadingStatus(status) {
    const timestamp = new Date().toISOString();
    loadingStatus[timestamp] = status;
    console.log(`[${timestamp}] ${status}`);
    
    // Update loading text if debug mode is on
    if (window.location.hash === '#debug') {
        updateLoadingText(`Loading: ${status}`);
    }
}

// Update loading text
function updateLoadingText(text) {
    const loadingText = document.querySelector("#loadingScreen .loading-text");
    if (loadingText) {
        loadingText.innerHTML = text;
    }
}

// Show error screen
function showErrorScreen() {
    gameState = "error";
    
    // Get loading screen
    const loadingScreen = document.getElementById("loadingScreen");
    if (!loadingScreen) {
        alert("Critical error: Game failed to initialize. Please check the console for details.");
        console.error("Game initialization errors:", initErrors);
        return;
    }
    
    // Build error message
    let errorHTML = `
        <div style="background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; max-width: 80%; max-height: 80%; overflow-y: auto;">
            <h2 style="color: #ff5555;">Game Initialization Failed</h2>
            <p>The following errors were encountered:</p>
            <ul style="text-align: left; color: #ff9999;">
    `;
    
    initErrors.forEach(err => {
        errorHTML += `<li>${err}</li>`;
    });
    
    errorHTML += `
            </ul>
            <div style="margin-top: 20px;">
                <p>Troubleshooting steps:</p>
                <ol style="text-align: left;">
                    <li>Make sure all game files are present</li>
                    <li>Check that your browser supports HTML5 Canvas</li>
                    <li>Try refreshing the page</li>
                    <li>Check browser console for more details</li>
                </ol>
            </div>
            <button onclick="window.location.reload()" style="background: #4a5d69; border: none; color: white; padding: 10px 20px; margin-top: 20px; cursor: pointer; border-radius: 5px;">Reload Page</button>
            <button onclick="showDebugInfo()" style="background: #6d5c33; border: none; color: white; padding: 10px 20px; margin-top: 20px; cursor: pointer; border-radius: 5px; margin-left: 10px;">Show Debug Info</button>
        </div>
    `;
    
    loadingScreen.innerHTML = errorHTML;
    loadingScreen.style.display = "flex";
    loadingScreen.style.flexDirection = "column";
    loadingScreen.style.alignItems = "center";
    loadingScreen.style.justifyContent = "center";
    
    // Add the debug info function to window
    window.showDebugInfo = function() {
        let debugInfo = "LOADING STATUS LOG:\n\n";
        Object.entries(loadingStatus).forEach(([time, status]) => {
            debugInfo += `${time}: ${status}\n`;
        });
        
        debugInfo += "\n\nERRORS:\n\n";
        initErrors.forEach(err => {
            debugInfo += `- ${err}\n`;
        });
        
        debugInfo += "\n\nBROWSER INFO:\n\n";
        debugInfo += `User Agent: ${navigator.userAgent}\n`;
        debugInfo += `Window Size: ${window.innerWidth} x ${window.innerHeight}\n`;
        debugInfo += `Canvas Support: ${!!document.createElement('canvas').getContext}\n`;
        
        const debugTextarea = document.createElement('textarea');
        debugTextarea.value = debugInfo;
        debugTextarea.style.width = "80%";
        debugTextarea.style.height = "300px";
        debugTextarea.style.marginTop = "20px";
        debugTextarea.style.padding = "10px";
        debugTextarea.style.fontFamily = "monospace";
        
        // Find the debug info container or create one
        let debugContainer = document.getElementById('debugInfoContainer');
        if (!debugContainer) {
            debugContainer = document.createElement('div');
            debugContainer.id = 'debugInfoContainer';
            loadingScreen.querySelector('div').appendChild(debugContainer);
        }
        
        debugContainer.innerHTML = '<h3>Debug Information</h3>';
        debugContainer.appendChild(debugTextarea);
        
        // Add a copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = "Copy to Clipboard";
        copyButton.style.background = "#35424a";
        copyButton.style.border = "none";
        copyButton.style.color = "white";
        copyButton.style.padding = "5px 10px";
        copyButton.style.margin = "10px 0";
        copyButton.style.cursor = "pointer";
        copyButton.style.borderRadius = "5px";
        copyButton.onclick = function() {
            debugTextarea.select();
            document.execCommand('copy');
        };
        
        debugContainer.appendChild(copyButton);
    };
}

// Set up event listeners
function setupEventListeners() {
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Add click listener to canvas
    canvas.addEventListener('click', handleCanvasClick);
    
    // Add window resize listener
    window.addEventListener('resize', handleResize);
    
    // Add mobile controls if we're on a mobile device
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        setupMobileControls();
    }
}

// Handle keyboard down events
function handleKeyDown(e) {
    if (gameState === "error") return; // Don't process input in error state
    
    // Store key state
    keys[e.key] = true;
    
    // Special key handling
    switch(e.key) {
        case "e":
        case "E":
            if (gameState === "gameplay" && !inDialogMode) {
                handleInteraction();
            }
            break;
        case "i":
        case "I":
            if (gameState === "gameplay") {
                toggleInventory();
            }
            break;
        case "Escape":
            handleEscapeKey();
            break;
        case "F12":
        case "F11":
            toggleDebugMode();
            break;
    }
}

// Handle keyboard up events
function handleKeyUp(e) {
    // Reset key state
    keys[e.key] = false;
}

// Handle canvas click event
function handleCanvasClick(e) {
    if (gameState === "error") return; // Don't process input in error state
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Use the existing click handling code
    if (typeof handleClickInGameWorld === 'function') {
        handleClickInGameWorld(clickX, clickY);
    }
}

// Handle window resize
function handleResize() {
    // Make sure the game container is properly centered
    centerGameContainer();
}

// Center the game container in the window
function centerGameContainer() {
    const gameContainer = document.getElementById('game-container');
    // Center it if it exists
    if (gameContainer) {
        gameContainer.style.position = "absolute";
        gameContainer.style.top = "50%";
        gameContainer.style.left = "50%";
        gameContainer.style.transform = "translate(-50%, -50%)";
    }
}

// Handle Escape key
function handleEscapeKey() {
    if (gameState === "error") {
        window.location.reload();
        return;
    }
    
    if (gameState === "working") {
        if (typeof endWork === 'function') {
            endWork(false);
        }
    } else if (gameState === "minigame") {
        gameState = "gameplay";
    } else if (inDialogMode) {
        if (typeof closeDialog === 'function') {
            closeDialog();
        }
    } else if (gameState === "gameplay") {
        togglePauseMenu();
    }
}

// Toggle pause menu
function togglePauseMenu() {
    // This would be implemented if we had a pause menu
    console.log("Pause menu not yet implemented");
}

// Setup debug mode
function setupDebugMode() {
    // Check for debug flag in URL
    if (window.location.hash === '#debug') {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.style.display = 'block';
        }
    }
}

// Toggle debug mode
function toggleDebugMode() {
    const debugPanel = document.getElementById('debugPanel');
    if (!debugPanel) return;
    
    if (debugPanel.style.display === 'none') {
        debugPanel.style.display = 'block';
        window.location.hash = 'debug';
    } else {
        debugPanel.style.display = 'none';
        window.location.hash = '';
    }
}

// Update debug info
function updateDebugInfo() {
    if (window.location.hash === '#debug') {
        const debugFps = document.getElementById('debugFps');
        const debugPos = document.getElementById('debugPos');
        const debugState = document.getElementById('debugState');
        
        if (debugFps && lastTime) {
            debugFps.textContent = Math.round(1 / ((performance.now() - lastTime) / 1000) || 0);
        }
        
        if (debugPos && typeof player !== 'undefined') {
            debugPos.textContent = `${Math.round(player.x)},${Math.round(player.y)}`;
        }
        
        if (debugState) {
            debugState.textContent = gameState;
            // Change color based on state
            debugState.style.color = gameState === 'error' ? '#ff5555' : 
                                     gameState === 'loading' ? '#ffdd99' : 
                                     'white';
        }
    }
}

// Load image assets
function loadImageAssets() {
    return new Promise((resolve, reject) => {
        updateLoadingStatus("Starting image loading process");
        
        // If there's an existing loading function, use it
        if (typeof loadImages === 'function') {
            updateLoadingStatus("Using existing loadImages function");
            
            try {
                const imagePromise = loadImages();
                
                // Check if it returns a promise
                if (imagePromise && typeof imagePromise.then === 'function') {
                    updateLoadingStatus("LoadImages returned a promise");
                    imagePromise.then(() => {
                        updateLoadingStatus("Images loaded successfully via loadImages()");
                        resolve();
                    }).catch(error => {
                        updateLoadingStatus("Error in loadImages promise");
                        reject(error);
                    });
                } else {
                    updateLoadingStatus("LoadImages did not return a promise, assuming synchronous loading");
                    resolve();
                }
            } catch (error) {
                updateLoadingStatus("Exception thrown in loadImages()");
                reject(error);
            }
        } else {
            updateLoadingStatus("No loadImages function found, using alternative approach");
            
            // Try to check if IMAGES object exists
            if (typeof IMAGES !== 'undefined') {
                updateLoadingStatus("IMAGES object found, using it for basic preloading");
                
                // Preload some basic images manually
                let loadedCount = 0;
                let errorCount = 0;
                const imageKeys = Object.keys(IMAGES);
                
                if (imageKeys.length === 0) {
                    updateLoadingStatus("IMAGES object is empty, skipping preloading");
                    resolve();
                    return;
                }
                
                updateLoadingStatus(`Preloading ${imageKeys.length} images`);
                
                imageKeys.forEach(key => {
                    if (typeof IMAGES[key] === 'string' && IMAGES[key].startsWith('data:image')) {
                        // Base64 images don't need preloading
                        loadedCount++;
                        if (loadedCount + errorCount >= imageKeys.length) {
                            updateLoadingStatus("All base64 images loaded");
                            resolve();
                        }
                    } else if (typeof IMAGES[key] === 'string') {
                        const img = new Image();
                        img.onload = function() {
                            loadedCount++;
                            if (loadedCount + errorCount >= imageKeys.length) {
                                updateLoadingStatus("All images preloaded");
                                resolve();
                            }
                        };
                        img.onerror = function() {
                            errorCount++;
                            recordError(`Failed to preload image: ${key}`);
                            if (loadedCount + errorCount >= imageKeys.length) {
                                updateLoadingStatus("Image preloading completed with errors");
                                resolve();
                            }
                        };
                        img.src = IMAGES[key];
                    } else {
                        loadedCount++;
                        if (loadedCount + errorCount >= imageKeys.length) {
                            resolve();
                        }
                    }
                });
            } else {
                updateLoadingStatus("No IMAGES object found, skipping image preloading");
                resolve();
            }
        }
    });
}

// Initialize the game
function initGame() {
    updateLoadingStatus("Initializing game core");
    
    // If the existing game.js file has an initGame function, call it
    if (typeof window.initGame === 'function') {
        try {
            updateLoadingStatus("Calling window.initGame()");
            window.initGame();
            updateLoadingStatus("window.initGame() completed successfully");
        } catch (error) {
            updateLoadingStatus("Error in window.initGame()");
            recordError("Error in game initialization: " + error.message);
            throw error;
        }
    } else {
        updateLoadingStatus("No window.initGame function found, using basic implementation");
        // Otherwise we need to implement a basic game setup here
        setupBasicGame();
    }
    
    // Set game as initialized
    gameInitialized = true;
    updateLoadingStatus("Game initialization completed");
}

// Setup basic game if the complete implementation isn't available
function setupBasicGame() {
    console.log("Setting up basic game implementation...");
    
    // This would implement a very basic game if the full game.js implementation isn't available
    // Just enough to show something on screen
    
    // Draw a message on the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game implementation not found!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
    ctx.fillText('Please make sure game.js is properly loaded.', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    
    // Draw some instructions
    ctx.font = '16px Arial';
    ctx.fillText('Press F11 to toggle debug mode for more information', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    
    // Set up a basic animation
    function basicAnimation() {
        // Simple animation to show the canvas is working
        const time = Date.now() / 1000;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Draw a bouncing circle
        const x = GAME_WIDTH / 2 + Math.sin(time) * 100;
        const y = GAME_HEIGHT / 2 + Math.cos(time * 0.7) * 50;
        
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 153, 0, 0.7)';
        ctx.fill();
        
        // Keep animating
        animationFrameId = requestAnimationFrame(basicAnimation);
    }
    
    // Start the basic animation
    basicAnimation();
}

// Initialize when the window loads
window.addEventListener("load", function() {
    initializeGame();
}); 