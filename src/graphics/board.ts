import { Context } from '@/components/sketch'

import { Orientation, Point } from './primitives'
import { BoardSymbol } from '@/game/constants'

const SymbolColors: Record<string, string> = {
  [BoardSymbol.CHEST]: '#F2E1AF',
  [BoardSymbol.EMPTY]: '#333333',
  [BoardSymbol.ENEMY]: '#D4AFB9',
  [BoardSymbol.WALL]: '#666666',
}

export const drawClues = (
  context: Context,
  clues: number[],
  origin: Point,
  cellSize: number,
  orientation: Orientation
) => {
  let { x, y } = origin
  x += cellSize / 2
  y += cellSize / 2

  for (const clue of clues) {
    context.fill('white')
    context.stroke('white')
    context.text(clue, x, y)

    if (Orientation.HORIZONTAL === orientation) {
      x += cellSize
    } else {
      y += cellSize
    }
  }
}

export const drawBoard = (
  context: Context,
  board: string[][],
  origin: Point,
  cellSize: number,
  drawSymbols: boolean = false
) => {
  const { x, y } = origin
  const halCell = cellSize / 2

  let cx = x + halCell
  let cy = y + halCell

  for (const row of board) {
    for (const cell of row) {
      const color = SymbolColors[cell]

      context.noStroke()
      context.fill(color)
      context.rect(cx - halCell, cy - halCell, cellSize, cellSize)

      if (drawSymbols) {
        context.fill(0)
        context.stroke(0)
        context.text(cell, cx, cy)
      }

      cx += cellSize
    }

    cx = x + halCell
    cy += cellSize
  }
}
