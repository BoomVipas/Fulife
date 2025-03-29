// Game state management
let gameState = "mainMenu"; // mainMenu, customization, cutscene, gameplay
let currentCutscene = 0;
let bgMusic = null;
let musicVolume = 0.5;
let logicGateMinigame = null;

// Main function to initialize the start screen
function initStartScreen() {
    // Create background music
    try {
        bgMusic = new Audio();
        bgMusic.src = "bgmusic.mp3"; // You'll need to add a music file
        bgMusic.loop = true;
        bgMusic.volume = musicVolume;
        bgMusic.play().catch(e => console.log("Audio autoplay prevented: ", e));
    } catch (e) {
        console.log("Audio not supported or file not found: ", e);
    }

    // Draw the main menu
    drawMainMenu();

    // Add event listeners for buttons
    document.getElementById("newGameBtn").addEventListener("click", startNewGame);
    document.getElementById("continueBtn").addEventListener("click", continueGame);
    document.getElementById("settingsBtn").addEventListener("click", openSettings);
    document.getElementById("aboutBtn").addEventListener("click", openAbout);
}

// Function to draw the main menu
function drawMainMenu() {
    const mainMenuContainer = document.getElementById("mainMenuContainer");
    mainMenuContainer.style.display = "flex";
    
    // Hide other containers
    document.getElementById("customizationContainer").style.display = "none";
    document.getElementById("cutsceneContainer").style.display = "none";
    document.getElementById("settingsContainer").style.display = "none";
    document.getElementById("aboutContainer").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    
    gameState = "mainMenu";
}

// Function to start a new game (show customization)
function startNewGame() {
    const mainMenuContainer = document.getElementById("mainMenuContainer");
    const customizationContainer = document.getElementById("customizationContainer");
    
    mainMenuContainer.style.display = "none";
    customizationContainer.style.display = "flex";
    
    gameState = "customization";
}

// Function for the continue button (disabled initially)
function continueGame() {
    // This would be enabled if a save file is present
    console.log("Continue game functionality not yet implemented");
}

// Function to show settings panel
function openSettings() {
    document.getElementById("mainMenuContainer").style.display = "none";
    document.getElementById("settingsContainer").style.display = "flex";
}

// Function to show about panel
function openAbout() {
    document.getElementById("mainMenuContainer").style.display = "none";
    document.getElementById("aboutContainer").style.display = "flex";
}

// Function to adjust background music volume
function adjustVolume(value) {
    musicVolume = value;
    if (bgMusic) {
        bgMusic.volume = musicVolume;
    }
}

// Function to return to main menu from settings or about
function backToMainMenu() {
    drawMainMenu();
}

// Function to start the game after customization
function startGameFromCustomization() {
    document.getElementById("customizationContainer").style.display = "none";
    document.getElementById("cutsceneContainer").style.display = "flex";
    
    // Save player name if entered
    const playerNameInput = document.getElementById("playerName");
    if (playerNameInput && playerNameInput.value) {
        localStorage.setItem("playerName", playerNameInput.value);
    } else {
        localStorage.setItem("playerName", "Player");
    }
    
    // Start the cutscene sequence
    startCutscenes();
    
    gameState = "cutscene";
}

// Function to handle cutscenes
function startCutscenes() {
    currentCutscene = 0;
    showNextCutscene();
}

// Function to show next cutscene
function showNextCutscene() {
    const cutsceneContainer = document.getElementById("cutsceneContainer");
    const cutsceneText = document.getElementById("cutsceneText");
    const cutsceneImage = document.getElementById("cutsceneImage");
    
    switch(currentCutscene) {
        case 0:
            // First cutscene - Uncle reflecting on his life
            cutsceneText.innerHTML = "An elderly man sits quietly, reflecting on his life with regret...<br><br>\"If only I had taken more chances when I was young. I always stayed in my comfort zone, never trying new things. If I could be young again, I would do everything differently.\"";
            loadCutsceneImage('cutscene1');
            break;
        case 1:
            // Second cutscene - Fairy appears
            cutsceneText.innerHTML = "Suddenly, a bright light appears in the room. A fairy materializes before the old man's astonished eyes...<br><br>\"I have heard your wish. I can give you a second chance at life. Use it wisely.\"";
            loadCutsceneImage('cutscene2');
            break;
        case 2:
            // Third cutscene - Uncle becomes young
            cutsceneText.innerHTML = "In a flash of light, the old man feels energy surging through his body. He watches in amazement as his wrinkled hands become smooth and strong again. He is young once more!<br><br>\"This time, I will make the most of every opportunity. I will live life to the fullest!\"";
            loadCutsceneImage('cutscene3');
            break;
        case 3:
            // Final narrative before gameplay
            cutsceneText.innerHTML = "Years pass as you try many different paths and adventures. Currently, you've set your sights on engineering. After completing numerous engineering challenges, you've reached Level 15 out of 25 in your Engineering career path.<br><br>Today might bring new opportunities...";
            loadCutsceneImage('cutscene4');
            break;
        case 4:
            // Transition to gameplay
            startGameplay();
            return;
    }
    
    currentCutscene++;
}

