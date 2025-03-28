import pygame

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 40
        self.height = 60
        self.velocity = 5
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.prev_x = x
        self.prev_y = y
        
        # Player animation variables
        self.facing = 'down'  # 'up', 'down', 'left', 'right'
        self.moving = False
        
        # Placeholder colors for different directions
        self.colors = {
            'up': (100, 200, 100),
            'down': (100, 150, 200),
            'left': (200, 100, 150),
            'right': (150, 200, 100)
        }
        
        # Movement flags for smoother web control
        self.moving_up = False
        self.moving_down = False
        self.moving_left = False
        self.moving_right = False
    
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
        
        # Handle movement based on flags
        if self.moving_up:
            self.y -= self.velocity
            self.facing = 'up'
            self.moving = True
        elif self.moving_down:
            self.y += self.velocity
            self.facing = 'down'
            self.moving = True
        
        if self.moving_left:
            self.x -= self.velocity
            self.facing = 'left'
            self.moving = True
        elif self.moving_right:
            self.x += self.velocity
            self.facing = 'right'
            self.moving = True
        
        # Update rectangle position
        self.rect.x = self.x
        self.rect.y = self.y
        
        # Return True if player has moved
        return self.moving
    
    def check_collision(self, obstacles):
        # Check collision with each obstacle
        for obstacle in obstacles:
            if self.rect.colliderect(obstacle):
                # Collided, move player back
                self.rect = pygame.Rect(self.prev_x, self.prev_y, self.width, self.height)
                self.x, self.y = self.prev_x, self.prev_y
                return True
        return False
    
    def draw(self, screen):
        # Draw player as a colored rectangle based on direction
        pygame.draw.rect(screen, self.colors[self.facing], self.rect)
        
        # Draw a small indicator for the facing direction
        indicator_size = 10
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
        
        pygame.draw.rect(screen, (255, 255, 255), indicator_rect)
    
    def set_position(self, x, y):
        self.x = x
        self.y = y
        self.rect.x = x
        self.rect.y = y 