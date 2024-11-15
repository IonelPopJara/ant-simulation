@group(0) @binding(0) var<uniform> grid: vec2f;

@group(0) @binding(1) var<storage> cellStateIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

fn cellActive(x: u32, y: u32) -> u32 {
    if (x >= u32(grid.x) || y < 0) {
        return 1;
    } else if (y >= u32(grid.y)) {
        return 0;
    }

    return cellStateIn[cellIndex(vec2(x,y))];
}

fn cellIndex(cell: vec2u) -> u32 {
    return cell.y * u32(grid.x) + cell.x;
}

@compute @workgroup_size(8, 8)
fn computeMain(@builtin(global_invocation_id) cell: vec3u) {

    // Make falling sand
    let i = cellIndex(cell.xy);
    let currentCell = cellActive(cell.x, cell.y);
    let belowCell = cellActive(cell.x, cell.y - 1);
    let aboveCell = cellActive(cell.x, cell.y + 1);
    let aboveLeftCell = cellActive(cell.x - 1, cell.y + 1);
    let aboveRightCell = cellActive(cell.x + 1, cell.y + 1);

    if (currentCell == 0) {
        if (aboveCell == 1) {
            cellStateOut[i] = 1;
        } else {
            cellStateOut[i] = 0;
        }
    } else if (currentCell == 1) {
        if (belowCell == 1 || cell.y == 0) {
            cellStateOut[i] = 1;
        } else {
            cellStateOut[i] = 0;
        }
    }
}