import { useEffect } from 'react'
import Lenis from 'lenis'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Studio } from './components/Studio'
import { Story } from './components/Story'
import { Directors } from './components/Directors'
import { FAQ } from './components/FAQ'
import { Contact, Footer } from './components/Contact'
import './App.css'

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Studio />
        <Story />
        <Directors />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
