import { motion } from 'framer-motion'

const ITEMS = [
  {
    tag: '360°',
    title: 'Auto spin + drag',
    text: 'Garment rotates on its own. Grab anytime for full orbit.',
  },
  {
    tag: 'NEW',
    title: 'Upload your logo',
    text: 'Drop a tournament crest and see it print on the shirt live.',
  },
  {
    tag: 'NEW',
    title: 'Any team color',
    text: 'Presets plus a custom color picker — match club brand in one tap.',
  },
  {
    tag: 'NEW',
    title: 'Book the booth',
    text: 'Tournament form for directors — $0 booth cost, same-day print.',
  },
]

export function WhatsNew() {
  return (
    <section className="whats-new" aria-label="What is new">
      <div className="section-inner whats-new-inner">
        <motion.p
          className="whats-new-kicker"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Just upgraded — try these in the studio
        </motion.p>
        <div className="whats-new-grid">
          {ITEMS.map((item, i) => (
            <motion.article
              key={item.title}
              className="whats-new-item"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.55 }}
            >
              <span className="whats-new-tag">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
