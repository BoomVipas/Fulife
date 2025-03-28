import pygame
import sys
import os
import asyncio
from scenes.boot_scene import BootScene
from scenes.preload_scene import PreloadScene
from scenes.game_scene import GameScene
from scenes.dialogue_scene import DialogueScene
from scenes.logic_puzzle_scene import LogicPuzzleScene

# Initialize pygame
pygame.init()
pygame.font.init()  # Explicitly initialize the font system

# Game settings
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
TITLE = "Fulife: Career Simulation Game"

# Create the screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption(TITLE)
clock = pygame.time.Clock()

# Game state manager
class GameStateManager:
    def __init__(self):
        self.screen = screen
        self.clock = clock
        self.fps = 60
        self.inventory = []
        
        self.scenes = {
            'boot': BootScene(self),
            'preload': PreloadScene(self),
            'game': GameScene(self),
            'dialogue': DialogueScene(self),
            'logic_puzzle': LogicPuzzleScene(self)
        }
        self.current_scene = 'boot'
        self.running = True
        
        # Initialize the first scene
        self.scenes[self.current_scene].enter()
    
    def change_scene(self, scene_name):
        """Change to a different scene"""
        if scene_name in self.scenes:
            self.current_scene = scene_name
            self.scenes[scene_name].enter()
    
    def add_to_inventory(self, item):
        """Add an item to the player's inventory"""
        self.inventory.append(item)
        print(f"Added {item} to inventory")
    
    async def run_async(self):
        """Main game loop for async web mode"""
        while self.running:
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                self.scenes[self.current_scene].handle_event(event)
            
            # Update
            self.scenes[self.current_scene].update()
            
            # Draw
            self.scenes[self.current_scene].draw(self.screen)
            
            # Flip display
            pygame.display.flip()
            
            # Control game speed
            self.clock.tick(self.fps)
            
            # Let browser breathe
            await asyncio.sleep(0)
        
        # Clean up and quit
        pygame.quit()
        sys.exit()
    
    def run(self):
        """Standard run method for desktop"""
        while self.running:
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                self.scenes[self.current_scene].handle_event(event)
            
            # Update
            self.scenes[self.current_scene].update()
            
            # Draw
            self.scenes[self.current_scene].draw(self.screen)
            
            # Flip display
            pygame.display.flip()
            
            # Control game speed
            self.clock.tick(self.fps)
        
        # Clean up and quit
        pygame.quit()
        sys.exit()

# Entry point for Pygbag (web)
async def main():
    game = GameStateManager()
    await game.run_async()

# Start the game
if __name__ == "__main__":
    if sys.platform == 'emscripten':
        # Running in browser via Pygbag
        asyncio.run(main())
    else:
        # Running on desktop
        game = GameStateManager()
        game.run() 