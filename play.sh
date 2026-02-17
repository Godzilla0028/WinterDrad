#!/bin/bash
# Quick start script for WinterDrad browser game
# This script starts a local web server and opens the game in your browser

echo "🎮 Starting WinterDrad Voxel Game..."
echo ""

# Get the directory where this script is located
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Check for Python 3
if command -v python3 &> /dev/null; then
    echo "✓ Found Python 3"
    echo "📡 Starting web server on http://localhost:8080"
    echo ""
    echo "🌐 Opening game in browser..."
    echo "   (If browser doesn't open automatically, go to http://localhost:8080)"
    echo ""
    echo "📋 Controls:"
    echo "   - Click on the game canvas to start"
    echo "   - WASD to move"
    echo "   - Mouse to look around"
    echo "   - ESC to release mouse"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    
    # Try to open browser (cross-platform)
    if command -v xdg-open &> /dev/null; then
        (sleep 2 && xdg-open http://localhost:8080) &
    elif command -v open &> /dev/null; then
        (sleep 2 && open http://localhost:8080) &
    fi
    
    # Start server
    python3 -m http.server 8080
    
elif command -v python &> /dev/null; then
    echo "✓ Found Python"
    echo "📡 Starting web server on http://localhost:8080"
    echo ""
    echo "🌐 Opening game in browser..."
    echo "   (If browser doesn't open automatically, go to http://localhost:8080)"
    echo ""
    echo "📋 Controls:"
    echo "   - Click on the game canvas to start"
    echo "   - WASD to move"
    echo "   - Mouse to look around"
    echo "   - ESC to release mouse"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    
    # Try to open browser
    if command -v xdg-open &> /dev/null; then
        (sleep 2 && xdg-open http://localhost:8080) &
    elif command -v open &> /dev/null; then
        (sleep 2 && open http://localhost:8080) &
    fi
    
    # Start server
    python -m SimpleHTTPServer 8080
    
else
    echo "❌ Error: Python not found!"
    echo ""
    echo "Please install Python and try again, or manually start a web server:"
    echo "  npm install -g http-server"
    echo "  http-server -p 8080"
    exit 1
fi
