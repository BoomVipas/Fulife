#!/usr/bin/env python3
"""
Generate a placeholder player sprite sheet with 12 frames:
- 3 frames for each direction (down, up, right, left)
"""

import os
import pygame

# Initialize pygame
pygame.init()

# Constants
SPRITE_WIDTH = 48
SPRITE_HEIGHT = 64
NUM_FRAMES = 3
NUM_DIRECTIONS = 4
OUTPUT_FILE = os.path.join('assets', 'images', 'player_sprite.png')

# Create the sprite sheet surface
sprite_sheet = pygame.Surface(
    (SPRITE_WIDTH * NUM_FRAMES, SPRITE_HEIGHT * NUM_DIRECTIONS),
    pygame.SRCALPHA
)

# Colors for different directions (down, up, right, left)
colors = [
    (100, 150, 200),  # down - bluish
    (100, 200, 100),  # up - greenish
    (150, 200, 100),  # right - yellowish
    (200, 100, 150),  # left - pinkish
]

# Generate sprites for each direction and frame
for direction in range(NUM_DIRECTIONS):
    for frame in range(NUM_FRAMES):
        # Create frame rectangle
        rect = pygame.Rect(
            frame * SPRITE_WIDTH,
            direction * SPRITE_HEIGHT,
            SPRITE_WIDTH,
            SPRITE_HEIGHT
        )
        
        # Draw character body
        color = colors[direction]
        
        # Create a surface for this frame
        frame_surface = pygame.Surface((SPRITE_WIDTH, SPRITE_HEIGHT), pygame.SRCALPHA)
        
        # Different shapes for different animation frames to show movement
        if frame == 0:  # Standing pose
            # Body
            pygame.draw.ellipse(
                frame_surface, 
                color, 
                pygame.Rect(8, 20, 32, 40)
            )
            # Head
            pygame.draw.circle(
                frame_surface,
                (240, 220, 190),  # skin tone
                (SPRITE_WIDTH // 2, 18),
                12
            )
            # Simple face (eyes and mouth)
            pygame.draw.circle(
                frame_surface,
                (0, 0, 0),  # black eyes
                (SPRITE_WIDTH // 2 - 4, 14),
                2
            )
            pygame.draw.circle(
                frame_surface,
                (0, 0, 0),  # black eyes
                (SPRITE_WIDTH // 2 + 4, 14),
                2
            )
            
            # Add direction-specific features
            if direction == 0:  # down
                # Mouth facing down
                pygame.draw.arc(
                    frame_surface,
                    (0, 0, 0),
                    pygame.Rect(SPRITE_WIDTH // 2 - 4, 18, 8, 6),
                    0, 3.14,
                    1
                )
            elif direction == 1:  # up
                # Back of head
                pygame.draw.arc(
                    frame_surface,
                    (0, 0, 0),
                    pygame.Rect(SPRITE_WIDTH // 2 - 4, 18, 8, 6),
                    3.14, 6.28,
                    1
                )
            elif direction == 2:  # right
                # Side mouth
                pygame.draw.line(
                    frame_surface,
                    (0, 0, 0),
                    (SPRITE_WIDTH // 2 + 6, 18),
                    (SPRITE_WIDTH // 2 + 10, 18),
                    1
                )
            elif direction == 3:  # left
                # Side mouth mirrored
                pygame.draw.line(
                    frame_surface,
                    (0, 0, 0),
                    (SPRITE_WIDTH // 2 - 6, 18),
                    (SPRITE_WIDTH // 2 - 10, 18),
                    1
                )
            
            # Limbs in neutral position
            # Arms
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (12, 30),
                (4, 45),
                3
            )
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (36, 30),
                (44, 45),
                3
            )
            
            # Legs
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (18, 60),
                (14, 64),
                3
            )
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (30, 60),
                (34, 64),
                3
            )
            
        elif frame == 1:  # Walking pose 1
            # Body
            pygame.draw.ellipse(
                frame_surface, 
                color, 
                pygame.Rect(8, 20, 32, 40)
            )
            # Head
            pygame.draw.circle(
                frame_surface,
                (240, 220, 190),  # skin tone
                (SPRITE_WIDTH // 2, 18),
                12
            )
            # Eyes
            pygame.draw.circle(
                frame_surface,
                (0, 0, 0),
                (SPRITE_WIDTH // 2 - 4, 14),
                2
            )
            pygame.draw.circle(
                frame_surface,
                (0, 0, 0),
                (SPRITE_WIDTH // 2 + 4, 14),
                2
            )
            
            # Direction-specific features (same as frame 0)
            if direction == 0:  # down
                pygame.draw.arc(
                    frame_surface,
                    (0, 0, 0),
                    pygame.Rect(SPRITE_WIDTH // 2 - 4, 18, 8, 6),
                    0, 3.14,
                    1
                )
            elif direction == 1:  # up
                pygame.draw.arc(
                    frame_surface,
                    (0, 0, 0),
                    pygame.Rect(SPRITE_WIDTH // 2 - 4, 18, 8, 6),
                    3.14, 6.28,
                    1
                )
            elif direction == 2:  # right
                pygame.draw.line(
                    frame_surface,
                    (0, 0, 0),
                    (SPRITE_WIDTH // 2 + 6, 18),
                    (SPRITE_WIDTH // 2 + 10, 18),
                    1
                )
            elif direction == 3:  # left
                pygame.draw.line(
                    frame_surface,
                    (0, 0, 0),
                    (SPRITE_WIDTH // 2 - 6, 18),
                    (SPRITE_WIDTH // 2 - 10, 18),
                    1
                )
            
            # Arms in walking position 1
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (12, 30),
                (6, 40),
                3
            )
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (36, 30),
                (42, 40),
                3
            )
            
            # Legs in walking position 1
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (18, 60),
                (10, 64),
                3
            )
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (30, 60),
                (38, 64),
                3
            )
            
        else:  # Walking pose 2 (frame 2)
            # Body
            pygame.draw.ellipse(
                frame_surface, 
                color, 
                pygame.Rect(8, 20, 32, 40)
            )
            # Head
            pygame.draw.circle(
                frame_surface,
                (240, 220, 190),  # skin tone
                (SPRITE_WIDTH // 2, 18),
                12
            )
            # Eyes
            pygame.draw.circle(
                frame_surface,
                (0, 0, 0),
                (SPRITE_WIDTH // 2 - 4, 14),
                2
            )
            pygame.draw.circle(
                frame_surface,
                (0, 0, 0),
                (SPRITE_WIDTH // 2 + 4, 14),
                2
            )
            
            # Direction-specific features (same as frame 0)
            if direction == 0:  # down
                pygame.draw.arc(
                    frame_surface,
                    (0, 0, 0),
                    pygame.Rect(SPRITE_WIDTH // 2 - 4, 18, 8, 6),
                    0, 3.14,
                    1
                )
            elif direction == 1:  # up
                pygame.draw.arc(
                    frame_surface,
                    (0, 0, 0),
                    pygame.Rect(SPRITE_WIDTH // 2 - 4, 18, 8, 6),
                    3.14, 6.28,
                    1
                )
            elif direction == 2:  # right
                pygame.draw.line(
                    frame_surface,
                    (0, 0, 0),
                    (SPRITE_WIDTH // 2 + 6, 18),
                    (SPRITE_WIDTH // 2 + 10, 18),
                    1
                )
            elif direction == 3:  # left
                pygame.draw.line(
                    frame_surface,
                    (0, 0, 0),
                    (SPRITE_WIDTH // 2 - 6, 18),
                    (SPRITE_WIDTH // 2 - 10, 18),
                    1
                )
            
            # Arms in walking position 2 (opposite of position 1)
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (12, 30),
                (18, 45),
                3
            )
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (36, 30),
                (30, 45),
                3
            )
            
            # Legs in walking position 2 (opposite of position 1)
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (18, 60),
                (22, 64),
                3
            )
            pygame.draw.line(
                frame_surface,
                (0, 0, 0),
                (30, 60),
                (26, 64),
                3
            )
        
        # Add the frame to the sprite sheet
        sprite_sheet.blit(frame_surface, rect)

# Save the sprite sheet
pygame.image.save(sprite_sheet, OUTPUT_FILE)
print(f"Player sprite sheet generated: {OUTPUT_FILE}")

if __name__ == "__main__":
    # Display the sprite sheet if running the script directly
    pygame.display.set_mode((SPRITE_WIDTH * NUM_FRAMES, SPRITE_HEIGHT * NUM_DIRECTIONS))
    pygame.display.set_caption("Player Sprite Sheet")
    screen = pygame.display.get_surface()
    screen.fill((255, 255, 255))
    screen.blit(sprite_sheet, (0, 0))
    pygame.display.flip()
    
    # Wait for user to close the window
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
    
    pygame.quit() 