// Test initialization file for FULIFE
// This file can be loaded in game-page.html to test initialization and identify issues

// Store original functions to restore them later
let originalInitGame = window.initGame;
let originalLoadImages = window.loadImages;

// Wrap initGame to add diagnostic information
window.initGame = function() {
    console.log("%c[TEST] initGame called", "color: #4CAF50; font-weight: bold");
    
    try {
        // Check for required elements
        const diagnosticResults = runDiagnostics();
        if (diagnosticResults.length > 0) {
            showDiagnosticResults(diagnosticResults);
            return; // Stop initialization if there are critical issues
        }
        
        // Try to call the original initGame
        if (typeof originalInitGame === 'function') {
            console.log("%c[TEST] Calling original initGame", "color: #4CAF50");
            try {
                originalInitGame();
                console.log("%c[TEST] Original initGame completed successfully", "color: #4CAF50");
            } catch (error) {
                console.error("[TEST] Error in original initGame:", error);
                showError("Error in game initialization", error);
            }
        } else {
            console.warn("[TEST] No original initGame function found");
            // Create a basic game initialization
            console.log("[TEST] Using fallback initialization");
            basicInitGame();
        }
    } catch (error) {
        console.error("[TEST] Critical initialization error:", error);
        showError("Critical initialization error", error);
    }
};

// Wrap loadImages to add diagnostic information
window.loadImages = function() {
    console.log("%c[TEST] loadImages called", "color: #2196F3; font-weight: bold");
    
    return new Promise((resolve, reject) => {
        try {
            // Check if IMAGES object exists
            if (typeof IMAGES === 'undefined') {
                console.warn("[TEST] IMAGES object not found");
                
                // If original loadImages exists, try to call it
                if (typeof originalLoadImages === 'function') {
                    console.log("[TEST] Trying original loadImages");
                    originalLoadImages()
                        .then(resolve)
                        .catch(err => {
                            console.error("[TEST] Original loadImages failed:", err);
                            reject(err);
                        });
                } else {
                    // Create a basic IMAGES object
                    console.log("[TEST] Creating dummy IMAGES object");
                    window.IMAGES = {
                        player: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAKklEQVR42u3NQQ0AAAgDMeDf9IZwJxKyXdJMAAAAAAAAAAAAAAAAPgMBlQABvusoGwAAAABJRU5ErkJggg=="
                    };
                    resolve();
                }
            } else {
                console.log("[TEST] IMAGES object found with", Object.keys(IMAGES).length, "entries");
                
                // If original loadImages exists, call it
                if (typeof originalLoadImages === 'function') {
                    console.log("[TEST] Calling original loadImages");
                    originalLoadImages()
                        .then(resolve)
                        .catch(err => {
                            console.error("[TEST] Original loadImages failed:", err);
                            reject(err);
                        });
                } else {
                    // Just resolve immediately
                    console.log("[TEST] No original loadImages, resolving immediately");
                    resolve();
                }
            }
        } catch (error) {
            console.error("[TEST] Error in loadImages:", error);
            reject(error);
        }
    });
};

// Run diagnostics to identify issues
function runDiagnostics() {
    console.log("%c[TEST] Running diagnostics", "color: #FF9800; font-weight: bold");
    
    const issues = [];
    
    // Check if canvas exists
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        issues.push({
            severity: "critical",
            message: "Game canvas not found",
            details: "The HTML element with id 'gameCanvas' could not be found. This is required for the game to run."
        });
    } else {
        console.log("[TEST] Canvas found");
        
        // Check if we can get context
        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                issues.push({
                    severity: "critical",
                    message: "Could not get 2D context from canvas",
                    details: "The browser was unable to create a 2D drawing context. This may indicate that your browser does not support HTML5 Canvas."
                });
            } else {
                console.log("[TEST] Canvas context obtained successfully");
            }
        } catch (error) {
            issues.push({
                severity: "critical",
                message: "Error getting canvas context",
                details: error.message
            });
        }
    }
    
    // Check if required scripts are loaded
    const requiredScripts = [
        { name: "images.js", check: () => typeof IMAGES !== 'undefined' },
        { name: "game.js", check: () => typeof originalInitGame === 'function' }
    ];
    
    for (const script of requiredScripts) {
        const isLoaded = script.check();
        console.log(`[TEST] ${script.name} is ${isLoaded ? 'loaded' : 'not loaded'}`);
        
        if (!isLoaded) {
            issues.push({
                severity: "warning",
                message: `Required script ${script.name} may not be loaded`,
                details: `The ${script.name} script appears to be missing or not properly loaded. This may cause the game to malfunction.`
            });
        }
    }
    
    // Check for loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) {
        issues.push({
            severity: "warning",
            message: "Loading screen not found",
            details: "The HTML element with id 'loadingScreen' could not be found. This may cause issues with game initialization."
        });
    } else {
        console.log("[TEST] Loading screen found");
    }
    
    // Check browser compatibility
    const isModernBrowser = typeof requestAnimationFrame !== 'undefined' && 
                           typeof localStorage !== 'undefined';
    
    if (!isModernBrowser) {
        issues.push({
            severity: "warning",
            message: "Browser compatibility issues detected",
            details: "Your browser may not support all features required by the game. Consider updating your browser."
        });
    } else {
        console.log("[TEST] Browser compatibility check passed");
    }
    
    console.log(`[TEST] Diagnostics complete, found ${issues.length} issues`);
    return issues;
}

