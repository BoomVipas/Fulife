import pygame
from scenes.base_scene import BaseScene

class LogicCircuit:
    def __init__(self):
        self.gates = []
        self.connections = []
        self.inputs = []
        self.outputs = []
        self.selected_gate = None
        self.is_complete = False
    
    def add_gate(self, gate_type, x, y):
        gate = {
            'type': gate_type,  # AND, OR, NOT, etc.
            'x': x,
            'y': y,
            'width': 60,
            'height': 40,
            'inputs': [],
            'output': None,
            'rect': pygame.Rect(x, y, 60, 40)
        }
        self.gates.append(gate)
        return gate
    
    def add_connection(self, source_gate, target_gate, source_pin=0, target_pin=0):
        connection = {
            'source': source_gate,
            'target': target_gate,
            'source_pin': source_pin,
            'target_pin': target_pin
        }
        self.connections.append(connection)
        
        # Add input to target gate
        if target_gate not in source_gate['inputs']:
            target_gate['inputs'].append(source_gate)
        
        # Set output for source gate
        source_gate['output'] = target_gate

class LogicPuzzleScene(BaseScene):
    def __init__(self, game_manager):
        super().__init__(game_manager)
        self.circuit = LogicCircuit()
        self.font = None
        self.title_font = None
        self.instruction_font = None
        self.gate_palette = []
        self.dragging = False
        self.drag_offset = (0, 0)
        self.puzzle_complete = False
    
    def initialize(self):
        # Load fonts
        pygame.font.init()  # Make sure font system is initialized
        try:
            self.font = pygame.font.SysFont('Arial', 16)
            self.title_font = pygame.font.SysFont('Arial', 28)
            self.instruction_font = pygame.font.SysFont('Arial', 18)
        except:
            # Fallback to default font if Arial is not available
            self.font = pygame.font.Font(None, 16)
            self.title_font = pygame.font.Font(None, 28)
            self.instruction_font = pygame.font.Font(None, 18)
        
        # Create gate palette (available logic gates to place)
        self.create_gate_palette()
        
        # Create initial puzzle layout
        self.create_puzzle()
    
    def create_gate_palette(self):
        # Create palette of gates that can be dragged onto the circuit
        palette_x = 700
        palette_y = 100
        spacing = 70
        
        # Add available gates
        self.gate_palette = [
            {'type': 'AND', 'rect': pygame.Rect(palette_x, palette_y, 60, 40)},
            {'type': 'OR', 'rect': pygame.Rect(palette_x, palette_y + spacing, 60, 40)},
            {'type': 'NOT', 'rect': pygame.Rect(palette_x, palette_y + spacing * 2, 60, 40)},
            {'type': 'XOR', 'rect': pygame.Rect(palette_x, palette_y + spacing * 3, 60, 40)}
        ]
    
    def create_puzzle(self):
        # Create a simple logic puzzle (GPU repair)
        # This is a simplified example - a real puzzle would be more complex
        
        # Add input nodes
        input1 = self.circuit.add_gate('INPUT', 100, 150)
        input1['label'] = 'Clock'
        self.circuit.inputs.append(input1)
        
        input2 = self.circuit.add_gate('INPUT', 100, 250)
        input2['label'] = 'Power'
        self.circuit.inputs.append(input2)
        
        # Add output node
        output = self.circuit.add_gate('OUTPUT', 500, 200)
        output['label'] = 'GPU'
        self.circuit.outputs.append(output)
        
        # The puzzle is to connect these correctly with logic gates
    
    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # Left mouse button
                # Check if clicked on a gate in the palette
                for gate in self.gate_palette:
                    if gate['rect'].collidepoint(event.pos):
                        # Create a new gate of this type
                        new_gate = self.circuit.add_gate(gate['type'], event.pos[0], event.pos[1])
                        self.dragging = True
                        self.drag_offset = (event.pos[0] - new_gate['x'], event.pos[1] - new_gate['y'])
                        self.circuit.selected_gate = new_gate
                        return
                
                # Check if clicked on an existing gate
                for gate in self.circuit.gates:
                    if gate['rect'].collidepoint(event.pos):
                        self.dragging = True
                        self.drag_offset = (event.pos[0] - gate['x'], event.pos[1] - gate['y'])
                        self.circuit.selected_gate = gate
                        return
        
        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1 and self.dragging:
                self.dragging = False
                
                # Check if the gate is connecting to another gate
                if self.circuit.selected_gate:
                    for gate in self.circuit.gates:
                        # Don't connect to self or inputs to outputs
                        if gate != self.circuit.selected_gate and gate['rect'].collidepoint(event.pos):
                            # Create connection between selected gate and this gate
                            self.circuit.add_connection(self.circuit.selected_gate, gate)
                            
                            # Check if puzzle is solved
                            self.check_puzzle_completion()
                
                self.circuit.selected_gate = None
        
        elif event.type == pygame.MOUSEMOTION:
            if self.dragging and self.circuit.selected_gate:
                # Move the selected gate
                self.circuit.selected_gate['x'] = event.pos[0] - self.drag_offset[0]
                self.circuit.selected_gate['y'] = event.pos[1] - self.drag_offset[1]
                self.circuit.selected_gate['rect'].x = self.circuit.selected_gate['x']
                self.circuit.selected_gate['rect'].y = self.circuit.selected_gate['y']
        
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                # Exit puzzle and return to game
                self.game_manager.change_scene('game')
    
    def check_puzzle_completion(self):
        # Check if the circuit is correctly connected
        # This is a simplified check - a real puzzle would have more complex validation
        
        # For this example, we'll consider it complete if all inputs are connected
        # to the output through at least one gate
        
        all_connected = True
        for input_gate in self.circuit.inputs:
            # Check if there's a path from this input to an output
            if not self.has_path_to_output(input_gate):
                all_connected = False
                break
        
        if all_connected and len(self.circuit.connections) >= 3:
            self.puzzle_complete = True
            print("Puzzle complete!")
    
    def has_path_to_output(self, gate, visited=None):
        if visited is None:
            visited = set()
        
        if gate in visited:
            return False
        
        visited.add(gate)
        
        if gate in self.circuit.outputs:
            return True
        
        if gate['output'] is not None:
            return self.has_path_to_output(gate['output'], visited)
        
        return False
    
    def update(self):
        pass
    
    def draw(self, screen):
        # Clear screen with background color
        screen.fill((40, 40, 60))
        
        # Draw title
        title_text = self.title_font.render("GPU Repair - Logic Circuit Puzzle", True, (255, 255, 255))
        screen.blit(title_text, (20, 20))
        
        # Draw instructions
        instruction_text = self.instruction_font.render(
            "Drag logic gates to connect inputs to outputs. Press ESC to exit.", 
            True, (200, 200, 200))
        screen.blit(instruction_text, (20, 60))
        
        # Draw connections
        for connection in self.circuit.connections:
            source = connection['source']
            target = connection['target']
            
            start_pos = (source['x'] + source['width'], source['y'] + source['height'] // 2)
            end_pos = (target['x'], target['y'] + target['height'] // 2)
            
            pygame.draw.line(screen, (150, 150, 255), start_pos, end_pos, 2)
            # Draw arrow at end
            pygame.draw.circle(screen, (150, 150, 255), end_pos, 3)
        
        # Draw gates
        for gate in self.circuit.gates:
            # Draw gate rectangle
            color = (100, 100, 150)
            if gate['type'] == 'INPUT':
                color = (100, 200, 100)
            elif gate['type'] == 'OUTPUT':
                color = (200, 100, 100)
            elif gate['type'] == 'AND':
                color = (100, 100, 200)
            elif gate['type'] == 'OR':
                color = (200, 100, 200)
            elif gate['type'] == 'NOT':
                color = (100, 200, 200)
            elif gate['type'] == 'XOR':
                color = (200, 200, 100)
            
            pygame.draw.rect(screen, color, gate['rect'])
            pygame.draw.rect(screen, (255, 255, 255), gate['rect'], 2)
            
            # Draw gate label
            if 'label' in gate:
                label_text = self.font.render(gate['label'], True, (255, 255, 255))
            else:
                label_text = self.font.render(gate['type'], True, (255, 255, 255))
            
            text_rect = label_text.get_rect(center=gate['rect'].center)
            screen.blit(label_text, text_rect)
        
        # Draw gate palette
        pygame.draw.rect(screen, (60, 60, 80), pygame.Rect(680, 80, 100, 300))
        palette_title = self.font.render("Gates", True, (255, 255, 255))
        screen.blit(palette_title, (700, 85))
        
        for gate in self.gate_palette:
            pygame.draw.rect(screen, (100, 100, 150), gate['rect'])
            pygame.draw.rect(screen, (255, 255, 255), gate['rect'], 2)
            
            gate_text = self.font.render(gate['type'], True, (255, 255, 255))
            text_rect = gate_text.get_rect(center=gate['rect'].center)
            screen.blit(gate_text, text_rect)
        
        # Draw completion message if puzzle is solved
        if self.puzzle_complete:
            overlay = pygame.Surface((screen.get_width(), screen.get_height()))
            overlay.set_alpha(128)
            overlay.fill((0, 0, 0))
            screen.blit(overlay, (0, 0))
            
            complete_text = self.title_font.render("Puzzle Complete! GPU Repaired!", True, (255, 255, 100))
            text_rect = complete_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2))
            screen.blit(complete_text, text_rect)
            
            instruction = self.instruction_font.render("Press ESC to return to game", True, (200, 200, 200))
            inst_rect = instruction.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 + 50))
            screen.blit(instruction, inst_rect) 