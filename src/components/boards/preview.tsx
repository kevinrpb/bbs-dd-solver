import React from 'react'

import SimpleSketch, { Canvas, Context } from '@/components/sketch'
import GameBoard, { Clue } from '@/game/board'
import { drawAll } from '@/graphics/board'

interface PreviewBoardProps {
  id: string
  styles: Record<string, string>
  board: GameBoard
  hClues: Clue[]
  vClues: Clue[]
}

const PreviewBoard: React.FC<PreviewBoardProps> = ({ id, styles = {}, board, hClues, vClues }) => {
  const draw = React.useCallback(
    (context: Context, canvas: Canvas) => {
      drawAll(context, board, hClues, vClues)
    },
    [board, hClues, vClues]
  )

  return (
    <div id={styles[id]} className={styles['sketch-wrapper']}>
      <SimpleSketch id='setup-sketch' className={styles['react-p5']} draw={draw} />
    </div>
  )
}

export default PreviewBoard
