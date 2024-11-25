//Shader codes goes here
struct VertexInput {
    @location(0) pos: vec2f,
    @builtin(instance_index) instance: u32,
};

struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) cell: vec2f,
};

@group(0) @binding(0) var<uniform> grid : vec2f;
@group(0) @binding(1) var<storage> cellState: array<u32>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    //Save the instance index as a float
    let i = f32(input.instance);

    let cell = vec2f(i % grid.x, floor(i / grid.x));//Updated
    var state = f32(cellState[input.instance]);

    // Convert the state to 1 if it's greater than 1
    if (state >= 1) {
        state = 1;
    }

    //Compute the cell coordinates from the instance index
    let  cellOffset = (cell / grid) * 2;
    let gridPos = ((input.pos*state + 1) / grid) - 1 + cellOffset;

    var output: VertexOutput;
    output.pos = vec4f(gridPos, 0, 1);
    output.cell = cell;
    return output;
}

struct FragInput {
    @location(0) cell: vec2f,
};

@fragment
fn fragmentMain(input: FragInput) -> @location(0) vec4f {
    let c = input.cell/grid;
    return vec4f(c, 1 - c.x, 1); //(R, G, B, A)
}
