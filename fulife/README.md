# Fulife: Career Simulation Game

A Python game that simulates different career paths through NPC interactions and mini-games.

## Setup for Desktop

1. Make sure you have Python 3.7+ installed
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the game:
   ```
   python main.py
   ```

## Web Deployment

This game can also be played in a web browser using Pygbag:

1. Install the required web deployment dependencies:
   ```
   pip install pygbag
   ```

2. Build and deploy the web version:
   ```
   python deploy_web.py
   ```

3. The game will be built in the `build/web` directory and can be hosted on any web server.

4. For local testing, run:
   ```
   python deploy_web.py serve
   ```

## Gameplay

* **Movement**: Use WASD or arrow keys to move
* **Interact**: Press E to talk to NPCs
* **Dialogue**: Press SPACE to advance dialogue, ESC to exit
* **Inventory**: Press I to view inventory
* **Mini-game**: Complete the logic puzzle to repair a GPU

## Features

* 6 NPCs representing different career paths:
  * Lary (Doctor)
  * Mary (Lawyer)
  * Jack (Language Expert)
  * Cathy (Art Expert)
  * Johnas (Engineer)
  * Mr. Wilson (CEO of TechFuture)
* Different scenes:
  * Boot screen with start button
  * Preload screen with progress bar
  * Main game scene with character movement
  * Dialogue system for NPC interactions
  * Logic puzzle mini-game

## Development

This game is built with Pygame. To extend or modify:

1. Add new NPCs in the GameScene.initialize() method
2. Add new dialogue in the NPC class
3. Create new mini-games by extending the BaseScene class

## Deployment Options

### GitHub Pages

You can deploy this game to GitHub Pages:

1. Build the web version:
   ```
   python deploy_web.py
   ```

2. Create a new repository on GitHub
3. Push the contents of `build/web` to the `gh-pages` branch
4. Your game will be available at `https://your-username.github.io/your-repo-name/`

### itch.io

You can also deploy to itch.io:

1. Build the web version:
   ```
   python deploy_web.py
   ```

2. Zip the contents of `build/web`
3. Upload the zip to itch.io as an HTML5 game

Enjoy exploring different careers in Fulife! 