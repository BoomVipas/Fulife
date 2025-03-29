# FULIFE Game Structure

This document explains the file structure of the FULIFE game.

## File Structure

The game is now divided into multiple HTML pages for better organization and debugging:

- `index.html` - Main entry point that redirects to the start page
- `start-page.html` - Contains the main menu and character customization
- `cutscene-page.html` - Contains the cutscene sequence
- `game-page.html` - Contains the actual gameplay

## JavaScript Files

Each HTML page has its own JavaScript file:

- `start-page.js` - Controls the main menu and character customization
- `cutscene-page.js` - Controls the cutscene sequence
- `game-page.js` - Initializes and controls the game

The original game functionality files are still used:

- `game.js` - Main game logic
- `logic-gates.js` - Logic gates minigame
- `images.js` - Base64 encoded images
- `cutscene-images.js` - Cutscene images

## Running the Game

To run the game locally:

1. Open PowerShell in the `docs` directory
2. Run the included PowerShell script:
```
.\run_server.ps1
```
3. Open your browser to `http://localhost:8000`

**Note:** Make sure you are using the PowerShell script instead of directly typing commands, as it includes error handling and validation.

## Game Flow

1. The player starts at `index.html` which redirects to `start-page.html`
2. From `start-page.html`, the player can customize their character and start the game
3. This takes them to `cutscene-page.html` where they watch the introduction
4. After the cutscenes, they go to `game-page.html` for the actual gameplay

## Debugging

This modular structure makes debugging easier:

- Each page can be tested independently
- JavaScript errors are isolated to specific pages
- You can open each page directly in your browser for testing

For example, to test just the gameplay screen, go to:
```
http://localhost:8000/game-page.html
```

## Debug Mode

Add `#debug` to any URL to enable debug mode, which will show debugging information:

```
http://localhost:8000/game-page.html#debug
```

## Diagnostic Tools

The game now includes built-in diagnostic tools to help troubleshoot issues:

### Test Initialization Script

A diagnostic script has been added to help identify initialization problems:

- `test-init.js` - Provides detailed error reporting and fallback gameplay

This script is automatically loaded in `game-page.html` and will:
1. Check for required elements (canvas, context, etc.)
2. Verify that all required scripts are loaded
3. Show any errors in a user-friendly way
4. Provide a fallback game implementation if critical errors occur

### Improved Error Handling

The game initialization process has been improved with:

- Better error messages that explain what went wrong
- Visual error display instead of silent failures
- Detailed diagnostic information in console logs
- Fallback mechanics when non-critical errors occur

## Troubleshooting Common Issues

### Blank Screen Issue

If you encounter a blank screen when loading the game:

1. First, check the console (F12) for error messages
2. Make sure all script files are properly loaded
3. Verify that your browser supports HTML5 Canvas
4. Try the direct URL with debug mode: `http://localhost:8000/game-page.html#debug`

### Server Issues

If you have problems with the local server:

1. Make sure Python is installed and in your PATH
2. Run the server from the `docs` directory
3. Check if port 8000 is already in use by another application
4. Try manually running: `python -m http.server 8080` to use a different port 