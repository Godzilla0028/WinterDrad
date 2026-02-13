// Renderer.js - Handles WebGL rendering
import { World } from './world.js';

export class Renderer {
    constructor(canvas, world) {
        this.canvas = canvas;
        this.world = world;
        
        // Get WebGL context
        this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        this.initGL();
        this.createShaders();
        this.buildMesh();
    }

    initGL() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.53, 0.81, 0.92, 1.0); // Sky blue
    }

    createShaders() {
        const gl = this.gl;
        
        // Vertex shader
        const vertexShaderSource = `
            attribute vec3 aPos;
            attribute vec3 aColor;
            
            uniform mat4 u_MVP;
            
            varying vec3 vColor;
            
            void main() {
                vColor = aColor;
                gl_Position = u_MVP * vec4(aPos, 1.0);
            }
        `;
        
        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            varying vec3 vColor;
            
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link: ' + gl.getProgramInfoLog(this.program));
        }
        
        // Get attribute and uniform locations
        this.positionLocation = gl.getAttribLocation(this.program, 'aPos');
        this.colorLocation = gl.getAttribLocation(this.program, 'aColor');
        this.mvpLocation = gl.getUniformLocation(this.program, 'u_MVP');
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compilation failed: ' + info);
        }
        
        return shader;
    }

    buildMesh() {
        const gl = this.gl;
        const vertices = [];
        
        // Colors
        const colorGrass = [0.2, 0.8, 0.2];
        const colorDirt = [0.59, 0.41, 0.17];
        
        // Build vertex data for all visible faces
        for (let x = 0; x < this.world.width; x++) {
            for (let y = 0; y < this.world.height; y++) {
                for (let z = 0; z < this.world.depth; z++) {
                    const id = this.world.getBlock(x, y, z);
                    if (id === World.AIR) continue;
                    
                    const color = id === World.GRASS ? colorGrass : colorDirt;
                    const cx = x, cy = y, cz = z;
                    const s = 0.5;
                    
                    // Check each face and add if neighbor is transparent
                    // -Z face (back)
                    if (this.isTransparent(x, y, z - 1)) {
                        this.addQuad(vertices, 
                            [cx - s, cy - s, cz - s], [cx + s, cy - s, cz - s],
                            [cx + s, cy + s, cz - s], [cx - s, cy + s, cz - s],
                            color);
                    }
                    
                    // +Z face (front)
                    if (this.isTransparent(x, y, z + 1)) {
                        this.addQuad(vertices,
                            [cx + s, cy - s, cz + s], [cx - s, cy - s, cz + s],
                            [cx - s, cy + s, cz + s], [cx + s, cy + s, cz + s],
                            color);
                    }
                    
                    // -X face (left)
                    if (this.isTransparent(x - 1, y, z)) {
                        this.addQuad(vertices,
                            [cx - s, cy - s, cz + s], [cx - s, cy - s, cz - s],
                            [cx - s, cy + s, cz - s], [cx - s, cy + s, cz + s],
                            color);
                    }
                    
                    // +X face (right)
                    if (this.isTransparent(x + 1, y, z)) {
                        this.addQuad(vertices,
                            [cx + s, cy - s, cz - s], [cx + s, cy - s, cz + s],
                            [cx + s, cy + s, cz + s], [cx + s, cy + s, cz - s],
                            color);
                    }
                    
                    // -Y face (bottom)
                    if (this.isTransparent(x, y - 1, z)) {
                        this.addQuad(vertices,
                            [cx - s, cy - s, cz + s], [cx + s, cy - s, cz + s],
                            [cx + s, cy - s, cz - s], [cx - s, cy - s, cz - s],
                            color);
                    }
                    
                    // +Y face (top)
                    if (this.isTransparent(x, y + 1, z)) {
                        this.addQuad(vertices,
                            [cx - s, cy + s, cz - s], [cx + s, cy + s, cz - s],
                            [cx + s, cy + s, cz + s], [cx - s, cy + s, cz + s],
                            color);
                    }
                }
            }
        }
        
        // Create buffer
        this.vertexCount = vertices.length / 6; // 6 floats per vertex (3 pos + 3 color)
        const vertexData = new Float32Array(vertices);
        
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    }

    isTransparent(x, y, z) {
        return this.world.getBlock(x, y, z) === World.AIR;
    }

    addQuad(vertices, p1, p2, p3, p4, color) {
        // First triangle
        this.addVertex(vertices, p1, color);
        this.addVertex(vertices, p2, color);
        this.addVertex(vertices, p3, color);
        
        // Second triangle
        this.addVertex(vertices, p3, color);
        this.addVertex(vertices, p4, color);
        this.addVertex(vertices, p1, color);
    }

    addVertex(vertices, pos, color) {
        vertices.push(pos[0], pos[1], pos[2]);
        vertices.push(color[0], color[1], color[2]);
    }

    render(camera) {
        const gl = this.gl;
        
        // Resize canvas if needed
        if (this.canvas.width !== this.canvas.clientWidth || 
            this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            
            // Update camera aspect ratio
            camera.aspect = this.canvas.width / this.canvas.height;
        }
        
        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Use shader
        gl.useProgram(this.program);
        
        // Calculate MVP matrix
        const projection = camera.getProjectionMatrix();
        const view = camera.getViewMatrix();
        const mvp = this.multiplyMatrices(projection, view);
        
        // Set uniform
        gl.uniformMatrix4fv(this.mvpLocation, false, mvp);
        
        // Bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        
        // Setup attributes
        const stride = 6 * 4; // 6 floats * 4 bytes
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.positionLocation);
        
        gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.enableVertexAttribArray(this.colorLocation);
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }

    multiplyMatrices(a, b) {
        const result = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return result;
    }

    cleanup() {
        const gl = this.gl;
        if (this.vbo) gl.deleteBuffer(this.vbo);
        if (this.program) gl.deleteProgram(this.program);
    }
}
