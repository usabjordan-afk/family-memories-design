import { motion } from 'framer-motion'

const beats = [
  {
    title: 'Custom shirts & hoodies',
    text: 'Names, numbers, and event branding — printed the same day.',
  },
  {
    title: 'Mobile setup',
    text: 'We bring the full print shop to your fields, courts, and gyms.',
  },
  {
    title: 'Youth sports focus',
    text: 'Family-run, tournament-first service built around players and parents.',
  },
]

export function Story() {
  return (
    <section className="section story" id="story">
      <div className="section-inner story-grid">
        <motion.div
          className="story-visual"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={`${import.meta.env.BASE_URL}field.jpg`}
            alt="Youth athletes celebrating on the field"
          />
          <div className="story-visual-overlay" />
          <p className="story-caption">The shirt they keep after the whistle.</p>
        </motion.div>

        <motion.div
          className="story-copy"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85, delay: 0.1 }}
        >
          <p className="eyebrow">Why we show up</p>
          <h2 className="display">The print shop comes to you.</h2>
          <p className="lede">
            Family Memories Design is a family-run business focused on youth
            sports. We set up at your tournament and print custom gear for
            players, teams, and fans right there — no shipping wait, no leftover
            inventory for directors.
          </p>

          <ul className="story-list">
            {beats.map((b) => (
              <li key={b.title}>
                <strong>{b.title}</strong>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
