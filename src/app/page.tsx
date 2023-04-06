'use client'
import React from 'react'

import SimpleSketch, { Canvas, Context, MousedClickedEvent } from '@/components/sketch'

import styles from './page.module.scss'
import GameBoard from '@/game/board'
import { BOARD_SIZE, BoardSymbol, BoardSymbolCycle, BoardSymbolCycleReverse } from '@/game/constants'
import { drawBoard, drawClues } from '@/graphics/board'
import { Orientation } from '@/graphics/primitives'

const initialBoard = new GameBoard(`
  00000000
  0000000E
  00E00000
  0000000E
  00000000
  0C00000E
  00000000
  0000000E
`)

const initialHClues = [1, 4, 2, 7, 0, 4, 4, 4]
const initialVClues = [3, 2, 5, 3, 4, 1, 4, 4]

export default function Home() {
  const board = React.useRef<GameBoard>(initialBoard)
  const [hClues, setHClues] = React.useState<number[]>(initialHClues)
  const [vClues, setVClues] = React.useState<number[]>(initialVClues)

  const updateHClue = React.useCallback(
    (i: number, reverse: boolean = false) => {
      let clues = hClues

      const current = hClues[i]
      const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

      clues[i] = next

      setHClues(clues)
    },
    [hClues]
  )

  const updateVClue = React.useCallback(
    (i: number, reverse: boolean = false) => {
      let clues = vClues

      const current = vClues[i]
      const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

      clues[i] = next

      setVClues(clues)
    },
    [vClues]
  )

  const updateBoardCell = React.useCallback(
    (i: number, j: number, reverse: boolean = false) => {
      const current = board.current.get(i, j)
      const next = reverse
        ? BoardSymbolCycleReverse[current]
        : BoardSymbolCycle[current]

      board.current.set(i, j, next)
    },
    [board]
  )

  const mouseClicked = React.useCallback(
    (context: Context, canvas: Canvas, event: MousedClickedEvent) => {
      const matrix = board.current.getMatrix()
      const cellSize = context.width / (BOARD_SIZE + 1)
      const x = Math.floor(event.offsetX / cellSize)
      const y = Math.floor(event.offsetY / cellSize)

      if (x == 0 && y == 0) {
        return
      } else if (x == 0) {
        // We clicked a vClue
        const i = y - 1

        updateVClue(i, event.ctrlKey)
        console.log(`clicked <${vClues[i]}> vClues[${i}]`)
      } else if (y == 0) {
        // We clicked a hClue
        const i = x - 1

        updateHClue(i, event.ctrlKey)
        console.log(`clicked <${hClues[i]}> hClues[${i}]`)
      } else {
        // we clicked the board
        const i = y - 1
        const j = x - 1

        updateBoardCell(i, j, event.ctrlKey)
        console.log(`clicked <${matrix[i][j]}> board[${i}][${j}]`)
      }
    },
    [board, hClues, vClues, updateBoardCell, updateVClue, updateHClue]
  )

  const draw = React.useCallback(
    (context: Context, canvas: Canvas) => {
      const matrix = board.current.getMatrix()
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
    },
    [hClues, vClues]
  )

  return (
    <main className={styles.main}>
      <div id={styles['setup']} className={styles['sketch-wrapper']}>
        <SimpleSketch
          id='setup-sketch'
          className={styles['react-p5']}
          draw={draw}
          mouseClicked={mouseClicked}
        />
      </div>
      <div id={styles['preview']} className={styles['sketch-wrapper']}>
        <SimpleSketch id='preview-sketch' className={styles['react-p5']} draw={draw} />
      </div>
    </main>
  )
}
