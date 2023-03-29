export const BOARD_SIZE = 8

export enum BoardSymbol {
  EMPTY = '0',
  WALL = 'X',
  ENEMY = 'E',
  CHEST = 'C',
}

export const AllBoardSymbols = Object.values(BoardSymbol)

export const BoardSymbolReverse: Map<string, BoardSymbol> = new Map(
  Object.values(BoardSymbol).map((item) => [item.toString(), item])
)
