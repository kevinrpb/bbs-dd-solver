import { BoardSymbol, BoardSymbolReverse } from '@/game/constants'
import { parseBoard, parseCells, parseClues } from '@/game/parse'
import { toRaw, transposeBoard } from '@/game/transform'
import { verifyBoard } from '@/game/verify'
import { Orientation } from '@/graphics/primitives'

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
  private hCluesExpected!: number[]
  private vCluesExpected!: number[]

  constructor(source: string) {
    this.board = parseBoard(source)
    this.setup()
  }

  private setup() {
    this.transposedBoard = transposeBoard(this.board)
    this.rawBoard = toRaw(this.board)
    this.cells = parseCells(this.board)
    this.hCluesExpected = parseClues(this.transposedBoard)
    this.vCluesExpected = parseClues(this.board)
  }

  public set(i: number, j: number, symbol: BoardSymbol) {
    this.board[i][j] = symbol
    this.setup()
  }

  public get(i: number, j: number): BoardSymbol {
    return BoardSymbolReverse.get(this.board[i][j])!
  }

  public getMatrix(): string[][] {
    return this.board
  }

  public getITransposedMatrix(): string[][] {
    return this.transposedBoard
  }

  public getCells(): BoardCell[] {
    return this.cells
  }

  public getExpectedClues(orientation: Orientation): number[] {
    return Orientation.HORIZONTAL == orientation ? this.hCluesExpected : this.vCluesExpected
  }

  public verify(): boolean {
    return verifyBoard(this)
  }
}

export default GameBoard
