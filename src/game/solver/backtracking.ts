import { GameSolver } from '.'
import { BoardCell, Clue } from '../board'
import { BoardSymbol } from '../constants'
import { parseCells, parseClues } from '../parse'
import { transposeBoard } from '../transform'
import { verifyMatrix } from '../verify'

export interface BacktrackingSolverProps {
  updateInterval: number
  updateCallback?: (matrix?: string[][]) => void
  endCallback?: (matrix?: string[][] | undefined) => void
}

interface BacktrackingSolverState {
  currentMatrix: string[][]
  currentColumnWalls: number[]
  currentRowWalls: number[]
  readonly wallableCells: BoardCell[]
  readonly hClues: Clue[]
  readonly vClues: Clue[]
}

export default class BacktrackingSolver extends GameSolver {
  private updateInterval: number
  private updateCallback?: (matrix?: string[][]) => void
  private endCallback?: (matrix?: string[][] | undefined) => void

  private wallableSymbols = [BoardSymbol.EMPTY, BoardSymbol.WALL]

  private nextUpdate?: number
  private state?: BacktrackingSolverState
  private shouldContinue: boolean = false

  constructor({ updateInterval, updateCallback, endCallback }: BacktrackingSolverProps) {
    super()

    this.updateInterval = updateInterval
    this.updateCallback = updateCallback
    this.endCallback = endCallback
  }

  async solve(matrix: string[][], hClues: Clue[], vClues: Clue[]): Promise<string[][] | undefined> {
    console.log(`[Backtracking] Preparing to solve`)

    // 1. Setup
    this.shouldContinue = true

    // 2. Setup state
    const currentMatrix = matrix
    const currentColumnWalls = parseClues(transposeBoard(currentMatrix))
    const currentRowWalls = parseClues(currentMatrix)
    // TODO: Ensure cells are ordered by row > column (i > j)
    const wallableCells = parseCells(matrix).filter(({ symbol }) =>
      this.wallableSymbols.includes(symbol)
    )

    this.state = {
      currentMatrix,
      currentColumnWalls,
      currentRowWalls,
      wallableCells,
      hClues,
      vClues,
    }

    // 3. Start the recursion with the first cell, if we succeed return the matrix
    console.log(`[Backtracking] Starting recursion`)
    const solved = this.recursiveSolve(0, true) || this.recursiveSolve(0, false)
    const solution = solved ? this.state.currentMatrix : undefined

    // 4. Finally, cleanup and return solution. if any
    console.log(`[Backtracking] Ending recursion`)

    this.stopRecursion()

    if (!solved) {
      console.log(`[Backtracking] No solution found`)
    }

    if (this.endCallback != undefined) {
      console.log(`[Backtracking] Calling end callback`)
      this.endCallback(solution)
    }

    return solution
  }

  private recursiveSolve(cellIndex: number, setWall: boolean): boolean {
    // console.log(`[Backtracking] <${cellIndex}, ${setWall}> Start`)

    // 1. Check for early termination
    if (!this.shouldContinue || !this.state || cellIndex >= this.state.wallableCells.length) {
      // console.log(`[Backtracking] <${cellIndex}, ${setWall}> Early termination`)
      return false
    }

    // 2. Get the cell and symbols. `i` is the row and `j` is the column.
    const { i, j, symbol } = this.state.wallableCells[cellIndex]
    const nextSymbol = setWall ? BoardSymbol.WALL : BoardSymbol.EMPTY

    // 3. If wall, check whether setting it would violate our clues before going on
    if (
      setWall &&
      (this.state.currentColumnWalls[j] + 1 > this.state.hClues[j][0] ||
        this.state.currentRowWalls[i] + 1 > this.state.vClues[i][0])
    ) {
      // console.log(`[Backtracking] <${cellIndex}, ${setWall}> Clue Violation`)
      return false
    }

    // 4. If we are leaving previous rows with clues unmatched, instantly return false.
    //    This only makes sense for the rows because the cells are ordered by row > column.
    for (let row = 0; row < i; row++) {
      if (this.state.currentRowWalls[row] < this.state.vClues[row][0]) {
        return false
      }
    }

    // 5. Update the matrix
    this.state.currentMatrix[i][j] = nextSymbol
    if (setWall) {
      this.state.currentColumnWalls[j] += 1
      this.state.currentRowWalls[i] += 1
    }

    this.sendUpdate()

    // 6. Only verify when the board is 'filled' (all clues are satisfied). Basically, the
    //    solution to the game is to find a state that satisfies all clues. Only then do we
    //    actually have to verify that the state is valid. If the board is not filled, we go
    //    on to the next level of recursion.
    //
    //    So, effectively, we only need to verify when we are in the last cell.
    let shouldVerify = cellIndex == this.state.wallableCells.length - 1

    if (shouldVerify) {
      for (let row = 0; row <= i; row++) {
        if (this.state.currentRowWalls[row] < this.state.vClues[row][0]) {
          shouldVerify = false
          break
        }
      }

      for (let column = 0; column <= j; column++) {
        if (this.state.currentColumnWalls[column] < this.state.hClues[column][0]) {
          shouldVerify = false
          break
        }
      }
    }

    if (shouldVerify) {
      try {
        if (verifyMatrix(this.state.currentMatrix)) {
          console.log(`[Backtracking] <${cellIndex}, ${setWall}> Solution!`)
          return true
        }
      } catch (error) {
        // console.error(`[Backtracking] <${cellIndex}, ${setWall}> Failed Verification`, error)
      }
    } else if (
      this.recursiveSolve(cellIndex + 1, true) ||
      this.recursiveSolve(cellIndex + 1, false)
    ) {
      return true
    }

    // 7. IF we get here, reverse our matrix change and return no solution for this path
    this.state.currentMatrix[i][j] = symbol
    if (setWall) {
      this.state.currentColumnWalls[j] -= 1
      this.state.currentRowWalls[i] -= 1
    }

    // console.log(`[Backtracking] <${cellIndex}, ${setWall}> Finished`)
    return false
  }

  private sendUpdate() {
    const now = new Date().getTime()

    // Early return if we have not fulfilled the last deadline
    if (this.nextUpdate !== undefined && this.nextUpdate > now) {
      return
    }

    // console.log(`[Backtracking] Update`)
    if (this.updateCallback != undefined) {
      this.updateCallback(this.state?.currentMatrix)
    }

    this.nextUpdate = now + this.updateInterval
  }

  private stopRecursion() {
    this.nextUpdate = undefined
    this.state = undefined
    this.shouldContinue = false
  }

  async stop(): Promise<void> {
    this.nextUpdate = undefined
    this.state = undefined
    this.shouldContinue = false
  }
}
