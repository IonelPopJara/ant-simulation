@group(0) @binding(0) var<uniform> grid: vec2f;

@group(0) @binding(1) var<storage> cellStateIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

fn cellActive(x: i32, y: i32) -> u32 {
    if (y < 0 || x >= i32(grid.x) || x < 0) {
        return 1;
    } else if (y >= i32(grid.y)) {
        return 0;
    }

    return cellStateIn[cellIndex(vec2(u32(x),u32(y)))];
}

fn cellIndex(cell: vec2u) -> u32 {
    return cell.y * u32(grid.x) + cell.x;
}

@compute @workgroup_size(8, 8)
fn computeMain(@builtin(global_invocation_id) cell: vec3u) {

    // Make falling sand
    let i = cellIndex(cell.xy);
    let currentCell = cellActive(i32(cell.x), i32(cell.y));
    let belowCell = cellActive(i32(cell.x), i32(cell.y - 1));
    let belowLeftCell = cellActive(i32(cell.x - 1), i32(cell.y - 1));
    let belowRightCell = cellActive(i32(cell.x + 1), i32(cell.y - 1));
    let leftCell = cellActive(i32(cell.x - 1), i32(cell.y));
    let rightCell = cellActive(i32(cell.x + 1), i32(cell.y));

    if (currentCell == 1) {
        if (belowCell == 0) {
            cellStateOut[i] = 0;
            cellStateOut[cellIndex(vec2(cell.x, cell.y - 1))] = 1;
        }
        else if (belowLeftCell == 0 && leftCell == 0) {
            cellStateOut[i] = 0;
            cellStateOut[cellIndex(vec2(cell.x - 1, cell.y - 1))] = 1;
        }
        else if (belowRightCell == 0 && rightCell == 0) {
            cellStateOut[i] = 0;
            cellStateOut[cellIndex(vec2(cell.x + 1, cell.y - 1))] = 1;
        }
        else {
            cellStateOut[i] = 1;
        }
    }
}