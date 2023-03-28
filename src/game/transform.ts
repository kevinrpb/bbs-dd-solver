export const transposeBoard = (matrix: string[][]): string[][] =>
  matrix[0].map((_, j) => matrix.map((row) => row[j]))

export const toRaw = (matrix: string[][]): string => matrix.map((row) => row.join('')).join('\n')
