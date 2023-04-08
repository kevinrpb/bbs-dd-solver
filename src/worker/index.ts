import { Clue } from '@/game/board'
import { GameSolver } from '@/game/solver'
import BacktrackingSolver from '@/game/solver/backtracking'

declare let self: ServiceWorkerGlobalScope

export enum WorkerState {
  IDLE,
  RUNNING,
  FINISHED,
  ERROR,
}

export enum WorkerSolver {
  BACKTRACKING,
}

export interface WorkerMessage {
  state: WorkerState
  matrix?: string[][]
  error?: Error
}

export interface AppMessage {
  id: 'appMessage'
  start: boolean
  solver?: WorkerSolver
  matrix?: string[][]
  hClues?: Clue[]
  vClues?: Clue[]
}

let _currentSolver: GameSolver | undefined

const solverUpdate = (matrix: string[][]) => {}

const solverEnd = (matrix?: string[][]) => {}

const handleMessage = async (message: AppMessage) => {
  const { start, solver, matrix, hClues, vClues } = message

  if (start && solver && matrix && hClues && vClues) {
    switch (solver) {
      case WorkerSolver.BACKTRACKING:
        _currentSolver = new BacktrackingSolver()
        break
    }
    console.log(_currentSolver)

    await _currentSolver?.solve(matrix, hClues, vClues, solverUpdate, solverEnd)

    postMessage({ state: WorkerState.RUNNING })
  } else if (start) {
    // TODO: error
    postMessage({ state: WorkerState.ERROR })
  } else {
    await _currentSolver?.stop()

    _currentSolver = undefined
    postMessage({ state: WorkerState.IDLE })
  }
}

if (self) {
  self.addEventListener('message', (event) => {
    const message: AppMessage = event.data

    if (message.id !== 'appMessage') {
      return
    }

    console.log(`[Worker] Got event ${JSON.stringify(message)}`)
    handleMessage(message)
  })
}
