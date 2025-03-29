# FULIFE Game Server Script
# This script starts a local web server to run the FULIFE game

Write-Host "`n======================= FULIFE GAME SERVER =======================`n" -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "  Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Check if we're in the right directory
$expectedFiles = @('index.html', 'start-page.html', 'game-page.html')
$missingFiles = $expectedFiles | Where-Object { -not (Test-Path $_) }

if ($missingFiles.Count -gt 0) {
    Write-Host "✗ Missing expected game files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "`nEnsure you're running this script from the 'docs' directory." -ForegroundColor Yellow
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "✓ All required game files found" -ForegroundColor Green

# Start the server
Write-Host "`nStarting local web server on port 8000..." -ForegroundColor Cyan
Write-Host "To test the game, open your browser and go to:" -ForegroundColor Yellow
Write-Host "http://localhost:8000" -ForegroundColor White

Write-Host "`nTo test specific pages directly:" -ForegroundColor Yellow
Write-Host "• Main Menu: http://localhost:8000/start-page.html" -ForegroundColor White
Write-Host "• Cutscene: http://localhost:8000/cutscene-page.html" -ForegroundColor White
Write-Host "• Gameplay: http://localhost:8000/game-page.html" -ForegroundColor White
Write-Host "• Gameplay (Debug Mode): http://localhost:8000/game-page.html#debug" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop the server when finished`n" -ForegroundColor Magenta
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Run the server
python -m http.server 8000 