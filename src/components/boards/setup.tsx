import React from 'react'

import SimpleSketch, { Canvas, Context, MousedClickedEvent } from '@/components/sketch'
import GameBoard, { Clue } from '@/game/board'
import { BOARD_SIZE } from '@/game/constants'
import { drawAll } from '@/graphics/board'

interface SetupBoardProps {
  id: string
  styles: Record<string, string>
  board: GameBoard
  hClues: Clue[]
  vClues: Clue[]
  updateBoardCell: (i: number, j: number, reverse: boolean) => void
  updateHClue: (i: number, reverse: boolean) => void
  updateVClue: (i: number, reverse: boolean) => void
}

const SetupBoard: React.FC<SetupBoardProps> = ({
  id,
  styles = {},
  board,
  hClues,
  vClues,
  updateBoardCell,
  updateHClue,
  updateVClue,
}) => {
  const mouseClicked = React.useCallback(
    (context: Context, canvas: Canvas, event: MousedClickedEvent) => {
      const matrix = board.getMatrix()
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
      drawAll(context, board, hClues, vClues)
    },
    [board, hClues, vClues]
  )

  return (
    <div id={styles[id]} className={styles['sketch-wrapper']}>
      <SimpleSketch
        id='setup-sketch'
        className={styles['react-p5']}
        draw={draw}
        mouseClicked={mouseClicked}
      />
    </div>
  )
}

export default SetupBoard
