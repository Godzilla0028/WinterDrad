# WinterDrad

A Minecraft-like 3D block building game built with HTML5, CSS, and Three.js.

## Features

- 🎮 **3D Block World**: Explore a procedurally generated 3D voxel world
- 🏗️ **Build & Destroy**: Place and break blocks like in Minecraft
- 🎨 **Minecraft-like Textures**: Grass, dirt, stone, and wood blocks with pixelated textures
- 🕹️ **First-Person Controls**: WASD movement, mouse look, and jumping
- 🌍 **Terrain Generation**: Simple procedural terrain with hills and valleys

## How to Run

### Option 1: Local Web Server (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/Godzilla0028/WinterDrad.git
   cd WinterDrad
   ```

2. Start a local web server:
   
   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   **Using Node.js (npx):**
   ```bash
   npx http-server -p 8000
   ```

3. Open your browser and go to: `http://localhost:8000`

### Option 2: Open Directly

Simply double-click `index.html` to open it in your web browser. Note that some browsers may have restrictions with local files.

## Controls

- **WASD** - Move around
- **Space** - Jump
- **Mouse** - Look around (click to lock mouse)
- **Left Click** - Break/destroy block
- **Right Click** - Place block
- **1-4** - Select block type (Grass, Dirt, Stone, Wood)
- **ESC** - Release mouse / Pause

## Game Instructions

1. Click "Start Game" on the main menu
2. Click on the game screen to lock your mouse cursor
3. Use WASD to move around the world
4. Use your mouse to look around
5. Left-click to break blocks
6. Right-click to place blocks
7. Press 1-4 to select different block types

## Technical Details

- Built with pure JavaScript (ES6+)
- Three.js for 3D rendering (WebGL)
- No build process required
- Runs entirely in the browser

## Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

MIT License - Feel free to use and modify!
