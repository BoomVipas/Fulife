// Logic Gates Minigame
// This file provides a simple logic gates puzzle minigame

// Logic gate types
const GATE_TYPES = {
    AND: "AND",
    OR: "OR",
    NOT: "NOT",
    XOR: "XOR",
    NAND: "NAND",
    NOR: "NOR"
};

// Logic gate images or representations
window.LOGIC_GATE_IMAGES = {
    AND: 'assets/gates/and.png',
    OR: 'assets/gates/or.png',
    NOT: 'assets/gates/not.png',
    XOR: 'assets/gates/xor.png',
    NAND: 'assets/gates/nand.png',
    NOR: 'assets/gates/nor.png'
};

// Logic gate evaluation functions
const GATE_FUNCTIONS = {
    AND: (a, b) => a && b,
    OR: (a, b) => a || b,
    NOT: (a) => !a,
    XOR: (a, b) => (a || b) && !(a && b),
    NAND: (a, b) => !(a && b),
    NOR: (a, b) => !(a || b)
};

// Initialize the Logic Gates minigame
function initLogicGateMinigame() {
    console.log("Initializing Logic Gates minigame");
    
    window.logicGateMinigame = {
        level: 1,
        score: 0,
        timeRemaining: 60,
        gates: [],
        inputs: [false, false],
        outputValue: false,
        targetValue: true,
        isActive: false,
        
        // Initialize a new level
        startLevel: function(level) {
            this.level = level || 1;
            this.timeRemaining = 60;
            this.generatePuzzle();
            this.isActive = true;
            window.gameState = "minigame";
        },
        
        // Generate a puzzle of appropriate difficulty
        generatePuzzle: function() {
            // Clear existing gates
            this.gates = [];
            
            // Set random inputs
            this.inputs = [
                Math.random() > 0.5,
                Math.random() > 0.5
            ];
            
            // Add gates based on level
            const numGates = Math.min(this.level + 1, 4);
            const availableGates = Object.keys(GATE_TYPES);
            
            for (let i = 0; i < numGates; i++) {
                const gateType = availableGates[Math.floor(Math.random() * availableGates.length)];
                this.gates.push({
                    type: gateType,
                    inputs: [],
                    output: false,
                    x: 250 + (i * 100),
                    y: 200 + (i * 50)
                });
            }
            
            // Connect gates in a simple chain for now
            for (let i = 0; i < this.gates.length; i++) {
                if (i === 0) {
                    // First gate connects to inputs
                    this.gates[i].inputs = [0, 1]; // Input indices
                } else {
                    // Others connect to previous gate output and a random input
                    this.gates[i].inputs = [
                        -i, // Negative indexes refer to previous gate outputs
                        Math.random() > 0.5 ? 0 : 1 // Random input
                    ];
                }
            }
            
            // Calculate initial output
            this.evaluateCircuit();
            
            // Set target to the opposite of current output to make puzzle challenging
            this.targetValue = !this.outputValue;
        },
        
        // Evaluate the entire circuit
        evaluateCircuit: function() {
            // Evaluate each gate
            for (let i = 0; i < this.gates.length; i++) {
                const gate = this.gates[i];
                const inputValues = gate.inputs.map(inputIdx => {
                    if (inputIdx >= 0) {
                        // This is a reference to puzzle inputs
                        return this.inputs[inputIdx];
                    } else {
                        // This is a reference to previous gate output
                        return this.gates[Math.abs(inputIdx) - 1].output;
                    }
                });
                
                // Evaluate gate
                if (gate.type === 'NOT') {
                    gate.output = GATE_FUNCTIONS[gate.type](inputValues[0]);
                } else {
                    gate.output = GATE_FUNCTIONS[gate.type](inputValues[0], inputValues[1]);
                }
            }
            
            // Final output is the output of the last gate
            if (this.gates.length > 0) {
                this.outputValue = this.gates[this.gates.length - 1].output;
            } else {
                this.outputValue = false;
            }
            
            return this.outputValue;
        },
        
        // Toggle an input value
        toggleInput: function(inputIdx) {
            if (inputIdx >= 0 && inputIdx < this.inputs.length) {
                this.inputs[inputIdx] = !this.inputs[inputIdx];
            this.evaluateCircuit();
                return true;
            }
            return false;
        },
        
        // Update minigame state
        update: function(deltaTime) {
            if (!this.isActive) return;
            
            // Update timer
            this.timeRemaining -= deltaTime;
            
            // Check for win/lose conditions
            if (this.timeRemaining <= 0) {
                // Player ran out of time
                console.log("Logic Gates minigame: Time's up!");
                this.isActive = false;
                window.gameState = "gameplay";
                return false;
            }
            
            if (this.outputValue === this.targetValue) {
                // Player solved the puzzle
                console.log(`Logic Gates minigame: Level ${this.level} completed!`);
                this.score += this.level * 100;
                
                // Level up or end game
                this.level++;
                if (this.level > 5) {
                    // Game completed
                    this.isActive = false;
                    window.gameState = "gameplay";
                    return true;
                } else {
                    // Next level
                    this.generatePuzzle();
                }
            }
            
            return true;
        },
        
        // Draw the minigame
        draw: function(ctx) {
            if (!this.isActive) return;
            
            // Clear canvas
            ctx.fillStyle = "#222";
            ctx.fillRect(0, 0, window.GAME_WIDTH, window.GAME_HEIGHT);
            
            // Draw title
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Logic Gates Puzzle - Level ${this.level}`, window.GAME_WIDTH / 2, 50);
            
            // Draw instructions
            ctx.font = "14px Arial";
            ctx.fillText("Make the output match the target value by toggling inputs", window.GAME_WIDTH / 2, 80);
            
            // Draw score
            ctx.textAlign = "left";
            ctx.fillText(`Score: ${this.score}`, 20, 30);
            
            // Draw timer
            ctx.fillText(`Time: ${Math.ceil(this.timeRemaining)}s`, 20, 50);
            
            // Draw circuit elements
            this.drawCircuit(ctx);
            
            // Draw target output
            ctx.textAlign = "center";
            ctx.font = "18px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Target:", window.GAME_WIDTH - 100, 30);
            ctx.fillStyle = this.targetValue ? "#4CAF50" : "#F44336";
            ctx.fillText(this.targetValue ? "TRUE" : "FALSE", window.GAME_WIDTH - 100, 50);
            
            // Draw current output
            ctx.fillStyle = "white";
            ctx.fillText("Current Output:", window.GAME_WIDTH - 100, 80);
            ctx.fillStyle = this.outputValue ? "#4CAF50" : "#F44336";
            ctx.fillText(this.outputValue ? "TRUE" : "FALSE", window.GAME_WIDTH - 100, 100);
            
            // Draw help text
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.font = "12px Arial";
            ctx.fillText("Click on inputs to toggle them", 20, window.GAME_HEIGHT - 20);
            ctx.textAlign = "right";
            ctx.fillText("ESC to exit", window.GAME_WIDTH - 20, window.GAME_HEIGHT - 20);
        },
        
        // Draw the circuit diagram
        drawCircuit: function(ctx) {
        // Draw inputs
            ctx.fillStyle = "white";
            ctx.font = "16px Arial";
            ctx.textAlign = "right";
            
            for (let i = 0; i < this.inputs.length; i++) {
                const y = 150 + (i * 80);
                ctx.fillText(`Input ${i + 1}:`, 100, y);
                
                // Draw input switch
                ctx.fillStyle = this.inputs[i] ? "#4CAF50" : "#F44336";
                ctx.fillRect(120, y - 15, 30, 30);
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(this.inputs[i] ? "1" : "0", 135, y + 5);
                ctx.textAlign = "right";
        }
        
        // Draw gates
            for (let i = 0; i < this.gates.length; i++) {
                const gate = this.gates[i];
                const x = gate.x;
                const y = gate.y;
                
                // Draw gate box
                ctx.fillStyle = "#555";
                ctx.fillRect(x - 30, y - 20, 60, 40);
                
                // Draw gate type
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(gate.type, x, y + 5);
                
                // Draw gate inputs
                for (let j = 0; j < gate.inputs.length; j++) {
                    const inputIdx = gate.inputs[j];
                    let sourceX, sourceY;
                    
                    if (inputIdx >= 0) {
                        // Connection from input
                        sourceX = 150;
                        sourceY = 150 + (inputIdx * 80);
                    } else {
                        // Connection from previous gate
                        const sourceGate = this.gates[Math.abs(inputIdx) - 1];
                        sourceX = sourceGate.x + 30;
                        sourceY = sourceGate.y;
                    }
                    
                    // Draw connection line
                    ctx.strokeStyle = "#AAA";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(sourceX, sourceY);
                    
                    // Draw with bent line
                    const inputY = y - 10 + (j * 20);
                    const midX = (sourceX + (x - 30)) / 2;
                    
                    ctx.lineTo(midX, sourceY);
                    ctx.lineTo(midX, inputY);
                    ctx.lineTo(x - 30, inputY);
                    
                    ctx.stroke();
                    
                    // Draw small circles at inputs
                    ctx.fillStyle = "#888";
                    ctx.beginPath();
                    ctx.arc(x - 30, inputY, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw gate output
                ctx.strokeStyle = "#AAA";
                ctx.beginPath();
                ctx.moveTo(x + 30, y);
                
                // If this is the last gate, extend line to the right edge
                if (i === this.gates.length - 1) {
                    ctx.lineTo(window.GAME_WIDTH - 150, y);
                    
                    // Draw output value
                    ctx.fillStyle = gate.output ? "#4CAF50" : "#F44336";
                    ctx.fillRect(window.GAME_WIDTH - 140, y - 15, 30, 30);
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.fillText(gate.output ? "1" : "0", window.GAME_WIDTH - 125, y + 5);
                }
                
                ctx.stroke();
            }
        },
        
        // Handle click interaction
        handleClick: function(x, y) {
            // Check if clicked on an input
            for (let i = 0; i < this.inputs.length; i++) {
                const inputY = 150 + (i * 80);
                
                if (x >= 120 && x <= 150 && y >= inputY - 15 && y <= inputY + 15) {
                    // Toggle this input
                    this.toggleInput(i);
                    return true;
                }
            }
            
            return false;
        }
    };
    
    return window.logicGateMinigame;
}

// Start the Logic Gates minigame
function startLogicGateMinigame() {
    if (!window.logicGateMinigame) {
        initLogicGateMinigame();
    }
    
    window.logicGateMinigame.startLevel(1);
    return window.logicGateMinigame;
} 