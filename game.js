// WinterDrad - Minecraft-like Game
// Game State
const game = {
    scene: null,
    camera: null,
    renderer: null,
    world: new Map(),
    player: {
        height: 1.7,
        speed: 0.1,
        jumpSpeed: 0.15,
        velocity: new THREE.Vector3(),
        onGround: false,
        selectedBlock: 'grass'
    },
    controls: {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jump: false
    },
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2()
};

// Block textures and materials
const blockMaterials = {};
const BLOCK_SIZE = 1;
const WORLD_SIZE = 32;
const WORLD_HEIGHT = 16;

// Initialize the game
function init() {
    // Create scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    game.scene.fog = new THREE.Fog(0x87CEEB, 0, 100);
    
    // Create camera
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    game.camera.position.set(WORLD_SIZE / 2, WORLD_HEIGHT + 5, WORLD_SIZE / 2);
    
    // Create renderer
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(game.renderer.domElement);
    
    // Create block materials with Minecraft-like textures
    createBlockMaterials();
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    game.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    game.scene.add(directionalLight);
    
    // Generate world
    generateWorld();
    
    // Setup controls
    setupControls();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Create Minecraft-like block materials
function createBlockMaterials() {
    // Grass block
    const grassTop = createTexture('#7CBD6B');
    const grassSide = createTexture('#6B9E5D', '#5D8A4F');
    const grassBottom = createTexture('#8B6F47');
    
    blockMaterials.grass = [
        new THREE.MeshLambertMaterial({ map: grassSide }), // right
        new THREE.MeshLambertMaterial({ map: grassSide }), // left
        new THREE.MeshLambertMaterial({ map: grassTop }),  // top
        new THREE.MeshLambertMaterial({ map: grassBottom }), // bottom
        new THREE.MeshLambertMaterial({ map: grassSide }), // front
        new THREE.MeshLambertMaterial({ map: grassSide })  // back
    ];
    
    // Dirt block
    const dirt = createTexture('#8B6F47', '#7D6343');
    blockMaterials.dirt = new THREE.MeshLambertMaterial({ map: dirt });
    
    // Stone block
    const stone = createTexture('#808080', '#6E6E6E');
    blockMaterials.stone = new THREE.MeshLambertMaterial({ map: stone });
    
    // Wood block
    const woodTop = createTexture('#9B7653');
    const woodSide = createTexture('#6B4423', '#5C3A1E');
    
    blockMaterials.wood = [
        new THREE.MeshLambertMaterial({ map: woodSide }), // right
        new THREE.MeshLambertMaterial({ map: woodSide }), // left
        new THREE.MeshLambertMaterial({ map: woodTop }),  // top
        new THREE.MeshLambertMaterial({ map: woodTop }),  // bottom
        new THREE.MeshLambertMaterial({ map: woodSide }), // front
        new THREE.MeshLambertMaterial({ map: woodSide })  // back
    ];
}

// Create a simple pixelated texture
function createTexture(color1, color2 = null) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create pixelated pattern
    const pixelSize = 8;
    for (let x = 0; x < size; x += pixelSize) {
        for (let y = 0; y < size; y += pixelSize) {
            const useColor2 = color2 && Math.random() > 0.7;
            ctx.fillStyle = useColor2 ? color2 : color1;
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

// Generate the world
function generateWorld() {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            // Simple terrain generation
            const height = Math.floor(Math.sin(x * 0.3) * Math.cos(z * 0.3) * 3 + WORLD_HEIGHT / 2);
            
            // Place blocks
            for (let y = 0; y < height; y++) {
                let blockType;
                if (y === height - 1) {
                    blockType = 'grass';
                } else if (y > height - 4) {
                    blockType = 'dirt';
                } else {
                    blockType = 'stone';
                }
                
                addBlock(x, y, z, blockType, geometry);
            }
        }
    }
}

// Add a block to the world
function addBlock(x, y, z, type, geometry = null) {
    if (!geometry) {
        geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
    
    const material = blockMaterials[type];
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    block.userData.blockType = type;
    
    game.scene.add(block);
    game.world.set(`${x},${y},${z}`, block);
}

// Remove a block from the world
function removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    const block = game.world.get(key);
    if (block) {
        game.scene.remove(block);
        game.world.delete(key);
    }
}

// Setup player controls
function setupControls() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    document.addEventListener('contextmenu', onRightClick);
    
    // Block selection
    document.querySelectorAll('.block-option').forEach((option, index) => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.block-option').forEach(opt => 
                opt.classList.remove('active'));
            option.classList.add('active');
            game.player.selectedBlock = option.dataset.block;
        });
        
        // Number keys
        document.addEventListener('keydown', (e) => {
            if (e.key === String(index + 1)) {
                option.click();
            }
        });
    });
    
    // Pointer lock
    const canvas = game.renderer.domElement;
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });
}

