package com.voxel;

import org.joml.Matrix4f;
import org.joml.Vector3f;
import org.lwjgl.BufferUtils;

import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.List;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL15.*;
import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;

/**
 * Naive voxel renderer:
 * - Builds vertex data for exposed faces only (neighbor culling)
 * - Vertex format: vec3 position, vec3 color (6 floats)
 * - Drawn with glDrawArrays(GL_TRIANGLES, ...)
 */
public class Renderer {
    private int vaoId;
    private int vboId;
    private Shader shader;
    private int vertexCount = 0;

    private final World world;

    public Renderer(World world) {
        this.world = world;
        shader = new Shader("shaders/vert.glsl", "shaders/frag.glsl");
        buildMesh();
    }

    private void buildMesh() {
        // Build vertex list
        List<Float> vertices = new ArrayList<>();

        // Colors
        float[] colorGrass = {0.2f, 0.8f, 0.2f};
        float[] colorDirt = {0.59f, 0.41f, 0.17f};

        // Iterate blocks
        for (int x = 0; x < world.getWidth(); x++) {
            for (int y = 0; y < world.getHeight(); y++) {
                for (int z = 0; z < world.getDepth(); z++) {
                    byte id = world.getBlock(x, y, z);
                    if (id == World.AIR) continue;

                    float[] color = id == World.GRASS ? colorGrass : colorDirt;
                    // For each face, if neighbor is AIR/outside, add face
                    // Cube centered at (x, y, z) with size 1 -> positions offset by +/-0.5
                    float cx = x;
                    float cy = y;
                    float cz = z;
                    float s = 0.5f;

                    // -Z face (back)
                    if (isTransparent(x, y, z - 1)) {
                        // two triangles (6 verts)
                        addVertex(vertices, cx - s, cy - s, cz - s, color);
                        addVertex(vertices, cx + s, cy - s, cz - s, color);
                        addVertex(vertices, cx + s, cy + s, cz - s, color);

                        addVertex(vertices, cx + s, cy + s, cz - s, color);
                        addVertex(vertices, cx - s, cy + s, cz - s, color);
                        addVertex(vertices, cx - s, cy - s, cz - s, color);
                    }

                    // +Z face (front)
                    if (isTransparent(x, y, z + 1)) {
                        addVertex(vertices, cx + s, cy - s, cz + s, color);
                        addVertex(vertices, cx - s, cy - s, cz + s, color);
                        addVertex(vertices, cx - s, cy + s, cz + s, color);

                        addVertex(vertices, cx - s, cy + s, cz + s, color);
                        addVertex(vertices, cx + s, cy + s, cz + s, color);
                        addVertex(vertices, cx + s, cy - s, cz + s, color);
                    }

                    // -X face (left)
                    if (isTransparent(x - 1, y, z)) {
                        addVertex(vertices, cx - s, cy - s, cz + s, color);
                        addVertex(vertices, cx - s, cy - s, cz - s, color);
                        addVertex(vertices, cx - s, cy + s, cz - s, color);

                        addVertex(vertices, cx - s, cy + s, cz - s, color);
                        addVertex(vertices, cx - s, cy + s, cz + s, color);
                        addVertex(vertices, cx - s, cy - s, cz + s, color);
                    }

                    // +X face (right)
                    if (isTransparent(x + 1, y, z)) {
                        addVertex(vertices, cx + s, cy - s, cz - s, color);
                        addVertex(vertices, cx + s, cy - s, cz + s, color);
                        addVertex(vertices, cx + s, cy + s, cz + s, color);

                        addVertex(vertices, cx + s, cy + s, cz + s, color);
                        addVertex(vertices, cx + s, cy + s, cz - s, color);
                        addVertex(vertices, cx + s, cy - s, cz - s, color);
                    }

                    // -Y face (bottom)
                    if (isTransparent(x, y - 1, z)) {
                        addVertex(vertices, cx - s, cy - s, cz + s, color);
                        addVertex(vertices, cx + s, cy - s, cz + s, color);
                        addVertex(vertices, cx + s, cy - s, cz - s, color);

                        addVertex(vertices, cx + s, cy - s, cz - s, color);
                        addVertex(vertices, cx - s, cy - s, cz - s, color);
                        addVertex(vertices, cx - s, cy - s, cz + s, color);
                    }

                    // +Y face (top)
                    if (isTransparent(x, y + 1, z)) {
                        addVertex(vertices, cx - s, cy + s, cz - s, color);
                        addVertex(vertices, cx + s, cy + s, cz - s, color);
                        addVertex(vertices, cx + s, cy + s, cz + s, color);

                        addVertex(vertices, cx + s, cy + s, cz + s, color);
                        addVertex(vertices, cx - s, cy + s, cz + s, color);
                        addVertex(vertices, cx - s, cy + s, cz - s, color);
                    }
                }
            }
        }

        // Convert list to float[]
        vertexCount = vertices.size() / 6; // 6 floats per vertex (pos(3) + color(3))
        float[] vertArray = new float[vertices.size()];
        for (int i = 0; i < vertices.size(); i++) vertArray[i] = vertices.get(i);

        // Upload to GPU
        vaoId = glGenVertexArrays();
        glBindVertexArray(vaoId);

        vboId = glGenBuffers();
        FloatBuffer vertexBuffer = BufferUtils.createFloatBuffer(vertArray.length);
        vertexBuffer.put(vertArray).flip();
        glBindBuffer(GL_ARRAY_BUFFER, vboId);
        glBufferData(GL_ARRAY_BUFFER, vertexBuffer, GL_STATIC_DRAW);

        int stride = 6 * Float.BYTES;
        // position (location = 0)
        glVertexAttribPointer(0, 3, GL_FLOAT, false, stride, 0);
        glEnableVertexAttribArray(0);
        // color (location = 1)
        glVertexAttribPointer(1, 3, GL_FLOAT, false, stride, 3 * Float.BYTES);
        glEnableVertexAttribArray(1);

        // unbind
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
    }

    private boolean isTransparent(int x, int y, int z) {
        return world.getBlock(x, y, z) == World.AIR;
    }

    private void addVertex(List<Float> verts, float px, float py, float pz, float[] color) {
        verts.add(px);
        verts.add(py);
        verts.add(pz);
        verts.add(color[0]);
        verts.add(color[1]);
        verts.add(color[2]);
    }

    public void render(Camera camera) {
        shader.bind();

        Matrix4f proj = camera.getProjectionMatrix();
        Matrix4f view = camera.getViewMatrix();

        Matrix4f model = new Matrix4f().identity(); // world origin

        Matrix4f mvp = new Matrix4f();
        proj.mul(view, mvp);
        mvp.mul(model);

        FloatBuffer fb = BufferUtils.createFloatBuffer(16);
        mvp.get(fb);
        shader.setUniformMat4("u_MVP", fb);

        glBindVertexArray(vaoId);
        glDrawArrays(GL_TRIANGLES, 0, vertexCount);
        glBindVertexArray(0);

        shader.unbind();
    }

    public void cleanup() {
        shader.cleanup();
        glDeleteBuffers(vboId);
        glDeleteVertexArrays(vaoId);
    }
}