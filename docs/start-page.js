// Game state management
let gameState = "mainMenu"; // mainMenu, customization, settings, about
let bgMusic = null;
let musicVolume = 0.5;

// Main function to initialize the start screen
function initStartScreen() {
    // Create background music
    try {
        bgMusic = new Audio();
        bgMusic.src = "assets/bgmusic.mp3"; // You'll need to add a music file
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
    
    // Add event listeners for character customization
    setupCustomizationListeners();
}

// Function to draw the main menu
function drawMainMenu() {
    const mainMenuContainer = document.getElementById("mainMenuContainer");
    mainMenuContainer.style.display = "flex";
    
    // Hide other containers
    document.getElementById("customizationContainer").style.display = "none";
    document.getElementById("settingsContainer").style.display = "none";
    document.getElementById("aboutContainer").style.display = "none";
    
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
    gameState = "settings";
}

// Function to show about panel
function openAbout() {
    document.getElementById("mainMenuContainer").style.display = "none";
    document.getElementById("aboutContainer").style.display = "flex";
    gameState = "about";
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

// Set up customization listeners
function setupCustomizationListeners() {
    // Hair color selection
    const hairColors = document.querySelectorAll('.option-group:nth-child(1) .color-option');
    hairColors.forEach(color => {
        color.addEventListener('click', function() {
            hairColors.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Shirt color selection
    const shirtColors = document.querySelectorAll('.option-group:nth-child(2) .color-option');
    shirtColors.forEach(color => {
        color.addEventListener('click', function() {
            shirtColors.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Pants color selection
    const pantsColors = document.querySelectorAll('.option-group:nth-child(3) .color-option');
    pantsColors.forEach(color => {
        color.addEventListener('click', function() {
            pantsColors.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Add event listener for start button (as a backup to onclick)
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        console.log("Adding event listener to start button");
        startButton.addEventListener('click', function(e) {
            console.log("Start button clicked via event listener");
            startCutscene();
        });
    } else {
        console.warn("Start button not found during initialization");
    }
}

// Function to start the game after customization
function startCutscene() {
    try {
        console.log("Start button clicked - entering startCutscene function");
        
        // Save player name if entered
        const playerNameInput = document.getElementById("playerName");
        let playerName = "Player"; // Default name
        
        if (playerNameInput && playerNameInput.value.trim()) {
            playerName = playerNameInput.value.trim();
            console.log("Player name set to:", playerName);
        } else {
            console.log("Using default player name");
        }
        
        localStorage.setItem("playerName", playerName);
        
        // Save customization options - with error handling
        try {
            const hairStyle = document.getElementById("hairSlider").value;
            const hairColorElement = document.querySelector('.option-group:nth-child(1) .color-option.selected');
            const hairColor = hairColorElement ? hairColorElement.style.backgroundColor : "#000000";
            
            const shirtStyle = document.getElementById("shirtSlider").value;
            const shirtColorElement = document.querySelector('.option-group:nth-child(2) .color-option.selected');
            const shirtColor = shirtColorElement ? shirtColorElement.style.backgroundColor : "#0000FF";
            
            const pantsStyle = document.getElementById("pantsSlider").value;
            const pantsColorElement = document.querySelector('.option-group:nth-child(3) .color-option.selected');
            const pantsColor = pantsColorElement ? pantsColorElement.style.backgroundColor : "#000000";
            
            localStorage.setItem("playerHairStyle", hairStyle);
            localStorage.setItem("playerHairColor", hairColor);
            localStorage.setItem("playerShirtStyle", shirtStyle);
            localStorage.setItem("playerShirtColor", shirtColor);
            localStorage.setItem("playerPantsStyle", pantsStyle);
            localStorage.setItem("playerPantsColor", pantsColor);
            
            console.log("Saved player customization data to localStorage");
        } catch (error) {
            console.error("Error saving customization options:", error);
            // Continue anyway - we'll use defaults if needed
        }
        
        // Redirect to cutscene page with error handling
        console.log("Redirecting to cutscene-page.html");
        
        // Use a small timeout to ensure localStorage is saved before navigation
        setTimeout(function() {
            window.location.href = "cutscene-page.html";
        }, 100);
    } catch (error) {
        console.error("Critical error in startCutscene function:", error);
        alert("An error occurred when starting the game. Please check the console for details.");
        
        // Try direct redirect as fallback
        setTimeout(function() {
            window.location.href = "cutscene-page.html";
        }, 1000);
    }
}

// Initialize when the window loads
window.addEventListener("load", function() {
    initStartScreen();
    
    // Add a direct event listener to the start button
    document.getElementById("startGameButton")?.addEventListener("click", function() {
        console.log("Start button clicked via ID-based event listener");
        startCutscene();
    });
}); 