import GameBoard, { BoardCell, BoardSymbol } from './board'
import { BOARD_SIZE } from './constants'

/**
 * Verifies whether the board is valid.
 */
export const verifyBoard = (board: GameBoard) => {
  // 1. First, verify each cell individually
  const matrix = board.getMatrix()

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const symbol = matrix[i][j]

      let check = false

      switch (symbol) {
        case BoardSymbol.EMPTY:
          check = verifyEmpty(matrix, i, j)
          break
        case BoardSymbol.WALL:
          check = verifyWall(matrix, i, j)
          break
        case BoardSymbol.ENEMY:
          check = verifyEnemy(matrix, i, j)
          break
        case BoardSymbol.CHEST:
          check = verifyChest(matrix, i, j)
          break
        default:
          throw new Error(`Verification failed at [${j}, ${i}] (invalid symbol)`)
      }

      if (!check) {
        // ? I guess this should never happen since we throw early, but who knows
        console.error('Failed to verify')
        return false
      }
    }
  }

  // 2. Verify there is only one, continuous hallway
  verifyHallway(board)

  return true
}

/**
 * This verifies that there is only one, continuous hallway by walking all the empty
 * cells (starting from the first one) and visiting its neighbouring, also empty cells.
 * This way, when we are done, if we haven't visited all the empty cells in the board,
 * we can say that there must be more than one hallway.
 */
const verifyHallway = (board: GameBoard) => {
  const hallway = board.getCells().filter(({ symbol }) => symbol == BoardSymbol.EMPTY)

  let queue: BoardCell[] = [hallway[0]]
  let visited: BoardCell[] = []

  let nextCell = queue.shift()
  while (nextCell != undefined) {
    // Set this cell as visited
    if (!visited.includes(nextCell)) {
      visited.push(nextCell)
    }

    // ! This would probably be more performant if we just check each position
    // ! instead of filtering
    // Get its neighbours (only those 'empty' and not yet visited)
    const top = hallway.filter(({ i, j }) => i == nextCell!.i - 1 && j == nextCell!.j)[0]
    const bottom = hallway.filter(({ i, j }) => i == nextCell!.i + 1 && j == nextCell!.j)[0]
    const left = hallway.filter(({ i, j }) => i == nextCell!.i && j == nextCell!.j - 1)[0]
    const right = hallway.filter(({ i, j }) => i == nextCell!.i && j == nextCell!.j + 1)[0]

    const neighbours = [top, bottom, left, right]
      .filter((cell) => cell != undefined)
      .filter((cell) => !visited.includes(cell))
      .filter((cell) => !queue.includes(cell))

    // Add the neighbours to be visited
    queue.push(...neighbours)

    // Get the next cell
    nextCell = queue.shift()
  }

  // Now make sure that each hallway cell has been visited above
  for (const cell of hallway) {
    if (!visited.includes(cell)) {
      throw new Error(
        'Hallway verification failed (there seems to be multiple, unconnected hallways)'
      )
    }
  }
}

/**
 * Empty cells are part of a hallway. Hallways always connect
 * orthogonally and are '1 cell wide'. Basically this means that
 * it is not possible to find a 2x2 portion of the board all
 * with empty cells.
 *
 * To verify this, we check whether this cell would form a 2x2
 * empty square to its right and bottom (x+1, y+1). We only need
 * to do this because the other options (top/left) are checked
 * by other cells. This way we avoid doing the same check twice.
 */
const verifyEmpty = (matrix: string[][], i: number, j: number) => {
  // If we are all the way right or down, we cannot form the 2x2
  if (i + 1 == BOARD_SIZE || j + 1 == BOARD_SIZE) {
    return true
  }

  const makesSquare =
    matrix[i + 1][j] == BoardSymbol.EMPTY &&
    matrix[i][j + 1] == BoardSymbol.EMPTY &&
    matrix[i + 1][j + 1] == BoardSymbol.EMPTY

  if (makesSquare) {
    // j and i are reversed here so that it matches the way
    // a person sees the board
    throw new Error(`Empty verification failed at [${j}, ${i}] (could form 2x2 empty square)`)
  }

  return true
}

/**
 * Walls are always OK I think?
 *
 */
// eslint-disable-next-line no-unused-vars
const verifyWall = (matrix: string[][], i: number, j: number): boolean => {
  return true
}

/**
 * The rule for enemies is that they should have one 'open'
 * side (a hallway). All the other sides should be 'closed'
 * (a wall or an edge).
 *
 * Here, we look whether each side is closed and check that
 * only one is opened.
 *
 */
const verifyEnemy = (matrix: string[][], i: number, j: number): boolean => {
  const topClosed = i == 0 || matrix[i - 1][j] == BoardSymbol.WALL
  const leftClosed = j == 0 || matrix[i][j - 1] == BoardSymbol.WALL
  const bottomClosed = i + 1 == BOARD_SIZE || matrix[i + 1][j] == BoardSymbol.WALL
  const rightClosed = j + 1 == BOARD_SIZE || matrix[i][j + 1] == BoardSymbol.WALL

  const isDeadEnd = (+!!topClosed) + (+!!leftClosed) + (+!!bottomClosed) + (+!!rightClosed) == 3

  if (!isDeadEnd) {
    throw new Error(`Enemy verification failed at [${j}, ${i}] (enemy is not in dead end)`)
  }

  return true
}

