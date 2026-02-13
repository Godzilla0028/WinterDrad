package com.voxel;

import static org.lwjgl.glfw.GLFW.*;

public class Input {
    private final long window;
    private double mouseX, mouseY;
    private double lastX, lastY;
    private boolean firstMouse = true;

    public Input(long window) {
        this.window = window;
        // initialize mouse pos
        try (var stack = org.lwjgl.system.MemoryStack.stackPush()) {
            var px = org.lwjgl.system.MemoryUtil.memAllocDouble(1);
            var py = org.lwjgl.system.MemoryUtil.memAllocDouble(1);
            glfwGetCursorPos(window, px, py);
            mouseX = px.get(0);
            mouseY = py.get(0);
            lastX = mouseX;
            lastY = mouseY;
            org.lwjgl.system.MemoryUtil.memFree(px);
            org.lwjgl.system.MemoryUtil.memFree(py);
        }
    }

    public void update() {
        double[] x = new double[1], y = new double[1];
        try (var stack = org.lwjgl.system.MemoryStack.stackPush()) {
            var px = org.lwjgl.system.MemoryUtil.memAllocDouble(1);
            var py = org.lwjgl.system.MemoryUtil.memAllocDouble(1);
            glfwGetCursorPos(window, px, py);
            mouseX = px.get(0);
            mouseY = py.get(0);
            org.lwjgl.system.MemoryUtil.memFree(px);
            org.lwjgl.system.MemoryUtil.memFree(py);
        }
    }

    public float getDeltaX() {
        double dx = mouseX - lastX;
        lastX = mouseX;
        return (float) dx;
    }

    public float getDeltaY() {
        double dy = mouseY - lastY;
        lastY = mouseY;
        return (float) dy;
    }

    public boolean isKeyDown(int key) {
        return glfwGetKey(window, key) == GLFW_PRESS;
    }
}