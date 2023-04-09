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
  id: 'workerMessage'
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

const sendUpdate = (matrix?: string[][]) => {
  const message: WorkerMessage = {
    id: 'workerMessage',
    state: WorkerState.RUNNING,
    matrix,
  }

  postMessage(message)
}

const sendFinished = (matrix?: string[][]) => {
  const message: WorkerMessage = {
    id: 'workerMessage',
    state: WorkerState.FINISHED,
    matrix,
  }

  postMessage(message)
}

const sendError = (error?: Error) => {
  const message: WorkerMessage = {
    id: 'workerMessage',
    state: WorkerState.ERROR,
    error,
  }

  postMessage(message)
}

const sendIdle = () => {
  const message: WorkerMessage = {
    id: 'workerMessage',
    state: WorkerState.IDLE,
  }

  postMessage(message)
}

const handleMessage = async (message: AppMessage) => {
  const { start, solver, matrix, hClues, vClues } = message

  if (
    start &&
    solver !== undefined &&
    matrix !== undefined &&
    hClues !== undefined &&
    vClues !== undefined
  ) {
    switch (solver) {
      case WorkerSolver.BACKTRACKING:
        _currentSolver = new BacktrackingSolver({
          updateInterval: 100,
          updateCallback: sendUpdate,
          endCallback: sendFinished,
        })
        break
    }

    console.log(`[Worker] Calling solver`)
    sendUpdate()

    const solution = await _currentSolver?.solve(matrix, hClues, vClues)
    sendFinished(solution)
  } else if (start) {
    console.error(`[Worker] Tried to start but was missing inputs`, message)
    // TODO: add error to message
    sendError()
  } else {
    console.log(`[Worker] Stopping solver`)
    sendIdle()

    await _currentSolver?.stop()
    _currentSolver = undefined
  }
}

if (typeof self !== 'undefined') {
  addEventListener('message', (event) => {
    const message: AppMessage = event.data

    if (message.id !== 'appMessage') {
      return
    }

    console.log(`[Worker] Got message ${JSON.stringify(message.id)}`)
    handleMessage(message)
      .then(() => {
        console.log(`[Worker] Finished handling message`)

        _currentSolver = undefined
        setTimeout(() => sendIdle(), 200)
      })
      .catch((error) => {
        console.log(`[Worker] Error while handling message`)
        console.error(error)
        sendError(error)
      })
  })
}
