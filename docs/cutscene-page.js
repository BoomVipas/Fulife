// Cutscene state management
let currentCutscene = 0;
let bgMusic = null;
let musicVolume = 0.5;
let cutsceneCount = 5; // Total number of cutscenes

// Initialize the cutscene container
function initCutsceneScreen() {
    console.log("Initializing cutscene screen...");
    
    // Try to get volume from localStorage
    try {
        const savedVolume = localStorage.getItem("musicVolume");
        if (savedVolume !== null) {
            musicVolume = parseFloat(savedVolume);
        }
    } catch (e) {
        console.log("Could not load saved volume:", e);
    }
    
    // Create background music
    try {
        bgMusic = new Audio();
        bgMusic.src = "assets/cutscene-music.mp3"; // You'll need to add a music file
        bgMusic.loop = true;
        bgMusic.volume = musicVolume;
        bgMusic.play().catch(e => console.log("Audio autoplay prevented: ", e));
    } catch (e) {
        console.log("Audio not supported or file not found: ", e);
    }
    
    // Start cutscenes
    startCutscenes();
}

// Function to handle cutscenes
function startCutscenes() {
    currentCutscene = 0;
    showNextCutscene();
}

// Load cutscene image
function loadCutsceneImage(imageKey) {
    const cutsceneImage = document.getElementById("cutsceneImage");
    
    // Show loading indicator
    cutsceneImage.innerHTML = "Loading image...";
    
    try {
        if (CUTSCENE_IMAGES && CUTSCENE_IMAGES[imageKey]) {
            const img = document.createElement('img');
            img.onload = function() {
                cutsceneImage.innerHTML = '';
                cutsceneImage.appendChild(img);
            };
            img.onerror = function() {
                cutsceneImage.innerHTML = "[Image could not be loaded]";
            };
            img.src = CUTSCENE_IMAGES[imageKey];
        } else {
            cutsceneImage.innerHTML = `[Cutscene Image: ${imageKey}]`;
        }
    } catch (e) {
        console.error("Error loading cutscene image:", e);
        cutsceneImage.innerHTML = "[Image Error]";
    }
}

// Function to show next cutscene
function showNextCutscene() {
    const cutsceneContainer = document.getElementById("cutsceneContainer");
    const cutsceneText = document.getElementById("cutsceneText");
    const cutsceneImage = document.getElementById("cutsceneImage");
    
    // Show loading screen between cutscenes
    document.getElementById("loadingScreen").style.display = "flex";
    
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        
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
                transitionToGameplay();
                return;
        }
        
        currentCutscene++;
    }, 600);
}

// Function to transition to gameplay
function transitionToGameplay() {
    console.log("Transitioning to gameplay...");
    
    // Show loading screen
    document.getElementById("loadingScreen").style.display = "flex";
    document.getElementById("loadingScreen").querySelector(".loading-text").textContent = "Loading Game...";
    
    // Stop music
    if (bgMusic) {
        bgMusic.pause();
        bgMusic = null;
    }
    
    // Transition to game page
    setTimeout(() => {
        window.location.href = "game-page.html";
    }, 1000);
}

// Event listeners for keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        showNextCutscene();
    } else if (e.key === 'Escape') {
        transitionToGameplay();
    }
});

// Initialize when the window loads
window.addEventListener("load", function() {
    initCutsceneScreen();
}); 