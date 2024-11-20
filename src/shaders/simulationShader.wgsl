@group(0) @binding(0) var<uniform> grid: vec2f;

@group(0) @binding(1) var<storage> cellStateIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;
@group(0) @binding(3) var<storage> mouseInputIn: array<u32>;

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

    // Get the index of the current cell

    let i = cellIndex(cell.xy);
    // Check the mouse input
    let mouseCell = mouseInputIn[i];
    if (mouseCell == 1) {
        cellStateOut[i] = 1;
    }

    // Make falling sand
    let currentCell = cellActive(i32(cell.x), i32(cell.y));

    var targetVelocity = cellStateIn[i];

    for (var y = u32(1); y <= targetVelocity; y++) {
        let currentBelowCell = cellActive(i32(cell.x), i32(cell.y - y));
        if (currentBelowCell >= 1) {
            targetVelocity = y - 1;
            break;
        }
    }

    // Get the index of the cell below
    let belowCellIndex = cellIndex(vec2(cell.x, cell.y - targetVelocity));
    let belowCell = cellActive(i32(cell.x), i32(cell.y - targetVelocity));

    // Get the index of the cell below left
    let belowLeftCellIndex = cellIndex(vec2(cell.x - 1, cell.y - 1));
    let belowLeftCell = cellActive(i32(cell.x - 1), i32(cell.y - 1));

    // Get the index of the cell below right
    let belowRightCellIndex = cellIndex(vec2(cell.x + 1, cell.y - 1));
    let belowRightCell = cellActive(i32(cell.x + 1), i32(cell.y - 1));

    let leftCell = cellActive(i32(cell.x - 1), i32(cell.y));
    let rightCell = cellActive(i32(cell.x + 1), i32(cell.y));

    if (currentCell >= 1) {
        if (belowCell == 0) {
            cellStateOut[i] = 0;
            cellStateOut[belowCellIndex] = targetVelocity + 1;
        }
        else if (belowLeftCell == 0 && leftCell == 0) {
            cellStateOut[i] = 0;
            cellStateOut[belowLeftCellIndex] = 1;
        }
        else if (belowRightCell == 0 && rightCell == 0) {
            cellStateOut[i] = 0;
            cellStateOut[belowRightCellIndex] = 1;
        }
        else {
            cellStateOut[i] = 1;
        }
    }
}