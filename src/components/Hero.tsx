import { motion } from 'framer-motion'
import { HeroCanvas } from '../three/Scenes'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-atmosphere" aria-hidden />
      <div className="hero-grid" aria-hidden />

      <div className="hero-stage">
        <HeroCanvas
          product="crew"
          color="#6fbfbf"
          ink="#1a2f2f"
          print="crest"
          playerName="WILL"
          playerNumber="10"
        />
      </div>

      <div className="hero-copy">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          On-site tournament apparel
        </motion.p>

        <motion.h1
          className="hero-brand"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Family Memories
          <span>Design</span>
        </motion.h1>

        <motion.p
          className="hero-line"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          Custom gear for players, printed while you wait.
        </motion.p>

        <motion.p
          className="hero-support"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.8 }}
        >
          We bring the shop to your tournament — names, numbers, and event
          branding, same day.
        </motion.p>

        <motion.div
          className="cta-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.8 }}
        >
          <a className="btn btn-primary" href="#studio">
            Spin the gear
          </a>
          <a className="btn btn-ghost" href="#book">
            Book your tournament
          </a>
        </motion.div>
      </div>

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        aria-hidden
      >
        <span />
        Drag to rotate
      </motion.div>
    </section>
  )
}