/**
 * A chest should be in a treasure room (i.e. a 3x3 empty space
 * an opening). To ensure this, we do the following:
 *
 * 1. Check the cells orthogonal to the chest for walls. The idea
 *    is to identify the position of the chest within the room based
 *    on the walls it is adjacent to. This also allows us to double
 *    check that the chest is adjacent to, at most, 2 walls.
 * 2. Define the rooms boundary by finding it's 'origin' (top-left
 *    corner) based on the position of the chest.
 * 3. Check that the inside of the room contains 8 'empty' cells and
 *    1 'chest'
 * 4. Check that the edges of the room contain 11 'walls' and 1 'empty'
 *
 */
const verifyChest = (matrix: string[][], i: number, j: number): boolean => {
  // 1. Get walls
  const topClosed = i == 0 || matrix[i - 1][j] == BoardSymbol.WALL
  const leftClosed = j == 0 || matrix[i][j - 1] == BoardSymbol.WALL
  const bottomClosed = i + 1 == BOARD_SIZE || matrix[i + 1][j] == BoardSymbol.WALL
  const rightClosed = j + 1 == BOARD_SIZE || matrix[i][j + 1] == BoardSymbol.WALL

  if ((+!!topClosed) + (+!!leftClosed) + (+!!bottomClosed) + (+!!rightClosed) > 2) {
    throw new Error(`Chest verification failed at [${j}, ${i}] (treasure room is not 3x3)`)
  }

  // 2. Get origin
  let i0Room = null
  let j0Room = null

  if (topClosed) {
    if (leftClosed) {
      // Chest top-left
      i0Room = i - 1
      j0Room = j - 1
    } else if (rightClosed) {
      // Chest top-right
      i0Room = i - 1
      j0Room = j - 3
    } else {
      // Chest top-center
      i0Room = i - 1
      j0Room = j - 2
    }
  } else if (bottomClosed) {
    if (leftClosed) {
      // Chest bottom-left
      i0Room = i - 3
      j0Room = j - 1
    } else if (rightClosed) {
      // Chest bottom-right
      i0Room = i - 3
      j0Room = j - 3
    } else {
      // Chest bottom-center
      i0Room = i - 3
      j0Room = j - 2
    }
  } else if (leftClosed) {
    // Chest middle-left
    i0Room = i - 2
    j0Room = j - 1
  } else if (rightClosed) {
    // Chest middle-right
    i0Room = i - 2
    j0Room = j - 3
  } else {
    // Chest middle-center
    i0Room = i - 2
    j0Room = j - 2
  }

  // 3. Check inside

  // If the room goes out of bounds, it cannot be 3x3
  if (i0Room < -1 || j0Room < -1 || i0Room + 3 >= BOARD_SIZE || j0Room + 3 >= BOARD_SIZE) {
    throw new Error(`Chest verification failed at [${j}, ${i}] (room is not 3x3)`)
  }

  let nEmptyInside = 0
  let nChestsInside = 0
  for (let ri = i0Room + 1; ri < i0Room + 4; ri++) {
    for (let rj = j0Room + 1; rj < j0Room + 4; rj++) {
      const cell = matrix[ri][rj]

      if (cell == BoardSymbol.EMPTY) {
        nEmptyInside += 1
      } else if (cell == BoardSymbol.CHEST) {
        nChestsInside += 1
      } else {
        throw new Error(
          `Chest verification failed at [${j}, ${i}] (room contains invalid cell at [${rj}, ${ri}])`
        )
      }
    }
  }

  if (nEmptyInside != 8 || nChestsInside != 1) {
    throw new Error(
      `Chest verification failed at [${j}, ${i}] (room contains invalid cells or is not 3x3)`
    )
  }

  // 4. Check edges

  let edges = []

  // Top edge
  if (i0Room < 0) {
    edges.push(BoardSymbol.WALL, BoardSymbol.WALL, BoardSymbol.WALL)
  } else {
    edges.push(matrix[i0Room][j0Room + 1], matrix[i0Room][j0Room + 2], matrix[i0Room][j0Room + 3])
  }

  // Bottom edge (don't need to check the room is actually there bc we did that in the previous step)
  if (i0Room >= BOARD_SIZE) {
    edges.push(BoardSymbol.WALL, BoardSymbol.WALL, BoardSymbol.WALL)
  } else {
    edges.push(
      matrix[i0Room + 4][j0Room + 1],
      matrix[i0Room + 4][j0Room + 2],
      matrix[i0Room + 4][j0Room + 3]
    )
  }

  // Left edge
  if (j0Room < 0) {
    edges.push(BoardSymbol.WALL, BoardSymbol.WALL, BoardSymbol.WALL)
  } else {
    edges.push(matrix[i0Room + 1][j0Room], matrix[i0Room + 2][j0Room], matrix[i0Room + 3][j0Room])
  }

  // Right edge
  if (j0Room >= BOARD_SIZE) {
    edges.push(BoardSymbol.WALL, BoardSymbol.WALL, BoardSymbol.WALL)
  } else {
    edges.push(
      matrix[i0Room + 1][j0Room + 4],
      matrix[i0Room + 2][j0Room + 4],
      matrix[i0Room + 3][j0Room + 4]
    )
  }

  let nEmptyOutside = 0
  let nWallsOutside = 0
  for (const edge of edges) {
    if (edge == BoardSymbol.EMPTY) {
      nEmptyOutside += 1
    } else if (edge == BoardSymbol.WALL) {
      nWallsOutside += 1
    } else {
      throw new Error(`Chest verification failed at [${j}, ${i}] (room is not properly enclosed)`)
    }
  }

  if (nEmptyOutside != 1 || nWallsOutside != 11) {
    throw new Error(`Chest verification failed at [${j}, ${i}] (room is not properly enclosed)`)
  }

  return true
}
