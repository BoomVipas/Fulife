import pygame
import os

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 40
        self.height = 60
        self.velocity = 3
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.prev_x = x
        self.prev_y = y
        
        # Player animation variables
        self.facing = 'down'  # 'up', 'down', 'left', 'right'
        self.moving = False
        
        # Movement flags for smoother web control
        self.moving_up = False
        self.moving_down = False
        self.moving_left = False
        self.moving_right = False
        
        # Animation variables
        self.sprite_sheet = None
        self.animation_frames = {}
        self.current_frame = 1  # Start with middle frame (standing pose)
        self.animation_timer = 0
        self.animation_delay = 150  # milliseconds between frames
        self.last_update_time = pygame.time.get_ticks()
        
        # Load the sprite sheet
        self.load_sprites()
    
    def load_sprites(self):
        """Load and split the player sprite sheet"""
        try:
            # Try to load the sprite sheet
            sprite_path = os.path.join('assets', 'images', 'player_sprite.png')
            if os.path.exists(sprite_path):
                self.sprite_sheet = pygame.image.load(sprite_path).convert_alpha()
            else:
                # Fallback: Create a simple sprite sheet with colored rectangles
                self.create_placeholder_sprites()
            
            # Split the sprite sheet into frames for each direction
            if self.sprite_sheet:
                # Sprite dimensions (assuming a 4x3 grid of sprites)
                sprite_width = self.sprite_sheet.get_width() // 3
                sprite_height = self.sprite_sheet.get_height() // 4
                
                # Adjust player size to match sprites
                self.width = sprite_width
                self.height = sprite_height
                self.rect.width = sprite_width
                self.rect.height = sprite_height
                
                # Extract frames for each direction
                self.animation_frames = {
                    'down': [],   # First row
                    'up': [],     # Second row
                    'right': [],  # Third row
                    'left': []    # Fourth row
                }
                
                # Extract frames for walking down (toward screen)
                for col in range(3):
                    frame = self.sprite_sheet.subsurface(
                        pygame.Rect(col * sprite_width, 0, sprite_width, sprite_height)
                    )
                    self.animation_frames['down'].append(frame)
                
                # Extract frames for walking up (away from screen)
                for col in range(3):
                    frame = self.sprite_sheet.subsurface(
                        pygame.Rect(col * sprite_width, sprite_height, sprite_width, sprite_height)
                    )
                    self.animation_frames['up'].append(frame)
                
                # Extract frames for walking right
                for col in range(3):
                    frame = self.sprite_sheet.subsurface(
                        pygame.Rect(col * sprite_width, 2 * sprite_height, sprite_width, sprite_height)
                    )
                    self.animation_frames['right'].append(frame)
                
                # Extract frames for walking left
                for col in range(3):
                    frame = self.sprite_sheet.subsurface(
                        pygame.Rect(col * sprite_width, 3 * sprite_height, sprite_width, sprite_height)
                    )
                    self.animation_frames['left'].append(frame)
        
        except Exception as e:
            print(f"Error loading player sprites: {e}")
            self.create_placeholder_sprites()
    
    def create_placeholder_sprites(self):
        """Create placeholder sprites if the sprite sheet can't be loaded"""
        # Create a surface for the sprite sheet (3 columns, 4 rows)
        self.sprite_sheet = pygame.Surface((120, 240), pygame.SRCALPHA)
        
        # Colors for different directions
        colors = {
            'down': (100, 150, 200),
            'up': (100, 200, 100),
            'right': (150, 200, 100),
            'left': (200, 100, 150)
        }
        
        # Create placeholder sprites
        self.animation_frames = {
            'down': [],
            'up': [],
            'right': [],
            'left': []
        }
        
        for row, direction in enumerate(['down', 'up', 'right', 'left']):
            for col in range(3):
                # Create a frame surface
                frame = pygame.Surface((40, 60), pygame.SRCALPHA)
                # Fill with the direction color
                frame.fill(colors[direction])
                # Add some variation based on the animation frame
                offset = col * 5
                pygame.draw.rect(frame, (255, 255, 255), 
                                pygame.Rect(10 + offset, 10, 20, 20))
                
                # Add to the sprite sheet and animation frames
                self.sprite_sheet.blit(frame, (col * 40, row * 60))
                self.animation_frames[direction].append(frame)
    
    def update_animation(self):
        """Update the animation frame based on movement"""
        current_time = pygame.time.get_ticks()
        
        # If the player is moving, animate
        if self.moving:
            # Check if it's time to change the animation frame
            if current_time - self.last_update_time > self.animation_delay:
                self.last_update_time = current_time
                # Cycle through frames 0, 1, 2, 1, 0, 1, 2, 1, ...
                # This creates a more natural walking animation
                if self.current_frame == 0:
                    self.current_frame = 1
                elif self.current_frame == 1:
                    self.current_frame = 2
                elif self.current_frame == 2:
                    self.current_frame = 1
        else:
            # If not moving, use the middle frame (frame 1) for standing
            self.current_frame = 1
    
    def handle_key_down(self, key):
        """Handle keyboard key down events"""
        if key == pygame.K_UP or key == pygame.K_w:
            self.moving_up = True
        elif key == pygame.K_DOWN or key == pygame.K_s:
            self.moving_down = True
        elif key == pygame.K_LEFT or key == pygame.K_a:
            self.moving_left = True
        elif key == pygame.K_RIGHT or key == pygame.K_d:
            self.moving_right = True
    
    def handle_key_up(self, key):
        """Handle keyboard key up events"""
        if key == pygame.K_UP or key == pygame.K_w:
            self.moving_up = False
        elif key == pygame.K_DOWN or key == pygame.K_s:
            self.moving_down = False
        elif key == pygame.K_LEFT or key == pygame.K_a:
            self.moving_left = False
        elif key == pygame.K_RIGHT or key == pygame.K_d:
            self.moving_right = False
    
    def handle_input(self, keys=None):
        """Handle movement input from keyboard state or movement flags"""
        # Reset movement flag
        self.moving = False
        
        # Store previous position to check for collisions
        self.prev_x, self.prev_y = self.x, self.y
        
        # If keys are provided, use them directly (desktop mode)
        if keys:
            if keys[pygame.K_UP] or keys[pygame.K_w]:
                self.moving_up = True
            else:
                self.moving_up = False
                
            if keys[pygame.K_DOWN] or keys[pygame.K_s]:
                self.moving_down = True
            else:
                self.moving_down = False
                
            if keys[pygame.K_LEFT] or keys[pygame.K_a]:
                self.moving_left = True
            else:
                self.moving_left = False
                
            if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
                self.moving_right = True
            else:
                self.moving_right = False
        
        # Calculate new position based on movement flags
        new_x, new_y = self.x, self.y
        
        # Handle vertical movement
        if self.moving_up:
            new_y -= self.velocity
            self.facing = 'up'
            self.moving = True
        elif self.moving_down:
            new_y += self.velocity
            self.facing = 'down'
            self.moving = True
        
        # Handle horizontal movement
        if self.moving_left:
            new_x -= self.velocity
            self.facing = 'left'
            self.moving = True
        elif self.moving_right:
            new_x += self.velocity
            self.facing = 'right'
            self.moving = True
        
        # Update position and rectangle
        self.x = new_x
        self.y = new_y
        self.rect.x = new_x
        self.rect.y = new_y
        
        # Update animation
        self.update_animation()
        
        # Return True if player has moved
        return self.moving
    
    def check_collision(self, obstacles):
        # Check if the player collides with any obstacle
        collided = False
        
        for obstacle in obstacles:
            if self.rect.colliderect(obstacle):
                collided = True
                break
        
        # If collision occurred, revert to previous position
        if collided:
            self.x = self.prev_x
            self.y = self.prev_y
            self.rect.x = self.prev_x
            self.rect.y = self.prev_y
            return True
        
        return False
    
    def draw(self, screen):
        # Get the current animation frame based on direction and movement
        if self.animation_frames and self.facing in self.animation_frames:
            if len(self.animation_frames[self.facing]) > self.current_frame:
                frame = self.animation_frames[self.facing][self.current_frame]
                screen.blit(frame, (self.x, self.y))
            else:
                # Fallback if the frame doesn't exist
                pygame.draw.rect(screen, (255, 0, 0), self.rect)
        else:
            # Fallback if animations haven't loaded
            pygame.draw.rect(screen, (255, 0, 0), self.rect)
    
    def set_position(self, x, y):
        self.x = x
        self.y = y
        self.rect.x = x
        self.rect.y = y 