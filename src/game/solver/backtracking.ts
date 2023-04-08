import { GameSolver } from '.'
import { Clue } from '../board'

export default class BacktrackingSolver extends GameSolver {
  private shouldContinue: boolean = false

  constructor() {
    super()
  }

  solve(
    matrix: string[][],
    hClues: Clue[],
    vClues: Clue[],
    updateCallback: (matrix: string[][]) => void,
    endCallback: (matrix?: string[][] | undefined) => void
  ): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  stop(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
