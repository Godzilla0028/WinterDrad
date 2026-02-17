package com.voxel;

/**
 * Simple block grid world. Stores blocks as bytes:
 * 0 = AIR
 * 1 = DIRT
 * 2 = GRASS
 */
public class World {
    public static final byte AIR = 0;
    public static final byte DIRT = 1;
    public static final byte GRASS = 2;

    private final int width;
    private final int height;
    private final int depth;
    private final byte[] blocks;

    public World(int width, int height, int depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.blocks = new byte[width * height * depth];
        generateFlatWorld();
    }

    private int idx(int x, int y, int z) {
        return x + z * width + y * (width * depth);
    }

    private void setBlock(int x, int y, int z, byte id) {
        if (inBounds(x, y, z)) blocks[idx(x, y, z)] = id;
    }

    public byte getBlock(int x, int y, int z) {
        if (!inBounds(x, y, z)) return AIR;
        return blocks[idx(x, y, z)];
    }

    private boolean inBounds(int x, int y, int z) {
        return x >= 0 && x < width && y >= 0 && y < height && z >= 0 && z < depth;
    }

    private void generateFlatWorld() {
        int ground = Math.max(1, height / 4); // small ground height
        for (int x = 0; x < width; x++) {
            for (int z = 0; z < depth; z++) {
                for (int y = 0; y < height; y++) {
                    if (y < ground) {
                        setBlock(x, y, z, DIRT);
                    } else {
                        setBlock(x, y, z, AIR);
                    }
                }
                // top surface becomes grass
                setBlock(x, ground - 1, z, GRASS);
            }
        }
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getDepth() {
        return depth;
    }
}