function onKeyDown(event) {
    switch (event.key) {
        case 'w':
        case 'W':
            game.controls.moveForward = true;
            break;
        case 's':
        case 'S':
            game.controls.moveBackward = true;
            break;
        case 'a':
        case 'A':
            game.controls.moveLeft = true;
            break;
        case 'd':
        case 'D':
            game.controls.moveRight = true;
            break;
        case ' ':
            if (game.player.onGround) {
                game.controls.jump = true;
            }
            break;
        case 'Escape':
            document.exitPointerLock();
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'w':
        case 'W':
            game.controls.moveForward = false;
            break;
        case 's':
        case 'S':
            game.controls.moveBackward = false;
            break;
        case 'a':
        case 'A':
            game.controls.moveLeft = false;
            break;
        case 'd':
        case 'D':
            game.controls.moveRight = false;
            break;
        case ' ':
            game.controls.jump = false;
            break;
    }
}

let pitch = 0;
let yaw = 0;

function onMouseMove(event) {
    if (document.pointerLockElement === game.renderer.domElement) {
        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        
        game.camera.rotation.order = 'YXZ';
        game.camera.rotation.y = yaw;
        game.camera.rotation.x = pitch;
    }
}

function onClick(event) {
    if (document.pointerLockElement !== game.renderer.domElement) return;
    
    // Break block
    const intersection = getTargetBlock();
    if (intersection) {
        const pos = intersection.point.clone()
            .sub(intersection.face.normal.clone().multiplyScalar(0.5));
        const x = Math.round(pos.x);
        const y = Math.round(pos.y);
        const z = Math.round(pos.z);
        removeBlock(x, y, z);
    }
}

function onRightClick(event) {
    event.preventDefault();
    if (document.pointerLockElement !== game.renderer.domElement) return;
    
    // Place block
    const intersection = getTargetBlock();
    if (intersection) {
        const pos = intersection.point.clone()
            .add(intersection.face.normal.clone().multiplyScalar(0.5));
        const x = Math.round(pos.x);
        const y = Math.round(pos.y);
        const z = Math.round(pos.z);
        
        // Don't place block where player is
        const playerPos = game.camera.position;
        const distance = Math.sqrt(
            Math.pow(x - playerPos.x, 2) +
            Math.pow(y - playerPos.y, 2) +
            Math.pow(z - playerPos.z, 2)
        );
        
        if (distance > 1.5) {
            addBlock(x, y, z, game.player.selectedBlock);
        }
    }
}

function getTargetBlock() {
    game.raycaster.setFromCamera(new THREE.Vector2(0, 0), game.camera);
    const intersections = game.raycaster.intersectObjects(
        Array.from(game.world.values())
    );
    return intersections.length > 0 ? intersections[0] : null;
}

function updatePlayer(delta) {
    const speed = game.player.speed;
    const direction = new THREE.Vector3();
    
    // Movement
    if (game.controls.moveForward) {
        direction.z -= 1;
    }
    if (game.controls.moveBackward) {
        direction.z += 1;
    }
    if (game.controls.moveLeft) {
        direction.x -= 1;
    }
    if (game.controls.moveRight) {
        direction.x += 1;
    }
    
    if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(game.camera.quaternion);
        direction.y = 0;
        direction.normalize();
        
        game.camera.position.x += direction.x * speed;
        game.camera.position.z += direction.z * speed;
    }
    
    // Gravity and jumping
    if (game.controls.jump && game.player.onGround) {
        game.player.velocity.y = game.player.jumpSpeed;
        game.player.onGround = false;
    }
    
    game.player.velocity.y -= 0.005; // Gravity
    game.camera.position.y += game.player.velocity.y;
    
    // Simple ground collision
    const groundLevel = getGroundLevel(
        game.camera.position.x,
        game.camera.position.z
    );
    
    if (game.camera.position.y < groundLevel + game.player.height) {
        game.camera.position.y = groundLevel + game.player.height;
        game.player.velocity.y = 0;
        game.player.onGround = true;
    } else {
        game.player.onGround = false;
    }
    
    // Keep player in bounds
    game.camera.position.x = Math.max(0, Math.min(WORLD_SIZE, game.camera.position.x));
    game.camera.position.z = Math.max(0, Math.min(WORLD_SIZE, game.camera.position.z));
}

function getGroundLevel(x, z) {
    const blockX = Math.floor(x);
    const blockZ = Math.floor(z);
    
    for (let y = WORLD_HEIGHT; y >= 0; y--) {
        if (game.world.has(`${blockX},${y},${blockZ}`)) {
            return y + 1;
        }
    }
    return 0;
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    updatePlayer(delta);
    game.renderer.render(game.scene, game.camera);
}

// Start the game
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('menu').style.display = 'flex';
    }, 1000);
    
    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        init();
    });
});
