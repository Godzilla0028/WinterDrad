package com.voxel;

import static org.lwjgl.glfw.GLFW.*;
import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.system.MemoryUtil.NULL;

import org.lwjgl.glfw.GLFWErrorCallback;
import org.lwjgl.opengl.GL;
import org.lwjgl.glfw.GLFWVidMode;

public class Main {
    private long window;
    private int width = 1280;
    private int height = 720;

    private Camera camera;
    private Renderer renderer;
    private Input input;
    private World world;

    public void run() {
        init();
        loop();
        cleanup();
    }

    private void init() {
        GLFWErrorCallback.createPrint(System.err).set();
        if (!glfwInit()) throw new IllegalStateException("Unable to initialize GLFW");

        glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
        glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
        glfwWindowHint(GLFW_RESIZABLE, GL_TRUE);

        window = glfwCreateWindow(width, height, "Voxel Prototype", NULL, NULL);
        if (window == NULL) throw new RuntimeException("Failed to create GLFW window");

        GLFWVidMode vidmode = glfwGetVideoMode(glfwGetPrimaryMonitor());
        glfwSetWindowPos(window, (vidmode.width() - width) / 2, (vidmode.height() - height) / 2);

        glfwMakeContextCurrent(window);
        glfwSwapInterval(1); // V-sync
        glfwShowWindow(window);

        GL.createCapabilities();

        glEnable(GL_DEPTH_TEST);

        // Setup input, camera, renderer
        input = new Input(window);
        camera = new Camera((float) Math.toRadians(70.0f), (float) width / height, 0.01f, 1000f);
        camera.setPosition(0f, 4f, 8f);

        // create a small world: width x height x depth
        world = new World(32, 8, 32); // you can change sizes here
        renderer = new Renderer(world);

        // capture mouse
        glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
    }

    private void loop() {
        float lastTime = (float)glfwGetTime();
        while (!glfwWindowShouldClose(window)) {
            float now = (float)glfwGetTime();
            float delta = now - lastTime;
            lastTime = now;

            glfwPollEvents();
            input.update();

            if (input.isKeyDown(GLFW_KEY_ESCAPE)) {
                glfwSetWindowShouldClose(window, true);
            }

            camera.processInput(input, delta);

            glClearColor(0.53f, 0.81f, 0.92f, 1.0f); // sky color
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

            renderer.render(camera);

            glfwSwapBuffers(window);
        }
    }

    private void cleanup() {
        renderer.cleanup();
        glfwDestroyWindow(window);
        glfwTerminate();
        glfwSetErrorCallback(null).free();
    }

    public static void main(String[] args) {
        new Main().run();
    }
}