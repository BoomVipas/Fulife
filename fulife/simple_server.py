import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

def serve_local():
    """Serve the built web files from the build/web directory"""
    build_dir = Path("build/web")
    
    if not build_dir.exists():
        print("Build directory not found. Please run the build first.")
        return False
    
    # Change to the build directory
    os.chdir(build_dir)
    
    # Set up a simple HTTP server
    handler = http.server.SimpleHTTPRequestHandler
    port = 8000
    
    print(f"Starting server at http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    # Open the browser
    webbrowser.open(f"http://localhost:{port}")
    
    # Start the server
    with socketserver.TCPServer(("", port), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped by user")
    
    return True

if __name__ == "__main__":
    serve_local() 