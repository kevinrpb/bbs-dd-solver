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

export const BoardSymbolCycle: Record<BoardSymbol, BoardSymbol> = {
  [BoardSymbol.EMPTY]: BoardSymbol.WALL,
  [BoardSymbol.WALL]: BoardSymbol.ENEMY,
  [BoardSymbol.ENEMY]: BoardSymbol.CHEST,
  [BoardSymbol.CHEST]: BoardSymbol.EMPTY,
}

export const BoardSymbolCycleReverse: Record<BoardSymbol, BoardSymbol> = {
  [BoardSymbol.EMPTY]: BoardSymbol.CHEST,
  [BoardSymbol.WALL]: BoardSymbol.EMPTY,
  [BoardSymbol.ENEMY]: BoardSymbol.WALL,
  [BoardSymbol.CHEST]: BoardSymbol.ENEMY,
}
