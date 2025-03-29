// Cutscene Images and Functions
// This file provides basic cutscene functionality

// Cutscene image sources
window.CUTSCENE_IMAGES = {
    intro1: 'assets/cutscenes/intro1.png',
    intro2: 'assets/cutscenes/intro2.png',
    work1: 'assets/cutscenes/work1.png',
    ending: 'assets/cutscenes/ending.png'
};

// Cutscene text data
window.CUTSCENE_DATA = {
    intro: [
        { image: 'intro1', text: "Welcome to FULIFE, a game about balancing education, career, and happiness." },
        { image: 'intro2', text: "Your goal is to navigate through life challenges and build a successful future." }
    ],
    work: [
        { image: 'work1', text: "You've started working at the tech company. Your skills will improve over time." }
    ],
    ending: [
        { image: 'ending', text: "Congratulations! You've achieved your career goals and found happiness." }
    ]
};

// Displays a cutscene
function showCutscene(cutsceneId) {
    if (!CUTSCENE_DATA[cutsceneId]) {
        console.error("Cutscene not found:", cutsceneId);
        return;
    }
    
    console.log("Starting cutscene:", cutsceneId);
    // In a real implementation, this would display the cutscene
    return new Promise(resolve => {
        // Simulate cutscene display
        setTimeout(() => {
            console.log("Cutscene complete");
            resolve();
        }, 1000);
    });
}

// Loads cutscene images
function preloadCutsceneImages() {
    return new Promise(resolve => {
        const totalImages = Object.keys(CUTSCENE_IMAGES).length;
        let loadedCount = 0;
        
        if (totalImages === 0) {
            console.log("No cutscene images to preload");
            resolve();
            return;
        }
        
        console.log("Preloading cutscene images...");
        
        for (const key in CUTSCENE_IMAGES) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount >= totalImages) {
                    console.log("All cutscene images loaded");
                    resolve();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load cutscene image: ${key}`);
                loadedCount++;
                if (loadedCount >= totalImages) {
                    console.log("Cutscene image loading complete with errors");
                    resolve();
                }
            };
            img.src = CUTSCENE_IMAGES[key];
        }
    });
}

// Simple placeholder images for cutscenes
// Replace these with actual images later

const CUTSCENE_IMAGES = {
    // Simple colored rectangles with text as placeholders
    // These will be used in the cutscenes until replaced with real images
    cutscene1: createPlaceholderImage("Elderly man reflecting on life", "#2d3b55"),
    cutscene2: createPlaceholderImage("Fairy appears with bright light", "#7b68ee"),
    cutscene3: createPlaceholderImage("Man becomes young again", "#4ca64c"),
    cutscene4: createPlaceholderImage("Engineering career progress", "#cd853f")
};

// Function to create a simple placeholder image as a data URL
function createPlaceholderImage(text, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = bgColor || '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText("(Placeholder Image)", canvas.width / 2, canvas.height / 2 + 40);
    
    return canvas.toDataURL();
}

// Update the cutscene image display when requested
function loadCutsceneImage(sceneName) {
    const imageElement = document.getElementById('cutsceneImage');
    if (imageElement && CUTSCENE_IMAGES[sceneName]) {
        imageElement.src = CUTSCENE_IMAGES[sceneName];
    }
}

// Make functions available globally
window.CUTSCENE_IMAGES = CUTSCENE_IMAGES;
window.loadCutsceneImage = loadCutsceneImage; 