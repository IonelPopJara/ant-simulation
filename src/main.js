const GRID_SIZE = 32;
const UPDATE_INTERVAL = 50; // Update every 200ms (5 times/sec)
const WORKGROUP_SIZE = 8;
let step = 0; // Track how many simulation steps have been run

// ----- Main render loop -----
function updateGrid() {
    // Create a command encoder.
    // A command encoder is used to create command buffers,
    // which are used to submit work to the GPU
    const encoder = device.createCommandEncoder();

    // ---- Step 1: Compute pass for simulation ----
    const computePass = encoder.beginComputePass();
    // Pass user input
    const mouseState = inputHandler.getUserInputState();
    device.queue.writeBuffer(mouseCellState, 0, mouseState);

    // Clean user input
    for (let i = 0; i < mouseCellStateArray.length; i++) {
        mouseCellStateArray[i] = 0;
    }

    computePass.setPipeline(simulationPipeline);
    computePass.setBindGroup(0, bindGroups[step % 2]);

    const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
    computePass.dispatchWorkgroups(workgroupCount, workgroupCount);
    computePass.end();

    // ---- Step 2: Clear the input buffer [(step + 1) % 2]----
    const clearPass = encoder.beginComputePass();
    clearPass.setPipeline(clearPipeline);
    clearPass.setBindGroup(0, bindGroups[(step + 1) % 2]);
    clearPass.dispatchWorkgroups(workgroupCount, workgroupCount);
    clearPass.end();

    step++; // Increment the step counter

    // ---- Step 3: Render pass for visualization ----
    // Create a render pass
    const pass = encoder.beginRenderPass({
        colorAttachments: [
            {
                // Get the texture from the canvas
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [0, 0, 0, 1], // New line
                storeOp: "store",
            },
        ],
    });

    // Draw the grid
    pass.setPipeline(cellPipeline);

    pass.setVertexBuffer(0, vertexBuffer);
    pass.setBindGroup(0, bindGroups[step % 2]);
    pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE); // 6 vertices
    pass.end();

    // Submit the command buffer to the GPU
    device.queue.submit([encoder.finish()]);
}

import { createInputHandler } from "./userInput.js";

// ----- Canvas definition -----
const canvas = document.querySelector("canvas");

// ----- Mouse events -----
const inputHandler = createInputHandler(canvas, GRID_SIZE);

// ----- WebGPU setup -----
if (!navigator.gpu) {
    throw new Error("WebGPU is not supported in your browser");
}

// You can request different adapters, for example,
// to request a low-power GPU or a high-performance GPU
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
    throw new Error("No appropriate GPUAdapter found");
}

// Request a device
// A device is the main interface to interacting with the GPU
const device = await adapter.requestDevice();

// NOTE: WebGPU allows the creation of multiple canvases with the same device
//        This is useful for thing like multi-pane 3D editors
// Configure the canvas
const context = canvas.getContext("webgpu");
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device: device,
    format: canvasFormat,
});

// ---- Create the vertex buffer ----
// prettier-ignore
const vertices = new Float32Array([
// TODO: Learn about index buffers to avoid duplicate vertices
//   X,    Y
    -0.8, -0.8, // Triangle 1 (Blue)
     0.8, -0.8,
     0.8,  0.8,

    -0.8, -0.8, // Triangle 2 (Red)
     0.8,  0.8,
    -0.8,  0.8,
]);

const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

// Copy the vertex data into the buffer's memory
device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

// Define the vertex data structure
const vertexBufferLayout = {
    arrayStride: 8, // Number of bytes the GPU needs to skip forward
    // Each vertex is 2 floats (4 bytes each)
    attributes: [
        {
            format: "float32x2", // We have 2 floats (32-bits each) (X and Y)
            offset: 0,
            shaderLocation: 0, // Position, see vertex shader
        },
    ],
};

// ---- Create the bind group layout and pipeline layout ----
// Create the bind group layout and pipeline layout
const bindGroupLayout = device.createBindGroupLayout({
    label: "Cell Bind Group Layout",
    entries: [
        {
            binding: 0,
            // Add GPUShaderState.FRAGMENT here if you're using the `grid` uniform in the fragment shader.
            visibility:
                GPUShaderStage.VERTEX |
                GPUShaderStage.FRAGMENT |
                GPUShaderStage.COMPUTE,
            buffer: {}, // Grid uniform buffer
        },
        {
            binding: 1,
            visibility:
                GPUShaderStage.VERTEX |
                GPUShaderStage.FRAGMENT |
                GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" }, // Cell state input buffer
        },
        {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" }, // Cell state output buffer
        },
        {
            binding: 3,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" }, // Mouse input buffer
        },
    ],
});

