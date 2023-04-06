import { BoardSymbol, BoardSymbolReverse } from '@/game/constants'
import { parseBoard, parseCells } from '@/game/parse'
import { toRaw, transposeBoard } from '@/game/transform'
import { verifyBoard } from '@/game/verify'

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

  public set(i: number, j: number, symbol: BoardSymbol) {
    this.board[i][j] = symbol
    this.setup()
  }

  public get(i: number, j: number): BoardSymbol {
    return BoardSymbolReverse.get(this.board[i][j])!
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
