#!/usr/bin/env python3
"""
Build script for creating a web version of FULIFE game using Pygbag.
This creates a web-compatible version that can be played directly in a browser.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def build_web_version():
    """Build a web-compatible version of the game using Pygbag."""
    
    print("Building web version of FULIFE...")
    
    # Create web directory if it doesn't exist
    web_dir = Path("web")
    if not web_dir.exists():
        web_dir.mkdir()
    
    # Run pygbag on web_main.py to create the web version
    try:
        # Call pygbag with the web_main.py file
        result = subprocess.run(
            ["pygbag", "--ume_block=0", "web_main.py"],
            check=True
        )
        
        if result.returncode == 0:
            print("\nWeb build completed successfully!")
            print("\nYou can now upload the 'build/web' directory to itch.io:")
            print("1. Go to your itch.io project page")
            print("2. Choose 'HTML' as the project type")
            print("3. Upload the contents of the 'build/web' directory")
            print("4. Check 'This file will be played in the browser'")
            print("5. Save and your game will be playable directly in the browser via URL")
        else:
            print("Web build failed. Check the pygbag output for errors.")
    
    except FileNotFoundError:
        print("Error: pygbag not found. Make sure it's installed with: pip install pygbag")
    except subprocess.CalledProcessError as e:
        print(f"Build process failed with error code {e.returncode}")
        print(e.output if hasattr(e, 'output') else "No error output available.")
    
    return 0

if __name__ == "__main__":
    sys.exit(build_web_version()) 