// Function to start the actual gameplay
function startGameplay() {
    console.log("Starting gameplay...");
    
    // Hide cutscene container
    const cutsceneContainer = document.getElementById("cutsceneContainer");
    if (cutsceneContainer) {
        cutsceneContainer.style.display = "none";
    }
    
    // Show and position game container
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
        // Make sure it's visible before anything else
        gameContainer.style.display = "block";
        
        // Ensure game container is properly positioned
        gameContainer.style.position = "absolute";
        gameContainer.style.top = "50%";
        gameContainer.style.left = "50%";
        gameContainer.style.transform = "translate(-50%, -50%)";
        gameContainer.style.margin = "0 auto";
        gameContainer.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
        gameContainer.style.zIndex = "10";
    } else {
        console.error("Game container not found!");
        return; // Exit if we can't find the game container
    }
    
    // Make sure canvas is visible and properly sized
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        canvas.style.display = "block";
        canvas.width = 800;
        canvas.height = 600;
        
        // Force a black background to avoid white flash
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        console.error("Canvas element not found!");
        return; // Exit if we can't find the canvas
    }
    
    // Switch to gameplay state
    gameState = "gameplay";
    
    // Add a small delay before initializing the game to ensure DOM is ready
    setTimeout(() => {
        console.log("Delayed initialization starting...");
        
        try {
            // Reset player position flag to ensure they appear in center after cutscene
            if (typeof player !== 'undefined') {
                player.hasBeenPositioned = false;
            }
            
            // Initialize the game
            if (typeof initGame === 'function') {
                console.log("Calling initGame function");
                initGame(); // This calls the game.js initGame function
                
                // Ensure the game loop is started
                if (typeof gameLoop === 'function' && !gameInitialized) {
                    console.log("Starting game loop");
                    requestAnimationFrame(gameLoop);
                }
                
                // Create the Tech CEO NPC encounter after a delay
                // Longer delay to give time to explore and for the game to stabilize
                setTimeout(createTechCEOEncounter, 8000);
            } else {
                console.error("initGame function not found!");
                alert("Game initialization failed. Please refresh the page.");
            }
        } catch (error) {
            console.error("Error during game initialization:", error);
            alert("Game initialization error: " + error.message + ". Please refresh the page.");
        }
    }, 500); // Increased delay to ensure DOM is ready
}

// Function to create the Tech CEO NPC encounter
function createTechCEOEncounter() {
    // This will be called at an appropriate time in the gameplay
    // For now, we'll just demonstrate the concept
    
    setTimeout(() => {
        // Create a dialog for the Tech CEO NPC
        const playerName = localStorage.getItem("playerName") || "Player";
        const dialogText = `HEY ${playerName}, Jonas recommended you to me. Can you help me fix the GPU?\n\nMy friend will tell you about the basics of "logic design" using AND, OR gates.`;
        
        // Show dialog (using existing dialog system)
        const techCEONPC = {
            id: "techCEO",
            name: "Tech CEO",
            dialogues: [
                {
                    text: dialogText,
                    options: [
                        { text: "I'd be happy to help!", nextId: 1 },
                        { text: "What's in it for me?", nextId: 1 }
                    ]
                },
                {
                    text: "Great! Let me show you the problem...",
                    effect: () => {
                        // This would start the logic gate minigame
                        startLogicGateMinigame();
                    }
                }
            ],
            currentDialogueId: 0
        };
        
        // Show dialog with the Tech CEO
        showDialog(techCEONPC);
    }, 5000); // Show this after 5 seconds of gameplay
}

