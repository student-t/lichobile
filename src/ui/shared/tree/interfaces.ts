import { Pockets } from '../../../lichess/interfaces/game'
import { Shape as BrushShape } from '../BoardBrush'

export namespace Tree {
  export type Path = string

  export interface ClientEval {
    fen: string
    maxDepth?: number
    depth: number
    knps?: number
    nodes: number
    millis?: number
    pvs: PvData[]
    cloud?: boolean
    cp?: number
    mate?: number
    retried?: boolean
    // maybe not keep here
    best?: Uci
    bestSan?: San
  }

  export interface ServerEval {
    cp?: number
    mate?: number
    best?: Uci
  }

  export interface PvData {
    readonly moves: ReadonlyArray<string>
    mate?: number
    cp?: number
  }

  export interface Node {
    readonly id: string
    readonly ply: Ply
    readonly fen: Fen
    readonly uci?: Uci
    readonly san?: San
    children: Node[]
    drops?: string | ReadonlyArray<string> | undefined | null
    comments?: Comment[]
    // TODO maybe don't keep both formats for dests & drops
    dests?: string | DestsMap
    readonly check?: boolean
    threat?: ClientEval
    ceval?: ClientEval
    eval?: ServerEval
    opening?: Opening | null
    glyphs?: Glyph[]
    clock?: Clock
    parentClock?: Clock
    shapes?: ReadonlyArray<Shape>
    readonly comp?: boolean
    threefold?: boolean
    readonly fail?: boolean
    puzzle?: string
    // added dynamically during analysis from chess worker
    checkCount?: { white: number, black: number }
    readonly pgnMoves?: ReadonlyArray<string>
    player?: Color
    end?: boolean
    crazyhouse?: {
      readonly pockets: Pockets
    }
  }

  export interface Comment {
    readonly id: string
    readonly by: string | {
      readonly id: string
      readonly name: string
    }
    text: string
  }

  export interface Opening {
    readonly name: string
    readonly eco: string
  }

  export interface Glyph {
    readonly name: string
    readonly symbol: string
  }

  export type Clock = number

  export type Shape = BrushShape
}

export function isClientEval(ev: Tree.ServerEval | Tree.ClientEval): ev is Tree.ClientEval {
  return (ev as Tree.ClientEval).depth !== undefined
}
