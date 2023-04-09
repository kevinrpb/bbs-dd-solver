'use client'
import React from 'react'

import SetupBoard from '@/components/boards/setup'
import PreviewBoard from '@/components/boards/preview'

import GameBoard, { Clue } from '@/game/board'
import { BOARD_SIZE, BoardSymbolCycle, BoardSymbolCycleReverse } from '@/game/constants'
import { Orientation } from '@/graphics/primitives'

import { WorkerMessage, WorkerState } from '@/worker'

type BoardType = 'setup' | 'preview'

const getCluesStates = (board: GameBoard, columnClues: Clue[], rowClues: Clue[]) => {
  const columnExpected = board.getExpectedClues(Orientation.HORIZONTAL)
  const rowExpected = board.getExpectedClues(Orientation.VERTICAL)

  const columnNew: Clue[] = columnClues.map(([clue, _], i) => [clue, clue == columnExpected[i]])
  const rowNew: Clue[] = rowClues.map(([clue, _], i) => [clue, clue == rowExpected[i]])

  return [columnNew, rowNew]
}

type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>

interface BoardsWrapperProps {
  worker?: Worker
  workerRunning: boolean
  setWorkerRunning: DispatchSetStateAction<boolean>

  setupBoard: GameBoard
  setupColumnClues: Clue[]
  setSetupColumnClues: DispatchSetStateAction<Clue[]>
  setupRowClues: Clue[]
  setSetupRowClues: DispatchSetStateAction<Clue[]>

  previewBoard: GameBoard
  previewColumnClues: Clue[]
  setPreviewColumnClues: DispatchSetStateAction<Clue[]>
  previewRowClues: Clue[]
  setPreviewRowClues: DispatchSetStateAction<Clue[]>

  styles: Record<string, string>
}

const BoardsWrapper = ({
  worker,
  workerRunning,
  setWorkerRunning,

  setupBoard,
  setupColumnClues,
  setSetupColumnClues,
  setupRowClues,
  setSetupRowClues,

  previewBoard,
  previewColumnClues,
  setPreviewColumnClues,
  previewRowClues,
  setPreviewRowClues,

  styles
}: BoardsWrapperProps) => {
  const calculateClues = React.useCallback(
    (types: BoardType[] = ['setup', 'preview']) => {
      if (types.includes('setup')) {
        const [columnNew, rowNew] = getCluesStates(setupBoard, setupColumnClues, setupRowClues)
        setSetupColumnClues(columnNew)
        setSetupRowClues(rowNew)
      }

      if (types.includes('preview')) {
        const [columnNew, rowNew] = getCluesStates(
          previewBoard,
          previewColumnClues,
          previewRowClues
        )
        setPreviewColumnClues(columnNew)
        setPreviewRowClues(rowNew)
      }
    },
    [
      setupBoard,
      setupColumnClues,
      setSetupColumnClues,
      setupRowClues,
      setSetupRowClues,

      previewBoard,
      previewColumnClues,
      setPreviewColumnClues,
      previewRowClues,
      setPreviewRowClues,
    ]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(calculateClues, [])

  const updateBoard = React.useCallback(
    (matrix: string[][], types: BoardType[] = ['setup', 'preview']) => {
      if (types.includes('setup')) {
        setupBoard.setBoard(matrix)
      }

      if (types.includes('preview')) {
        previewBoard.setBoard(matrix)
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
        const setupCurrent = setupBoard.getCell(i, j)
        const setupNext = reverse
          ? BoardSymbolCycleReverse[setupCurrent]
          : BoardSymbolCycle[setupCurrent]
        setupBoard.setCell(i, j, setupNext)
      }

      if (types.includes('preview')) {
        const previewCurrent = previewBoard.getCell(i, j)
        const previewNext = reverse
          ? BoardSymbolCycleReverse[previewCurrent]
          : BoardSymbolCycle[previewCurrent]
        previewBoard.setCell(i, j, previewNext)
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
    [
      workerRunning,
      setupColumnClues,
      setSetupColumnClues,
      previewColumnClues,
      setPreviewColumnClues,
      calculateClues,
    ]
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
    [
      workerRunning,
      setupRowClues,
      setSetupRowClues,
      previewRowClues,
      setPreviewRowClues,
      calculateClues,
    ]
  )

  React.useEffect(() => {
    if (worker == undefined) {
      return
    }

    worker.onmessage = (event) => {
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
  }, [worker, setWorkerRunning, updateBoard, calculateClues])

  return (
    <>
      <SetupBoard
        id='setup'
        styles={styles}
        board={setupBoard}
        updateBoardCell={updateBoardCell}
        hClues={setupColumnClues}
        updateHClue={updateColumnClue}
        vClues={setupRowClues}
        updateVClue={updateRowClue}
      />

      <PreviewBoard
        id='preview'
        styles={styles}
        board={previewBoard}
        hClues={setupColumnClues}
        vClues={setupRowClues}
      />
    </>
  )
}

export default BoardsWrapper
