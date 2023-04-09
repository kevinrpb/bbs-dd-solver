'use client'
import React from 'react'

import SetupBoard from '@/components/boards/setup'
import PreviewBoard from '@/components/boards/preview'

import GameBoard, { Clue } from '@/game/board'
import { BOARD_SIZE, BoardSymbolCycle, BoardSymbolCycleReverse } from '@/game/constants'
import { Orientation } from '@/graphics/primitives'

import { AppMessage, WorkerMessage, WorkerSolver, WorkerState } from '@/worker'

import styles from './page.module.scss'

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

type BoardType = 'setup' | 'preview'

const getCluesStates = (board: GameBoard, columnClues: Clue[], rowClues: Clue[]) => {
  const columnExpected = board.getExpectedClues(Orientation.HORIZONTAL)
  const rowExpected = board.getExpectedClues(Orientation.VERTICAL)

  const columnNew: Clue[] = columnClues.map(([clue, _], i) => [clue, clue == columnExpected[i]])
  const rowNew: Clue[] = rowClues.map(([clue, _], i) => [clue, clue == rowExpected[i]])

  return [columnNew, rowNew]
}

export default function Home() {
  const workerRef = React.useRef<Worker>()
  const [workerRunning, setWorkerRunning] = React.useState<boolean>(false)

  const setupBoard = React.useRef<GameBoard>(initialSetupBoard)
  const [setupColumnClues, setSetupColumnClues] = React.useState<Clue[]>(initialColumnClues)
  const [setupRowClues, setSetupRowClues] = React.useState<Clue[]>(initialRowClues)

  const previewBoard = React.useRef<GameBoard>(initialPreviewBoard)
  const [previewColumnClues, setPreviewColumnClues] = React.useState<Clue[]>(initialColumnClues)
  const [previewRowClues, setPreviewRowClues] = React.useState<Clue[]>(initialRowClues)

  const calculateClues = React.useCallback(
    (types: BoardType[] = ['setup', 'preview']) => {
      if (types.includes('setup')) {
        const [columnNew, rowNew] = getCluesStates(
          setupBoard.current,
          setupColumnClues,
          setupRowClues
        )
        setSetupColumnClues(columnNew)
        setSetupRowClues(rowNew)
      }

      if (types.includes('preview')) {
        const [columnNew, rowNew] = getCluesStates(
          previewBoard.current,
          previewColumnClues,
          previewRowClues
        )
        setPreviewColumnClues(columnNew)
        setPreviewRowClues(rowNew)
      }
    },
    [setupBoard, setupColumnClues, setupRowClues, previewBoard, previewColumnClues, previewRowClues]
  )

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
    (i: number, j: number, reverse: boolean = false, types: BoardType[] = ['setup', 'preview']) => {
      if (workerRunning) {
        return
      }

      if (types.includes('setup')) {
        const setupCurrent = setupBoard.current.getCell(i, j)
        const setupNext = reverse
          ? BoardSymbolCycleReverse[setupCurrent]
          : BoardSymbolCycle[setupCurrent]
        setupBoard.current.setCell(i, j, setupNext)
      }

      if (types.includes('preview')) {
        const previewCurrent = previewBoard.current.getCell(i, j)
        const previewNext = reverse
          ? BoardSymbolCycleReverse[previewCurrent]
          : BoardSymbolCycle[previewCurrent]
        previewBoard.current.setCell(i, j, previewNext)
      }

      calculateClues()
    },
    [workerRunning, setupBoard, previewBoard, calculateClues]
  )

  const updateColumnClue = React.useCallback(
    (i: number, reverse: boolean = false, types: BoardType[] = ['setup', 'preview']) => {
      if (workerRunning) {
        return
      }

      if (types.includes('setup')) {
        let clues = setupColumnClues

        const [current, state] = setupColumnClues[i]
        const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

        clues[i] = [next, state]

        setSetupColumnClues(clues)
      }

      if (types.includes('preview')) {
        let clues = previewColumnClues

        const [current, state] = previewColumnClues[i]
        const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

        clues[i] = [next, state]

        setPreviewColumnClues(clues)
      }

      calculateClues()
    },
    [workerRunning, setupColumnClues, previewColumnClues, calculateClues]
  )

  const updateRowClue = React.useCallback(
    (i: number, reverse: boolean = false, types: BoardType[] = ['setup', 'preview']) => {
      if (workerRunning) {
        return
      }

      if (types.includes('setup')) {
        let clues = setupRowClues

        const [current, state] = setupRowClues[i]
        const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

        clues[i] = [next, state]

        setSetupRowClues(clues)
      }

      if (types.includes('preview')) {
        let clues = previewRowClues

        const [current, state] = previewRowClues[i]
        const next = (current + (reverse ? -1 : 1)) % BOARD_SIZE

        clues[i] = [next, state]

        setPreviewRowClues(clues)
      }

      calculateClues()
    },
    [workerRunning, setupRowClues, previewRowClues, calculateClues]
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

    workerRef.current.onmessage = (event) => {
      const message: WorkerMessage = event.data

      if (message.id !== 'workerMessage') {
        return
      }

      const { state, matrix } = message

      if (matrix != undefined) {
        updateBoard(matrix, ['preview'])
        calculateClues(['preview'])
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
        default:
          setWorkerRunning(false)
          break
      }
    }
  }, [updateBoard, calculateClues, setWorkerRunning])

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
    workerRef.current?.postMessage(message)
  }, [setupBoard, setupColumnClues, setupRowClues])

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
        hClues={setupColumnClues}
        updateHClue={updateColumnClue}
        vClues={setupRowClues}
        updateVClue={updateRowClue}
      />

      <PreviewBoard
        id='preview'
        styles={styles}
        board={previewBoard.current}
        hClues={setupColumnClues}
        vClues={setupRowClues}
      />
    </main>
  )
}
