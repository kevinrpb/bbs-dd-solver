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
  currentHWalls: number[]
  currentVWalls: number[]
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
    const currentHWalls = parseClues(transposeBoard(currentMatrix))
    const currentVWalls = parseClues(currentMatrix)
    const wallableCells = parseCells(matrix).filter(({ symbol }) =>
      this.wallableSymbols.includes(symbol)
    )

    this.state = {
      currentMatrix,
      currentHWalls,
      currentVWalls,
      wallableCells,
      hClues,
      vClues,
    }

    // 3. Start the recursion with the first cell, if we succeed return the matrix
    console.log(`[Backtracking] Starting recursion`)
    if (this.recursiveSolve(0, true) || this.recursiveSolve(0, false)) {
      return this.state?.currentMatrix
    }

    // 4. In any other case, cleanup and we were not able to solve
    console.log(`[Backtracking] Ending recursion`)
    this.stopRecursion()

    if (this.endCallback != undefined) {
      console.log(`[Backtracking] Calling end callback`)
      this.endCallback(undefined)
    }

    return undefined
  }

  private recursiveSolve(cellIndex: number, setWall: boolean): boolean {
    console.log(`[Backtracking] <${cellIndex}, ${setWall}> Start`)

    // 1. Check for early termination
    if (!this.shouldContinue || !this.state || cellIndex >= this.state.wallableCells.length) {
      // console.log(`[Backtracking] <${cellIndex}, ${setWall}> Early termination`)
      return false
    }

    // 2. Get the cell and symbols
    const { i, j, symbol } = this.state.wallableCells[cellIndex]
    const nextSymbol = setWall ? BoardSymbol.WALL : BoardSymbol.EMPTY

    // 3. If wall, check whether setting it would violate our clues before going on
    if (
      setWall &&
      (this.state.currentHWalls[j] + 1 > this.state.hClues[j][0] ||
        this.state.currentVWalls[i] + 1 > this.state.vClues[i][0])
    ) {
      // console.log(`[Backtracking] <${cellIndex}, ${setWall}> Clue Violation`)
      return false
    }

    // 4. Update the matrix & try to verify
    this.state.currentMatrix[i][j] = nextSymbol
    this.sendUpdate()

    try {
      if (verifyMatrix(this.state.currentMatrix)) {
        console.log(`[Backtracking] <${cellIndex}, ${setWall}> Solution!`)
        return true
      }
    } catch (error) {
      // console.error(`[Backtracking] <${cellIndex}, ${setWall}> Failed Verification`, error)
    }

    // 5. Try recursing instead (verify we should continue in between)
    if (this.recursiveSolve(cellIndex + 1, true)) {
      return true
    }
    if (!this.shouldContinue) {
      return false
    }
    if (this.recursiveSolve(cellIndex + 1, false)) {
      return true
    }

    // 6. Reverse our matrix change and return no solution
    this.state.currentMatrix[i][j] = symbol

    console.log(`[Backtracking] <${cellIndex}, ${setWall}> Finished`)
    return false
  }

  private sendUpdate() {
    const now = new Date().getTime()

    // Early return if we have not fulfilled the last deadline
    if (this.nextUpdate !== undefined && this.nextUpdate < now) {
      return
    }

    this.nextUpdate = now + this.updateInterval
    console.log(`[Backtracking] Update`)

    if (this.updateCallback != undefined) {
      this.updateCallback(this.state?.currentMatrix)
    }
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