// Show diagnostic results
function showDiagnosticResults(issues) {
    console.log("%c[TEST] Showing diagnostic results", "color: #FF9800");
    
    // Get loading screen or create one
    let diagnosticScreen = document.getElementById('loadingScreen');
    
    if (!diagnosticScreen) {
        diagnosticScreen = document.createElement('div');
        diagnosticScreen.id = 'diagnosticScreen';
        diagnosticScreen.style.position = 'fixed';
        diagnosticScreen.style.top = '0';
        diagnosticScreen.style.left = '0';
        diagnosticScreen.style.width = '100%';
        diagnosticScreen.style.height = '100%';
        diagnosticScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        diagnosticScreen.style.display = 'flex';
        diagnosticScreen.style.flexDirection = 'column';
        diagnosticScreen.style.alignItems = 'center';
        diagnosticScreen.style.justifyContent = 'center';
        diagnosticScreen.style.color = 'white';
        diagnosticScreen.style.fontFamily = 'Arial, sans-serif';
        diagnosticScreen.style.zIndex = '1000';
        
        document.body.appendChild(diagnosticScreen);
    }
    
    // Clear existing content
    diagnosticScreen.innerHTML = '';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Game Initialization Diagnostic';
    title.style.color = '#FF9800';
    diagnosticScreen.appendChild(title);
    
    // Add issues
    const issueList = document.createElement('div');
    issueList.style.width = '80%';
    issueList.style.maxWidth = '800px';
    issueList.style.maxHeight = '60%';
    issueList.style.overflowY = 'auto';
    issueList.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    issueList.style.borderRadius = '10px';
    issueList.style.padding = '20px';
    issueList.style.marginTop = '20px';
    
    // Count critical issues
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    
    if (issues.length === 0) {
        issueList.innerHTML = '<p style="color: #4CAF50;">No issues detected!</p>';
    } else {
        const issueTitle = document.createElement('h3');
        issueTitle.textContent = `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} (${criticalIssues} critical)`;
        issueTitle.style.color = criticalIssues > 0 ? '#F44336' : '#FF9800';
        issueTitle.style.marginTop = '0';
        issueList.appendChild(issueTitle);
        
        issues.forEach((issue, index) => {
            const issueItem = document.createElement('div');
            issueItem.style.marginBottom = '15px';
            issueItem.style.borderLeft = `4px solid ${issue.severity === 'critical' ? '#F44336' : '#FF9800'}`;
            issueItem.style.paddingLeft = '10px';
            
            const issueName = document.createElement('h4');
            issueName.textContent = `${index + 1}. ${issue.message}`;
            issueName.style.margin = '5px 0';
            issueName.style.color = issue.severity === 'critical' ? '#F44336' : '#FF9800';
            
            const issueDetails = document.createElement('p');
            issueDetails.textContent = issue.details;
            issueDetails.style.margin = '5px 0';
            issueDetails.style.color = '#CCC';
            
            issueItem.appendChild(issueName);
            issueItem.appendChild(issueDetails);
            issueList.appendChild(issueItem);
        });
    }
    
    diagnosticScreen.appendChild(issueList);
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload Page';
    reloadButton.style.padding = '10px 20px';
    reloadButton.style.backgroundColor = '#2196F3';
    reloadButton.style.color = 'white';
    reloadButton.style.border = 'none';
    reloadButton.style.borderRadius = '5px';
    reloadButton.style.cursor = 'pointer';
    reloadButton.onclick = () => window.location.reload();
    
    const continueButton = document.createElement('button');
    continueButton.textContent = criticalIssues > 0 ? 'Try Anyway' : 'Continue';
    continueButton.style.padding = '10px 20px';
    continueButton.style.backgroundColor = criticalIssues > 0 ? '#F44336' : '#4CAF50';
    continueButton.style.color = 'white';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '5px';
    continueButton.style.cursor = 'pointer';
    continueButton.onclick = () => {
        diagnosticScreen.style.display = 'none';
        basicInitGame();
    };
    
    buttonContainer.appendChild(reloadButton);
    buttonContainer.appendChild(continueButton);
    
    diagnosticScreen.appendChild(buttonContainer);
    
    // Show diagnostic screen
    diagnosticScreen.style.display = 'flex';
}

