import pygame

class BaseScene:
    def __init__(self, game_manager):
        self.game_manager = game_manager
        self.initialized = False
    
    def enter(self):
        """Called when scene becomes active"""
        if not self.initialized:
            self.initialize()
            self.initialized = True
    
    def initialize(self):
        """Initialize scene assets and variables"""
        pass
    
    def handle_event(self, event):
        """Process pygame events"""
        pass
    
    def update(self):
        """Update game logic"""
        pass
    
    def draw(self, screen):
        """Draw scene elements"""
        if not self.initialized:
            self.initialize()
            self.initialized = True
        pass
    
    def exit(self):
        """Called when leaving this scene"""
        pass 