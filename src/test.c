#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdbool.h>

#define CELL "#"
#define SPACE "."

#define ANT_UP "^"
#define ANT_DOWN "v"
#define ANT_LEFT "<"
#define ANT_RIGHT ">"

#define ROWS 100
#define COLS 100
#define OFFSET 5

enum Direction
{
    UP,
    RIGHT,
    DOWN,
    LEFT
};

typedef struct Ant
{
    int row;
    int col;
    enum Direction direction;
} ANT;

void moveCursor(int row, int col)
{
    printf("\033[%d;%dH", row + OFFSET, col + OFFSET);
}

void printAnt(ANT ant)
{
    moveCursor(ant.row, ant.col);
    switch (ant.direction)
    {
    case UP:
        printf(ANT_UP);
        break;
    case DOWN:
        printf(ANT_DOWN);
        break;
    case LEFT:
        printf(ANT_LEFT);
        break;
    case RIGHT:
        printf(ANT_RIGHT);
        break;
    default:
        break;
    }
}

void printGrid(bool grid[ROWS][COLS], ANT ant, bool previousGrid[ROWS][COLS])
{
    for (int row = 0; row < ROWS; row++)
    {
        for (int col = 0; col < COLS; col++)
        {
            // If the grid changed, render it
            if (grid[row][col] != previousGrid[row][col])
            {
                moveCursor(row, col);
                if (grid[row][col])
                {
                    printf(CELL);
                }
                else
                {
                    printf(SPACE);
                }
            }
        }
    }
    printAnt(ant);
    fflush(stdout);
}

void initializeGrid(bool grid[ROWS][COLS])
{
    for (int row = 0; row < ROWS; row++)
    {
        for (int col = 0; col < COLS; col++)
        {
            moveCursor(row, col);
            if (grid[row][col])
            {
                printf(CELL);
            }
            else
            {
                printf(SPACE);
            }
        }
    }
    fflush(stdout);
}

void updateAnt(ANT *ant)
{
    switch (ant->direction)
    {
    case UP:
        ant->row = (ant->row - 1 + ROWS) % ROWS;
        break;
    case DOWN:
        ant->row = (ant->row + 1) % ROWS;
        break;
    case LEFT:
        ant->col = (ant->col - 1 + COLS) % COLS;
        break;
    case RIGHT:
        ant->col = (ant->col + 1) % COLS;
        break;
    default:
        break;
    }
}

void turnAnt(ANT *ant, bool grid[ROWS][COLS], bool previousGrid[ROWS][COLS])
{
    // If the current square is an active square
    if (grid[ant->row][ant->col])
    {
        // Turn clock-wise
        ant->direction = (ant->direction + 1) % 4;
    }
    // Otherwise
    else
    {
        // Turn counter-clock-wise
        ant->direction = (ant->direction - 1) % 4;
    }

    previousGrid[ant->row][ant->col] = grid[ant->row][ant->col];
    grid[ant->row][ant->col] = !grid[ant->row][ant->col];
}

int main()
{
    bool grid[ROWS][COLS] = {false};
    bool previousGrid[ROWS][COLS] = {false};

    initializeGrid(grid);

    ANT ant = {ROWS / 2, COLS / 2, UP};

    while (true)
    {
        printGrid(grid, ant, previousGrid);
        turnAnt(&ant, grid, previousGrid);
        updateAnt(&ant);
        usleep(100);
    }

    return 0;
}