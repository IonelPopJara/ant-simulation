#include <iostream>
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

    // Loop until the user closes the window

    while (!glfwWindowShouldClose(window))
    {
        // Render here
        glClear(GL_COLOR_BUFFER_BIT);

        glClearColor(34.0f / 255.0f, 40.0f / 255.0f, 49.0f / 255.0f, 1.0f);

        glBegin(GL_TRIANGLES);
        glVertex2f(-0.5f, -0.5f);
        glVertex2f(0.0f, 0.5f);
        glVertex2f(0.5f, -0.5f);
        glEnd();

        // Swap front and back buffers
        glfwSwapBuffers(window);

        // Poll and process events
        glfwPollEvents();
    }

    glfwTerminate();

    std::cout << "Have a good one :)" << std::endl;

    return 0;
}