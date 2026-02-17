# WinterDrad - Browser-Based Minecraft Voxel Game

A Minecraft-inspired voxel game that runs entirely in your web browser using WebGL!

## 🚀 Quick Start - How to Play

**The easiest way to play:**

### On Linux/Mac:
```bash
./play.sh
```

### On Windows:
```batch
play.bat
```

**That's it!** The script will start a web server and open the game in your browser automatically.

### Manual Method:

If the scripts don't work, you can manually:

1. Start a web server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open your browser and go to: `http://localhost:8080`

3. Click on the game canvas to start playing!

### 🎮 Controls:

- **Click** on the canvas to capture mouse control
- **W** - Move forward
- **S** - Move backward  
- **A** - Strafe left
- **D** - Strafe right
- **Mouse** - Look around
- **ESC** - Release mouse control

---

## Features

- **3D Voxel World**: A procedurally generated 32×8×32 block world with grass and dirt blocks
- **First-Person Camera**: Navigate through the world with smooth camera controls
- **Mouse Look**: Full 360° camera rotation with mouse control
- **WASD Movement**: Familiar FPS-style movement controls
- **WebGL Rendering**: Hardware-accelerated 3D graphics using WebGL
- **Face Culling**: Optimized rendering - only visible block faces are drawn

## How to Play

### Running Locally

1. Clone this repository
2. Start a local web server in the project directory:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Or using Python 2
   python -m SimpleHTTPServer 8080
   
   # Or using Node.js
   npx http-server -p 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`
4. Click on the canvas to capture mouse control
5. Use the controls below to play!

### Controls

- **W** - Move forward
- **S** - Move backward
- **A** - Strafe left
- **D** - Strafe right
- **Mouse** - Look around
- **ESC** - Release mouse control

## Technical Details

### Architecture

The game is built with vanilla JavaScript using ES6 modules:

- **world.js** - Manages the voxel world data structure
- **camera.js** - Handles camera position, rotation, and projection matrices
- **input.js** - Processes keyboard and mouse input
- **renderer.js** - WebGL rendering engine with vertex/fragment shaders
- **main.js** - Game loop and initialization

### World Generation

The world is a simple flat terrain with:
- Dirt blocks filling the lower portion
- A grass layer on top
- Sky rendered with a pleasant blue color

### Rendering

- Uses WebGL for hardware-accelerated 3D rendering
- Implements face culling to only render visible block faces
- Vertex data includes position and color attributes
- Shaders handle transformation from world space to screen space

## Browser Compatibility

This game requires a modern web browser with WebGL support:
- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ❌ Internet Explorer (not supported)

## 🔧 Troubleshooting

### The game doesn't load or shows a blank screen
- Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- Check that WebGL is enabled in your browser
- Try opening the browser console (F12) to check for errors

### The mouse doesn't work / I can't look around
- Click on the game canvas first to capture mouse control
- Look for the status message at the bottom of the screen
- If pointer lock fails, try clicking the canvas again

### Python not found error
- Install Python from [python.org](https://www.python.org/downloads/)
- Or use an alternative web server:
  ```bash
  # Using Node.js
  npx http-server -p 8080
  
  # Using PHP
  php -S localhost:8080
  ```

### The game is slow / low FPS
- The game is optimized for 60 FPS
- Check the green FPS counter in the top-right
- Close other browser tabs or applications
- Try using Chrome for best performance

### Can't move or controls don't work
- Make sure you've clicked on the canvas (pointer lock must be active)
- Check the status indicator at the bottom - it should say "Playing"
- Press ESC to release, then click the canvas again

## Original Java Version

This repository also contains the original Java/LWJGL implementation in the `src/` directory. The browser version is a faithful recreation of the Java version's functionality using web technologies.

## License

This is an educational project inspired by Minecraft.

## Credits

Created as a browser-based voxel engine demonstration, inspired by Minecraft's blocky aesthetic and gameplay.
