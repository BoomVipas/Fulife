import os
import sys
import traceback
import pygame

def debug_run():
    """Run the game with additional debug information"""
    # Set environment variables for more verbose Pygame output
    os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '0'
    
    print("=== STARTING DEBUG RUN ===")
    print(f"Python version: {sys.version}")
    print(f"Pygame version: {pygame.version.ver}")
    print(f"Display driver: {pygame.display.get_driver()}")
    
    print("\nChecking for necessary files...")
    required_files = ["main.py", "scenes/base_scene.py", "scenes/boot_scene.py"]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ Found {file}")
        else:
            print(f"✗ Missing {file}")
    
    # Check for player sprite
    sprite_path = os.path.join("assets", "images", "player_sprite.png")
    if os.path.exists(sprite_path):
        print(f"✓ Found player sprite at {sprite_path}")
        try:
            image = pygame.image.load(sprite_path)
            print(f"  - Sprite dimensions: {image.get_width()}x{image.get_height()}")
        except Exception as e:
            print(f"  - Error loading sprite: {e}")
    else:
        print(f"✗ Missing player sprite at {sprite_path}")
    
    print("\nTrying to run the game...")
    try:
        # Import the main module
        import main
        
        # Run the game
        if hasattr(main, "GameStateManager"):
            print("Creating game instance...")
            game = main.GameStateManager()
            print("Starting game loop...")
            game.run()
        else:
            print("Error: GameStateManager class not found in main.py")
    
    except Exception as e:
        print(f"\nError running the game: {e}")
        print("\nTraceback:")
        traceback.print_exc()

if __name__ == "__main__":
    # Initialize pygame first
    pygame.init()
    debug_run() 