// Function to start the logic gate minigame
function startLogicGateMinigame() {
    // Create a minigame container
    const minigameContainer = document.createElement("div");
    minigameContainer.id = "logicGateMinigame";
    minigameContainer.style.position = "absolute";
    minigameContainer.style.top = "50px";
    minigameContainer.style.left = "50px";
    minigameContainer.style.width = "700px";
    minigameContainer.style.height = "500px";
    minigameContainer.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    minigameContainer.style.color = "white";
    minigameContainer.style.padding = "20px";
    minigameContainer.style.borderRadius = "10px";
    minigameContainer.style.zIndex = "100";
    
    minigameContainer.innerHTML = `
        <h2>Logic Gate Challenge</h2>
        <p>Make the output 1 from the circuit using both AND & OR gates.</p>
        <div style="width: 100%; height: 400px; margin: 15px 0;">
            <canvas id="logicGateCanvas" width="660" height="400" style="border: 1px solid #555;"></canvas>
        </div>
        <button id="closeMinigameBtn" style="margin-top: 10px; padding: 5px 10px;">Close</button>
    `;
    
    document.body.appendChild(minigameContainer);
    
    // Add event listener to close button
    document.getElementById("closeMinigameBtn").addEventListener("click", () => {
        document.body.removeChild(minigameContainer);
    });
    
    // Initialize the minigame
    setTimeout(() => {
        logicGateMinigame = initLogicGateMinigame("logicGateCanvas", onLogicGateMinigameComplete);
    }, 100);
}

// Callback for when the logic gate minigame is completed
function onLogicGateMinigameComplete() {
    // Update the player's engineering skill
    updateEngineeringSkill(2); // +2 to engineering skill
    
    // Close the minigame
    const minigameContainer = document.getElementById("logicGateMinigame");
    if (minigameContainer) {
        document.body.removeChild(minigameContainer);
    }
    
    // Show a success dialog
    const successDialog = {
        id: "techCEOSuccess",
        name: "Tech CEO",
        dialogues: [
            {
                text: "Excellent work! You've fixed the GPU problem with your logical circuit design. I'm very impressed with your skills.",
                options: [
                    { text: "It was an interesting challenge!", nextId: 1 }
                ]
            },
            {
                text: "As a reward, I'd like to offer you an opportunity to work on more advanced projects. This will really help develop your engineering career!",
                effect: () => {
                    // Further career advancement
                    updateEngineeringSkill(3); // +3 more to engineering skill
                }
            }
        ],
        currentDialogueId: 0
    };
    
    // Show success dialog
    showDialog(successDialog);
}

// Function to update the player's engineering skill
function updateEngineeringSkill(amount) {
    // Get current engineering level
    const engineeringStatElement = document.getElementById("stat-engineering");
    const currentLevelText = engineeringStatElement.textContent;
    const [current, max] = currentLevelText.split('/').map(n => parseInt(n.trim()));
    
    // Calculate new level, ensuring it doesn't exceed the maximum
    const newLevel = Math.min(current + amount, max);
    
    // Update the display
    engineeringStatElement.textContent = `${newLevel}/${max}`;
    
    // Show a floating notification
    showFloatingText(`Engineering +${amount}`, 'green');
    
    // Check if the player has reached the maximum level
    if (newLevel >= max) {
        setTimeout(() => {
            alert("Congratulations! You've reached the maximum level in Engineering!");
        }, 1000);
    }
}

// Function to show floating text (notification)
function showFloatingText(text, color) {
    const notification = document.createElement("div");
    notification.style.position = "absolute";
    notification.style.top = "200px";
    notification.style.left = "400px";
    notification.style.color = color || "white";
    notification.style.fontSize = "24px";
    notification.style.fontWeight = "bold";
    notification.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.7)";
    notification.style.zIndex = "200";
    notification.style.transition = "opacity 2s, transform 2s";
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    // Animate and remove
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-50px)";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }, 500);
}

// Initialize when the window loads
window.addEventListener("load", function() {
    if (gameState === "mainMenu") {
        initStartScreen();
    }
}); 