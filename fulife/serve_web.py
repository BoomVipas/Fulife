#!/usr/bin/env python3
"""
Simple script to run Pygbag and serve the game in a web browser
"""

import os
import sys
import subprocess
import webbrowser

if __name__ == "__main__":
    print("Starting Pygbag web server...")
    
    try:
        # Run pygbag with the server directly (no build step)
        process = subprocess.Popen([
            sys.executable, "-m", "pygbag", "--ume_block=0", 
            "--title", "Fulife: Career Simulation Game", 
            "--app_name", "fulife", 
            "main.py"
        ])
        
        # Open the browser after a short delay
        import time
        time.sleep(3)  # Give pygbag time to start
        
        # Open the default browser
        webbrowser.open("http://localhost:8000")
        
        print("Web server running at http://localhost:8000")
        print("Press Ctrl+C to stop the server.")
        
        # Wait for the process to complete (or be interrupted)
        process.wait()
    
    except KeyboardInterrupt:
        print("\nStopping web server...")
        # Try to terminate the process gracefully
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            # If it doesn't terminate in time, kill it
            process.kill()
        print("Web server stopped.")
    
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1) 