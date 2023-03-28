import { parseBoard, parseCells } from './parse'
import { toRaw, transposeBoard } from './transform'
import { verifyBoard } from './verify'

export enum BoardSymbol {
  EMPTY = '0',
  WALL = 'X',
  ENEMY = 'E',
  CHEST = 'C',
}

export interface BoardCell {
  i: number
  j: number
  symbol: BoardSymbol
}

export class GameBoard {
  private board: string[][]
  private transposedBoard!: string[][]
  private rawBoard!: string
  private cells!: BoardCell[]

  constructor(source: string) {
    this.board = parseBoard(source)
    this.setup()
  }

  private setup() {
    this.transposedBoard = transposeBoard(this.board)
    this.rawBoard = toRaw(this.board)
    this.cells = parseCells(this.board)
  }

  public getMatrix() {
    return this.board
  }

  public getCells() {
    return this.cells
  }

  public verify(): boolean {
    return verifyBoard(this)
  }
}

export default GameBoard
