import pygame
import time
from scenes.base_scene import BaseScene

class PreloadScene(BaseScene):
    def __init__(self, game_manager):
        super().__init__(game_manager)
        self.font = None
        self.loading_progress = 0
        self.progress_bar_rect = None
        self.progress_bar_fill = None
        self.loading_complete = False
        self.load_start_time = 0
        self.sim_load_duration = 2.0  # Simulated loading time in seconds
        
    def initialize(self):
        # Load fonts
        pygame.font.init()  # Make sure font system is initialized
        try:
            self.font = pygame.font.SysFont('Arial', 24)
        except:
            # Fallback to default font if Arial is not available
            self.font = pygame.font.Font(None, 24)
        
        # Set up progress bar
        bar_width = 400
        bar_height = 30
        screen_width = self.game_manager.screen.get_width()
        screen_height = self.game_manager.screen.get_height()
        
        bar_x = (screen_width - bar_width) // 2
        bar_y = (screen_height - bar_height) // 2
        
        self.progress_bar_rect = pygame.Rect(bar_x, bar_y, bar_width, bar_height)
        self.progress_bar_fill = pygame.Rect(bar_x, bar_y, 0, bar_height)
        
        # Start the loading timer
        self.load_start_time = time.time()
    
    def enter(self):
        super().enter()
    
    def handle_event(self, event):
        pass
    
    def update(self):
        current_time = time.time()
        elapsed_time = current_time - self.load_start_time
        
        # Simulate asset loading progress
        if elapsed_time < self.sim_load_duration:
            # Calculate progress (0.0 to 1.0)
            progress = elapsed_time / self.sim_load_duration
            self.loading_progress = min(progress, 1.0)
            
            # Update progress bar width
            fill_width = int(self.progress_bar_rect.width * self.loading_progress)
            self.progress_bar_fill.width = fill_width
        else:
            # Loading complete
            self.loading_progress = 1.0
            self.loading_complete = True
            self.progress_bar_fill.width = self.progress_bar_rect.width
            
            # Move to game scene
            self.game_manager.change_scene('game')
    
    def draw(self, screen):
        # Clear the screen
        screen.fill((0, 0, 0))
        
        # Draw loading text
        loading_text = self.font.render("Loading game assets...", True, (255, 255, 255))
        loading_rect = loading_text.get_rect(center=(screen.get_width() // 2, self.progress_bar_rect.y - 40))
        screen.blit(loading_text, loading_rect)
        
        # Draw progress percentage
        percent_text = self.font.render(f"{int(self.loading_progress * 100)}%", True, (255, 255, 255))
        percent_rect = percent_text.get_rect(center=(screen.get_width() // 2, self.progress_bar_rect.y + 60))
        screen.blit(percent_text, percent_rect)
        
        # Draw progress bar outline
        pygame.draw.rect(screen, (100, 100, 100), self.progress_bar_rect, 2)
        
        # Draw progress bar fill
        pygame.draw.rect(screen, (100, 100, 255), self.progress_bar_fill) 