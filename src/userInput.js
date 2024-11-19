export function createInputHandler(canvas, gridSize) {
    const mouseCellStateArray = new Array(gridSize * gridSize);
    let isMouseHeld = false; // Flag to track the mouse button state

    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        let relativeY = e.clientY - canvas.offsetTop;

        let withinCanvas =
            relativeX > 0 &&
            relativeX < canvas.width &&
            relativeY > 0 &&
            relativeY < canvas.height;

        if (withinCanvas) {
            const cellY = Math.floor(
                Math.abs(relativeY - canvas.height) / (canvas.height / gridSize)
            );

            const cellX = Math.floor(relativeX / (canvas.width / gridSize));

            const index = cellY * gridSize + cellX;

            let indexAbove = (cellY - 1) * gridSize + cellX;
            let indexBelow = (cellY + 1) * gridSize + cellX;
            let indexLeft = cellY * gridSize + cellX - 1;
            let indexRight = cellY * gridSize + cellX + 1;
            mouseCellStateArray[index] = 1;
            mouseCellStateArray[indexAbove] = 1;
            mouseCellStateArray[indexBelow] = 1;
            mouseCellStateArray[indexLeft] = 1;
        }
    }

    function setupListeners() {
        canvas.addEventListener("mousedown", (e) => {
            isMouseHeld = true;
            mouseMoveHandler(e); // Perform initial action
        });

        canvas.addEventListener("mouseup", () => {
            isMouseHeld = false;
        });

        canvas.addEventListener("mouseleave", () => {
            isMouseHeld = false; // Reset the flag if the mouse leaves the canvas
        });

        canvas.addEventListener("mousemove", (e) => {
            if (isMouseHeld) {
                mouseMoveHandler(e); // Call the function if the mouse is held
            }
        });
    }

    setupListeners();

    return {
        getUserInputState() {
            const stateCopy = new Uint32Array(mouseCellStateArray);
            mouseCellStateArray.fill(0);
            return stateCopy;
        },
    };
}
