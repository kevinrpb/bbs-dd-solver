'use client'
import React from 'react'

import SimpleSketch, { Canvas, Context, MousedClickedEvent } from '@/components/sketch'

import styles from './page.module.scss'
import GameBoard from '@/game/board'
import {
  BOARD_SIZE,
  BoardSymbol,
  BoardSymbolCycle,
  BoardSymbolCycleReverse,
} from '@/game/constants'
import { drawAll } from '@/graphics/board'
import { Orientation } from '@/graphics/primitives'

export type Clue = [number, boolean]

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

const initialHClues: Clue[] = [
  [1, false],
  [4, false],
  [2, false],
  [7, false],
  [0, false],
  [4, false],
  [4, false],
  [4, false],
]

const initialVClues: Clue[] = [
  [3, false],
  [2, false],
  [5, false],
  [3, false],
  [4, false],
  [1, false],
  [4, false],
  [4, false],
]

export default function Home() {
  const board = React.useRef<GameBoard>(initialBoard)
  const [hClues, setHClues] = React.useState<Clue[]>(initialHClues)
  const [vClues, setVClues] = React.useState<Clue[]>(initialVClues)

  const calculateClues = React.useCallback(() => {
    const hExpected = board.current.getExpectedClues(Orientation.HORIZONTAL)
    const vExpected = board.current.getExpectedClues(Orientation.VERTICAL)

    const hNew: Clue[] = hClues.map(([clue, _], i) => [clue, clue == hExpected[i]])
    const vNew: Clue[] = vClues.map(([clue, _], i) => [clue, clue == vExpected[i]])

    setHClues(hNew)
    setVClues(vNew)
  }, [board, hClues, vClues])

  React.useEffect(calculateClues, [calculateClues])

  const updateHClue = React.useCallback(
    (i: number, reverse: boolean = false) => {
      let clues = hClues

      const [current, state] = hClues[i]
      const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

      clues[i] = [next, state]

      setHClues(clues)
      calculateClues()
    },
    [hClues, calculateClues]
  )

  const updateVClue = React.useCallback(
    (i: number, reverse: boolean = false) => {
      let clues = vClues

      const [current, state] = vClues[i]
      const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

      clues[i] = [next, state]

      setVClues(clues)
      calculateClues()
    },
    [vClues, calculateClues]
  )

  const updateBoardCell = React.useCallback(
    (i: number, j: number, reverse: boolean = false) => {
      const current = board.current.get(i, j)
      const next = reverse ? BoardSymbolCycleReverse[current] : BoardSymbolCycle[current]

      board.current.set(i, j, next)
      calculateClues()
    },
    [board, calculateClues]
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
      drawAll(context, board.current, hClues, vClues)
    },
    [board, hClues, vClues]
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
