// World.js - Manages the voxel world
export class World {
    static AIR = 0;
    static DIRT = 1;
    static GRASS = 2;

    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.blocks = new Uint8Array(width * height * depth);
        this.generateFlatWorld();
    }

    idx(x, y, z) {
        return x + z * this.width + y * (this.width * this.depth);
    }

    setBlock(x, y, z, id) {
        if (this.inBounds(x, y, z)) {
            this.blocks[this.idx(x, y, z)] = id;
        }
    }

    getBlock(x, y, z) {
        if (!this.inBounds(x, y, z)) return World.AIR;
        return this.blocks[this.idx(x, y, z)];
    }

    inBounds(x, y, z) {
        return x >= 0 && x < this.width && 
               y >= 0 && y < this.height && 
               z >= 0 && z < this.depth;
    }

    generateFlatWorld() {
        const ground = Math.max(1, Math.floor(this.height / 4));
        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.depth; z++) {
                for (let y = 0; y < this.height; y++) {
                    if (y < ground) {
                        this.setBlock(x, y, z, World.DIRT);
                    } else {
                        this.setBlock(x, y, z, World.AIR);
                    }
                }
                // Top surface becomes grass
                this.setBlock(x, ground - 1, z, World.GRASS);
            }
        }
    }
}
