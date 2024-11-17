@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

@compute @workgroup_size(8, 8)
fn clearMain(@builtin(global_invocation_id) cell: vec3u) {
    // TODO: Change GRID_SIZE to the actual size of the grid
    let grid_size = u32(grid.x);
    let index = cell.y * grid_size + cell.x;
    cellStateOut[index] = 0;
}