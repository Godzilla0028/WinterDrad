// main.js - Entry point for the voxel game
import { World } from './world.js';
import { Camera } from './camera.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.fpsElement = document.getElementById('fps');
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.init();
    }

    init() {
        // Create world (32x8x32 like the Java version)
        this.world = new World(32, 8, 32);
        
        // Create camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new Camera(
            Math.PI * 70 / 180, // 70 degrees FOV
            aspect,
            0.01,  // near plane
            1000   // far plane
        );
        this.camera.position = { x: 0, y: 4, z: 8 };
        
        // Create input handler
        this.input = new Input(this.canvas);
        
        // Create renderer
        this.renderer = new Renderer(this.canvas, this.world);
        
        // Start game loop
        this.lastTime = performance.now() / 1000;
        this.loop();
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        
        const now = performance.now() / 1000;
        const delta = now - this.lastTime;
        this.lastTime = now;
        
        // Update FPS counter
        this.frameCount++;
        const nowMs = performance.now();
        if (nowMs - this.lastFpsUpdate >= 1000) {
            const fps = Math.round(this.frameCount * 1000 / (nowMs - this.lastFpsUpdate));
            this.fpsElement.textContent = `FPS: ${fps}`;
            this.frameCount = 0;
            this.lastFpsUpdate = nowMs;
        }
        
        // Process input
        const mouseMovement = this.input.getMouseMovement();
        if (this.input.isPointerLocked) {
            this.camera.processMouseMovement(mouseMovement.x, mouseMovement.y);
        }
        this.camera.processKeyboard(this.input, delta);
        
        // Render
        this.renderer.render(this.camera);
    }
}

// Start the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
