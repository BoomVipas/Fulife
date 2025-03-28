import pygame
from scenes.base_scene import BaseScene

class BootScene(BaseScene):
    def __init__(self, game_manager):
        super().__init__(game_manager)
        self.title_font = None
        self.button_font = None
        self.start_button = None
        self.button_color = (100, 100, 255)
        self.button_hover_color = (150, 150, 255)
        self.button_is_hovered = False
    
    def initialize(self):
        # Load fonts
        pygame.font.init()  # Make sure font system is initialized
        try:
            self.title_font = pygame.font.SysFont('Arial', 64)
            self.button_font = pygame.font.SysFont('Arial', 32)
        except:
            # Fallback to default font if Arial is not available
            self.title_font = pygame.font.Font(None, 64)
            self.button_font = pygame.font.Font(None, 32)
        
        # Create start button
        button_width = 200
        button_height = 50
        screen_width = self.game_manager.screen.get_width()
        screen_height = self.game_manager.screen.get_height()
        
        button_x = (screen_width - button_width) // 2
        button_y = (screen_height - button_height) // 2 + 100
        
        self.start_button = pygame.Rect(button_x, button_y, button_width, button_height)
    
    def enter(self):
        """Called when scene becomes active"""
        if not self.initialized:
            self.initialize()
            self.initialized = True
    
    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            # Check if mouse is over the button
            self.button_is_hovered = self.start_button.collidepoint(event.pos)
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            # Check if start button was clicked
            if self.start_button.collidepoint(event.pos):
                self.game_manager.change_scene('preload')
    
    def update(self):
        pass
    
    def draw(self, screen):
        # Clear the screen
        screen.fill((0, 0, 0))
        
        # Draw game title
        title_text = self.title_font.render("FULIFE", True, (255, 255, 255))
        subtitle_text = self.button_font.render("Career Simulation Game", True, (200, 200, 200))
        
        title_rect = title_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 - 50))
        subtitle_rect = subtitle_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2))
        
        screen.blit(title_text, title_rect)
        screen.blit(subtitle_text, subtitle_rect)
        
        # Draw start button
        button_color = self.button_hover_color if self.button_is_hovered else self.button_color
        pygame.draw.rect(screen, button_color, self.start_button, border_radius=10)
        pygame.draw.rect(screen, (255, 255, 255), self.start_button, 2, border_radius=10)
        
        button_text = self.button_font.render("START GAME", True, (255, 255, 255))
        button_text_rect = button_text.get_rect(center=self.start_button.center)
        screen.blit(button_text, button_text_rect) 