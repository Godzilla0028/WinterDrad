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
        
        // Cache for optimization
        this.lastCanvasWidth = 0;
        this.lastCanvasHeight = 0;
        this.cachedProjectionMatrix = null;
        this.cachedViewMatrix = null;
        this.lastCameraPosition = { x: 0, y: 0, z: 0 };
        this.lastCameraPitch = 0;
        this.lastCameraYaw = 0;
        
        // Pre-allocate MVP matrix to reduce GC pressure
        this.mvpMatrix = new Float32Array(16);
        
        this.initGL();
        this.createShaders();
        this.buildMesh();
    }

    initGL() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE); // Enable backface culling
        gl.cullFace(gl.BACK); // Cull back faces
        gl.frontFace(gl.CCW); // Counter-clockwise front faces
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
        
        // Create VAO (Vertex Array Object) for better performance
        // Use extension for WebGL1, native for WebGL2
        if (gl.createVertexArray) {
            // WebGL2
            this.vao = gl.createVertexArray();
            gl.bindVertexArray(this.vao);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            
            const stride = 6 * 4; // 6 floats * 4 bytes
            gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this.positionLocation);
            
            gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, stride, 3 * 4);
            gl.enableVertexAttribArray(this.colorLocation);
            
            gl.bindVertexArray(null);
        } else {
            // WebGL1 - try to use VAO extension
            const ext = gl.getExtension('OES_vertex_array_object');
            if (ext) {
                this.vao = ext.createVertexArrayOES();
                ext.bindVertexArrayOES(this.vao);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
                
                const stride = 6 * 4;
                gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, stride, 0);
                gl.enableVertexAttribArray(this.positionLocation);
                
                gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, stride, 3 * 4);
                gl.enableVertexAttribArray(this.colorLocation);
                
                ext.bindVertexArrayOES(null);
                this.vaoExt = ext;
            }
        }
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
        
        // Resize canvas if needed (only when size actually changed)
        const clientWidth = this.canvas.clientWidth;
        const clientHeight = this.canvas.clientHeight;
        if (this.canvas.width !== clientWidth || this.canvas.height !== clientHeight) {
            this.canvas.width = clientWidth;
            this.canvas.height = clientHeight;
            gl.viewport(0, 0, clientWidth, clientHeight);
            
            // Update camera aspect ratio and invalidate projection matrix cache
            camera.aspect = clientWidth / clientHeight;
            this.cachedProjectionMatrix = null;
            this.lastCanvasWidth = clientWidth;
            this.lastCanvasHeight = clientHeight;
        }
        
        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Use shader
        gl.useProgram(this.program);
        
        // Check if camera has changed to decide if we need to recalculate matrices
        const cameraChanged = 
            this.lastCameraPosition.x !== camera.position.x ||
            this.lastCameraPosition.y !== camera.position.y ||
            this.lastCameraPosition.z !== camera.position.z ||
            this.lastCameraPitch !== camera.pitch ||
            this.lastCameraYaw !== camera.yaw;
        
        // Get or calculate projection matrix
        let projection;
        if (!this.cachedProjectionMatrix) {
            projection = camera.getProjectionMatrix();
            this.cachedProjectionMatrix = projection;
        } else {
            projection = this.cachedProjectionMatrix;
        }
        
        // Get or calculate view matrix
        let view;
        if (cameraChanged || !this.cachedViewMatrix) {
            view = camera.getViewMatrix();
            this.cachedViewMatrix = view;
            this.lastCameraPosition.x = camera.position.x;
            this.lastCameraPosition.y = camera.position.y;
            this.lastCameraPosition.z = camera.position.z;
            this.lastCameraPitch = camera.pitch;
            this.lastCameraYaw = camera.yaw;
        } else {
            view = this.cachedViewMatrix;
        }
        
        // Calculate MVP matrix (reuse pre-allocated array)
        this.multiplyMatrices(projection, view, this.mvpMatrix);
        
        // Set uniform
        gl.uniformMatrix4fv(this.mvpLocation, false, this.mvpMatrix);
        
        // Bind VAO if available, otherwise set up attributes manually
        if (this.vao) {
            if (gl.bindVertexArray) {
                // WebGL2
                gl.bindVertexArray(this.vao);
            } else if (this.vaoExt) {
                // WebGL1 with extension
                this.vaoExt.bindVertexArrayOES(this.vao);
            }
        } else {
            // Fallback: manually set up attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            
            const stride = 6 * 4; // 6 floats * 4 bytes
            gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this.positionLocation);
            
            gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, stride, 3 * 4);
            gl.enableVertexAttribArray(this.colorLocation);
        }
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        
        // Unbind VAO if used
        if (this.vao) {
            if (gl.bindVertexArray) {
                gl.bindVertexArray(null);
            } else if (this.vaoExt) {
                this.vaoExt.bindVertexArrayOES(null);
            }
        }
    }

    multiplyMatrices(a, b, result) {
        // Optimized matrix multiplication - writes to pre-allocated result array
        // to reduce garbage collection pressure
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return result; // Return for API compatibility
    }

    cleanup() {
        const gl = this.gl;
        if (this.vao) {
            if (gl.deleteVertexArray) {
                gl.deleteVertexArray(this.vao);
            } else if (this.vaoExt) {
                this.vaoExt.deleteVertexArrayOES(this.vao);
            }
        }
        if (this.vbo) gl.deleteBuffer(this.vbo);
        if (this.program) gl.deleteProgram(this.program);
    }
}
