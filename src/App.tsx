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
      // Don't fight with 3D orbit drag / touch rotate
      prevent: (node) => {
        const el = node as HTMLElement | null
        return !!el?.closest?.('[data-orbit="true"]')
      },
    })

    window.__fmdLenis = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      if (window.__fmdLenis === lenis) delete window.__fmdLenis
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
