'use client'
import React from 'react'

import SetupBoard from '@/components/boards/setup'
import PreviewBoard from '@/components/boards/preview'

import GameBoard, { Clue } from '@/game/board'
import { BOARD_SIZE, BoardSymbolCycle, BoardSymbolCycleReverse } from '@/game/constants'
import { Orientation } from '@/graphics/primitives'

import { AppMessage, WorkerMessage, WorkerSolver, WorkerState } from '@/worker'

import styles from './page.module.scss'

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

type BoardType = 'setup' | 'preview'

export default function Home() {
  const workerRef = React.useRef<Worker>()
  const [workerRunning, setWorkerRunning] = React.useState<boolean>(false)

  const setupBoard = React.useRef<GameBoard>(initialBoard)
  const previewBoard = React.useRef<GameBoard>(initialBoard)

  const [hClues, setHClues] = React.useState<Clue[]>(initialHClues)
  const [vClues, setVClues] = React.useState<Clue[]>(initialVClues)

  const calculateClues = React.useCallback(() => {
    const hExpected = setupBoard.current.getExpectedClues(Orientation.HORIZONTAL)
    const vExpected = setupBoard.current.getExpectedClues(Orientation.VERTICAL)

    const hNew: Clue[] = hClues.map(([clue, _], i) => [clue, clue == hExpected[i]])
    const vNew: Clue[] = vClues.map(([clue, _], i) => [clue, clue == vExpected[i]])

    setHClues(hNew)
    setVClues(vNew)
  }, [setupBoard, hClues, vClues])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(calculateClues, [])

  const updateBoard = React.useCallback(
    (matrix: string[][], types: BoardType[] = ['setup', 'preview']) => {
      if (types.includes('setup')) {
        setupBoard.current.setBoard(matrix)
      }

      if (types.includes('preview')) {
        previewBoard.current.setBoard(matrix)
      }

      calculateClues()
    },
    [setupBoard, previewBoard, calculateClues]
  )

  const updateBoardCell = React.useCallback(
    (i: number, j: number, reverse: boolean = false) => {
      const current = setupBoard.current.getCell(i, j)
      const next = reverse ? BoardSymbolCycleReverse[current] : BoardSymbolCycle[current]

      setupBoard.current.setCell(i, j, next)
      previewBoard.current.setCell(i, j, next)
      calculateClues()
    },
    [setupBoard, previewBoard, calculateClues]
  )

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

  React.useEffect(() => {
    workerRef.current = new Worker(new URL('../worker/', import.meta.url))

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  React.useEffect(() => {
    if (workerRef.current == undefined) {
      return
    }

    workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { state, matrix } = event.data

      if (matrix != undefined) {
        updateBoard(matrix, ['preview'])
      }

      switch (state) {
        case WorkerState.ERROR:
          setWorkerRunning(false)
          break
        case WorkerState.RUNNING:
          setWorkerRunning(true)
          break
        case WorkerState.FINISHED:
          setWorkerRunning(false)
          break
        case WorkerState.IDLE:
          setWorkerRunning(false)
          break
      }
    }
  }, [updateBoard, setWorkerRunning])

  const startWorker = React.useCallback(() => {
    const matrix = setupBoard.current.getMatrix()
    const solver = WorkerSolver.BACKTRACKING

    const message: AppMessage = {
      id: 'appMessage',
      start: true,
      matrix,
      hClues,
      vClues,
      solver,
    }
    workerRef.current?.postMessage(message)
  }, [setupBoard, hClues, vClues])

  const stopWorker = React.useCallback(() => {
    const message: AppMessage = {
      id: 'appMessage',
      start: false,
    }
    workerRef.current?.postMessage(message)
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

      <SetupBoard
        id='setup'
        styles={styles}
        board={setupBoard.current}
        updateBoardCell={updateBoardCell}
        hClues={hClues}
        updateHClue={updateHClue}
        vClues={vClues}
        updateVClue={updateVClue}
      />

      <PreviewBoard
        id='preview'
        styles={styles}
        board={previewBoard.current}
        hClues={hClues}
        vClues={vClues}
      />
    </main>
  )
}
