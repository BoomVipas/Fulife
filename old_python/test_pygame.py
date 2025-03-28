import pygame
import sys

# Initialize pygame
pygame.init()

# Set up the display
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Pygame Test")

# Set up colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

# Set up font
font = pygame.font.SysFont(None, 36)

# Main game loop
running = True
clock = pygame.time.Clock()

while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
    
    # Clear the screen
    screen.fill(BLACK)
    
    # Draw some shapes
    pygame.draw.rect(screen, RED, pygame.Rect(50, 50, 100, 100))
    pygame.draw.circle(screen, GREEN, (400, 300), 50)
    pygame.draw.line(screen, BLUE, (600, 100), (700, 500), 5)
    
    # Draw text
    text = font.render("Pygame is working!", True, WHITE)
    screen.blit(text, (width // 2 - text.get_width() // 2, 30))
    
    instructions = font.render("Press ESC to exit", True, WHITE)
    screen.blit(instructions, (width // 2 - instructions.get_width() // 2, height - 50))
    
    # Update the display
    pygame.display.flip()
    
    # Control game speed
    clock.tick(60)

# Quit pygame
pygame.quit()
sys.exit() 