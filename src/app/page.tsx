'use client'
import React from 'react'

import SimpleSketch, { Canvas, Context } from '@/components/sketch'

import styles from './page.module.scss'

let x = 0
let y = 0

const draw = (context: Context, canvas: Canvas) => {
  context.fill('red')
  context.circle(x, y, 100)
}


export default function Home() {
  return (
    <main className={styles.main}>
      <SimpleSketch id='game-sketch' className={styles['react-p5']} draw={draw} />
    </main>
  )
}
