import pygame
import sys

# Initialize pygame
pygame.init()

# Set up display
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Collision Test")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

# Create player
player_size = 50
player_x = WIDTH // 2 - player_size // 2
player_y = HEIGHT // 2 - player_size // 2
player_speed = 5
player_rect = pygame.Rect(player_x, player_y, player_size, player_size)

# Create obstacles
obstacles = [
    # Wall with a narrow opening
    pygame.Rect(0, 200, 300, 30),
    pygame.Rect(400, 200, WIDTH - 400, 30),
    
    # Corner obstacle
    pygame.Rect(100, 400, 100, 100)
]

# Font
font = pygame.font.SysFont(None, 24)

def draw_text(text, color, x, y):
    """Draw text on screen"""
    text_surface = font.render(text, True, color)
    screen.blit(text_surface, (x, y))

def main():
    """Main game loop"""
    
    clock = pygame.time.Clock()
    running = True
    
    # Movement keys
    move_left = False
    move_right = False
    move_up = False
    move_down = False
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            # Key press events
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT or event.key == pygame.K_a:
                    move_left = True
                if event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                    move_right = True
                if event.key == pygame.K_UP or event.key == pygame.K_w:
                    move_up = True
                if event.key == pygame.K_DOWN or event.key == pygame.K_s:
                    move_down = True
                    
                if event.key == pygame.K_ESCAPE:
                    running = False
            
            # Key release events
            if event.type == pygame.KEYUP:
                if event.key == pygame.K_LEFT or event.key == pygame.K_a:
                    move_left = False
                if event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                    move_right = False
                if event.key == pygame.K_UP or event.key == pygame.K_w:
                    move_up = False
                if event.key == pygame.K_DOWN or event.key == pygame.K_s:
                    move_down = False
        
        # Store previous position for collision detection
        prev_x, prev_y = player_rect.x, player_rect.y
        
        # Calculate new position
        new_x, new_y = player_rect.x, player_rect.y
        
        # Handle movement
        if move_left:
            new_x -= player_speed
        if move_right:
            new_x += player_speed
        if move_up:
            new_y -= player_speed
        if move_down:
            new_y += player_speed
        
        # Update player position
        player_rect.x = new_x
        player_rect.y = new_y
        
        # Check for collisions
        collided = False
        for obstacle in obstacles:
            if player_rect.colliderect(obstacle):
                collided = True
                break
        
        # If collision occurred, revert to previous position
        if collided:
            player_rect.x = prev_x
            player_rect.y = prev_y
        
        # Clear screen and draw
        screen.fill(BLACK)
        
        # Draw player
        pygame.draw.rect(screen, BLUE, player_rect)
        
        # Draw obstacles
        for obstacle in obstacles:
            pygame.draw.rect(screen, RED, obstacle)
        
        # Draw instructions
        draw_text("Use WASD or Arrow Keys to move", WHITE, 10, 10)
        draw_text("Try to navigate through the narrow opening and around corners", WHITE, 10, 40)
        draw_text("Press ESC to exit", WHITE, 10, 70)
        
        # Update display
        pygame.display.flip()
        
        # Cap framerate
        clock.tick(60)

if __name__ == "__main__":
    main()
    pygame.quit()
    sys.exit() 