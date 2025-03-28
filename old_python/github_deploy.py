#!/usr/bin/env python3
"""
Deploy script for FULIFE web version to GitHub Pages.
This creates a web-compatible version and prepares it for GitHub Pages deployment.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import zipfile

def prepare_github_pages():
    """Prepare the web build for GitHub Pages deployment."""
    
    print("Preparing FULIFE web version for GitHub Pages...")
    
    # First, build the web version if it doesn't exist
    build_dir = Path("build/web")
    if not build_dir.exists() or not list(build_dir.glob("*")):
        print("Web build not found, running build_web.py first...")
        try:
            subprocess.run(["python", "build_web.py"], check=True)
        except subprocess.CalledProcessError:
            print("Failed to build web version. Exiting.")
            return 1
    
    # Create a GitHub Pages directory
    github_pages_dir = Path("github_pages")
    if github_pages_dir.exists():
        shutil.rmtree(github_pages_dir)
    github_pages_dir.mkdir()
    
    # Copy all files from build/web to github_pages
    for item in build_dir.glob("*"):
        if item.is_dir():
            shutil.copytree(item, github_pages_dir / item.name)
        else:
            shutil.copy2(item, github_pages_dir)
    
    # Create a simple README.md in the github_pages directory
    with open(github_pages_dir / "README.md", "w") as readme:
        readme.write("# FULIFE Game\n\n")
        readme.write("A life simulation game where you build your career and life.\n\n")
        readme.write("## Play the Game\n\n")
        readme.write("You can play the game directly in your browser by visiting the GitHub Pages URL.\n\n")
        readme.write("## Controls\n\n")
        readme.write("- WASD or Arrow keys: Move your character\n")
        readme.write("- E: Interact with NPCs and objects\n")
        readme.write("- I: Open inventory\n")
    
    # Create a .nojekyll file to prevent GitHub Pages from using Jekyll
    with open(github_pages_dir / ".nojekyll", "w") as nojekyll:
        pass
    
    # Create a zip file for manual upload if needed
    zip_file = Path("fulife_web.zip")
    if zip_file.exists():
        zip_file.unlink()
        
    with zipfile.ZipFile(zip_file, "w", zipfile.ZIP_DEFLATED) as zf:
        for item in github_pages_dir.glob("**/*"):
            if item.is_file():
                zf.write(item, item.relative_to(github_pages_dir))
    
    print("\nDeployment preparation complete!")
    print("\nTo deploy to GitHub Pages:")
    print("1. Create a GitHub repository (if you don't have one already)")
    print("2. Initialize git in the github_pages directory:")
    print("   cd github_pages")
    print("   git init")
    print("   git add .")
    print("   git commit -m \"Initial commit of web game\"")
    print("   git branch -M main")
    print("   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git")
    print("   git push -u origin main")
    print("3. In your GitHub repository settings, enable GitHub Pages from the main branch")
    print("4. Your game will be available at: https://YOUR_USERNAME.github.io/YOUR_REPO/")
    print("\nAlternatively, you can upload fulife_web.zip to itch.io as an HTML game.")
    
    return 0

if __name__ == "__main__":
    sys.exit(prepare_github_pages()) 