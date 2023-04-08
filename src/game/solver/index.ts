import { Clue } from '../board'

export abstract class GameSolver {
  abstract solve(
    matrix: string[][],
    hClues: Clue[],
    vClues: Clue[],
    updateCallback: (matrix: string[][]) => void,
    endCallback: (matrix?: string[][]) => void
  ): Promise<boolean>

  abstract stop(): Promise<void>
}
