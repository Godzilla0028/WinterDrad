// Camera.js - Manages camera position and view
export class Camera {
    constructor(fov, aspect, zNear, zFar) {
        this.fov = fov;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;
        
        this.position = { x: 0, y: 4, z: 8 };
        this.pitch = 0; // rotation around X axis
        this.yaw = -90; // rotation around Y axis (facing -Z initially)
        
        this.mouseSensitivity = 0.1;
        this.movementSpeed = 5;
        
        this.front = { x: 0, y: 0, z: -1 };
        this.right = { x: 1, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        
        this.updateVectors();
    }

    updateVectors() {
        const pitchRad = this.pitch * Math.PI / 180;
        const yawRad = this.yaw * Math.PI / 180;
        
        this.front.x = Math.cos(yawRad) * Math.cos(pitchRad);
        this.front.y = Math.sin(pitchRad);
        this.front.z = Math.sin(yawRad) * Math.cos(pitchRad);
        
        // Normalize front
        const len = Math.sqrt(this.front.x * this.front.x + 
                            this.front.y * this.front.y + 
                            this.front.z * this.front.z);
        this.front.x /= len;
        this.front.y /= len;
        this.front.z /= len;
        
        // Calculate right vector (cross product of front and world up)
        const worldUp = { x: 0, y: 1, z: 0 };
        this.right.x = this.front.y * worldUp.z - this.front.z * worldUp.y;
        this.right.y = this.front.z * worldUp.x - this.front.x * worldUp.z;
        this.right.z = this.front.x * worldUp.y - this.front.y * worldUp.x;
        
        const rightLen = Math.sqrt(this.right.x * this.right.x + 
                                  this.right.y * this.right.y + 
                                  this.right.z * this.right.z);
        this.right.x /= rightLen;
        this.right.y /= rightLen;
        this.right.z /= rightLen;
        
        // Calculate up vector
        this.up.x = this.right.y * this.front.z - this.right.z * this.front.y;
        this.up.y = this.right.z * this.front.x - this.right.x * this.front.z;
        this.up.z = this.right.x * this.front.y - this.right.y * this.front.x;
    }

    processMouseMovement(deltaX, deltaY) {
        this.yaw += deltaX * this.mouseSensitivity;
        this.pitch -= deltaY * this.mouseSensitivity;
        
        // Clamp pitch
        this.pitch = Math.max(-89, Math.min(89, this.pitch));
        
        this.updateVectors();
    }

    processKeyboard(input, delta) {
        const velocity = this.movementSpeed * delta;
        
        if (input.keys['w']) {
            this.position.x += this.front.x * velocity;
            this.position.y += this.front.y * velocity;
            this.position.z += this.front.z * velocity;
        }
        if (input.keys['s']) {
            this.position.x -= this.front.x * velocity;
            this.position.y -= this.front.y * velocity;
            this.position.z -= this.front.z * velocity;
        }
        if (input.keys['a']) {
            this.position.x -= this.right.x * velocity;
            this.position.y -= this.right.y * velocity;
            this.position.z -= this.right.z * velocity;
        }
        if (input.keys['d']) {
            this.position.x += this.right.x * velocity;
            this.position.y += this.right.y * velocity;
            this.position.z += this.right.z * velocity;
        }
    }

    getViewMatrix() {
        const matrix = new Float32Array(16);
        
        // Calculate center point (position + front)
        const center = {
            x: this.position.x + this.front.x,
            y: this.position.y + this.front.y,
            z: this.position.z + this.front.z
        };
        
        // Create lookAt matrix
        const f = {
            x: center.x - this.position.x,
            y: center.y - this.position.y,
            z: center.z - this.position.z
        };
        const fLen = Math.sqrt(f.x * f.x + f.y * f.y + f.z * f.z);
        f.x /= fLen; f.y /= fLen; f.z /= fLen;
        
        const s = {
            x: f.y * this.up.z - f.z * this.up.y,
            y: f.z * this.up.x - f.x * this.up.z,
            z: f.x * this.up.y - f.y * this.up.x
        };
        const sLen = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
        s.x /= sLen; s.y /= sLen; s.z /= sLen;
        
        const u = {
            x: s.y * f.z - s.z * f.y,
            y: s.z * f.x - s.x * f.z,
            z: s.x * f.y - s.y * f.x
        };
        
        matrix[0] = s.x;
        matrix[1] = u.x;
        matrix[2] = -f.x;
        matrix[3] = 0;
        
        matrix[4] = s.y;
        matrix[5] = u.y;
        matrix[6] = -f.y;
        matrix[7] = 0;
        
        matrix[8] = s.z;
        matrix[9] = u.z;
        matrix[10] = -f.z;
        matrix[11] = 0;
        
        matrix[12] = -(s.x * this.position.x + s.y * this.position.y + s.z * this.position.z);
        matrix[13] = -(u.x * this.position.x + u.y * this.position.y + u.z * this.position.z);
        matrix[14] = (f.x * this.position.x + f.y * this.position.y + f.z * this.position.z);
        matrix[15] = 1;
        
        return matrix;
    }

    getProjectionMatrix() {
        const matrix = new Float32Array(16);
        const f = 1.0 / Math.tan(this.fov / 2);
        const rangeInv = 1.0 / (this.zNear - this.zFar);
        
        matrix[0] = f / this.aspect;
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 0;
        
        matrix[4] = 0;
        matrix[5] = f;
        matrix[6] = 0;
        matrix[7] = 0;
        
        matrix[8] = 0;
        matrix[9] = 0;
        matrix[10] = (this.zNear + this.zFar) * rangeInv;
        matrix[11] = -1;
        
        matrix[12] = 0;
        matrix[13] = 0;
        matrix[14] = this.zNear * this.zFar * rangeInv * 2;
        matrix[15] = 0;
        
        return matrix;
    }
}
