// Logic Gates Minigame
class LogicGateMinigame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.draggingGate = null;
        this.gates = [];
        this.connections = [];
        this.inputs = [
            { id: 'A', x: 50, y: 100, value: false, connectorX: 100, connectorY: 100 },
            { id: 'B', x: 50, y: 200, value: false, connectorX: 100, connectorY: 200 },
            { id: 'C', x: 50, y: 300, value: false, connectorX: 100, connectorY: 300 },
            { id: 'D', x: 50, y: 400, value: false, connectorX: 100, connectorY: 400 }
        ];
        this.output = { x: 650, y: 250, value: false, connectorX: 600, connectorY: 250 };
        
        // Available gates to drag
        this.availableGates = [
            { type: 'AND', x: 700, y: 150, width: 60, height: 40, inputs: [], output: null },
            { type: 'OR', x: 700, y: 220, width: 60, height: 40, inputs: [], output: null }
        ];
        
        // Initialize
        this.init();
    }
    
    init() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Initial draw
        this.draw();
    }
    
    // Handle mouse down event
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on an available gate
        for (const gate of this.availableGates) {
            if (this.isPointInRect(x, y, gate.x, gate.y, gate.width, gate.height)) {
                // Create a new gate of the same type
                const newGate = {
                    type: gate.type,
                    x: gate.x,
                    y: gate.y,
                    width: gate.width,
                    height: gate.height,
                    inputs: [],
                    output: null
                };
                this.gates.push(newGate);
                this.draggingGate = newGate;
                break;
            }
        }
        
        // Check if clicking on a placed gate
        if (!this.draggingGate) {
            for (const gate of this.gates) {
                if (this.isPointInRect(x, y, gate.x, gate.y, gate.width, gate.height)) {
                    this.draggingGate = gate;
                    break;
                }
            }
        }
        
        // Check if clicking on an input to toggle it
        if (!this.draggingGate) {
            for (const input of this.inputs) {
                if (this.isPointInCircle(x, y, input.x, input.y, 15)) {
                    input.value = !input.value;
                    this.evaluateCircuit();
                    this.draw();
                    break;
                }
            }
        }
        
        // Check if clicking to make a connection
        if (!this.draggingGate) {
            // Get the starting point (either an input or a gate output)
            let startPoint = null;
            
            // Check inputs
            for (const input of this.inputs) {
                if (this.isPointInCircle(x, y, input.connectorX, input.connectorY, 10)) {
                    startPoint = { type: 'input', id: input.id };
                    break;
                }
            }
            
            // Check gate outputs
            if (!startPoint) {
                for (const gate of this.gates) {
                    const outputX = gate.x + gate.width;
                    const outputY = gate.y + gate.height / 2;
                    if (this.isPointInCircle(x, y, outputX, outputY, 10)) {
                        startPoint = { type: 'gate', id: this.gates.indexOf(gate) };
                        break;
                    }
                }
            }
            
            if (startPoint) {
                // Now look for a potential end point
                // Check gate inputs
                for (const gate of this.gates) {
                    const inputY1 = gate.y + gate.height / 3;
                    const inputY2 = gate.y + (2 * gate.height) / 3;
                    
                    if (this.isPointInCircle(x, y, gate.x, inputY1, 10)) {
                        // Connect to first input of gate
                        this.addConnection(startPoint, { type: 'gate_input', id: this.gates.indexOf(gate), inputIndex: 0 });
                        break;
                    }
                    
                    if (this.isPointInCircle(x, y, gate.x, inputY2, 10)) {
                        // Connect to second input of gate
                        this.addConnection(startPoint, { type: 'gate_input', id: this.gates.indexOf(gate), inputIndex: 1 });
                        break;
                    }
                }
                
                // Check output connection
                if (this.isPointInCircle(x, y, this.output.connectorX, this.output.connectorY, 10)) {
                    this.addConnection(startPoint, { type: 'output' });
                }
            }
        }
    }
    
    // Handle mouse move event
    handleMouseMove(e) {
        if (this.draggingGate) {
            const rect = this.canvas.getBoundingClientRect();
            this.draggingGate.x = e.clientX - rect.left - this.draggingGate.width / 2;
            this.draggingGate.y = e.clientY - rect.top - this.draggingGate.height / 2;
            
            // Keep the gate within the canvas
            this.draggingGate.x = Math.max(100, Math.min(this.draggingGate.x, 550));
            this.draggingGate.y = Math.max(50, Math.min(this.draggingGate.y, 500));
            
            this.draw();
        }
    }
    
    // Handle mouse up event
    handleMouseUp() {
        if (this.draggingGate) {
            this.draggingGate = null;
            this.evaluateCircuit();
            this.draw();
        }
    }
    
    // Add a connection between components
    addConnection(start, end) {
        // Check if a similar connection already exists
        for (const conn of this.connections) {
            if (JSON.stringify(conn.start) === JSON.stringify(start) && 
                JSON.stringify(conn.end) === JSON.stringify(end)) {
                return; // Connection already exists
            }
        }
        
        this.connections.push({ start, end });
        this.evaluateCircuit();
        this.draw();
    }
    
    // Evaluate the circuit
    evaluateCircuit() {
        // Reset gate inputs
        for (const gate of this.gates) {
            gate.inputs = [];
        }
        
        // Process connections
        for (const conn of this.connections) {
            let sourceValue = false;
            
            // Get source value
            if (conn.start.type === 'input') {
                const input = this.inputs.find(input => input.id === conn.start.id);
                sourceValue = input.value;
            } else if (conn.start.type === 'gate') {
                const gate = this.gates[conn.start.id];
                sourceValue = this.evaluateGate(gate);
            }
            
            // Apply to destination
            if (conn.end.type === 'gate_input') {
                const gate = this.gates[conn.end.id];
                if (gate.inputs.length <= conn.end.inputIndex) {
                    // Fill with false values up to the needed index
                    while (gate.inputs.length < conn.end.inputIndex) {
                        gate.inputs.push(false);
                    }
                    gate.inputs.push(sourceValue);
                } else {
                    gate.inputs[conn.end.inputIndex] = sourceValue;
                }
            } else if (conn.end.type === 'output') {
                this.output.value = sourceValue;
            }
        }
        
        // Check if solved
        if (this.output.value === true) {
            setTimeout(() => {
                alert("Congratulations! You've solved the circuit puzzle!");
                this.onComplete && this.onComplete();
            }, 500);
        }
    }
    
    // Evaluate a gate
    evaluateGate(gate) {
        if (gate.inputs.length < 2) {
            return false; // Not enough inputs
        }
        
        if (gate.type === 'AND') {
            return gate.inputs[0] && gate.inputs[1];
        } else if (gate.type === 'OR') {
            return gate.inputs[0] || gate.inputs[1];
        }
        
        return false;
    }
    
    // Draw the circuit
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw connections
        this.ctx.strokeStyle = '#aaa';
        this.ctx.lineWidth = 2;
        for (const conn of this.connections) {
            let startX, startY, endX, endY;
            
            // Get start coordinates
            if (conn.start.type === 'input') {
                const input = this.inputs.find(input => input.id === conn.start.id);
                startX = input.connectorX;
                startY = input.connectorY;
            } else if (conn.start.type === 'gate') {
                const gate = this.gates[conn.start.id];
                startX = gate.x + gate.width;
                startY = gate.y + gate.height / 2;
            }
            
            // Get end coordinates
            if (conn.end.type === 'gate_input') {
                const gate = this.gates[conn.end.id];
                endX = gate.x;
                endY = conn.end.inputIndex === 0 ? 
                    gate.y + gate.height / 3 : 
                    gate.y + (2 * gate.height) / 3;
            } else if (conn.end.type === 'output') {
                endX = this.output.connectorX;
                endY = this.output.connectorY;
            }
            
            // Draw the line
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        // Draw inputs
        for (const input of this.inputs) {
            this.ctx.fillStyle = input.value ? '#3f3' : '#f33';
            this.ctx.beginPath();
            this.ctx.arc(input.x, input.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(input.id, input.x, input.y);
            
            // Draw connector
            this.ctx.fillStyle = '#999';
            this.ctx.beginPath();
            this.ctx.arc(input.connectorX, input.connectorY, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw gates
        for (const gate of this.gates) {
            this.drawGate(gate);
        }
        
        // Draw available gates
        for (const gate of this.availableGates) {
            this.drawGate(gate);
        }
        
        // Draw output
        this.ctx.fillStyle = this.output.value ? '#3f3' : '#f33';
        this.ctx.beginPath();
        this.ctx.arc(this.output.x, this.output.y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('OUT', this.output.x, this.output.y);
        
        // Draw output connector
        this.ctx.fillStyle = '#999';
        this.ctx.beginPath();
        this.ctx.arc(this.output.connectorX, this.output.connectorY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw instructions
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Drag AND and OR gates to build a circuit. Click inputs to toggle them.', 20, 30);
        this.ctx.fillText('Goal: Make the output = 1 (green)', 20, 60);
    }
    
    // Draw a gate
    drawGate(gate) {
        // Draw gate body
        this.ctx.fillStyle = '#4477aa';
        this.ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
        
        // Draw gate type
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(gate.type, gate.x + gate.width / 2, gate.y + gate.height / 2);
        
        // Draw input connectors
        this.ctx.fillStyle = '#999';
        const inputY1 = gate.y + gate.height / 3;
        const inputY2 = gate.y + (2 * gate.height) / 3;
        
        this.ctx.beginPath();
        this.ctx.arc(gate.x, inputY1, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(gate.x, inputY2, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw output connector
        this.ctx.beginPath();
        this.ctx.arc(gate.x + gate.width, gate.y + gate.height / 2, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Utility function to check if a point is in a rectangle
    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
    }
    
    // Utility function to check if a point is in a circle
    isPointInCircle(x, y, circleX, circleY, radius) {
        const dx = x - circleX;
        const dy = y - circleY;
        return dx * dx + dy * dy <= radius * radius;
    }
    
    // Set callback for when the puzzle is complete
    setOnCompleteCallback(callback) {
        this.onComplete = callback;
    }
}

// Function to initialize the minigame
function initLogicGateMinigame(canvasId, onComplete) {
    const minigame = new LogicGateMinigame(canvasId);
    minigame.setOnCompleteCallback(onComplete);
    return minigame;
}

// If we're in a browser environment, make this globally accessible
if (typeof window !== 'undefined') {
    window.initLogicGateMinigame = initLogicGateMinigame;
} 