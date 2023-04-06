import { BoardCell } from '@/game/board'
import { AllBoardSymbols, BOARD_SIZE, BoardSymbol, BoardSymbolReverse } from '@/game/constants'

export const parseBoard = (
  source: string,
  size: number = BOARD_SIZE,
  allowedSymbols: string[] = AllBoardSymbols
): string[][] => {
  const rows = source
    // Split into rows
    .split('\n')
    // Trim whitespaces around line
    .map((row) => row.trim())
    // Remove empty lines
    .filter((row) => row != '')
    // Split each line into character
    .map((row) =>
      [...row]
        // Ensure uppercase
        .map((char) => char.toUpperCase())
        // Only keep valid characters
        .filter((char) => allowedSymbols.includes(char))
    )

  if (rows.length != size) {
    throw new Error(`Board requires ${size} rows but got ${rows.length}`)
  }

  for (let i = 0; i < size; i++) {
    if (rows[i].length != size) {
      throw new Error(
        `Board row ${i} contains ${rows[i].length} columns, required number is ${size}`
      )
    }
  }

  return rows
}

export const parseCells = (matrix: string[][]): BoardCell[] =>
  matrix.flatMap((row, i) =>
    row.map((char, j) => {
      const symbol: BoardSymbol | undefined = BoardSymbolReverse.get(char)

      if (symbol == undefined) {
        throw new Error(`Board contained invalid symbol at [${i}, ${j}]`)
      }

      return { i, j, symbol }
    })
  )
