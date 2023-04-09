import { Context } from '@/components/sketch'

import { Orientation, Point } from './primitives'
import { BOARD_SIZE, BoardSymbol } from '@/game/constants'
import GameBoard, { Clue } from '@/game/board'

const SymbolColors: Record<string, string> = {
  [BoardSymbol.CHEST]: '#F2E1AF',
  [BoardSymbol.EMPTY]: '#333333',
  [BoardSymbol.ENEMY]: '#D4AFB9',
  [BoardSymbol.WALL]: '#666666',
}

export const drawClues = (
  context: Context,
  clues: Clue[],
  origin: Point,
  cellSize: number,
  orientation: Orientation
) => {
  let { x, y } = origin
  x += cellSize / 2
  y += cellSize / 2

  for (const [clue, state] of clues) {
    context.fill(state ? 'grey' : 'white')
    context.stroke(state ? 'grey' : 'white')
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

export const drawAll = (context: Context, board: GameBoard, hClues: Clue[], vClues: Clue[]) => {
  const matrix = board.getMatrix()
  const cellSize = context.width / (BOARD_SIZE + 1)

  // Common settings
  context.background(51)
  context.textAlign(context.CENTER, context.CENTER)
  context.textSize(20)

  // Draw clues
  drawClues(context, hClues, { x: cellSize, y: 0 }, cellSize, Orientation.HORIZONTAL)
  drawClues(context, vClues, { x: 0, y: cellSize }, cellSize, Orientation.VERTICAL)

  // Draw board
  drawBoard(context, matrix, { x: cellSize, y: cellSize }, cellSize)

  // Draw sketch & board border
  context.noFill()
  context.stroke(100)
  context.rect(0, 0, context.width, context.height)
  context.rect(cellSize, cellSize, cellSize * BOARD_SIZE, cellSize * BOARD_SIZE)
}
