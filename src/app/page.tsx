'use client'
import React from 'react'

import SimpleSketch, { Canvas, Context } from '@/components/sketch'

import styles from './page.module.scss'
import GameBoard from '@/game/board'
import { BOARD_SIZE } from '@/game/constants'

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

  const draw = React.useCallback(
    (context: Context, canvas: Canvas) => {
      const matrix = board.current.getMatrix()
      const x0 = 0
      const y0 = 0

      const cellSize = context.width / (BOARD_SIZE + 1)

      context.background(51)

      // Draw h clues
      {
        let x = 1
        for (const clue of hClues) {
          let xOffset = x0 + x * cellSize

          // Text
          context.fill('white')
          context.stroke('white')
          context.textSize(20)
          context.text(clue, xOffset + cellSize / 3, y0 + cellSize / 1.5)

          x += 1
        }
      }

      // Draw v clues
      {
        let y = 1
        for (const clue of vClues) {
          let yOffset = y0 + y * cellSize

          // Text
          context.fill('white')
          context.stroke('white')
          context.textSize(20)
          context.text(clue, x0 + cellSize / 3, yOffset + cellSize / 1.5)

          y += 1
        }
      }

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
        <SimpleSketch id='setup-sketch' className={styles['react-p5']} draw={draw} />
      </div>
      <div id={styles['preview']} className={styles['sketch-wrapper']}>
        <SimpleSketch id='preview-sketch' className={styles['react-p5']} draw={draw} />
      </div>
    </main>
  )
}
