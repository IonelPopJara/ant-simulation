cmake_minimum_required(VERSION 3.2)
project(ant-simulation)
set(CMAKE_CXX_STANDARD 11)

# Set OpenGL preference to GLVND
set(OpenGL_GL_PREFERENCE "GLVND")

# Find OpenGL
find_package(OpenGL REQUIRED)

# Add GLFW library
find_package(glfw3 REQUIRED)

# Add executable target
add_executable(${PROJECT_NAME} ${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp)

# Link against GLFW and OpenGL
target_link_libraries(${PROJECT_NAME} glfw OpenGL::GL)