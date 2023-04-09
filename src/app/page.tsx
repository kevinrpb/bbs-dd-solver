'use client'
import React from 'react'

import GameBoard, { Clue } from '@/game/board'

import { AppMessage, WorkerSolver } from '@/worker'

import styles from './page.module.scss'
import BoardsWrapper from '@/components/boards/wrapper'

const initialBoard = `
00000000
0000000E
00E00000
0000000E
00000000
0C00000E
00000000
0000000E
`

const initialSetupBoard = new GameBoard(initialBoard)
const initialPreviewBoard = new GameBoard(initialBoard)

const initialColumnClues: Clue[] = [
  [1, false],
  [4, false],
  [2, false],
  [7, false],
  [0, false],
  [4, false],
  [4, false],
  [4, false],
]

const initialRowClues: Clue[] = [
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
  const worker = React.useRef<Worker>()
  const [workerRunning, setWorkerRunning] = React.useState<boolean>(false)

  const setupBoard = React.useRef<GameBoard>(initialSetupBoard)
  const [setupColumnClues, setSetupColumnClues] = React.useState<Clue[]>(initialColumnClues)
  const [setupRowClues, setSetupRowClues] = React.useState<Clue[]>(initialRowClues)

  const previewBoard = React.useRef<GameBoard>(initialPreviewBoard)
  const [previewColumnClues, setPreviewColumnClues] = React.useState<Clue[]>(initialColumnClues)
  const [previewRowClues, setPreviewRowClues] = React.useState<Clue[]>(initialRowClues)

  React.useEffect(() => {
    worker.current = new Worker(new URL('../worker/', import.meta.url))

    return () => {
      worker.current?.terminate()
    }
  }, [])

  const startWorker = React.useCallback(() => {
    const matrix = setupBoard.current.getMatrix()
    const solver = WorkerSolver.BACKTRACKING

    const message: AppMessage = {
      id: 'appMessage',
      start: true,
      matrix,
      hClues: setupColumnClues,
      vClues: setupRowClues,
      solver,
    }
    worker.current?.postMessage(message)
  }, [setupBoard, setupColumnClues, setupRowClues])

  const stopWorker = React.useCallback(() => {
    const message: AppMessage = {
      id: 'appMessage',
      start: false,
    }
    worker.current?.postMessage(message)
  }, [])

  return (
    <main className={styles.main}>
      <div id={styles['options']}>
        <div className={styles['options-row']}>
          <button onClick={startWorker} disabled={workerRunning}>
            Start
          </button>
          <button onClick={stopWorker} disabled={!workerRunning}>
            Stop
          </button>
        </div>
      </div>

      <BoardsWrapper
        worker={worker.current}
        setupBoard={setupBoard.current}
        previewBoard={previewBoard.current}
        {...{
          workerRunning,
          setWorkerRunning,
          setupColumnClues,
          setSetupColumnClues,
          setupRowClues,
          setSetupRowClues,
          previewColumnClues,
          setPreviewColumnClues,
          previewRowClues,
          setPreviewRowClues,
          styles,
        }}
      />
    </main>
  )
}
