#!/usr/bin/env python3
"""
Simple HTTP server to test the web version of FULIFE locally.
"""

import os
import sys
import subprocess
import http.server
import socketserver
import webbrowser
from pathlib import Path

# Port for the local server
PORT = 8000

def check_web_build():
    """Check if the web build exists and build it if not."""
    
    build_dir = Path("build/web")
    if not build_dir.exists() or not list(build_dir.glob("*")):
        print("Web build not found, running build_web.py first...")
        try:
            subprocess.run(["python", "build_web.py"], check=True)
            return True
        except subprocess.CalledProcessError:
            print("Failed to build web version.")
            return False
    return True

def serve_web():
    """Serve the web build locally."""
    
    build_dir = Path("build/web")
    
    # Change directory to the build directory
    os.chdir(build_dir)
    
    # Custom HTTP request handler
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            super().end_headers()
    
    # Create and configure the HTTP server
    handler = CustomHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Serving FULIFE web version at {url}")
        print("Press Ctrl+C to stop the server.")
        
        # Open the browser
        webbrowser.open(url)
        
        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    if check_web_build():
        serve_web()
    else:
        print("Cannot serve web version. Build process failed.")
        sys.exit(1) 