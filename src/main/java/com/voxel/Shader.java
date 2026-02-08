package com.voxel;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;

public class Shader {
    private int programId;

    public Shader(String vertexPath, String fragmentPath) {
        try {
            String vertSource = readResource("/" + vertexPath);
            String fragSource = readResource("/" + fragmentPath);
            int vertId = glCreateShader(GL_VERTEX_SHADER);
            glShaderSource(vertId, vertSource);
            glCompileShader(vertId);
            checkCompile(vertId, "VERTEX");

            int fragId = glCreateShader(GL_FRAGMENT_SHADER);
            glShaderSource(fragId, fragSource);
            glCompileShader(fragId);
            checkCompile(fragId, "FRAGMENT");

            programId = glCreateProgram();
            glAttachShader(programId, vertId);
            glAttachShader(programId, fragId);
            glBindAttribLocation(programId, 0, "aPos");
            glBindAttribLocation(programId, 1, "aColor");
            glLinkProgram(programId);
            checkLink(programId);

            glDeleteShader(vertId);
            glDeleteShader(fragId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load shader", e);
        }
    }

    private String readResource(String path) throws Exception {
        try (InputStream in = Shader.class.getResourceAsStream(path)) {
            if (in == null) throw new RuntimeException("Resource not found: " + path);
            try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                return br.lines().collect(Collectors.joining("\n"));
            }
        }
    }

    private void checkCompile(int shaderId, String type) {
        if (glGetShaderi(shaderId, GL_COMPILE_STATUS) == GL_FALSE) {
            throw new RuntimeException(type + " shader compile failed: " + glGetShaderInfoLog(shaderId));
        }
    }

    private void checkLink(int programId) {
        if (glGetProgrami(programId, GL_LINK_STATUS) == GL_FALSE) {
            throw new RuntimeException("Program link failed: " + glGetProgramInfoLog(programId));
        }
    }

    public void bind() {
        glUseProgram(programId);
    }

    public void unbind() {
        glUseProgram(0);
    }

    public void setUniformMat4(String name, java.nio.FloatBuffer matrix) {
        int loc = glGetUniformLocation(programId, name);
        glUniformMatrix4fv(loc, false, matrix);
    }

    public void cleanup() {
        if (programId != 0) {
            glDeleteProgram(programId);
        }
    }
}