// Show error message
function showError(title, error) {
    console.error("[TEST] Showing error:", title, error);
    
    // Get or create error container
    let errorScreen = document.getElementById('errorScreen');
    
    if (!errorScreen) {
        errorScreen = document.createElement('div');
        errorScreen.id = 'errorScreen';
        errorScreen.style.position = 'fixed';
        errorScreen.style.top = '0';
        errorScreen.style.left = '0';
        errorScreen.style.width = '100%';
        errorScreen.style.height = '100%';
        errorScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        errorScreen.style.display = 'flex';
        errorScreen.style.flexDirection = 'column';
        errorScreen.style.alignItems = 'center';
        errorScreen.style.justifyContent = 'center';
        errorScreen.style.color = 'white';
        errorScreen.style.fontFamily = 'Arial, sans-serif';
        errorScreen.style.zIndex = '1000';
        
        document.body.appendChild(errorScreen);
    }
    
    // Clear existing content
    errorScreen.innerHTML = '';
    
    // Add title
    const errorTitle = document.createElement('h2');
    errorTitle.textContent = title;
    errorTitle.style.color = '#F44336';
    errorScreen.appendChild(errorTitle);
    
    // Add error message
    const errorMessage = document.createElement('div');
    errorMessage.style.width = '80%';
    errorMessage.style.maxWidth = '800px';
    errorMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    errorMessage.style.borderRadius = '10px';
    errorMessage.style.padding = '20px';
    errorMessage.style.marginTop = '20px';
    errorMessage.style.fontFamily = 'monospace';
    errorMessage.style.whiteSpace = 'pre-wrap';
    errorMessage.style.maxHeight = '60%';
    errorMessage.style.overflowY = 'auto';
    
    // Format error message
    if (error instanceof Error) {
        errorMessage.innerHTML = `<span style="color: #F44336;">Error: ${error.message}</span>\n\n`;
        if (error.stack) {
            errorMessage.innerHTML += `<span style="color: #BBBBBB;">${error.stack.replace(error.message, '').trim()}</span>`;
        }
    } else {
        errorMessage.textContent = String(error);
    }
    
    errorScreen.appendChild(errorMessage);
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload Page';
    reloadButton.style.padding = '10px 20px';
    reloadButton.style.backgroundColor = '#2196F3';
    reloadButton.style.color = 'white';
    reloadButton.style.border = 'none';
    reloadButton.style.borderRadius = '5px';
    reloadButton.style.cursor = 'pointer';
    reloadButton.onclick = () => window.location.reload();
    
    const continueButton = document.createElement('button');
    continueButton.textContent = 'Try Anyway';
    continueButton.style.padding = '10px 20px';
    continueButton.style.backgroundColor = '#F44336';
    continueButton.style.color = 'white';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '5px';
    continueButton.style.cursor = 'pointer';
    continueButton.onclick = () => {
        errorScreen.style.display = 'none';
        basicInitGame();
    };
    
    buttonContainer.appendChild(reloadButton);
    buttonContainer.appendChild(continueButton);
    
    errorScreen.appendChild(buttonContainer);
    
    // Show error screen
    errorScreen.style.display = 'flex';
}

// Basic game initialization as fallback
function basicInitGame() {
    console.log("%c[TEST] Running basic game initialization", "color: #4CAF50");
    
    try {
        // Get canvas and context
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error("Canvas element not found");
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Could not get 2D context from canvas");
        }
        
        // Store in window object to avoid conflicts
        window.canvas = canvas;
        window.ctx = ctx;
        
        // Hide loading screen if it exists
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Create dummy player using global variable
        window.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 40,
            height: 60,
            speed: 5,
            color: "#ff9900"
        };
        
        // Basic game loop
        function gameLoop() {
            // Clear canvas
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw player
            ctx.fillStyle = window.player.color;
            ctx.fillRect(
                window.player.x - window.player.width / 2, 
                window.player.y - window.player.height / 2, 
                window.player.width, 
                window.player.height
            );
            
            // Draw face
            ctx.fillStyle = "#000";
            ctx.fillRect(window.player.x - 10, window.player.y - 10, 5, 5); // left eye
            ctx.fillRect(window.player.x + 5, window.player.y - 10, 5, 5);  // right eye
            ctx.fillRect(window.player.x - 10, window.player.y + 5, 20, 5);  // mouth
            
            // Draw diagnostic info
            ctx.fillStyle = "#fff";
            ctx.font = "14px monospace";
            ctx.fillText("TEST MODE - Basic Game Running", 20, 30);
            ctx.fillText("Original game loading failed - check console (F12) for details", 20, 50);
            
            // Continue animation
            window.animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        // Start game loop
        gameLoop();
        
        console.log("%c[TEST] Basic game initialization successful", "color: #4CAF50");
    } catch (error) {
        console.error("[TEST] Error in basic game initialization:", error);
        showError("Error in basic game initialization", error);
    }
}

// Log initialization
console.log("%c[TEST] Test initialization script loaded", "color: #4CAF50; font-weight: bold; font-size: 14px"); 