// NOTE:
// A pipeline layout is a list of bind group layouts that one or
// more pipelines can use. The order of the bind group layouts in the array
// needs to correspond with the @group attributes in shaders.
const pipelineLayout = device.createPipelineLayout({
    label: "Cell Pipeline Layout",
    bindGroupLayouts: [bindGroupLayout],
});

const shaderCode = await fetch("./shaders/cellShader.wgsl").then((response) =>
    response.text()
);

const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: shaderCode,
});

const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: pipelineLayout, // Describe the types of inputs (other than vertex buffers)
    vertex: {
        module: cellShaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout],
    },
    fragment: {
        module: cellShaderModule,
        entryPoint: "fragmentMain",
        targets: [
            {
                format: canvasFormat,
            },
        ],
    },
});

const simulationShaderCode = await fetch(
    "./shaders/simulationShader.wgsl"
).then((response) => response.text());

const simulationShaderModule = device.createShaderModule({
    label: "Game of Life simulation shader",
    code: simulationShaderCode,
});

// Create a compute pipeline that updates the game state.
const simulationPipeline = device.createComputePipeline({
    label: "Simulation pipeline",
    layout: pipelineLayout,
    compute: {
        module: simulationShaderModule,
        entryPoint: "computeMain",
    },
});

// Create a shader module for clearing the grid
const clearShaderCode = await fetch("./shaders/clearShader.wgsl").then(
    (response) => response.text()
);

// Create a shader module for clearing the grid
const clearShaderModule = device.createShaderModule({
    label: "Clear shader",
    code: clearShaderCode,
});

// Create a compute pipeline that clears the grid
const clearPipeline = device.createComputePipeline({
    label: "Clear pipeline",
    layout: pipelineLayout,
    compute: {
        module: clearShaderModule,
        entryPoint: "clearMain",
    },
});

// Create a uniform buffer that describes the grid.
// NOTE: A uniform is a value from a buffer
//      that is the same for every invocation
const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
const uniformBuffer = device.createBuffer({
    label: "Grid Uniforms",
    size: uniformArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(uniformBuffer, /*bufferOffset=*/ 0, uniformArray);

// Create an array representing the active state of each cell
const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

// Create a storage buffer to hold the cell state
const cellStateStorage = [
    device.createBuffer({
        label: "Cell State B",
        size: cellStateArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
    device.createBuffer({
        label: "Cell State A",
        size: cellStateArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
];

// Set each cell to a random state, then copy the JavaScript array
// into the storage buffer
for (let i = 0; i < cellStateArray.length; i++) {
    // cellStateArray[i] = Math.random() > 0.8 ? 1 : 0;
}

// cellStateArray[cellStateArray.length - GRID_SIZE / 2] = 1;
device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

// Mark every other cell of the second grid as active
for (let i = 0; i < cellStateArray.length; i++) {
    cellStateArray[i] = 0;
}
device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray);

// Create a buffer to store the cell state updates from the mouse
const mouseCellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

const mouseCellState = device.createBuffer({
    label: "Mouse Cell State",
    size: mouseCellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});

// Connect the uniform buffer to the pipeline
// A bind group is a collection of resources that are bound together
const bindGroups = [
    device.createBindGroup({
        label: "Cell renderer bind group A",
        layout: bindGroupLayout, // 0 corresponds to the @group(0) in the shader
        entries: [
            {
                binding: 0,
                resource: { buffer: uniformBuffer },
            },
            {
                binding: 1,
                resource: { buffer: cellStateStorage[0] },
            },
            {
                binding: 2,
                resource: { buffer: cellStateStorage[1] },
            },
            {
                binding: 3,
                resource: { buffer: mouseCellState },
            },
        ],
    }),
    device.createBindGroup({
        label: "Cell renderer bind group B",
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: { buffer: uniformBuffer },
            },
            {
                binding: 1,
                resource: { buffer: cellStateStorage[1] },
            },
            {
                binding: 2,
                resource: { buffer: cellStateStorage[0] },
            },
            {
                binding: 3,
                resource: { buffer: mouseCellState },
            },
        ],
    }),
];

setInterval(updateGrid, UPDATE_INTERVAL);
