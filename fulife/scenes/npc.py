import pygame
import math

class NPC:
    def __init__(self, x, y, name, profession, color):
        self.x = x
        self.y = y
        self.width = 40
        self.height = 60
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.name = name
        self.profession = profession
        self.color = color
        
        # NPC interaction properties
        self.interaction_radius = 100
        self.can_interact = False
        self.is_interacting = False
        self.facing = 'down'  # 'up', 'down', 'left', 'right'
        
        # Dialogue content
        self.dialogues = [
            f"Hi! I'm {name}, a {profession}.",
            f"Would you like to learn more about being a {profession}?",
            f"Let me tell you about my daily work as a {profession}...",
            "Feel free to ask me any questions!"
        ]
        self.current_dialogue = 0
    
    def update(self, player):
        # Check if player is within interaction radius
        distance = math.sqrt((player.x - self.x)**2 + (player.y - self.y)**2)
        self.can_interact = distance <= self.interaction_radius
        
        # Face towards the player when in range
        if self.can_interact and not self.is_interacting:
            # Determine direction to face
            dx = player.x - self.x
            dy = player.y - self.y
            
            # Face in the direction of the player (using the largest component)
            if abs(dx) > abs(dy):
                self.facing = 'right' if dx > 0 else 'left'
            else:
                self.facing = 'down' if dy > 0 else 'up'
    
    def start_interaction(self):
        self.is_interacting = True
        self.current_dialogue = 0
        return self.get_current_dialogue()
    
    def end_interaction(self):
        self.is_interacting = False
    
    def get_current_dialogue(self):
        if 0 <= self.current_dialogue < len(self.dialogues):
            return self.dialogues[self.current_dialogue]
        return None
    
    def next_dialogue(self):
        self.current_dialogue += 1
        if self.current_dialogue >= len(self.dialogues):
            # End of dialogue
            return None
        return self.get_current_dialogue()
    
    def draw(self, screen):
        # Draw NPC as a rectangle with their color
        pygame.draw.rect(screen, self.color, self.rect)
        
        # Draw a small indicator for the facing direction
        indicator_size = 10
        indicator_color = (255, 255, 255)
        
        if self.facing == 'up':
            indicator_rect = pygame.Rect(
                self.x + (self.width - indicator_size) // 2,
                self.y, 
                indicator_size, 
                indicator_size
            )
        elif self.facing == 'down':
            indicator_rect = pygame.Rect(
                self.x + (self.width - indicator_size) // 2,
                self.y + self.height - indicator_size, 
                indicator_size, 
                indicator_size
            )
        elif self.facing == 'left':
            indicator_rect = pygame.Rect(
                self.x,
                self.y + (self.height - indicator_size) // 2, 
                indicator_size, 
                indicator_size
            )
        elif self.facing == 'right':
            indicator_rect = pygame.Rect(
                self.x + self.width - indicator_size,
                self.y + (self.height - indicator_size) // 2, 
                indicator_size, 
                indicator_size
            )
        
        pygame.draw.rect(screen, indicator_color, indicator_rect)
        
        # Draw interaction indicator if player is in range and not already interacting
        if self.can_interact and not self.is_interacting:
            pygame.font.init()  # Make sure font system is initialized
            try:
                font = pygame.font.SysFont('Arial', 12)
            except:
                font = pygame.font.Font(None, 12)
                
            text = font.render("Press E to talk", True, (255, 255, 255))
            text_rect = text.get_rect(center=(self.x + self.width//2, self.y - 20))
            screen.blit(text, text_rect)
        
        # Draw name tag
        pygame.font.init()  # Make sure font system is initialized
        try:
            name_font = pygame.font.SysFont('Arial', 14)
        except:
            name_font = pygame.font.Font(None, 14)
            
        name_text = name_font.render(self.name, True, (255, 255, 255))
        name_rect = name_text.get_rect(center=(self.x + self.width//2, self.y + self.height + 15))
        screen.blit(name_text, name_rect) 