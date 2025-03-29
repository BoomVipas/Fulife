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