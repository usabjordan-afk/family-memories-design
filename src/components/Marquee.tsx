import { motion } from 'framer-motion'

const items = [
  'Same-day printing',
  'No minimums',
  '$0 to directors',
  'Names & numbers',
  'Hoodies & tees',
  'Youth sports focused',
  'Port & Company',
  'Family-run booth',
]

export function Marquee() {
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-hidden>
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {row.map((item, i) => (
          <span key={`${item}-${i}`}>
            {item}
            <i />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
