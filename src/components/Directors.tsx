import { motion } from 'framer-motion'

const steps = [
  {
    n: '01',
    title: 'No cost to you',
    text: 'Tournament directors and events pay nothing for the booth.',
  },
  {
    n: '02',
    title: 'We handle everything',
    text: 'Setup, printing, and sales go direct to attendees.',
  },
  {
    n: '03',
    title: 'Adds value to the day',
    text: 'Families leave with a keepsake — your event feels bigger.',
  },
]

export function Directors() {
  return (
    <section className="section directors" id="directors">
      <div className="section-inner">
        <div className="directors-head">
          <p className="eyebrow">For tournament directors</p>
          <h2 className="display">Simple for you. Unforgettable for families.</h2>
          <p className="lede">
            Same-day printing. No minimums. Zero cost or hassle for your
            organization — just a premium booth experience that parents love.
          </p>
        </div>

        <div className="directors-split">
          <motion.div
            className="directors-photo"
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            <img
              src={`${import.meta.env.BASE_URL}action.jpg`}
              alt="Tournament play under lights"
            />
          </motion.div>

          <ol className="directors-steps">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
              >
                <span>{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="promise-bar">
          <p>Fast · Local · Always professional</p>
          <ul>
            <li>Same-day printing, no shipping delays</li>
            <li>No order minimums</li>
            <li>Port &amp; Company and trusted brands</li>
            <li>Family-owned service</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
