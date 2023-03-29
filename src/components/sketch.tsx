'use client'
import React from 'react'

import dynamic from 'next/dynamic'
import p5 from 'p5'

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
})

function getP5Size(element: p5.Element): [number, number] {
  const width = element.elt.offsetWidth
  const height = element.elt.offsetHeight

  return [width, height]
}

function getHTMLSize(element: Element): [number, number] {
  const width = element.clientWidth
  const height = element.clientHeight

  return [width, height]
}

export type Context = p5
export type Canvas = p5.Element

export interface MousedClickedEvent {
  offsetX: number
  offsetY: number
  altKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
}

export interface SimpleSketchProps {
  id: string
  className?: string
  mouseClicked?: (context: Context, canvas: Canvas, event: MousedClickedEvent) => void
  setup?: (context: Context, canvas: Canvas) => void
  draw?: (context: Context, canvas: Canvas) => void
}

export const SimpleSketch: React.FC<SimpleSketchProps> = ({ id, className = "", setup, draw, mouseClicked }) => {
  const canvasParentRef = React.useRef<Element | undefined>(undefined)
  const canvasRef = React.useRef<p5.Element | undefined>(undefined)

  const _setup = (p5: p5, canvasParent: Element) => {
    canvasParentRef.current = canvasParent
    canvasRef.current = p5
      .createCanvas(canvasParent.clientWidth, canvasParent.clientHeight)
      .parent(canvasParent)
      .id(id)
      .mouseClicked((event: MousedClickedEvent | undefined) => {
        if (!mouseClicked || !event || !canvasRef.current) return

        mouseClicked(p5, canvasRef.current, event)
      })

    p5.frameRate(20)

    if (setup) setup(p5, canvasRef.current)
  }

  const _draw = (p5: p5) => {
    if (!canvasParentRef.current || !canvasRef.current) return

    const [width, height] = getHTMLSize(canvasParentRef.current)

    if (p5.width != width || p5.height != height) {
      p5.resizeCanvas(width, height)
    }

    if (draw) draw(p5, canvasRef.current)
  }

  return <Sketch className={className} setup={_setup} draw={_draw} />
}

export default SimpleSketch
