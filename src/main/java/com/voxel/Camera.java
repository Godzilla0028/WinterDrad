package com.voxel;

import org.joml.Matrix4f;
import org.joml.Vector3f;

public class Camera {
    private final Matrix4f projection = new Matrix4f();
    private final Matrix4f view = new Matrix4f();
    private final Vector3f position = new Vector3f();
    private float pitch = 0f; // rotation X
    private float yaw = -90f; // rotation Y (so facing -Z initially)
    private final float fov;
    private final float aspect;
    private final float zNear;
    private final float zFar;

    private float mouseSensitivity = 0.1f;
    private float movementSpeed = 5f;

    public Camera(float fov, float aspect, float zNear, float zFar) {
        this.fov = fov;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;
        updateProjection();
    }

    private void updateProjection() {
        projection.identity();
        projection.perspective(fov, aspect, zNear, zFar);
    }

    public void setPosition(float x, float y, float z) {
        position.set(x, y, z);
    }

    public void processInput(Input input, float delta) {
        float dx = input.getDeltaX();
        float dy = input.getDeltaY();

        yaw += dx * mouseSensitivity;
        pitch -= dy * mouseSensitivity;
        pitch = Math.max(-89f, Math.min(89f, pitch));

        Vector3f front = new Vector3f();
        front.x = (float)(Math.cos(Math.toRadians(yaw)) * Math.cos(Math.toRadians(pitch)));
        front.y = (float)(Math.sin(Math.toRadians(pitch)));
        front.z = (float)(Math.sin(Math.toRadians(yaw)) * Math.cos(Math.toRadians(pitch)));
        front.normalize();

        Vector3f right = front.cross(new Vector3f(0,1,0), new Vector3f()).normalize();
        Vector3f up = right.cross(front, new Vector3f()).normalize();

        float velocity = movementSpeed * delta;
        if (input.isKeyDown(org.lwjgl.glfw.GLFW.GLFW_KEY_W)) {
            position.add(new Vector3f(front).mul(velocity));
        }
        if (input.isKeyDown(org.lwjgl.glfw.GLFW.GLFW_KEY_S)) {
            position.sub(new Vector3f(front).mul(velocity));
        }
        if (input.isKeyDown(org.lwjgl.glfw.GLFW.GLFW_KEY_A)) {
            position.sub(new Vector3f(right).mul(velocity));
        }
        if (input.isKeyDown(org.lwjgl.glfw.GLFW.GLFW_KEY_D)) {
            position.add(new Vector3f(right).mul(velocity));
        }
        // simple jump / crouch could be added with space/ctrl

        // update view matrix
        Vector3f center = new Vector3f(position).add(front);
        view.identity().lookAt(position, center, up);
    }

    public Matrix4f getViewMatrix() {
        return new Matrix4f(view);
    }

    public Matrix4f getProjectionMatrix() {
        return new Matrix4f(projection);
    }
}