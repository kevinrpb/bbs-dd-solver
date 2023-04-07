'use client'
import React from 'react'

import SetupBoard from '@/components/boards/setup'
import PreviewBoard from '@/components/boards/preview'

import GameBoard, { Clue } from '@/game/board'
import { BOARD_SIZE, BoardSymbolCycle, BoardSymbolCycleReverse } from '@/game/constants'
import { Orientation } from '@/graphics/primitives'

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

export default function Home() {
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

  const updateBoardCell = React.useCallback(
    (i: number, j: number, reverse: boolean = false) => {
      const current = setupBoard.current.get(i, j)
      const next = reverse ? BoardSymbolCycleReverse[current] : BoardSymbolCycle[current]

      setupBoard.current.set(i, j, next)
      previewBoard.current.set(i, j, next)
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

  return (
    <main className={styles.main}>
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
