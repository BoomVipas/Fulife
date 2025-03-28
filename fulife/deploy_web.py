import os
import sys
import subprocess
import http.server
import socketserver
import webbrowser
from pathlib import Path

# Colors for terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

def print_color(text, color):
    print(f"{color}{text}{RESET}")

def build_web():
    """Build the game for web using pygbag"""
    print_color("Building Fulife for web...", YELLOW)
    
    try:
        # Run pygbag to build the web version
        subprocess.run([
            sys.executable, "-m", "pygbag", "--ume_block=0", "--title", "Fulife: Career Simulation Game", 
            "--app_name", "fulife", "--icon", "assets/images/icon.png", "--build", 
            "--package", "main.py"
        ], check=True)
        
        print_color("Build completed successfully!", GREEN)
        return True
    except subprocess.CalledProcessError as e:
        print_color(f"Error building web version: {e}", RED)
        return False
    except Exception as e:
        print_color(f"Unexpected error: {e}", RED)
        return False

def serve_web():
    """Serve the built web version locally"""
    build_dir = Path("build/web")
    
    if not build_dir.exists():
        print_color("Build directory not found. Run build first.", RED)
        return False
    
    # Set up a simple HTTP server
    os.chdir(build_dir)
    handler = http.server.SimpleHTTPRequestHandler
    port = 8000
    
    print_color(f"Starting server at http://localhost:{port}", GREEN)
    print_color("Press Ctrl+C to stop the server", YELLOW)
    
    try:
        # Open the browser
        webbrowser.open(f"http://localhost:{port}")
        
        # Start the server
        with socketserver.TCPServer(("", port), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print_color("\nServer stopped by user", YELLOW)
    
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        serve_web()
    else:
        success = build_web()
        if success and input("Do you want to serve the web version locally? (y/n): ").lower() == 'y':
            serve_web() 