import { Clue } from '../board'

export abstract class GameSolver {
  abstract solve(
    matrix: string[][],
    hClues: Clue[],
    vClues: Clue[]
  ): Promise<string[][] | undefined>

  abstract stop(): Promise<void>
}
