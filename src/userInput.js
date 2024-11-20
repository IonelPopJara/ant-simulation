function createInputHandler(canvas, gridSize) {
    let isMouseDown = false;
    let lastMouseEvent = null;

    const mouseCellStateArray = new Array(gridSize * gridSize);

    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        let relativeY = e.clientY - canvas.offsetTop;

        let withinCanvas =
            relativeX > 0 &&
            relativeX < canvas.width &&
            relativeY > 0 &&
            relativeY < canvas.height;

        if (withinCanvas) {
            let cellY = Math.floor(
                Math.abs(relativeY - canvas.height) / (canvas.height / gridSize)
            );

            let cellX = Math.floor(relativeX / (canvas.width / gridSize));

            const index = cellY * gridSize + cellX;

            let indexAbove = (cellY - 1) * gridSize + cellX;
            let indexBelow = (cellY + 1) * gridSize + cellX;
            let indexLeft = cellY * gridSize + cellX - 1;
            let indexRight = cellY * gridSize + cellX + 1;
            mouseCellStateArray[index] = 1;

            // console.log(`indexLeft: ${indexLeft} | indexRight: ${indexRight}`);

            if (indexAbove >= 0 && indexAbove < gridSize * gridSize) {
                mouseCellStateArray[indexAbove] = 1;
            }

            if (indexBelow >= 0 && indexBelow < gridSize * gridSize) {
                mouseCellStateArray[indexBelow] = 1;
            }

            if (cellX - 1 > 0 && indexLeft < gridSize * gridSize) {
                mouseCellStateArray[indexLeft] = 1;
            }

            if (cellX + 1 < gridSize && indexRight < gridSize * gridSize) {
                console.log(
                    `bitch index: ${indexRight} | coordinates: (${
                        cellX + 1
                    }, ${cellY})`
                );
                mouseCellStateArray[indexRight] = 1;
            }
        }
    }

    function setupListeners() {
        document.addEventListener("mousedown", (e) => {
            lastMouseEvent = e;
            isMouseDown = true;
        });

        document.addEventListener("mouseup", () => {
            lastMouseEvent = null;
            isMouseDown = false;
        });

        canvas.addEventListener("mouseleave", () => {
            lastMouseEvent = null;
        });

        canvas.addEventListener("mouseenter", (e) => {
            lastMouseEvent = e;
        });

        canvas.addEventListener("mousemove", (e) => {
            if (lastMouseEvent) {
                lastMouseEvent = e;
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
        frameCallback() {
            if (lastMouseEvent && isMouseDown) {
                mouseMoveHandler(lastMouseEvent); // Call the function if the mouse is held
            }
        },
    };
}

export { createInputHandler };
