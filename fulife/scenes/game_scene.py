import pygame
from scenes.base_scene import BaseScene
from scenes.player import Player
from scenes.npc import NPC

class GameScene(BaseScene):
    def __init__(self, game_manager):
        super().__init__(game_manager)
        self.player = None
        self.npcs = []
        self.obstacles = []
        self.font = None
        self.active_npc = None
        self.touch_controls = {}  # Store touch control rects
    
    def initialize(self):
        # Create player
        screen_width = self.game_manager.screen.get_width()
        screen_height = self.game_manager.screen.get_height()
        
        self.player = Player(screen_width // 2, screen_height // 2)
        
        # Load font
        pygame.font.init()  # Make sure font system is initialized
        try:
            self.font = pygame.font.SysFont('Arial', 16)
        except:
            # Fallback to default font if Arial is not available
            self.font = pygame.font.Font(None, 16)
        
        # Create NPCs
        self.npcs = [
            NPC(200, 200, "Lary", "Doctor", (100, 150, 255)),
            NPC(600, 200, "Mary", "Lawyer", (255, 100, 100)),
            NPC(200, 400, "Jack", "Language Expert", (100, 255, 100)),
            NPC(600, 400, "Cathy", "Art Expert", (255, 255, 100)),
            NPC(400, 150, "Johnas", "Engineer", (150, 100, 255)),
            NPC(400, 450, "Mr. Wilson", "CEO of TechFuture", (255, 150, 50))
        ]
        
        # Create obstacles (walls, furniture, etc.)
        wall_thickness = 20
        self.obstacles = [
            # Outer walls
            pygame.Rect(0, 0, screen_width, wall_thickness),  # Top
            pygame.Rect(0, screen_height - wall_thickness, screen_width, wall_thickness),  # Bottom
            pygame.Rect(0, 0, wall_thickness, screen_height),  # Left
            pygame.Rect(screen_width - wall_thickness, 0, wall_thickness, screen_height),  # Right
            
            # Interior obstacles
            pygame.Rect(300, 100, 200, 50),  # Desk
            pygame.Rect(100, 300, 50, 100),  # Cabinet
            pygame.Rect(650, 300, 50, 100)   # Bookshelf
        ]
        
        # Initialize touch controls
        self.init_touch_controls()
    
    def init_touch_controls(self):
        """Initialize touch control rectangles"""
        btn_size = 50
        margin = 20
        screen_width = self.game_manager.screen.get_width()
        screen_height = self.game_manager.screen.get_height()
        
        # D-pad
        dpad_center_x = margin + btn_size * 1.5
        dpad_center_y = screen_height - margin - btn_size * 1.5
        
        self.touch_controls = {
            'up': pygame.Rect(dpad_center_x - btn_size//2, dpad_center_y - btn_size - 5, btn_size, btn_size),
            'down': pygame.Rect(dpad_center_x - btn_size//2, dpad_center_y + 5, btn_size, btn_size),
            'left': pygame.Rect(dpad_center_x - btn_size - 5, dpad_center_y - btn_size//2, btn_size, btn_size),
            'right': pygame.Rect(dpad_center_x + 5, dpad_center_y - btn_size//2, btn_size, btn_size),
            
            # Action buttons (right side)
            'e': pygame.Rect(screen_width - margin - btn_size, screen_height - margin - btn_size - btn_size - 10, btn_size, btn_size),
            'i': pygame.Rect(screen_width - margin - btn_size - btn_size - 10, screen_height - margin - btn_size, btn_size, btn_size)
        }
    
    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            # Handle player movement
            self.player.handle_key_down(event.key)
            
            # Interact with NPC
            if event.key == pygame.K_e:
                # Check if there's an NPC to interact with
                interactable_npc = self.get_interactable_npc()
                if interactable_npc:
                    self.active_npc = interactable_npc
                    dialogue = self.active_npc.start_interaction()
                    if dialogue:
                        self.game_manager.change_scene('dialogue')
            
            # Open inventory
            elif event.key == pygame.K_i:
                print("Opening inventory")
                # Add inventory scene handling here
        
        elif event.type == pygame.KEYUP:
            # Handle player movement
            self.player.handle_key_up(event.key)
        
        # Handle mouse/touch events for mobile controls
        elif event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            
            # Check if any touch control was pressed
            for control, rect in self.touch_controls.items():
                if rect.collidepoint(pos):
                    if control == 'up':
                        self.player.moving_up = True
                    elif control == 'down':
                        self.player.moving_down = True
                    elif control == 'left':
                        self.player.moving_left = True
                    elif control == 'right':
                        self.player.moving_right = True
                    elif control == 'e':
                        # Interact with NPC
                        interactable_npc = self.get_interactable_npc()
                        if interactable_npc:
                            self.active_npc = interactable_npc
                            dialogue = self.active_npc.start_interaction()
                            if dialogue:
                                self.game_manager.change_scene('dialogue')
                    elif control == 'i':
                        print("Opening inventory")
        
        elif event.type == pygame.MOUSEBUTTONUP:
            # Reset movement when touch controls are released
            pos = pygame.mouse.get_pos()
            
            # Only reset the controls that were pressed (position check)
            for control, rect in self.touch_controls.items():
                if rect.collidepoint(pos):
                    if control == 'up':
                        self.player.moving_up = False
                    elif control == 'down':
                        self.player.moving_down = False
                    elif control == 'left':
                        self.player.moving_left = False
                    elif control == 'right':
                        self.player.moving_right = False
    
    def update(self):
        # Handle player movement
        self.player.handle_input()
        
        # Check collisions with obstacles
        for obstacle in self.obstacles:
            if self.player.rect.colliderect(obstacle):
                # Move player back
                if self.player.facing == 'up':
                    self.player.y += self.player.velocity
                elif self.player.facing == 'down':
                    self.player.y -= self.player.velocity
                elif self.player.facing == 'left':
                    self.player.x += self.player.velocity
                elif self.player.facing == 'right':
                    self.player.x -= self.player.velocity
                
                # Update player rectangle
                self.player.rect.x = self.player.x
                self.player.rect.y = self.player.y
        
        # Update NPCs
        for npc in self.npcs:
            npc.update(self.player)
    
    def draw(self, screen):
        # Clear screen with background color
        screen.fill((50, 50, 70))
        
        # Draw obstacles
        for obstacle in self.obstacles:
            pygame.draw.rect(screen, (100, 100, 100), obstacle)
        
        # Draw NPCs
        for npc in self.npcs:
            npc.draw(screen)
        
        # Draw player
        self.player.draw(screen)
        
        # Draw controls info
        controls_text = self.font.render("Use WASD/arrows to move, E to interact, I for inventory", 
                                         True, (255, 255, 255))
        screen.blit(controls_text, (20, self.game_manager.screen.get_height() - 30))
        
        # Draw mobile controls if on web
        if pygame.display.get_surface().get_width() < 1000:  # Assume smaller screen = mobile
            # Draw touch controls
            self.draw_touch_controls(screen)
    
    def draw_touch_controls(self, screen):
        """Draw on-screen touch controls for mobile devices"""
        # Up button
        pygame.draw.rect(screen, (50, 50, 150), self.touch_controls['up'], border_radius=10)
        pygame.draw.rect(screen, (100, 100, 200), self.touch_controls['up'], 2, border_radius=10)
        
        # Down button
        pygame.draw.rect(screen, (50, 50, 150), self.touch_controls['down'], border_radius=10)
        pygame.draw.rect(screen, (100, 100, 200), self.touch_controls['down'], 2, border_radius=10)
        
        # Left button
        pygame.draw.rect(screen, (50, 50, 150), self.touch_controls['left'], border_radius=10)
        pygame.draw.rect(screen, (100, 100, 200), self.touch_controls['left'], 2, border_radius=10)
        
        # Right button
        pygame.draw.rect(screen, (50, 50, 150), self.touch_controls['right'], border_radius=10)
        pygame.draw.rect(screen, (100, 100, 200), self.touch_controls['right'], 2, border_radius=10)
        
        # E button (interact)
        pygame.draw.rect(screen, (150, 50, 50), self.touch_controls['e'], border_radius=10)
        pygame.draw.rect(screen, (200, 100, 100), self.touch_controls['e'], 2, border_radius=10)
        
        # I button (inventory)
        pygame.draw.rect(screen, (50, 150, 50), self.touch_controls['i'], border_radius=10)
        pygame.draw.rect(screen, (100, 200, 100), self.touch_controls['i'], 2, border_radius=10)
        
        # Add labels for buttons
        try:
            label_font = pygame.font.SysFont('Arial', 20)
        except:
            label_font = pygame.font.Font(None, 20)
        
        # Draw labels
        e_text = label_font.render("E", True, (255, 255, 255))
        i_text = label_font.render("I", True, (255, 255, 255))
        
        e_rect = e_text.get_rect(center=self.touch_controls['e'].center)
        i_rect = i_text.get_rect(center=self.touch_controls['i'].center)
        
        screen.blit(e_text, e_rect)
        screen.blit(i_text, i_rect)
    
    def get_interactable_npc(self):
        """Find an NPC that can be interacted with"""
        for npc in self.npcs:
            if npc.can_interact:
                return npc
        return None
        
    def enter(self):
        super().enter()
        # If returning from dialogue, end the NPC interaction
        if self.active_npc and self.active_npc.is_interacting:
            self.active_npc.end_interaction()
            self.active_npc = None 