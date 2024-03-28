// Include section
#include <iostream>
#include <GL/glew.h> // GLEW has to be included before any other GL library
#include <GLFW/glfw3.h>

#define WINDOW_HEIGHT 1080
#define WINDOW_WIDTH 1920

int main(void)
{
    std::cout << "Howdy, partner!" << std::endl;

    GLFWwindow *window;

    // Initialize the library
    if (!glfwInit())
    {
        std::cout << "Error! GLFW could not be initiated." << std::endl;
        return -1;
    }

    // Create a window and its OpenGL context
    window = glfwCreateWindow(WINDOW_WIDTH, WINDOW_HEIGHT, "Ant Simulation", NULL, NULL);

    if (!window)
    {
        glfwTerminate();
        std::cout << "Error! Window could not be created." << std::endl;
        return -1;
    }

    // Make the window the current context
    glfwMakeContextCurrent(window);

    if (glewInit() != GLEW_OK)
    {
        std::cout << "Error! GLEW could not be initiated." << std::endl;
        return -1;
    }

    std::cout << glGetString(GL_VERSION) << std::endl;

    float positions[6] = {
        -0.5f, -0.5f,
         0.0f,  0.5f,
         0.5f, -0.5f
    };

    unsigned int buffer;
    glGenBuffers(1, &buffer);
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glBufferData(GL_ARRAY_BUFFER, 6 * sizeof(float), positions, GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, sizeof(float) * 2, 0);

    // Loop until the user closes the window
    while (!glfwWindowShouldClose(window))
    {
        // Render here
        glClear(GL_COLOR_BUFFER_BIT);

        glClearColor(34.0f / 255.0f, 40.0f / 255.0f, 49.0f / 255.0f, 1.0f);

        glDrawArrays(GL_TRIANGLES, 0, 3);

        // Swap front and back buffers
        glfwSwapBuffers(window);

        // Poll and process events
        glfwPollEvents();
    }

    glfwTerminate();

    std::cout << "Have a good one :)" << std::endl;

    return 0;
}