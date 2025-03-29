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
}

// Function to start the game after customization
function startCutscene() {
    // Save player name if entered
    const playerNameInput = document.getElementById("playerName");
    if (playerNameInput && playerNameInput.value) {
        localStorage.setItem("playerName", playerNameInput.value);
    } else {
        localStorage.setItem("playerName", "Player");
    }
    
    // Save customization options
    const hairStyle = document.getElementById("hairSlider").value;
    const hairColor = document.querySelector('.option-group:nth-child(1) .color-option.selected').style.backgroundColor;
    const shirtStyle = document.getElementById("shirtSlider").value;
    const shirtColor = document.querySelector('.option-group:nth-child(2) .color-option.selected').style.backgroundColor;
    const pantsStyle = document.getElementById("pantsSlider").value;
    const pantsColor = document.querySelector('.option-group:nth-child(3) .color-option.selected').style.backgroundColor;
    
    localStorage.setItem("playerHairStyle", hairStyle);
    localStorage.setItem("playerHairColor", hairColor);
    localStorage.setItem("playerShirtStyle", shirtStyle);
    localStorage.setItem("playerShirtColor", shirtColor);
    localStorage.setItem("playerPantsStyle", pantsStyle);
    localStorage.setItem("playerPantsColor", pantsColor);
    
    // Redirect to cutscene page
    window.location.href = "cutscene-page.html";
}

// Initialize when the window loads
window.addEventListener("load", function() {
    initStartScreen();
}); 