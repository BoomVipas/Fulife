import pygame
from scenes.base_scene import BaseScene

class DialogueScene(BaseScene):
    def __init__(self, game_manager):
        super().__init__(game_manager)
        self.dialogue_font = None
        self.name_font = None
        self.dialogue_box = None
        self.current_text = ""
        self.active_npc = None
    
    def initialize(self):
        # Load fonts
        pygame.font.init()  # Make sure font system is initialized
        try:
            self.dialogue_font = pygame.font.SysFont('Arial', 20)
            self.name_font = pygame.font.SysFont('Arial', 24)
        except:
            # Fallback to default font if Arial is not available
            self.dialogue_font = pygame.font.Font(None, 20)
            self.name_font = pygame.font.Font(None, 24)
        
        # Create dialogue box
        screen_width = self.game_manager.screen.get_width()
        screen_height = self.game_manager.screen.get_height()
        
        box_width = screen_width - 100
        box_height = 150
        
        box_x = (screen_width - box_width) // 2
        box_y = screen_height - box_height - 50
        
        self.dialogue_box = pygame.Rect(box_x, box_y, box_width, box_height)
    
    def enter(self):
        super().enter()
        # Get the active NPC from the game scene
        game_scene = self.game_manager.scenes['game']
        self.active_npc = game_scene.active_npc
        
        # Get the current dialogue
        if self.active_npc:
            self.current_text = self.active_npc.get_current_dialogue()
    
    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                # Advance to next dialogue
                if self.active_npc:
                    next_text = self.active_npc.next_dialogue()
                    if next_text:
                        self.current_text = next_text
                    else:
                        # End of dialogue, return to game
                        self.game_manager.change_scene('game')
            
            elif event.key == pygame.K_ESCAPE:
                # Exit dialogue
                self.game_manager.change_scene('game')
    
    def update(self):
        pass
    
    def draw(self, screen):
        # Draw a semi-transparent background to darken the game scene
        overlay = pygame.Surface((screen.get_width(), screen.get_height()))
        overlay.set_alpha(128)
        overlay.fill((0, 0, 0))
        screen.blit(overlay, (0, 0))
        
        # Draw dialogue box
        pygame.draw.rect(screen, (50, 50, 70), self.dialogue_box)
        pygame.draw.rect(screen, (200, 200, 220), self.dialogue_box, 3)
        
        # Draw character name
        if self.active_npc:
            name_text = self.name_font.render(f"{self.active_npc.name} - {self.active_npc.profession}", True, (255, 255, 255))
            name_rect = pygame.Rect(self.dialogue_box.x, self.dialogue_box.y - 30, name_text.get_width() + 20, 30)
            
            pygame.draw.rect(screen, (80, 80, 100), name_rect)
            pygame.draw.rect(screen, (200, 200, 220), name_rect, 2)
            
            screen.blit(name_text, (name_rect.x + 10, name_rect.y + 5))
        
        # Draw dialogue text
        if self.current_text:
            # Wrap text to fit in dialogue box
            words = self.current_text.split(' ')
            lines = []
            current_line = []
            max_width = self.dialogue_box.width - 40
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                test_surface = self.dialogue_font.render(test_line, True, (255, 255, 255))
                
                if test_surface.get_width() <= max_width:
                    current_line.append(word)
                else:
                    lines.append(' '.join(current_line))
                    current_line = [word]
            
            if current_line:
                lines.append(' '.join(current_line))
            
            # Draw each line
            for i, line in enumerate(lines):
                text_surface = self.dialogue_font.render(line, True, (255, 255, 255))
                screen.blit(text_surface, (self.dialogue_box.x + 20, self.dialogue_box.y + 20 + i * 30))
        
        # Draw instruction
        instruction = self.dialogue_font.render("Press SPACE to continue, ESC to exit", True, (200, 200, 200))
        instruction_rect = instruction.get_rect(center=(screen.get_width() // 2, self.dialogue_box.y + self.dialogue_box.height - 25))
        screen.blit(instruction, instruction_rect) 