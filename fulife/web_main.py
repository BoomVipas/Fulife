import asyncio
import pygame
import sys
import os

# Add this to make imports work in the web version
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the necessary modules
from game_state_manager import GameStateManager

# Set up Pygame asynchronously for the web
async def main():
    pygame.init()
    
    # Create the game window
    width, height = 800, 600
    screen = pygame.display.set_mode((width, height))
    pygame.display.set_caption("FULIFE")
    
    # Initialize the game state manager
    game_manager = GameStateManager()
    
    # Set up the clock
    clock = pygame.time.Clock()
    
    # Main game loop
    running = True
    while running:
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            game_manager.handle_event(event)
        
        # Update game state
        game_manager.update()
        
        # Draw the current scene
        screen.fill((0, 0, 0))
        game_manager.draw(screen)
        pygame.display.flip()
        
        # Limit the frame rate
        clock.tick(60)
        
        # Necessary for web version to run properly
        await asyncio.sleep(0)
    
    pygame.quit()

# This is the entry point for Pygbag
asyncio.run(main()) 