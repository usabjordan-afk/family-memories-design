import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: 'What does it cost the tournament?',
    a: 'Nothing. There is no cost to tournament directors or the event. We handle setup, printing, and sales direct to attendees.',
  },
  {
    q: 'Is there a minimum order?',
    a: 'No order minimums. Everyone can order — from a single player to a whole team.',
  },
  {
    q: 'How fast is it?',
    a: 'Same-day printing at the event, so there are no shipping or delivery delays.',
  },
  {
    q: 'What can you print?',
    a: 'Custom shirts and hoodies with names, numbers, and event branding.',
  },
  {
    q: 'What brands do you use?',
    a: 'Port & Company and other trusted brands parents recognize for quality.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section faq" id="faq">
      <div className="section-inner faq-inner">
        <div>
          <p className="eyebrow">Quick answers</p>
          <h2 className="display">Everything directors ask first.</h2>
          <p className="lede">
            Anything else? Call or email Will directly — we keep it personal.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className={isOpen ? 'faq-item open' : 'faq-item'}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{item.q}</span>
                  <i aria-hidden>{isOpen ? '−' : '+'}</i>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
