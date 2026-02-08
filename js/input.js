// Input.js - Handles keyboard and mouse input
export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.key.toLowerCase()] = false;
            
            // ESC to unlock pointer
            if (e.key === 'Escape') {
                document.exitPointerLock();
            }
        });
        
        // Mouse events
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.mouseMovement.x = e.movementX || 0;
                this.mouseMovement.y = e.movementY || 0;
            }
        });
    }

    getMouseMovement() {
        const movement = { ...this.mouseMovement };
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
        return movement;
    }
}
