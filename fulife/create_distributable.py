#!/usr/bin/env python3
"""
Create a distributable package of the game that can be hosted on platforms like itch.io
"""

import os
import sys
import shutil
import zipfile
from pathlib import Path

def create_distributable():
    """Create a distributable package of the game"""
    print("Creating distributable package...")
    
    # Create distribution directory if it doesn't exist
    dist_dir = Path("dist")
    dist_dir.mkdir(exist_ok=True)
    
    # Create a temp directory for the files to be zipped
    temp_dir = dist_dir / "temp"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir()
    
    # Files and directories to include
    include_files = [
        "main.py",
        "README.md",
        "requirements.txt"
    ]
    
    include_dirs = [
        "scenes",
        "assets"
    ]
    
    # Copy individual files
    for file in include_files:
        if os.path.exists(file):
            shutil.copy(file, temp_dir)
    
    # Copy directories
    for directory in include_dirs:
        if os.path.exists(directory):
            shutil.copytree(directory, temp_dir / directory)
    
    # Create HTML file for web embedding
    create_embed_html(temp_dir)
    
    # Create a ZIP file
    zip_filename = dist_dir / "fulife_game.zip"
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, temp_dir))
    
    # Clean up temp directory
    shutil.rmtree(temp_dir)
    
    print(f"Distribution package created: {zip_filename}")
    return zip_filename

def create_embed_html(target_dir):
    """Create an HTML file for embedding the game"""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fulife: Career Simulation Game</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
            font-family: Arial, sans-serif;
        }
        .container {
            text-align: center;
            max-width: 800px;
            padding: 20px;
        }
        .download-btn {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 20px 0;
            cursor: pointer;
            border-radius: 5px;
        }
        .instructions {
            text-align: left;
            margin-top: 30px;
            background-color: #444;
            padding: 20px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Fulife: Career Simulation Game</h1>
        <p>A Python game that simulates different career paths through NPC interactions and mini-games.</p>
        
        <a href="fulife_game.zip" class="download-btn">Download the Game</a>
        
        <div class="instructions">
            <h2>How to Run the Game</h2>
            <ol>
                <li>Download and extract the game files</li>
                <li>Make sure you have Python 3.7+ installed</li>
                <li>Install the required dependencies:
                    <pre>pip install -r requirements.txt</pre>
                </li>
                <li>Run the game:
                    <pre>python main.py</pre>
                </li>
            </ol>
            
            <h2>Controls</h2>
            <ul>
                <li><strong>Movement:</strong> WASD or arrow keys</li>
                <li><strong>Interact:</strong> E key</li>
                <li><strong>Dialogue:</strong> Space key to advance</li>
                <li><strong>Inventory:</strong> I key</li>
            </ul>
        </div>
    </div>
</body>
</html>
"""
    
    with open(os.path.join(target_dir, "index.html"), "w") as f:
        f.write(html_content)

if __name__ == "__main__":
    create_distributable()
    print("You can now upload the ZIP file to platforms like itch.io for hosting") 