#!/bin/bash

# Remove existing build directory
rm -rf build

# Create a new build directory
mkdir build

# Change directory to the build directory
cd build

# Run Cmake to configure the project
cmake ..

# Build the project using make
make
